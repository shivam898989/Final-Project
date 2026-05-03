# Majdoor Digital Trust-Ledger (MDTL) Platform

A decentralized infrastructure that converts informal worker employment history into **verifiable digital credentials**, enabling financial inclusion without exposing sensitive personal data.

## Architecture

Five-layer modular architecture:

1. **Identity Layer** — DID-based decentralized identities (W3C DID standard)
2. **Credential Layer** — W3C Verifiable Credentials with JSON-LD
3. **Ledger Layer** — Polygon PoS smart contracts for anchoring
4. **Privacy Layer** — Circom/SnarkJS zero-knowledge proofs (Groth16)
5. **Verification Layer** — On-chain + off-chain proof verification

## Project Structure

```
mdtl-platform/
├── smart-contracts/    # Solidity contracts (Hardhat)
├── zk-circuits/        # Circom ZK circuits
├── backend/            # Node.js/Express/TypeScript API
├── mobile-wallet/      # React Native (Expo) mobile app
├── issuer-portal/      # React web dashboard for employers/NGOs
└── verifier-portal/    # React web dashboard for banks/verifiers
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Polygon PoS (L2 Ethereum) |
| Smart Contracts | Solidity + Hardhat |
| Identity | W3C DIDs |
| Credentials | W3C Verifiable Credentials |
| ZK Proofs | Circom + SnarkJS (Groth16) |
| Backend | Node.js + Express + TypeScript |
| Mobile | React Native + Expo |
| Storage | IPFS (Pinata) + MongoDB |
| Key Security | Secure Enclave + Shamir Secret Sharing |

## Quick Start

See individual component READMEs for setup instructions.
