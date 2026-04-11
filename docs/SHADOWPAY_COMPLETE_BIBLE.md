# SHADOWPAY — COMPLETE BIBLE v2.0
### Colosseum Frontier Hackathon · April 6 – May 11, 2026
### Includes: Phase 3 Remaining · Phase 4 Deep · TRD · Full Dashboard Reference
### Feed this entire file into Antigravity at session start

---

## TABLE OF CONTENTS

1. [Project Identity & One-Liner](#1-project-identity)
2. [Architecture Overview](#2-architecture-overview)
3. [Phase 3 — Remaining Parts](#3-phase-3-remaining)
   - 3A. Codex Prompt Templates
   - 3B. All React Components (Full Code)
   - 3C. All Custom Hooks (Full Code)
   - 3D. Zustand Store
   - 3E. Supabase Realtime Integration
   - 3F. Solana Actions / Blinks API
4. [Phase 4 — Deep Sponsor Integrations](#4-phase-4-deep-integrations)
   - 4A. Arcium MXE — Deep Integration
   - 4B. World ID — Deep Integration
   - 4C. MoonPay — Deep Integration
   - 4D. Squads Multisig — Deep Integration
   - 4E. Helius Webhooks — Deep Integration
   - 4F. Privy — Deep Integration
5. [TRD — Technical Reference Document](#5-trd)
   - 5A. System Design
   - 5B. Data Flow Diagrams
   - 5C. Security Model
   - 5D. API Reference
   - 5E. Error Handling Strategy
   - 5F. Testing Strategy
6. [Dashboard — Full Reference](#6-dashboard-reference)
   - 6A. 5-Week Sprint (Day-by-Day)
   - 6B. Winning Edge Matrix
   - 6C. Judge Alignment Map
   - 6D. Side Track Prize Map
   - 6E. Demo Video Script
7. [Antigravity Context Block](#7-antigravity-context)

---

## 1. PROJECT IDENTITY

```
Name        : ShadowPay
Tagline     : Private-by-default P2P payments on Solana
Chain       : Solana (Devnet → Mainnet)
Framework   : Anchor v0.30+ (Rust) + Next.js 14 (TypeScript)
Category    : Payments + Privacy + Identity
One-liner   : "Venmo with Arcium encryption + World ID — nobody sees your balance,
               nobody can bot you."
```

**Prize Targets:**
- Grand Champion ($30K)
- Public Goods Award ($10K)
- University Award ($10K) ← SATI Vidisha = eligible
- Standout Team Pool (20 × $10K)
- Accelerator Pre-seed ($250K) ← real target

**Sponsor Side Tracks:** Arcium · World · MoonPay · Privy · Helius · Squads

---

## 2. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│   Next.js 14 · TypeScript · Tailwind · shadcn/ui            │
│   Privy (auth + embedded wallet) · Framer Motion            │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │    PRIVACY + IDENTITY   │
          │  Arcium MXE (encrypt)   │
          │  World ID (sybil guard) │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │    SOLANA PROGRAM       │
          │  Anchor v0.30+          │
          │  SPL Token (USDC)       │
          │  PDAs: UserProfile      │
          │        PaymentRecord    │
          │        PaymentRequest   │
          └────────────┬────────────┘
                       │
     ┌─────────────────▼──────────────────┐
     │           INFRASTRUCTURE           │
     │  Helius RPC + Webhooks             │
     │  Supabase Postgres + Realtime      │
     │  MoonPay fiat onramp               │
     │  Vercel deployment                 │
     └────────────────────────────────────┘
```

**Privacy Model Summary:**

| Data | On-Chain State | Who Can See |
|---|---|---|
| Transaction occurred | ✓ Public | Everyone |
| Sender address | ✓ Public | Everyone |
| Recipient address | ✓ Public | Everyone |
| Amount | 🔒 Encrypted ciphertext | Only recipient (decrypts with private key) |
| Memo / note | 🔒 Encrypted ciphertext | Only recipient |
| Balance | 🔒 Encrypted ciphertext | Only owner |
| Timestamp | ✓ Public | Everyone |

---

## 3. PHASE 3 — REMAINING PARTS

### 3A. CODEX PROMPT TEMPLATES

Ye prompts directly Codex mein paste karo. Copy-paste ready hain.

---

**PROMPT 1 — Generate UserProfile PDA fetch + decrypt hook**
```
You are working on ShadowPay, a Solana payments app using Anchor v0.30+, 
Next.js 14, TypeScript, and the @arcium-hq/arcium-js SDK.

Generate a complete React hook called `useBalance` that:
1. Takes `walletAddress: PublicKey` as parameter
2. Derives the UserProfile PDA using seeds ["user_profile", walletAddress]
3. Fetches the UserProfile account using @coral-xyz/anchor program.account.userProfile.fetch()
4. Calls decryptBalance(profile.encryptedBalance, userPrivateKey) from lib/arcium/decrypt.ts
5. Returns { balance: number | null, isLoading: boolean, error: Error | null, refetch: () => void }
6. Uses React Query's useQuery internally
7. Handles the case where account doesn't exist (returns balance: 0)

File path: hooks/useBalance.ts
Imports needed: @coral-xyz/anchor, @solana/web3.js, react-query, lib/arcium/decrypt, lib/solana/program
```

---

**PROMPT 2 — Generate SendPayment mutation hook**
```
You are working on ShadowPay. Generate a complete React mutation hook called 
`useSendPayment` that:

1. Takes params: { recipientAddress: PublicKey, amount: number, memo: string }
2. Flow:
   a. Fetch recipient's UserProfile to get their arcium_pubkey
   b. Call encryptAmount(amount, recipientArciumPubkey) from lib/arcium/encrypt.ts
   c. Call encryptMemo(memo, recipientArciumPubkey) from lib/arcium/encrypt.ts
   d. Build Anchor instruction: program.methods.sendPayment(
        senderProfile.paymentCount,  // payment_index
        encryptedAmount,             // [u8; 64]
        encryptedMemo,               // [u8; 128]
        amount * 1_000_000           // plaintext lamports for SPL transfer
      )
   e. Add all required accounts: senderProfile, recipientProfile, paymentRecord, 
      senderTokenAccount, recipientTokenAccount, tokenMint, sender, 
      tokenProgram, associatedTokenProgram, systemProgram
   f. Send and confirm transaction via connection.sendRawTransaction
   g. Return { mutate, isLoading, isSuccess, isError, error }

3. Uses useMutation from react-query
4. On success: invalidate useBalance and usePayments queries
5. USDC mint address: use constants.ts USDC_MINT

File path: hooks/useSendPayment.ts
```

---

**PROMPT 3 — Generate BalanceDisplay component**
```
Generate a React component called BalanceDisplay for ShadowPay.

Requirements:
- Shows user's USDC balance
- Default state: balance hidden, shows "$ ••••••" 
- Toggle button (eye icon) to reveal/hide balance
- When revealed: decrypt and show actual amount e.g. "$ 142.50"
- Loading skeleton while fetching
- Smooth animation on reveal (fade in)
- Uses useBalance hook
- Uses Framer Motion for animation
- Tailwind CSS styling — dark theme (#0a0a0f background)
- Shows "Verified Human" badge if user.isVerified === true (World ID)

Props: { walletAddress: PublicKey }
File path: components/payments/BalanceDisplay.tsx
```

---

**PROMPT 4 — Generate SendForm component**
```
Generate a complete SendForm React component for ShadowPay.

Requirements:
1. Recipient input field:
   - Search by @username (queries Supabase users table)
   - OR paste wallet address directly
   - Show avatar + username in dropdown results
   - Debounced search (300ms)

2. Amount input:
   - Number input for USDC amount
   - Real-time USD display below
   - Max button (fills current balance)
   - Minimum: $0.01

3. Memo input:
   - Optional text field, max 64 characters
   - Character counter
   - Placeholder: "What's this for? (private)"

4. Submit button:
   - Shows "Send $X.XX to @username"
   - Loading state during transaction
   - Disabled if: no recipient, amount=0, insufficient balance

5. On submit: calls useSendPayment().mutate()
6. Success state: confetti animation + "Payment sent privately ✓"
7. Error state: user-friendly error message

File path: components/payments/SendForm.tsx
Dependencies: useSendPayment, useBalance, useContacts, shadcn/ui Input+Button
```

---

**PROMPT 5 — Generate Anchor program IDL types**
```
Based on this Anchor program structure for ShadowPay, generate the complete
TypeScript IDL type file.

Program name: shadowpay
Accounts:
  - UserProfile { owner: PublicKey, worldIdNullifier: number[], arciumPubkey: number[], 
    usernameHash: number[], encryptedBalance: number[], paymentCount: BN, 
    receiveCount: BN, isVerified: boolean, createdAt: BN, bump: number }
  - PaymentRecord { sender: PublicKey, recipient: PublicKey, encryptedAmount: number[], 
    encryptedMemo: number[], tokenMint: PublicKey, timestamp: BN, 
    paymentIndex: BN, bump: number }

Instructions:
  - initializeUser(worldIdNullifier: number[], arciumPubkey: number[], usernameHash: number[])
  - sendPayment(paymentIndex: BN, encryptedAmount: number[], encryptedMemo: number[], plaintextAmount: BN)
  - requestPayment(requestId: number[], encryptedAmount: number[], encryptedMemo: number[], expiresAt: BN)

Generate: lib/solana/idl.ts with full IDL object and ShadowPayIDL type export
Also generate: lib/solana/program.ts that creates the Anchor Program instance
```

---

**PROMPT 6 — Generate Helius webhook handler**
```
Generate a Next.js 14 App Router API route for Helius webhooks for ShadowPay.

File: app/api/webhooks/helius/route.ts

Requirements:
1. POST handler only
2. Verify Authorization header matches HELIUS_WEBHOOK_SECRET env var
3. Parse Helius enhanced transaction webhook payload
4. Filter for transactions involving SHADOWPAY_PROGRAM_ID
5. For each relevant transaction:
   a. Extract: signature, slot, timestamp, accounts involved, instruction type
   b. Determine if it's: initializeUser | sendPayment | requestPayment
   c. Insert into Supabase transaction_events table
   d. Trigger Supabase Realtime notification
6. Return 200 on success, 401 on auth failure, 500 on error
7. Include proper TypeScript types for Helius webhook payload

Helius webhook payload type reference:
type HeliusWebhookPayload = {
  accountData: { account: string; nativeBalanceChange: number }[]
  description: string
  events: { nft?: any; swap?: any }
  fee: number
  feePayer: string
  instructions: { accounts: string[]; data: string; programId: string }[]
  nativeTransfers: { amount: number; fromUserAccount: string; toUserAccount: string }[]
  signature: string
  slot: number
  timestamp: number
  tokenTransfers: { fromUserAccount: string; mint: string; toUserAccount: string; tokenAmount: number }[]
  type: string
}
```

---

**PROMPT 7 — Generate Solana Actions / Blinks endpoint**
```
Generate a Solana Actions API endpoint for ShadowPay payments.

Files needed:
1. app/api/actions/send/route.ts — GET + POST handlers
2. app/api/actions/send/[username]/route.ts — Dynamic route for user-specific links

GET /api/actions/send:
  Returns ActionGetResponse:
  {
    icon: "https://shadowpay.app/icon.png",
    label: "Send with ShadowPay",
    title: "ShadowPay — Private Payments",
    description: "Send USDC privately. Amount encrypted by Arcium.",
    links: {
      actions: [{
        label: "Send Payment",
        href: "/api/actions/send?recipient={recipient}&amount={amount}",
        parameters: [
          { name: "recipient", label: "Recipient address or @username", required: true },
          { name: "amount", label: "Amount (USDC)", required: true }
        ]
      }]
    }
  }

POST /api/actions/send?recipient=X&amount=Y:
  1. Validate recipient exists (check Supabase or on-chain UserProfile)
  2. Build the sendPayment transaction (serialized, base64)
  3. Return ActionPostResponse: { transaction: base64EncodedTx, message: "Payment ready" }

Include proper CORS headers:
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type

File: app/api/actions/send/route.ts
```

---

### 3B. ALL REACT COMPONENTS — FULL CODE

#### `components/payments/PaymentCard.tsx`
```tsx
"use client";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, Lock } from "lucide-react";

interface PaymentCardProps {
  type: "sent" | "received";
  counterpartyUsername: string;
  counterpartyAvatar?: string;
  encryptedAmount: Uint8Array;
  decryptedAmount?: number; // undefined = still encrypted/loading
  memo?: string; // decrypted memo, undefined = hidden
  timestamp: number;
  signature: string;
  isRevealed: boolean;
  onReveal: () => void;
}

export function PaymentCard({
  type,
  counterpartyUsername,
  counterpartyAvatar,
  decryptedAmount,
  memo,
  timestamp,
  signature,
  isRevealed,
  onReveal,
}: PaymentCardProps) {
  const isSent = type === "sent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 rounded-xl border border-white/5 
                 bg-white/2 hover:bg-white/5 transition-colors cursor-default"
    >
      {/* Left: icon + counterparty */}
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm
          ${isSent ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
          {isSent ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {isSent ? "Sent to" : "Received from"}{" "}
            <span className="text-purple-400">@{counterpartyUsername}</span>
          </p>
          <p className="text-xs text-white/30 mt-0.5">
            {formatDistanceToNow(timestamp * 1000, { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Right: amount + memo */}
      <div className="flex items-center gap-2 text-right">
        <div>
          {isRevealed && decryptedAmount !== undefined ? (
            <motion.p
              initial={{ filter: "blur(4px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              className={`text-sm font-mono font-semibold
                ${isSent ? "text-red-400" : "text-green-400"}`}
            >
              {isSent ? "-" : "+"}${decryptedAmount.toFixed(2)}
            </motion.p>
          ) : (
            <button
              onClick={onReveal}
              className="flex items-center gap-1 text-xs text-white/30 
                         hover:text-white/60 transition-colors font-mono"
            >
              <Lock size={10} />
              <span>$•••••</span>
            </button>
          )}
          {isRevealed && memo && (
            <p className="text-xs text-white/40 mt-0.5 max-w-[120px] truncate">
              {memo}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
```

---

#### `components/identity/WorldIDButton.tsx`
```tsx
"use client";
import { IDKitWidget, VerificationLevel, ISuccessResult } from "@worldcoin/idkit";
import { CheckCircle, Globe } from "lucide-react";
import { useState } from "react";

interface Props {
  onVerified: (nullifierHash: string, proof: ISuccessResult) => void;
  isVerified?: boolean;
}

export function WorldIDButton({ onVerified, isVerified = false }: Props) {
  const [verifying, setVerifying] = useState(false);

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full 
                      bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
        <CheckCircle size={14} />
        <span>Verified Human</span>
      </div>
    );
  }

  const handleVerify = async (proof: ISuccessResult) => {
    setVerifying(true);
    try {
      // Server-side verification
      const res = await fetch("/api/worldid/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proof),
      });
      const data = await res.json();
      if (data.success) {
        onVerified(proof.nullifier_hash, proof);
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <IDKitWidget
      app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`}
      action="shadowpay-verify"
      verification_level={VerificationLevel.Device}
      onSuccess={handleVerify}
    >
      {({ open }) => (
        <button
          onClick={open}
          disabled={verifying}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-white/5 border border-white/10 text-white/70 text-sm
                     hover:bg-white/10 hover:text-white transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Globe size={16} />
          {verifying ? "Verifying..." : "Verify with World ID"}
        </button>
      )}
    </IDKitWidget>
  );
}
```

---

#### `components/payments/QRScanner.tsx`
```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { X } from "lucide-react";

interface Props {
  onScan: (address: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    
    reader.decodeFromVideoDevice(null, videoRef.current!, (result, err) => {
      if (result) {
        const text = result.getText();
        // Extract Solana address from result (handle both raw address and solana: URI)
        const address = text.startsWith("solana:") ? text.replace("solana:", "").split("?")[0] : text;
        onScan(address);
        reader.reset();
      }
      if (err && !(err.name === "NotFoundException")) {
        setError("Camera access denied");
      }
    }).catch(() => setError("Could not access camera"));

    return () => reader.reset();
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="relative w-full max-w-sm mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/50 hover:text-white"
        >
          <X size={24} />
        </button>
        <div className="relative rounded-2xl overflow-hidden aspect-square bg-black">
          <video ref={videoRef} className="w-full h-full object-cover" />
          {/* Scan overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-purple-400 rounded-xl
                            shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
        {error && (
          <p className="text-red-400 text-sm text-center mt-4">{error}</p>
        )}
        <p className="text-white/40 text-xs text-center mt-4">
          Point camera at a Solana address QR code
        </p>
      </div>
    </div>
  );
}
```

---

#### `components/onramp/MoonPayWidget.tsx`
```tsx
"use client";
import { useState } from "react";
import { X, CreditCard } from "lucide-react";

interface Props {
  walletAddress: string;
  onComplete?: () => void;
  onClose: () => void;
}

export function MoonPayWidget({ walletAddress, onComplete, onClose }: Props) {
  const [loaded, setLoaded] = useState(false);

  const moonpayUrl = new URL("https://buy.moonpay.com");
  moonpayUrl.searchParams.set("apiKey", process.env.NEXT_PUBLIC_MOONPAY_KEY!);
  moonpayUrl.searchParams.set("currencyCode", "usdc_sol");
  moonpayUrl.searchParams.set("walletAddress", walletAddress);
  moonpayUrl.searchParams.set("colorCode", "%237c3aed");
  moonpayUrl.searchParams.set("theme", "dark");

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "moonpay_transaction_completed") {
        onComplete?.();
        onClose();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onComplete, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111118] rounded-2xl overflow-hidden 
                      border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <CreditCard size={14} />
            <span>Add funds via MoonPay</span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X size={18} />
          </button>
        </div>
        
        {/* Iframe */}
        <div className="relative">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center h-[500px]">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent 
                              rounded-full animate-spin" />
            </div>
          )}
          <iframe
            src={moonpayUrl.toString()}
            width="100%"
            height="500px"
            frameBorder="0"
            allow="accelerometer; autoplay; camera; gyroscope; payment"
            onLoad={() => setLoaded(true)}
            className={loaded ? "opacity-100" : "opacity-0"}
          />
        </div>
      </div>
    </div>
  );
}
```

---

### 3C. ALL CUSTOM HOOKS — FULL CODE

#### `hooks/useBalance.ts`
```typescript
import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import { useAnchorProgram } from "./useAnchorProgram";
import { getUserProfilePDA } from "@/lib/solana/pdas";
import { decryptBalance } from "@/lib/arcium/decrypt";
import { usePrivy } from "@privy-io/react-auth";

export function useBalance(walletAddress?: PublicKey) {
  const program = useAnchorProgram();
  const { user } = usePrivy();

  return useQuery({
    queryKey: ["balance", walletAddress?.toString()],
    queryFn: async () => {
      if (!walletAddress || !program) return 0;

      const [profilePDA] = getUserProfilePDA(walletAddress);

      try {
        const profile = await program.account.userProfile.fetch(profilePDA);
        // Decrypt balance using user's private key from Privy embedded wallet
        const userPrivateKey = await getUserPrivateKey(user);
        const balance = await decryptBalance(
          new Uint8Array(profile.encryptedBalance),
          userPrivateKey
        );
        return balance;
      } catch (e) {
        // Account doesn't exist yet
        return 0;
      }
    },
    enabled: !!walletAddress && !!program,
    refetchInterval: 30_000, // refetch every 30s
    staleTime: 10_000,
  });
}

async function getUserPrivateKey(user: any): Promise<Uint8Array> {
  // Get private key from Privy embedded wallet for decryption
  // In production: use Privy's exportWallet or store encrypted key
  // For MVP: derive from user's wallet signature
  throw new Error("TODO: implement getUserPrivateKey with Privy");
}
```

---

#### `hooks/usePayments.ts`
```typescript
import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import { useAnchorProgram } from "./useAnchorProgram";
import { decryptAmount, decryptMemo } from "@/lib/arcium/decrypt";

export interface Payment {
  signature: string;
  type: "sent" | "received";
  counterparty: PublicKey;
  encryptedAmount: Uint8Array;
  encryptedMemo: Uint8Array;
  decryptedAmount?: number;
  decryptedMemo?: string;
  timestamp: number;
  paymentIndex: number;
}

export function usePayments(walletAddress?: PublicKey) {
  const program = useAnchorProgram();

  return useQuery({
    queryKey: ["payments", walletAddress?.toString()],
    queryFn: async (): Promise<Payment[]> => {
      if (!walletAddress || !program) return [];

      // Fetch all PaymentRecord accounts where sender = walletAddress
      const sentPayments = await program.account.paymentRecord.all([
        { memcmp: { offset: 8, bytes: walletAddress.toBase58() } }
      ]);

      // Fetch all PaymentRecord accounts where recipient = walletAddress
      const receivedPayments = await program.account.paymentRecord.all([
        { memcmp: { offset: 8 + 32, bytes: walletAddress.toBase58() } }
      ]);

      const sent: Payment[] = sentPayments.map(p => ({
        signature: p.publicKey.toString(),
        type: "sent",
        counterparty: p.account.recipient,
        encryptedAmount: new Uint8Array(p.account.encryptedAmount),
        encryptedMemo: new Uint8Array(p.account.encryptedMemo),
        timestamp: p.account.timestamp.toNumber(),
        paymentIndex: p.account.paymentIndex.toNumber(),
      }));

      const received: Payment[] = receivedPayments.map(p => ({
        signature: p.publicKey.toString(),
        type: "received",
        counterparty: p.account.sender,
        encryptedAmount: new Uint8Array(p.account.encryptedAmount),
        encryptedMemo: new Uint8Array(p.account.encryptedMemo),
        timestamp: p.account.timestamp.toNumber(),
        paymentIndex: p.account.paymentIndex.toNumber(),
      }));

      return [...sent, ...received].sort((a, b) => b.timestamp - a.timestamp);
    },
    enabled: !!walletAddress && !!program,
    staleTime: 15_000,
  });
}
```

---

#### `hooks/useContacts.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { usePrivy } from "@privy-io/react-auth";

export interface Contact {
  id: string;
  contactWallet: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  nickname?: string;
}

export function useContacts() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;
  const queryClient = useQueryClient();

  const contacts = useQuery({
    queryKey: ["contacts", walletAddress],
    queryFn: async (): Promise<Contact[]> => {
      if (!walletAddress) return [];

      const { data, error } = await supabase
        .from("contacts")
        .select(`
          id,
          contact_wallet,
          nickname,
          users!contacts_contact_wallet_fkey (
            username, display_name, avatar_url
          )
        `)
        .eq("owner_wallet", walletAddress);

      if (error) throw error;
      return data?.map(c => ({
        id: c.id,
        contactWallet: c.contact_wallet,
        nickname: c.nickname,
        username: (c.users as any)?.username,
        displayName: (c.users as any)?.display_name,
        avatarUrl: (c.users as any)?.avatar_url,
      })) ?? [];
    },
    enabled: !!walletAddress,
  });

  const addContact = useMutation({
    mutationFn: async (contactWallet: string) => {
      const { error } = await supabase.from("contacts").insert({
        owner_wallet: walletAddress,
        contact_wallet: contactWallet,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contacts"] }),
  });

  const searchUsers = async (query: string): Promise<Contact[]> => {
    const { data } = await supabase
      .from("users")
      .select("wallet_address, username, display_name, avatar_url")
      .ilike("username", `%${query}%`)
      .limit(5);

    return data?.map(u => ({
      id: u.wallet_address,
      contactWallet: u.wallet_address,
      username: u.username,
      displayName: u.display_name,
      avatarUrl: u.avatar_url,
    })) ?? [];
  };

  return { contacts, addContact, searchUsers };
}
```

---

#### `hooks/useAnchorProgram.ts`
```typescript
import { useMemo } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { usePrivy } from "@privy-io/react-auth";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { IDL, ShadowPayIDL } from "@/lib/solana/idl";

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_SHADOWPAY_PROGRAM_ID!);

export function useAnchorProgram(): Program<ShadowPayIDL> | null {
  const { connection } = useConnection();
  const { user, sendTransaction } = usePrivy();

  return useMemo(() => {
    if (!user?.wallet) return null;

    // Build a wallet adapter compatible with Anchor from Privy
    const wallet = {
      publicKey: new PublicKey(user.wallet.address),
      signTransaction: async (tx: any) => {
        // Use Privy's signing
        return tx;
      },
      signAllTransactions: async (txs: any[]) => txs,
    };

    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });

    return new Program<ShadowPayIDL>(IDL, PROGRAM_ID, provider);
  }, [connection, user?.wallet?.address]);
}
```

---

### 3D. ZUSTAND STORE

#### `store/useAppStore.ts`
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PublicKey } from "@solana/web3.js";

interface User {
  walletAddress: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  isWorldIDVerified: boolean;
  arciumPubkey?: string;
}

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;

  // UI state
  balanceRevealed: boolean;
  setBalanceRevealed: (v: boolean) => void;

  // Send modal
  sendModalOpen: boolean;
  setSendModalOpen: (v: boolean) => void;
  prefillRecipient?: string;
  setPrefillRecipient: (addr?: string) => void;

  // Onramp modal
  onrampModalOpen: boolean;
  setOnrampModalOpen: (v: boolean) => void;

  // Revealed payment amounts cache (signature → decrypted amount)
  revealedAmounts: Record<string, number>;
  setRevealedAmount: (signature: string, amount: number) => void;

  // Notification
  pendingNotification?: string;
  setPendingNotification: (msg?: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updates) => set(state => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

      balanceRevealed: false,
      setBalanceRevealed: (v) => set({ balanceRevealed: v }),

      sendModalOpen: false,
      setSendModalOpen: (v) => set({ sendModalOpen: v }),
      setPrefillRecipient: (addr) => set({ prefillRecipient: addr }),

      onrampModalOpen: false,
      setOnrampModalOpen: (v) => set({ onrampModalOpen: v }),

      revealedAmounts: {},
      setRevealedAmount: (sig, amt) => set(state => ({
        revealedAmounts: { ...state.revealedAmounts, [sig]: amt }
      })),

      setPendingNotification: (msg) => set({ pendingNotification: msg }),
    }),
    {
      name: "shadowpay-store",
      partialize: (state) => ({
        user: state.user,
        balanceRevealed: false, // never persist revealed state for security
      }),
    }
  )
);
```

---

### 3E. SUPABASE REALTIME INTEGRATION

#### `hooks/useRealtimePayments.ts`
```typescript
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

export function useRealtimePayments(walletAddress?: string) {
  const queryClient = useQueryClient();
  const setPendingNotification = useAppStore(s => s.setPendingNotification);

  useEffect(() => {
    if (!walletAddress) return;

    const channel = supabase
      .channel(`payments:${walletAddress}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transaction_events",
          filter: `accounts=cs.{${walletAddress}}`,
        },
        (payload) => {
          // New transaction detected
          queryClient.invalidateQueries({ queryKey: ["payments", walletAddress] });
          queryClient.invalidateQueries({ queryKey: ["balance", walletAddress] });

          // Show toast notification
          toast.custom((t) => (
            <div className={`bg-[#1a1a24] border border-purple-500/20 rounded-xl p-4 
                            shadow-lg flex items-center gap-3 transition-all
                            ${t.visible ? "opacity-100" : "opacity-0"}`}>
              <div className="text-2xl">🔒</div>
              <div>
                <p className="text-sm font-medium text-white">
                  Private payment received
                </p>
                <p className="text-xs text-white/40">
                  Tap to reveal amount
                </p>
              </div>
            </div>
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walletAddress, queryClient]);
}
```

---

### 3F. SOLANA ACTIONS / BLINKS API

#### `app/api/actions/send/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
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
    icon: "https://shadowpay.app/icon.png",
    label: "Send Privately",
    title: "ShadowPay — Private Payments on Solana",
    description:
      "Send USDC privately. Transaction amounts are encrypted by Arcium — " +
      "only the recipient can decrypt.",
    links: {
      actions: [
        {
          label: "Send Payment",
          href: "/api/actions/send?recipient={recipient}&amount={amount}",
          parameters: [
            {
              name: "recipient",
              label: "Recipient wallet or @username",
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

  const body = await req.json();
  const senderAddress = body.account;

  if (!recipient || !amount || !senderAddress) {
    return NextResponse.json(
      { error: "Missing required parameters" },
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
    });

    return NextResponse.json(
      {
        transaction: Buffer.from(serialized).toString("base64"),
        message: `Send $${amount} USDC privately to ${recipient.slice(0, 8)}...`,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
```

---

## 4. PHASE 4 — DEEP SPONSOR INTEGRATIONS

### 4A. ARCIUM MXE — DEEP INTEGRATION

**What is Arcium MXE?**
MXE = Multi-party Execution Environment. It's a network of nodes that perform computations on encrypted data without decrypting it. Think of it as a "blind computer" that processes your data without seeing it.

**For ShadowPay specifically:**
- Client encrypts `amount` using recipient's Arcium public key
- This encrypted blob is stored as `encrypted_amount [u8; 64]` in the PaymentRecord PDA
- Only the recipient (who holds the corresponding private key) can decrypt it
- Arcium's MXE validates that the encryption is well-formed without seeing the value

**Full lib/arcium/client.ts:**
```typescript
import { Connection, PublicKey } from "@solana/web3.js";

// Note: Arcium SDK is in active development
// Always check https://docs.arcium.com for latest API
// Package: @arcium-hq/arcium-js

interface ArciumClientConfig {
  connection: Connection;
  clusterUrl?: string;
}

export class ShadowPayArciumClient {
  private connection: Connection;
  private clusterUrl: string;

  constructor({ connection, clusterUrl }: ArciumClientConfig) {
    this.connection = connection;
    this.clusterUrl =
      clusterUrl ??
      process.env.NEXT_PUBLIC_ARCIUM_CLUSTER_URL ??
      "https://devnet.arcium.network";
  }

  // Generate a new Arcium keypair for a user
  // Called once during user registration
  async generateKeypair(): Promise<{
    publicKey: Uint8Array; // 32 bytes — stored on-chain
    privateKey: Uint8Array; // 32 bytes — stored encrypted in Privy
  }> {
    // TODO: replace with actual @arcium-hq/arcium-js keypair generation
    // Placeholder using crypto.subtle for now
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveKey", "deriveBits"]
    );
    const pubKey = await crypto.subtle.exportKey("raw", keyPair.publicKey);
    const privKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    return {
      publicKey: new Uint8Array(pubKey).slice(0, 32),
      privateKey: new Uint8Array(privKey).slice(0, 32),
    };
  }

  // Encrypt a uint64 amount for a recipient
  async encryptAmount(
    amount: bigint,
    recipientPublicKey: Uint8Array
  ): Promise<Uint8Array> {
    // TODO: replace with @arcium-hq/arcium-js encrypt()
    // For MVP: use ElGamal encryption over curve25519
    const amountBytes = new Uint8Array(8);
    const view = new DataView(amountBytes.buffer);
    view.setBigUint64(0, amount, true); // little-endian

    // Pad to 64 bytes for on-chain storage
    const ciphertext = new Uint8Array(64);
    ciphertext.set(amountBytes, 0);
    // Fill rest with deterministic padding based on recipient key
    // TODO: proper Arcium encryption
    return ciphertext;
  }

  // Decrypt a ciphertext using user's private key
  async decryptAmount(
    ciphertext: Uint8Array,
    privateKey: Uint8Array
  ): Promise<number> {
    // TODO: replace with @arcium-hq/arcium-js decrypt()
    // Extract amount from first 8 bytes (MVP placeholder)
    const view = new DataView(ciphertext.buffer, 0, 8);
    const amount = view.getBigUint64(0, true);
    return Number(amount) / 1_000_000; // Convert lamports to USDC
  }

  // Encrypt memo string for recipient
  async encryptMemo(
    memo: string,
    recipientPublicKey: Uint8Array
  ): Promise<Uint8Array> {
    const encoded = new TextEncoder().encode(memo);
    const padded = new Uint8Array(128).fill(0);
    padded.set(encoded.slice(0, 64), 0);
    // TODO: proper Arcium encryption
    return padded;
  }

  // Decrypt memo
  async decryptMemo(
    ciphertext: Uint8Array,
    privateKey: Uint8Array
  ): Promise<string> {
    // TODO: replace with @arcium-hq/arcium-js decrypt()
    const decoded = new TextDecoder().decode(ciphertext.slice(0, 64));
    return decoded.replace(/\0/g, "").trim();
  }
}

// Singleton
let _client: ShadowPayArciumClient | null = null;
export function getArciumClient(connection: Connection) {
  if (!_client) _client = new ShadowPayArciumClient({ connection });
  return _client;
}
```

**CRITICAL NOTE FOR CODEX:**
```
The Arcium SDK (@arcium-hq/arcium-js) is very new and still evolving.
All Arcium-specific calls are marked with // TODO: replace with actual SDK.
For the hackathon demo:
- Week 2 Day 1: Contact Arcium team on Discord to get latest SDK docs
- If MXE integration is blocked, use Solana's native Confidential SPL Token 
  as fallback (see lib/arcium/fallback.ts)
- The on-chain data structure (encrypted_amount [u8; 64]) stays the same
  regardless of which encryption backend is used
```

**Fallback: Confidential SPL Token (lib/arcium/fallback.ts)**
```typescript
// If Arcium MXE is not accessible, use Solana's Confidential Token Extension
// This is built into Solana and requires no external SDK
// Less privacy (ZK proofs vs MPC) but works today

import { 
  confidentialTransfer,
  ApplyPendingBalance 
} from "@solana/spl-token"; // v0.4.0+

// Confidential SPL uses ElGamal encryption + ZK proofs
// Amounts are hidden on-chain using zero-knowledge proofs
// Privacy model is different from Arcium but still hides amounts

export async function sendConfidentialTransfer(
  connection: Connection,
  sender: PublicKey,
  recipient: PublicKey,
  amount: bigint,
  signers: any[]
) {
  // Uses SPL Confidential Token Extension
  // Available on devnet today
  // TODO: implement when Arcium access is delayed
}
```

---

### 4B. WORLD ID — DEEP INTEGRATION

**Full Server-Side Verification (app/api/worldid/verify/route.ts):**
```typescript
import { NextRequest, NextResponse } from "next/server";

const WORLD_ID_API = "https://developer.worldcoin.org/api/v1/verify";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    merkle_root,
    nullifier_hash,
    proof,
    verification_level,
    action,
    signal,
  } = body;

  // Verify with World ID cloud API
  const verifyRes = await fetch(
    `${WORLD_ID_API}/${process.env.NEXT_PUBLIC_WORLD_APP_ID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merkle_root,
        nullifier_hash,
        proof,
        verification_level,
        action: "shadowpay-verify",
        signal: signal ?? "",
      }),
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyRes.ok) {
    return NextResponse.json(
      { success: false, error: verifyData.detail },
      { status: 400 }
    );
  }

  // Store nullifier hash in Supabase to prevent double verification
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("users")
    .update({
      world_id_verified: true,
      world_id_nullifier: nullifier_hash,
    })
    .eq("wallet_address", signal); // signal = wallet address

  if (error) {
    return NextResponse.json({ success: false, error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    nullifier_hash,
    verification_level,
  });
}
```

**On-chain Nullifier Storage Strategy:**
```
WorldID nullifier_hash is a bytes32 value that is:
1. Unique per (app_id + action + user)
2. Does NOT reveal the user's World ID
3. Deterministic — same user always produces same nullifier for same action

We store it in UserProfile.world_id_nullifier ([u8; 32])
Anchor instruction checks: if an account with the same nullifier already exists → reject
This prevents one human from creating multiple ShadowPay accounts
```

---

### 4C. MOONPAY — DEEP INTEGRATION

**Signed URL Generation (for production security):**
```typescript
// app/api/moonpay/signed-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { walletAddress } = await req.json();

  const baseUrl = "https://buy.moonpay.com";
  const params = new URLSearchParams({
    apiKey: process.env.NEXT_PUBLIC_MOONPAY_KEY!,
    currencyCode: "usdc_sol",
    walletAddress,
    colorCode: "#7c3aed",
    theme: "dark",
    redirectURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  const originalUrl = `${baseUrl}?${params.toString()}`;

  // Sign the URL with secret key
  const signature = crypto
    .createHmac("sha256", process.env.MOONPAY_SECRET_KEY!)
    .update(new URL(originalUrl).search)
    .digest("base64");

  const signedUrl = `${originalUrl}&signature=${encodeURIComponent(signature)}`;

  return NextResponse.json({ url: signedUrl });
}
```

**Webhook for payment completion:**
```typescript
// app/api/webhooks/moonpay/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // MoonPay sends webhook when transaction completes
  if (body.type === "transaction_updated" && body.data.status === "completed") {
    const { walletAddress, baseCurrencyAmount, currencyAmount } = body.data;
    
    // Log the onramp event
    await supabase.from("onramp_events").insert({
      wallet_address: walletAddress,
      fiat_amount: baseCurrencyAmount,
      usdc_amount: currencyAmount,
      transaction_id: body.data.id,
      status: "completed",
    });

    // Trigger balance refresh via Supabase Realtime
    await supabase
      .channel("onramp")
      .send({
        type: "broadcast",
        event: "balance_updated",
        payload: { walletAddress },
      });
  }

  return NextResponse.json({ received: true });
}
```

---

### 4D. SQUADS MULTISIG — DEEP INTEGRATION

**Group Pay Feature (lib/squads/groupPay.ts):**
```typescript
import * as multisig from "@squads-protocol/multisig";
import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

export interface GroupPayConfig {
  members: PublicKey[];         // wallets of all members
  threshold: number;            // min signatures required
  paymentAmount: number;        // total amount to split
  splitEvenly: boolean;
  customSplits?: { member: PublicKey; share: number }[];
}

export async function createGroupPayVault(
  connection: Connection,
  creator: PublicKey,
  config: GroupPayConfig
): Promise<{ vaultAddress: PublicKey; multisigAddress: PublicKey }> {
  const createKey = PublicKey.unique();
  
  const [multisigPda] = multisig.getMultisigPda({ createKey });
  const [vaultPda] = multisig.getVaultPda({
    multisigPda,
    index: 0,
  });

  // Build multisig members with permissions
  const members = config.members.map((key) => ({
    key,
    permissions: multisig.types.Permissions.all(),
  }));

  const instruction = await multisig.instructions.multisigCreateV2({
    createKey,
    creator,
    multisigPda,
    configAuthority: null,
    timeLock: 0,
    members,
    threshold: config.threshold,
    rentCollector: null,
    memo: "ShadowPay Group Pay",
  });

  return {
    vaultAddress: vaultPda,
    multisigAddress: multisigPda,
  };
}

// High-value payment guard: require 2-of-2 for >$500
export const HIGH_VALUE_THRESHOLD_USDC = 500;

export async function requiresMultisig(amount: number): Promise<boolean> {
  return amount >= HIGH_VALUE_THRESHOLD_USDC;
}
```

---

### 4E. HELIUS WEBHOOKS — DEEP INTEGRATION

**Full Webhook Setup Script (scripts/setup-helius-webhook.ts):**
```typescript
import { Helius } from "helius-sdk";

const helius = new Helius(process.env.HELIUS_API_KEY!);

async function setupWebhook() {
  const webhook = await helius.createWebhook({
    accountAddresses: [process.env.SHADOWPAY_PROGRAM_ID!],
    transactionTypes: ["ANY"],
    webhookURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/helius`,
    webhookType: "enhanced",
    authHeader: process.env.HELIUS_WEBHOOK_SECRET!,
  });

  console.log("Webhook created:", webhook.webhookID);
  console.log("Webhook URL:", webhook.webhookURL);
}

setupWebhook();
// Run: npx ts-node scripts/setup-helius-webhook.ts
```

**LaserStream gRPC Setup (for sub-100ms updates):**
```typescript
// lib/helius/laserstream.ts
// LaserStream = Helius's gRPC streaming for ultra-fast block data

export function subscribeToShadowPayEvents(
  walletAddress: string,
  onEvent: (event: any) => void
) {
  // LaserStream endpoint (Helius dev plan includes this)
  const wsUrl = `wss://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "logsSubscribe",
      params: [
        { mentions: [walletAddress] },
        { commitment: "confirmed" }
      ]
    }));
  };

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.params?.result?.value?.logs) {
      onEvent(data.params.result.value);
    }
  };

  return () => ws.close();
}
```

---

### 4F. PRIVY — DEEP INTEGRATION

**Full Provider Setup with Solana config:**
```typescript
// app/providers.tsx
"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#7c3aed",
          logo: "https://shadowpay.app/logo.png",
          loginMessage: "Sign in to ShadowPay",
          showWalletLoginFirst: false,
        },
        loginMethods: ["email", "google", "twitter", "wallet"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          requireUserPasswordOnCreate: false,
          showWalletUIs: true,
          solanaConfig: {
            cluster: "mainnet-beta",
          },
        },
        externalWallets: {
          solana: { connectors: solanaConnectors },
        },
        solanaClusters: [
          {
            name: "mainnet-beta",
            rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
```

**Get Solana wallet from Privy:**
```typescript
// hooks/usePrivyWallet.ts
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { PublicKey } from "@solana/web3.js";

export function usePrivyWallet() {
  const { user, authenticated, login, logout } = usePrivy();
  const { wallets } = useSolanaWallets();

  const wallet = wallets[0]; // primary embedded wallet
  const publicKey = wallet?.address ? new PublicKey(wallet.address) : null;

  return {
    user,
    authenticated,
    login,
    logout,
    wallet,
    publicKey,
    address: wallet?.address ?? null,
    signTransaction: wallet?.signTransaction.bind(wallet),
    sendTransaction: wallet?.sendTransaction.bind(wallet),
  };
}
```

---

## 5. TRD — TECHNICAL REFERENCE DOCUMENT

### 5A. SYSTEM DESIGN

**Component Responsibility Map:**

```
COMPONENT              RESPONSIBILITY                          OWNS
──────────────────────────────────────────────────────────────────────
Anchor Program         State machine, fund custody,           On-chain PDAs
                       encryption validation
                       
Arcium MXE             Encrypted computation,                 Ciphertext validity
                       proof generation
                       
World ID               Sybil resistance,                      nullifier_hash
                       identity uniqueness
                       
Privy                  Auth, embedded wallet,                  JWT, keypair
                       transaction signing
                       
Supabase               Off-chain metadata (usernames,         postgres tables
                       avatars, contacts, events)
                       
Helius                 RPC, webhooks, real-time               tx events
                       transaction events
                       
MoonPay                Fiat → USDC conversion,                onramp tx
                       KYC (handled by MoonPay)
                       
Next.js App            UI, API routes,                        User experience
                       business logic
```

---

### 5B. DATA FLOW DIAGRAMS

**Send Payment Flow (step by step):**
```
USER ACTION: "Send $50 to @alice"
│
├─ 1. SendForm validates input
│     → amount: 50 USDC
│     → recipient: lookup @alice → get wallet address + arciumPubkey
│
├─ 2. Arcium encryption (client-side)
│     → encryptAmount(50_000_000, aliceArciumPubkey) → [u8; 64]
│     → encryptMemo("for pizza", aliceArciumPubkey) → [u8; 128]
│
├─ 3. Build Anchor transaction
│     → program.methods.sendPayment(
│         paymentIndex,      // sender's paymentCount
│         encryptedAmount,   // [u8; 64] ciphertext
│         encryptedMemo,     // [u8; 128] ciphertext
│         50_000_000         // plaintext lamports for SPL
│       )
│     → accounts: senderProfile, aliceProfile, paymentRecord,
│                 senderTokenAccount, aliceTokenAccount,
│                 usdcMint, sender, tokenProgram
│
├─ 4. Privy signs and sends transaction
│     → wallet.sendTransaction(tx, connection)
│     → signature returned
│
├─ 5. On-chain execution
│     → SPL token transfer: 50 USDC sender → alice
│     → PaymentRecord PDA created:
│         { encrypted_amount: [cypher...], encrypted_memo: [cypher...] }
│     → sender paymentCount++ 
│     → alice receiveCount++
│
├─ 6. Helius detects transaction
│     → webhook fires to /api/webhooks/helius
│     → stored in transaction_events table
│     → Supabase Realtime notifies alice's session
│
└─ 7. Alice's UI
      → Toast: "Private payment received 🔒"
      → usePayments() refetches
      → Alice clicks "Reveal" → decryptAmount(ciphertext, alicePrivKey) → $50.00
```

---

### 5C. SECURITY MODEL

```
THREAT               MITIGATION
─────────────────────────────────────────────────────────────
Sybil attacks        World ID nullifier stored on-chain.
                     1 account per verified human.
                     Anchor rejects duplicate nullifiers.

Amount surveillance  Arcium MXE encryption. On-chain state
                     stores only ciphertext. Not readable
                     by validators, indexers, or analytics.

Replay attacks       Anchor's built-in nonce (paymentIndex).
                     Each PaymentRecord has unique PDA seed.

Frontrunning         Amounts are encrypted before broadcast.
                     MEV bots see ciphertext, not value.

Bot spam             World ID required to send. Bots cannot
                     get World ID verification.

Key compromise       Privy's MPC key infrastructure.
                     No single point of failure for user keys.

Rug pull             No admin keys in Anchor program.
                     Program is immutable post-deployment.
                     All state is user-owned PDAs.

Fake receipts        PaymentRecord PDA is created by Anchor.
                     Cannot be created outside the program.
                     On-chain verifiable.
```

---

### 5D. API REFERENCE

**Internal API Routes:**

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /api/users/[username] | None | Get user profile by username |
| POST | /api/users | Privy JWT | Create/update user profile |
| GET | /api/contacts | Privy JWT | Get user's contacts |
| POST | /api/contacts | Privy JWT | Add a contact |
| POST | /api/worldid/verify | None | Verify World ID proof |
| POST | /api/moonpay/signed-url | Privy JWT | Get signed MoonPay URL |
| POST | /api/webhooks/helius | Helius secret | Receive tx events |
| POST | /api/webhooks/moonpay | MoonPay secret | Receive onramp events |
| GET | /api/actions/send | None | Blink: get action metadata |
| POST | /api/actions/send | None | Blink: build transaction |

**Supabase Tables:**

| Table | Primary Key | Description |
|---|---|---|
| users | wallet_address | User profiles, World ID status |
| contacts | id (uuid) | User address book |
| transaction_events | signature | Raw Helius webhook payloads |
| payment_requests | request_id | Off-chain payment request metadata |
| onramp_events | id | MoonPay transaction records |

---

### 5E. ERROR HANDLING STRATEGY

**Frontend error taxonomy:**

```typescript
// lib/errors.ts

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
```

---

### 5F. TESTING STRATEGY

**Bankrun Test Structure:**
```typescript
// tests/shadowpay.ts
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";

describe("ShadowPay Program", () => {
  let provider: BankrunProvider;
  let program: Program;
  let alice: Keypair;
  let bob: Keypair;

  beforeAll(async () => {
    const context = await startAnchor(".", [], []);
    provider = new BankrunProvider(context);
    alice = Keypair.generate();
    bob = Keypair.generate();
    // Airdrop SOL to test wallets
  });

  describe("initialize_user", () => {
    it("creates UserProfile PDA for alice", async () => { });
    it("rejects duplicate World ID nullifier", async () => { });
    it("requires is_verified = true", async () => { });
  });

  describe("send_payment", () => {
    it("transfers USDC from alice to bob", async () => { });
    it("creates PaymentRecord with encrypted amount", async () => { });
    it("increments paymentCount on sender", async () => { });
    it("increments receiveCount on recipient", async () => { });
    it("rejects unverified sender", async () => { });
    it("rejects if insufficient balance", async () => { });
  });

  describe("request_payment", () => {
    it("creates PaymentRequest PDA", async () => { });
    it("generates unique request_id", async () => { });
    it("rejects expired requests", async () => { });
  });
});
```

**Frontend Test Structure (Vitest):**
```
tests/
├── unit/
│   ├── encrypt.test.ts      ← Test Arcium encryption/decryption roundtrip
│   ├── pdas.test.ts         ← Test PDA derivation
│   └── store.test.ts        ← Test Zustand store mutations
├── integration/
│   ├── sendPayment.test.ts  ← Test full send flow (mocked RPC)
│   └── worldid.test.ts      ← Test World ID verification flow
└── e2e/
    └── userJourney.test.ts  ← Playwright: full onboard → send → receive
```

---

## 6. DASHBOARD — FULL REFERENCE

### 6A. 5-WEEK SPRINT (DAY-BY-DAY)

#### WEEK 1 — Apr 6–12: FOUNDATION

**Apr 6 (Mon) — Day 1**
- [ ] Register on Colosseum Arena → arena.colosseum.org
- [ ] Join Colosseum Discord → #frontier-general channel
- [ ] `anchor init shadowpay` — workspace initialized
- [ ] Create GitHub repo: `shadowpay` (public, MIT license)
- [ ] Create Helius account → claim 50% Frontier discount
- [ ] Create Supabase project → note URL + anon key

**Apr 7 (Tue) — Day 2**
- [ ] `npx create-next-app@latest app --typescript --tailwind --app`
- [ ] Install: `npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token`
- [ ] Install: `npm install @privy-io/react-auth @tanstack/react-query zustand`
- [ ] Install: `npm install shadcn/ui framer-motion lucide-react`
- [ ] Set up `.env.local` with all keys from Section 9 (master context)
- [ ] Apply Supabase SQL schema (Section 8 of master context)

**Apr 8 (Wed) — Day 3**
- [ ] Write `state/user_profile.rs` account struct
- [ ] Write `state/payment_record.rs` account struct
- [ ] Write `state/payment_request.rs` account struct
- [ ] Write `errors.rs` custom error codes
- [ ] Write `constants.rs` seeds + limits
- [ ] `anchor build` — first successful build

**Apr 9 (Thu) — Day 4**
- [ ] Write `instructions/initialize_user.rs` with accounts + handler
- [ ] Write `lib.rs` entrypoint
- [ ] Write first Bankrun test: initialize_user happy path
- [ ] `anchor test` — tests pass
- [ ] Set up Privy provider in `app/providers.tsx`
- [ ] Implement `usePrivyWallet` hook

**Apr 10 (Fri) — Day 5**
- [ ] Write `instructions/send_payment.rs` (plaintext amount first)
- [ ] Write `lib/solana/pdas.ts` — PDA derivation helpers
- [ ] Write `lib/solana/program.ts` — Anchor program client
- [ ] Bankrun test: send_payment happy path

**Apr 11 (Sat) — Day 6**
- [ ] `anchor deploy --provider.cluster devnet` — FIRST DEPLOY ✓
- [ ] Note program ID → update `.env.local` + `Anchor.toml`
- [ ] Connect frontend to deployed program
- [ ] Build basic login page with Privy

**Apr 12 (Sun) — Day 7**
- [ ] Basic send flow: amount input → sign → confirm
- [ ] Commit everything to GitHub
- [ ] Update Colosseum project submission (brief description)
- [ ] **Week 1 Review:** Can users register and send? ✓

---

#### WEEK 2 — Apr 13–19: ENCRYPTION

**Apr 13 (Mon)**
- [ ] Join Arcium Discord → ask for devnet access + SDK docs
- [ ] `npm install @arcium-hq/arcium-js` (if available)
- [ ] Implement `lib/arcium/client.ts` with placeholder encryption
- [ ] Implement `lib/arcium/encrypt.ts`
- [ ] Implement `lib/arcium/decrypt.ts`

**Apr 14 (Tue) — Altitude Workshop @ 10AM PT**
- [ ] Attend Altitude/Squads workshop on Discord
- [ ] Take notes on Squads SDK for Week 4 integration
- [ ] Wire Arcium encryption into `send_payment` flow
- [ ] Test: encrypted amount stored in PaymentRecord on devnet

**Apr 15 (Wed)**
- [ ] `npm install @worldcoin/idkit`
- [ ] Build `components/identity/WorldIDButton.tsx`
- [ ] Build `app/(auth)/onboard/page.tsx`
- [ ] Wire World ID proof → `api/worldid/verify` → Supabase update

**Apr 16 (Thu) — Solana Office Hours @ 7AM PT**
- [ ] Attend Solana Foundation DevRel office hours
- [ ] Ask about Confidential SPL Token as Arcium fallback
- [ ] Wire nullifier_hash → `initialize_user` instruction
- [ ] Test: duplicate account registration rejected ✓

**Apr 17 (Fri)**
- [ ] Write `instructions/request_payment.rs`
- [ ] Build shareable payment link generation
- [ ] Helius webhook setup → `/api/webhooks/helius`
- [ ] Test webhook: deploy, send tx, check Supabase table

**Apr 18–19 (Weekend)**
- [ ] Write full Bankrun test suite (all 8 test cases)
- [ ] Fix all test failures
- [ ] Deploy updated program to devnet
- [ ] **Week 2 Review:** Encrypted payments + World ID working? ✓

---

#### WEEK 3 — Apr 20–26: FRONTEND

**Apr 20 (Mon)**
- [ ] Build dashboard layout: `app/(dashboard)/layout.tsx`
- [ ] Build `components/payments/BalanceDisplay.tsx`
- [ ] Implement `hooks/useBalance.ts`
- [ ] Default state: balance hidden as `$ ••••••`

**Apr 21 (Tue) — Phantom Connect Workshop @ 10AM PT**
- [ ] Attend Phantom workshop (note any Solana wallet connection tips)
- [ ] Build `components/payments/PaymentCard.tsx`
- [ ] Implement `hooks/usePayments.ts`
- [ ] Build payment feed on home page

**Apr 22 (Wed)**
- [ ] Build `components/payments/SendForm.tsx`
- [ ] Username search with debounce (Supabase query)
- [ ] Amount + memo input fields
- [ ] Implement `hooks/useSendPayment.ts`

**Apr 23 (Thu)**
- [ ] Build `components/payments/QRScanner.tsx`
- [ ] `npm install @zxing/library`
- [ ] Real-time: `hooks/useRealtimePayments.ts`
- [ ] Toast notification on payment received

**Apr 24 (Fri)**
- [ ] Build `components/onramp/MoonPayWidget.tsx`
- [ ] Get MoonPay API key (apply at moonpay.com/business)
- [ ] Signed URL generation: `api/moonpay/signed-url/route.ts`
- [ ] Test: card → USDC appears in wallet

**Apr 25–26 (Weekend)**
- [ ] Contact management: add contacts, search by username
- [ ] Settings page: profile photo upload (Supabase Storage)
- [ ] Mobile responsive polish
- [ ] Implement `store/useAppStore.ts` fully
- [ ] **Week 3 Review:** Full flow usable? Onboard → fund → send → receive? ✓

---

#### WEEK 4 — Apr 27–May 4: SIDE TRACKS

**Apr 27 (Mon)**
- [ ] Implement `lib/squads/groupPay.ts`
- [ ] Build Group Pay UI: invite members → set threshold
- [ ] Multi-sig for payments >$500

**Apr 28 (Tue) — Metaplex Workshop @ 10AM PT**
- [ ] Attend Metaplex workshop
- [ ] Note cNFT for v2 features (payment receipts as NFTs)
- [ ] Build Group Pay split UI: evenly / custom amounts

**Apr 29 (Wed)**
- [ ] Implement Solana Actions: `app/api/actions/send/route.ts`
- [ ] Test Blink in Dialect Blinks explorer
- [ ] Generate QR codes for personal payment link

**Apr 30 (Thu) — Solana Office Hours @ 7AM PT**
- [ ] Get Blinks reviewed by Solana DevRel
- [ ] Submit to actions registry: https://github.com/dialectlabs/actions
- [ ] Upgrade World ID to VerificationLevel.Orb (higher trust)

**May 1 (Fri)**
- [ ] Build "Verified Human" orb badge component
- [ ] Implement payment request fulfillment flow
- [ ] Build notification center for pending requests

**May 2–3 (Weekend)**
- [ ] May 3: World Workshop @ 10AM PT — ATTEND
- [ ] Review all 6 sponsor integrations, ensure each is demo-able
- [ ] Prepare Superteam Earn side track submission drafts
- [ ] **Week 4 Review:** 5+ integrations demonstrable? ✓

---

#### WEEK 5 — May 5–11: POLISH & SUBMIT

**May 5 (Mon)**
- [ ] E2E Playwright test: full user journey
- [ ] Fix all bugs found in E2E
- [ ] Performance: React Query caching, lazy imports

**May 6 (Tue)**
- [ ] Mobile testing: real iPhone + Android (use BrowserStack if needed)
- [ ] Error states: empty feed, no balance, network error
- [ ] Loading skeletons for all async components

**May 7 (Wed)**
- [ ] UI polish: micro-animations with Framer Motion
- [ ] Onboarding tour (3-step modal for new users)
- [ ] Privacy mode toggle (hide all amounts globally)

**May 8 (Thu)**
- [ ] Security review: audit env vars, no console.logs with sensitive data
- [ ] Write README.md: setup guide + architecture diagram
- [ ] Record screen capture footage for demo video

**May 9 (Fri)**
- [ ] Record + edit 3-minute demo video (see script in 6E below)
- [ ] Submit on Superteam Earn side tracks (Arcium, World, MoonPay, Squads)
- [ ] Final review of Colosseum submission form

**May 10 (Sat)**
- [ ] Submit Colosseum Arena submission ← LAST SAFE DAY
- [ ] Double-check: project name, description, video link, GitHub link
- [ ] Post on Twitter/X with demo GIF
- [ ] Tag @colosseum, @arciumhq, @worldcoin, @moonpay

**May 11 (Sun) — DEADLINE**
- [ ] Submission closes 11:59 PM PDT
- [ ] Buffer day for any last fixes
- [ ] Rest. You built something real. 🔒

---

### 6B. WINNING EDGE MATRIX

| Dimension | Status | Notes |
|---|---|---|
| Technical depth | 🔥 High | Arcium MXE — few teams attempt this |
| Judge alignment | 🔥 Perfect | 2 Arcium judges, World workshop, Phantom judge |
| Sponsor coverage | 🔥 6 tracks | Arcium+World+MoonPay+Privy+Helius+Squads |
| Real-world use case | ✓ Strong | Consumer app, not another DeFi protocol |
| Prize eligibility | ✓ All major | Grand+PublicGoods+University+Pool+Tracks |
| Narrative | ✓ Clear | "Privacy is a human right on-chain" |
| Completeness | Target | Full flow in one demo = winner |
| University angle | ✓ SATI | $10K University Award specifically for this |

---

### 6C. JUDGE ALIGNMENT MAP

```
JUDGE              COMPANY        WHAT THEY CARE ABOUT        HOW SHADOWPAY ALIGNS
────────────────────────────────────────────────────────────────────────────────────
Arihant Bansal     Arcium         Privacy + encrypted compute  CORE FEATURE
milian             Arcium         Privacy GCR                  CORE FEATURE
Adam Gutierrez     Phantom        Developer UX, wallets        Privy = no Phantom needed
                                                                (shows ecosystem thinking)
Aditya Shetty      Superteam      Consumer apps                P2P payments = consumer
Lily Liu           Solana Found.  Mass adoption                MoonPay = normal user onramp
Rodian             Loyal          Consumer loyalty UX          Payment feed = social UX
Phil Jacobson      Altitude       Treasury, multisig           Squads group pay feature
Brandon Schroedle  Univ. Michigan University teams             SATI Vidisha = eligible
Stephen Hess       Metaplex       NFTs + digital assets        V2: payment receipt NFTs
```

---

### 6D. SIDE TRACK PRIZE MAP

| Sponsor | Our Integration | Side Track Prize (est.) |
|---|---|---|
| Arcium | Core encryption engine | ✓ Main Arcium track |
| World (Worldcoin) | Sybil resistance | ✓ World track |
| MoonPay | Fiat onramp | ✓ MoonPay track |
| Squads / Altitude | Group pay multisig | ✓ Altitude track |
| Privy | Embedded wallets | ✓ Privy track |
| Helius | RPC + webhooks | Supporting role |

**Submit to Superteam Earn side tracks:** https://superteam.fun/earn/hackathon/frontier
(Side tracks open when submission period opens)

---

### 6E. DEMO VIDEO SCRIPT (3 MINUTES)

**[0:00–0:30] The Problem**
```
Script: "Right now, every Solana payment is public.
Show Solscan → anyone's wallet → full transaction history visible.
Your employer, your ex, blockchain analytics firms —
they can see exactly what you paid, when, and to whom.
This is not acceptable for everyday finance."

Visual: Screen recording of Solscan showing public transactions.
```

**[0:30–1:00] The Solution**
```
Script: "ShadowPay is Venmo for Solana — 
but every transaction amount is encrypted by Arcium's privacy network.
Nobody sees your balance. Nobody can bot you."

Visual: ShadowPay app logo + tagline animation.
```

**[1:00–2:00] Live Demo**
```
Script: "Let me show you.
I sign up with my email — no seed phrase, powered by Privy.
I verify I'm human with World ID — this prevents bots and fake accounts.
I add $50 USDC using my credit card through MoonPay — no CEX needed.
I send $25 to Alice. She gets a notification: private payment received.
On Solscan, the transaction shows — but the amount? Just encrypted bytes.
Alice taps reveal — and now she sees her $25."

Visual: Full screen recording of the demo flow.
Show: Login → World ID → MoonPay → Send → Solscan (encrypted) → Alice reveals.
```

**[2:00–2:30] Tech Stack**
```
Script: "Under the hood:
Anchor smart contracts on Solana handle custody.
Arcium MXE encrypts amounts — a first for consumer payments on Solana.
World ID ensures one account per human.
MoonPay gets non-crypto users funded in 60 seconds.
Helius powers real-time payment notifications."

Visual: Architecture diagram (use the SVG from earlier).
```

**[2:30–3:00] Vision**
```
Script: "Privacy is a human right — on-chain too.
ShadowPay is the foundation for a private financial layer on Solana.
Split rent, pay freelancers, send money globally —
without your financial life being permanently public."

Visual: ShadowPay logo. GitHub link. Live URL.
```

---

## 7. ANTIGRAVITY CONTEXT BLOCK

**Copy this ENTIRE block as the first message in every Antigravity session:**

```
=== SHADOWPAY — ANTIGRAVITY MASTER CONTEXT ===

You are the senior architect and lead developer for ShadowPay, a production-grade
Solana hackathon project for Colosseum Frontier (April 6 – May 11, 2026).

PROJECT: Private P2P payments on Solana using Arcium MXE encryption + World ID
CHAIN: Solana Devnet → Mainnet
PROGRAM: Anchor v0.30+ (Rust)
FRONTEND: Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui
PRIVACY: @arcium-hq/arcium-js (encrypted amounts + memos)
IDENTITY: @worldcoin/idkit (sybil resistance)
AUTH: @privy-io/react-auth (embedded wallets)
ONRAMP: MoonPay (fiat → USDC)
RPC: Helius (with webhooks)
DB: Supabase Postgres + Realtime

FILE STRUCTURE RULE: Always follow the exact file paths in Section 5 of the master context.
CODE STYLE: TypeScript strict mode. Anchor best practices. No any types except where required.
TESTING: Bankrun for Anchor tests. Vitest for frontend. Playwright for E2E.

ARCIUM NOTE: The @arcium-hq/arcium-js SDK is actively evolving.
  - Always mark Arcium calls with // TODO: verify against latest SDK docs
  - If SDK is unavailable, use Confidential SPL Token as fallback
  - Never block progress waiting for Arcium — implement placeholder + fallback

WORLD ID NOTE: nullifier_hash is bytes32. Store as [u8; 32] in Anchor.
  Verification: frontend IDKit → server /api/worldid/verify → on-chain nullifier

PRIVY NOTE: Use useSolanaWallets() for embedded wallet access.
  Use wallet.sendTransaction() for all transaction submissions.

WHEN GENERATING CODE:
  1. Always import from exact paths defined in the file structure
  2. Always handle loading and error states
  3. Always add TypeScript types — no implicit any
  4. Always use Tailwind classes (dark theme: bg-[#0a0a0f])
  5. Prefer React Query for all server state
  6. Use Zustand (useAppStore) for UI + user state

CURRENT SPRINT STATUS: Check the 5-week plan — update me on which week we're in.
DEADLINE: May 11, 2026 @ 11:59 PM PDT. No extensions.

When I ask you to generate code, always:
1. State the file path first
2. Write complete, working code (not pseudocode)
3. Include all necessary imports
4. Add // NOTE comments for anything Arcium-specific that needs SDK verification
5. If you're unsure about an API signature, say so — don't hallucinate
=== END CONTEXT ===
```

---

*SHADOWPAY COMPLETE BIBLE v2.0*  
*Last Updated: April 2026 | Colosseum Frontier*  
*Next Update: After Week 2 completion (add actual Arcium SDK calls)*

---

> **Quick Reference Card**
> 
> | Need | File | Section |
> |---|---|---|
> | Anchor accounts | programs/shadowpay/src/state/ | Master Context §6.1 |
> | Instructions | programs/shadowpay/src/instructions/ | Master Context §6.2 |
> | Arcium encryption | lib/arcium/ | Bible §4A |
> | World ID | components/identity/ + api/worldid/ | Bible §4B |
> | MoonPay | components/onramp/ + api/moonpay/ | Bible §4C |
> | Squads | lib/squads/ | Bible §4D |
> | Helius | api/webhooks/helius/ + lib/helius/ | Bible §4E |
> | Privy | app/providers.tsx + hooks/usePrivyWallet | Bible §4F |
> | All hooks | hooks/ | Bible §3C |
> | All components | components/ | Bible §3B |
> | Sprint plan | — | Bible §6A |
> | Demo script | — | Bible §6E |
> | Antigravity prompt | — | Bible §7 |


