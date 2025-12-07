import { PnLCalculator } from '../src/services/PnLCalculator';

async function testPnLCalculator() {
  console.log('🧮 Testing PnLCalculator Functions');
  console.log('='.repeat(50));

  const pnlCalculator = new PnLCalculator();

  try {
    // Test calculateUnrealizedPnL
    console.log('\n1. Testing calculateUnrealizedPnL(entryPrice, currentPrice, quantity, side)');
    
    console.log('\n1.1. Long position (BUY) - profitable');
    const longProfit = pnlCalculator.calculateUnrealizedPnL(0.50, 0.70, 100, 'BUY');
    console.log('Input: entryPrice=0.50, currentPrice=0.70, quantity=100, side=BUY');
    console.log('Output:', JSON.stringify({
      unrealizedPnL: longProfit,
      calculation: '(0.70 - 0.50) * 100 = 20.00'
    }, null, 2));

    console.log('\n1.2. Long position (BUY) - loss');
    const longLoss = pnlCalculator.calculateUnrealizedPnL(0.70, 0.50, 100, 'BUY');
    console.log('Input: entryPrice=0.70, currentPrice=0.50, quantity=100, side=BUY');
    console.log('Output:', JSON.stringify({
      unrealizedPnL: longLoss,
      calculation: '(0.50 - 0.70) * 100 = -20.00'
    }, null, 2));

    console.log('\n1.3. Short position (SELL) - profitable');
    const shortProfit = pnlCalculator.calculateUnrealizedPnL(0.70, 0.50, 100, 'SELL');
    console.log('Input: entryPrice=0.70, currentPrice=0.50, quantity=100, side=SELL');
    console.log('Output:', JSON.stringify({
      unrealizedPnL: shortProfit,
      calculation: '(0.70 - 0.50) * 100 = 20.00'
    }, null, 2));

    console.log('\n1.4. Short position (SELL) - loss');
    const shortLoss = pnlCalculator.calculateUnrealizedPnL(0.50, 0.70, 100, 'SELL');
    console.log('Input: entryPrice=0.50, currentPrice=0.70, quantity=100, side=SELL');
    console.log('Output:', JSON.stringify({
      unrealizedPnL: shortLoss,
      calculation: '(0.50 - 0.70) * 100 = -20.00'
    }, null, 2));

    // Test calculateRealizedPnL
    console.log('\n2. Testing calculateRealizedPnL(entryPrice, exitPrice, quantity, side)');
    
    console.log('\n2.1. Realized profit from long position');
    const realizedProfit = pnlCalculator.calculateRealizedPnL(0.40, 0.80, 50, 'BUY');
    console.log('Input: entryPrice=0.40, exitPrice=0.80, quantity=50, side=BUY');
    console.log('Output:', JSON.stringify({
      realizedPnL: realizedProfit,
      calculation: '(0.80 - 0.40) * 50 = 20.00'
    }, null, 2));

    // Test calculateReturn
    console.log('\n3. Testing calculateReturn(entryPrice, currentPrice, side)');
    
    console.log('\n3.1. Return on long position');
    const longReturn = pnlCalculator.calculateReturn(0.50, 0.75, 'BUY');
    console.log('Input: entryPrice=0.50, currentPrice=0.75, side=BUY');
    console.log('Output:', JSON.stringify({
      returnPercentage: longReturn,
      calculation: '((0.75 - 0.50) / 0.50) * 100 = 50.00%'
    }, null, 2));

    console.log('\n3.2. Return on short position');
    const shortReturn = pnlCalculator.calculateReturn(0.80, 0.60, 'SELL');
    console.log('Input: entryPrice=0.80, currentPrice=0.60, side=SELL');
    console.log('Output:', JSON.stringify({
      returnPercentage: shortReturn,
      calculation: '((0.80 - 0.60) / 0.80) * 100 = 25.00%'
    }, null, 2));

    console.log('\n3.3. Zero entry price edge case');
    const zeroReturn = pnlCalculator.calculateReturn(0, 0.50, 'BUY');
    console.log('Input: entryPrice=0, currentPrice=0.50, side=BUY');
    console.log('Output:', JSON.stringify({
      returnPercentage: zeroReturn,
      calculation: 'Edge case: entryPrice is 0, return is 0'
    }, null, 2));

    // Test calculateWinRate
    console.log('\n4. Testing calculateWinRate(wins, losses)');
    
    console.log('\n4.1. Normal win rate');
    const normalWinRate = pnlCalculator.calculateWinRate(7, 3);
    console.log('Input: wins=7, losses=3');
    console.log('Output:', JSON.stringify({
      winRate: normalWinRate,
      calculation: '(7 / (7 + 3)) * 100 = 70.00%'
    }, null, 2));

    console.log('\n4.2. Perfect win rate');
    const perfectWinRate = pnlCalculator.calculateWinRate(10, 0);
    console.log('Input: wins=10, losses=0');
    console.log('Output:', JSON.stringify({
      winRate: perfectWinRate,
      calculation: '(10 / (10 + 0)) * 100 = 100.00%'
    }, null, 2));

    console.log('\n4.3. Zero trades edge case');
    const zeroWinRate = pnlCalculator.calculateWinRate(0, 0);
    console.log('Input: wins=0, losses=0');
    console.log('Output:', JSON.stringify({
      winRate: zeroWinRate,
      calculation: 'Edge case: no trades, win rate is 0'
    }, null, 2));

    // Test calculateAverageEntryPrice
    console.log('\n5. Testing calculateAverageEntryPrice(trades)');
    
    console.log('\n5.1. Average entry price for multiple trades');
    const avgPrice = pnlCalculator.calculateAverageEntryPrice([
      { price: 0.40, size: 50 },
      { price: 0.60, size: 30 },
      { price: 0.50, size: 20 }
    ]);
    console.log('Input: trades=[{price:0.40,size:50}, {price:0.60,size:30}, {price:0.50,size:20}]');
    console.log('Output:', JSON.stringify({
      averageEntryPrice: avgPrice,
      calculation: '((0.40*50) + (0.60*30) + (0.50*20)) / (50+30+20) = 48.00 / 100 = 0.48'
    }, null, 2));

    console.log('\n5.2. Single trade');
    const singleTradeAvg = pnlCalculator.calculateAverageEntryPrice([
      { price: 0.75, size: 100 }
    ]);
    console.log('Input: trades=[{price:0.75,size:100}]');
    console.log('Output:', JSON.stringify({
      averageEntryPrice: singleTradeAvg,
      calculation: '(0.75*100) / 100 = 0.75'
    }, null, 2));

    console.log('\n5.3. Empty trades edge case');
    const emptyAvg = pnlCalculator.calculateAverageEntryPrice([]);
    console.log('Input: trades=[]');
    console.log('Output:', JSON.stringify({
      averageEntryPrice: emptyAvg,
      calculation: 'Edge case: no trades, average price is 0'
    }, null, 2));

    // Test calculatePortfolioMetrics
    console.log('\n6. Testing calculatePortfolioMetrics(positions)');
    
    const portfolioMetrics = pnlCalculator.calculatePortfolioMetrics([
      {
        entryPrice: 0.50,
        currentPrice: 0.70,
        quantity: 100,
        side: 'BUY'
      },
      {
        entryPrice: 0.80,
        currentPrice: 0.60,
        quantity: 50,
        side: 'SELL'
      },
      {
        entryPrice: 0.30,
        currentPrice: 0.25,
        quantity: 200,
        side: 'BUY'
      }
    ]);
    console.log('Input: positions=[3 positions with different sides and prices]');
    console.log('Output:', JSON.stringify({
      portfolioMetrics,
      breakdown: {
        position1: {
          unrealizedPnL: pnlCalculator.calculateUnrealizedPnL(0.50, 0.70, 100, 'BUY'),
          invested: 0.50 * 100
        },
        position2: {
          unrealizedPnL: pnlCalculator.calculateUnrealizedPnL(0.80, 0.60, 50, 'SELL'),
          invested: 0.80 * 50
        },
        position3: {
          unrealizedPnL: pnlCalculator.calculateUnrealizedPnL(0.30, 0.25, 200, 'BUY'),
          invested: 0.30 * 200
        }
      }
    }, null, 2));

    console.log('\n✅ All PnLCalculator functions tested successfully!');

  } catch (error) {
    console.error('❌ Error testing PnLCalculator:', error);
  }
}

// Run the test
testPnLCalculator().catch(console.error);