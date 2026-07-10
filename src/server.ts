// server.ts (Complete Vercel Compatible)
import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function connectDB(): Promise<void> {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      logger.warn('⚠️ MONGODB_URI is not defined');
      return;
    }

    await mongoose.connect(mongoURI);
    logger.info('✅ MongoDB connected successfully');
    logger.info(`📊 Database: ${mongoose.connection.name}`);
  } catch (error: any) {
    logger.error('❌ MongoDB connection failed:', error.message);
  }
}

// ✅ For Vercel - Connect and export
if (process.env.VERCEL) {
  logger.info('🚀 Running on Vercel');
  connectDB();
  module.exports = app;
} else {
  // ✅ For local development
  async function startServer(): Promise<void> {
    try {
      await connectDB();
      
      const server = app.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`);
        logger.info(`📍 http://localhost:${PORT}`);
      });

      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`❌ Port ${PORT} is already in use!`);
          process.exit(1);
        }
        logger.error('❌ Server error:', error);
        process.exit(1);
      });

      const gracefulShutdown = async () => {
        logger.info('🔄 Shutting down gracefully...');
        await mongoose.disconnect();
        logger.info('✅ MongoDB disconnected');
        server.close(() => {
          logger.info('✅ Server closed');
          process.exit(0);
        });
      };

      process.on('SIGTERM', gracefulShutdown);
      process.on('SIGINT', gracefulShutdown);

    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  startServer();
}

export default app;