# MDTL ZK Circuits Build Script (PowerShell)
# Compiles Circom circuits, generates R1CS, WASM, and performs trusted setup

$ErrorActionPreference = "Stop"

$CIRCUITS_DIR = "circuits"
$BUILD_DIR = "build"

# Check if circom is installed
try {
    $circomVersion = circom --version 2>&1
    Write-Host "Using circom: $circomVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: circom is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install circom using one of these methods:" -ForegroundColor Yellow
    Write-Host "  Option 1 (cargo): cargo install circom" -ForegroundColor Cyan
    Write-Host "  Option 2 (npm):   npm install -g circom" -ForegroundColor Cyan
    Write-Host "  Option 3: Download from https://github.com/iden3/circom/releases" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installing, make sure 'circom' is in your PATH and re-run this script."
    exit 1
}

# Create build directory
if (-not (Test-Path $BUILD_DIR)) {
    New-Item -ItemType Directory -Path $BUILD_DIR | Out-Null
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "MDTL ZK Circuit Build Pipeline" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# List of circuits to build
$CIRCUITS = @("incomeProof", "workHoursProof", "trustedIssuerProof")

foreach ($CIRCUIT in $CIRCUITS) {
    Write-Host ""
    Write-Host "--- Building $CIRCUIT ---" -ForegroundColor Yellow

    $CIRCUIT_DIR = "$BUILD_DIR\$CIRCUIT"
    if (-not (Test-Path $CIRCUIT_DIR)) {
        New-Item -ItemType Directory -Path $CIRCUIT_DIR | Out-Null
    }

    # Step 1: Compile circuit
    Write-Host "[1/6] Compiling $CIRCUIT.circom..." -ForegroundColor White
    circom "$CIRCUITS_DIR\$CIRCUIT.circom" --r1cs --wasm --sym --output "$CIRCUIT_DIR"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED to compile $CIRCUIT" -ForegroundColor Red
        exit 1
    }

    # Step 2: Circuit info
    Write-Host "[2/6] Circuit info:" -ForegroundColor White
    npx snarkjs r1cs info "$CIRCUIT_DIR\$CIRCUIT.r1cs"

    # Step 3: Powers of Tau ceremony (test only)
    Write-Host "[3/6] Starting Powers of Tau ceremony..." -ForegroundColor White
    npx snarkjs powersoftau new bn128 14 "$CIRCUIT_DIR\pot14_0000.ptau" -v

    # Contribute to ceremony
    npx snarkjs powersoftau contribute `
        "$CIRCUIT_DIR\pot14_0000.ptau" `
        "$CIRCUIT_DIR\pot14_0001.ptau" `
        --name="MDTL Test Contribution" -v -e="random entropy for $CIRCUIT"

    # Prepare phase 2
    npx snarkjs powersoftau prepare phase2 `
        "$CIRCUIT_DIR\pot14_0001.ptau" `
        "$CIRCUIT_DIR\pot14_final.ptau" -v

    # Step 4: Setup Groth16
    Write-Host "[4/6] Generating Groth16 proving key..." -ForegroundColor White
    npx snarkjs groth16 setup `
        "$CIRCUIT_DIR\$CIRCUIT.r1cs" `
        "$CIRCUIT_DIR\pot14_final.ptau" `
        "$CIRCUIT_DIR\${CIRCUIT}_0000.zkey"

    # Contribute to phase 2
    npx snarkjs zkey contribute `
        "$CIRCUIT_DIR\${CIRCUIT}_0000.zkey" `
        "$CIRCUIT_DIR\${CIRCUIT}_final.zkey" `
        --name="MDTL Phase 2" -v -e="more random entropy for $CIRCUIT"

    # Step 5: Export verification key
    Write-Host "[5/6] Exporting verification key..." -ForegroundColor White
    npx snarkjs zkey export verificationkey `
        "$CIRCUIT_DIR\${CIRCUIT}_final.zkey" `
        "$CIRCUIT_DIR\verification_key.json"

    # Step 6: Export Solidity verifier (optional)
    Write-Host "[6/6] Exporting Solidity verifier..." -ForegroundColor White
    npx snarkjs zkey export solidityverifier `
        "$CIRCUIT_DIR\${CIRCUIT}_final.zkey" `
        "$CIRCUIT_DIR\${CIRCUIT}Verifier.sol"

    Write-Host ">> $CIRCUIT build complete!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "All circuits built successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Build artifacts location: $BUILD_DIR\"
Write-Host "  - R1CS constraint systems"
Write-Host "  - WASM witnesses"
Write-Host "  - Proving keys (.zkey)"
Write-Host "  - Verification keys (.json)"
Write-Host "  - Solidity verifiers (.sol)"
