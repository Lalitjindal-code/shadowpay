export enum ShadowPayErrorType {
  // User-facing (show toast)
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  RECIPIENT_NOT_FOUND = "RECIPIENT_NOT_FOUND",
  WORLD_ID_REQUIRED = "WORLD_ID_REQUIRED",
  AMOUNT_TOO_LOW = "AMOUNT_TOO_LOW",
  
  // Recoverable (retry)
  RPC_TIMEOUT = "RPC_TIMEOUT",
  NETWORK_ERROR = "NETWORK_ERROR",
  
  // Fatal (show error page)
  PROGRAM_NOT_DEPLOYED = "PROGRAM_NOT_DEPLOYED",
  ARCIUM_UNAVAILABLE = "ARCIUM_UNAVAILABLE",
}

export const ERROR_MESSAGES: Record<ShadowPayErrorType, string> = {
  [ShadowPayErrorType.INSUFFICIENT_BALANCE]: "You don't have enough USDC. Add funds to continue.",
  [ShadowPayErrorType.RECIPIENT_NOT_FOUND]: "This user isn't on ShadowPay yet. Invite them!",
  [ShadowPayErrorType.WORLD_ID_REQUIRED]: "You need to verify your identity to send payments.",
  [ShadowPayErrorType.AMOUNT_TOO_LOW]: "Minimum payment is $0.01 USDC.",
  [ShadowPayErrorType.RPC_TIMEOUT]: "Network is slow. Your transaction will retry automatically.",
  [ShadowPayErrorType.NETWORK_ERROR]: "Connection lost. Check your internet and try again.",
  [ShadowPayErrorType.PROGRAM_NOT_DEPLOYED]: "ShadowPay is under maintenance. Try again soon.",
  [ShadowPayErrorType.ARCIUM_UNAVAILABLE]: "Privacy service is temporarily unavailable. Using fallback encryption.",
};
