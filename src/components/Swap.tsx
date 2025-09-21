// components/Swap.tsx
import React, { useState, useEffect } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useBalance,
  useBlockNumber,
} from "wagmi";
import { parseEther, parseUnits, formatEther, formatUnits } from "viem";
import { baseSepolia } from "wagmi/chains";
import { getContractAddress, getTokenAddress } from "../contracts/addresses";
import { SwapPoolABI } from "../contracts/abis/SwapPoolABI";

const Swap: React.FC = () => {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("0");
  const [slippage, setSlippage] = useState("0.5");
  const [isCalculating, setIsCalculating] = useState(false);
  const [swapDirection, setSwapDirection] = useState<"usdcToEth" | "ethToUsdc">(
    "usdcToEth"
  );

  const { address: account, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { writeContract, isPending } = useWriteContract();

  // Token addresses untuk Base Sepolia
  const USDC_ADDRESS = getTokenAddress(chainId, "usdc") as `0x${string}`;
  const ETH_ADDRESS = getTokenAddress(chainId, "eth") as `0x${string}`;

  // Get token balances
  const { data: usdcBalance, refetch: refetchUsdc } = useBalance({
    address: account,
    token: USDC_ADDRESS,
    query: {
      enabled: isConnected,
    },
  });

  const { data: ethBalance, refetch: refetchEth } = useBalance({
    address: account,
    query: {
      enabled: isConnected,
    },
  });

  const contractAddress = getContractAddress(chainId) as `0x${string}`;

  // Get pool info from contract
  const { data: poolInfo, refetch: refetchPool } = useReadContract({
    address: contractAddress,
    abi: SwapPoolABI,
    functionName: "pools",
    args: [USDC_ADDRESS, ETH_ADDRESS],
    query: {
      enabled: isConnected && !!contractAddress,

      staleTime: 10000,
    },
  });

  // Get quote from contract berdasarkan direction
  const { data: quoteData, isLoading: isQuoteLoading } = useReadContract({
    address: contractAddress,
    abi: SwapPoolABI,
    functionName: "getQuote",
    args: [
      swapDirection === "usdcToEth" ? USDC_ADDRESS : ETH_ADDRESS,
      swapDirection === "usdcToEth" ? ETH_ADDRESS : USDC_ADDRESS,
      swapDirection === "usdcToEth"
        ? parseUnits(fromAmount || "0", 6)
        : parseEther(fromAmount || "0"),
    ],
    query: {
      enabled:
        isConnected &&
        !!fromAmount &&
        parseFloat(fromAmount) > 0 &&
        !!contractAddress,
    },
  });

  // Refresh data on new block
  useEffect(() => {
    if (blockNumber) {
      refetchUsdc();
      refetchEth();
      refetchPool();
    }
  }, [blockNumber]);

  // Update exchange rate dari pool info
  useEffect(() => {
    if (poolInfo) {
      const [rate, , enabled] = poolInfo as [bigint, bigint, boolean];
      if (rate && enabled) {
        const rateNumber = Number(rate) / 1e18;
        setExchangeRate(rateNumber.toFixed(8));

        // Auto-calculate berdasarkan direction
        if (fromAmount && parseFloat(fromAmount) > 0) {
          if (swapDirection === "usdcToEth") {
            const calculated = (parseFloat(fromAmount) * rateNumber).toFixed(6);
            setToAmount(calculated);
          } else {
            const calculated = (parseFloat(fromAmount) / rateNumber).toFixed(2);
            setToAmount(calculated);
          }
        }
      } else if (!enabled) {
        setExchangeRate("0");
        setToAmount("");
      }
    }
  }, [poolInfo, fromAmount, swapDirection]);

  // Update output amount ketika quote berubah
  useEffect(() => {
    if (quoteData) {
      if (swapDirection === "usdcToEth") {
        const amountOut = formatEther(quoteData as bigint);
        setToAmount(amountOut);
      } else {
        const amountOut = formatUnits(quoteData as bigint, 6);
        setToAmount(amountOut);
      }
      setIsCalculating(false);
    }
  }, [quoteData, swapDirection]);

  const handleSwap = async () => {
    if (
      !isConnected ||
      !account ||
      !fromAmount ||
      !toAmount ||
      !contractAddress
    )
      return;

    try {
      const slippageAmount =
        parseFloat(toAmount) * (1 - parseFloat(slippage) / 100);

      if (swapDirection === "usdcToEth") {
        // Swap USDC to ETH
        const minAmountOut = parseEther(slippageAmount.toFixed(18));

        writeContract({
          address: contractAddress,
          abi: SwapPoolABI,
          functionName: "swapTokens",
          args: [
            USDC_ADDRESS,
            ETH_ADDRESS,
            parseUnits(fromAmount, 6),
            minAmountOut,
          ],
        });
      } else {
        // Swap ETH to USDC
        const minAmountOut = parseUnits(slippageAmount.toFixed(6), 6);
        const value = parseEther(fromAmount);

        writeContract({
          address: contractAddress,
          abi: SwapPoolABI,
          functionName: "swapTokens",
          args: [ETH_ADDRESS, USDC_ADDRESS, value, minAmountOut],
          value: value,
        });
      }
    } catch (error) {
      console.error("Swap error:", error);
    }
  };

  const setMaxAmount = () => {
    if (swapDirection === "usdcToEth" && usdcBalance) {
      const maxAmount = formatUnits(usdcBalance.value, usdcBalance.decimals);
      setFromAmount(maxAmount);
    } else if (swapDirection === "ethToUsdc" && ethBalance) {
      const maxAmount = formatEther(ethBalance.value);
      setFromAmount(maxAmount);
    }
  };

  const toggleSwapDirection = () => {
    setSwapDirection(swapDirection === "usdcToEth" ? "ethToUsdc" : "usdcToEth");
    // Reset amounts ketika ganti direction
    setFromAmount("");
    setToAmount("");
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setIsCalculating(true);

    if (!value || parseFloat(value) <= 0) {
      setToAmount("");
      return;
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          Connect wallet to start swapping
        </div>
        <div className="text-sm text-gray-500">Network: Base Sepolia</div>
      </div>
    );
  }

  if (chainId !== baseSepolia.id) {
    return (
      <div className="text-center py-8">
        <div className="text-yellow-500 mb-4">Wrong Network</div>
        <div className="text-sm text-gray-400">
          Please switch to Base Sepolia
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Chain ID: {baseSepolia.id}
        </div>
      </div>
    );
  }

  const fromToken = swapDirection === "usdcToEth" ? "USDC" : "ETH";
  const toToken = swapDirection === "usdcToEth" ? "ETH" : "USDC";
  const fromBalance = swapDirection === "usdcToEth" ? usdcBalance : ethBalance;
  const toBalance = swapDirection === "usdcToEth" ? ethBalance : usdcBalance;

  return (
    <div className="space-y-5">
      {/* Slippage Settings */}
      <div className="bg-gray-700 p-3 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 text-sm">Slippage Tolerance</span>
          <div className="flex space-x-2">
            {["0.5", "1.0", "3.0"].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`px-2 py-1 rounded text-xs ${
                  slippage === value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}>
                {value}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* From Token */}
      <div className="bg-gray-700 p-4 rounded-2xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">You pay</span>
          <span className="text-gray-400 text-sm">
            Balance:{" "}
            {fromBalance
              ? swapDirection === "usdcToEth"
                ? parseFloat(
                    formatUnits(fromBalance.value, fromBalance.decimals)
                  ).toFixed(2)
                : parseFloat(formatEther(fromBalance.value)).toFixed(4)
              : "0"}{" "}
            {fromToken}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                swapDirection === "usdcToEth" ? "bg-blue-500" : "bg-purple-500"
              }`}>
              <span className="text-white text-sm font-bold">
                {swapDirection === "usdcToEth" ? "U" : "E"}
              </span>
            </div>
            <span className="font-semibold">{fromToken}</span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="bg-transparent text-right text-xl w-24 outline-none hide-spinner"
              placeholder="0.0"
              min="0"
              step={swapDirection === "usdcToEth" ? "0.01" : "0.0001"}
            />
            <button
              onClick={setMaxAmount}
              className="bg-gray-600 text-xs px-2 py-1 rounded hover:bg-gray-500 transition-colors">
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* Swap Arrow dengan toggle button */}
      <div className="flex justify-center -my-2 z-10 relative">
        <button
          onClick={toggleSwapDirection}
          className="bg-gray-600 p-2 rounded-full hover:bg-gray-500 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* To Token */}
      <div className="bg-gray-700 p-4 rounded-2xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">You receive</span>
          <span className="text-gray-400 text-sm">
            Balance:{" "}
            {toBalance
              ? swapDirection === "usdcToEth"
                ? parseFloat(formatEther(toBalance.value)).toFixed(4)
                : parseFloat(
                    formatUnits(toBalance.value, toBalance.decimals)
                  ).toFixed(2)
              : "0"}{" "}
            {toToken}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                swapDirection === "usdcToEth" ? "bg-purple-500" : "bg-blue-500"
              }`}>
              <span className="text-white text-sm font-bold">
                {swapDirection === "usdcToEth" ? "E" : "U"}
              </span>
            </div>
            <span className="font-semibold">{toToken}</span>
          </div>

          <input
            type="number"
            value={toAmount}
            readOnly
            className="bg-transparent text-right text-xl w-24 outline-none hide-spinner text-gray-300"
            placeholder="0.0"
          />
        </div>

        {isQuoteLoading && (
          <div className="text-gray-400 text-xs mt-2">
            Calculating best price...
          </div>
        )}
      </div>

      {/* Rate Info */}
      <div className="bg-gray-700 p-3 rounded-xl">
        <div className="text-center text-sm text-gray-400">
          {swapDirection === "usdcToEth"
            ? `1 USDC = ${exchangeRate} ETH`
            : `1 ETH = ${(1 / parseFloat(exchangeRate || "1")).toFixed(
                2
              )} USDC`}
          {isCalculating && <span className="ml-2 animate-pulse">🔄</span>}
        </div>
        {poolInfo && (
          <div className="text-center text-xs text-gray-500 mt-1">
            Pool:{" "}
            {(poolInfo as [bigint, bigint, boolean])[2] ? "Active" : "Inactive"}
          </div>
        )}
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={
          isPending ||
          !fromAmount ||
          !toAmount ||
          parseFloat(fromAmount) <= 0 ||
          !contractAddress ||
          exchangeRate === "0"
        }
        className="w-full bg-blue-600 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
        {isPending
          ? "Swapping..."
          : !contractAddress
          ? "Contract Not Deployed"
          : exchangeRate === "0"
          ? "Pool Inactive"
          : `Swap ${fromToken} to ${toToken}`}
      </button>

      {/* Network Info */}
      <div className="text-center text-xs text-gray-500">
        Base Sepolia • Block: {blockNumber?.toString()}
      </div>
    </div>
  );
};

export default Swap;
