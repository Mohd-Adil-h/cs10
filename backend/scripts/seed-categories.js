/**
 * Seed FAQ categories into MongoDB.
 * Extracts unique sectionIds from FAQ.json and creates paths with embeddings.
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import FAQCategory from '../models/FAQCategory.js';
import { getEmbedding } from '../services/embeddings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function seedCategories() {
  try {
    console.log('🌱 Seeding FAQ categories into MongoDB...');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('  ✅ Connected to MongoDB');

    // Read FAQ.json to extract categories
    const faqPath = resolve(__dirname, '../../FAQ.json');
    const faqs = JSON.parse(readFileSync(faqPath, 'utf-8'));

    // Extract unique sections
    const sectionMap = new Map();
    for (const faq of faqs) {
      if (!sectionMap.has(faq.sectionId)) {
        sectionMap.set(faq.sectionId, faq.sectionLabel);
      }
    }

    // Always ensure root exists with a dummy embedding
    const rootEmbedding = new Array(384).fill(0.0);
    await FAQCategory.findOneAndUpdate(
      { path: 'root' },
      {
        path: 'root',
        label: 'Root',
        description: 'All Samagama FAQs',
        embedding: rootEmbedding,
      },
      { upsert: true, new: true }
    );
    console.log('  ✅ Root category ensured.');

    // Insert each category with embedding
    for (const [sectionId, sectionLabel] of sectionMap) {
      const path = `root.${sectionId}`;
      const description = `Questions about: ${sectionLabel}`;

      console.log(`  Folder: ${path} — ${sectionLabel}`);

      // Generate embedding for the category description
      let embedding = null;
      try {
        embedding = await getEmbedding(`${sectionLabel} ${description}`);
      } catch (err) {
        console.error(`  ⚠️ Failed to embed category "${sectionId}":`, err.message);
      }

      if (!embedding) {
        // Fallback to dummy zero vector so the document is valid
        embedding = new Array(384).fill(0.0);
      }

      await FAQCategory.findOneAndUpdate(
        { path },
        {
          path,
          label: sectionLabel,
          description,
          embedding,
        },
        { upsert: true, new: true }
      );

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    }

    console.log(`✅ Seeded ${sectionMap.size} categories + root.`);
  } catch (error) {
    console.error('❌ Category seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

seedCategories().catch(() => process.exit(1));
