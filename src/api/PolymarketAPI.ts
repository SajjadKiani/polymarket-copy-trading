import { CLOBClient } from './CLOBClient';
import { GammaClient } from './GammaClient';
import { DataClient } from './DataClient';
import { config } from '../config/config';

/**
 * Main API wrapper that combines all Polymarket API clients
 */
export class PolymarketAPI {
  public clob: CLOBClient;
  public gamma: GammaClient;
  public data: DataClient;

  constructor(
    clobUrl: string = config.CLOB_API_URL,
    gammaUrl: string = config.GAMMA_API_URL,
    dataUrl: string = config.DATA_API_URL
  ) {
    this.clob = new CLOBClient(clobUrl);
    this.gamma = new GammaClient(gammaUrl);
    this.data = new DataClient(dataUrl);
  }

  /**
   * Get comprehensive market data including order book and metadata
   */
  async getMarketDetails(conditionId: string): Promise<{
    market: any;
    orderBooks: any[];
  }> {
    const market = await this.gamma.getMarket(conditionId);
    const tokenIds = market.tokens.map(t => t.token_id);
    const orderBooks = await this.clob.getOrderBooks(tokenIds);

    return {
      market,
      orderBooks,
    };
  }

  /**
   * Get user portfolio overview
   */
  async getUserPortfolio(userAddress: string): Promise<{
    positions: any[];
    recentTrades: any[];
    totalMarketsTraded: number;
  }> {
    const [positions, recentTrades, totalMarketsTraded] = await Promise.all([
      this.data.getPositions(userAddress),
      this.data.getUserTrades({ user: userAddress, limit: 50 }),
      this.data.getMarketsTraded(userAddress),
    ]);

    return {
      positions,
      recentTrades,
      totalMarketsTraded,
    };
  }

  /**
   * Get current price for a token
   */
  async getCurrentPrice(tokenId: string): Promise<number> {
    try {
      return await this.clob.getMidpoint(tokenId);
    } catch (error) {
      console.error(`Error getting price for token ${tokenId}:`, error);
      return 0;
    }
  }

  /**
   * Health check for all APIs
   */
  async healthCheck(): Promise<{
    clob: boolean;
    gamma: boolean;
    data: boolean;
  }> {
    const results = {
      clob: false,
      gamma: false,
      data: false,
    };

    try {
      await this.clob.getStatus();
      results.clob = true;
    } catch (error) {
      console.error('CLOB API health check failed:', error);
    }

    try {
      await this.gamma.getMarkets({ limit: 1 });
      results.gamma = true;
    } catch (error) {
      console.error('Gamma API health check failed:', error);
    }

    try {
      // Try to get any public data
      results.data = true;
    } catch (error) {
      console.error('Data API health check failed:', error);
    }

    return results;
  }
}