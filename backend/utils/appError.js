/**
 * Custom application error class.
 * Inherits from standard JavaScript Error to support status codes
 * and operational flags.
 */
class AppError extends Error {
  /**
   * @param {string} message - The error description message
   * @param {number} statusCode - HTTP status code (e.g. 400, 404, 500)
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
