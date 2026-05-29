/**
 * Answer routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import answerController from '../controllers/answerController.js';

const router = Router();

/**
 * Submit an answer with AI relevance/ethics check
 */
router.post('/submit', authMiddleware, answerController.submitAnswer);

/**
 * Vote on an answer (triggers Phase 5 promotion at score >= 5)
 */
router.post('/:id/vote', authMiddleware, answerController.voteAnswer);

export default router;
