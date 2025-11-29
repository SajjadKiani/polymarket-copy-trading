export class PnLCalculator {
  /**
   * Calculate unrealized PnL for an open position
   */
  calculateUnrealizedPnL(
    entryPrice: number,
    currentPrice: number,
    quantity: number,
    side: 'BUY' | 'SELL'
  ): number {
    if (side === 'BUY') {
      // Long position: profit when price increases
      return (currentPrice - entryPrice) * quantity;
    } else {
      // Short position: profit when price decreases
      return (entryPrice - currentPrice) * quantity;
    }
  }

  /**
   * Calculate realized PnL when closing a position
   */
  calculateRealizedPnL(
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    side: 'BUY' | 'SELL'
  ): number {
    return this.calculateUnrealizedPnL(entryPrice, exitPrice, quantity, side);
  }

  /**
   * Calculate percentage return
   */
  calculateReturn(
    entryPrice: number,
    currentPrice: number,
    side: 'BUY' | 'SELL'
  ): number {
    if (entryPrice === 0) return 0;

    if (side === 'BUY') {
      return ((currentPrice - entryPrice) / entryPrice) * 100;
    } else {
      return ((entryPrice - currentPrice) / entryPrice) * 100;
    }
  }

  /**
   * Calculate win rate from closed positions
   */
  calculateWinRate(wins: number, losses: number): number {
    const total = wins + losses;
    return total === 0 ? 0 : (wins / total) * 100;
  }

  /**
   * Calculate average entry price for multiple trades
   */
  calculateAverageEntryPrice(
    trades: Array<{ price: number; size: number }>
  ): number {
    const totalValue = trades.reduce((sum, t) => sum + t.price * t.size, 0);
    const totalSize = trades.reduce((sum, t) => sum + t.size, 0);
    return totalSize === 0 ? 0 : totalValue / totalSize;
  }

  /**
   * Calculate portfolio-level metrics
   */
  calculatePortfolioMetrics(positions: Array<{
    entryPrice: number;
    currentPrice: number;
    quantity: number;
    side: string;
  }>) {
    let totalPnL = 0;
    let totalInvested = 0;

    for (const position of positions) {
      const pnl = this.calculateUnrealizedPnL(
        position.entryPrice,
        position.currentPrice,
        position.quantity,
        position.side as 'BUY' | 'SELL'
      );
      totalPnL += pnl;
      totalInvested += position.entryPrice * position.quantity;
    }

    const roi = totalInvested === 0 ? 0 : (totalPnL / totalInvested) * 100;

    return {
      totalPnL,
      totalInvested,
      roi,
      positionCount: positions.length,
    };
  }
}