import mongoose from 'mongoose';
import { config } from './env';

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return mongoose;
    }
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
