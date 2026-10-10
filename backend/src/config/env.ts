import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/floraquest'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('super-secret-floraquest-jwt-key-32chars!'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  COOKIE_SECRET: z.string().default('flora-cookie-secret-key-12345'),
  AI_SERVICE_URL: z.string().default('http://localhost:8000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  // In development, provide fallback defaults to avoid immediate crash
  if (process.env.NODE_ENV === 'test') {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';
  }
}

export const env = parsed.success
  ? parsed.data
  : {
      PORT: process.env.PORT || '5000',
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/floraquest',
      JWT_SECRET: process.env.JWT_SECRET || 'super-secret-floraquest-jwt-key-32chars!',
      CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      COOKIE_SECRET: process.env.COOKIE_SECRET || 'flora-cookie-secret-key-12345',
      AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    };
