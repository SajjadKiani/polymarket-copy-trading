# Polymarket Copy Trading Bot

A sophisticated copy trading bot for Polymarket built with TypeScript, featuring real-time position tracking, PnL calculation, and comprehensive account monitoring.

## 🚀 Features

- **API Wrapper**: Complete wrapper for Polymarket's CLOB, Gamma, and Data APIs
- **Account Tracking**: Monitor multiple Polymarket accounts simultaneously
- **Position Simulation**: Track open positions and simulate trades
- **PnL Calculation**: Real-time profit/loss tracking with unrealized and realized PnL
- **SQLite Database**: Persistent storage using Prisma ORM
- **OOP Design**: Clean, maintainable object-oriented architecture
- **Leaderboard**: Track performance across multiple accounts
- **Automatic Sync**: Periodic polling to stay updated with latest trades

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- SQLite3

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd polymarket-copy-trading-bot

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# API Endpoints (optional, defaults provided)
CLOB_API_URL=https://clob.polymarket.com
GAMMA_API_URL=https://gamma.polymarket.com
DATA_API_URL=https://data-api.polymarket.com

# Database
DATABASE_URL=file:./prisma/dev.db

# Tracking Settings
POLL_INTERVAL_MS=60000
MAX_HISTORICAL_DAYS=30

# Tracked Accounts (comma-separated wallet addresses)
TRACKED_ACCOUNTS=0x1234...,0x5678...
```

## 🏗️ Project Structure

```
polymarket-copy-trading-bot/
├── src/
│   ├── api/
│   │   ├── PolymarketAPI.ts          # Main API wrapper
│   │   ├── CLOBClient.ts              # CLOB API client
│   │   ├── GammaClient.ts             # Gamma API client
│   │   ├── DataClient.ts              # Data API client
│   │   └── types.ts                   # TypeScript types
│   ├── models/
│   │   └── (Prisma-generated models)
│   ├── services/
│   │   ├── AccountTracker.ts          # Track target accounts
│   │   ├── PositionSimulator.ts       # Simulate positions
│   │   └── PnLCalculator.ts           # Calculate PnL
│   ├── database/
│   │   └── DatabaseService.ts         # Prisma database wrapper
│   ├── config/
│   │   └── config.ts                  # Configuration
│   └── index.ts                       # Main entry point
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── dev.db                         # SQLite database
├── package.json
├── tsconfig.json
└── .env
```

## 🎯 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
# Build
npm run build

# Start
npm start
```

### Database Management

```bash
# Open Prisma Studio (GUI for database)
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset
```

## 📊 API Wrapper Usage

### Basic Example

```typescript
import { PolymarketAPI } from './src/api/PolymarketAPI';

const api = new PolymarketAPI();

// Get markets
const markets = await api.gamma.getMarkets({ limit: 10 });

// Get user positions
const positions = await api.data.getPositions('0x...');

// Get order book
const orderBook = await api.clob.getOrderBook('tokenId');

// Get current price
const price = await api.getCurrentPrice('tokenId');
```

### Advanced Usage

```typescript
// Get comprehensive market data
const marketDetails = await api.getMarketDetails('conditionId');

// Get user portfolio overview
const portfolio = await api.getUserPortfolio('0x...');

// Health check
const health = await api.healthCheck();
```

## 🔄 Account Tracking

### Adding Accounts Programmatically

```typescript
import { DatabaseService } from './src/database/DatabaseService';

const db = DatabaseService.getInstance();
await db.connect();

await db.addTrackedAccount(
  '0x1234567890abcdef1234567890abcdef12345678',
  'AliceTrader'
);
```

### Viewing Account Summary

```typescript
import { AccountTracker } from './src/services/AccountTracker';

const tracker = new AccountTracker(api, db);
const summary = await tracker.getAccountSummary(accountId);

console.log(summary);
// {
//   account: { address, nickname, totalPnL, winRate, totalTrades },
//   openPositions: 5,
//   closedPositions: 12,
//   portfolio: { totalPnL, totalInvested, roi, positionCount }
// }
```

## 📈 PnL Calculation

The bot automatically tracks:

- **Unrealized PnL**: Profit/loss on open positions
- **Realized PnL**: Profit/loss on closed positions
- **Total PnL**: Combined unrealized + realized
- **Win Rate**: Percentage of profitable closed positions
- **ROI**: Return on investment percentage

## 🗄️ Database Schema

### TrackedAccount
- Stores account information, statistics, and relationships to positions/trades

### Position
- Tracks open and closed positions with entry/exit prices and PnL

### Trade
- Records individual trades with price, size, and metadata

### Market
- Caches market information from Gamma API

### SyncState
- Tracks synchronization state for each account

## 🛠️ Development

### Adding New Features

1. **New API Endpoint**: Add methods to appropriate client in `src/api/`
2. **New Service**: Create service class in `src/services/`
3. **Database Changes**: Modify `prisma/schema.prisma` and run migration

### Testing

```bash
# Run the bot with a single test account
TRACKED_ACCOUNTS=0x... npm run dev
```

## 🔐 Security Notes

- Never commit `.env` files
- API keys are read-only for this implementation
- No trading/execution capabilities included
- Database is local SQLite (upgrade to PostgreSQL for production)

## 📝 Common Issues

### Database Lock Error
```bash
# Reset the database
npx prisma migrate reset
```

### Rate Limiting
- The bot respects API rate limits
- Default poll interval is 60 seconds
- Adjust `POLL_INTERVAL_MS` in `.env` if needed

### Missing Positions
- The bot reconciles positions periodically
- Manual sync: restart the bot or wait for next sync cycle

## 🚀 Roadmap

- [ ] WebSocket support for real-time updates
- [ ] Advanced analytics dashboard
- [ ] Export reports (CSV/PDF)
- [ ] Telegram/Discord notifications
- [ ] Copy trading execution (place orders)
- [ ] Risk management rules
- [ ] Multiple strategy support

## 📚 Resources

- [Polymarket API Documentation](https://docs.polymarket.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ for the Polymarket community