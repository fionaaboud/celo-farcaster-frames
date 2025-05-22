import { Metadata } from "next";
import NetsplitApp from "./NetsplitApp";

const appUrl = process.env.NEXT_PUBLIC_URL;

// Bill Split Frame metadata for Farcaster
const frame = {
  version: "next",
  imageUrl: `${appUrl}/netsplit-frame.png`, // Placeholder image, update as needed
  button: {
    title: "Split a Bill",
    action: {
      type: "launch_frame",
      name: "Split a Bill",
      url: `${appUrl}/netsplit-frame`,
      splashImageUrl: `${appUrl}/netsplit-splash.png`, // Placeholder splash image
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Netsplit Bill Splitter",
    openGraph: {
      title: "Netsplit Bill Splitter",
      description: "Split bills with friends using WalletConnect on Farcaster!",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function NetsplitFrame() {
  return <NetsplitApp />;
}
