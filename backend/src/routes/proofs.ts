import { Router, Request, Response } from 'express';
import { ZKPService } from '../services/zkpService';
import { ProofHistory } from '../models/ProofHistory';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/proofs/generate
 * Generate a zero-knowledge proof
 */
router.post('/generate', async (req: Request, res: Response) => {
    try {
        const { proofType, publicInputs, privateInputs, workerDid } = req.body;

        if (!proofType || !publicInputs || !privateInputs) {
            res.status(400).json({
                success: false,
                error: 'proofType, publicInputs, and privateInputs required',
            });
            return;
        }

        // Validate proof type
        const validTypes = ['income', 'workHours', 'trustedIssuer'];
        if (!validTypes.includes(proofType)) {
            res.status(400).json({
                success: false,
                error: `Invalid proof type. Must be one of: ${validTypes.join(', ')}`,
            });
            return;
        }

        // Get time estimate
        const estimate = ZKPService.estimateProofTime(proofType);

        // Generate proof
        const result = await ZKPService.generateProof({
            proofType,
            publicInputs,
            privateInputs,
        });

        res.json({
            success: true,
            data: {
                proofId: result.proofId,
                proof: result.proof,
                publicSignals: result.publicSignals,
                generationTimeMs: result.generationTimeMs,
                circuitInfo: estimate,
                note: 'Share the proof and publicSignals with the verifier. No private data is revealed.',
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/proofs/verify
 * Verify a zero-knowledge proof
 */
router.post('/verify', async (req: Request, res: Response) => {
    try {
        const { proofType, proof, publicSignals, verifierDid, workerDid } = req.body;

        if (!proofType || !proof || !publicSignals) {
            res.status(400).json({
                success: false,
                error: 'proofType, proof, and publicSignals required',
            });
            return;
        }

        const result = await ZKPService.verifyProof(proofType, proof, publicSignals);

        // Record in proof history
        const proofId = uuidv4();
        try {
            const proofRecord = new ProofHistory({
                proofId,
                workerDid: workerDid || 'unknown',
                verifierDid: verifierDid || 'unknown',
                proofType,
                publicSignals,
                result: result.isValid,
                metadata: {
                    requestedAt: new Date(),
                    verifiedAt: new Date(),
                },
            });
            await proofRecord.save();
        } catch (dbError) {
            console.warn('[DB] Could not save proof history — running in demo mode');
        }

        res.json({
            success: true,
            data: {
                proofId,
                isValid: result.isValid,
                proofType: result.proofType,
                publicSignals: result.publicSignals,
                verifiedAt: result.verifiedAt,
                rawDataRevealed: false,
                note: result.isValid
                    ? 'Proof is VALID. The claim is verified without revealing any private data.'
                    : 'Proof is INVALID. The claim could not be verified.',
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/proofs/history/:did
 * Get proof history for a worker
 */
router.get('/history/:did', async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        const history = await ProofHistory.find({
            workerDid: decodeURIComponent(did),
        }).sort({ createdAt: -1 }).limit(50);

        res.json({
            success: true,
            data: {
                count: history.length,
                history,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/proofs/estimate/:type
 * Get estimated proof generation time
 */
router.get('/estimate/:type', (req: Request, res: Response) => {
    const { type } = req.params;
    const estimate = ZKPService.estimateProofTime(type);

    res.json({
        success: true,
        data: estimate,
    });
});

export default router;
