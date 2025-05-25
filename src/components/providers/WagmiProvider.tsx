"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider, createConfig, http } from "wagmi";
import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { celo, celoAlfajores } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import {
  walletConnectWallet,
  metaMaskWallet,
  coinbaseWallet,
  injectedWallet
} from '@rainbow-me/rainbowkit/wallets';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

if (!projectId) {
  console.warn("⚠️ WalletConnect Project ID is not set. Please add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID to your environment variables.");
}

// Define wallet connectors
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended for Celo',
      wallets: [
        walletConnectWallet,
        metaMaskWallet,
        coinbaseWallet,
        injectedWallet, // This will catch Valora and other injected wallets
      ],
    },
  ],
  {
    appName: "Netsplit - Bill Splitting on Celo",
    projectId,
  }
);

// Create Wagmi config
export const config = createConfig({
  connectors,
  chains: [celo, celoAlfajores],
  transports: {
    [celo.id]: http(),
    [celoAlfajores.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={celo}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
