// components/AddLiquidity.tsx
import React, { useState } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useBalance,
} from "wagmi";
import { parseEther, parseUnits, formatEther, formatUnits } from "viem";
import { baseSepolia } from "wagmi/chains";
import { getContractAddress, getTokenAddress } from "../contracts/addresses";
import { SwapPoolABI } from "../contracts/abis/SwapPoolABI";

const AddLiquidity: React.FC = () => {
  const [usdcAmount, setUsdcAmount] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [] = useState(false);

  const { address: account, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContract, isPending } = useWriteContract();

  const USDC_ADDRESS = getTokenAddress(chainId, "usdc") as `0x${string}`;
  const ETH_ADDRESS = getTokenAddress(chainId, "eth") as `0x${string}`;
  const contractAddress = getContractAddress(chainId) as `0x${string}`;

  // Get token balances
  const { data: usdcBalance } = useBalance({
    address: account,
    token: USDC_ADDRESS,
    query: {
      enabled: isConnected,
    },
  });

  const { data: ethBalance } = useBalance({
    address: account,
    query: {
      enabled: isConnected,
    },
  });

  // Get pool info to determine ratio
  const { data: poolInfo } = useReadContract({
    address: contractAddress,
    abi: SwapPoolABI,
    functionName: "pools",
    args: [USDC_ADDRESS, ETH_ADDRESS],
    query: {
      enabled: isConnected && !!contractAddress,
    },
  });

  const handleAddLiquidity = async () => {
    if (
      !isConnected ||
      !account ||
      !usdcAmount ||
      !ethAmount ||
      !contractAddress
    )
      return;

    try {
      // First, approve USDC spending
      writeContract({
        address: USDC_ADDRESS,
        abi: [
          {
            constant: false,
            inputs: [
              { name: "spender", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            name: "approve",
            outputs: [{ name: "", type: "bool" }],
            type: "function",
          },
        ],
        functionName: "approve",
        args: [contractAddress, parseUnits(usdcAmount, 6)],
      });

      // Then add liquidity
      // Then add liquidity
      writeContract({
        address: contractAddress,
        abi: SwapPoolABI as unknown as any,
        functionName: "addLiquidity",
        args: [
          USDC_ADDRESS,
          ETH_ADDRESS,
          parseUnits(usdcAmount, 6),
          parseEther(ethAmount),
        ],
        value: parseEther(ethAmount),
      });
    } catch (error) {
      console.error("Add liquidity error:", error);
    }
  };

  const setMaxUsdc = () => {
    if (usdcBalance) {
      setUsdcAmount(formatUnits(usdcBalance.value, usdcBalance.decimals));
    }
  };

  const setMaxEth = () => {
    if (ethBalance) {
      setEthAmount(formatEther(ethBalance.value));
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">Connect wallet to add liquidity</div>
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

  return (
    <div className="space-y-5">
      <div className="bg-gray-700 p-4 rounded-2xl">
        <h3 className="font-semibold mb-4 text-lg">Add Liquidity</h3>

        {/* USDC Input */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">USDC Amount</span>
            <span className="text-gray-400 text-sm">
              Balance:{" "}
              {usdcBalance
                ? parseFloat(
                    formatUnits(usdcBalance.value, usdcBalance.decimals)
                  ).toFixed(2)
                : "0"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">U</span>
              </div>
              <span className="font-semibold">USDC</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
                className="bg-transparent text-right text-xl w-24 outline-none hide-spinner"
                placeholder="0.0"
                min="0"
                step="0.01"
              />
              <button
                onClick={setMaxUsdc}
                className="bg-gray-600 text-xs px-2 py-1 rounded hover:bg-gray-500 transition-colors">
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* ETH Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">ETH Amount</span>
            <span className="text-gray-400 text-sm">
              Balance:{" "}
              {ethBalance
                ? parseFloat(formatEther(ethBalance.value)).toFixed(4)
                : "0"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">E</span>
              </div>
              <span className="font-semibold">ETH</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                className="bg-transparent text-right text-xl w-24 outline-none hide-spinner"
                placeholder="0.0"
                min="0"
                step="0.0001"
              />
              <button
                onClick={setMaxEth}
                className="bg-gray-600 text-xs px-2 py-1 rounded hover:bg-gray-500 transition-colors">
                MAX
              </button>
            </div>
          </div>
        </div>

        {poolInfo && (
          <div className="mt-4 p-3 bg-gray-600 rounded-lg">
            <div className="text-sm text-gray-300">
              Current ratio: 1 USDC ={" "}
              {(
                Number((poolInfo as [bigint, bigint, boolean])[0]) / 1e18
              ).toFixed(6)}{" "}
              ETH
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleAddLiquidity}
        disabled={
          isPending ||
          !usdcAmount ||
          !ethAmount ||
          parseFloat(usdcAmount) <= 0 ||
          parseFloat(ethAmount) <= 0
        }
        className="w-full bg-green-600 py-3 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
        {isPending ? "Adding Liquidity..." : "Add Liquidity"}
      </button>
    </div>
  );
};

export default AddLiquidity;
