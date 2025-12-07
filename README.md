# Polymarket Copy Trading Bot

A sophisticated copy trading bot for Polymarket that tracks, simulates, and analyzes trading performance of multiple accounts in real-time.

## Overview

This bot monitors Polymarket trading activity, tracks positions across multiple accounts, simulates copy trading strategies, and provides comprehensive performance analytics. It integrates with Polymarket's APIs to fetch real-time data and maintains a local database for historical analysis.

## Architecture

### Core Components

1. **PolymarketAPI** (`src/api/PolymarketAPI.ts`) - Unified API client combining:
   - **CLOBClient** - Central Limit Order Book API for trading data
   - **GammaClient** - Market metadata and information
   - **DataClient** - User positions, trades, and historical data

2. **DatabaseService** (`src/database/DatabaseService.ts`) - Singleton database service using Prisma ORM with SQLite for:
   - Tracked accounts and their statistics
   - Position tracking (open/closed)
   - Trade history
   - Market information
   - Sync state management

3. **AccountTracker** (`src/services/AccountTracker.ts`) - Main tracking service that:
   - Monitors multiple accounts simultaneously
   - Processes trades and updates positions
   - Calculates performance metrics
   - Maintains sync state

4. **PositionSimulator** (`src/services/PositionSimulator.ts`) - Simulates trading positions:
   - Opens/closes positions based on tracked trades
   - Updates position prices in real-time
   - Reconciles positions with API data
   - Handles position modifications (add/reduce)

5. **PnLCalculator** (`src/services/PnLCalculator.ts`) - Financial calculations:
   - Unrealized and realized P&L
   - Win rates and returns
   - Average entry prices
   - Portfolio-level metrics

### Database Schema

The bot uses a comprehensive SQLite database with the following models:

- **TrackedAccount** - Accounts being monitored with performance stats
- **Position** - Individual trading positions (open/closed)
- **Trade** - Detailed trade history
- **Market** - Market metadata and information
- **SyncState** - Tracking synchronization state

## Key Features

### Real-Time Tracking
- Monitors multiple Polymarket accounts simultaneously
- Fetches latest trades and position updates
- Maintains sync state to avoid duplicate processing

### Position Simulation
- Simulates copy trading by mirroring tracked account positions
- Handles position opening, closing, and modifications
- Real-time price updates and P&L calculations

### Performance Analytics
- Comprehensive P&L tracking (realized/unrealized)
- Win rate calculations and trade statistics
- Portfolio-level metrics and ROI analysis
- Leaderboard ranking of tracked accounts

### Data Management
- Persistent storage of all trading data
- Historical trade analysis
- Market metadata caching
- Efficient database queries with proper indexing

## Configuration

The bot uses environment variables for configuration:

```bash
# API Endpoints
CLOB_API_URL=https://clob.polymarket.com
GAMMA_API_URL=https://gamma-api.polymarket.com
DATA_API_URL=https://data-api.polymarket.com

# Database
DATABASE_URL=file:./prisma/dev.db

# Tracking Settings
POLL_INTERVAL_MS=60000
MAX_HISTORICAL_DAYS=30

# Tracked Accounts (comma-separated)
TRACKED_ACCOUNTS=0x123...,0x456...
```

## Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

3. **Configure environment**
   ```bash
   cp .env.sample .env
   # Edit .env with your configuration
   ```

4. **Build and run**
   ```bash
   npm run build
   npm start
   ```

For development:
```bash
npm run dev
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

## Usage

### Starting the Bot
```bash
npm start
```

The bot will:
1. Initialize database connection
2. Perform API health checks
3. Set up tracked accounts from configuration
4. Begin real-time tracking and simulation

### Account Management
Add accounts to track via the `TRACKED_ACCOUNTS` environment variable or programmatically:
```typescript
await db.addTrackedAccount('0x123...', 'Nickname');
```

### Monitoring
The bot provides real-time console output for:
- Account synchronization status
- Position updates and P&L changes
- Trade processing
- Performance leaderboard

### Database Management

```bash
# Open Prisma Studio (GUI for database)
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset
```

## API Integration

The bot integrates with three main Polymarket APIs:

### CLOB API
- Fetches order books and pricing data
- Retrieves trade information
- Provides market depth

### Gamma API
- Market metadata and descriptions
- Event information
- Token details

### Data API
- User positions and balances
- Trade history
- Account statistics
- Market data

## Performance Metrics

The bot tracks comprehensive performance metrics:

### Account-Level
- Total P&L (realized + unrealized)
- Win rate percentage
- Total number of trades
- Open positions count

### Position-Level
- Entry and current prices
- Quantity and side (BUY/SELL)
- Realized and unrealized P&L
- Market information

### Portfolio-Level
- Total invested capital
- Return on Investment (ROI)
- Position diversity
- Risk metrics

## Code Logic Explanation

### Main Application Flow (`src/index.ts`)

1. **Initialization**: Creates API client, database service, and account tracker
2. **Health Checks**: Verifies connectivity to all Polymarket APIs
3. **Account Setup**: Adds tracked accounts from configuration
4. **Tracking Loop**: Starts periodic synchronization of account data
5. **Display Functions**: Shows leaderboards and account details

### Account Tracking Logic (`src/services/AccountTracker.ts`)

1. **Trade Processing**: 
   - Fetches new trades since last sync
   - Determines if trades open new positions or modify existing ones
   - Updates position quantities and calculates average entry prices

2. **Position Management**:
   - Opens positions for new BUY trades
   - Closes positions when opposing trades detected
   - Handles partial position reductions

3. **Performance Calculation**:
   - Updates unrealized P&L based on current prices
   - Calculates realized P&L on position closures
   - Maintains win rate and total trade statistics

### Position Simulation (`src/services/PositionSimulator.ts`)

1. **Price Updates**: Continuously updates position prices from CLOB API
2. **Reconciliation**: Compares database positions with actual API positions
3. **P&L Tracking**: Calculates unrealized and realized P&L for all positions

### Database Schema (`prisma/schema.prisma`)

The database uses these key models:
- **TrackedAccount**: Stores account metadata and performance statistics
- **Position**: Tracks individual trading positions with P&L calculations
- **Trade**: Records every trade with detailed metadata
- **Market**: Caches market information from Polymarket APIs
- **SyncState**: Prevents duplicate data processing during synchronization

## Development

### Project Structure
```
src/
├── api/           # API clients
├── config/        # Configuration management
├── database/      # Database service
├── services/      # Business logic
└── index.ts       # Main application entry
```

### Adding New Features
1. Extend database schema in `prisma/schema.prisma`
2. Add API methods in appropriate client
3. Implement business logic in services
4. Update main application as needed

### Testing
Run tests with:
```bash
npm test
```

## Security Considerations

- API keys and secrets stored in environment variables
- Database connection properly secured
- Input validation on all API responses
- Error handling prevents data corruption

## Troubleshooting

### Common Issues
1. **API Connection Failures** - Check network connectivity and API status
2. **Database Errors** - Verify database file permissions and schema
3. **Sync Issues** - Check account addresses and API rate limits

### Debug Mode
Enable detailed logging by setting log level in configuration.

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This bot is for educational and research purposes. Trading on Polymarket involves financial risk. Use at your own risk and ensure compliance with local regulations.