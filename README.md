# Base Swap 🚀

A decentralized exchange (DEX) interface built on Base Sepolia network, featuring token swaps between USDC and native ETH with a clean, modern UI.

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-flat&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-flat&logo=tailwind-css&logoColor=white)
![Wagmi](https://img.shields.io/badge/Wagmi-FF0080?style=for-flat&logo=ethereum&logoColor=white)
![Base](https://img.shields.io/badge/Base-0052FF?style=for-flat&logo=coinbase&logoColor=white)

## ⚠️ Important Note About Liquidity

**This interface is designed for swapping only.** The smart contract powering this DEX does not include `addLiquidity` functionality in the traditional sense.

### How Liquidity Works in This Implementation:

- 🔧 **Pre-configured Pools**: Liquidity pools are set up and managed externally through administrative functions in the smart contract
- ⚙️ **Admin-Managed**: Pool parameters (rates, fees, enablement) are configured by the contract owner using `setPool()` function
- 📊 **Static Rates**: Exchange rates are fixed within the contract and can be updated by the owner as needed
- 🔒 **No Public Deposits**: Users cannot directly add liquidity to pools through the UI

### For Testing and Development:
You'll need to:
1. Deploy the smart contract with initial pool configuration
2. Use owner functions to set up USDC/ETH pool with desired rates
3. Ensure the contract has sufficient token balances for swaps

## ✨ Features

- 🔄 **Token Swapping**: Swap between USDC and native ETH
- 📱 **Responsive UI**: Clean, modern interface built with Tailwind CSS
- 🔗 **Wallet Integration**: Connect with MetaMask or any WalletConnect-compatible wallet
- ⚡ **Fast Transactions**: Built on Base Sepolia for quick confirmations
- 🎯 **Real-time Quotes**: Get accurate swap quotes from the smart contract
- 🔧 **Slippage Control**: Customizable slippage tolerance (0.5%, 1.0%, 3.0%)

## 🛠️ Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Ethereum (Base Sepolia)
- **Web3**: Wagmi v2 + Viem
- **Smart Contracts**: Custom Swap Pool Contract

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/base-defi-swap.git

# Navigate to project directory
cd base-defi-swap

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **Switch Network**: Ensure you're on Base Sepolia testnet
3. **Select Tokens**: Choose USDC <> ETH swap direction
4. **Enter Amount**: Input the amount you want to swap
5. **Review Quote**: Check the exchange rate and estimated output
6. **Swap**: Confirm the transaction in your wallet

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_RPC_URL=https://base-sepolia.g.alchemy.com/v2/your-api-key
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

### Smart Contract Setup

The contract must be deployed with:

```solidity
// Initial pool setup required by owner
setPool(
    USDC_ADDRESS,
    ETH_ADDRESS, 
    220000000000000, // 1 USDC = 0.00022 ETH
    300 // 3% fee (300 basis points)
);
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Swap.tsx          # Main swap interface
│   ├── Pool.tsx          # Pool information display
│   ├── WalletConnect.tsx # Wallet connection component
│   └── AddLiquidity.tsx  # UI for liquidity (admin-only functions)
├── contracts/
│   ├── abis/
│   │   └── SwapPoolABI.ts    # Contract ABI
│   ├── addresses.ts      # Network addresses
│   └── types/           # TypeScript types
├── hooks/
│   └── useContract.ts   # Custom contract interaction hook
└── App.tsx              # Main application component
```

## 🎯 Smart Contract Functions

### Available to Users:
- `swapTokens()` - Execute token swaps
- `getQuote()` - Get swap quotes
- `calculateOutputAmount()` - Calculate output amounts

### Admin Functions (Not in UI):
- `setPool()` - Configure pool parameters
- `setPoolEnabled()` - Enable/disable pools
- `withdrawFees()` - Collect protocol fees

## 🌐 Networks Supported

- **Base Sepolia** (Main testnet) - Chain ID: 84532
- **Localhost** - For development testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is a testnet application for educational purposes. Use at your own risk. Always ensure you understand the smart contract functionality before interacting with it.

## 🆘 Support

If you encounter any issues:

1. Check that you're on Base Sepolia network
2. Ensure the contract has been properly configured with liquidity
3. Verify you have sufficient gas fees for transactions
4. Check console for any error messages

---

**Note**: This interface requires a pre-configured smart contract with existing liquidity. For development purposes, you'll need to deploy and configure the contract separately before using the swap functionality.
