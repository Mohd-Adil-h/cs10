import { classifyQuery } from '../services/groq.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

/**
 * Controller handling real-time user query validation.
 */
class QueryController {
  /**
   * Validates a user query for length, abusive language, gibberish, or relevance to the event.
   */
  validateQuery = catchAsync(async (req, res) => {
    let { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        valid: false,
        reason: 'Please provide a query.',
        cleaned_query: null,
      });
    }

    // Normalize whitespaces and strip any HTML tags
    query = query.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    // Enforce size boundaries prior to invoking external APIs
    if (query.length < 8 || query.length > 500) {
      return res.json({
        valid: false,
        reason: 'Query must be between 8 and 500 characters.',
        cleaned_query: null,
      });
    }

    try {
      const { classification, reason, cleaned_query } = await classifyQuery(query);

      const rejectionMessages = {
        ABUSIVE: 'Please keep questions respectful and appropriate.',
        GIBBERISH: "Your query doesn't look like a question. Please describe what you need help with.",
        OFF_TOPIC: "This doesn't seem related to Samagama. Please ask about the event.",
      };

      if (classification !== 'VALID') {
        return res.json({
          valid: false,
          reason: rejectionMessages[classification] || reason,
          cleaned_query: null,
        });
      }

      res.json({
        valid: true,
        reason: null,
        cleaned_query: cleaned_query || query,
      });
    } catch (error) {
      console.error('Query validation error:', error);
      // Fallback: don't block user if LLM service is temporarily down
      res.json({
        valid: true,
        reason: null,
        cleaned_query: req.body.query,
      });
    }
  });
}

export default new QueryController();
