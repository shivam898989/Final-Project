import { ethers } from 'ethers';
import { config } from '../config';

// ABI fragments for our contracts
const ISSUER_REGISTRY_ABI = [
    'function registerIssuer(address issuerAddress, string did, string organizationName) external',
    'function revokeIssuer(address issuerAddress) external',
    'function isIssuer(address issuerAddress) external view returns (bool)',
    'function getIssuer(address issuerAddress) external view returns (string did, string organizationName, bool isActive, uint256 registeredAt)',
    'function getIssuerCount() external view returns (uint256)',
    'event IssuerRegistered(address indexed issuerAddress, string did, string organizationName)',
];

const CREDENTIAL_REGISTRY_ABI = [
    'function anchorCredentialHash(bytes32 credentialHash) external',
    'function anchorMerkleRoot(bytes32 merkleRoot, uint256 credentialCount) external',
    'function verifyCredentialHash(bytes32 credentialHash) external view returns (bool exists, address issuer, uint256 timestamp)',
    'function verifyMerkleRoot(bytes32 merkleRoot) external view returns (bool exists, address issuer, uint256 credentialCount, uint256 timestamp)',
    'event CredentialAnchored(bytes32 indexed credentialHash, address indexed issuer, uint256 timestamp)',
    'event MerkleRootAnchored(bytes32 indexed merkleRoot, address indexed issuer, uint256 credentialCount, uint256 timestamp)',
];

const REPUTATION_REGISTRY_ABI = [
    'function updateReputation(address issuer, uint256 validCredentials, uint256 totalCredentials, uint256 endorsements) external',
    'function endorseIssuer(address issuer) external',
    'function reportFraud(address issuer, string reason) external',
    'function getReputation(address issuer) external view returns (uint256 validCredentials, uint256 totalCredentials, uint256 endorsements, uint256 score, uint256 lastUpdated)',
    'function getScore(address issuer) external view returns (uint256)',
];

const PROOF_VERIFIER_ABI = [
    'function verifyProof(uint8 proofType, uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[] publicSignals) external returns (bytes32 verificationId, bool isValid)',
    'function getVerificationResult(bytes32 verificationId) external view returns (bool isValid, uint8 proofType, address verifier, uint256 timestamp)',
    'function getVerificationCount() external view returns (uint256)',
];

/**
 * Blockchain Service — Smart Contract Interaction Layer
 * Handles all on-chain operations for MDTL
 */
