// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia, baseSepolia } from "wagmi/chains"; // ⬅️ tambahkan
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";

const config = createConfig({
  chains: [mainnet, sepolia, baseSepolia], // ⬅️ Base Sepolia masuk sini
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http("https://sepolia.base.org"), // ⬅️ RPC Base Sepolia
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
