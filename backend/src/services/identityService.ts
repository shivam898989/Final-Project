import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

/**
 * Identity Service — DID Generation & Key Management
 * Implements the Identity Layer of MDTL
 */
export class IdentityService {
    /**
     * Generate a new keypair and create a DID
     * In production, key generation would happen on-device in secure enclave
     */
    static async createIdentity(): Promise<{
        did: string;
        walletAddress: string;
        publicKey: string;
        privateKey: string;
        didDocument: object;
    }> {
        // Generate a new random wallet
        const wallet = ethers.Wallet.createRandom();

        // Create DID from wallet address
        const did = `did:polygon:${wallet.address}`;

        // Build W3C DID Document
        const didDocument = {
            '@context': [
                'https://www.w3.org/ns/did/v1',
                'https://w3id.org/security/suites/ed25519-2020/v1',
            ],
            id: did,
            controller: did,
            verificationMethod: [
                {
                    id: `${did}#keys-1`,
                    type: 'EcdsaSecp256k1VerificationKey2019',
                    controller: did,
                    publicKeyHex: wallet.publicKey,
                },
            ],
            authentication: [`${did}#keys-1`],
            assertionMethod: [`${did}#keys-1`],
            service: [
                {
                    id: `${did}#mdtl-service`,
                    type: 'MDTLWorkerService',
                    serviceEndpoint: 'https://mdtl.network/api',
                },
            ],
            created: new Date().toISOString(),
        };

        return {
            did,
            walletAddress: wallet.address,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            didDocument,
        };
    }

    // =====================================================
    // Galois Field GF(256) arithmetic for Shamir SSS
    // Uses the AES irreducible polynomial: x^8 + x^4 + x^3 + x + 1
    // =====================================================

    private static gf256Add(a: number, b: number): number {
        return a ^ b; // Addition in GF(256) is XOR
    }

    private static gf256Mul(a: number, b: number): number {
        let result = 0;
        let aa = a;
        let bb = b;
        while (bb > 0) {
            if (bb & 1) result ^= aa;
            aa <<= 1;
            if (aa & 0x100) aa ^= 0x11B; // Reduce by irreducible polynomial
            bb >>= 1;
        }
        return result;
    }

    private static gf256Inv(a: number): number {
        if (a === 0) throw new Error('Cannot invert zero in GF(256)');
        // Use extended Euclidean or exponentiation: a^254 = a^(-1) in GF(256)
        let result = a;
        for (let i = 0; i < 6; i++) {
            result = this.gf256Mul(result, result); // square
            result = this.gf256Mul(result, a);       // multiply by a
        }
        result = this.gf256Mul(result, result); // final square: a^254
        return result;
    }

    private static gf256Div(a: number, b: number): number {
        return this.gf256Mul(a, this.gf256Inv(b));
    }

    /**
     * Evaluate a polynomial at point x in GF(256)
     * coefficients[0] is the secret, coefficients[1..] are random
     */
    private static gf256EvalPoly(coefficients: number[], x: number): number {
        let result = 0;
        let xPow = 1; // x^0 = 1
        for (const coeff of coefficients) {
            result = this.gf256Add(result, this.gf256Mul(coeff, xPow));
            xPow = this.gf256Mul(xPow, x);
        }
        return result;
    }

    /**
     * Lagrange interpolation at x=0 in GF(256) to recover the secret
     */
    private static gf256LagrangeInterpolate(points: { x: number; y: number }[]): number {
        let secret = 0;
        for (let i = 0; i < points.length; i++) {
            let numerator = 1;
            let denominator = 1;
            for (let j = 0; j < points.length; j++) {
                if (i !== j) {
                    numerator = this.gf256Mul(numerator, points[j].x);                    // 0 - x_j = x_j in GF(256)
                    denominator = this.gf256Mul(denominator, this.gf256Add(points[i].x, points[j].x)); // x_i - x_j = x_i ^ x_j
                }
            }
            const lagrangeCoeff = this.gf256Div(numerator, denominator);
            secret = this.gf256Add(secret, this.gf256Mul(points[i].y, lagrangeCoeff));
        }
        return secret;
    }

