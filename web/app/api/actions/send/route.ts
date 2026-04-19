import { NextRequest, NextResponse } from "next/server";
import { PublicKey, Transaction } from "@solana/web3.js";
import { createShadowPayInstruction } from "@/lib/solana/program";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "X-Action-Version": "1",
  "X-Blockchain-Ids": "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", // mainnet
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: CORS_HEADERS });
}

export async function GET() {
  const payload = {
    icon: "https://raw.githubusercontent.com/Lalitjindal-code/shadowpay/main/web/public/window.svg", // Placeholder icon
    label: "Send Privately",
    title: "ShadowPay — Private Payments on Solana",
    description:
      "Send USDC privately. Transaction amounts and memos are encrypted by Arcium — " +
      "only the recipient can decrypt them.",
    links: {
      actions: [
        {
          label: "Send Private Payment",
          href: "/api/actions/send?recipient={recipient}&amount={amount}",
          parameters: [
            {
              name: "recipient",
              label: "Recipient wallet address or @username",
              required: true,
            },
            {
              name: "amount",
              label: "Amount (USDC)",
              required: true,
            },
          ],
        },
      ],
    },
  };

  return NextResponse.json(payload, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const recipient = searchParams.get("recipient");
  const amount = parseFloat(searchParams.get("amount") ?? "0");

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const senderAddress = body?.account;

  if (!recipient || !amount || !senderAddress) {
    return NextResponse.json(
      { error: "Missing required parameters (recipient, amount, or account)" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const transaction = await createShadowPayInstruction({
      sender: new PublicKey(senderAddress),
      recipient: new PublicKey(recipient),
      amount,
    });

    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return NextResponse.json(
      {
        transaction: Buffer.from(serialized).toString("base64"),
        message: `Sending $${amount} USDC privately to ${recipient.slice(0, 8)}...`,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[Action POST Error]", error);
    return NextResponse.json(
      { error: "Failed to create transaction: " + error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
