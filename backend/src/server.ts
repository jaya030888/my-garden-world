import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { seed } from './lib/seed.js';

const PORT = parseInt(env.PORT, 10) || 5000;

async function startServer() {
  // Check database connection gracefully
  console.log('[Server] Connecting to PostgreSQL database...');
  try {
    await prisma.$connect();
    console.log('✅ [Server] Connected to PostgreSQL database successfully.');

    // Auto-seed default catalog and quests if empty
    try {
      const shopItemCount = await prisma.shopItem.count();
      if (shopItemCount === 0) {
        console.log('[Server] Database is unseeded. Running seed script...');
        await seed(prisma);
      }
    } catch (seedErr: any) {
      console.warn('[Server] Seed check notice:', seedErr.message);
    }
  } catch (dbErr: any) {
    console.warn('⚠️ [Server] PostgreSQL database is not connected locally:', dbErr.message);
    console.log('💡 [Server] Set your live Neon PostgreSQL DATABASE_URL in server/.env to enable cloud persistence.');
  }

  const server = app.listen(PORT, () => {
    console.log(`🌿 [FloraQuest Backend] Server is running on port ${PORT}`);
    console.log(`🚀 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        await prisma.$disconnect();
        console.log('[Server] Database connection closed.');
      } catch {}
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();
