# MDTL Platform — Deployment & Operations Guide

## 🌐 Live Demo URLs

| Service | URL | Platform |
|---------|-----|----------|
| Backend API | https://mdtl-backend.onrender.com | Render |
| Issuer Portal | https://mdtl-issuer.vercel.app | Vercel |
| Verifier Portal | https://mdtl-verifier.vercel.app | Vercel |
| Admin Hub | https://mdtl-admin.vercel.app | Vercel |
| API Health | https://mdtl-backend.onrender.com/health | Render |
| API Docs | https://mdtl-backend.onrender.com/api | Render |
| Blockchain Explorer | https://amoy.polygonscan.com | Polygon |

> **Note:** Render free tier spins down after 15 min idle — first request may take ~30-60 seconds.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18 | Backend & tooling |
| npm | ≥ 9 | Package management |
| Git | ≥ 2.40 | Version control |

Optional: MongoDB (local), Expo CLI, Hardhat, Circom

---

## Local Development

### 1. Smart Contracts

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

### 2. Backend API

```bash
cd backend
npm install

# Copy env template
cp .env.example .env
# Edit .env with your contract addresses and MongoDB URI

# Start development server
npm run dev
# Server runs on http://localhost:3000
```

### 3. Web Portals

```bash
# Issuer Portal — open directly in browser
open issuer-portal/index.html

# Verifier Portal — open directly in browser
open verifier-portal/index.html

# Or serve via any HTTP server:
npx serve issuer-portal -p 3001
npx serve verifier-portal -p 3002
```

### 4. Mobile Wallet

```bash
cd mobile-wallet
npm install
npx expo start
# Scan QR with Expo Go app on your phone
```

---

## ☁️ Cloud Deployment Guide

### Step 1: Set Up MongoDB Atlas (Free Cluster)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and log in
2. Click **"Build a Database"** → Select **M0 Free** tier
3. Choose **AWS** provider, **Mumbai (ap-south-1)** region
4. Cluster name: `mdtl-cluster` → Click **"Create Cluster"**
5. **Database Access**: Create user `mdtl-admin` with a strong password
6. **Network Access**: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
7. Click **"Connect"** → **"Drivers"** → Copy connection string:
   ```
   mongodb+srv://mdtl-admin:<password>@mdtl-cluster.xxxxx.mongodb.net/mdtl?retryWrites=true&w=majority
   ```

### Step 2: Deploy Backend to Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → Select **`shivam898989/Final-Project`**
4. Configure:
   - **Name**: `mdtl-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**
5. Add Environment Variables:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |
   | `MONGODB_URI` | *(Atlas connection string from Step 1)* |
   | `POLYGON_RPC_URL` | `https://rpc-amoy.polygon.technology` |
   | `JWT_SECRET` | `mdtl-production-secret-key-2026` |
   | `DEPLOYER_PRIVATE_KEY` | `0x4369bda8198787b2323d77a320fae084db4de761a7180cca1316972846360256` |
   | `ISSUER_REGISTRY_ADDRESS` | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
   | `CREDENTIAL_REGISTRY_ADDRESS` | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
   | `REPUTATION_REGISTRY_ADDRESS` | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |
   | `PROOF_VERIFIER_ADDRESS` | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |

6. Click **"Create Web Service"** — wait ~2-3 min for build
7. Your API will be live at: `https://mdtl-backend.onrender.com`

> **Note:** After deploying smart contracts to Polygon Amoy (Step 4), update the contract addresses above.

### Step 3: Deploy Portals to Vercel

For **each portal** (issuer-portal, verifier-portal, admin-hub):

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New…"** → **"Project"**
3. Import from GitHub: **`shivam898989/Final-Project`**
4. Configure:
   - **Project Name**: `mdtl-issuer` (or `mdtl-verifier` / `mdtl-admin`)
   - **Root Directory**: Click **Edit** → `issuer-portal` (or `verifier-portal` / `admin-hub`)
   - **Framework Preset**: `Other`
   - **Build Command**: *(leave empty)*
   - **Output Directory**: `.`
5. Click **"Deploy"**

**Alternative — Vercel CLI:**
```powershell
cd C:\Users\Shivam Sharma\Desktop\mdtl-platform\issuer-portal
npx vercel --yes --name mdtl-issuer

cd ..\verifier-portal
npx vercel --yes --name mdtl-verifier

cd ..\admin-hub
npx vercel --yes --name mdtl-admin
```

### Step 4: Deploy Smart Contracts to Polygon Amoy (Optional)

> **Prerequisite:** Fund your wallet with test POL from [faucet.polygon.technology](https://faucet.polygon.technology/)

```bash
cd smart-contracts
npx hardhat run scripts/deploy.ts --network polygonAmoy
```

After deployment, update contract addresses in Render dashboard environment variables.

For MetaMask, add Polygon Amoy:

| Field | Value |
|-------|-------|
| Network name | Polygon Amoy |
| RPC URL | `https://rpc-amoy.polygon.technology` |
| Chain ID | `80002` |
| Currency | `POL` |
| Explorer | `https://amoy.polygonscan.com` |

### Step 5: Update Backend URL (If Different)

If your Render URL is NOT `mdtl-backend.onrender.com`, update `API_BASE` in:
- `issuer-portal/index.html` (line ~1117)
- `verifier-portal/index.html` (line ~1215)
- `admin-hub/index.html` (line ~335)

Then redeploy the portals.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Backend port (default: 3000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `POLYGON_RPC_URL` | Yes | Polygon RPC endpoint |
| `DEPLOYER_PRIVATE_KEY` | Yes | Contract deployer key |
| `JWT_SECRET` | Yes | JWT signing secret |
| `ISSUER_REGISTRY_ADDRESS` | Yes | Deployed contract address |
| `CREDENTIAL_REGISTRY_ADDRESS` | Yes | Deployed contract address |
| `REPUTATION_REGISTRY_ADDRESS` | Yes | Deployed contract address |
| `PROOF_VERIFIER_ADDRESS` | Yes | Deployed contract address |
| `IPFS_API_KEY` | No | Pinata API key |
| `IPFS_API_SECRET` | No | Pinata secret |

---

## Architecture

| Component | Technology | Hosting |
|-----------|-----------|---------|
| Backend API | Node.js + Express + TypeScript | Render (Free) |
| Database | MongoDB | Atlas (Free M0) |
| Smart Contracts | Solidity + Hardhat | Polygon Amoy Testnet |
| ZK Circuits | Circom + snarkjs | Compiled locally |
| Issuer Portal | HTML + CSS + JS | Vercel (Static) |
| Verifier Portal | HTML + CSS + JS | Vercel (Static) |
| Admin Hub | HTML + CSS + JS | Vercel (Static) |
| Mobile Wallet | React Native + Expo | Expo Go / EAS Build |
