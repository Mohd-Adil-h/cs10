/**
 * Migration: Add missing database indexes and model enhancements
 *
 * Run with: node scripts/migrate-add-indexes.js
 */

import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/samagama';

async function migrate() {
  console.log('🔄 Starting migration...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. FAQ indexes - ensure fingerprint is indexed for dedup lookups
  console.log('📋 Ensuring FAQ indexes...');
  await db.collection('faqs').createIndex(
    { fingerprint: 1 },
    { unique: true, sparse: true, background: true }
  );
  await db.collection('faqs').createIndex(
    { question: 'text', answer: 'text' },
    { background: true }
  );
  await db.collection('faqs').createIndex(
    { category_path: 1, created_at: -1 },
    { background: true }
  );

  // 2. Answer indexes - for upvote-prioritized queries
  console.log('📋 Ensuring Answer indexes...');
  await db.collection('answers').createIndex(
    { status: 1, upvotes: -1, created_at: 1 },
    { background: true }
  );
  await db.collection('answers').createIndex(
    { question_id: 1, status: 1, net_score: -1 },
    { background: true }
  );
  await db.collection('answers').createIndex(
    { promoted_to_corpus: 1, status: 1, net_score: -1 },
    { background: true }
  );
  await db.collection('answers').createIndex(
    { answered_by: 1, created_at: -1 },
    { background: true }
  );

  // 3. Question indexes - upvote-first sort
  console.log('📋 Ensuring Question indexes...');
  await db.collection('questions').createIndex(
    { status: 1, net_score: -1, upvotes: -1, created_at: -1 },
    { background: true }
  );
  await db.collection('questions').createIndex(
    { category: 1, status: 1, net_score: -1 },
    { background: true }
  );

  // 4. SPLedger indexes
  console.log('📋 Ensuring SPLedger indexes...');
  await db.collection('spledgers').createIndex(
    { user_id: 1, created_at: -1 },
    { background: true }
  );
  await db.collection('spledgers').createIndex(
    { admin_id: 1, created_at: -1 },
    { background: true }
  );
  await db.collection('spledgers').createIndex(
    { created_at: -1 },
    { background: true }
  );

  // 5. FAQCategory indexes
  console.log('📋 Ensuring FAQCategory indexes...');
  await db.collection('faqcategories').createIndex(
    { parent: 1 },
    { background: true }
  );
  await db.collection('faqcategories').createIndex(
    { path: 1 },
    { unique: true, background: true }
  );

  // 6. Vote indexes - for dedup check
  console.log('📋 Ensuring Vote indexes...');
  await db.collection('votes').createIndex(
    { user_id: 1, answer_id: 1 },
    { unique: true, sparse: true, background: true }
  );
  await db.collection('votes').createIndex(
    { user_id: 1, question_id: 1 },
    { unique: true, sparse: true, background: true }
  );

  // 7. Ensure all existing FAQs have fingerprints
  console.log('📋 Backfilling FAQ fingerprints...');
  const crypto = await import('crypto');
  const faqs = await db.collection('faqs').find({ fingerprint: null }).toArray();
  for (const faq of faqs) {
    const fingerprint = crypto.createHash('sha256')
      .update(faq.question.toLowerCase().trim())
      .digest('hex');
    await db.collection('faqs').updateOne(
      { _id: faq._id },
      { $set: { fingerprint } }
    );
  }
  console.log(`   ✅ Backfilled ${faqs.length} FAQ fingerprints`);

  // 8. Ensure all categories have embeddings (zero fallback for ones without)
  console.log('📋 Checking category embeddings...');
  const catsWithoutEmb = await db.collection('faqcategories')
    .find({ embedding: { $exists: false } || { $size: 0 } })
    .toArray();
  console.log(`   ⚠️  ${catsWithoutEmb.length} categories missing embeddings (will use zero vectors)`);

  console.log('✅ Migration complete!');
  console.log('');
  console.log('Summary of indexes added:');
  console.log('  - faqs.fingerprint (unique sparse)');
  console.log('  - faqs.text (text search)');
  console.log('  - answers (status, upvotes, created_at)');
  console.log('  - answers (promoted_to_corpus, status, net_score)');
  console.log('  - questions (status, net_score, upvotes, created_at)');
  console.log('  - questions (category, status, net_score)');
  console.log('  - spledgers (user_id, created_at)');
  console.log('  - spledgers (admin_id, created_at)');
  console.log('  - spledgers (created_at)');
  console.log('  - faqcategories.path (unique)');
  console.log('  - votes (user_id, answer_id) unique sparse');
  console.log('  - votes (user_id, question_id) unique sparse');

  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});