import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/db/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merkle_root, nullifier_hash, proof, verification_level } = body;

    if (!nullifier_hash || !proof) {
      return NextResponse.json(
        { error: "Missing required World ID proof fields" },
        { status: 400 }
      );
    }

    // In production: verify the proof with World ID cloud API
    // POST https://developer.worldcoin.org/api/v2/verify/{app_id}
    const worldAppId = process.env.NEXT_PUBLIC_WORLD_APP_ID;
    const action = process.env.WORLD_ID_ACTION || "shadowpay-verify";

    if (worldAppId && worldAppId !== "FILL_THIS") {
      const verifyRes = await fetch(
        `https://developer.worldcoin.org/api/v2/verify/${worldAppId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merkle_root,
            nullifier_hash,
            proof,
            action,
          }),
        }
      );

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        console.error("[WorldID] Verification failed:", errData);
        return NextResponse.json(
          { success: false, error: "World ID verification failed" },
          { status: 400 }
        );
      }
    } else {
      console.warn("[WorldID] App ID not configured — skipping cloud verification (dev mode)");
    }

    // Mark user as verified in MongoDB if walletAddress provided
    if (body.walletAddress) {
      await connectDB();
      await User.findOneAndUpdate(
        { walletAddress: body.walletAddress },
        {
          worldIdVerified: true,
          worldIdNullifier: nullifier_hash,
        }
      );
    }

    return NextResponse.json({ success: true, nullifier_hash });
  } catch (error: any) {
    console.error("[WorldID Verify]", error);
    return NextResponse.json(
      { error: "Verification failed", details: error.message },
      { status: 500 }
    );
  }
}
