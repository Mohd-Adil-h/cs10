require('dotenv').config();
const mongoose = require('mongoose');
const { runGlobalAiClustering } = require('./src/services/community.service');
const env = require('./src/config/env');

async function test() {
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected. Running clusterer...");
  try {
    const res = await runGlobalAiClustering();
    console.log("Result:", JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("Failed:", e.message);
  }
  process.exit();
}

test();
