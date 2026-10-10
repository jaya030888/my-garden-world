import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import plantRoutes from './routes/plantRoutes.js';
import discoveryRoutes from './routes/discoveryRoutes.js';
import questRoutes from './routes/questRoutes.js';
import observationRoutes from './routes/observationRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import gardenRoutes from './routes/gardenRoutes.js';
import dataRoutes from './routes/dataRoutes.js';

export const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Dynamic CORS configuration
const allowedOrigins = [
  env.CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:4173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '15mb' })); // Support base64 image uploads if needed
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Welcome & API Directory Endpoints
const apiDirectory = (req: any, res: any) => {
  res.status(200).json({
    name: 'FloraQuest / My Garden World REST API',
    version: '1.0.0',
    status: 'operational',
    documentation: '/api/docs',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
      },
      plants: {
        list: 'GET /api/plants',
        create: 'POST /api/plants',
        care: 'POST /api/plants/:id/care',
        growth: 'POST /api/plants/:id/growth',
      },
      discoveries: {
        list: 'GET /api/discoveries',
        save: 'POST /api/discoveries',
        identify: 'POST /api/discoveries/identify',
      },
      quests: {
        list: 'GET /api/quests',
        claim: 'POST /api/quests/:id/claim',
      },
      shop: {
        catalog: 'GET /api/shop/items',
        buy: 'POST /api/shop/buy',
      },
      garden: {
        layout: 'GET /api/garden/layout',
        place: 'POST /api/garden/place',
      },
      data: {
        profile: 'GET /api/data/profile',
        export: 'GET /api/data/export',
        import: 'POST /api/data/import',
      },
    },
  });
};

app.get('/', apiDirectory);
app.get('/api', apiDirectory);

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: env.NODE_ENV,
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'unhealthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message,
    });
  }
});

// Apply API rate limiting
app.use('/api', apiLimiter);

// API Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/discoveries', discoveryRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/observations', observationRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/garden', gardenRoutes);
app.use('/api/data', dataRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Error handling middleware
app.use(errorHandler);
