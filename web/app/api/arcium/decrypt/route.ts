import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { ciphertext, privateKey, type } = 
      await req.json();
    
    const ciphertextBytes = new Uint8Array(
      Buffer.from(ciphertext, 'base64')
    );
    const privateKeyBytes = new Uint8Array(
      Buffer.from(privateKey, 'base64')
    );

    if (type === 'amount') {
      const { decryptAmount } = 
        await import("@/lib/arcium/decrypt");
      const amount = await decryptAmount(
        ciphertextBytes, 
        privateKeyBytes
      );
      return NextResponse.json({ result: amount });
    }

    if (type === 'memo') {
      const { decryptMemo } = 
        await import("@/lib/arcium/decrypt");
      const memo = await decryptMemo(
        ciphertextBytes,
        privateKeyBytes
      );
      return NextResponse.json({ result: memo });
    }

    return NextResponse.json(
      { error: "Invalid type" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
