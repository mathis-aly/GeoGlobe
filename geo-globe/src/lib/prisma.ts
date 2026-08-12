// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// On passe directement l'URL de configuration à l'adaptateur, 
// sans avoir besoin d'instancier le client LibSQL manuellement.
const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// On injecte l'adaptateur LibSQL dans Prisma
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;