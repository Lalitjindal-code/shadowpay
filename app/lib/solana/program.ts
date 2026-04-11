import { Program, Idl } from "@coral-xyz/anchor";
import { IDL, ShadowPay } from "./idl";

// @ts-expect-error Native Anchor bypass
export function getShadowPayProgram(provider: any): Program<ShadowPay> {
  return new Program(IDL as any, provider) as any;
}
