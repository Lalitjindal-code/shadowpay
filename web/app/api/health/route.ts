import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import mongoose from "mongoose";

export async function GET() {
  const status: Record<string, any> = {
    timestamp: new Date().toISOString(),
    services: {},
  };

  // 1. MongoDB
  try {
    await connectDB();
    const state = mongoose.connection.readyState;
    // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    status.services.mongodb = {
      status: state === 1 ? "connected" : "error",
      readyState: state,
      host: mongoose.connection.host,
      db: mongoose.connection.db?.databaseName,
    };
  } catch (err: any) {
    status.services.mongodb = { status: "error", error: err.message };
  }

  // 2. Firebase config check
  const firebaseKeys = {
    apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "FILL_THIS",
    authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN !== "FILL_THIS",
    dbUrl: !!process.env.NEXT_PUBLIC_FIREBASE_DB_URL && process.env.NEXT_PUBLIC_FIREBASE_DB_URL !== "FILL_THIS",
    projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "FILL_THIS",
  };
  const firebaseReady = Object.values(firebaseKeys).every(Boolean);
  status.services.firebase = {
    status: firebaseReady ? "configured" : "missing_keys",
    keys: firebaseKeys,
  };

  // 3. Privy
  const privyId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const privyReady = !!privyId && privyId !== "FILL_THIS" && privyId.length > 10;
  status.services.privy = {
    status: privyReady ? "configured" : "missing_key",
    appId: privyReady ? privyId!.slice(0, 8) + "..." : "NOT_SET",
  };

  // 4. Helius / Solana RPC
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  const heliusKey = process.env.HELIUS_API_KEY;
  try {
    if (rpcUrl && !rpcUrl.includes("FILL")) {
      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getHealth",
        }),
      });
      const data = await res.json();
      status.services.solana_rpc = {
        status: data.result === "ok" ? "healthy" : "degraded",
        result: data.result,
        network: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
      };
    } else {
      status.services.solana_rpc = { status: "not_configured" };
    }
  } catch (err: any) {
    status.services.solana_rpc = { status: "error", error: err.message };
  }

  // 5. World ID
  const worldAppId = process.env.NEXT_PUBLIC_WORLD_APP_ID;
  status.services.world_id = {
    status: worldAppId && worldAppId !== "FILL_THIS" ? "configured" : "missing_key",
    action: process.env.WORLD_ID_ACTION || "not_set",
  };

  // 6. Program ID
  const programId = process.env.NEXT_PUBLIC_SHADOWPAY_PROGRAM_ID;
  status.services.anchor_program = {
    status: programId && !programId.includes("FILL") ? "set" : "not_deployed",
    programId: programId || "NOT_SET",
  };

  // Overall
  const allOk = Object.values(status.services).every(
    (s: any) => s.status === "connected" || s.status === "configured" || s.status === "healthy" || s.status === "set"
  );
  status.overall = allOk ? "ALL_SYSTEMS_GO" : "PARTIAL";

  return NextResponse.json(status, { status: allOk ? 200 : 207 });
}
