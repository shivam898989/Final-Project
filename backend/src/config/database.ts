import mongoose from 'mongoose';
import { config } from './index';

export async function connectDatabase(): Promise<void> {
    try {
        await mongoose.connect(config.mongodbUri);
        console.log('✓ Connected to MongoDB');
    } catch (error) {
        console.error('✗ MongoDB connection error:', error);
        // Don't crash — allow running without DB for demo purposes
        console.warn('⚠ Running without database connection');
    }
}

export async function disconnectDatabase(): Promise<void> {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
}
