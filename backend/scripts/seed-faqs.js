/**
 * Seed FAQ data from FAQ.json into MongoDB faqs collection.
 * Generates embeddings for each Q+A pair via HuggingFace.
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import FAQ from '../models/FAQ.js';
import { getEmbedding } from '../services/embeddings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function seedFAQs() {
  try {
    console.log('🌱 Seeding FAQ data from FAQ.json into MongoDB...');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('  ✅ Connected to MongoDB');

    // Read FAQ.json
    const faqPath = resolve(__dirname, '../../FAQ.json');
    const faqs = JSON.parse(readFileSync(faqPath, 'utf-8'));

    console.log(`  📄 Found ${faqs.length} FAQ entries`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i];
      const categoryPath = `root.${faq.sectionId}`;
      const combinedText = `${faq.question} ${faq.answer}`;

      try {
        // Generate embedding (truncate to stay within token limits)
        const embedding = await getEmbedding(combinedText.substring(0, 512));

        // Insert/Upsert into FAQs collection
        await FAQ.findOneAndUpdate(
          { question: faq.question },
          {
            category_path: categoryPath,
            question: faq.question,
            answer: faq.answer,
            embedding,
            source: 'manual',
          },
          { upsert: true, new: true }
        );

        successCount++;

        // Progress logging every 10 entries
        if ((i + 1) % 10 === 0 || i === faqs.length - 1) {
          console.log(`  📊 Progress: ${i + 1}/${faqs.length} (${successCount} success, ${errorCount} errors)`);
        }

        // Rate limit delay (100ms between requests)
        await new Promise(r => setTimeout(r, 100));

      } catch (error) {
        errorCount++;
        console.error(`  ❌ Failed FAQ #${i + 1} ("${faq.question.substring(0, 50)}..."): ${error.message}`);
      }
    }

    console.log(`\n✅ FAQ seeding complete!`);
    console.log(`   Success: ${successCount}/${faqs.length}`);
    console.log(`   Errors: ${errorCount}/${faqs.length}`);

  } catch (error) {
    console.error('❌ FAQ seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

seedFAQs().catch(() => process.exit(1));
