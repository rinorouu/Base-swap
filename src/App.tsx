// App.tsx
import { useState } from "react";
import Swap from "./components/Swap";
import Pool from "./components/Pool";
import WalletConnect from "./components/WalletConnet";

function App() {
  const [activeTab, setActiveTab] = useState<"swap" | "pool">("swap");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header dengan wallet connect */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">BASE Swap</h1>
          <WalletConnect />
        </div>

        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 py-4 font-semibold ${
              activeTab === "swap" ? "bg-gray-700" : "hover:bg-gray-750"
            }`}
            onClick={() => setActiveTab("swap")}>
            SWAP
          </button>
          <button
            className={`flex-1 py-4 font-semibold ${
              activeTab === "pool" ? "bg-gray-700" : "hover:bg-gray-750"
            }`}
            onClick={() => setActiveTab("pool")}>
            POOL
          </button>
        </div>

        <div className="p-5">{activeTab === "swap" ? <Swap /> : <Pool />}</div>
      </div>
    </div>
  );
}

export default App;
