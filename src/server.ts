// server.ts
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
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(mongoURI);
    logger.info('✅ MongoDB connected successfully');
    logger.info(`📊 Database: ${mongoose.connection.name}`);
  } catch (error: any) {
    logger.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function startServer(): Promise<void> {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use!`);
        process.exit(1);
      }
      logger.error('❌ Server error:', error);
      process.exit(1);
    });

    // Graceful shutdown
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

export default app;