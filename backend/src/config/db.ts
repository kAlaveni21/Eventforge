import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.startsWith('mongodb')) {
    try {
      console.log(`[Database] Attempting connection to MongoDB at ${uri.replace(/:[^:]*@/, ':****@')}...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] Connected to external MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err: any) {
      console.warn(`[Database] External MongoDB connection failed (${err.message}). Falling back to in-memory MongoDB.`);
    }
  }

  // Fallback to in-memory MongoDB
  if (!mongod) {
    try {
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      console.log(`[Database] Starting embedded in-memory MongoDB instance at ${memUri}...`);
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] Connected to embedded in-memory MongoDB`);
      return conn;
    } catch (memErr: any) {
      console.error('[Database] Failed to initialize in-memory MongoDB:', memErr);
      throw memErr;
    }
  } else {
    return mongoose;
  }
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

export default connectDB;
