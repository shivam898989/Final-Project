import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // MongoDB
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mdtl',

    // Blockchain
    polygonRpcUrl: process.env.POLYGON_RPC_URL || 'http://127.0.0.1:8545',
    deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY || '',

    // Contract Addresses
    contracts: {
        issuerRegistry: process.env.ISSUER_REGISTRY_ADDRESS || '',
        credentialRegistry: process.env.CREDENTIAL_REGISTRY_ADDRESS || '',
        reputationRegistry: process.env.REPUTATION_REGISTRY_ADDRESS || '',
        proofVerifier: process.env.PROOF_VERIFIER_ADDRESS || '',
    },

    // IPFS
    ipfs: {
        apiUrl: process.env.IPFS_API_URL || 'https://api.pinata.cloud',
        apiKey: process.env.IPFS_API_KEY || '',
        apiSecret: process.env.IPFS_API_SECRET || '',
        gateway: process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs',
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'mdtl-dev-secret',
        expiry: process.env.JWT_EXPIRY || '24h',
    },

    // ZK Circuits
    zkCircuitsPath: process.env.ZK_CIRCUITS_PATH || '../zk-circuits/build',
};
