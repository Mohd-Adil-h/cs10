import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import categoryController from '../controllers/categoryController.js';

const router = Router();

// Public: list all categories (tree view)
router.get('/', categoryController.getCategories);

// Public: get single category with context (breadcrumb, children, FAQ count)
router.get('/:id', categoryController.getCategory);

// Public: get FAQs in a category subtree
router.get('/:path/faqs', categoryController.getFaqsInSubtree);

// Admin-only: create category
router.post('/', authMiddleware, adminMiddleware, categoryController.createCategory);

// Admin-only: update category
router.put('/:id', authMiddleware, adminMiddleware, categoryController.updateCategory);

// Admin-only: delete category
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

// Admin-only: migrate flat categories to tree
router.post('/migrate-to-tree', authMiddleware, adminMiddleware, categoryController.migrateToTree);

export default router;