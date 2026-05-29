/**
 * Auth routes: register + login
 */

import { Router } from 'express';
import authController from '../controllers/authController.js';

const router = Router();

/**
 * POST /api/auth/register
 * Create a new user account
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Authenticate and return JWT
 */
router.post('/login', authController.login);

export default router;
