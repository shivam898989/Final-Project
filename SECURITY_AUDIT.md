# MDTL Platform — Security Audit Checklist

## Smart Contracts

- [ ] **Access Control** — Only owner can register/revoke issuers
- [ ] **Reentrancy** — No external calls before state changes
- [ ] **Integer Overflow** — Solidity 0.8+ built-in checks
- [ ] **Front-running** — Hash anchoring is idempotent, no price impact
- [ ] **Duplicate Anchoring** — Prevented by `exists` checks
- [ ] **Gas Optimization** — Optimizer enabled (200 runs)
- [ ] **Event Emission** — All state changes emit events
- [ ] **Upgradability** — Consider proxy pattern for production
- [ ] **Contract Verification** — Verify source on Polygonscan

## Identity & Key Management

- [ ] **Key Generation** — Uses cryptographically secure random
- [ ] **Private Key Storage** — Encrypted in secure enclave / secure store
- [ ] **Shamir Secret Sharing** — Threshold recovery (3-of-5)
- [ ] **DID Document** — Follows W3C DID spec
- [ ] **Key Rotation** — Support key update in DID document
- [ ] **Biometric Lock** — Device biometrics gate wallet access

## Credential Security

- [ ] **Signature Verification** — ECDSA secp256k1 signatures
- [ ] **Credential Schema** — W3C VC compliance
- [ ] **Revocation** — Issuer-only revocation supported
- [ ] **IPFS Encryption** — Credentials encrypted before IPFS storage
- [ ] **On-chain Hashing** — Only hashes stored on blockchain (no PII)
- [ ] **Merkle Batching** — Reduces on-chain footprint
- [ ] **Expiration** — Credential TTL enforcement

## Zero-Knowledge Proofs

- [ ] **Circuit Correctness** — Constraints properly enforce claims
- [ ] **Trusted Setup** — Multi-party ceremony for production
- [ ] **Proof Soundness** — Groth16 security guarantees
- [ ] **No Private Data Leakage** — Public signals contain no PII
- [ ] **Proof Replay Prevention** — Verification IDs tracked
- [ ] **Field Element Bounds** — All values within BN128 field

## API Security

- [ ] **JWT Authentication** — Token-based auth on protected routes
- [ ] **Rate Limiting** — 100 requests per 15 minutes per IP
- [ ] **CORS Policy** — Restricted origins
- [ ] **Helmet.js** — Security headers (XSS, CSP, etc.)
- [ ] **Input Validation** — All inputs validated before processing
- [ ] **Error Handling** — No stack traces in production responses
- [ ] **HTTPS** — TLS required in production
- [ ] **Logging** — Structured logging without PII

## Data Privacy

- [ ] **No PII On-chain** — Only hashes and proofs on blockchain
- [ ] **Selective Disclosure** — Workers choose what to prove
- [ ] **Data Minimization** — Verifiers receive only boolean results
- [ ] **IPFS Encryption** — Encrypted before pinning
- [ ] **Metadata Surveillance** — Merkle batching obscures timing
- [ ] **Device Storage** — Credentials encrypted at rest

## Network & Infrastructure

- [ ] **MongoDB** — Authentication enabled, TLS, backup schedule
- [ ] **IPFS** — Use pinning service with redundancy
- [ ] **RPC Security** — Use authenticated RPC endpoints
- [ ] **Secrets Management** — Environment variables, not hardcoded
- [ ] **DDoS Protection** — WAF / Cloudflare in production
- [ ] **Monitoring** — Prometheus + Grafana dashboards
- [ ] **Incident Response** — Document breach response procedure
