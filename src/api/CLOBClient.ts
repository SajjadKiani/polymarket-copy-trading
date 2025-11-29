import axios, { AxiosInstance } from 'axios';
import { OrderBook, Trade } from './types';

export class CLOBClient {
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
   * Get the current order book for a specific token
   */
  async getOrderBook(tokenId: string): Promise<OrderBook> {
    const response = await this.client.get(`/book`, {
      params: { token_id: tokenId },
    });
    return response.data;
  }

  /**
   * Get multiple order books at once
   */
  async getOrderBooks(tokenIds: string[]): Promise<OrderBook[]> {
    const response = await this.client.get(`/books`, {
      params: { token_ids: tokenIds.join(',') },
    });
    return response.data;
  }

  /**
   * Get the midpoint price for a token
   */
  async getMidpoint(tokenId: string): Promise<number> {
    const response = await this.client.get(`/midpoint`, {
      params: { token_id: tokenId },
    });
    return parseFloat(response.data.mid);
  }

  /**
   * Get the current price for a token on a specific side
   */
  async getPrice(tokenId: string, side: 'BUY' | 'SELL'): Promise<number> {
    const response = await this.client.get(`/price`, {
      params: { token_id: tokenId, side },
    });
    return parseFloat(response.data.price);
  }

  /**
   * Get recent trades for a token
   */
  async getTrades(params: {
    token_id?: string;
    maker_address?: string;
    limit?: number;
  }): Promise<Trade[]> {
    const response = await this.client.get(`/trades`, { params });
    return response.data;
  }

  /**
   * Get CLOB server status
   */
  async getStatus(): Promise<any> {
    const response = await this.client.get(`/status`);
    return response.data;
  }
}