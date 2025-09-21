// src/contracts/types/abi.ts
export interface AbiInput {
  readonly name: string;
  readonly type: string;
  readonly internalType?: string;
  readonly indexed?: boolean;
}

export interface AbiOutput {
  readonly name: string;
  readonly type: string;
  readonly internalType?: string;
}

export interface AbiItem {
  readonly anonymous?: boolean;
  readonly constant?: boolean;
  readonly inputs?: readonly AbiInput[];
  readonly name?: string;
  readonly outputs?: readonly AbiOutput[];
  readonly payable?: boolean;
  readonly stateMutability?: "pure" | "view" | "nonpayable" | "payable";
  readonly type: "function" | "constructor" | "event" | "fallback" | "receive";
  readonly gas?: number;
}

export type Abi = readonly AbiItem[];
