
import { PrismaClient } from '@prisma/client';

export class DatabaseService {
  private prisma: PrismaClient;
  private static instance: DatabaseService;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
    console.log('✅ Database connected');
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    console.log('✅ Database disconnected');
  }

  // Tracked Accounts
  async addTrackedAccount(address: string, nickname?: string) {
    return this.prisma.trackedAccount.create({
      data: { address, nickname },
    });
  }

  async getTrackedAccounts(activeOnly = true) {
    return this.prisma.trackedAccount.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        positions: {
          where: { status: 'OPEN' },
        },
      },
    });
  }

  async updateAccountStats(
    accountId: string,
    stats: {
      totalPnL?: number;
      winRate?: number;
      totalTrades?: number;
    }
  ) {
    return this.prisma.trackedAccount.update({
      where: { id: accountId },
      data: stats,
    });
  }

  // Positions
  async createPosition(data: {
    accountId: string;
    tokenId: string;
    marketId?: string;
    marketSlug?: string;
    marketQuestion?: string;
    side: string;
    outcome: string;
    entryPrice: number;
    currentPrice: number;
    quantity: number;
  }) {
    return this.prisma.position.create({ data });
  }

  async updatePosition(
    positionId: string,
    data: {
      currentPrice?: number;
      quantity?: number;
      realizedPnL?: number;
      unrealizedPnL?: number;
      totalPnL?: number;
      status?: string;
      closedAt?: Date;
    }
  ) {
    return this.prisma.position.update({
      where: { id: positionId },
      data,
    });
  }

  async getOpenPositions(accountId?: string) {
    return this.prisma.position.findMany({
      where: {
        status: 'OPEN',
        ...(accountId && { accountId }),
      },
      include: {
        account: true,
        trades: true,
      },
    });
  }

  async getPositionsByTokenId(tokenId: string) {
    return this.prisma.position.findMany({
      where: { tokenId, status: 'OPEN' },
      include: { account: true },
    });
  }

  // Trades
  async createTrade(data: {
    accountId: string;
    positionId?: string;
    tokenId: string;
    marketId?: string;
    side: string;
    outcome: string;
    price: number;
    size: number;
    value: number;
    tradeType: string;
    transactionHash?: string;
    blockNumber?: number;
    timestamp: Date;
  }) {
    return this.prisma.trade.create({ data });
  }

  async getTrades(params: {
    accountId?: string;
    tokenId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    return this.prisma.trade.findMany({
      where: {
        ...(params.accountId && { accountId: params.accountId }),
        ...(params.tokenId && { tokenId: params.tokenId }),
        ...(params.startDate && {
          timestamp: { gte: params.startDate },
        }),
        ...(params.endDate && {
          timestamp: { lte: params.endDate },
        }),
      },
      orderBy: { timestamp: 'desc' },
      take: params.limit || 100,
      include: {
        account: true,
        position: true,
      },
    });
  }

  // Markets
  async upsertMarket(data: {
    id: string;
    conditionId: string;
    questionId: string;
    question: string;
    description?: string;
    endDate?: Date;
    yesTokenId: string;
    noTokenId: string;
    volume?: number;
    liquidity?: number;
  }) {
    return this.prisma.market.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  async getMarket(id: string) {
    return this.prisma.market.findUnique({ where: { id } });
  }

  // Sync State
  async updateSyncState(accountAddress: string, blockNumber: number) {
    return this.prisma.syncState.upsert({
      where: { accountAddress },
      update: {
        lastSyncedBlock: blockNumber,
        lastSyncedTime: new Date(),
      },
      create: {
        accountAddress,
        lastSyncedBlock: blockNumber,
        lastSyncedTime: new Date(),
      },
    });
  }

  async getSyncState(accountAddress: string) {
    return this.prisma.syncState.findUnique({
      where: { accountAddress },
    });
  }

  get client() {
    return this.prisma;
  }
}