    /**
     * Generate Shamir Secret Sharing shares for key recovery
     * Splits the private key into N shares, any K of which can reconstruct it.
     * Uses real GF(256) polynomial arithmetic.
     */
    static async generateRecoveryShares(
        privateKey: string,
        totalShares: number = 5,
        threshold: number = 3
    ): Promise<{ shares: string[]; threshold: number }> {
        if (threshold > totalShares) throw new Error('Threshold cannot exceed total shares');
        if (threshold < 2) throw new Error('Threshold must be at least 2');
        if (totalShares > 255) throw new Error('Maximum 255 shares supported');

        const keyBytes = Buffer.from(privateKey.slice(2), 'hex');
        const shareBuffers: Buffer[] = [];

        // Initialize share buffers with share index as first byte
        for (let s = 0; s < totalShares; s++) {
            const buf = Buffer.alloc(keyBytes.length + 1);
            buf[0] = s + 1; // x-coordinate (1-indexed, never 0)
            shareBuffers.push(buf);
        }

        // For each byte of the private key, create a random polynomial and evaluate
        for (let byteIdx = 0; byteIdx < keyBytes.length; byteIdx++) {
            // coefficients[0] = secret byte, coefficients[1..threshold-1] = random
            const coefficients: number[] = [keyBytes[byteIdx]];
            const randomBytes = ethers.randomBytes(threshold - 1);
            for (let t = 0; t < threshold - 1; t++) {
                coefficients.push(randomBytes[t]);
            }

            // Evaluate polynomial at x = 1, 2, ..., totalShares
            for (let s = 0; s < totalShares; s++) {
                const x = s + 1;
                shareBuffers[s][byteIdx + 1] = this.gf256EvalPoly(coefficients, x);
            }
        }

        // Encode shares as base64 strings
        const shares = shareBuffers.map(
            (buf, i) => `share-${i + 1}:${buf.toString('base64')}`
        );

        return { shares, threshold };
    }

    /**
     * Recover private key from Shamir shares using Lagrange interpolation in GF(256)
     */
    static async recoverFromShares(shares: string[], threshold: number = 3): Promise<string> {
        if (shares.length < threshold) {
            throw new Error(`Insufficient shares: need ${threshold}, got ${shares.length}`);
        }

        // Parse shares
        const parsedShares = shares.slice(0, threshold).map((share) => {
            const data = Buffer.from(share.split(':')[1], 'base64');
            return { x: data[0], data: data.slice(1) };
        });

        const keyLength = parsedShares[0].data.length;
        const recoveredKey = Buffer.alloc(keyLength);

        // For each byte position, perform Lagrange interpolation at x=0
        for (let byteIdx = 0; byteIdx < keyLength; byteIdx++) {
            const points = parsedShares.map((s) => ({
                x: s.x,
                y: s.data[byteIdx],
            }));
            recoveredKey[byteIdx] = this.gf256LagrangeInterpolate(points);
        }

        return `0x${recoveredKey.toString('hex')}`;
    }

    /**
     * Resolve a DID to its DID Document
     */
    static async resolveDID(did: string): Promise<object> {
        // In production, this queries the blockchain or a DID resolver
        const [, method, address] = did.split(':');

        return {
            '@context': ['https://www.w3.org/ns/did/v1'],
            id: did,
            controller: did,
            verificationMethod: [
                {
                    id: `${did}#keys-1`,
                    type: 'EcdsaSecp256k1VerificationKey2019',
                    controller: did,
                    publicKeyHex: `resolved-from-${method}-${address}`,
                },
            ],
        };
    }

    /**
     * Sign data using a private key
     */
    static async signData(
        data: string,
        privateKey: string
    ): Promise<string> {
        const wallet = new ethers.Wallet(privateKey);
        const messageHash = ethers.hashMessage(data);
        const signature = await wallet.signMessage(data);
        return signature;
    }

    /**
     * Verify a signature against a public key
     */
    static verifySignature(
        data: string,
        signature: string,
        expectedAddress: string
    ): boolean {
        try {
            const recoveredAddress = ethers.verifyMessage(data, signature);
            return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
        } catch {
            return false;
        }
    }
}
