/**
 * Yaksha AI search route
 */

import { Router } from 'express';
import { createRateLimiter } from '../config/rateLimiter.js';
import searchController from '../controllers/searchController.js';

const router = Router();

const searchRateLimit = createRateLimiter({
  max: 10,
});

/**
 * Full Yaksha search pipeline
 */
router.post('/ask', searchRateLimit, searchController.ask);

export default router;
