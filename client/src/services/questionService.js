import apiClient from './apiClient';

/**
 * Frontend Service managing community Q&As, comments/answers, and voting.
 */
class QuestionService {
  /**
   * Prepares a question by rephrasing and categorizing.
   */
  async prepareQuestion(query) {
    const response = await apiClient.post('/questions/prepare', { query });
    return response.data;
  }

  /**
   * Posts a new community question.
   */
  async submitQuestion({ original_query, rephrased_query, category }) {
    const response = await apiClient.post('/questions/submit', {
      original_query,
      rephrased_query,
      category,
    });
    return response.data;
  }

  /**
   * Fetches paginated community questions.
   */
  async listQuestions({ category, status, page, sort, limit } = {}) {
    const response = await apiClient.get('/questions', {
      params: { category, status, page, sort, limit },
    });
    return response.data;
  }

  /**
   * Fetches a question details with its associated answers.
   */
  async getQuestion(id) {
    const response = await apiClient.get(`/questions/${id}`);
    return response.data;
  }

  /**
   * Registers a vote on a community question.
   */
  async voteQuestion(id, type) {
    const response = await apiClient.post(`/questions/${id}/vote`, { type });
    return response.data;
  }

  /**
   * Submits an answer to a community question.
   */
  async submitAnswer({ question_id, content }) {
    const response = await apiClient.post('/answers/submit', { question_id, content });
    return response.data;
  }

  /**
   * Registers a vote on an answer.
   */
  async voteAnswer(id, type) {
    const response = await apiClient.post(`/answers/${id}/vote`, { type });
    return response.data;
  }
}

export default new QuestionService();
