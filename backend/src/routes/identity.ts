import { Router, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IdentityService } from '../services/identityService';
import { Worker } from '../models/Worker';
import { config } from '../config';

const jwtOptions: SignOptions = { expiresIn: config.jwt.expiry as any };

const router = Router();

/**
 * POST /api/identity/create
 * Create a new decentralized identity (DID + keypair)
 */
router.post('/create', async (req: Request, res: Response) => {
    try {
        const { name, language } = req.body;

        // Generate identity
        const identity = await IdentityService.createIdentity();

        // Generate recovery shares
        const recovery = await IdentityService.generateRecoveryShares(identity.privateKey);

        // Save to database (if connected)
        try {
            const worker = new Worker({
                did: identity.did,
                walletAddress: identity.walletAddress,
                publicKey: identity.publicKey,
                shamirShares: recovery.shares,
                metadata: { name, language: language || 'en' },
            });
            await worker.save();
        } catch (dbError) {
            console.warn('[DB] Could not save worker — running in demo mode');
        }

        // Generate JWT token
        const token = jwt.sign(
            { did: identity.did, walletAddress: identity.walletAddress },
            config.jwt.secret,
            jwtOptions
        );

        res.status(201).json({
            success: true,
            data: {
                did: identity.did,
                walletAddress: identity.walletAddress,
                publicKey: identity.publicKey,
                privateKey: identity.privateKey, // In production: encrypted / excluded
                didDocument: identity.didDocument,
                recovery: {
                    shares: recovery.shares,
                    threshold: recovery.threshold,
                    totalShares: recovery.shares.length,
                    warning: 'Store these shares separately. You need 3 of 5 to recover your wallet.',
                },
                token,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/identity/recover
 * Recover identity from Shamir shares
 */
router.post('/recover', async (req: Request, res: Response) => {
    try {
        const { shares } = req.body;

        if (!shares || shares.length < 3) {
            res.status(400).json({
                success: false,
                error: 'At least 3 recovery shares required',
            });
            return;
        }

        const privateKey = await IdentityService.recoverFromShares(shares);

        // Derive address from recovered key
        const { ethers } = await import('ethers');
        const wallet = new ethers.Wallet(privateKey);
        const did = `did:polygon:${wallet.address}`;

        const token = jwt.sign(
            { did, walletAddress: wallet.address },
            config.jwt.secret,
            jwtOptions
        );

        res.json({
            success: true,
            data: {
                did,
                walletAddress: wallet.address,
                publicKey: wallet.signingKey.publicKey,
                token,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/identity/resolve
 * Resolve a DID to its DID Document
 */
router.post('/resolve', async (req: Request, res: Response) => {
    try {
        const { did } = req.body;

        if (!did) {
            res.status(400).json({ success: false, error: 'DID required' });
            return;
        }

        const didDocument = await IdentityService.resolveDID(did);

        res.json({
            success: true,
            data: { didDocument },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/identity/sign
 * Sign data using the caller's private key
 */
router.post('/sign', async (req: Request, res: Response) => {
    try {
        const { data, privateKey } = req.body;

        if (!data || !privateKey) {
            res.status(400).json({ success: false, error: 'Data and private key required' });
            return;
        }

        const signature = await IdentityService.signData(data, privateKey);

        res.json({
            success: true,
            data: { signature },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/identity/verify
 * Verify a signature
 */
router.post('/verify', async (req: Request, res: Response) => {
    try {
        const { data, signature, address } = req.body;

        if (!data || !signature || !address) {
            res.status(400).json({
                success: false,
                error: 'Data, signature, and address required',
            });
            return;
        }

        const isValid = IdentityService.verifySignature(data, signature, address);

        res.json({
            success: true,
            data: { isValid },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
