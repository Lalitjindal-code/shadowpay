import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { amount, memo, recipientArciumPubkey } = 
      await req.json();
    
    // Arcium runs HERE — server side only
    // Node.js modules available here
    const { encryptAmount, encryptMemo } = 
      await import("@/lib/arcium/encrypt");
    
    const encryptedAmount = await encryptAmount(
      BigInt(amount),
      new Uint8Array(Buffer.from(recipientArciumPubkey, 'base64'))
    );
    
    const encryptedMemo = memo ? await encryptMemo(
      memo,
      new Uint8Array(Buffer.from(recipientArciumPubkey, 'base64'))
    ) : new Uint8Array(128);

    return NextResponse.json({
      encryptedAmount: Buffer.from(encryptedAmount).toString('base64'),
      encryptedMemo: Buffer.from(encryptedMemo).toString('base64'),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
