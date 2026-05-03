import { ethers } from 'ethers';

/**
 * Crypto utility helpers for the MDTL platform
 */

/**
 * Hash data using keccak256
 */
export function hashData(data: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(data));
}

/**
 * Generate a random bytes32 value
 */
export function randomBytes32(): string {
    return ethers.hexlify(ethers.randomBytes(32));
}

/**
 * Verify an Ethereum signature
 */
export function verifySignature(message: string, signature: string): string {
    return ethers.verifyMessage(message, signature);
}

/**
 * Convert a hex string to a Buffer
 */
export function hexToBuffer(hex: string): Buffer {
    return Buffer.from(hex.replace('0x', ''), 'hex');
}

/**
 * Convert a Buffer to a hex string
 */
export function bufferToHex(buffer: Buffer): string {
    return '0x' + buffer.toString('hex');
}

/**
 * Simple Merkle tree helper used for credential batching
 */
export class SimpleMerkleTree {
    private leaves: string[];
    private layers: string[][];

    constructor(leaves: string[]) {
        this.leaves = leaves.map((l) => (l.startsWith('0x') ? l : hashData(l)));

        // Pad to power of 2
        while (this.leaves.length & (this.leaves.length - 1)) {
            this.leaves.push(ethers.ZeroHash);
        }

        this.layers = [this.leaves];
        this.buildTree();
    }

    private buildTree() {
        let current = this.leaves;
        while (current.length > 1) {
            const next: string[] = [];
            for (let i = 0; i < current.length; i += 2) {
                const left = current[i];
                const right = current[i + 1] || left;
                next.push(
                    ethers.keccak256(ethers.solidityPacked(['bytes32', 'bytes32'], [left, right]))
                );
            }
            this.layers.push(next);
            current = next;
        }
    }

    getRoot(): string {
        return this.layers[this.layers.length - 1][0];
    }

    getProof(index: number): { path: string[]; indices: number[] } {
        const path: string[] = [];
        const indices: number[] = [];
        let idx = index;

        for (let level = 0; level < this.layers.length - 1; level++) {
            const isRight = idx % 2 === 1;
            const siblingIdx = isRight ? idx - 1 : idx + 1;
            if (siblingIdx < this.layers[level].length) {
                path.push(this.layers[level][siblingIdx]);
                indices.push(isRight ? 1 : 0);
            }
            idx = Math.floor(idx / 2);
        }

        return { path, indices };
    }
}
