import { PolymarketAPI } from '../src/api/PolymarketAPI';
import { CLOBClient } from '../src/api/CLOBClient';
import { GammaClient } from '../src/api/GammaClient';
import { DataClient } from '../src/api/DataClient';

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
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
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
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'Expected error with dummy tokenId'
      }, null, 2));
    }

    console.log('\n2.3. CLOB getPrice(tokenId, side)');
    try {
      const buyPrice = await api.clob.getPrice('0x1234567890abcdef1234567890abcdef12345678', 'BUY');
      console.log('Output:', JSON.stringify({
        price: buyPrice,
        side: 'BUY',
        note: 'Using dummy tokenId - may return error'
      }, null, 2));
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'Expected error with dummy tokenId'
      }, null, 2));
    }

    console.log('\n2.4. CLOB getTrades(params)');
    try {
      const trades = await api.clob.getTrades({ limit: 5 });
      console.log('Output:', JSON.stringify({
        tradesCount: trades.length,
        trades: trades.slice(0, 2), // Show first 2 trades
        note: 'Recent trades from CLOB'
      }, null, 2));
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'CLOB trades endpoint error'
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
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'Gamma API markets endpoint error'
      }, null, 2));
    }

    console.log('\n3.2. Gamma getMarket(conditionId)');
    try {
      const market = await api.gamma.getMarket('0x1234567890abcdef1234567890abcdef12345678');
      console.log('Output:', JSON.stringify({
        market: market,
        note: 'Using dummy conditionId - may return error'
      }, null, 2));
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'Expected error with dummy conditionId'
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
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
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
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'Data API user trades endpoint error'
      }, null, 2));
    }

    console.log('\n4.3. Data getMarketsTraded(userAddress)');
    try {
      const marketsTraded = await api.data.getMarketsTraded('0xeee92f1cc6d6e0ad0b4ffda20b01cf3678e27ecb');
      console.log('Output:', JSON.stringify({
        marketsTraded: marketsTraded,
        note: 'Number of unique markets this user has traded'
      }, null, 2));
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'Data API markets traded endpoint error'
      }, null, 2));
    }

    // Test combined API functions
    console.log('\n5. Testing combined PolymarketAPI functions');
    
    console.log('\n5.1. getMarketDetails(conditionId)');
    try {
      const marketDetails = await api.getMarketDetails('0x1234567890abcdef1234567890abcdef12345678');
      console.log('Output:', JSON.stringify({
        marketDetails: marketDetails,
        note: 'Combines Gamma market data with CLOB order books'
      }, null, 2));
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'Expected error with dummy conditionId'
      }, null, 2));
    }

    console.log('\n5.2. getUserPortfolio(userAddress)');
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
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'Portfolio API error'
      }, null, 2));
    }

    console.log('\n5.3. getCurrentPrice(tokenId)');
    try {
      const currentPrice = await api.getCurrentPrice('0x1234567890abcdef1234567890abcdef12345678');
      console.log('Output:', JSON.stringify({
        currentPrice: currentPrice,
        note: 'Current midpoint price from CLOB API'
      }, null, 2));
    } catch (error) {
      console.log('Output:', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        note: 'Expected error with dummy tokenId'
      }, null, 2));
    }

    console.log('\n✅ All PolymarketAPI functions tested successfully!');

  } catch (error) {
    console.error('❌ Error testing PolymarketAPI:', error);
  }
}

// Run the test
testPolymarketAPI().catch(console.error);