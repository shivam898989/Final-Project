// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CredentialRegistry
 * @notice Stores credential hashes and Merkle roots on-chain.
 *         Only registered issuers (via IssuerRegistry) can anchor credentials.
 */

interface IIssuerRegistry {
    function isIssuer(address issuerAddress) external view returns (bool);
}

contract CredentialRegistry {
    IIssuerRegistry public issuerRegistry;

    // Individual credential hash => anchor info
    struct CredentialAnchor {
        address issuer;
        uint256 timestamp;
        bool exists;
    }

    // Merkle root => batch info
    struct MerkleRootAnchor {
        address issuer;
        uint256 credentialCount;
        uint256 timestamp;
        bool exists;
    }

    mapping(bytes32 => CredentialAnchor) public credentialAnchors;
    mapping(bytes32 => MerkleRootAnchor) public merkleRootAnchors;

    // Track all anchored hashes for enumeration
    bytes32[] public anchoredHashes;
    bytes32[] public anchoredMerkleRoots;

    event CredentialAnchored(
        bytes32 indexed credentialHash,
        address indexed issuer,
        uint256 timestamp
    );

    event MerkleRootAnchored(
        bytes32 indexed merkleRoot,
        address indexed issuer,
        uint256 credentialCount,
        uint256 timestamp
    );

    constructor(address _issuerRegistry) {
        issuerRegistry = IIssuerRegistry(_issuerRegistry);
    }

    modifier onlyIssuer() {
        require(issuerRegistry.isIssuer(msg.sender), "Caller is not a registered issuer");
        _;
    }

    /**
     * @notice Anchor a single credential hash on-chain
     * @param credentialHash SHA-256 hash of the credential
     */
    function anchorCredentialHash(bytes32 credentialHash) external onlyIssuer {
        require(!credentialAnchors[credentialHash].exists, "Credential already anchored");

        credentialAnchors[credentialHash] = CredentialAnchor({
            issuer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        anchoredHashes.push(credentialHash);
        emit CredentialAnchored(credentialHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Anchor a Merkle root representing a batch of credentials
     * @param merkleRoot Root hash of the credential Merkle tree
     * @param credentialCount Number of credentials in the batch
     */
    function anchorMerkleRoot(bytes32 merkleRoot, uint256 credentialCount) external onlyIssuer {
        require(!merkleRootAnchors[merkleRoot].exists, "Merkle root already anchored");
        require(credentialCount > 0, "Count must be positive");

        merkleRootAnchors[merkleRoot] = MerkleRootAnchor({
            issuer: msg.sender,
            credentialCount: credentialCount,
            timestamp: block.timestamp,
            exists: true
        });

        anchoredMerkleRoots.push(merkleRoot);
        emit MerkleRootAnchored(merkleRoot, msg.sender, credentialCount, block.timestamp);
    }

    /**
     * @notice Verify that a credential hash exists on-chain
     * @param credentialHash Hash to verify
     * @return exists Whether the hash is anchored
     * @return issuer Address of the anchoring issuer
     * @return timestamp When the hash was anchored
     */
    function verifyCredentialHash(bytes32 credentialHash) external view returns (
        bool exists,
        address issuer,
        uint256 timestamp
    ) {
        CredentialAnchor storage anchor = credentialAnchors[credentialHash];
        return (anchor.exists, anchor.issuer, anchor.timestamp);
    }

    /**
     * @notice Verify that a Merkle root exists on-chain
     */
    function verifyMerkleRoot(bytes32 merkleRoot) external view returns (
        bool exists,
        address issuer,
        uint256 credentialCount,
        uint256 timestamp
    ) {
        MerkleRootAnchor storage anchor = merkleRootAnchors[merkleRoot];
        return (anchor.exists, anchor.issuer, anchor.credentialCount, anchor.timestamp);
    }

    /**
     * @notice Get total count of anchored credential hashes
     */
    function getAnchoredHashCount() external view returns (uint256) {
        return anchoredHashes.length;
    }

    /**
     * @notice Get total count of anchored Merkle roots
     */
    function getAnchoredMerkleRootCount() external view returns (uint256) {
        return anchoredMerkleRoots.length;
    }
}
