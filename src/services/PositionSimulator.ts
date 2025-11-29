import { PolymarketAPI } from '../api/PolymarketAPI';
import { DatabaseService } from '../database/DatabaseService';
import { PnLCalculator } from './PnLCalculator';
import { Trade as ApiTrade, Position as ApiPosition } from '../api/types';

export class PositionSimulator {
  private api: PolymarketAPI;
  private db: DatabaseService;
  private pnlCalculator: PnLCalculator;

  constructor(api: PolymarketAPI, db: DatabaseService) {
    this.api = api;
    this.db = db;
    this.pnlCalculator = new PnLCalculator();
  }

  /**
   * Simulate opening a new position
   */
  async openPosition(params: {
    accountId: string;
    tokenId: string;
    side: 'BUY' | 'SELL';
    outcome: 'YES' | 'NO';
    price: number;
    quantity: number;
    marketInfo?: any;
  }) {
    const { accountId, tokenId, side, outcome, price, quantity, marketInfo } = params;

    // Create position record
    const position = await this.db.createPosition({
      accountId,
      tokenId,
      marketId: marketInfo?.id,
      marketSlug: marketInfo?.slug,
      marketQuestion: marketInfo?.question,
      side,
      outcome,
      entryPrice: price,
      currentPrice: price,
      quantity,
    });

    // Create trade record
    await this.db.createTrade({
      accountId,
      positionId: position.id,
      tokenId,
      marketId: marketInfo?.id,
      side,
      outcome,
      price,
      size: quantity,
      value: price * quantity,
      tradeType: 'OPEN',
      timestamp: new Date(),
    });

    console.log(`📈 Opened ${side} position for ${quantity} shares @ $${price}`);
    return position;
  }

  /**
   * Update position with new price and recalculate PnL
   */
  async updatePositionPrice(positionId: string, newPrice: number) {
    const position = await this.db.client.position.findUnique({
      where: { id: positionId },
    });

    if (!position || position.status !== 'OPEN') {
      return null;
    }

    const unrealizedPnL = this.pnlCalculator.calculateUnrealizedPnL(
      position.entryPrice,
      newPrice,
      position.quantity,
      position.side as 'BUY' | 'SELL'
    );

    const totalPnL = position.realizedPnL + unrealizedPnL;

    return this.db.updatePosition(positionId, {
      currentPrice: newPrice,
      unrealizedPnL,
      totalPnL,
    });
  }

  /**
   * Close a position
   */
  async closePosition(positionId: string, exitPrice: number) {
    const position = await this.db.client.position.findUnique({
      where: { id: positionId },
    });

    if (!position || position.status !== 'OPEN') {
      throw new Error('Position not found or already closed');
    }

    const realizedPnL = this.pnlCalculator.calculateRealizedPnL(
      position.entryPrice,
      exitPrice,
      position.quantity,
      position.side as 'BUY' | 'SELL'
    );

    // Update position
    const updatedPosition = await this.db.updatePosition(positionId, {
      currentPrice: exitPrice,
      realizedPnL: position.realizedPnL + realizedPnL,
      unrealizedPnL: 0,
      totalPnL: position.realizedPnL + realizedPnL,
      status: 'CLOSED',
      closedAt: new Date(),
    });

    // Create closing trade
    await this.db.createTrade({
      accountId: position.accountId,
      positionId: position.id,
      tokenId: position.tokenId,
      marketId: position.marketId || undefined,
      side: position.side === 'BUY' ? 'SELL' : 'BUY',
      outcome: position.outcome,
      price: exitPrice,
      size: position.quantity,
      value: exitPrice * position.quantity,
      tradeType: 'CLOSE',
      timestamp: new Date(),
    });

    console.log(
      `📉 Closed position with PnL: $${realizedPnL.toFixed(2)}`
    );

    return updatedPosition;
  }

  /**
   * Reconcile positions based on actual API data
   */
  async reconcilePositions(accountAddress: string, accountId: string) {
    // Get current positions from API
    const apiPositions = await this.api.data.getPositions(accountAddress);

    // Get our tracked positions
    const dbPositions = await this.db.getOpenPositions(accountId);

    // Create a map of API positions by tokenId
    const apiPositionMap = new Map<string, ApiPosition>();
    for (const pos of apiPositions) {
      apiPositionMap.set(pos.asset, pos);
    }

    // Update or close existing positions
    for (const dbPos of dbPositions) {
      const apiPos = apiPositionMap.get(dbPos.tokenId);

      if (!apiPos) {
        // Position no longer exists in API, close it
        const currentPrice = await this.api.getCurrentPrice(dbPos.tokenId);
        await this.closePosition(dbPos.id, currentPrice);
      } else {
        // Update quantity if changed
        const apiSize = typeof apiPos.size === 'string' ? parseFloat(apiPos.size) : apiPos.size;
        if (Math.abs(apiSize - dbPos.quantity) > 0.001) {
          await this.db.updatePosition(dbPos.id, {
            quantity: apiSize,
          });
        }
      }
    }

    // Check for new positions not in our DB
    for (const apiPos of apiPositions) {
      const existsInDb = dbPositions.some(
        (dbPos) => dbPos.tokenId === apiPos.asset
      );

      if (!existsInDb) {
        // New position found, add it
        const price = await this.api.getCurrentPrice(apiPos.asset);
        await this.openPosition({
          accountId,
          tokenId: apiPos.asset,
          side: apiPos.side || 'BUY', // Default to BUY if side not provided
          outcome: 'YES', // Infer from side if possible
          price,
          quantity: typeof apiPos.size === 'string' ? parseFloat(apiPos.size) : apiPos.size,
        });
      }
    }

    console.log(`🔄 Reconciled positions for account ${accountAddress}`);
  }

  /**
   * Update all open positions with current prices
   */
  async updateAllPositionPrices() {
    const openPositions = await this.db.getOpenPositions();

    console.log(`🔄 Updating ${openPositions.length} open positions...`);

    for (const position of openPositions) {
      try {
        const currentPrice = await this.api.getCurrentPrice(position.tokenId);
        await this.updatePositionPrice(position.id, currentPrice);
      } catch (error) {
        console.error(
          `Error updating position ${position.id}:`,
          error
        );
      }
    }

    console.log('✅ All positions updated');
  }
}