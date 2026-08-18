import config from './index.js';
import logger from '../utils/logger.js';

/**
 * Dynamic import of the redis package.
 * Returns null if the package is not installed.
 */
const loadRedis = async () => {
  try {
    const { createClient } = await import('redis');
    return createClient;
  } catch {
    logger.info('ℹ️  Redis package not installed — running without Redis');
    return null;
  }
};

/**
 * Redis client singleton.
 *
 * Redis is OPTIONAL — the application works fully without it.
 * When available, it can be used for:
 *   - Response caching
 *   - Session storage
 *   - Rate limit storage
 *   - Pub/Sub events
 *
 * If REDIS_URL is not set or Redis is unreachable, all operations
 * return null/false gracefully (no-op pattern).
 */

let redisClient = null;
let isConnected = false;

/**
 * Initializes the Redis client connection.
 * Fails silently — app continues without Redis.
 *
 * @returns {Promise<object|null>} Redis client or null
 */
export const connectRedis = async () => {
  const redisUrl = config.redis?.url;

  if (!redisUrl) {
    logger.info('ℹ️  Redis URL not configured — running without Redis (optional)');
    return null;
  }

  const createClient = await loadRedis();
  if (!createClient) return null;

  try {
    redisClient = createClient({ url: redisUrl });

    redisClient.on('error', (err) => {
      logger.warn(`⚠️  Redis error: ${err.message}`);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('🔴 Redis connected');
      isConnected = true;
    });

    redisClient.on('reconnecting', () => {
      logger.info('⏳ Redis reconnecting...');
    });

    redisClient.on('end', () => {
      logger.info('⚠️  Redis disconnected');
      isConnected = false;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.warn(`⚠️  Redis connection failed: ${error.message} — running without Redis`);
    redisClient = null;
    isConnected = false;
    return null;
  }
};

/**
 * Disconnects the Redis client gracefully.
 */
export const disconnectRedis = async () => {
  if (redisClient && isConnected) {
    await redisClient.quit();
    logger.info('🔴 Redis disconnected gracefully');
  }
};

/**
 * Gets a value from Redis cache.
 *
 * @param {string} key - Cache key
 * @returns {Promise<string|null>} Cached value or null
 */
export const getCache = async (key) => {
  if (!redisClient || !isConnected) return null;

  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.warn(`Redis GET error for key "${key}": ${error.message}`);
    return null;
  }
};

/**
 * Sets a value in Redis cache with optional TTL.
 *
 * @param {string} key - Cache key
 * @param {string} value - Value to cache (must be a string — serialize with JSON.stringify)
 * @param {number} [ttlSeconds=300] - Time-to-live in seconds (default: 5 min)
 * @returns {Promise<boolean>} Whether the set was successful
 */
export const setCache = async (key, value, ttlSeconds = 300) => {
  if (!redisClient || !isConnected) return false;

  try {
    await redisClient.set(key, value, { EX: ttlSeconds });
    return true;
  } catch (error) {
    logger.warn(`Redis SET error for key "${key}": ${error.message}`);
    return false;
  }
};

/**
 * Deletes a key from Redis cache.
 *
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
export const deleteCache = async (key) => {
  if (!redisClient || !isConnected) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.warn(`Redis DEL error for key "${key}": ${error.message}`);
    return false;
  }
};

/**
 * Deletes all keys matching a pattern (e.g., 'settings:*').
 *
 * @param {string} pattern - Redis key pattern
 * @returns {Promise<number>} Number of keys deleted
 */
export const deleteCachePattern = async (pattern) => {
  if (!redisClient || !isConnected) return 0;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) return 0;
    return await redisClient.del(keys);
  } catch (error) {
    logger.warn(`Redis DEL pattern error for "${pattern}": ${error.message}`);
    return 0;
  }
};

/**
 * Returns whether Redis is currently connected.
 *
 * @returns {boolean}
 */
export const isRedisConnected = () => isConnected;

export default {
  connectRedis,
  disconnectRedis,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  isRedisConnected,
};
