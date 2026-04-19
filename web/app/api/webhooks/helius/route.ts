import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { TransactionEvent } from "@/lib/db/models/TransactionEvent";

// Verify authorization header from Helius
const verifyAuth = (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");
  return authHeader === process.env.HELIUS_WEBHOOK_SECRET;
};

export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payloads = await req.json();
    await connectDB();

    // Helius sends an array of enhanced transactions
    for (const payload of payloads) {
      // 1. Check if it's our program
      const isShadowPay = payload.instructions?.some(
        (ix: any) => ix.programId === process.env.NEXT_PUBLIC_SHADOWPAY_PROGRAM_ID
      );

      if (!isShadowPay) continue;

      // 2. Map relevant accounts (extract sender and receiver)
      const accounts = payload.accountData.map((acc: any) => acc.account);
      const feePayer = payload.feePayer;

      // 3. Determine actual transaction type based on instructions or log messages
      let txType = "unknown";
      if (payload.type === "TRANSFER") {
        txType = "payment";
      } else if (payload.description?.includes("initialize")) {
        txType = "initialization";
      }

      // 4. Upsert event to MongoDB
      await TransactionEvent.findOneAndUpdate(
        { signature: payload.signature },
        {
          signature: payload.signature,
          type: txType,
          accounts: accounts,
          payer: feePayer,
          timestamp: payload.timestamp ? new Date(payload.timestamp * 1000) : new Date(),
          rawPayload: payload,
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Helius Webhook Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
