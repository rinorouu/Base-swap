// src/hooks/useContract.ts
import { usePublicClient, useWalletClient } from "wagmi";
import type { Abi, Address } from "viem";

type UseContractReturn = {
  read: <T = any>(functionName: string, args?: any[]) => Promise<T | null>;
  write: <T = any>(
    functionName: string,
    args?: any[],
    options?: { value?: bigint }
  ) => Promise<T | null>;
};

export const useContract = (
  address?: Address,
  abi?: Abi
): UseContractReturn | null => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  if (!address || !abi) return null;

  return {
    // 🔹 Read-only call (pakai public client)
    read: async <T = any>(functionName: string, args: any[] = []) => {
      if (!publicClient) return null;
      try {
        const result = await publicClient.readContract({
          address,
          abi,
          functionName,
          args,
        });
        return result as T; // ✅ fix generic
      } catch (err) {
        console.error("Read contract error:", err);
        return null;
      }
    },

    // 🔹 Write call (butuh wallet connect)
    write: async <T = any>(
      functionName: string,
      args: any[] = [],
      options: { value?: bigint } = {}
    ) => {
      if (!walletClient) {
        console.error("Wallet not connected");
        return null;
      }
      try {
        const result = await walletClient.writeContract({
          address,
          abi,
          functionName,
          args,
          ...options,
        });
        return result as T; // ✅ fix generic
      } catch (err) {
        console.error("Write contract error:", err);
        return null;
      }
    },
  };
};
