import { Metadata } from "next";
import NetsplitApp from "./NetsplitApp";

const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

// Bill Split Frame metadata for Farcaster
const frame = {
  version: "next",
  imageUrl: `${appUrl}/netsplit-frame.png`,
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
    title: "Netsplit - Split Bills on Celo",
    description: "Split bills with friends using MetaMask, Valora, or any wallet on Celo blockchain",
    openGraph: {
      title: "Netsplit - Split Bills on Celo",
      description: "Split bills with friends using MetaMask, Valora, or any wallet on Celo blockchain",
      images: [`${appUrl}/netsplit-preview.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: "Netsplit - Split Bills on Celo",
      description: "Split bills with friends using MetaMask, Valora, or any wallet on Celo blockchain",
      images: [`${appUrl}/netsplit-preview.png`],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function NetsplitFrame() {
  return <NetsplitApp />;
}