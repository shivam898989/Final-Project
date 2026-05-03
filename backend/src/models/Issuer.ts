import mongoose, { Schema, Document } from 'mongoose';

export interface IIssuer extends Document {
    did: string;
    walletAddress: string;
    organizationName: string;
    publicKey: string;
    reputationScore: number;
    validCredentials: number;
    totalCredentials: number;
    endorsements: number;
    isActive: boolean;
    metadata: {
        description?: string;
        website?: string;
        contactEmail?: string;
        verifiedBy?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const IssuerSchema = new Schema<IIssuer>(
    {
        did: { type: String, required: true, unique: true, index: true },
        walletAddress: { type: String, required: true, unique: true, index: true },
        organizationName: { type: String, required: true },
        publicKey: { type: String, required: true },
        reputationScore: { type: Number, default: 0 },
        validCredentials: { type: Number, default: 0 },
        totalCredentials: { type: Number, default: 0 },
        endorsements: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        metadata: {
            description: { type: String },
            website: { type: String },
            contactEmail: { type: String },
            verifiedBy: { type: String },
        },
    },
    { timestamps: true }
);

export const Issuer = mongoose.model<IIssuer>('Issuer', IssuerSchema);
