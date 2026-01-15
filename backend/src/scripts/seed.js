import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import User model
import('../models/User.js')
  .then(({ default: User }) => {
    // Connect to database
    mongoose
      .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/procureai')
      .then(async () => {
        console.log('MongoDB Connected');

        try {
          // Check if admin user already exists
          const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@procureai.com' });

          if (adminExists) {
            console.log('Admin user already exists');
            process.exit(0);
          }

          // Create admin user
          const admin = await User.create({
            name: 'Admin',
            email: process.env.ADMIN_EMAIL || 'admin@procureai.com',
            password: process.env.ADMIN_PASSWORD || 'admin123',
            role: 'ADMIN',
            credits: 999999,
          });

          console.log('Admin user created successfully:');
          console.log(`  Email: ${admin.email}`);
          console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
          console.log('  Please change this password after first login!');

          process.exit(0);
        } catch (error) {
          console.error('Error creating admin user:', error);
          process.exit(1);
        }
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
      });
  })
  .catch((err) => {
    console.error('Error importing User model:', err);
    process.exit(1);
  });
