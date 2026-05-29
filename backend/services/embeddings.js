/**
 * Embedding service using local @xenova/transformers
 * Model: Xenova/all-MiniLM-L6-v2 (384-dim output)
 * Runs 100% locally and offline (no API token or external HTTP request needed)
 */

import { pipeline } from '@xenova/transformers';

let extractor = null;

/**
 * Lazy-load the local pipeline for feature extraction.
 * Downloads the model (~23MB) on first run and caches it locally.
 */
async function getExtractor() {
  if (!extractor) {
    console.log('⏳ Loading local embedding model (Xenova/all-MiniLM-L6-v2)...');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Local embedding model loaded successfully!');
  }
  return extractor;
}

/**
 * Generate a 384-dimensional embedding for the given text.
 * Runs locally using WebAssembly.
 *
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} 384-dimensional float array
 */
export async function getEmbedding(text) {
  try {
    const extract = await getExtractor();
    
    // Generate embedding
    const output = await extract(text, { pooling: 'mean', normalize: true });
    
    // Extract array values
    return Array.from(output.data);
  } catch (error) {
    console.error('❌ Local embedding generation failed:', error.message);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts in batch.
 *
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} Array of embeddings
 */
export async function getBatchEmbeddings(texts) {
  const embeddings = [];
  for (let i = 0; i < texts.length; i++) {
    const embedding = await getEmbedding(texts[i]);
    embeddings.push(embedding);
  }
  return embeddings;
}
