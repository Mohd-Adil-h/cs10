import rateLimit from 'express-rate-limit';

/**
 * Creates an Express rate limiter.
 * This centralized factory allows easily swapping the storage provider
 * (e.g. from the default MemoryStore to RedisStore or MongoStore)
 * for horizontal scalability when deployed to multiple nodes.
 *
 * @param {Object} options - Limiter configuration options
 * @param {number} options.windowMs - Time window in milliseconds (default: 1 min)
 * @param {number} options.max - Maximum requests per window (default: 10)
 * @param {string} options.message - User-facing error message upon limit breach
 * @returns {Function} Express middleware rate limiter
 */
export const createRateLimiter = ({
  windowMs = 60 * 1000,
  max = 10,
  message = 'Too many requests. Please wait a moment before trying again.',
} = {}) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    // For horizontal clustering, replace/extend options with:
    // store: new RedisStore({ client: redisClient }),
  });
};
