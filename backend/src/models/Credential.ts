import mongoose, { Schema, Document } from 'mongoose';

export interface ICredential extends Document {
    credentialId: string;
    workerDid: string;
    issuerDid: string;
    credentialType: string;
    credential: {
        '@context': string[];
        type: string[];
        issuer: string;
        issuanceDate: string;
        credentialSubject: {
            id: string;
            skill: string;
            workHours: number;
            income: number;
            period: {
                start: string;
                end: string;
            };
            location?: string;
        };
        proof: {
            type: string;
            created: string;
            verificationMethod: string;
            proofPurpose: string;
            jws: string;
        };
    };
    ipfsHash: string;
    blockchainTxHash: string;
    merkleRoot?: string;
    status: 'active' | 'revoked' | 'expired';
    createdAt: Date;
    updatedAt: Date;
}

const CredentialSchema = new Schema<ICredential>(
    {
        credentialId: { type: String, required: true, unique: true, index: true },
        workerDid: { type: String, required: true, index: true },
        issuerDid: { type: String, required: true, index: true },
        credentialType: { type: String, required: true },
        credential: { type: Schema.Types.Mixed, required: true },
        ipfsHash: { type: String, default: '' },
        blockchainTxHash: { type: String, default: '' },
        merkleRoot: { type: String },
        status: {
            type: String,
            enum: ['active', 'revoked', 'expired'],
            default: 'active',
        },
    },
    { timestamps: true }
);

CredentialSchema.index({ workerDid: 1, issuerDid: 1 });
CredentialSchema.index({ status: 1 });

export const Credential = mongoose.model<ICredential>('Credential', CredentialSchema);
