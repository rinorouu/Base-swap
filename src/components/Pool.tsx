// components/Pool.tsx
import React, { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useBalance,
  useChainId,
  useBlockNumber,
} from "wagmi";
import { formatEther, formatUnits } from "viem";
import { baseSepolia } from "wagmi/chains";
import { getContractAddress, getTokenAddress } from "../contracts/addresses";
import { SwapPoolABI } from "../contracts/abis/SwapPoolABI";
import AddLiquidity from "./AddLiquidity";

const Pool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "myPools" | "allPools" | "addLiquidity"
  >("myPools");

  const { address: account, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const USDC_ADDRESS = getTokenAddress(chainId, "usdc") as `0x${string}`;
  const ETH_ADDRESS = getTokenAddress(chainId, "eth") as `0x${string}`;
  const contractAddress = getContractAddress(chainId) as `0x${string}`;

  // Get token balances
  const { refetch: refetchUsdc } = useBalance({
    address: account,
    token: USDC_ADDRESS,
    query: {
      enabled: isConnected,
    },
  });

  const { refetch: refetchEth } = useBalance({
    address: account,
    query: {
      enabled: isConnected,
    },
  });

  // Get pool info
  const { data: poolInfo, refetch: refetchPool } = useReadContract({
    address: contractAddress,
    abi: SwapPoolABI,
    functionName: "pools",
    args: [USDC_ADDRESS, ETH_ADDRESS],
    query: {
      enabled: isConnected && !!contractAddress,
    },
  });

  // Get collected fees
  const { data: usdcFees, refetch: refetchUsdcFees } = useReadContract({
    address: contractAddress,
    abi: SwapPoolABI,
    functionName: "collectedFees",
    args: [USDC_ADDRESS],
    query: {
      enabled: isConnected && !!contractAddress,
    },
  });

  const { data: ethFees, refetch: refetchEthFees } = useReadContract({
    address: contractAddress,
    abi: SwapPoolABI,
    functionName: "collectedFees",
    args: [ETH_ADDRESS],
    query: {
      enabled: isConnected && !!contractAddress,
    },
  });

  // Refresh data on new block
  useEffect(() => {
    if (blockNumber) {
      refetchUsdc();
      refetchEth();
      refetchPool();
      refetchUsdcFees();
      refetchEthFees();
    }
  }, [blockNumber]);

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">Connect wallet to view pools</div>
      </div>
    );
  }

  if (chainId !== baseSepolia.id) {
    return (
      <div className="text-center py-8">
        <div className="text-yellow-500 mb-2">Wrong Network</div>
        <div className="text-sm text-gray-400">
          Please switch to Base Sepolia
        </div>
      </div>
    );
  }

  if (!contractAddress) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Contract Not Deployed</div>
        <div className="text-sm text-gray-400">
          Swap pool not deployed on this network
        </div>
      </div>
    );
  }

  const [rate, feePercentage, enabled] = poolInfo
    ? (poolInfo as [bigint, bigint, boolean])
    : [BigInt(0), BigInt(0), false];

  return (
    <div className="space-y-5">
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-2 ${
            activeTab === "myPools"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("myPools")}>
          My Liquidity
        </button>
        <button
          className={`flex-1 py-2 ${
            activeTab === "allPools"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("allPools")}>
          Pool Info
        </button>
        <button
          className={`flex-1 py-2 ${
            activeTab === "addLiquidity"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("addLiquidity")}>
          Add Liquidity
        </button>
      </div>

      {activeTab === "addLiquidity" && <AddLiquidity />}

      {activeTab === "myPools" && (
        <div className="bg-gray-700 p-4 rounded-2xl">
          <h3 className="font-semibold mb-4 text-lg">Your Liquidity</h3>

          {!enabled ? (
            <div className="text-center py-8">
              <div className="text-yellow-500 mb-2">No Liquidity</div>
              <div className="text-sm text-gray-400">
                Add liquidity to the pool to enable swapping
              </div>
              <button
                onClick={() => setActiveTab("addLiquidity")}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Add Liquidity
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">U</span>
                      </div>
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">E</span>
                      </div>
                    </div>
                    <span className="font-semibold">USDC/ETH</span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs ${
                      enabled ? "bg-green-500" : "bg-red-500"
                    }`}>
                    {enabled ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Exchange Rate</div>
                    <div className="font-semibold">
                      1 USDC = {(Number(rate) / 1e18).toFixed(6)} ETH
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Fee Rate</div>
                    <div className="font-semibold">
                      {(Number(feePercentage) / 100).toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => setActiveTab("addLiquidity")}
                    className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Add More
                  </button>
                  <button className="bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-400 transition-colors">
                    Remove
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-600 rounded-lg">
                <h4 className="font-semibold mb-3">Your Fees</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>USDC Fees:</span>
                    <span className="font-semibold">
                      {usdcFees
                        ? parseFloat(
                            formatUnits(usdcFees as bigint, 6)
                          ).toFixed(4)
                        : "0"}{" "}
                      USDC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ETH Fees:</span>
                    <span className="font-semibold">
                      {ethFees
                        ? parseFloat(formatEther(ethFees as bigint)).toFixed(6)
                        : "0"}{" "}
                      ETH
                    </span>
                  </div>
                  <button className="w-full bg-green-500 text-white py-2 rounded-lg mt-2 hover:bg-green-600 transition-colors">
                    Claim All Fees
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "allPools" && (
        <div className="bg-gray-700 p-4 rounded-2xl">
          <h3 className="font-semibold mb-4 text-lg">Pool Information</h3>

          <div className="space-y-4">
            <div className="p-3 bg-gray-600 rounded-lg">
              <h4 className="font-semibold mb-3">USDC/ETH Pool</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Pool Status:</span>
                  <span className={enabled ? "text-green-400" : "text-red-400"}>
                    {enabled ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Exchange Rate:</span>
                  <span>1 USDC = {(Number(rate) / 1e18).toFixed(8)} ETH</span>
                </div>

                <div className="flex justify-between">
                  <span>Trading Fee:</span>
                  <span>{(Number(feePercentage) / 100).toFixed(2)}%</span>
                </div>

                <div className="flex justify-between">
                  <span>Total USDC Fees:</span>
                  <span>
                    {usdcFees
                      ? parseFloat(formatUnits(usdcFees as bigint, 6)).toFixed(
                          2
                        )
                      : "0"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Total ETH Fees:</span>
                  <span>
                    {ethFees
                      ? parseFloat(formatEther(ethFees as bigint)).toFixed(6)
                      : "0"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-600 rounded-lg">
              <h4 className="font-semibold mb-3">Contract Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Contract Address:</span>
                  <span className="text-xs font-mono text-gray-400">
                    {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span>Base Sepolia</span>
                </div>
                <div className="flex justify-between">
                  <span>Chain ID:</span>
                  <span>{baseSepolia.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Block:</span>
                  <span>{blockNumber?.toString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-500">
        Base Sepolia • Block: {blockNumber?.toString()}
      </div>
    </div>
  );
};

export default Pool;
