import questionService from '../services/questionService.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Controller mapping all community question postings, listings, detail lookups, and voting.
 */
class QuestionController {
  /**
   * Rephrases and categorizes user search query prior to community posting.
   */
  prepareQuestion = catchAsync(async (req, res) => {
    const { query } = req.body;
    const result = await questionService.prepare(query);
    res.json(result);
  });

  /**
   * Submits a community question (checks for semantic duplicates).
   */
  submitQuestion = catchAsync(async (req, res) => {
    const { original_query, rephrased_query, category } = req.body;
    const userId = req.user._id;

    const result = await questionService.submit({
      original_query,
      rephrased_query,
      category,
      userId,
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.json(result);
    }
  });

  /**
   * Lists all community questions using query filter & sorting parameters.
   */
  listQuestions = catchAsync(async (req, res) => {
    const { category, status, page, sort, limit } = req.query;
    const result = await questionService.list({
      category,
      status,
      page,
      sort,
      limit,
    });
    res.json(result);
  });

  /**
   * Retrieves detail information for a single question along with its replies.
   */
  getQuestion = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await questionService.get(id);
    res.json(result);
  });

  /**
   * Records a user's vote on a community question.
   */
  voteQuestion = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;
    const userId = req.user._id;

    const result = await questionService.vote({ id, type, userId });
    res.json(result);
  });
}

export default new QuestionController();
