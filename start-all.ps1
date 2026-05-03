# ============================================================
# MDTL Platform - One-Click Startup Script
# ============================================================

$ErrorActionPreference = "Continue"

# Fix: $PSScriptRoot can be empty in some contexts; fall back to pwd
if ($PSScriptRoot -and (Test-Path $PSScriptRoot)) {
    $PROJECT_ROOT = $PSScriptRoot
} else {
    $PROJECT_ROOT = (Get-Location).Path
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "        MDTL Platform - Starting All Services" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "  Project Root: $PROJECT_ROOT" -ForegroundColor Gray
Write-Host ""

# ---- Step 0: Kill any existing processes on these ports ----
Write-Host "[0/7] Cleaning up existing processes..." -ForegroundColor Gray
$ports = @(3000, 3001, 3002, 3004, 8545)
foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($conn in $conns) {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
        Write-Host "  Killed process on port $port" -ForegroundColor Gray
    }
}

# ---- Step 1: Start Hardhat Node ----
Write-Host "[1/7] Starting Hardhat local blockchain node (port 8545)...`n" -ForegroundColor Yellow
$hardhatCmd = "Set-Location -LiteralPath '$PROJECT_ROOT\smart-contracts'; Write-Host '>>> Hardhat Local Blockchain Node <<<' -ForegroundColor Cyan; npx hardhat node"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $hardhatCmd

Write-Host "  Waiting 8 seconds for Hardhat to start..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# ---- Step 2: Deploy contracts ----
Write-Host "[2/7] Compiling and deploying smart contracts..." -ForegroundColor Yellow
Push-Location "$PROJECT_ROOT\smart-contracts"
npx hardhat compile 2>&1 | Out-Null
$deployOutput = npx hardhat run scripts/deploy.ts --network localhost 2>&1 | Out-String
Write-Host $deployOutput

# Parse and update backend .env with deployed addresses
$issuerMatch = [regex]::Match($deployOutput, "IssuerRegistry.*?:\s+(0x[a-fA-F0-9]{40})")
$credentialMatch = [regex]::Match($deployOutput, "CredentialRegistry.*?:\s+(0x[a-fA-F0-9]{40})")
$reputationMatch = [regex]::Match($deployOutput, "ReputationRegistry.*?:\s+(0x[a-fA-F0-9]{40})")
$proofMatch = [regex]::Match($deployOutput, "ProofVerifier.*?:\s+(0x[a-fA-F0-9]{40})")

if ($issuerMatch.Success) {
    $backendEnv = Join-Path $PROJECT_ROOT "backend\.env"
    if (Test-Path $backendEnv) {
        $envContent = Get-Content $backendEnv -Raw
        $envContent = $envContent -replace "ISSUER_REGISTRY_ADDRESS=.*", "ISSUER_REGISTRY_ADDRESS=$($issuerMatch.Groups[1].Value)"
        $envContent = $envContent -replace "CREDENTIAL_REGISTRY_ADDRESS=.*", "CREDENTIAL_REGISTRY_ADDRESS=$($credentialMatch.Groups[1].Value)"
        $envContent = $envContent -replace "REPUTATION_REGISTRY_ADDRESS=.*", "REPUTATION_REGISTRY_ADDRESS=$($reputationMatch.Groups[1].Value)"
        $envContent = $envContent -replace "PROOF_VERIFIER_ADDRESS=.*", "PROOF_VERIFIER_ADDRESS=$($proofMatch.Groups[1].Value)"
        Set-Content $backendEnv $envContent -NoNewline
        Write-Host "  Backend .env updated with contract addresses!" -ForegroundColor Green
    }
} else {
    Write-Host "  WARNING: Could not parse contract addresses. Update backend/.env manually." -ForegroundColor Yellow
}
Pop-Location
Write-Host ""

# ---- Step 3: Start Backend ----
Write-Host "[3/7] Starting Backend API (port 3000)..." -ForegroundColor Yellow
$backendCmd = "Set-Location -LiteralPath '$PROJECT_ROOT\backend'; Write-Host '>>> MDTL Backend API <<<' -ForegroundColor Cyan; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Write-Host "  Waiting 5 seconds for Backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# ---- Step 4: Start Issuer Portal ----
Write-Host "[4/7] Starting Issuer Portal (port 3001)..." -ForegroundColor Yellow
$issuerCmd = "Set-Location -LiteralPath '$PROJECT_ROOT\issuer-portal'; Write-Host '>>> Issuer Portal <<<' -ForegroundColor Cyan; npx -y serve . -l 3001"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $issuerCmd

# ---- Step 5: Start Verifier Portal ----
Write-Host "[5/7] Starting Verifier Portal (port 3002)..." -ForegroundColor Yellow
$verifierCmd = "Set-Location -LiteralPath '$PROJECT_ROOT\verifier-portal'; Write-Host '>>> Verifier Portal <<<' -ForegroundColor Cyan; npx -y serve . -l 3002"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $verifierCmd

# ---- Step 6: Start Admin Hub ----
Write-Host "[6/7] Starting Admin Hub (port 3004)..." -ForegroundColor Yellow
$adminCmd = "Set-Location -LiteralPath '$PROJECT_ROOT\admin-hub'; Write-Host '>>> Admin Hub <<<' -ForegroundColor Cyan; npx -y serve . -l 3004"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $adminCmd

# ---- Step 7: Start Mobile Wallet ----
Write-Host "[7/7] Starting Mobile Wallet (Expo)..." -ForegroundColor Yellow
$mobileCmd = "Set-Location -LiteralPath '$PROJECT_ROOT\mobile-wallet'; Write-Host '>>> Mobile Wallet (Expo) <<<' -ForegroundColor Cyan; npx expo start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $mobileCmd

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  ALL SERVICES STARTED!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Service             URL"
Write-Host "  --------            ---"
Write-Host "  Hardhat Node        http://127.0.0.1:8545     (Chain ID: 31337)"
Write-Host "  Backend API         http://localhost:3000      (Health: /health)"
Write-Host "  Issuer Portal       http://localhost:3001"
Write-Host "  Verifier Portal     http://localhost:3002"
Write-Host "  Admin Hub           http://localhost:3004"
Write-Host "  Mobile Wallet       Expo DevTools (press w for web)"
Write-Host ""
Write-Host "  MetaMask Setup:" -ForegroundColor Yellow
Write-Host "    Network Name:  Hardhat Local"
Write-Host "    RPC URL:       http://127.0.0.1:8545"
Write-Host "    Chain ID:      31337"
Write-Host "    Currency:      ETH"
Write-Host ""
Write-Host "    Import Account #0 (has 10000 ETH):" -ForegroundColor Yellow
Write-Host "    Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor Gray
Write-Host ""
Write-Host "  To stop all: Get-Process -Name node | Stop-Process -Force" -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Green
