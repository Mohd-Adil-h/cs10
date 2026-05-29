/**
 * Wraps async Express handlers to catch unhandled exceptions
 * and pass them to the global error middleware, avoiding try/catch boilerplate.
 *
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware function
 */
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
