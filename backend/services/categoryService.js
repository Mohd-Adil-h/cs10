import FAQCategory from '../models/FAQCategory.js';
import FAQ from '../models/FAQ.js';
import { getEmbedding } from './embeddingService.js';
import AppError from '../utils/appError.js';

/**
 * Service managing FAQ category tree operations.
 */
class CategoryService {
  /**
   * Get the full category tree (root categories with children nested).
   *
   * @returns {Promise<{tree: Array, flat: Array}>}
   */
  async getTree() {
    const categories = await FAQCategory.find()
      .sort({ path: 1 })
      .lean();

    const flat = categories.map(c => ({
      _id: c._id,
      path: c.path,
      label: c.label,
      description: c.description,
      parent: c.parent,
      depth: (c.path.match(/\./g) || []).length,
    }));

    const tree = this._buildTree(flat);
    return { tree, flat };
  }

  /**
   * Build nested tree from flat list using parent references.
   */
  _buildTree(flat) {
    const map = new Map();
    const roots = [];

    for (const cat of flat) {
      map.set(cat._id.toString(), { ...cat, children: [] });
    }

    for (const cat of flat) {
      const node = map.get(cat._id.toString());
      if (cat.parent) {
        const parentNode = map.get(cat.parent.toString());
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Get a single category with its ancestors (breadcrumb) and direct children.
   *
   * @param {string} categoryId - Category ObjectId
   * @returns {Promise<Object>} Category with breadcrumb, children, faqCount
   */
  async getCategoryWithContext(categoryId) {
    const category = await FAQCategory.findById(categoryId).lean();
    if (!category) throw new AppError('Category not found.', 404);

    // Build breadcrumb
    const breadcrumb = [];
    let current = category;
    while (current) {
      breadcrumb.unshift({ _id: current._id, path: current.path, label: current.label });
      if (current.parent) {
        current = await FAQCategory.findById(current.parent).lean();
      } else {
        break;
      }
    }

    // Get children
    const children = await FAQCategory.find({ parent: categoryId })
      .select('path label description')
      .sort({ label: 1 })
      .lean();

    // Count FAQs in this category subtree
    const subtreePaths = await this._getSubtreePaths(category.path);
    const faqCount = await FAQ.countDocuments({ category_path: { $in: subtreePaths } });

    return {
      _id: category._id,
      path: category.path,
      label: category.label,
      description: category.description,
      parent: category.parent,
      breadcrumb,
      children,
      faqCount,
    };
  }

  /**
   * Get all category paths that belong to the subtree of a given path.
   * e.g., for 'root.about' returns ['root.about', 'root.about.contact', ...]
   */
  async _getSubtreePaths(parentPath) {
    const categories = await FAQCategory.find({
      path: { $regex: `^${parentPath}(\\.|$)` }
    }).select('path').lean();
    return categories.map(c => c.path);
  }

  /**
   * Create a new category.
   *
   * @param {Object} data - Category data
   * @param {string} data.label - Human-readable label
   * @param {string} data.description - Optional description
   * @param {string} [data.parentId] - Optional parent category ObjectId
   * @param {string} [data.path] - Optional explicit path (for root categories)
   */
  async createCategory({ label, description, parentId, path }) {
    if (!label) throw new AppError('label is required.', 400);

    let parent = null;
    let fullPath = path || label.toLowerCase().replace(/\s+/g, '_');

    if (parentId) {
      parent = await FAQCategory.findById(parentId);
      if (!parent) throw new AppError('Parent category not found.', 404);
      fullPath = `${parent.path}.${label.toLowerCase().replace(/\s+/g, '_')}`;
    } else if (!path) {
      fullPath = `root.${label.toLowerCase().replace(/\s+/g, '_')}`;
    }

    const existing = await FAQCategory.findOne({ path: fullPath });
    if (existing) throw new AppError(`Category path "${fullPath}" already exists.`, 409);

    let embedding;
    try {
      embedding = await getEmbedding(label);
    } catch (e) {
      embedding = new Array(384).fill(0.0);
    }

    const category = await FAQCategory.create({
      label: label.trim(),
      description: description?.trim() || '',
      path: fullPath,
      parent: parentId || null,
      embedding,
    });

    return { success: true, category, message: 'Category created.' };
  }

  /**
   * Update a category (label, description, parent).
   * Also updates all child paths if the path changes.
   */
  async updateCategory(categoryId, { label, description, parentId }) {
    const category = await FAQCategory.findById(categoryId);
    if (!category) throw new AppError('Category not found.', 404);

    if (label) {
      const newLabel = label.trim();
      let newPath = category.path;

      if (parentId !== undefined) {
        if (parentId) {
          const newParent = await FAQCategory.findById(parentId);
          if (!newParent) throw new AppError('Parent category not found.', 404);
          if (parentId.toString() === categoryId) throw new AppError('Category cannot be its own parent.', 400);

          const labelSlug = newLabel.toLowerCase().replace(/\s+/g, '_');
          newPath = `${newParent.path}.${labelSlug}`;
        } else {
          const labelSlug = newLabel.toLowerCase().replace(/\s+/g, '_');
          newPath = `root.${labelSlug}`;
        }
      } else {
        const pathParts = category.path.split('.');
        const labelSlug = newLabel.toLowerCase().replace(/\s+/g, '_');
        pathParts[pathParts.length - 1] = labelSlug;
        newPath = pathParts.join('.');
      }

      const existing = await FAQCategory.findOne({ path: newPath, _id: { $ne: categoryId } });
      if (existing) throw new AppError(`Category path "${newPath}" already exists.`, 409);

      const oldPath = category.path;

      if (oldPath !== newPath) {
        category.path = newPath;
        category.label = newLabel;

        const children = await FAQCategory.find({ path: { $regex: `^${oldPath}\\.` } });
        for (const child of children) {
          child.path = child.path.replace(oldPath, newPath);
          await child.save();
        }

        const faqs = await FAQ.find({ category_path: { $regex: `^${oldPath}\\.` } });
        for (const faq of faqs) {
          faq.category_path = faq.category_path.replace(oldPath, newPath);
          await faq.save();
        }
      }
    }

    if (description !== undefined) category.description = description.trim();
    if (parentId !== undefined) category.parent = parentId || null;

    await category.save();

    return { success: true, message: 'Category updated.', category };
  }

  /**
   * Delete a category and optionally reassign children to a new parent.
   */
  async deleteCategory(categoryId, { reassignTo }) {
    const category = await FAQCategory.findById(categoryId);
    if (!category) throw new AppError('Category not found.', 404);

    const children = await FAQCategory.find({ parent: categoryId });

    if (children.length > 0 && !reassignTo) {
      throw new AppError('Cannot delete a category that has children. Provide reassignTo to move children.', 400);
    }

    if (reassignTo) {
      const newParent = await FAQCategory.findById(reassignTo);
      if (!newParent) throw new AppError('Reassignment target category not found.', 404);

      for (const child of children) {
        child.parent = newParent._id;
        child.path = `${newParent.path}.${child.path.split('.').pop()}`;
        await child.save();
      }
    } else {
      await FAQCategory.deleteMany({ parent: categoryId });
    }

    await FAQCategory.findByIdAndDelete(categoryId);

    return { success: true, message: 'Category deleted.' };
  }

  /**
   * Get FAQs scoped to a category subtree (paginated).
   *
   * @param {string} categoryPath - The root path of the subtree
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   */
  async getFaqsInSubtree(categoryPath, page = 1, limit = 20) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const subtreeCategories = await FAQCategory.find({
      path: { $regex: `^${categoryPath}(\\.|$)` }
    }).select('path').lean();
    const paths = subtreeCategories.map(c => c.path);

    const [faqs, total] = await Promise.all([
      FAQ.find({ category_path: { $in: paths } })
        .select('question answer category_path source created_at')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      FAQ.countDocuments({ category_path: { $in: paths } }),
    ]);

    return {
      data: faqs,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Migrate existing flat categories to tree structure.
   * Creates 'root' as parent for any categories without a parent.
   */
  async migrateToTree() {
    const categories = await FAQCategory.find().lean();

    let migrated = 0;
    let roots = 0;

    for (const cat of categories) {
      if (!cat.parent) {
        if (!cat.path.startsWith('root.')) {
          const newPath = `root.${cat.path}`;
          await FAQCategory.updateOne({ _id: cat._id }, { $set: { path: newPath } });
          migrated++;
        }
        roots++;
      }
    }

    return {
      success: true,
      message: `Migration complete. ${roots} root categories. ${migrated} paths updated to include 'root.' prefix.`,
    };
  }
}

export default new CategoryService();