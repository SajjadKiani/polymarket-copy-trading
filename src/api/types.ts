export interface Market {
  id: string;
  condition_id: string;
  question_id: string;
  question: string;
  description?: string;
  end_date_iso?: string;
  tokens: Array<{
    token_id: string;
    outcome: string;
    price: string;
  }>;
  volume?: string;
  liquidity?: string;
  closed?: boolean;
  resolved?: boolean;
  winner?: string;
}

export interface Trade {
  id: string;
  market: string;
  asset_id: string;
  maker_address: string;
  taker_address?: string;
  side: 'BUY' | 'SELL';
  size: string;
  price: string;
  status: string;
  timestamp: number;
  transaction_hash?: string;
  bucket_index?: number;
}

export interface Position {
  asset_id: string;
  market_id?: string;
  side: 'BUY' | 'SELL';
  size: string;
  value?: string;
}

export interface OrderBookLevel {
  price: string;
  size: string;
}

export interface OrderBook {
  market: string;
  asset_id: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

export interface UserActivity {
  id: string;
  type: 'TRADE' | 'SPLIT' | 'MERGE' | 'REDEEM';
  asset_id: string;
  market_id?: string;
  size?: string;
  price?: string;
  timestamp: number;
}