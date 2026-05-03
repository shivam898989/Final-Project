import { Router, Request, Response } from 'express';
import { IdentityService } from '../services/identityService';
import { Issuer } from '../models/Issuer';
import { Credential } from '../models/Credential';

const router = Router();

/**
 * POST /api/issuers/register
 * Register a new credential issuer (NGO/employer)
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { organizationName, description, website, contactEmail } = req.body;

        if (!organizationName) {
            res.status(400).json({ success: false, error: 'Organization name required' });
            return;
        }

        // Generate issuer identity
        const identity = await IdentityService.createIdentity();

        // Save to database
        try {
            const issuer = new Issuer({
                did: identity.did,
                walletAddress: identity.walletAddress,
                organizationName,
                publicKey: identity.publicKey,
                metadata: { description, website, contactEmail },
            });
            await issuer.save();
        } catch (dbError) {
            console.warn('[DB] Could not save issuer — running in demo mode');
        }

        res.status(201).json({
            success: true,
            data: {
                did: identity.did,
                walletAddress: identity.walletAddress,
                publicKey: identity.publicKey,
                privateKey: identity.privateKey, // In production: provide securely
                organizationName,
                didDocument: identity.didDocument,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/issuers/:did
 * Get issuer details
 */
router.get('/:did', async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        const issuer = await Issuer.findOne({ did: decodeURIComponent(did) });

        if (!issuer) {
            res.status(404).json({ success: false, error: 'Issuer not found' });
            return;
        }

        res.json({
            success: true,
            data: issuer,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/issuers/:did/reputation
 * Get issuer reputation score
 */
router.get('/:did/reputation', async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        const issuer = await Issuer.findOne({ did: decodeURIComponent(did) });

        if (!issuer) {
            res.status(404).json({ success: false, error: 'Issuer not found' });
            return;
        }

        // Calculate reputation
        const totalCreds = issuer.totalCredentials || 1;
        const validCreds = issuer.validCredentials || 0;
        const endorsements = issuer.endorsements || 0;
        const score = Math.floor((validCreds * 100 / totalCreds) * endorsements);

        res.json({
            success: true,
            data: {
                did: issuer.did,
                organizationName: issuer.organizationName,
                validCredentials: validCreds,
                totalCredentials: totalCreds,
                endorsements,
                reputationScore: score,
                isActive: issuer.isActive,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/issuers
 * List all registered issuers
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const issuers = await Issuer.find({ isActive: true })
            .select('did organizationName reputationScore isActive createdAt')
            .sort({ reputationScore: -1 });

        res.json({
            success: true,
            data: {
                count: issuers.length,
                issuers,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
