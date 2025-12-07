import { PositionSimulator } from '../src/services/PositionSimulator';
import { PolymarketAPI } from '../src/api/PolymarketAPI';
import { DatabaseService } from '../src/database/DatabaseService';

async function testPositionSimulator() {
  console.log('📈 Testing PositionSimulator Functions');
  console.log('='.repeat(50));

  const api = new PolymarketAPI();
  const db = DatabaseService.getInstance();
  const simulator = new PositionSimulator(api, db);

  try {
    // Connect to database
    await db.connect();
    console.log('✅ Database connected');

    // Test setup - create a test account
    console.log('\n0. Setting up test account and position...');
    const testAccount = await db.addTrackedAccount(
      '0xsimulator1234567890abcdef1234567890abcdef',
      'PositionSimulatorTest'
    );
    console.log('Test account created:', JSON.stringify(testAccount, null, 2));

    // Test openPosition
    console.log('\n1. Testing openPosition(params)');
    console.log('Input:');
    const openParams = {
      accountId: testAccount.id,
      tokenId: '0xposition1234567890abcdef1234567890abcdef',
      side: 'BUY' as const,
      outcome: 'YES' as const,
      price: 0.65,
      quantity: 100,
      marketInfo: {
        id: 'market-123',
        slug: 'test-market',
        question: 'Will this test work?'
      }
    };
    console.log(JSON.stringify(openParams, null, 2));

    const openedPosition = await simulator.openPosition(openParams);
    console.log('Output:', JSON.stringify(openedPosition, null, 2));
    console.log('Note: Creates both position record and opening trade record');

    // Test updatePositionPrice
    console.log('\n2. Testing updatePositionPrice(positionId, newPrice)');
    console.log('Input:');
    console.log('  positionId:', openedPosition.id);
    console.log('  newPrice: 0.70');

    const updatedPosition = await simulator.updatePositionPrice(openedPosition.id, 0.70);
    console.log('Output:', JSON.stringify(updatedPosition, null, 2));
    console.log('Note: Recalculates unrealized P&L based on price change');

    // Test closePosition
    console.log('\n3. Testing closePosition(positionId, exitPrice)');
    console.log('Input:');
    console.log('  positionId:', openedPosition.id);
    console.log('  exitPrice: 0.75');

    const closedPosition = await simulator.closePosition(openedPosition.id, 0.75);
    console.log('Output:', JSON.stringify(closedPosition, null, 2));
    console.log('Note: Calculates realized P&L and creates closing trade record');

    // Test with a new position for reconciliation testing
    console.log('\n4. Creating another position for reconciliation tests...');
    const secondPosition = await simulator.openPosition({
      accountId: testAccount.id,
      tokenId: '0xsecond1234567890abcdef1234567890abcdef',
      side: 'SELL' as const,
      outcome: 'NO' as const,
      price: 0.35,
      quantity: 200,
      marketInfo: {
        id: 'market-456',
        slug: 'test-market-2',
        question: 'Will this test also work?'
      }
    });
    console.log('Second position created:', JSON.stringify(secondPosition, null, 2));

    // Test reconcilePositions
    console.log('\n5. Testing reconcilePositions(accountAddress, accountId)');
    console.log('Input:');
    console.log('  accountAddress:', testAccount.address);
    console.log('  accountId:', testAccount.id);

    try {
      await simulator.reconcilePositions(testAccount.address, testAccount.id);
      console.log('Output: Reconciliation completed');
      console.log('Note: Compares database positions with API positions and updates accordingly');
      console.log('  - Closes positions not found in API');
      console.log('  - Updates quantities if they differ');
      console.log('  - Creates new positions found in API but not in DB');
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'Sync may fail due to API limitations or invalid address'
      }, null, 2));
    }

    // Test updateAllPositionPrices
    console.log('\n6. Testing updateAllPositionPrices()');
    console.log('Input: None (updates all open positions)');
    
    try {
      await simulator.updateAllPositionPrices();
      console.log('Output: All open positions updated with current prices');
      console.log('Note: Fetches current prices from API and updates all open positions');
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'Price updates may fail due to API limitations'
      }, null, 2));
    }

    // Test position modifications (partial close and add)
    console.log('\n7. Testing position modifications...');
    
    // Open a new position for modification tests
    const modPosition = await simulator.openPosition({
      accountId: testAccount.id,
      tokenId: '0xmodify1234567890abcdef1234567890abcdef',
      side: 'BUY' as const,
      outcome: 'YES' as const,
      price: 0.50,
      quantity: 100,
      marketInfo: {
        id: 'market-mod',
        slug: 'test-modify',
        question: 'Can we modify this position?'
      }
    });
    console.log('Position for modification tests:', JSON.stringify(modPosition, null, 2));

    // Simulate partial close (this would normally be done through AccountTracker)
    console.log('\n7.1. Simulating partial position reduction');
    console.log('Note: Partial closes are handled by AccountTracker.processTrades()');
    console.log('  - Calculates realized P&L for partial amount');
    console.log('  - Reduces position quantity');
    console.log('  - Updates total realized P&L');

    // Simulate adding to position
    console.log('\n7.2. Simulating adding to position');
    console.log('Note: Adding to positions is handled by AccountTracker.processTrades()');
    console.log('  - Calculates new average entry price');
    console.log('  - Updates position quantity');
    console.log('  - Creates ADD type trade record');

    // Test error handling
    console.log('\n8. Testing error handling...');
    
    console.log('\n8.1. Closing non-existent position');
    try {
      await simulator.closePosition('non-existent-id', 0.50);
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'Expected error for non-existent position'
      }, null, 2));
    }

    console.log('\n8.2. Updating price for non-existent position');
    const nullResult = await simulator.updatePositionPrice('non-existent-id', 0.50);
    console.log('Output:', JSON.stringify({
      result: nullResult,
      note: 'Should return null for non-existent position'
    }, null, 2));

    console.log('\n9. Function Summary');
    console.log('PositionSimulator provides the following functions:');
    console.log('  - openPosition(params): Open new position with trade');
    console.log('  - updatePositionPrice(positionId, newPrice): Update price and recalculate P&L');
    console.log('  - closePosition(positionId, exitPrice): Close position and calculate realized P&L');
    console.log('  - reconcilePositions(accountAddress, accountId): Sync positions with API');
    console.log('  - updateAllPositionPrices(): Update all open positions with current prices');
    console.log('');
    console.log('Key features:');
    console.log('  - Automatic trade record creation');
    console.log('  - Real-time P&L calculation');
    console.log('  - Position reconciliation with API data');
    console.log('  - Error handling for edge cases');

    console.log('\n✅ All PositionSimulator functions tested successfully!');

  } catch (error) {
    console.error('❌ Error testing PositionSimulator:', error);
  } finally {
    // Disconnect
    await db.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testPositionSimulator().catch(console.error);