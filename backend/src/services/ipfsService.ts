import { ethers } from 'ethers';
import { config } from '../config';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

/**
 * IPFS Service — Decentralized Credential Storage
 * Uses Pinata API for IPFS pinning (or local simulation for development)
 */
export class IPFSService {
    private static readonly GATEWAY = config.ipfs.gateway;

    /**
     * Pin credential data to IPFS
     * Returns the IPFS hash (CID) of the pinned content
     */
    static async pinCredential(credentialData: object): Promise<{
        ipfsHash: string;
        ipfsUrl: string;
        size: number;
    }> {
        const jsonString = JSON.stringify(credentialData);
        const dataSize = Buffer.byteLength(jsonString);

        // Try Pinata API if configured
        if (config.ipfs.apiKey && config.ipfs.apiSecret) {
            return await this.pinToPinata(credentialData);
        }

        // Fallback: simulate IPFS storage using content hash
        const contentHash = ethers.keccak256(ethers.toUtf8Bytes(jsonString));
        // Create a realistic-looking CID from the content hash
        const simulatedCID = `Qm${Buffer.from(contentHash.slice(2), 'hex').toString('base64').replace(/[+/=]/g, '').slice(0, 44)}`;

        console.log(`[IPFS-SIM] Pinned credential: ${simulatedCID} (${dataSize} bytes)`);

        return {
            ipfsHash: simulatedCID,
            ipfsUrl: `${this.GATEWAY}/${simulatedCID}`,
            size: dataSize,
        };
    }

    /**
     * Pin to Pinata IPFS service
     */
    private static async pinToPinata(data: object): Promise<{
        ipfsHash: string;
        ipfsUrl: string;
        size: number;
    }> {
        const body = JSON.stringify({
            pinataContent: data,
            pinataMetadata: {
                name: `mdtl-credential-${Date.now()}`,
            },
        });

        const response = await fetch(`${config.ipfs.apiUrl}/pinning/pinJSONToIPFS`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                pinata_api_key: config.ipfs.apiKey,
                pinata_secret_api_key: config.ipfs.apiSecret,
            },
            body,
        });

        if (!response.ok) {
            throw new Error(`Pinata API error: ${response.statusText}`);
        }

        const result = await response.json() as { IpfsHash: string; PinSize: number };

        return {
            ipfsHash: result.IpfsHash,
            ipfsUrl: `${this.GATEWAY}/${result.IpfsHash}`,
            size: result.PinSize,
        };
    }

    /**
     * Retrieve content from IPFS by hash
     */
    static async getContent(ipfsHash: string): Promise<object | null> {
        try {
            const response = await fetch(`${this.GATEWAY}/${ipfsHash}`);
            if (!response.ok) return null;
            return (await response.json()) as object;
        } catch {
            console.warn(`[IPFS] Failed to retrieve content: ${ipfsHash}`);
            return null;
        }
    }

    // =====================================================
    // AES-256-GCM Encryption for credential-at-rest privacy
    // =====================================================

    /**
     * Derive a 32-byte AES key from the user's encryption key string
     */
    private static deriveAESKey(encryptionKey: string): Buffer {
        return createHash('sha256').update(encryptionKey).digest();
    }

    /**
     * Encrypt credential before storing on IPFS
     * Uses AES-256-GCM for authenticated encryption (confidentiality + integrity)
     */
    static encryptCredential(
        credentialData: object,
        encryptionKey: string
    ): { encrypted: string; iv: string; authTag: string } {
        const jsonString = JSON.stringify(credentialData);
        const key = this.deriveAESKey(encryptionKey);
        const iv = randomBytes(12); // 96-bit IV recommended for GCM

        const cipher = createCipheriv('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([
            cipher.update(jsonString, 'utf-8'),
            cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();

        return {
            encrypted: encrypted.toString('base64'),
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
        };
    }

    /**
     * Decrypt credential retrieved from IPFS
     * Verifies the auth tag to detect tampering
     */
    static decryptCredential(
        encryptedData: string,
        encryptionKey: string,
        iv: string,
        authTag: string
    ): object {
        const key = this.deriveAESKey(encryptionKey);
        const decipher = createDecipheriv(
            'aes-256-gcm',
            key,
            Buffer.from(iv, 'hex')
        );
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedData, 'base64')),
            decipher.final(),
        ]);

        return JSON.parse(decrypted.toString('utf-8'));
    }
}
