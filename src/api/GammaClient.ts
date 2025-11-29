import axios, { AxiosInstance } from 'axios';
import { Market } from './types';

export class GammaClient {
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
   * Get markets with optional filters
   */
  async getMarkets(params?: {
    closed?: boolean;
    archived?: boolean;
    limit?: number;
    offset?: number;
    order?: string;
    ascending?: boolean;
  }): Promise<Market[]> {
    const response = await this.client.get(`/markets`, { params });
    return response.data;
  }

  /**
   * Get a specific market by condition ID
   */
  async getMarket(conditionId: string): Promise<Market> {
    const response = await this.client.get(`/markets/${conditionId}`);
    return response.data;
  }

  /**
   * Get events
   */
  async getEvents(params?: {
    archived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await this.client.get(`/events`, { params });
    return response.data;
  }

  /**
   * Search markets, events, and profiles
   */
  async search(query: string): Promise<any> {
    const response = await this.client.get(`/search`, {
      params: { query },
    });
    return response.data;
  }

  /**
   * Get market by slug
   */
  async getMarketBySlug(slug: string): Promise<Market> {
    const response = await this.client.get(`/markets`, {
      params: { slug },
    });
    return response.data[0];
  }
}