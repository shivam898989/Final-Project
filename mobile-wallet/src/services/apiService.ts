const API_BASE = 'http://localhost:3000/api';

/**
 * API Service — Communicates with MDTL Backend
 * Handles offline fallback for low-connectivity environments
 */
export class ApiService {
    private static token: string = '';

    static setToken(token: string) {
        this.token = token;
    }

    private static async request(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<any> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers: { ...headers, ...options.headers as Record<string, string> },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }
            return data;
        } catch (error: any) {
            if (error.message === 'Network request failed') {
                console.warn('[API] Offline — using local data');
                return { success: false, offline: true, error: 'No internet connection' };
            }
            throw error;
        }
    }

    // Identity endpoints
    static async createIdentity(name?: string, language?: string) {
        return this.request('/identity/create', {
            method: 'POST',
            body: JSON.stringify({ name, language }),
        });
    }

    static async recoverIdentity(shares: string[]) {
        return this.request('/identity/recover', {
            method: 'POST',
            body: JSON.stringify({ shares }),
        });
    }

    // Credential endpoints
    static async getWorkerCredentials(did: string) {
        return this.request(`/credentials/worker/${encodeURIComponent(did)}`);
    }

    static async issueCredential(data: any) {
        return this.request('/credentials/issue', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Proof endpoints
    static async generateProof(proofType: string, publicInputs: any, privateInputs: any) {
        return this.request('/proofs/generate', {
            method: 'POST',
            body: JSON.stringify({ proofType, publicInputs, privateInputs }),
        });
    }

    static async verifyProof(proofType: string, proof: any, publicSignals: string[]) {
        return this.request('/proofs/verify', {
            method: 'POST',
            body: JSON.stringify({ proofType, proof, publicSignals }),
        });
    }

    static async getProofHistory(did: string) {
        return this.request(`/proofs/history/${encodeURIComponent(did)}`);
    }

    static async getProofEstimate(type: string) {
        return this.request(`/proofs/estimate/${type}`);
    }

    // Issuer endpoints
    static async getIssuers() {
        return this.request('/issuers');
    }

    // Gig endpoints
    static async getGigs(skill?: string) {
        const query = skill ? `?skill=${encodeURIComponent(skill)}` : '';
        return this.request(`/gigs${query}`);
    }

    static async getGigDetails(gigId: string) {
        return this.request(`/gigs/${gigId}`);
    }

    static async applyToGig(gigId: string, workerDid: string) {
        return this.request(`/gigs/${gigId}/apply`, {
            method: 'POST',
            body: JSON.stringify({ workerDid }),
        });
    }
}
