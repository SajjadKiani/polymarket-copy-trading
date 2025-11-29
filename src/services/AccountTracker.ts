
import { PolymarketAPI } from '../api/PolymarketAPI';
import { DatabaseService } from '../database/DatabaseService';
import { PositionSimulator } from './PositionSimulator';
import { PnLCalculator } from './PnLCalculator';
import { Trade as ApiTrade } from '../api/types';

export class AccountTracker {
  private api: PolymarketAPI;
  private db: DatabaseService;
  private simulator: PositionSimulator;
  private pnlCalculator: PnLCalculator;
  private isTracking: boolean = false;

  constructor(api: PolymarketAPI, db: DatabaseService) {
    this.api = api;
    this.db = db;
    this.simulator = new PositionSimulator(api, db);
    this.pnlCalculator = new PnLCalculator();
  }

  /**
   * Start tracking all configured accounts
   */
  async startTracking(pollInterval: number = 60000) {
    if (this.isTracking) {
      console.log('⚠️  Tracking already running');
      return;
    }

    this.isTracking = true;
    console.log('🚀 Starting account tracker...');

    // Initial sync
    await this.syncAllAccounts();

    // Set up periodic polling
    setInterval(async () => {
      if (this.isTracking) {
        await this.syncAllAccounts();
      }
    }, pollInterval);
  }

  /**
   * Stop tracking
   */
  stopTracking() {
    this.isTracking = false;
    console.log('🛑 Stopped tracking');
  }

  /**
   * Sync all tracked accounts
   */
  async syncAllAccounts() {
    const accounts = await this.db.getTrackedAccounts();
    
    console.log(`\n🔄 Syncing ${accounts.length} accounts...`);

    for (const account of accounts) {
      try {
        await this.syncAccount(account.address, account.id);
      } catch (error) {
        console.error(
          `❌ Error syncing account ${account.address}:`,
          error
        );
      }
    }

    // Update all position prices
    await this.simulator.updateAllPositionPrices();

    // Update account statistics
    for (const account of accounts) {
      await this.updateAccountStatistics(account.id);
    }

    console.log('✅ Sync complete\n');
  }

  /**
   * Sync a single account
   */
  async syncAccount(address: string, accountId: string) {
    console.log(`  📊 Syncing ${address.slice(0, 8)}...`);

    // Get sync state
    const syncState = await this.db.getSyncState(address);
    const lastSyncTime = syncState?.lastSyncedTime || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get new trades since last sync
    const trades = await this.api.data.getUserTrades({
      user: address,
      start_ts: Math.floor(lastSyncTime.getTime() / 1000),
      limit: 500,
    });

    // Process trades
    await this.processTrades(accountId, trades);

    // Reconcile positions with actual API data
    await this.simulator.reconcilePositions(address, accountId);

    // Update sync state
    await this.db.updateSyncState(address, 0); // Block number not used here

    console.log(`  ✓ Synced ${trades.length} trades`);
  }

