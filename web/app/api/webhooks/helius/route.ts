import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { TransactionEvent } from "@/lib/db/models/TransactionEvent";
import { notifyPaymentEvent } from "@/lib/realtime/firebase";

const WEBHOOK_SECRET = process.env.HELIUS_WEBHOOK_SECRET;
const PROGRAM_ID = process.env.NEXT_PUBLIC_SHADOWPAY_PROGRAM_ID;

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authorization
    const authHeader = request.headers.get("authorization");
    if (WEBHOOK_SECRET && authHeader !== WEBHOOK_SECRET) {
      console.warn("[Helius Webhook] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const transactions = Array.isArray(body) ? body : [body];

    await connectDB();

    let processed = 0;

    for (const tx of transactions) {
      // 2. Filter for ShadowPay program interactions
      const involvesShadowPay =
        PROGRAM_ID &&
        tx.accountData?.some((a: any) => a.account === PROGRAM_ID);

      if (!involvesShadowPay && PROGRAM_ID) {
        continue;
      }

      // 3. Store transaction event in MongoDB
      try {
        await TransactionEvent.findOneAndUpdate(
          { signature: tx.signature },
          {
            signature: tx.signature,
            slot: tx.slot,
            timestamp: tx.timestamp,
            accounts: tx.accountData?.map((a: any) => a.account) || [],
            type: tx.type || "unknown",
            raw: tx,
          },
          { upsert: true, new: true }
        );
        processed++;

        // 4. Notify relevant wallets via Firebase Realtime
        const involvedWallets = [
          tx.feePayer,
          ...(tx.nativeTransfers?.map((t: any) => t.toUserAccount) || []),
          ...(tx.tokenTransfers?.map((t: any) => t.toUserAccount) || []),
        ].filter(Boolean);

        for (const wallet of new Set(involvedWallets)) {
          await notifyPaymentEvent(wallet, {
            signature: tx.signature,
            type: tx.type,
            slot: tx.slot,
          });
        }
      } catch (dbErr: any) {
        // Skip duplicates silently
        if (dbErr.code !== 11000) {
          console.error("[Helius Webhook] DB error:", dbErr.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      total: transactions.length,
    });
  } catch (error: any) {
    console.error("[Helius Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
