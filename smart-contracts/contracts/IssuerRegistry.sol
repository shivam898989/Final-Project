// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IssuerRegistry
 * @notice Manages trusted credential issuers on the MDTL platform.
 *         Only governance (owner) can register or revoke issuers.
 */
contract IssuerRegistry is Ownable {
    struct Issuer {
        string did;
        string organizationName;
        bool isActive;
        uint256 registeredAt;
    }

    mapping(address => Issuer) public issuers;
    address[] public issuerList;

    event IssuerRegistered(address indexed issuerAddress, string did, string organizationName);
    event IssuerRevoked(address indexed issuerAddress);
    event IssuerReactivated(address indexed issuerAddress);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Register a new trusted issuer
     * @param issuerAddress Ethereum address of the issuer
     * @param did Decentralized Identifier of the issuer
     * @param organizationName Human-readable organization name
     */
    function registerIssuer(
        address issuerAddress,
        string calldata did,
        string calldata organizationName
    ) external onlyOwner {
        require(issuerAddress != address(0), "Invalid address");
        require(!issuers[issuerAddress].isActive, "Issuer already active");
        require(bytes(did).length > 0, "DID required");

        if (issuers[issuerAddress].registeredAt == 0) {
            issuerList.push(issuerAddress);
        }

        issuers[issuerAddress] = Issuer({
            did: did,
            organizationName: organizationName,
            isActive: true,
            registeredAt: block.timestamp
        });

        emit IssuerRegistered(issuerAddress, did, organizationName);
    }

    /**
     * @notice Revoke an issuer's trusted status
     */
    function revokeIssuer(address issuerAddress) external onlyOwner {
        require(issuers[issuerAddress].isActive, "Issuer not active");
        issuers[issuerAddress].isActive = false;
        emit IssuerRevoked(issuerAddress);
    }

    /**
     * @notice Reactivate a previously revoked issuer
     */
    function reactivateIssuer(address issuerAddress) external onlyOwner {
        require(issuers[issuerAddress].registeredAt > 0, "Issuer not registered");
        require(!issuers[issuerAddress].isActive, "Issuer already active");
        issuers[issuerAddress].isActive = true;
        emit IssuerReactivated(issuerAddress);
    }

    /**
     * @notice Check if an address is an active issuer
     */
    function isIssuer(address issuerAddress) external view returns (bool) {
        return issuers[issuerAddress].isActive;
    }

    /**
     * @notice Get issuer details
     */
    function getIssuer(address issuerAddress) external view returns (
        string memory did,
        string memory organizationName,
        bool isActive,
        uint256 registeredAt
    ) {
        Issuer storage issuer = issuers[issuerAddress];
        return (issuer.did, issuer.organizationName, issuer.isActive, issuer.registeredAt);
    }

    /**
     * @notice Get total number of registered issuers (including revoked)
     */
    function getIssuerCount() external view returns (uint256) {
        return issuerList.length;
    }
}
