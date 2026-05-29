/**
 * Query validation route
 */

import { Router } from 'express';
import { createRateLimiter } from '../config/rateLimiter.js';
import queryController from '../controllers/queryController.js';

const router = Router();

const queryRateLimit = createRateLimiter({
  max: 10,
});

/**
 * Validate and classify a user query
 */
router.post('/validate', queryRateLimit, queryController.validateQuery);

export default router;
