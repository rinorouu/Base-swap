// contracts/addresses.ts
export const CONTRACT_ADDRESSES = {
  mainnet: {
    swapPool: "0x...",
  },
  sepolia: {
    swapPool: "0x...",
  },
  baseSepolia: {
    swapPool: "0xA9f2C892DB67585ce6B3BC519F1B69c6B42B2937",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    eth: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  },
  localhost: {
    swapPool: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  },
} as const;

export const getContractAddress = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return CONTRACT_ADDRESSES.mainnet.swapPool;
    case 11155111:
      return CONTRACT_ADDRESSES.sepolia.swapPool;
    case 84532:
      return CONTRACT_ADDRESSES.baseSepolia.swapPool; // Base Sepolia chainId
    default:
      return CONTRACT_ADDRESSES.localhost.swapPool;
  }
};

export const getTokenAddress = (
  chainId: number,
  token: "usdc" | "eth"
): string => {
  switch (chainId) {
    case 84532:
      return CONTRACT_ADDRESSES.baseSepolia[token];
    default:
      return CONTRACT_ADDRESSES.baseSepolia[token];
  }
};
