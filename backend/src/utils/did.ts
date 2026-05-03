/**
 * DID utility helpers
 */

/**
 * Parse a DID string into its components
 */
export function parseDID(did: string): {
    method: string;
    identifier: string;
    fullDID: string;
} {
    const parts = did.split(':');
    if (parts.length < 3 || parts[0] !== 'did') {
        throw new Error(`Invalid DID format: ${did}`);
    }
    return {
        method: parts[1],
        identifier: parts.slice(2).join(':'),
        fullDID: did,
    };
}

/**
 * Validate DID format
 */
export function isValidDID(did: string): boolean {
    try {
        parseDID(did);
        return true;
    } catch {
        return false;
    }
}

/**
 * Create a DID from method and identifier
 */
export function createDID(method: string, identifier: string): string {
    return `did:${method}:${identifier}`;
}

/**
 * Build a minimal DID document
 */
export function buildDIDDocument(
    did: string,
    publicKeyHex: string,
    serviceEndpoint?: string
) {
    return {
        '@context': ['https://www.w3.org/ns/did/v1'],
        id: did,
        controller: did,
        verificationMethod: [
            {
                id: `${did}#keys-1`,
                type: 'EcdsaSecp256k1VerificationKey2019',
                controller: did,
                publicKeyHex,
            },
        ],
        authentication: [`${did}#keys-1`],
        assertionMethod: [`${did}#keys-1`],
        ...(serviceEndpoint
            ? {
                service: [
                    {
                        id: `${did}#mdtl`,
                        type: 'MDTLService',
                        serviceEndpoint,
                    },
                ],
            }
            : {}),
    };
}
