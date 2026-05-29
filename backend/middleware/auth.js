/**
 * JWT Authentication Middleware
 * Verifies Bearer tokens and attaches user to request.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware: Requires valid JWT token.
 * Attaches the full User document to req.user.
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password_hash');
    if (!user) {
      return res.status(401).json({ error: 'User not found. Token may be expired.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(500).json({ error: 'Authentication error.' });
  }
}

/**
 * Middleware: Requires admin role.
 * Must be used AFTER authMiddleware.
 */
export function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}
