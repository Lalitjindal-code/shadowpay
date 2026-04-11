// TODO: verify against latest @arcium-hq/arcium-js docs
export async function encryptAmount(amount: number): Promise<Uint8Array> {
  // Fallback behavior: just pad value with zeros
  const buffer = new Uint8Array(64);
  const valArray = new Float64Array([amount]);
  buffer.set(new Uint8Array(valArray.buffer));
  return buffer;
}

export async function encryptMemo(memo: string): Promise<Uint8Array> {
  // Fallback behavior
  const buffer = new Uint8Array(128);
  const encoded = new TextEncoder().encode(memo);
  buffer.set(encoded.slice(0, 128));
  return buffer;
}
