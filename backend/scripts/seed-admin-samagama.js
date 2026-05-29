import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash('admin123', 12);
  const u = await User.findOneAndUpdate(
    { email: 'admin@samagama.com' },
    { name: 'Admin', email: 'admin@samagama.com', password_hash: hash, role: 'admin' },
    { upsert: true, new: true }
  );
  console.log('Created:', u.email, 'role:', u.role);
  await mongoose.disconnect();
}

seed();