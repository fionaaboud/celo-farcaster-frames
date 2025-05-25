import { Metadata } from "next";
import Link from "next/link";

const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

// Main frame metadata for Farcaster
const frame = {
  version: "next",
  imageUrl: `${appUrl}/netsplit-preview.png`,
  button: {
    title: "Split Bills on Celo",
    action: {
      type: "launch_frame",
      name: "Netsplit",
      url: `${appUrl}/netsplit-frame`,
      splashImageUrl: `${appUrl}/netsplit-splash.png`,
      splashBackgroundColor: "#35D07F",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Netsplit - Split Bills with Any Wallet on Celo",
    description: "Split bills with friends using MetaMask, Valora, or any wallet. Built on Celo for fast, low-cost transactions.",
    openGraph: {
      title: "Netsplit - Split Bills with Any Wallet on Celo",
      description: "Split bills with friends using MetaMask, Valora, or any wallet. Built on Celo for fast, low-cost transactions.",
      images: [`${appUrl}/netsplit-preview.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: "Netsplit - Split Bills with Any Wallet on Celo",
      description: "Split bills with friends using MetaMask, Valora, or any wallet. Built on Celo for fast, low-cost transactions.",
      images: [`${appUrl}/netsplit-preview.png`],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Netsplit</h1>
        <p className="text-gray-600 mb-6">
          Split bills with friends using any wallet on Celo blockchain
        </p>
        <Link
          href="/netsplit-frame"
          className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
        >
          Open Netsplit Frame
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          Supports MetaMask, Valora, Coinbase Wallet & more
        </p>
      </div>
    </div>
  );
}