  /**
   * Process trades and update positions
   */
  private async processTrades(accountId: string, trades: ApiTrade[]) {
    // Sort trades by timestamp
    const sortedTrades = trades.sort((a, b) => a.timestamp - b.timestamp);

    for (const trade of sortedTrades) {
      try {
        // Check if trade already exists
        const existingTrades = await this.db.getTrades({
          accountId,
          tokenId: trade.asset_id,
        });

        const exists = existingTrades.some(
          (t) => t.timestamp.getTime() === trade.timestamp * 1000
        );

        if (exists) continue;

        // Get market info if available
        let marketInfo: any = null;
        if (trade.market) {
          try {
            marketInfo = await this.api.gamma.getMarket(trade.market);
          } catch (error) {
            // Market info not critical
          }
        }

        // Determine if this opens a new position or modifies existing
        const openPositions = await this.db.client.position.findMany({
          where: {
            accountId,
            tokenId: trade.asset_id,
            status: 'OPEN',
          },
        });

        const price = parseFloat(trade.price);
        const size = parseFloat(trade.size);

        if (openPositions.length === 0 && trade.side === 'BUY') {
          // New position
          await this.simulator.openPosition({
            accountId,
            tokenId: trade.asset_id,
            side: trade.side,
            outcome: 'YES', // Infer from context
            price,
            quantity: size,
            marketInfo,
          });
        } else if (openPositions.length > 0) {
          const position = openPositions[0];

          if (
            (position.side === 'BUY' && trade.side === 'SELL') ||
            (position.side === 'SELL' && trade.side === 'BUY')
          ) {
            // Closing or reducing position
            if (size >= position.quantity) {
              await this.simulator.closePosition(position.id, price);
            } else {
              // Partial close
              const realizedPnL = this.pnlCalculator.calculateRealizedPnL(
                position.entryPrice,
                price,
                size,
                position.side as 'BUY' | 'SELL'
              );

              await this.db.updatePosition(position.id, {
                quantity: position.quantity - size,
                realizedPnL: position.realizedPnL + realizedPnL,
              });

              await this.db.createTrade({
                accountId,
                positionId: position.id,
                tokenId: trade.asset_id,
                marketId: trade.market,
                side: trade.side,
                outcome: position.outcome,
                price,
                size,
                value: price * size,
                tradeType: 'REDUCE',
                timestamp: new Date(trade.timestamp * 1000),
              });
            }
          } else {
            // Adding to position
            const newQuantity = position.quantity + size;
            const newAvgPrice = this.pnlCalculator.calculateAverageEntryPrice([
              { price: position.entryPrice, size: position.quantity },
              { price, size },
            ]);

            await this.db.updatePosition(position.id, {
              quantity: newQuantity,
              currentPrice: newAvgPrice,
            });

            await this.db.createTrade({
              accountId,
              positionId: position.id,
              tokenId: trade.asset_id,
              marketId: trade.market,
              side: trade.side,
              outcome: position.outcome,
              price,
              size,
              value: price * size,
              tradeType: 'ADD',
              timestamp: new Date(trade.timestamp * 1000),
            });
          }
        }
      } catch (error) {
        console.error(`Error processing trade:`, error);
      }
    }
  }

  /**
   * Update account-level statistics
   */
  private async updateAccountStatistics(accountId: string) {
    const closedPositions = await this.db.client.position.findMany({
      where: { accountId, status: 'CLOSED' },
    });

    const openPositions = await this.db.getOpenPositions(accountId);

    // Calculate total PnL
    const closedPnL = closedPositions.reduce(
      (sum, p) => sum + p.totalPnL,
      0
    );
    const openPnL = openPositions.reduce(
      (sum, p) => sum + p.unrealizedPnL,
      0
    );
    const totalPnL = closedPnL + openPnL;

    // Calculate win rate
    const wins = closedPositions.filter((p) => p.totalPnL > 0).length;
    const losses = closedPositions.filter((p) => p.totalPnL <= 0).length;
    const winRate = this.pnlCalculator.calculateWinRate(wins, losses);

    // Get total trades
    const totalTrades = await this.db.client.trade.count({
      where: { accountId },
    });

    // Update account
    await this.db.updateAccountStats(accountId, {
      totalPnL,
      winRate,
      totalTrades,
    });
  }

  /**
   * Get account summary
   */
  async getAccountSummary(accountId: string) {
    const account = await this.db.client.trackedAccount.findUnique({
      where: { id: accountId },
      include: {
        positions: {
          where: { status: 'OPEN' },
        },
      },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const openPositions = account.positions;
    const closedPositions = await this.db.client.position.findMany({
      where: { accountId, status: 'CLOSED' },
    });

    const portfolioMetrics = this.pnlCalculator.calculatePortfolioMetrics(
      openPositions.map((p) => ({
        entryPrice: p.entryPrice,
        currentPrice: p.currentPrice,
        quantity: p.quantity,
        side: p.side,
      }))
    );

    return {
      account: {
        address: account.address,
        nickname: account.nickname,
        totalPnL: account.totalPnL,
        winRate: account.winRate,
        totalTrades: account.totalTrades,
      },
      openPositions: openPositions.length,
      closedPositions: closedPositions.length,
      portfolio: portfolioMetrics,
    };
  }

  /**
   * Get leaderboard of tracked accounts
   */
  async getLeaderboard() {
    const accounts = await this.db.getTrackedAccounts();

    return accounts
      .map((account) => ({
        address: account.address,
        nickname: account.nickname,
        totalPnL: account.totalPnL,
        winRate: account.winRate,
        totalTrades: account.totalTrades,
        openPositions: account.positions.length,
      }))
      .sort((a, b) => b.totalPnL - a.totalPnL);
  }
}
