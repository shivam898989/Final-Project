import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectDatabase } from './config/database';
import { errorHandler, requestLogger } from './middleware/auth';

// Import routes
import identityRoutes from './routes/identity';
import credentialRoutes from './routes/credentials';
import proofRoutes from './routes/proofs';
import issuerRoutes from './routes/issuers';
import gigRoutes from './routes/gigs';

const app = express();

// ===========================
// Security Middleware
// ===========================
app.use(helmet());
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'http://localhost:3001',  // Issuer Portal (local)
            'http://localhost:3002',  // Verifier Portal (local)
            'http://localhost:3003',  // Client Portal (local)
            'http://localhost:3004',  // Admin Portal (local)
            'http://localhost:19006', // Mobile Wallet (Expo Web)
            'http://localhost:8081',  // Expo Dev Server
        ];
        // Allow any .vercel.app subdomain (deployed portals)
        if (!origin || allowedOrigins.includes(origin) ||
            /\.vercel\.app$/.test(origin) ||
            /\.onrender\.com$/.test(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins for demo — tighten in production
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ===========================
// API Routes
// ===========================
app.use('/api/identity', identityRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/proofs', proofRoutes);
app.use('/api/issuers', issuerRoutes);
app.use('/api/gigs', gigRoutes);

// ===========================
// Health & Status Endpoints
// ===========================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'MDTL Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/status', async (req, res) => {
    const { BlockchainService } = await import('./services/blockchainService');
    const blockchain = new BlockchainService();
    const blockchainStatus = await blockchain.getStatus();

    res.json({
        status: 'ok',
        service: 'MDTL Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        components: {
            blockchain: blockchainStatus,
            database: {
                connected: (await import('mongoose')).default.connection.readyState === 1,
            },
        },
        endpoints: {
            identity: '/api/identity',
            credentials: '/api/credentials',
            proofs: '/api/proofs',
            issuers: '/api/issuers',
        },
    });
});

// ===========================
// API Documentation endpoint
// ===========================
app.get('/api', (req, res) => {
    res.json({
        service: 'MDTL — Majdoor Digital Trust-Ledger API',
        version: '1.0.0',
        description: 'Decentralized credential & ZK proof infrastructure for informal workers',
        endpoints: {
            identity: {
                'POST /api/identity/create': 'Create a new DID + keypair',
                'POST /api/identity/recover': 'Recover identity from Shamir shares',
                'POST /api/identity/resolve': 'Resolve a DID to its document',
                'POST /api/identity/sign': 'Sign data with private key',
                'POST /api/identity/verify': 'Verify a signature',
            },
            credentials: {
                'POST /api/credentials/issue': 'Issue a verifiable credential',
                'POST /api/credentials/verify': 'Verify a credential',
                'GET /api/credentials/worker/:did': 'Get worker credentials',
                'POST /api/credentials/batch-anchor': 'Build Merkle tree for batch anchoring',
                'POST /api/credentials/revoke': 'Revoke a credential',
            },
            proofs: {
                'POST /api/proofs/generate': 'Generate a ZK proof',
                'POST /api/proofs/verify': 'Verify a ZK proof',
                'GET /api/proofs/history/:did': 'Get proof history',
                'GET /api/proofs/estimate/:type': 'Estimate proof generation time',
            },
            issuers: {
                'POST /api/issuers/register': 'Register a credential issuer',
                'GET /api/issuers/:did': 'Get issuer details',
                'GET /api/issuers/:did/reputation': 'Get issuer reputation',
                'GET /api/issuers': 'List all issuers',
            },
            gigs: {
                'GET /api/gigs': 'List all open gigs (filter with ?skill=)',
                'GET /api/gigs/:gigId': 'Get gig details',
                'POST /api/gigs': 'Post a new gig',
                'POST /api/gigs/:gigId/apply': 'Apply to a gig',
            },
        },
    });
});

// ===========================
// Error Handling
// ===========================
app.use(errorHandler);

// ===========================
// Start Server
// ===========================
async function start() {
    // Connect to database
    await connectDatabase();

    app.listen(config.port, () => {
        console.log('');
        console.log('========================================');
        console.log('  MDTL Backend API Server');
        console.log('========================================');
        console.log(`  Environment: ${config.nodeEnv}`);
        console.log(`  Port:        ${config.port}`);
        console.log(`  API Docs:    http://localhost:${config.port}/api`);
        console.log(`  Health:      http://localhost:${config.port}/health`);
        console.log('========================================');
        console.log('');
    });
}

start().catch(console.error);

export default app;
