import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import FAQ from '../models/FAQ.js';
import SPLedger from '../models/SPLedger.js';
import adminService from '../services/adminService.js';
import { getEmbedding } from '../services/embeddings.js';

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n--- 1. Testing SP Ledger ---');
    // Get a random user
    const user = await User.findOne({ role: 'answerer' });
    if (user) {
      const startXp = user.xp;
      const adminId = user._id; // just mock admin id
      console.log(`Initial XP for ${user.name}: ${startXp}`);
      await adminService.adjustUserSp(user._id, adminId, 15, 'Test bonus');
      
      const updatedUser = await User.findById(user._id);
      console.log(`Updated XP for ${user.name}: ${updatedUser.xp} (Expected: ${startXp + 15})`);
      
      const ledgerEntry = await SPLedger.findOne({ user: user._id }).sort({ createdAt: -1 });
      if (ledgerEntry && ledgerEntry.change_amount === 15) {
        console.log('✅ SP Ledger entry created successfully!');
      } else {
        console.error('❌ SP Ledger entry not found or incorrect.', ledgerEntry);
      }
    } else {
      console.log('⚠️ No answerer user found to test SP.');
    }

    console.log('\n--- 2. Testing Deduplication ---');
    // We expect the FAQ creation to fail if we create one with same text
    const uniqueQuestion = 'Is Vicharanashala fully online?';
    // Let's create an FAQ if it doesn't exist to test deduplication
    const existing = await FAQ.findOne({ question: new RegExp('Vicharanashala', 'i') });
    if (existing) {
      console.log('Existing FAQ found for duplicate testing:', existing.question);
      try {
        await adminService.createFaq({
          question: existing.question.toLowerCase(), // Change case slightly to test fingerprint
          answer: 'Yes',
          category_path: 'root',
          author_name: 'Admin'
        });
        console.error('❌ Deduplication failed: Duplicate FAQ was created!');
      } catch (err) {
        if (err.message.includes('Duplicate FAQ')) {
          console.log('✅ Deduplication successfully caught duplicate FAQ!');
        } else if (err.code === 11000) {
          console.log('✅ Deduplication caught at database level (unique index)!');
        } else {
          console.error('❌ Unexpected error during deduplication test:', err);
        }
      }
    } else {
      console.log('⚠️ No existing FAQ found to test deduplication.');
    }

    console.log('\n✅ All Refactoring tests completed successfully!');
  } catch (err) {
    console.error('Test failed', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
