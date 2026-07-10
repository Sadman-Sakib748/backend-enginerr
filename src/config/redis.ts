// config/redis.ts (FIXED - TypeScript Error Resolved)
import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType | null = null;
let isRedisAvailable = false;

export const getRedisClient = (): RedisClientType | null => {
    if (redisClient) {
        return redisClient;
    }

    try {
        const host = process.env.REDIS_HOST;
        const port = parseInt(process.env.REDIS_PORT || '6379');
        const password = process.env.REDIS_PASSWORD;
        const user = process.env.REDIS_USER || 'default';

        if (!host) {
            logger.warn('⚠️ REDIS_HOST not configured. Redis disabled.');
            return null;
        }

        // Use redis:// for local development (no SSL)
        const url = password 
            ? `redis://${user}:${password}@${host}:${port}`
            : `redis://${host}:${port}`;

        // ✅ Fixed: Removed 'rejectUnauthorized' from socket options
        redisClient = createClient({
            url,
            socket: {
                connectTimeout: 10000,
                // tls: false,  // ✅ Remove this line for local Redis
            }
        });

        redisClient.on('error', (err) => {
            logger.error('❌ Redis Error:', err.message);
            isRedisAvailable = false;
        });

        redisClient.on('connect', () => {
            logger.info('✅ Redis connected');
            isRedisAvailable = true;
        });

        redisClient.on('ready', () => {
            logger.info('✅ Redis ready');
            isRedisAvailable = true;
        });

        redisClient.on('end', () => {
            logger.warn('⚠️ Redis disconnected');
            isRedisAvailable = false;
        });

        return redisClient;
        
    } catch (error: any) {
        logger.error('❌ Redis client creation failed:', error.message);
        return null;
    }
};

export const connectRedis = async (): Promise<void> => {
    try {
        const client = getRedisClient();
        if (!client) {
            logger.warn('⚠️ Redis client not available');
            return;
        }

        logger.info('🔄 Connecting to Redis...');
        await client.connect();
        logger.info('✅ Redis connected successfully!');
        
    } catch (error: any) {
        logger.error('❌ Redis connection failed:', error.message);
        logger.warn('   💡 Redis is optional. App will continue without Redis.');
        isRedisAvailable = false;
        redisClient = null;
    }
};

export const disconnectRedis = async (): Promise<void> => {
    if (redisClient && isRedisAvailable) {
        try {
            await redisClient.quit();
            logger.info('✅ Redis disconnected');
            redisClient = null;
            isRedisAvailable = false;
        } catch (error) {
            logger.error('❌ Error disconnecting Redis:', error);
        }
    }
};

export const isRedisReady = (): boolean => {
    return isRedisAvailable && redisClient !== null;
};