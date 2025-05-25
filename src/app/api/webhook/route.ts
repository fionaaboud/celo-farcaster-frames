import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle webhook events from Farcaster
    console.log("Webhook received:", body);
    
    // You can add specific webhook handling logic here
    // For example, handling frame interactions, user actions, etc.
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Netsplit webhook endpoint" });
}
