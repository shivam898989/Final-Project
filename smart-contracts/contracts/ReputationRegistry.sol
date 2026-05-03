// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationRegistry
 * @notice Tracks issuer reputation scores on-chain.
 *         Score = (validCredentials * 100 / totalCredentials) * endorsements
 */
contract ReputationRegistry is Ownable {
    struct Reputation {
        uint256 validCredentials;
        uint256 totalCredentials;
        uint256 endorsements;
        uint256 score;
        uint256 lastUpdated;
    }

    mapping(address => Reputation) public reputations;

    event ReputationUpdated(
        address indexed issuer,
        uint256 validCredentials,
        uint256 totalCredentials,
        uint256 endorsements,
        uint256 score
    );

    event IssuerEndorsed(address indexed issuer, address indexed endorser);
    event FraudReported(address indexed issuer, address indexed reporter, string reason);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Update an issuer's reputation metrics
     * @param issuer Address of the issuer
     * @param validCredentials Number of valid credentials issued
     * @param totalCredentials Total number of credentials issued
     * @param endorsements Number of endorsements received
     */
    function updateReputation(
        address issuer,
        uint256 validCredentials,
        uint256 totalCredentials,
        uint256 endorsements
    ) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        require(totalCredentials > 0, "Total credentials must be positive");
        require(validCredentials <= totalCredentials, "Valid cannot exceed total");

        uint256 score = (validCredentials * 100 / totalCredentials) * endorsements;

        reputations[issuer] = Reputation({
            validCredentials: validCredentials,
            totalCredentials: totalCredentials,
            endorsements: endorsements,
            score: score,
            lastUpdated: block.timestamp
        });

        emit ReputationUpdated(issuer, validCredentials, totalCredentials, endorsements, score);
    }

    /**
     * @notice Endorse an issuer (increments endorsement count)
     * @param issuer Address of the issuer to endorse
     */
    function endorseIssuer(address issuer) external {
        require(issuer != address(0), "Invalid issuer address");
        require(msg.sender != issuer, "Cannot self-endorse");

        Reputation storage rep = reputations[issuer];
        rep.endorsements += 1;

        // Recalculate score
        if (rep.totalCredentials > 0) {
            rep.score = (rep.validCredentials * 100 / rep.totalCredentials) * rep.endorsements;
        }
        rep.lastUpdated = block.timestamp;

        emit IssuerEndorsed(issuer, msg.sender);
    }

    /**
     * @notice Report fraud against an issuer
     * @param issuer Address of the issuer
     * @param reason Description of the fraud
     */
    function reportFraud(address issuer, string calldata reason) external {
        require(issuer != address(0), "Invalid issuer address");
        require(bytes(reason).length > 0, "Reason required");
        emit FraudReported(issuer, msg.sender, reason);
    }

    /**
     * @notice Get an issuer's reputation details
     */
    function getReputation(address issuer) external view returns (
        uint256 validCredentials,
        uint256 totalCredentials,
        uint256 endorsements,
        uint256 score,
        uint256 lastUpdated
    ) {
        Reputation storage rep = reputations[issuer];
        return (
            rep.validCredentials,
            rep.totalCredentials,
            rep.endorsements,
            rep.score,
            rep.lastUpdated
        );
    }

    /**
     * @notice Get just the reputation score
     */
    function getScore(address issuer) external view returns (uint256) {
        return reputations[issuer].score;
    }
}
