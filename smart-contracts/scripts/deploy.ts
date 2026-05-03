import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

    // 1. Deploy IssuerRegistry
    console.log("\n--- Deploying IssuerRegistry ---");
    const IssuerRegistry = await ethers.getContractFactory("IssuerRegistry");
    const issuerRegistry = await IssuerRegistry.deploy();
    await issuerRegistry.waitForDeployment();
    const issuerRegistryAddress = await issuerRegistry.getAddress();
    console.log("IssuerRegistry deployed to:", issuerRegistryAddress);

    // 2. Deploy CredentialRegistry (depends on IssuerRegistry)
    console.log("\n--- Deploying CredentialRegistry ---");
    const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
    const credentialRegistry = await CredentialRegistry.deploy(issuerRegistryAddress);
    await credentialRegistry.waitForDeployment();
    const credentialRegistryAddress = await credentialRegistry.getAddress();
    console.log("CredentialRegistry deployed to:", credentialRegistryAddress);

    // 3. Deploy ReputationRegistry
    console.log("\n--- Deploying ReputationRegistry ---");
    const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
    const reputationRegistry = await ReputationRegistry.deploy();
    await reputationRegistry.waitForDeployment();
    const reputationRegistryAddress = await reputationRegistry.getAddress();
    console.log("ReputationRegistry deployed to:", reputationRegistryAddress);

    // 4. Deploy ProofVerifier
    console.log("\n--- Deploying ProofVerifier ---");
    const ProofVerifier = await ethers.getContractFactory("ProofVerifier");
    const proofVerifier = await ProofVerifier.deploy();
    await proofVerifier.waitForDeployment();
    const proofVerifierAddress = await proofVerifier.getAddress();
    console.log("ProofVerifier deployed to:", proofVerifierAddress);

    // Summary
    console.log("\n========================================");
    console.log("MDTL Contract Deployment Summary");
    console.log("========================================");
    console.log("IssuerRegistry:     ", issuerRegistryAddress);
    console.log("CredentialRegistry: ", credentialRegistryAddress);
    console.log("ReputationRegistry: ", reputationRegistryAddress);
    console.log("ProofVerifier:      ", proofVerifierAddress);
    console.log("========================================");

    return {
        issuerRegistry: issuerRegistryAddress,
        credentialRegistry: credentialRegistryAddress,
        reputationRegistry: reputationRegistryAddress,
        proofVerifier: proofVerifierAddress,
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
