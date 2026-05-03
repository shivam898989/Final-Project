import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MDTL Smart Contracts", function () {
    let owner: SignerWithAddress;
    let issuer1: SignerWithAddress;
    let issuer2: SignerWithAddress;
    let worker: SignerWithAddress;
    let verifier: SignerWithAddress;

    let issuerRegistry: any;
    let credentialRegistry: any;
    let reputationRegistry: any;
    let proofVerifier: any;

    beforeEach(async function () {
        [owner, issuer1, issuer2, worker, verifier] = await ethers.getSigners();

        // Deploy IssuerRegistry
        const IssuerRegistry = await ethers.getContractFactory("IssuerRegistry");
        issuerRegistry = await IssuerRegistry.deploy();
        await issuerRegistry.waitForDeployment();

        // Deploy CredentialRegistry
        const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
        credentialRegistry = await CredentialRegistry.deploy(await issuerRegistry.getAddress());
        await credentialRegistry.waitForDeployment();

        // Deploy ReputationRegistry
        const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
        reputationRegistry = await ReputationRegistry.deploy();
        await reputationRegistry.waitForDeployment();

        // Deploy ProofVerifier
        const ProofVerifier = await ethers.getContractFactory("ProofVerifier");
        proofVerifier = await ProofVerifier.deploy();
        await proofVerifier.waitForDeployment();
    });

    describe("IssuerRegistry", function () {
        it("Should register an issuer", async function () {
            await issuerRegistry.registerIssuer(
                issuer1.address,
                "did:polygon:0x123",
                "Test NGO"
            );
            expect(await issuerRegistry.isIssuer(issuer1.address)).to.be.true;
        });

        it("Should reject non-owner registration", async function () {
            await expect(
                issuerRegistry.connect(worker).registerIssuer(
                    issuer1.address,
                    "did:polygon:0x123",
                    "Test NGO"
                )
            ).to.be.reverted;
        });

        it("Should revoke an issuer", async function () {
            await issuerRegistry.registerIssuer(issuer1.address, "did:polygon:0x123", "Test NGO");
            await issuerRegistry.revokeIssuer(issuer1.address);
            expect(await issuerRegistry.isIssuer(issuer1.address)).to.be.false;
        });

        it("Should reactivate a revoked issuer", async function () {
            await issuerRegistry.registerIssuer(issuer1.address, "did:polygon:0x123", "Test NGO");
            await issuerRegistry.revokeIssuer(issuer1.address);
            await issuerRegistry.reactivateIssuer(issuer1.address);
            expect(await issuerRegistry.isIssuer(issuer1.address)).to.be.true;
        });

        it("Should return correct issuer details", async function () {
            await issuerRegistry.registerIssuer(issuer1.address, "did:polygon:0x123", "Test NGO");
            const [did, orgName, isActive] = await issuerRegistry.getIssuer(issuer1.address);
            expect(did).to.equal("did:polygon:0x123");
            expect(orgName).to.equal("Test NGO");
            expect(isActive).to.be.true;
        });
    });

    describe("CredentialRegistry", function () {
        const testHash = ethers.keccak256(ethers.toUtf8Bytes("test-credential-1"));

        beforeEach(async function () {
            await issuerRegistry.registerIssuer(issuer1.address, "did:polygon:0x123", "Test NGO");
        });

        it("Should anchor a credential hash", async function () {
            await credentialRegistry.connect(issuer1).anchorCredentialHash(testHash);
            const [exists, issuer, timestamp] = await credentialRegistry.verifyCredentialHash(testHash);
            expect(exists).to.be.true;
            expect(issuer).to.equal(issuer1.address);
        });

        it("Should reject non-issuer anchoring", async function () {
            await expect(
                credentialRegistry.connect(worker).anchorCredentialHash(testHash)
            ).to.be.revertedWith("Caller is not a registered issuer");
        });

        it("Should reject duplicate anchors", async function () {
            await credentialRegistry.connect(issuer1).anchorCredentialHash(testHash);
            await expect(
                credentialRegistry.connect(issuer1).anchorCredentialHash(testHash)
            ).to.be.revertedWith("Credential already anchored");
        });

        it("Should anchor a Merkle root", async function () {
            const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("merkle-root-1"));
            await credentialRegistry.connect(issuer1).anchorMerkleRoot(merkleRoot, 10);
            const [exists, issuer, count] = await credentialRegistry.verifyMerkleRoot(merkleRoot);
            expect(exists).to.be.true;
            expect(count).to.equal(10n);
        });
    });

    describe("ReputationRegistry", function () {
        it("Should update reputation", async function () {
            await reputationRegistry.updateReputation(issuer1.address, 90, 100, 5);
            const [valid, total, endorsements, score] = await reputationRegistry.getReputation(
                issuer1.address
            );
            expect(valid).to.equal(90n);
            expect(total).to.equal(100n);
            expect(endorsements).to.equal(5n);
            // score = (90 * 100 / 100) * 5 = 450
            expect(score).to.equal(450n);
        });

        it("Should allow endorsement", async function () {
            await reputationRegistry.updateReputation(issuer1.address, 80, 100, 2);
            await reputationRegistry.connect(worker).endorseIssuer(issuer1.address);
            const [, , endorsements] = await reputationRegistry.getReputation(issuer1.address);
            expect(endorsements).to.equal(3n);
        });

        it("Should prevent self-endorsement", async function () {
            await reputationRegistry.updateReputation(issuer1.address, 80, 100, 2);
            await expect(
                reputationRegistry.connect(issuer1).endorseIssuer(issuer1.address)
            ).to.be.revertedWith("Cannot self-endorse");
        });

        it("Should emit fraud report", async function () {
            await expect(
                reputationRegistry.connect(worker).reportFraud(issuer1.address, "Fake credentials")
            )
                .to.emit(reputationRegistry, "FraudReported")
                .withArgs(issuer1.address, worker.address, "Fake credentials");
        });
    });

    describe("ProofVerifier", function () {
        it("Should verify a valid proof", async function () {
            const a: [bigint, bigint] = [1n, 2n];
            const b: [[bigint, bigint], [bigint, bigint]] = [[1n, 2n], [3n, 4n]];
            const c: [bigint, bigint] = [1n, 2n];
            const publicSignals = [10000n]; // threshold

            const tx = await proofVerifier.connect(verifier).verifyProof(
                0, // INCOME proof type
                a, b, c, publicSignals
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find((log: any) => {
                try {
                    return proofVerifier.interface.parseLog(log)?.name === "ProofVerified";
                } catch { return false; }
            });
            expect(event).to.not.be.undefined;
        });

        it("Should track verification count", async function () {
            const a: [bigint, bigint] = [1n, 2n];
            const b: [[bigint, bigint], [bigint, bigint]] = [[1n, 2n], [3n, 4n]];
            const c: [bigint, bigint] = [1n, 2n];

            await proofVerifier.connect(verifier).verifyProof(0, a, b, c, [10000n]);
            await proofVerifier.connect(verifier).verifyProof(1, a, b, c, [500n]);

            expect(await proofVerifier.getVerificationCount()).to.equal(2n);
        });
    });
});
