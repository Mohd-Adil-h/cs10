import 'dotenv/config';
import mongoose from 'mongoose';
import FAQ from '../models/FAQ.js';
import FAQCategory from '../models/FAQCategory.js';
import SemanticCache from '../models/SemanticCache.js';
import Vote from '../models/Vote.js';

const initMongoDB = async () => {
  try {
    console.log('🔧 Initializing MongoDB database...');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('  ✅ Connected to MongoDB');

    // Drop old non-partial unique index on votes if it exists
    try {
      const db = mongoose.connection.db;
      const indexes = await db.collection('votes').indexes();
      const oldIndex = indexes.find(idx => idx.name === 'user_id_1_answer_id_1' && !idx.partialFilterExpression);
      if (oldIndex) {
        await db.collection('votes').dropIndex('user_id_1_answer_id_1');
        console.log('  🧹 Dropped old vote index (user_id_1_answer_id_1) — replaced with partial indexes');
      }
    } catch (err) {
      // Collection may not exist yet, that's fine
    }

    // Mongoose builds indexes defined in models automatically on startup/compile,
    // but let's force index synchronization to make sure they are active.
    console.log('  ⏳ Syncing Mongoose schemas and standard indexes (TTL, Text)...');
    await Promise.all([
      FAQ.createIndexes(),
      FAQCategory.createIndexes(),
      SemanticCache.createIndexes(),
      Vote.createIndexes(),
    ]);
    console.log('  ✅ Standard Mongoose indexes synced successfully!');

    // Attempt programmatic Atlas Vector Search Index creation
    console.log('  ⏳ Attempting to create Atlas Vector Search Indexes...');
    const db = mongoose.connection.db;

    // Index 1: faq_vector_index on faqs collection
    try {
      await db.collection('faqs').createSearchIndex({
        name: 'faq_vector_index',
        type: 'vectorSearch',
        definition: {
          fields: [
            {
              type: 'vector',
              path: 'embedding',
              numDimensions: 384,
              similarity: 'cosine'
            },
            {
              type: 'filter',
              path: 'category_path'
            }
          ]
        }
      });
      console.log('  ✅ Programmatic request sent: Index "faq_vector_index" created/updated.');
    } catch (err) {
      console.warn('  ⚠️ Could not programmatically create "faq_vector_index":', err.message);
      console.log('    (This is normal if you are running local MongoDB without Atlas Search or if your credentials lack index privileges.)');
    }

    // Index 2: cache_vector_index on semanticcaches collection
    try {
      await db.collection('semanticcaches').createSearchIndex({
        name: 'cache_vector_index',
        type: 'vectorSearch',
        definition: {
          fields: [
            {
              type: 'vector',
              path: 'query_embedding',
              numDimensions: 384,
              similarity: 'cosine'
            }
          ]
        }
      });
      console.log('  ✅ Programmatic request sent: Index "cache_vector_index" created/updated.');
    } catch (err) {
      console.warn('  ⚠️ Could not programmatically create "cache_vector_index":', err.message);
    }

    // Index 3: category_vector_index on faqcategories collection
    try {
      await db.collection('faqcategories').createSearchIndex({
        name: 'category_vector_index',
        type: 'vectorSearch',
        definition: {
          fields: [
            {
              type: 'vector',
              path: 'embedding',
              numDimensions: 384,
              similarity: 'cosine'
            }
          ]
        }
      });
      console.log('  ✅ Programmatic request sent: Index "category_vector_index" created/updated.');
    } catch (err) {
      console.warn('  ⚠️ Could not programmatically create "category_vector_index":', err.message);
    }

    console.log('\n=============================================================');
    console.log('💡 MANUAL SETUP REMINDER:');
    console.log('If you are deploying to MongoDB Atlas Free Tier (M0) and the programmatic');
    console.log('creation failed or you want to ensure indexes are built correctly:');
    console.log('1. Go to your MongoDB Atlas Dashboard -> Search -> Create Search Index');
    console.log('2. Choose "JSON Editor" under Atlas Vector Search');
    console.log('3. Create an index on the "faqs" collection named "faq_vector_index" with:');
    console.log(JSON.stringify({
      fields: [
        { type: "vector", path: "embedding", numDimensions: 384, similarity: "cosine" },
        { type: "filter", path: "category_path" }
      ]
    }, null, 2));
    console.log('4. Create an index on the "faqcategories" collection named "category_vector_index" with:');
    console.log(JSON.stringify({
      fields: [
        { type: "vector", path: "embedding", numDimensions: 384, similarity: "cosine" }
      ]
    }, null, 2));
    console.log('5. Create an index on the "semanticcaches" collection named "cache_vector_index" with:');
    console.log(JSON.stringify({
      fields: [
        { type: "vector", path: "query_embedding", numDimensions: 384, similarity: "cosine" }
      ]
    }, null, 2));
    console.log('=============================================================\n');

    console.log('✅ MongoDB database initialization steps complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

initMongoDB();
