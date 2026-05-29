import faqService from '../services/faqService.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Controller handling user-facing FAQ queries.
 */
class FAQController {
  /**
   * Retrieves all FAQs, with optional category/search filters, grouped by section.
   */
  listFaqs = catchAsync(async (req, res) => {
    const { section, search } = req.query;
    const result = await faqService.listFaqs({ section, search });
    res.json(result);
  });

  /**
   * Retrieves FAQ sections count metadata.
   */
  listSections = catchAsync(async (req, res) => {
    const result = await faqService.listSections();
    res.json(result);
  });
}

export default new FAQController();
