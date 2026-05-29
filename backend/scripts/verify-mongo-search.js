import 'dotenv/config';
import mongoose from 'mongoose';
import FAQ from '../models/FAQ.js';
import FAQCategory from '../models/FAQCategory.js';
import SemanticCache from '../models/SemanticCache.js';

async function verifyMigration() {
  try {
    console.log('🔍 Starting MongoDB Migration Verification...');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('  ✅ Database connection successful!');

    // 1. Verify collections and counts
    const faqCount = await FAQ.countDocuments();
    const categoryCount = await FAQCategory.countDocuments();
    const cacheCount = await SemanticCache.countDocuments();

    console.log(`\n📊 Current Database Stats:`);
    console.log(`  - FAQs: ${faqCount} documents`);
    console.log(`  - FAQ Categories: ${categoryCount} documents`);
    console.log(`  - Cached Queries: ${cacheCount} documents`);

    // 2. Output verification results
    if (faqCount === 0) {
      console.log('\n⚠️  WARNING: FAQs collection is empty. Please run: npm run seed-all');
    } else {
      console.log('\n✅ FAQs collection populated successfully!');
    }

    if (categoryCount === 0) {
      console.log('⚠️  WARNING: FAQ Categories collection is empty. Please run: npm run seed-all');
    } else {
      console.log('✅ FAQ Categories collection populated successfully!');
    }

    // 3. Print sample documents
    if (faqCount > 0) {
      const sampleFaq = await FAQ.findOne().select('question category_path source');
      console.log('\n📄 Sample FAQ Document:');
      console.log(JSON.stringify(sampleFaq, null, 2));
    }

    if (categoryCount > 0) {
      const sampleCategory = await FAQCategory.findOne().select('path label');
      console.log('\n📁 Sample Category Document:');
      console.log(JSON.stringify(sampleCategory, null, 2));
    }

    console.log('\n🎉 Verification completed successfully!');
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

verifyMigration();
