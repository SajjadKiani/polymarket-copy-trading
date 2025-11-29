import axios, { AxiosInstance } from 'axios';
import { Position, Trade, UserActivity } from './types';

export class DataClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Get current open positions for a user
   */
  async getPositions(userAddress: string): Promise<Position[]> {
    const response = await this.client.get(`/positions`, {
      params: { user: userAddress },
    });
    return response.data;
  }

  /**
   * Get trades for a user
   */
  async getUserTrades(params: {
    user: string;
    limit?: number;
    offset?: number;
    start_ts?: number;
    end_ts?: number;
  }): Promise<Trade[]> {
    const response = await this.client.get(`/trades`, { params });
    return response.data;
  }

  /**
   * Get trades for specific markets
   */
  async getMarketTrades(params: {
    market?: string;
    asset_id?: string;
    limit?: number;
  }): Promise<Trade[]> {
    const response = await this.client.get(`/trades`, { params });
    return response.data;
  }

  /**
   * Get user activity (trades, splits, merges, redemptions)
   */
  async getUserActivity(params: {
    user: string;
    limit?: number;
    offset?: number;
    start_ts?: number;
    end_ts?: number;
  }): Promise<UserActivity[]> {
    const response = await this.client.get(`/activity`, { params });
    return response.data;
  }

  /**
   * Get closed positions for a user
   */
  async getClosedPositions(userAddress: string): Promise<Position[]> {
    const response = await this.client.get(`/closed-positions`, {
      params: { user: userAddress },
    });
    return response.data;
  }

  /**
   * Get top holders for a market
   */
  async getHolders(params: {
    market?: string;
    asset_id?: string;
    limit?: number;
  }): Promise<any[]> {
    const response = await this.client.get(`/holders`, { params });
    return response.data;
  }

  /**
   * Get total markets traded by user
   */
  async getMarketsTraded(userAddress: string): Promise<number> {
    const response = await this.client.get(`/traded`, {
      params: { user: userAddress },
    });
    return response.data.count || 0;
  }
}