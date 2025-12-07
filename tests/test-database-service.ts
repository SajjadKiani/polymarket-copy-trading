import { DatabaseService } from '../src/database/DatabaseService';
import { config } from '../src/config/config';

async function testDatabaseService() {
  console.log('🗄️  Testing DatabaseService Functions');
  console.log('='.repeat(50));

  const db = DatabaseService.getInstance();
  
  try {
    // Connect to database
    console.log('\n1. Connecting to database...');
    await db.connect();
    console.log('✅ Connected successfully');

    // Test TrackedAccount functions
    console.log('\n2. Testing TrackedAccount functions...');
    
    // Add tracked account
    console.log('\n2.1. addTrackedAccount(address, nickname)');
    const testAccount = await db.addTrackedAccount(
      '0x1234567890abcdef1234567890abcdef12345678',
      'TestTrader'
    );
    console.log('Output:', JSON.stringify(testAccount, null, 2));

    // Get tracked accounts
    console.log('\n2.2. getTrackedAccounts(activeOnly)');
    const trackedAccounts = await db.getTrackedAccounts();
    console.log('Output:', JSON.stringify(trackedAccounts, null, 2));

    // Update account stats
    console.log('\n2.3. updateAccountStats(accountId, stats)');
    const updatedAccount = await db.updateAccountStats(testAccount.id, {
      totalPnL: 150.50,
      winRate: 65.5,
      totalTrades: 25
    });
    console.log('Output:', JSON.stringify(updatedAccount, null, 2));

    // Test Position functions
    console.log('\n3. Testing Position functions...');
    
    // Create position
    console.log('\n3.1. createPosition(data)');
    const testPosition = await db.createPosition({
      accountId: testAccount.id,
      tokenId: '0xabcdef1234567890abcdef1234567890abcdef12',
      marketId: 'market-123',
      marketSlug: 'will-biden-win-2024',
      marketQuestion: 'Will Biden win the 2024 election?',
      side: 'BUY',
      outcome: 'YES',
      entryPrice: 0.65,
      currentPrice: 0.65,
      quantity: 100
    });
    console.log('Output:', JSON.stringify(testPosition, null, 2));

    // Update position
    console.log('\n3.2. updatePosition(positionId, data)');
    const updatedPosition = await db.updatePosition(testPosition.id, {
      currentPrice: 0.70,
      unrealizedPnL: 5.0,
      totalPnL: 5.0
    });
    console.log('Output:', JSON.stringify(updatedPosition, null, 2));

    // Get open positions
    console.log('\n3.3. getOpenPositions(accountId?)');
    const openPositions = await db.getOpenPositions(testAccount.id);
    console.log('Output:', JSON.stringify(openPositions, null, 2));

    // Get positions by token ID
    console.log('\n3.4. getPositionsByTokenId(tokenId)');
    const positionsByToken = await db.getPositionsByTokenId(testPosition.tokenId);
    console.log('Output:', JSON.stringify(positionsByToken, null, 2));

    // Test Trade functions
    console.log('\n4. Testing Trade functions...');
    
    // Create trade
    console.log('\n4.1. createTrade(data)');
    const testTrade = await db.createTrade({
      accountId: testAccount.id,
      positionId: testPosition.id,
      tokenId: testPosition.tokenId,
      marketId: testPosition.marketId || undefined,
      side: 'BUY',
      outcome: 'YES',
      price: 0.65,
      size: 100,
      value: 65.0,
      tradeType: 'OPEN',
      timestamp: new Date()
    });
    console.log('Output:', JSON.stringify(testTrade, null, 2));

    // Get trades
    console.log('\n4.2. getTrades(params)');
    const trades = await db.getTrades({
      accountId: testAccount.id,
      limit: 10
    });
    console.log('Output:', JSON.stringify(trades, null, 2));

    // Test Market functions
    console.log('\n5. Testing Market functions...');
    
    // Upsert market
    console.log('\n5.1. upsertMarket(data)');
    const testMarket = await db.upsertMarket({
      id: 'market-123',
      conditionId: '0x1234567890abcdef1234567890abcdef12345678',
      questionId: 'q-123',
      question: 'Will Biden win the 2024 election?',
      description: 'US Presidential Election 2024',
      endDate: new Date('2024-11-05'),
      yesTokenId: '0xyes1234567890abcdef1234567890abcdef12',
      noTokenId: '0xno1234567890abcdef1234567890abcdef12',
      volume: 1000000,
      liquidity: 50000
    });
    console.log('Output:', JSON.stringify(testMarket, null, 2));

    // Get market
    console.log('\n5.2. getMarket(id)');
    const market = await db.getMarket('market-123');
    console.log('Output:', JSON.stringify(market, null, 2));

    // Test SyncState functions
    console.log('\n6. Testing SyncState functions...');
    
    // Update sync state
    console.log('\n6.1. updateSyncState(accountAddress, blockNumber)');
    const syncState = await db.updateSyncState(testAccount.address, 12345);
    console.log('Output:', JSON.stringify(syncState, null, 2));

    // Get sync state
    console.log('\n6.2. getSyncState(accountAddress)');
    const retrievedSyncState = await db.getSyncState(testAccount.address);
    console.log('Output:', JSON.stringify(retrievedSyncState, null, 2));

    // Test direct client access
    console.log('\n7. Testing direct client access...');
    console.log('\n7.1. db.client.trackedAccount.findMany()');
    const allAccounts = await db.client.trackedAccount.findMany({
      include: {
        positions: true,
        trades: true
      }
    });
    console.log('Output:', JSON.stringify(allAccounts, null, 2));

    console.log('\n✅ All DatabaseService functions tested successfully!');

  } catch (error) {
    console.error('❌ Error testing DatabaseService:', error);
  } finally {
    // Disconnect
    await db.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testDatabaseService().catch(console.error);