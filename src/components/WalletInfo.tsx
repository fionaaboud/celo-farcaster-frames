"use client";

import { useState } from "react";

const supportedWallets = [
  {
    name: "MetaMask",
    description: "Popular browser extension wallet",
    icon: "🦊",
    link: "https://metamask.io/",
  },
  {
    name: "Valora",
    description: "Mobile wallet built for Celo",
    icon: "📱",
    link: "https://valora.xyz/",
  },
  {
    name: "Coinbase Wallet",
    description: "Self-custody wallet by Coinbase",
    icon: "🔵",
    link: "https://www.coinbase.com/wallet",
  },
  {
    name: "WalletConnect",
    description: "Connect any WalletConnect-compatible wallet",
    icon: "🔗",
    link: "https://walletconnect.com/",
  },
];

export default function WalletInfo() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="text-xs text-gray-500 hover:text-gray-700 underline"
      >
        {showInfo ? "Hide" : "Show"} supported wallets
      </button>
      
      {showInfo && (
        <div className="mt-3 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Supported Wallets:</h4>
          <div className="grid grid-cols-1 gap-2">
            {supportedWallets.map((wallet) => (
              <div
                key={wallet.name}
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-lg">{wallet.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{wallet.name}</p>
                  <p className="text-xs text-gray-600">{wallet.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Make sure your wallet is configured for the Celo network
          </p>
        </div>
      )}
    </div>
  );
}
