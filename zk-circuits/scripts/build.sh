#!/bin/bash
# MDTL ZK Circuits Build Script
# Compiles Circom circuits, generates R1CS, WASM, and performs trusted setup

set -e

CIRCUITS_DIR="circuits"
BUILD_DIR="build"

mkdir -p $BUILD_DIR

echo "========================================="
echo "MDTL ZK Circuit Build Pipeline"
echo "========================================="

# List of circuits to build
CIRCUITS=("incomeProof" "workHoursProof" "trustedIssuerProof")

for CIRCUIT in "${CIRCUITS[@]}"; do
    echo ""
    echo "--- Building $CIRCUIT ---"
    
    CIRCUIT_DIR="$BUILD_DIR/$CIRCUIT"
    mkdir -p "$CIRCUIT_DIR"

    # Step 1: Compile circuit
    echo "[1/6] Compiling $CIRCUIT.circom..."
    circom "$CIRCUITS_DIR/$CIRCUIT.circom" \
        --r1cs \
        --wasm \
        --sym \
        --output "$CIRCUIT_DIR"

    echo "[2/6] Circuit info:"
    npx snarkjs r1cs info "$CIRCUIT_DIR/$CIRCUIT.r1cs"

    # Step 2: Start Powers of Tau ceremony (test only)
    echo "[3/6] Starting Powers of Tau ceremony..."
    npx snarkjs powersoftau new bn128 14 "$CIRCUIT_DIR/pot14_0000.ptau" -v

    # Contribute to ceremony
    npx snarkjs powersoftau contribute \
        "$CIRCUIT_DIR/pot14_0000.ptau" \
        "$CIRCUIT_DIR/pot14_0001.ptau" \
        --name="MDTL Test Contribution" -v -e="random entropy for $CIRCUIT"

    # Prepare phase 2
    npx snarkjs powersoftau prepare phase2 \
        "$CIRCUIT_DIR/pot14_0001.ptau" \
        "$CIRCUIT_DIR/pot14_final.ptau" -v

    # Step 3: Setup Groth16
    echo "[4/6] Generating Groth16 proving key..."
    npx snarkjs groth16 setup \
        "$CIRCUIT_DIR/$CIRCUIT.r1cs" \
        "$CIRCUIT_DIR/pot14_final.ptau" \
        "$CIRCUIT_DIR/${CIRCUIT}_0000.zkey"

    # Contribute to phase 2
    npx snarkjs zkey contribute \
        "$CIRCUIT_DIR/${CIRCUIT}_0000.zkey" \
        "$CIRCUIT_DIR/${CIRCUIT}_final.zkey" \
        --name="MDTL Phase 2" -v -e="more random entropy for $CIRCUIT"

    # Step 4: Export verification key
    echo "[5/6] Exporting verification key..."
    npx snarkjs zkey export verificationkey \
        "$CIRCUIT_DIR/${CIRCUIT}_final.zkey" \
        "$CIRCUIT_DIR/verification_key.json"

    # Step 5: Export Solidity verifier (optional)
    echo "[6/6] Exporting Solidity verifier..."
    npx snarkjs zkey export solidityverifier \
        "$CIRCUIT_DIR/${CIRCUIT}_final.zkey" \
        "$CIRCUIT_DIR/${CIRCUIT}Verifier.sol"

    echo "✓ $CIRCUIT build complete!"
done

echo ""
echo "========================================="
echo "All circuits built successfully!"
echo "========================================="
echo ""
echo "Build artifacts location: $BUILD_DIR/"
echo "  - R1CS constraint systems"
echo "  - WASM witnesses"
echo "  - Proving keys (.zkey)"
echo "  - Verification keys (.json)"
echo "  - Solidity verifiers (.sol)"
