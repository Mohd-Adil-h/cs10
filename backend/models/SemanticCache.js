import mongoose from 'mongoose';

const semanticCacheSchema = new mongoose.Schema({
  original_query: {
    type: String,
    required: true,
    trim: true,
  },
  query_embedding: {
    type: [Number],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length === 384;
      },
      message: 'Embedding vector must be exactly 384 numbers.'
    }
  },
  groq_response: {
    type: String,
    required: true,
    trim: true,
  },
  sentiment: {
    type: String,
    default: 'neutral',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// TTL index to automatically expire cache documents after 30 days
semanticCacheSchema.index({ created_at: 1 }, { expireAfterSeconds: 2592000 });

const SemanticCache = mongoose.model('SemanticCache', semanticCacheSchema);
export default SemanticCache;
