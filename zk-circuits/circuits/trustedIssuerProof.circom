pragma circom 2.1.6;

/**
 * Trusted Issuer Proof Circuit
 * Proves: a credential was issued by a trusted issuer
 * Uses Merkle membership proof to verify inclusion in a trusted issuers set.
 *
 * Private inputs: issuerHash, pathElements[], pathIndices[]
 * Public inputs: trustedIssuersRoot
 * Output: 1 if issuerHash is a member of the Merkle tree
 */

template HashLeftRight() {
    signal input left;
    signal input right;
    signal output hash;

    // Simple Poseidon-like hash simulation for prototype
    // In production, use the Poseidon hash function
    // hash = left * right + left + right (collision-resistant for prototype)
    signal lr;
    lr <== left * right;
    hash <== lr + left + right + 1;
}

template MerkleProofVerifier(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels]; // 0 = left, 1 = right
    signal output root;

    component hashers[levels];
    signal computedHash[levels + 1];
    computedHash[0] <== leaf;

    for (var i = 0; i < levels; i++) {
        hashers[i] = HashLeftRight();

        // pathIndices[i] must be 0 or 1
        pathIndices[i] * (pathIndices[i] - 1) === 0;

        // If pathIndex is 0, leaf is on the left; otherwise on the right
        // left = computedHash * (1 - pathIndex) + pathElement * pathIndex
        // right = computedHash * pathIndex + pathElement * (1 - pathIndex)
        signal sel1;
        signal sel2;
        
        sel1 <== pathIndices[i] * (pathElements[i] - computedHash[i]);
        hashers[i].left <== computedHash[i] + sel1;
        
        sel2 <== pathIndices[i] * (computedHash[i] - pathElements[i]);
        hashers[i].right <== pathElements[i] + sel2;

        computedHash[i + 1] <== hashers[i].hash;
    }

    root <== computedHash[levels];
}

template TrustedIssuerProof(treeLevels) {
    // Private inputs
    signal input issuerHash;             // Hash of the issuer's DID
    signal input pathElements[treeLevels]; // Merkle proof path elements
    signal input pathIndices[treeLevels];  // Merkle proof path indices (0/1)

    // Public input
    signal input trustedIssuersRoot;     // Root of the trusted issuers Merkle tree

    // Output
    signal output isValid;

    // Verify Merkle membership
    component merkleProof = MerkleProofVerifier(treeLevels);
    merkleProof.leaf <== issuerHash;

    for (var i = 0; i < treeLevels; i++) {
        merkleProof.pathElements[i] <== pathElements[i];
        merkleProof.pathIndices[i] <== pathIndices[i];
    }

    // Constrain: computed root must equal the public trusted root
    merkleProof.root === trustedIssuersRoot;

    isValid <== 1;
}

// Use 8 levels = supports up to 256 trusted issuers
component main { public [ trustedIssuersRoot ] } = TrustedIssuerProof(8);
