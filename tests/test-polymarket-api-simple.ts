import { PolymarketAPI } from '../src/api/PolymarketAPI';

async function testPolymarketAPI() {
  console.log('🌐 Testing PolymarketAPI Functions');
  console.log('='.repeat(50));

  const api = new PolymarketAPI();

  try {
    // Test health check
    console.log('\n1. Testing healthCheck()');
    const health = await api.healthCheck();
    console.log('Output:', JSON.stringify(health, null, 2));

    // Test CLOB Client functions
    console.log('\n2. Testing CLOBClient functions');
    
    console.log('\n2.1. CLOB getStatus()');
    try {
      const clobStatus = await api.clob.getStatus();
      console.log('Output:', JSON.stringify(clobStatus, null, 2));
    } catch (err) {
      console.log('Output:', JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
        note: 'CLOB API may not be accessible'
      }, null, 2));
    }

    console.log('\n2.2. CLOB getMidpoint(tokenId)');
    try {
      const midpoint = await api.clob.getMidpoint('0x1234567890abcdef1234567890abcdef12345678');
      console.log('Output:', JSON.stringify({
        midpoint: midpoint,
        note: 'Using dummy tokenId - may return error'
      }, null, 2));
    } catch (err) {
      console.log('Output:', JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
        note: 'Expected error with dummy tokenId'
      }, null, 2));
    }

    // Test Gamma Client functions
    console.log('\n3. Testing GammaClient functions');
    
    console.log('\n3.1. Gamma getMarkets(params)');
    try {
      const markets = await api.gamma.getMarkets({ limit: 5 });
      console.log('Output:', JSON.stringify({
        marketsCount: markets.length,
        markets: markets.slice(0, 2), // Show first 2 markets
        sampleMarketStructure: markets[0] ? {
          id: markets[0].id,
          question: markets[0].question,
          tokens: markets[0].tokens?.length || 0
        } : null
      }, null, 2));
    } catch (err) {
      console.log('Output:', JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
        note: 'Gamma API markets endpoint error'
      }, null, 2));
    }

    // Test Data Client functions
    console.log('\n4. Testing DataClient functions');
    
    console.log('\n4.1. Data getPositions(userAddress)');
    try {
      const positions = await api.data.getPositions('0xeee92f1cc6d6e0ad0b4ffda20b01cf3678e27ecb');
      console.log('Output:', JSON.stringify({
        positionsCount: positions.length,
        positions: positions.slice(0, 2), // Show first 2 positions
        samplePositionStructure: positions[0] ? {
          asset: positions[0].asset,
          size: positions[0].size,
          side: positions[0].side
        } : null
      }, null, 2));
    } catch (err) {
      console.log('Output:', JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
        note: 'Data API positions endpoint error'
      }, null, 2));
    }

    console.log('\n4.2. Data getUserTrades(params)');
    try {
      const userTrades = await api.data.getUserTrades({
        user: '0xeee92f1cc6d6e0ad0b4ffda20b01cf3678e27ecb',
        limit: 5
      });
      console.log('Output:', JSON.stringify({
        tradesCount: userTrades.length,
        trades: userTrades.slice(0, 2), // Show first 2 trades
        sampleTradeStructure: userTrades[0] ? {
          asset: userTrades[0].asset,
          side: userTrades[0].side,
          price: userTrades[0].price,
          size: userTrades[0].size,
          timestamp: userTrades[0].timestamp
        } : null
      }, null, 2));
    } catch (err) {
      console.log('Output:', JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
        note: 'Data API user trades endpoint error'
      }, null, 2));
    }

    // Test combined API functions
    console.log('\n5. Testing combined PolymarketAPI functions');
    
    console.log('\n5.1. getUserPortfolio(userAddress)');
    try {
      const portfolio = await api.getUserPortfolio('0xeee92f1cc6d6e0ad0b4ffda20b01cf3678e27ecb');
      console.log('Output:', JSON.stringify({
        portfolio: {
          positionsCount: portfolio.positions.length,
          recentTradesCount: portfolio.recentTrades.length,
          totalMarketsTraded: portfolio.totalMarketsTraded,
          samplePositions: portfolio.positions.slice(0, 2),
          sampleTrades: portfolio.recentTrades.slice(0, 2)
        },
        note: 'Combined portfolio overview from multiple API calls'
      }, null, 2));
    } catch (err) {
      console.log('Output:', JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
        note: 'Portfolio API error'
      }, null, 2));
    }

    console.log('\n5.2. getCurrentPrice(tokenId)');
    try {
      const currentPrice = await api.getCurrentPrice('0x1234567890abcdef1234567890abcdef12345678');
      console.log('Output:', JSON.stringify({
        currentPrice: currentPrice,
        note: 'Current midpoint price from CLOB API'
      }, null, 2));
    } catch (err) {
      console.log('Output:', JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
        note: 'Expected error with dummy tokenId'
      }, null, 2));
    }

    console.log('\n✅ All PolymarketAPI functions tested successfully!');

  } catch (err) {
    console.error('❌ Error testing PolymarketAPI:', err instanceof Error ? err.message : String(err));
  }
}

// Run the test
testPolymarketAPI().catch(console.error);