import 'server-only';

import { PrismaClient } from './generated/client';

// For global caching of the Prisma client instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a new PrismaClient instance that connects to Supabase
// No adapter needed as Prisma will connect directly to PostgreSQL
export const database = globalForPrisma.prisma || new PrismaClient();

// Prevent multiple instances of Prisma Client in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = database;
}

export * from './generated/client';
