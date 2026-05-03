# MDTL Platform — Testing Strategy

## 1. Smart Contract Tests (Hardhat + Chai)

**File:** `smart-contracts/test/MDTL.test.ts`

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| IssuerRegistry | Register, revoke, reactivate, details | 5 |
| CredentialRegistry | Anchor hash, reject non-issuer, reject duplicates, Merkle root | 4 |
| ReputationRegistry | Update, endorse, self-endorse prevention, fraud report | 4 |
| ProofVerifier | Verify valid proof, track count | 2 |

```bash
cd smart-contracts && npx hardhat test
```

---

## 2. Backend API Tests

**Key flows to test:**

| Flow | Endpoint | Validation |
|------|----------|------------|
| Create Identity | POST `/api/identity/create` | DID format, keypair validity |
| Issue Credential | POST `/api/credentials/issue` | VC structure, signature |
| Verify Credential | POST `/api/credentials/verify` | Signature verification |
| Generate ZK Proof | POST `/api/proofs/generate` | Proof structure, public signals |
| Verify ZK Proof | POST `/api/proofs/verify` | Validation result |
| Register Issuer | POST `/api/issuers/register` | DID creation, DB storage |

**Manual test via curl:**
```bash
# Create identity
curl -X POST http://localhost:3000/api/identity/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Worker","language":"en"}'

# Generate ZK proof
curl -X POST http://localhost:3000/api/proofs/generate \
  -H "Content-Type: application/json" \
  -d '{"proofType":"income","publicInputs":{"threshold":10000},"privateInputs":{"income":25000}}'
```

---

## 3. ZK Circuit Tests

| Circuit | Test | Input | Expected |
|---------|------|-------|----------|
| incomeProof | income ≥ threshold | income=25000, threshold=10000 | Valid |
| incomeProof | income < threshold | income=5000, threshold=10000 | Fail |
| workHoursProof | hours ≥ min | hours=200, min=100 | Valid |
| trustedIssuerProof | Merkle membership | valid path | Valid |

---

## 4. Integration Tests

| Scenario | Components | Steps |
|----------|------------|-------|
| Full credential lifecycle | Backend + Contracts | Create DID → Issue VC → Anchor hash → Verify |
| ZK proof flow | Backend + Circuits | Issue VC → Generate proof → Verify proof |
| Offline recovery | Mobile + Backend | Create wallet → Save shares → Recover |

---

## 5. Security Tests

- [ ] Input validation on all endpoints
- [ ] JWT token expiry enforcement
- [ ] Rate limiting verification
- [ ] Contract access control (non-owner operations)
- [ ] Proof replay prevention
- [ ] Private key never logged

---

## 6. Performance Benchmarks

| Operation | Target | Notes |
|-----------|--------|-------|
| DID creation | < 100ms | Local keypair gen |
| Credential issuance | < 500ms | Sign + IPFS pin |
| Hash anchoring | < 5s | Blockchain tx |
| ZK proof generation | < 5s | Circuit-dependent |
| ZK proof verification | < 200ms | Verifier check |
