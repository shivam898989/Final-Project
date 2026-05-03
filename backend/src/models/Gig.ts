import mongoose, { Schema, Document } from 'mongoose';

export interface IGig extends Document {
    gigId: string;
    title: string;
    description: string;
    skill: string;
    location: string;
    workHoursEstimate: number;
    payAmount: number;
    payType: 'daily' | 'hourly' | 'fixed';
    posterDid: string;
    posterName: string;
    startDate: string;
    duration: string;
    status: 'open' | 'closed' | 'filled';
    applicants: {
        workerDid: string;
        appliedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const GigSchema = new Schema<IGig>(
    {
        gigId: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        skill: { type: String, required: true, index: true },
        location: { type: String, required: true },
        workHoursEstimate: { type: Number, required: true },
        payAmount: { type: Number, required: true },
        payType: {
            type: String,
            enum: ['daily', 'hourly', 'fixed'],
            default: 'fixed',
        },
        posterDid: { type: String, required: true, index: true },
        posterName: { type: String, required: true },
        startDate: { type: String },
        duration: { type: String },
        status: {
            type: String,
            enum: ['open', 'closed', 'filled'],
            default: 'open',
            index: true,
        },
        applicants: [
            {
                workerDid: { type: String, required: true },
                appliedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

GigSchema.index({ skill: 1, status: 1 });
GigSchema.index({ createdAt: -1 });

export const Gig = mongoose.model<IGig>('Gig', GigSchema);
