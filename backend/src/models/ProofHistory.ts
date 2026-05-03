import mongoose, { Schema, Document } from 'mongoose';

export interface IProofHistory extends Document {
    proofId: string;
    workerDid: string;
    verifierDid: string;
    proofType: 'income' | 'workHours' | 'trustedIssuer';
    publicSignals: string[];
    result: boolean;
    verificationId?: string;
    blockchainTxHash?: string;
    metadata: {
        requestedAt: Date;
        verifiedAt: Date;
        proofSizeBytes?: number;
    };
    createdAt: Date;
}

const ProofHistorySchema = new Schema<IProofHistory>(
    {
        proofId: { type: String, required: true, unique: true },
        workerDid: { type: String, required: true, index: true },
        verifierDid: { type: String, required: true, index: true },
        proofType: {
            type: String,
            enum: ['income', 'workHours', 'trustedIssuer'],
            required: true,
        },
        publicSignals: [{ type: String }],
        result: { type: Boolean, required: true },
        verificationId: { type: String },
        blockchainTxHash: { type: String },
        metadata: {
            requestedAt: { type: Date },
            verifiedAt: { type: Date },
            proofSizeBytes: { type: Number },
        },
    },
    { timestamps: true }
);

ProofHistorySchema.index({ workerDid: 1, proofType: 1 });

export const ProofHistory = mongoose.model<IProofHistory>('ProofHistory', ProofHistorySchema);
