/**
 * Seed Admin Account
 * Creates or resets an admin account (admin123@gmail.com / admin123)
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

async function seedAdmin() {
  try {
    console.log('🔧 Initializing Admin Seeding...');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('  ✅ Connected to MongoDB');

    const adminEmail = 'admin123@gmail.com';
    const adminPassword = 'admin123';

    // Hash password with 12 rounds to match registration
    const password_hash = await bcrypt.hash(adminPassword, 12);

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`  ⏳ Admin account "${adminEmail}" already exists. Resetting password and ensuring role...`);
      existingAdmin.password_hash = password_hash;
      existingAdmin.role = 'admin';
      existingAdmin.name = 'Admin';
      await existingAdmin.save();
      console.log('  ✅ Admin account password reset successfully!');
    } else {
      console.log(`  ⏳ Creating a brand new Admin account: "${adminEmail}"...`);
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password_hash,
        role: 'admin',
      });
      console.log('  ✅ Admin account created successfully!');
    }

    console.log('\n=============================================================');
    console.log('🎉 ADMIN CREDENTIALS ACTIVE:');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('=============================================================\n');

  } catch (error) {
    console.error('❌ Admin seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
