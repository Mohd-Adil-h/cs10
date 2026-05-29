import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
  },
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  },
  type: {
    type: String,
    enum: ['up', 'down'],
    required: true,
  },
});

// Ensure exactly one of answer_id or question_id is set
voteSchema.pre('validate', function (next) {
  const hasAnswer = this.answer_id != null;
  const hasQuestion = this.question_id != null;
  if (hasAnswer === hasQuestion) {
    return next(new Error('Exactly one of answer_id or question_id must be set.'));
  }
  next();
});

// Unique partial indexes: one vote per user per answer, one vote per user per question
voteSchema.index({ user_id: 1, answer_id: 1 }, { unique: true, partialFilterExpression: { answer_id: { $exists: true } } });
voteSchema.index({ user_id: 1, question_id: 1 }, { unique: true, partialFilterExpression: { question_id: { $exists: true } } });

const Vote = mongoose.model('Vote', voteSchema);
export default Vote;
