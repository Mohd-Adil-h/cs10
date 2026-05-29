import 'dotenv/config';
import mongoose from 'mongoose';
import crypto from 'crypto';
import FAQCategory from '../models/FAQCategory.js';
import FAQ from '../models/FAQ.js';

function generateFingerprint(question) {
  const normalized = question.trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

async function migrate() {
  try {
    console.log('🌱 Starting Migration: Hierarchy & Fingerprints');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('  ✅ Connected to MongoDB');

    // 1. Migrate Categories Hierarchy
    console.log('  🔄 Migrating FAQCategory hierarchy...');
    const categories = await FAQCategory.find({});
    
    // Find or create root category
    let rootCat = categories.find(c => c.path === 'root');
    if (!rootCat) {
      rootCat = new FAQCategory({
        path: 'root',
        label: 'Root',
        description: 'All Samagama FAQs',
        embedding: new Array(384).fill(0.0)
      });
      await rootCat.save();
      console.log('    ✅ Created root category');
    }

    let hierarchyUpdates = 0;
    for (const cat of categories) {
      if (cat.path === 'root') {
        if (cat.parent) {
          cat.parent = null;
          await cat.save();
          hierarchyUpdates++;
        }
      } else {
        // e.g. root.noc
        const pathParts = cat.path.split('.');
        if (pathParts.length === 2 && pathParts[0] === 'root') {
          if (!cat.parent || cat.parent.toString() !== rootCat._id.toString()) {
            cat.parent = rootCat._id;
            await cat.save();
            hierarchyUpdates++;
          }
        } else if (pathParts.length > 2) {
          // If we had deeper paths like root.noc.sub, we would find parent here
          const parentPath = pathParts.slice(0, -1).join('.');
          const parentCat = categories.find(c => c.path === parentPath);
          if (parentCat) {
             if (!cat.parent || cat.parent.toString() !== parentCat._id.toString()) {
                cat.parent = parentCat._id;
                await cat.save();
                hierarchyUpdates++;
             }
          }
        }
      }
    }
    console.log(`  ✅ Updated ${hierarchyUpdates} category parents.`);

    // 2. Migrate FAQ Fingerprints
    console.log('  🔄 Backfilling FAQ fingerprints...');
    const faqs = await FAQ.find({});
    let fingerprintUpdates = 0;

    for (const faq of faqs) {
      if (faq.question) {
        const fp = generateFingerprint(faq.question);
        if (faq.fingerprint !== fp) {
          try {
            await FAQ.updateOne({ _id: faq._id }, { $set: { fingerprint: fp } });
            fingerprintUpdates++;
          } catch (err) {
            if (err.code === 11000) {
              console.log(`    ⚠️ Found duplicate FAQ "${faq.question}". Deleting duplicate.`);
              await FAQ.deleteOne({ _id: faq._id });
            } else {
              console.error(err);
            }
          }
        }
      }
    }
    console.log(`  ✅ Backfilled fingerprints for ${fingerprintUpdates} FAQs.`);

    console.log('🎉 Migration completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

migrate().catch(() => process.exit(1));
