"use client";

import dynamic from "next/dynamic";

const WagmiProvider = dynamic(
  () => import("@/components/providers/WagmiProvider"),
  {
    ssr: false,
  }
);

const DivviProvider = dynamic(
  () => import("@/components/providers/DivviProvider"),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <DivviProvider>
        {children}
      </DivviProvider>
    </WagmiProvider>
  );
}
