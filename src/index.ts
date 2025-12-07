import { PolymarketAPI } from './api/PolymarketAPI';
import { DatabaseService } from './database/DatabaseService';
import { AccountTracker } from './services/AccountTracker';
import { config } from './config/config';

class PolymarketCopyTradingBot {
  private api: PolymarketAPI;
  private db: DatabaseService;
  private tracker: AccountTracker;

  constructor() {
    this.api = new PolymarketAPI();
    this.db = DatabaseService.getInstance();
    this.tracker = new AccountTracker(this.api, this.db);
  }

  async initialize() {
    console.log('🤖 Polymarket Copy Trading Bot');
    console.log('================================\n');

    // Connect to database
    await this.db.connect();

    // Health check APIs
    console.log('🔍 Checking API health...');
    const health = await this.api.healthCheck();
    console.log('  CLOB API:', health.clob ? '✅' : '❌');
    console.log('  Gamma API:', health.gamma ? '✅' : '❌');
    console.log('  Data API:', health.data ? '✅' : '❌');
    console.log();

    // Add tracked accounts if configured
    if (config.TRACKED_ACCOUNTS.length > 0) {
      console.log('📋 Setting up tracked accounts...');
      for (const address of config.TRACKED_ACCOUNTS) {
        try {
          const existing = await this.db.client.trackedAccount.findUnique({
            where: { address },
          });

          if (!existing) {
            await this.db.addTrackedAccount(address);
            console.log(`  ✓ Added ${address}`);
          } else {
            console.log(`  ↪ Already tracking ${address}`);
          }
        } catch (error) {
          console.error(`  ✗ Error adding ${address}:`, error);
        }
      }
      console.log();
    }
  }

  async start() {
    await this.initialize();

    // Start tracking
    // await this.tracker.startTracking(config.POLL_INTERVAL_MS);
    await this.displayAccountDetails("e03dc722-478e-4b39-b67b-818a0632aa1d")
    await this.displayLeaderboard()
    // Display leaderboard periodically
    // setInterval(async () => {
    //   await this.displayLeaderboard();
    // }, 5 * 60 * 1000); // Every 5 minutes
  }

  async displayLeaderboard() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 LEADERBOARD');
    console.log('='.repeat(80));

    const leaderboard = await this.tracker.getLeaderboard();

    if (leaderboard.length === 0) {
      console.log('No tracked accounts yet.');
      return;
    }

    console.log(
      `\n${'Rank'.padEnd(6)} ${'Address'.padEnd(12)} ${'Nickname'.padEnd(15)} ${'PnL'.padEnd(12)} ${'Win Rate'.padEnd(10)} ${'Trades'.padEnd(8)} Open`
    );
    console.log('-'.repeat(80));

    leaderboard.forEach((account, index) => {
      const rank = (index + 1).toString().padEnd(6);
      const addr = account.address.slice(0, 10).padEnd(12);
      const nick = (account.nickname || '-').padEnd(15);
      const pnl = `$${account.totalPnL.toFixed(2)}`.padEnd(12);
      const winRate = `${account.winRate.toFixed(1)}%`.padEnd(10);
      const trades = account.totalTrades.toString().padEnd(8);
      const open = account.openPositions.toString();

      console.log(`${rank} ${addr} ${nick} ${pnl} ${winRate} ${trades} ${open}`);
    });

    console.log('='.repeat(80) + '\n');
  }

  async displayAccountDetails(accountId: string) {
    const summary = await this.tracker.getAccountSummary(accountId);

    console.log('\n' + '='.repeat(80));
    console.log(`📈 ACCOUNT DETAILS: ${summary.account.address}`);
    console.log('='.repeat(80));
    console.log(`Nickname: ${summary.account.nickname || 'N/A'}`);
    console.log(`Total PnL: $${summary.account.totalPnL.toFixed(2)}`);
    console.log(`Win Rate: ${summary.account.winRate.toFixed(1)}%`);
    console.log(`Total Trades: ${summary.account.totalTrades}`);
    console.log(`Open Positions: ${summary.openPositions}`);
    console.log(`Closed Positions: ${summary.closedPositions}`);
    console.log('\nPortfolio Metrics:');
    console.log(`  Total PnL: $${summary.portfolio.totalPnL.toFixed(2)}`);
    console.log(`  Total Invested: $${summary.portfolio.totalInvested.toFixed(2)}`);
    console.log(`  ROI: ${summary.portfolio.roi.toFixed(2)}%`);
    console.log('='.repeat(80) + '\n');
  }

  async shutdown() {
    console.log('\n🛑 Shutting down...');
    this.tracker.stopTracking();
    await this.db.disconnect();
    console.log('✅ Goodbye!\n');
    process.exit(0);
  }
}

const bot = new PolymarketCopyTradingBot();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await bot.shutdown();
});

process.on('SIGTERM', async () => {
  await bot.shutdown();
});

// Start the bot
bot.start().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

export default PolymarketCopyTradingBot;