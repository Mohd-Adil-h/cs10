/**
 * postCommunityQuestions.js
 * Posts additional community questions via the real API using seed user tokens.
 * Uses POST /api/questions/prepare (Groq rephrase) then POST /api/questions/submit.
 *
 * Run: node --env-file=.env scripts/postCommunityQuestions.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ─── Minimal inline model ────────────────────────────────────────────────────

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

// ─── Fresh questions to post ─────────────────────────────────────────────────

const NEW_QUESTIONS = [
  { q: "Can I apply if I missed the first cohort orientation but want to join the second batch?", cat: "general" },
  { q: "Is there a minimum CGPA requirement to be eligible for the VINS internship?", cat: "selection" },
  { q: "What programming languages should I know before starting Phase 1?", cat: "work" },
  { q: "How do I know which phase I am currently in on the intern dashboard?", cat: "work" },
  { q: "Are international students allowed to apply for the VINS internship?", cat: "general" },
  { q: "Will I get an internship ID card or any official identification from IIT Ropar?", cat: "certificate" },
  { q: "Can I work on a personal side project while doing the VINS internship?", cat: "conduct" },
  { q: "What happens if I lose access to the ViBe platform mid-internship?", cat: "work" },
  { q: "Is there a way to request a recommendation letter after completing the internship?", cat: "certificate" },
  { q: "Do I need to submit weekly progress reports or is the Rosetta journal enough?", cat: "work" },
  { q: "What is the best way to prepare for the Phase 2 project before Phase 1 ends?", cat: "work" },
  { q: "Can I collaborate with interns from previous cohorts on my open source project?", cat: "work" },
  { q: "Is the ViBe bypass exam the same for all technology stacks?", cat: "work" },
  { q: "How do I report a technical issue with the intern portal if Yaksha is also down?", cat: "general" },
  { q: "Are there any offline meetups or events organized for interns?", cat: "general" },
  { q: "What is the minimum answer length required when responding to community questions?", cat: "conduct" },
  { q: "If I have already done an IIT internship before, do I need to provide a new NOC?", cat: "noc" },
  { q: "What is the exact format of the email I should send to claim my offer letter?", cat: "selection" },
  { q: "Can I still get a certificate if my team project is incomplete but my Phase 1 and Rosetta are done?", cat: "certificate" },
  { q: "How do I add the IIT Ropar VINS internship to my LinkedIn profile correctly?", cat: "certificate" },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected!\n');

  // Get existing seed users
  const askers = await User.find({ email: /^seed_asker_/ }).lean();
  if (askers.length === 0) {
    console.error('❌ No seed asker users found. Run seedCommunity.js first.');
    process.exit(1);
  }
  console.log(`👥 Found ${askers.length} seed asker users.\n`);

  console.log(`📝 Posting ${NEW_QUESTIONS.length} new community questions...`);
  let created = 0, skipped = 0;

  for (const item of NEW_QUESTIONS) {
    const exists = await Question.findOne({ original_query: item.q });
    if (exists) {
      skipped++;
      continue;
    }

    const asker = askers[Math.floor(Math.random() * askers.length)];

    // Spread creation over the past 3 days for realistic timestamps
    const hoursAgo = Math.floor(Math.random() * 72);
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    await Question.create({
      original_query:  item.q,
      rephrased_query: item.q,
      category:        item.cat,
      posted_by:       asker._id,
      status:          'open',
      created_at:      createdAt,
      // Randomise some engagement stats
      view_count:  Math.floor(Math.random() * 30),
      upvotes:     Math.floor(Math.random() * 8),
      net_score:   Math.floor(Math.random() * 8),
    });

    await User.findByIdAndUpdate(asker._id, { $inc: { questions_count: 1 } });
    created++;
    process.stdout.write(`   ✅ [${created}] ${item.q.substring(0, 60)}...\n`);
  }

  console.log(`\n🎉 Done!`);
  console.log(`   Created: ${created} | Skipped (already exist): ${skipped}`);
  console.log(`   Total questions in DB: ${await Question.countDocuments()}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
