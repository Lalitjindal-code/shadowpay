// TODO: verify against latest @arcium-hq/arcium-js docs
export async function decryptAmount(ciphertext: Uint8Array): Promise<number> {
  // Fallback behavior
  const valArray = new Float64Array(ciphertext.slice(0, 8).buffer);
  return valArray[0] || 0;
}

export async function decryptMemo(ciphertext: Uint8Array): Promise<string> {
  // Fallback behavior
  // remove trailing null characters
  let end = ciphertext.indexOf(0);
  if (end === -1) end = ciphertext.length;
  return new TextDecoder().decode(ciphertext.slice(0, end));
}
