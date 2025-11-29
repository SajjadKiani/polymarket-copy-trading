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
  id?: string; // Not always present in new API
  conditionId?: string; // Was market
  asset: string; // Was asset_id
  maker_address?: string;
  taker_address?: string;
  side: 'BUY' | 'SELL';
  size: string | number; // API returns number, but keeping flexibility
  price: string | number; // API returns number
  status?: string;
  timestamp: number;
  transactionHash?: string; // Was transaction_hash
  bucket_index?: number;
}

export interface Position {
  asset: string; // Was asset_id
  conditionId?: string; // Was market_id
  side?: 'BUY' | 'SELL';
  outcome?: string;
  size: string | number; // API returns number
  avgPrice?: number;
  curPrice?: number;
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