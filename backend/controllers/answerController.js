import answerService from '../services/answerService.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Controller mapping all community answer postings and voting operations.
 */
class AnswerController {
  /**
   * Submits an answer to a question (includes automatic safety checks).
   */
  submitAnswer = catchAsync(async (req, res) => {
    const { question_id, content } = req.body;
    const userId = req.user._id;

    const result = await answerService.submit({
      question_id,
      content,
      userId,
    });

    res.status(201).json(result);
  });

  /**
   * Records a user's vote on an answer (may trigger automatic FAQ promotions).
   */
  voteAnswer = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;
    const userId = req.user._id;

    const result = await answerService.vote({ id, type, userId });
    res.json(result);
  });
}

export default new AnswerController();
