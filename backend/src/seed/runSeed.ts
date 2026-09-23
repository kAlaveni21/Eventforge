import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import { seedDatabase } from './seedData.js';
import mongoose from 'mongoose';

dotenv.config();

const run = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();
    await seedDatabase();
    console.log('Seeding finished successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
};

run();
