/**
 * Centralized global Express error handler middleware.
 * Formats errors and returns them uniformly to the client.
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log detailed error stack on server
  console.error('🔥 Global Error Handler caught:', err);

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Production response (do not leak stack details)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Handle Mongoose cast errors (invalid ObjectIds)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: `Invalid value for field: ${err.path}`,
    });
  }

  // Handle duplicate key errors (code 11000)
  if (err.code === 11000) {
    const keys = Object.keys(err.keyValue || {});
    return res.status(409).json({
      error: `Duplicate entry for field: ${keys.join(', ')}. Please use another value.`,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(el => el.message);
    return res.status(400).json({
      error: `Validation error: ${messages.join('. ')}`,
    });
  }

  // Default fallback for generic/unknown errors
  res.status(500).json({
    error: 'Something went wrong on the server. Please try again later.',
  });
};

export default errorHandler;
