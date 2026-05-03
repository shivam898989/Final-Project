import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { IdentityService } from './identityService';

/**
 * Credential Service — W3C Verifiable Credential Issuance & Management
 * Implements the Credential Layer of MDTL
 */

export interface WorkCredentialData {
    workerDid: string;
    issuerDid: string;
    skill: string;
    workHours: number;
    income: number;
    period: {
        start: string;
        end: string;
    };
    location?: string;
}

export interface VerifiableCredential {
    '@context': string[];
    id: string;
    type: string[];
    issuer: string;
    issuanceDate: string;
    expirationDate?: string;
    credentialSubject: {
        id: string;
        skill: string;
        workHours: number;
        income: number;
        period: { start: string; end: string };
        location?: string;
    };
    proof: {
        type: string;
        created: string;
        verificationMethod: string;
        proofPurpose: string;
        jws: string;
    };
}

export class CredentialService {
    /**
     * Issue a new W3C Verifiable Credential
     */
    static async issueCredential(
        data: WorkCredentialData,
        issuerPrivateKey: string
    ): Promise<VerifiableCredential> {
        const credentialId = `urn:uuid:${uuidv4()}`;
        const issuanceDate = new Date().toISOString();

        // Build the credential without proof first
        const credentialWithoutProof = {
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                'https://w3id.org/security/suites/jws-2020/v1',
                'https://mdtl.network/context/v1',
            ],
            id: credentialId,
            type: ['VerifiableCredential', 'WorkCredential'],
            issuer: data.issuerDid,
            issuanceDate,
            credentialSubject: {
                id: data.workerDid,
                skill: data.skill,
                workHours: data.workHours,
                income: data.income,
                period: data.period,
                location: data.location,
            },
        };

        // Sign the credential
        const credentialString = JSON.stringify(credentialWithoutProof);
        const signature = await IdentityService.signData(credentialString, issuerPrivateKey);

        // Build complete VC with proof
        const credential: VerifiableCredential = {
            ...credentialWithoutProof,
            proof: {
                type: 'EcdsaSecp256k1Signature2019',
                created: issuanceDate,
                verificationMethod: `${data.issuerDid}#keys-1`,
                proofPurpose: 'assertionMethod',
                jws: signature,
            },
        };

        return credential;
    }

    /**
     * Verify a credential's signature
     */
    static async verifyCredential(
        credential: VerifiableCredential,
        issuerAddress: string
    ): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

        // Check required fields
        if (!credential['@context'] || !credential.type || !credential.issuer) {
            errors.push('Missing required credential fields');
        }

        if (!credential.proof || !credential.proof.jws) {
            errors.push('Missing proof/signature');
        }

        // Check credential type
        if (!credential.type.includes('WorkCredential')) {
            errors.push('Not a WorkCredential type');
        }

        // Verify signature
        if (credential.proof?.jws) {
            const { proof, ...credentialWithoutProof } = credential;
            const credentialString = JSON.stringify(credentialWithoutProof);
            const isSignatureValid = IdentityService.verifySignature(
                credentialString,
                proof.jws,
                issuerAddress
            );

            if (!isSignatureValid) {
                errors.push('Invalid signature');
            }
        }

        // Check expiration
        if (credential.expirationDate) {
            const expirationDate = new Date(credential.expirationDate);
            if (expirationDate < new Date()) {
                errors.push('Credential has expired');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Compute the hash of a credential for on-chain anchoring
     */
    static computeCredentialHash(credential: VerifiableCredential): string {
        const credentialString = JSON.stringify(credential);
        return ethers.keccak256(ethers.toUtf8Bytes(credentialString));
    }

    /**
     * Build a Merkle tree from credential hashes
     * Returns the root and proof data for each credential
     */
    static buildMerkleTree(credentialHashes: string[]): {
        root: string;
        proofs: Map<string, { path: string[]; indices: number[] }>;
    } {
        if (credentialHashes.length === 0) {
            throw new Error('No credential hashes provided');
        }

        // Pad to power of 2
        const leaves = [...credentialHashes];
        while (leaves.length & (leaves.length - 1)) {
            leaves.push(ethers.ZeroHash);
        }

        // Build tree bottom-up
        const tree: string[][] = [leaves];
        let currentLevel = leaves;

        while (currentLevel.length > 1) {
            const nextLevel: string[] = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = currentLevel[i + 1] || left;
                const combined = ethers.keccak256(
                    ethers.solidityPacked(['bytes32', 'bytes32'], [left, right])
                );
                nextLevel.push(combined);
            }
            tree.push(nextLevel);
            currentLevel = nextLevel;
        }

        const root = tree[tree.length - 1][0];

        // Generate proofs for each original hash
        const proofs = new Map<string, { path: string[]; indices: number[] }>();

        for (let i = 0; i < credentialHashes.length; i++) {
            const path: string[] = [];
            const indices: number[] = [];
            let idx = i;

            for (let level = 0; level < tree.length - 1; level++) {
                const isRight = idx % 2 === 1;
                const siblingIdx = isRight ? idx - 1 : idx + 1;

                if (siblingIdx < tree[level].length) {
                    path.push(tree[level][siblingIdx]);
                    indices.push(isRight ? 1 : 0);
                }

                idx = Math.floor(idx / 2);
            }

            proofs.set(credentialHashes[i], { path, indices });
        }

        return { root, proofs };
    }
}
