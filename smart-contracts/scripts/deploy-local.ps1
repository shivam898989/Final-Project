# Deploy contracts to local Hardhat node and update backend .env
# Run this AFTER starting the Hardhat node (npm run node)

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$BACKEND_ENV = Join-Path $PROJECT_ROOT "backend\.env"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  MDTL Smart Contract Local Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Compile contracts
Write-Host "[1/3] Compiling smart contracts..." -ForegroundColor Yellow
npx hardhat compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation FAILED!" -ForegroundColor Red
    exit 1
}
Write-Host "Compilation successful!" -ForegroundColor Green

# Step 2: Deploy to localhost
Write-Host ""
Write-Host "[2/3] Deploying to local Hardhat node..." -ForegroundColor Yellow
$deployOutput = npx hardhat run scripts/deploy.ts --network localhost 2>&1
$deployText = $deployOutput | Out-String
Write-Host $deployText

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment FAILED! Make sure Hardhat node is running:" -ForegroundColor Red
    Write-Host "  cd smart-contracts && npm run node" -ForegroundColor Yellow
    exit 1
}

# Step 3: Parse deployed addresses and update backend .env
Write-Host "[3/3] Updating backend .env with deployed addresses..." -ForegroundColor Yellow

# Extract addresses from deploy output
$issuerMatch = [regex]::Match($deployText, "IssuerRegistry.*?:\s+(0x[a-fA-F0-9]{40})")
$credentialMatch = [regex]::Match($deployText, "CredentialRegistry.*?:\s+(0x[a-fA-F0-9]{40})")
$reputationMatch = [regex]::Match($deployText, "ReputationRegistry.*?:\s+(0x[a-fA-F0-9]{40})")
$proofMatch = [regex]::Match($deployText, "ProofVerifier.*?:\s+(0x[a-fA-F0-9]{40})")

if (-not $issuerMatch.Success) {
    Write-Host "Could not parse deployment addresses. Please update backend/.env manually." -ForegroundColor Red
    Write-Host $deployText
    exit 1
}

$issuerAddr = $issuerMatch.Groups[1].Value
$credentialAddr = $credentialMatch.Groups[1].Value
$reputationAddr = $reputationMatch.Groups[1].Value
$proofAddr = $proofMatch.Groups[1].Value

Write-Host "  IssuerRegistry:     $issuerAddr" -ForegroundColor White
Write-Host "  CredentialRegistry: $credentialAddr" -ForegroundColor White
Write-Host "  ReputationRegistry: $reputationAddr" -ForegroundColor White
Write-Host "  ProofVerifier:      $proofAddr" -ForegroundColor White

# Update backend .env
if (Test-Path $BACKEND_ENV) {
    $envContent = Get-Content $BACKEND_ENV -Raw

    # Update contract addresses
    $envContent = $envContent -replace "ISSUER_REGISTRY_ADDRESS=.*", "ISSUER_REGISTRY_ADDRESS=$issuerAddr"
    $envContent = $envContent -replace "CREDENTIAL_REGISTRY_ADDRESS=.*", "CREDENTIAL_REGISTRY_ADDRESS=$credentialAddr"
    $envContent = $envContent -replace "REPUTATION_REGISTRY_ADDRESS=.*", "REPUTATION_REGISTRY_ADDRESS=$reputationAddr"
    $envContent = $envContent -replace "PROOF_VERIFIER_ADDRESS=.*", "PROOF_VERIFIER_ADDRESS=$proofAddr"

    # Set RPC URL to local Hardhat node
    $envContent = $envContent -replace "POLYGON_RPC_URL=.*", "POLYGON_RPC_URL=http://127.0.0.1:8545"

    # Set deployer private key to Hardhat's default Account #0
    $envContent = $envContent -replace "DEPLOYER_PRIVATE_KEY=.*", "DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

    Set-Content $BACKEND_ENV $envContent -NoNewline
    Write-Host ""
    Write-Host "Backend .env updated successfully!" -ForegroundColor Green
} else {
    Write-Host "Backend .env not found at: $BACKEND_ENV" -ForegroundColor Red
    Write-Host "Create it manually with the addresses above." -ForegroundColor Yellow
}

# Also update the smart-contracts .env
$scEnvPath = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $scEnvPath) {
    $scEnv = Get-Content $scEnvPath -Raw
    $scEnv = $scEnv -replace "ISSUER_REGISTRY_ADDRESS=.*", "ISSUER_REGISTRY_ADDRESS=$issuerAddr"
    $scEnv = $scEnv -replace "CREDENTIAL_REGISTRY_ADDRESS=.*", "CREDENTIAL_REGISTRY_ADDRESS=$credentialAddr"
    $scEnv = $scEnv -replace "REPUTATION_REGISTRY_ADDRESS=.*", "REPUTATION_REGISTRY_ADDRESS=$reputationAddr"
    $scEnv = $scEnv -replace "PROOF_VERIFIER_ADDRESS=.*", "PROOF_VERIFIER_ADDRESS=$proofAddr"
    Set-Content $scEnvPath $scEnv -NoNewline
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Hardhat Node RPC:  http://127.0.0.1:8545" -ForegroundColor White
Write-Host "Chain ID:          31337" -ForegroundColor White
Write-Host ""
Write-Host "To connect MetaMask:" -ForegroundColor Yellow
Write-Host "  1. Open MetaMask > Settings > Networks > Add Network" -ForegroundColor White
Write-Host "  2. Network Name:  Hardhat Local" -ForegroundColor White
Write-Host "  3. RPC URL:       http://127.0.0.1:8545" -ForegroundColor White
Write-Host "  4. Chain ID:      31337" -ForegroundColor White
Write-Host "  5. Currency:      ETH" -ForegroundColor White
Write-Host ""
Write-Host "Default funded accounts (10000 ETH each):" -ForegroundColor Yellow
Write-Host "  Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor White
Write-Host "  Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor Gray
Write-Host ""
Write-Host "  Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -ForegroundColor White
Write-Host "  Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" -ForegroundColor Gray
