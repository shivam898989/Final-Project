import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

function getDeployerAccounts(): string[] {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY?.trim();

  if (!privateKey) {
    return [];
  }

  if (/^0x[a-fA-F0-9]{40}$/.test(privateKey)) {
    throw new Error(
      "DEPLOYER_PRIVATE_KEY contains a wallet address. Export the private key for that funded MetaMask account instead."
    );
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error(
      "DEPLOYER_PRIVATE_KEY must be a 32-byte hex private key, formatted as 0x plus 64 hexadecimal characters."
    );
  }

  return [privateKey];
}

const deployerAccounts = getDeployerAccounts();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    polygonAmoy: {
      url: process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology",
      accounts: deployerAccounts,
      chainId: 80002,
    },
    polygon: {
      url: process.env.POLYGON_RPC || "https://polygon-rpc.com",
      accounts: deployerAccounts,
      chainId: 137,
    },
  },
};

export default config;
