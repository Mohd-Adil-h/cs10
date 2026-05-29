import mongoose from 'mongoose';

const faqCategorySchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQCategory',
    default: null,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  embedding: {
    type: [Number],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length === 384;
      },
      message: 'Embedding vector must be exactly 384 numbers.'
    }
  },
});

// Index to quickly find children
faqCategorySchema.index({ parent: 1 });

const FAQCategory = mongoose.model('FAQCategory', faqCategorySchema);
export default FAQCategory;
