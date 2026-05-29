/**
 * postMoreQuestions.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String, email: String, password_hash: String,
  role: { type: String, default: 'asker' },
  xp: { type: Number, default: 0 },
  questions_count: { type: Number, default: 0 },
  answers_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

const questionSchema = new mongoose.Schema({
  original_query:  { type: String, required: true },
  rephrased_query: { type: String, required: true },
  category:        { type: String, required: true },
  posted_by:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:          { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
  answer_count:    { type: Number, default: 0 },
  view_count:      { type: Number, default: 0 },
  upvotes:         { type: Number, default: 0 },
  downvotes:       { type: Number, default: 0 },
  net_score:       { type: Number, default: 0 },
  created_at:      { type: Date, default: Date.now },
});

const User     = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);

const NEW_QUESTIONS = [
  { q: "How do we handle environment variables in the Phase 2 MERN stack project deployment on Render?", cat: "work" },
  { q: "Is the IIT Ropar VINS certificate recognized by international universities for master's applications?", cat: "certificate" },
  { q: "My team lead is unresponsive on Yaksha, what is the protocol to request a team reassignment?", cat: "conduct" },
  { q: "What happens if our final Phase 3 project fails to build during the final evaluator demo?", cat: "work" },
  { q: "Can I use Next.js instead of standard React for the Phase 2 capstone project?", cat: "work" }
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const askers = await User.find({ email: /^seed_asker_/ }).lean();
  
  if(askers.length > 0) {
    for (const item of NEW_QUESTIONS) {
      const asker = askers[Math.floor(Math.random() * askers.length)];
      await Question.create({
        original_query:  item.q,
        rephrased_query: item.q,
        category:        item.cat,
        posted_by:       asker._id,
        status:          'open',
        created_at:      new Date(),
      });
      await User.findByIdAndUpdate(asker._id, { $inc: { questions_count: 1 } });
    }
    console.log("✅ Added 5 highly specific meaningful questions!");
  }
  await mongoose.disconnect();
}

main();
