
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // API Endpoints
  CLOB_API_URL: process.env.CLOB_API_URL || 'https://clob.polymarket.com',
  GAMMA_API_URL: process.env.GAMMA_API_URL || 'https://gamma-api.polymarket.com',
  DATA_API_URL: process.env.DATA_API_URL || 'https://data-api.polymarket.com',

  // Network
  CHAIN_ID: 137, // Polygon Mainnet

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/dev.db',

  // Tracking Settings
  POLL_INTERVAL_MS: parseInt(process.env.POLL_INTERVAL_MS || '60000'), // 1 minute
  MAX_HISTORICAL_DAYS: parseInt(process.env.MAX_HISTORICAL_DAYS || '30'),

  // Tracked Accounts (comma-separated addresses)
  TRACKED_ACCOUNTS: process.env.TRACKED_ACCOUNTS?.split(',').map(a => a.trim()) || [],
};