export class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private signer?: ethers.Wallet;
    private issuerRegistry?: ethers.Contract;
    private credentialRegistry?: ethers.Contract;
    private reputationRegistry?: ethers.Contract;
    private proofVerifier?: ethers.Contract;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(config.polygonRpcUrl);
        if (config.deployerPrivateKey) {
            if (/^0x[a-fA-F0-9]{40}$/.test(config.deployerPrivateKey)) {
                throw new Error(
                    'DEPLOYER_PRIVATE_KEY contains a wallet address. Use the private key for that funded MetaMask account.'
                );
            }
            if (!/^0x[a-fA-F0-9]{64}$/.test(config.deployerPrivateKey)) {
                throw new Error(
                    'DEPLOYER_PRIVATE_KEY must be 0x followed by 64 hexadecimal characters.'
                );
            }
            this.signer = new ethers.Wallet(config.deployerPrivateKey, this.provider);
        }
        this.initContracts();
    }

    private initContracts() {
        const runner = this.signer || this.provider;

        if (config.contracts.issuerRegistry) {
            this.issuerRegistry = new ethers.Contract(
                config.contracts.issuerRegistry,
                ISSUER_REGISTRY_ABI,
                runner
            );
        }
        if (config.contracts.credentialRegistry) {
            this.credentialRegistry = new ethers.Contract(
                config.contracts.credentialRegistry,
                CREDENTIAL_REGISTRY_ABI,
                runner
            );
        }
        if (config.contracts.reputationRegistry) {
            this.reputationRegistry = new ethers.Contract(
                config.contracts.reputationRegistry,
                REPUTATION_REGISTRY_ABI,
                runner
            );
        }
        if (config.contracts.proofVerifier) {
            this.proofVerifier = new ethers.Contract(
                config.contracts.proofVerifier,
                PROOF_VERIFIER_ABI,
                runner
            );
        }
    }

    private requireSigner() {
        if (!this.signer) {
            throw new Error(
                'DEPLOYER_PRIVATE_KEY is required for blockchain write transactions.'
            );
        }
    }

    // ===========================
    // Issuer Registry Operations
    // ===========================

    async registerIssuer(
        issuerAddress: string,
        did: string,
        organizationName: string
    ): Promise<{ txHash: string }> {
        if (!this.issuerRegistry) throw new Error('IssuerRegistry not configured');
        this.requireSigner();
        const tx = await this.issuerRegistry.registerIssuer(issuerAddress, did, organizationName);
        const receipt = await tx.wait();
        return { txHash: receipt.hash };
    }

    async checkIsIssuer(address: string): Promise<boolean> {
        if (!this.issuerRegistry) return false;
        return await this.issuerRegistry.isIssuer(address);
    }

    async getIssuerDetails(address: string) {
        if (!this.issuerRegistry) throw new Error('IssuerRegistry not configured');
        const [did, orgName, isActive, registeredAt] = await this.issuerRegistry.getIssuer(address);
        return { did, organizationName: orgName, isActive, registeredAt: Number(registeredAt) };
    }

    // ===========================
    // Credential Registry Operations
    // ===========================

    async anchorCredentialHash(credentialHash: string): Promise<{ txHash: string }> {
        if (!this.credentialRegistry) throw new Error('CredentialRegistry not configured');
        this.requireSigner();
        const tx = await this.credentialRegistry.anchorCredentialHash(credentialHash);
        const receipt = await tx.wait();
        return { txHash: receipt.hash };
    }

    async anchorMerkleRoot(
        merkleRoot: string,
        credentialCount: number
    ): Promise<{ txHash: string }> {
        if (!this.credentialRegistry) throw new Error('CredentialRegistry not configured');
        this.requireSigner();
        const tx = await this.credentialRegistry.anchorMerkleRoot(merkleRoot, credentialCount);
        const receipt = await tx.wait();
        return { txHash: receipt.hash };
    }

    async verifyCredentialOnChain(credentialHash: string) {
        if (!this.credentialRegistry) throw new Error('CredentialRegistry not configured');
        const [exists, issuer, timestamp] =
            await this.credentialRegistry.verifyCredentialHash(credentialHash);
        return { exists, issuer, timestamp: Number(timestamp) };
    }

    // ===========================
    // Reputation Operations
    // ===========================

    async getReputationScore(issuerAddress: string) {
        if (!this.reputationRegistry) throw new Error('ReputationRegistry not configured');
        const [validCreds, totalCreds, endorsements, score, lastUpdated] =
            await this.reputationRegistry.getReputation(issuerAddress);
        return {
            validCredentials: Number(validCreds),
            totalCredentials: Number(totalCreds),
            endorsements: Number(endorsements),
            score: Number(score),
            lastUpdated: Number(lastUpdated),
        };
    }

    async endorseIssuer(issuerAddress: string): Promise<{ txHash: string }> {
        if (!this.reputationRegistry) throw new Error('ReputationRegistry not configured');
        this.requireSigner();
        const tx = await this.reputationRegistry.endorseIssuer(issuerAddress);
        const receipt = await tx.wait();
        return { txHash: receipt.hash };
    }

    // ===========================
    // Proof Verification Operations
    // ===========================

    async verifyProofOnChain(
        proofType: number,
        a: [bigint, bigint],
        b: [[bigint, bigint], [bigint, bigint]],
        c: [bigint, bigint],
        publicSignals: bigint[]
    ): Promise<{ verificationId: string; isValid: boolean; txHash: string }> {
        if (!this.proofVerifier) throw new Error('ProofVerifier not configured');
        this.requireSigner();
        const tx = await this.proofVerifier.verifyProof(proofType, a, b, c, publicSignals);
        const receipt = await tx.wait();

        // Parse events from receipt
        const event = receipt.logs[0];
        return {
            verificationId: event.topics[1] || '',
            isValid: true,
            txHash: receipt.hash,
        };
    }

    /**
     * Get connection status
     */
    async getStatus(): Promise<{
        connected: boolean;
        network: string;
        blockNumber: number;
    }> {
        try {
            const network = await this.provider.getNetwork();
            const blockNumber = await this.provider.getBlockNumber();
            return {
                connected: true,
                network: network.name,
                blockNumber,
            };
        } catch (error) {
            return { connected: false, network: 'unknown', blockNumber: 0 };
        }
    }
}
