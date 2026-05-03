# MDTL Platform — Deployment & Operations Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18 | Backend & tooling |
| npm | ≥ 9 | Package management |
| MongoDB | ≥ 7 | Caching & indexing |
| Git | ≥ 2.40 | Version control |
| Circom | ≥ 2.1.6 | ZK circuit compilation |

Optional: Docker, Expo CLI, Hardhat

---

## 1. Smart Contracts

```bash
cd smart-contracts
npm install

# Start local blockchain
npx hardhat node

# Deploy contracts (new terminal)
npx hardhat run scripts/deploy.ts --network localhost

# Run tests
npx hardhat test
```

**Polygon Testnet (Amoy):**
```bash
# Set environment in smart-contracts/.env
# DEPLOYER_PRIVATE_KEY must be the MetaMask account private key, not the public address.
DEPLOYER_PRIVATE_KEY="0xYOUR_64_HEX_CHARACTER_PRIVATE_KEY"
POLYGON_AMOY_RPC="https://rpc-amoy.polygon.technology"

npx hardhat run scripts/deploy.ts --network polygonAmoy
```

For MetaMask, use Polygon Amoy:

| Field | Value |
|-------|-------|
| Network name | Polygon Amoy |
| RPC URL | `https://rpc-amoy.polygon.technology` |
| Chain ID | `80002` |
| Currency symbol | `POL` or `MATIC` |
| Explorer | `https://amoy.polygonscan.com` |

After deployment, copy the printed contract addresses into `backend/.env` and set:

```bash
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=0xYOUR_64_HEX_CHARACTER_PRIVATE_KEY
ISSUER_REGISTRY_ADDRESS=<deployed IssuerRegistry>
CREDENTIAL_REGISTRY_ADDRESS=<deployed CredentialRegistry>
REPUTATION_REGISTRY_ADDRESS=<deployed ReputationRegistry>
PROOF_VERIFIER_ADDRESS=<deployed ProofVerifier>
```

---

## 2. ZK Circuits

```bash
cd zk-circuits
npm install

# Install circom (if not installed)
# See: https://docs.circom.io/getting-started/installation/

# Build all circuits
bash scripts/build.sh
```

This generates proving keys, verification keys, and WASM witnesses in `build/`.

---

## 3. Backend API

```bash
cd backend
npm install

# Copy env template
cp .env.example .env
# Edit .env with your contract addresses and MongoDB URI

# Start development server
npm run dev
# Server runs on http://localhost:3000

# API documentation
open http://localhost:3000/api
```

---

## 4. Mobile Wallet

```bash
cd mobile-wallet
npm install

# Start Expo dev server
npx expo start

# Scan QR with Expo Go app on your phone
# Or press 'w' for web, 'a' for Android emulator
```

---

## 5. Web Portals

```bash
# Issuer Portal — open directly in browser
open issuer-portal/index.html

# Verifier Portal — open directly in browser
open verifier-portal/index.html

# Or serve via any HTTP server:
npx serve issuer-portal -p 3001
npx serve verifier-portal -p 3002
```

---

## Production Deployment

| Component | Platform | Notes |
|-----------|----------|-------|
| Backend API | AWS EC2 / GCP Cloud Run | Docker container recommended |
| MongoDB | MongoDB Atlas | Free tier available |
| IPFS | Pinata (pinning service) | Set API keys in .env |
| Smart Contracts | Polygon PoS Mainnet | Use hardened multisig for deployment |
| Issuer/Verifier Portals | Vercel / Netlify | Static hosting |
| Mobile Wallet | Google Play / App Store | Expo EAS Build |
| Monitoring | Prometheus + Grafana | Container metrics |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Backend port (default: 3000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `POLYGON_RPC_URL` | Yes | Polygon RPC endpoint |
| `DEPLOYER_PRIVATE_KEY` | Yes | Contract deployer key |
| `IPFS_API_KEY` | No | Pinata API key |
| `IPFS_API_SECRET` | No | Pinata secret |
| `JWT_SECRET` | Yes | JWT signing secret |
| `ISSUER_REGISTRY_ADDRESS` | Yes | Deployed contract address |
| `CREDENTIAL_REGISTRY_ADDRESS` | Yes | Deployed contract address |
| `REPUTATION_REGISTRY_ADDRESS` | Yes | Deployed contract address |
| `PROOF_VERIFIER_ADDRESS` | Yes | Deployed contract address |
