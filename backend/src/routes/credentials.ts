import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CredentialService, WorkCredentialData } from '../services/credentialService';
import { IPFSService } from '../services/ipfsService';
import { BlockchainService } from '../services/blockchainService';
import { Credential } from '../models/Credential';

const router = Router();

// Initialize blockchain service for on-chain anchoring
let blockchainService: BlockchainService | null = null;
try {
    blockchainService = new BlockchainService();
} catch (err) {
    console.warn('[Blockchain] Could not initialize — anchoring disabled');
}

/**
 * POST /api/credentials/issue
 * Issue a new verifiable credential
 */
router.post('/issue', async (req: Request, res: Response) => {
    try {
        const {
            workerDid,
            issuerDid,
            issuerPrivateKey,
            skill,
            workHours,
            income,
            period,
            location,
        } = req.body;

        // Validate required fields
        if (!workerDid || !issuerDid || !issuerPrivateKey || !skill || !workHours || !income) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: workerDid, issuerDid, issuerPrivateKey, skill, workHours, income',
            });
            return;
        }

        const credentialData: WorkCredentialData = {
            workerDid,
            issuerDid,
            skill,
            workHours: Number(workHours),
            income: Number(income),
            period: period || {
                start: new Date().toISOString(),
                end: new Date().toISOString(),
            },
            location,
        };

        // Issue and sign credential
        const credential = await CredentialService.issueCredential(credentialData, issuerPrivateKey);

        // Compute hash for on-chain anchoring
        const credentialHash = CredentialService.computeCredentialHash(credential);

        // Store on IPFS
        const ipfsResult = await IPFSService.pinCredential(credential);

        // Anchor credential hash on-chain (Ledger Layer)
        let onChainResult: { txHash: string } | null = null;
        if (blockchainService) {
            try {
                onChainResult = await blockchainService.anchorCredentialHash(credentialHash);
                console.log(`[Blockchain] Credential anchored: ${onChainResult.txHash}`);
            } catch (chainError: any) {
                console.warn('[Blockchain] Anchoring failed:', chainError.message);
            }
        }

        // Save to database
        const credentialId = uuidv4();
        try {
            const credentialDoc = new Credential({
                credentialId,
                workerDid,
                issuerDid,
                credentialType: 'WorkCredential',
                credential,
                ipfsHash: ipfsResult.ipfsHash,
                status: 'active',
            });
            await credentialDoc.save();
        } catch (dbError) {
            console.warn('[DB] Could not save credential — running in demo mode');
        }

        res.status(201).json({
            success: true,
            data: {
                credentialId,
                credential,
                credentialHash,
                ipfs: {
                    hash: ipfsResult.ipfsHash,
                    url: ipfsResult.ipfsUrl,
                    size: ipfsResult.size,
                },
                onChain: onChainResult
                    ? { txHash: onChainResult.txHash, anchored: true }
                    : { anchored: false, note: 'Blockchain unavailable — credential not anchored' },
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/credentials/verify
 * Verify a credential's authenticity
 */
router.post('/verify', async (req: Request, res: Response) => {
    try {
        const { credential, issuerAddress } = req.body;

        if (!credential || !issuerAddress) {
            res.status(400).json({
                success: false,
                error: 'Credential and issuer address required',
            });
            return;
        }

        const result = await CredentialService.verifyCredential(credential, issuerAddress);
        const credentialHash = CredentialService.computeCredentialHash(credential);

        res.json({
            success: true,
            data: {
                isValid: result.isValid,
                errors: result.errors,
                credentialHash,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/credentials/worker/:did
 * Get all credentials for a worker
 */
router.get('/worker/:did', async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        let credentials: any[] = [];
        try {
            credentials = await Credential.find({
                workerDid: decodeURIComponent(did),
                status: 'active',
            }).sort({ createdAt: -1 });
        } catch (dbError) {
            console.warn('[DB] MongoDB unavailable — returning empty credentials list');
        }

        res.json({
            success: true,
            data: {
                count: credentials.length,
                credentials,
                ...(credentials.length === 0 ? { note: 'No credentials found. MongoDB may be unavailable.' } : {}),
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/credentials/batch-anchor
 * Build Merkle tree from credentials and anchor root on-chain
 */
router.post('/batch-anchor', async (req: Request, res: Response) => {
    try {
        const { credentialHashes } = req.body;

        if (!credentialHashes || credentialHashes.length === 0) {
            res.status(400).json({
                success: false,
                error: 'At least one credential hash required',
            });
            return;
        }

        const merkleTree = CredentialService.buildMerkleTree(credentialHashes);

        // Convert proofs map to plain object for JSON serialization
        const proofs: Record<string, { path: string[]; indices: number[] }> = {};
        merkleTree.proofs.forEach((proof, hash) => {
            proofs[hash] = proof;
        });

        res.json({
            success: true,
            data: {
                merkleRoot: merkleTree.root,
                credentialCount: credentialHashes.length,
                proofs,
                note: 'Use the merkleRoot to anchor on-chain via blockchain service',
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/credentials/revoke
 * Revoke a credential
 */
router.post('/revoke', async (req: Request, res: Response) => {
    try {
        const { credentialId, issuerDid } = req.body;

        let credential;
        try {
            credential = await Credential.findOne({ credentialId });
        } catch (dbError) {
            res.status(503).json({
                success: false,
                error: 'Database unavailable — credential revocation requires MongoDB',
            });
            return;
        }

        if (!credential) {
            res.status(404).json({ success: false, error: 'Credential not found' });
            return;
        }

        if (credential.issuerDid !== issuerDid) {
            res.status(403).json({ success: false, error: 'Only the issuer can revoke' });
            return;
        }

        credential.status = 'revoked';
        await credential.save();

        res.json({
            success: true,
            data: { credentialId, status: 'revoked' },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
