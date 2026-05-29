import mongoose from 'mongoose';

const spLedgerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // The admin who made the adjustment
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  old_balance: {
    type: Number,
    required: true,
  },
  new_balance: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

spLedgerSchema.index({ user_id: 1, created_at: -1 });
spLedgerSchema.index({ admin_id: 1, created_at: -1 });

const SPLedger = mongoose.model('SPLedger', spLedgerSchema);
export default SPLedger;
