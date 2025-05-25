export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  
  // The .well-known/farcaster.json route is used to provide the configuration for the Frame.
  // You need to generate the accountAssociation payload and signature using this link:
  // https://warpcast.com/~/developers/frames

  const config = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
    },
    frame: {
      version: "1",
      name: "Netsplit Bill Splitter",
      iconUrl: `${appUrl}/netsplit-frame.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/netsplit-preview.png`,
      buttonTitle: "Split Bills on Celo",
      splashImageUrl: `${appUrl}/netsplit-splash.png`,
      splashBackgroundColor: "#35D07F",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
