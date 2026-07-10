// services/cache/CacheService.ts
import { getRedisClient } from '../../config/redis';
import { logger } from '../../utils/logger';
import { RedisClientType } from 'redis';

export class CacheService {
  private isConnected: boolean = false;
  private client: RedisClientType | null = null;

  constructor() {
    this.client = getRedisClient();
    
    if (this.client) {
      this.client.on('ready', () => {
        this.isConnected = true;
        logger.info('Redis cache service ready');
      });
      
      this.client.on('error', (error) => {
        this.isConnected = false;
        logger.error('Redis cache service error:', error);
      });
      
      this.client.on('end', () => {
        this.isConnected = false;
        logger.warn('Redis cache service disconnected');
      });
    } else {
      logger.warn('Redis client not available');
    }
  }

  private async getClient(): Promise<RedisClientType | null> {
    if (!this.client) {
      this.client = getRedisClient();
      if (!this.client) {
        logger.error('Failed to get Redis client');
        return null;
      }
    }

    if (!this.isConnected) {
      try {
        await this.client.connect();
        this.isConnected = true;
        logger.info('Redis client connected');
      } catch (error) {
        logger.error('Redis connection failed:', error);
        this.isConnected = false;
        return null;
      }
    }

    return this.client;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      if (!client || !this.isConnected) {
        logger.warn(`Redis not available for GET: ${key}`);
        return null;
      }
      
      const data = await client.get(key);
      if (!data) return null;
      
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client || !this.isConnected) {
        logger.warn(`Redis not available for SET: ${key}`);
        return false;
      }
      
      const serialized = JSON.stringify(value);
      if (ttl) {
        await client.setEx(key, ttl, serialized);
      } else {
        await client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client || !this.isConnected) {
        logger.warn(`Redis not available for DEL: ${key}`);
        return false;
      }
      await client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client || !this.isConnected) {
        logger.warn(`Redis not available for EXISTS: ${key}`);
        return false;
      }
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async flushAll(): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client || !this.isConnected) {
        logger.warn('Redis not available for FLUSHALL');
        return false;
      }
      await client.flushAll();
      logger.info('Cache flushed all');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  async ping(): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client || !this.isConnected) {
        return false;
      }
      const response = await client.ping();
      return response === 'PONG';
    } catch (error) {
      logger.error('Redis ping error:', error);
      return false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}