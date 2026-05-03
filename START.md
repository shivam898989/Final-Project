# 🚀 MDTL Platform — Complete Startup Guide

## Prerequisites

- **Node.js** v18+ installed
- **npm** installed
- **MongoDB** running on `localhost:27017` (optional — backend works without it)
- **MetaMask** browser extension (for wallet connection)
- **Circom** compiler (for ZK circuits — see Step 3)

---

## ⚡ One-Click Start (Recommended)

Open **PowerShell as Administrator** in the project root and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\start-all.ps1
```

This will automatically:
1. Start a local Hardhat blockchain node (port 8545)
2. Compile & deploy all 4 smart contracts
3. Update backend `.env` with deployed contract addresses
4. Start the Backend API (port 3000)
5. Start the Issuer Portal (port 3001)
6. Start the Verifier Portal (port 3002)
7. Start the Mobile Wallet via Expo

---

## 🔧 Manual Step-by-Step Setup

### Step 1: Install Dependencies (First Time Only)

```powershell
cd backend
npm install
cd ..

cd mobile-wallet
npm install
cd ..

cd smart-contracts
npm install
cd ..

cd zk-circuits
npm install
cd ..
```

> The portals (`issuer-portal` and `verifier-portal`) are static HTML — no install needed.

---

### Step 2: Smart Contracts + Wallet Connection

#### Terminal 1 — Start Hardhat Local Blockchain

```powershell
cd smart-contracts
npx hardhat node
```

This starts a local Ethereum node on `http://127.0.0.1:8545` with:
- Chain ID: `31337`
- 20 pre-funded accounts with 10,000 ETH each

**Keep this terminal open!**

#### Terminal 2 — Compile & Deploy Contracts

```powershell
cd smart-contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network localhost
```

You'll see output like:
```
========================================
MDTL Contract Deployment Summary
========================================
IssuerRegistry:      0x5FbDB2315678afecb367f032d93F642f64180aa3
CredentialRegistry:  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
ReputationRegistry:  0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
ProofVerifier:       0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
========================================
```

**Or use the auto-deploy script** (compiles, deploys, AND updates backend .env):

```powershell
cd smart-contracts
powershell -ExecutionPolicy Bypass -File scripts\deploy-local.ps1
```

#### 🦊 Connect MetaMask to Local Hardhat Node

1. Open MetaMask → **Settings** → **Networks** → **Add a network** → **Add manually**
2. Fill in:
   | Field | Value |
   |-------|-------|
   | Network Name | `Hardhat Local` |
   | RPC URL | `http://127.0.0.1:8545` |
   | Chain ID | `31337` |
   | Currency Symbol | `ETH` |
3. Click **Save** and switch to the "Hardhat Local" network

#### 💰 Import a Funded Account into MetaMask

1. In MetaMask, click your account icon → **Import Account**
2. Paste the private key for **Account #0** (deployer, has 10000 ETH):

```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Other available test accounts:

| Account | Address | Private Key |
|---------|---------|-------------|
| #0 (Deployer) | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| #1 (Issuer) | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| #2 (Verifier) | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

> ⚠️ **Warning**: These are Hardhat's default test keys. NEVER use them on mainnet!

---

### Step 3: ZK Circuits (Zero-Knowledge Proofs)

#### Install Circom Compiler

If you don't have `circom` installed:

**Option A — Using Rust/Cargo (Recommended):**
```powershell
# Install Rust first: https://rustup.rs/
cargo install circom
```

**Option B — Download Binary:**
Download from [circom releases](https://github.com/iden3/circom/releases) and add to PATH.

#### Build ZK Circuits

```powershell
cd zk-circuits
powershell -ExecutionPolicy Bypass -File scripts\build.ps1
```

This compiles all 3 circuits and generates:
- **R1CS** constraint systems
- **WASM** witness generators
- **Groth16 proving keys** (`.zkey` files)
- **Verification keys** (`.json` files)
- **Solidity verifiers** (`.sol` files)

**Circuits included:**
| Circuit | Purpose | Public Input |
|---------|---------|-------------|
| `incomeProof` | Prove income ≥ threshold | `threshold` |
| `workHoursProof` | Prove hours ≥ minimum | `minHours` |
| `trustedIssuerProof` | Prove Merkle membership | `trustedIssuersRoot` |

---

### Step 4: Start Backend & Portals

#### Terminal 3 — Backend API (Port 3000)

```powershell
cd backend
npm run dev
```

Wait until you see `Server running on port 3000`.

#### Terminal 4 — Issuer Portal (Port 3001)

```powershell
cd issuer-portal
npx -y serve . -l 3001
```

#### Terminal 5 — Verifier Portal (Port 3002)

```powershell
cd verifier-portal
npx -y serve . -l 3002
```

#### Terminal 6 — Mobile Wallet (Expo)

```powershell
cd mobile-wallet
npx expo start
```

Press `w` for web, `a` for Android, `i` for iOS.

---

## 📋 Quick Reference

| Service | Port | URL | Status Check |
|---------|------|-----|-------------|
| Hardhat Node | 8545 | http://127.0.0.1:8545 | Logs in terminal |
| Backend API | 3000 | http://localhost:3000 | http://localhost:3000/health |
| Issuer Portal | 3001 | http://localhost:3001 | Open in browser |
| Verifier Portal | 3002 | http://localhost:3002 | Open in browser |
| Mobile Wallet | 8081 | Expo DevTools | Press w for web |

---

## 🛠️ Available Scripts

| Script | Location | Description |
|--------|----------|-------------|
| `start-all.ps1` | Project root | One-click start everything |
| `deploy-local.ps1` | smart-contracts/scripts/ | Deploy + auto-update .env |
| `build.ps1` | zk-circuits/scripts/ | Build all ZK circuits (PowerShell) |
| `build.sh` | zk-circuits/scripts/ | Build all ZK circuits (Bash/WSL) |

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| Port already in use | `npx -y kill-port 3000` |
| PowerShell execution policy | `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| `serve` not found | `npm install -g serve` |
| Backend crashes on start | Check MongoDB is running or ignore DB errors |
| MetaMask "Nonce too high" | MetaMask > Settings > Advanced > Clear activity data |
| Hardhat node reset | MetaMask > Settings > Advanced > Clear activity data |
| `circom` not found | Install via `cargo install circom` or download binary |
| Kill all Node processes | `Get-Process -Name node \| Stop-Process -Force` |
