import mongoose, { Schema, Document } from 'mongoose';

export interface IWorker extends Document {
    did: string;
    walletAddress: string;
    publicKey: string;
    encryptedPrivateKey?: string;
    shamirShares?: string[];
    metadata: {
        name?: string;
        language?: string;
        deviceId?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const WorkerSchema = new Schema<IWorker>(
    {
        did: { type: String, required: true, unique: true, index: true },
        walletAddress: { type: String, required: true, unique: true, index: true },
        publicKey: { type: String, required: true },
        encryptedPrivateKey: { type: String },
        shamirShares: [{ type: String }],
        metadata: {
            name: { type: String },
            language: { type: String, default: 'en' },
            deviceId: { type: String },
        },
    },
    { timestamps: true }
);

export const Worker = mongoose.model<IWorker>('Worker', WorkerSchema);
