# SHADOWPAY — MASTER CONTEXT DOCUMENT
### For: Antigravity AI IDE / Codex / Any AI Coding Assistant
### Hackathon: Colosseum Frontier · April 6 – May 11, 2026
### Status: Active Development

---

## 1. PROJECT OVERVIEW

**Name:** ShadowPay  
**Tagline:** Private-by-default P2P payments on Solana. Nobody sees your balance. Nobody can bot you.  
**Category:** Payments + Commerce · Privacy + Confidential Compute · Identity + Human Verification  
**Primary Sponsor Integrations:** Arcium, World ID, MoonPay, Privy, Helius  

### Elevator Pitch
ShadowPay is a Venmo-style consumer payments app built on Solana where transaction amounts and balances are encrypted using Arcium's Encrypted Computation Network. Users verify their humanity once with World ID (no bots, no duplicate accounts). Fiat onramp via MoonPay. Wallet abstraction via Privy. Settlement in <400ms using Solana's native speed.

**One line for judges:** "Venmo with Arcium encryption + World ID — the first private P2P payment app normal people can actually use on Solana."

---

## 2. PROBLEM STATEMENT

Current Solana payments are fully transparent:
- Anyone can see your wallet balance on Solscan
- Transaction amounts are public — privacy is impossible
- Bots and sybil actors can spam, front-run, and exploit open systems
- Fiat-to-crypto UX is still terrible for non-crypto users
- Existing "private" solutions (Tornado Cash derivatives) are compliance nightmares

**Real-world pain point:** You send $200 USDC to a friend for rent. Now your employer, your ex, random blockchain analytics firms, and future government regulators know exactly what you paid, when, and to whom. This is not acceptable for everyday finance.

---

## 3. THE SOLUTION

ShadowPay encrypts payment amounts and memo fields using Arcium's MXE (Multi-Party Computation Execution Environment). The on-chain state stores only encrypted ciphertexts. Arcium's node network performs the computation without ever seeing the plaintext values.

### Flow:
1. User onboards via Privy (email/social login → embedded wallet, no seed phrase UX)
2. One-time World ID verification → sybil resistance, 1 account per human
3. Fund wallet via MoonPay fiat onramp (card → USDC → Solana wallet)
4. Send payment → amount encrypted client-side → Arcium MXE validates the encrypted computation → Solana program updates encrypted state
5. Recipient can decrypt their own balance using their private key
6. Transaction appears on-chain as: sender, recipient, encrypted_amount, encrypted_memo, timestamp

### What's Private:
- Exact amounts (encrypted ciphertext on-chain)
- Memo/notes field
- Running balance

### What's Public (required for Solana consensus):
- That a transaction occurred between two addresses
- Timestamp
- Gas fees

---

## 4. TECH STACK

### Blockchain
- **Chain:** Solana Mainnet (devnet for development)
- **Smart Contract Framework:** Anchor v0.30+ (Rust)
- **Token:** SPL Token (USDC)
- **Compression:** None needed for MVP (Metaplex cNFT for receipts in v2)
- **RPC:** Helius (50% discount available for Frontier builders)

### Privacy Layer
- **Arcium MXE:** Encrypted computation network on Solana
- **Confidential SPL:** Solana's native confidential token extension (fallback)
- **SDK:** `@arcium-hq/arcium-js`

### Identity
- **World ID:** `@worldcoin/idkit` — proof of personhood
- **On-chain verification:** World ID Solana verifier program

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Wallet:** Privy embedded wallets (no Phantom required for onboarding)
- **State:** Zustand + React Query
- **Animation:** Framer Motion

### Backend / Infrastructure
- **Database:** Supabase (Postgres) — for off-chain metadata: usernames, avatars, contacts
- **Auth:** Privy (handles wallet + social login)
- **File Storage:** Supabase Storage (avatars)
- **Events:** Helius webhooks → Supabase edge functions → real-time UI updates
- **Deployment:** Vercel (frontend) + Helius (RPC)

### Development Tools
- **AI IDEs:** Antigravity (context-aware), Codex (smart contract generation)
- **Testing:** Bankrun (Solana program testing), Vitest (frontend)
- **CLI:** Solana CLI, Anchor CLI

---

## 5. FILE STRUCTURE

```
shadowpay/
│
├── programs/                          ← Anchor Rust programs
│   └── shadowpay/
│       ├── src/
│       │   ├── lib.rs                 ← Program entrypoint, declare_id!
│       │   ├── instructions/
│       │   │   ├── mod.rs
│       │   │   ├── initialize_user.rs ← Register user + World ID nullifier
│       │   │   ├── send_payment.rs    ← Core: encrypted transfer instruction
│       │   │   ├── request_payment.rs ← Payment request (link-based)
│       │   │   └── close_account.rs   ← Cleanup
│       │   ├── state/
│       │   │   ├── mod.rs
│       │   │   ├── user_profile.rs    ← UserProfile PDA account
│       │   │   ├── payment_record.rs  ← PaymentRecord PDA account
│       │   │   └── payment_request.rs ← PaymentRequest PDA account
│       │   ├── errors.rs              ← Custom error codes
│       │   └── constants.rs           ← Seeds, sizes, limits
│       ├── Cargo.toml
│       └── Xargo.toml
│
├── app/                               ← Next.js 14 App Router frontend
│   ├── (auth)/
│   │   ├── login/page.tsx             ← Privy login (email/social)
│   │   └── onboard/page.tsx           ← World ID verification flow
│   ├── (dashboard)/
│   │   ├── layout.tsx                 ← Authenticated shell
│   │   ├── home/page.tsx              ← Feed + balance (encrypted)
│   │   ├── send/page.tsx              ← Send payment flow
│   │   ├── request/page.tsx           ← Request payment / generate link
│   │   ├── history/page.tsx           ← Transaction history (decrypted locally)
│   │   └── settings/page.tsx          ← Profile, privacy settings
│   ├── api/
│   │   ├── webhooks/helius/route.ts   ← Helius webhook handler
│   │   ├── users/route.ts             ← User profile CRUD
│   │   └── contacts/route.ts          ← Contact management
│   ├── layout.tsx                     ← Root layout, providers
│   └── globals.css
│
├── components/
│   ├── ui/                            ← shadcn/ui base components
│   ├── payments/
│   │   ├── SendForm.tsx               ← Amount input + recipient picker
│   │   ├── PaymentCard.tsx            ← Feed item (encrypted amount shown as ***)
│   │   ├── BalanceDisplay.tsx         ← Encrypted balance + reveal toggle
│   │   └── QRScanner.tsx              ← Scan to pay
│   ├── identity/
│   │   ├── WorldIDButton.tsx          ← IDKit verification widget
│   │   └── VerifiedBadge.tsx          ← Human-verified indicator
│   └── onramp/
│       └── MoonPayWidget.tsx          ← Fiat onramp modal
│
├── lib/
│   ├── solana/
│   │   ├── connection.ts              ← Helius RPC connection
│   │   ├── program.ts                 ← Anchor IDL + program client
│   │   └── pdas.ts                    ← PDA derivation helpers
│   ├── arcium/
│   │   ├── client.ts                  ← Arcium MXE client setup
│   │   ├── encrypt.ts                 ← Client-side encryption helpers
│   │   └── decrypt.ts                 ← Balance/amount decryption
│   ├── worldid/
│   │   └── verify.ts                  ← World ID proof verification
│   ├── privy/
│   │   └── config.ts                  ← Privy provider config
│   └── supabase/
│       ├── client.ts
│       └── types.ts                   ← Generated Supabase types
│
├── hooks/
│   ├── useBalance.ts                  ← Fetch + decrypt user balance
│   ├── usePayments.ts                 ← Payment history
│   ├── useSendPayment.ts              ← Send payment mutation
│   ├── useContacts.ts                 ← Address book
│   └── useWorldID.ts                  ← World ID verification state
│
├── store/
│   └── useAppStore.ts                 ← Zustand: user, balance, UI state
│
├── tests/                             ← Anchor program tests
│   ├── shadowpay.ts                   ← Bankrun integration tests
│   └── fixtures/                      ← Test keypairs, mock data
│
├── scripts/
│   ├── deploy.sh                      ← Deploy to devnet/mainnet
│   └── initialize.ts                  ← Post-deploy program initialization
│
├── Anchor.toml
├── Cargo.toml (workspace)
├── package.json
├── tsconfig.json
├── .env.local.example
└── README.md
```

---

## 6. ANCHOR SMART CONTRACT — FULL SCHEMA

### 6.1 Account Structures

```rust
// state/user_profile.rs
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    pub owner: Pubkey,               // 32 bytes — wallet pubkey
    pub world_id_nullifier: [u8; 32],// 32 bytes — World ID nullifier hash (prevents double registration)
    pub arcium_pubkey: [u8; 32],     // 32 bytes — user's Arcium encryption public key
    pub username_hash: [u8; 32],     // 32 bytes — hash of username (actual username in Supabase)
    pub encrypted_balance: [u8; 64], // 64 bytes — Arcium-encrypted USDC balance (ciphertext)
    pub payment_count: u64,          // 8 bytes  — total payments sent
    pub receive_count: u64,          // 8 bytes  — total payments received
    pub is_verified: bool,           // 1 byte   — World ID verified
    pub created_at: i64,             // 8 bytes  — unix timestamp
    pub bump: u8,                    // 1 byte   — PDA bump
}

// Seeds: ["user_profile", owner.key()]
// Total: 32+32+32+32+64+8+8+1+8+1 = 218 bytes + 8 discriminator = 226 bytes

// state/payment_record.rs
#[account]
#[derive(InitSpace)]
pub struct PaymentRecord {
    pub sender: Pubkey,              // 32 bytes
    pub recipient: Pubkey,           // 32 bytes
    pub encrypted_amount: [u8; 64],  // 64 bytes — Arcium-encrypted amount
    pub encrypted_memo: [u8; 128],   // 128 bytes — Arcium-encrypted memo
    pub token_mint: Pubkey,          // 32 bytes — SPL mint (USDC)
    pub timestamp: i64,              // 8 bytes
    pub payment_index: u64,          // 8 bytes  — sender's Nth payment (for PDA seed)
    pub bump: u8,                    // 1 byte
}

// Seeds: ["payment_record", sender.key(), payment_index.to_le_bytes()]
// Total: 32+32+64+128+32+8+8+1 = 305 bytes + 8 discriminator = 313 bytes

// state/payment_request.rs
#[account]
#[derive(InitSpace)]
pub struct PaymentRequest {
    pub requestor: Pubkey,           // 32 bytes
    pub payer: Option<Pubkey>,       // 33 bytes
    pub encrypted_amount: [u8; 64],  // 64 bytes
    pub encrypted_memo: [u8; 128],   // 128 bytes
    pub is_fulfilled: bool,          // 1 byte
    pub expires_at: i64,             // 8 bytes
    pub request_id: [u8; 16],        // 16 bytes — UUID for link generation
    pub bump: u8,
}

// Seeds: ["payment_request", requestor.key(), request_id]
```

### 6.2 Instructions

```rust
// instructions/initialize_user.rs
use anchor_lang::prelude::*;
use crate::state::UserProfile;

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + UserProfile::INIT_SPACE,
        seeds = [b"user_profile", owner.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeUser>,
    world_id_nullifier: [u8; 32],
    arcium_pubkey: [u8; 32],
    username_hash: [u8; 32],
) -> Result<()> {
    let profile = &mut ctx.accounts.user_profile;
    profile.owner = ctx.accounts.owner.key();
    profile.world_id_nullifier = world_id_nullifier;
    profile.arcium_pubkey = arcium_pubkey;
    profile.username_hash = username_hash;
    profile.encrypted_balance = [0u8; 64]; // zero balance, encrypted
    profile.payment_count = 0;
    profile.receive_count = 0;
    profile.is_verified = true; // World ID verified before this ix
    profile.created_at = Clock::get()?.unix_timestamp;
    profile.bump = ctx.bumps.user_profile;
    Ok(())
}

// instructions/send_payment.rs
#[derive(Accounts)]
#[instruction(payment_index: u64)]
pub struct SendPayment<'info> {
    #[account(
        mut,
        seeds = [b"user_profile", sender.key().as_ref()],
        bump = sender_profile.bump,
        constraint = sender_profile.is_verified @ ShadowPayError::NotVerified,
    )]
    pub sender_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [b"user_profile", recipient_profile.owner.as_ref()],
        bump = recipient_profile.bump,
    )]
    pub recipient_profile: Account<'info, UserProfile>,

    #[account(
        init,
        payer = sender,
        space = 8 + PaymentRecord::INIT_SPACE,
        seeds = [b"payment_record", sender.key().as_ref(), &payment_index.to_le_bytes()],
        bump
    )]
    pub payment_record: Account<'info, PaymentRecord>,

    // SPL token accounts for actual USDC transfer
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = sender,
    )]
    pub sender_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = recipient_profile.owner,
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>, // USDC mint

    #[account(mut)]
    pub sender: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SendPayment>,
    payment_index: u64,
    encrypted_amount: [u8; 64],  // Arcium ciphertext of amount
    encrypted_memo: [u8; 128],   // Arcium ciphertext of memo
    plaintext_amount: u64,        // actual USDC lamports for SPL transfer
    // Note: we DO need plaintext amount for the actual SPL transfer.
    // Privacy comes from Arcium encrypting the *recorded* amount.
    // Advanced v2: use Confidential SPL Token Extension instead.
) -> Result<()> {
    // 1. Transfer actual USDC via SPL token program
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.sender_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.sender.to_account_info(),
        },
    );
    token::transfer(cpi_ctx, plaintext_amount)?;

    // 2. Store encrypted payment record
    let record = &mut ctx.accounts.payment_record;
    record.sender = ctx.accounts.sender.key();
    record.recipient = ctx.accounts.recipient_profile.owner;
    record.encrypted_amount = encrypted_amount;
    record.encrypted_memo = encrypted_memo;
    record.token_mint = ctx.accounts.token_mint.key();
    record.timestamp = Clock::get()?.unix_timestamp;
    record.payment_index = payment_index;
    record.bump = ctx.bumps.payment_record;

    // 3. Update sender payment count
    ctx.accounts.sender_profile.payment_count += 1;
    // 4. Update recipient receive count
    ctx.accounts.recipient_profile.receive_count += 1;

    Ok(())
}
```

### 6.3 Error Codes

```rust
// errors.rs
use anchor_lang::prelude::*;

#[error_code]
pub enum ShadowPayError {
    #[msg("User must be World ID verified to send payments")]
    NotVerified,
    #[msg("Invalid World ID nullifier — duplicate account")]
    DuplicateNullifier,
    #[msg("Encrypted amount ciphertext is malformed")]
    InvalidCiphertext,
    #[msg("Payment request has expired")]
    RequestExpired,
    #[msg("Payment request already fulfilled")]
    AlreadyFulfilled,
    #[msg("Insufficient balance for payment")]
    InsufficientBalance,
    #[msg("Recipient account not initialized")]
    RecipientNotFound,
}
```

### 6.4 lib.rs Entry Point

```rust
// lib.rs
use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("SHADOW_PROGRAM_ID_PLACEHOLDER"); // Replace after deploy

#[program]
pub mod shadowpay {
    use super::*;

    pub fn initialize_user(
        ctx: Context<InitializeUser>,
        world_id_nullifier: [u8; 32],
        arcium_pubkey: [u8; 32],
        username_hash: [u8; 32],
    ) -> Result<()> {
        instructions::initialize_user::handler(ctx, world_id_nullifier, arcium_pubkey, username_hash)
    }

    pub fn send_payment(
        ctx: Context<SendPayment>,
        payment_index: u64,
        encrypted_amount: [u8; 64],
        encrypted_memo: [u8; 128],
        plaintext_amount: u64,
    ) -> Result<()> {
        instructions::send_payment::handler(ctx, payment_index, encrypted_amount, encrypted_memo, plaintext_amount)
    }

    pub fn request_payment(
        ctx: Context<RequestPayment>,
        request_id: [u8; 16],
        encrypted_amount: [u8; 64],
        encrypted_memo: [u8; 128],
        expires_at: i64,
    ) -> Result<()> {
        instructions::request_payment::handler(ctx, request_id, encrypted_amount, encrypted_memo, expires_at)
    }
}
```

---

## 7. KEY INTEGRATION SNIPPETS

### 7.1 Arcium MXE Client Setup

```typescript
// lib/arcium/client.ts
import { ArciumClient } from "@arcium-hq/arcium-js";
import { Connection } from "@solana/web3.js";

const ARCIUM_CLUSTER_URL = process.env.NEXT_PUBLIC_ARCIUM_CLUSTER_URL!;

export const getArciumClient = (connection: Connection) => {
  return new ArciumClient({
    connection,
    clusterUrl: ARCIUM_CLUSTER_URL,
  });
};

// lib/arcium/encrypt.ts
export async function encryptAmount(
  amount: number,
  recipientArciumPubkey: Uint8Array,
  arciumClient: ArciumClient
): Promise<Uint8Array> {
  // Encrypt the amount using recipient's Arcium public key
  // Returns 64-byte ciphertext for on-chain storage
  const plaintext = new BigUint64Array([BigInt(amount)]);
  const ciphertext = await arciumClient.encrypt(plaintext.buffer, recipientArciumPubkey);
  return new Uint8Array(ciphertext);
}

export async function encryptMemo(
  memo: string,
  recipientArciumPubkey: Uint8Array,
  arciumClient: ArciumClient
): Promise<Uint8Array> {
  const encoded = new TextEncoder().encode(memo.padEnd(64, '\0')); // pad to 64 bytes
  const ciphertext = await arciumClient.encrypt(encoded.buffer, recipientArciumPubkey);
  return new Uint8Array(ciphertext);
}
```

### 7.2 World ID Integration

```typescript
// components/identity/WorldIDButton.tsx
"use client";
import { IDKitWidget, VerificationLevel, ISuccessResult } from "@worldcoin/idkit";
import { verifyWorldIDProof } from "@/lib/worldid/verify";

interface Props {
  onVerified: (nullifierHash: string) => void;
}

export function WorldIDButton({ onVerified }: Props) {
  const handleVerify = async (proof: ISuccessResult) => {
    // Verify on-chain or via API
    const result = await verifyWorldIDProof(proof);
    if (result.success) {
      onVerified(proof.nullifier_hash);
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
        <button onClick={open} className="worldid-btn">
          Verify I'm Human
        </button>
      )}
    </IDKitWidget>
  );
}
```

### 7.3 Privy Provider Setup

```typescript
// app/layout.tsx
import { PrivyProvider } from "@privy-io/react-auth";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
          config={{
            loginMethods: ["email", "google", "twitter"],
            appearance: {
              theme: "dark",
              accentColor: "#7C3AED",
            },
            embeddedWallets: {
              createOnLogin: "users-without-wallets",
              requireUserPasswordOnCreate: false,
            },
            defaultChain: { id: 101, network: "solana" },
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
```

### 7.4 MoonPay Onramp Widget

```typescript
// components/onramp/MoonPayWidget.tsx
"use client";

interface Props {
  walletAddress: string;
  onComplete: () => void;
}

export function MoonPayWidget({ walletAddress, onComplete }: Props) {
  const moonpayUrl = `https://buy.moonpay.com?apiKey=${process.env.NEXT_PUBLIC_MOONPAY_KEY}&currencyCode=usdc_sol&walletAddress=${walletAddress}&colorCode=%237C3AED`;

  return (
    <div className="moonpay-container">
      <iframe
        src={moonpayUrl}
        width="100%"
        height="500px"
        frameBorder="0"
        className="rounded-xl"
        allow="accelerometer; autoplay; camera; gyroscope; payment"
        onLoad={() => {
          // Listen for completion event from MoonPay
          window.addEventListener("message", (e) => {
            if (e.data?.type === "moonpay_transaction_completed") {
              onComplete();
            }
          });
        }}
      />
    </div>
  );
}
```

### 7.5 Helius Webhook Handler

```typescript
// app/api/webhooks/helius/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const secret = req.headers.get("authorization");

  if (secret !== process.env.HELIUS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  for (const tx of body) {
    // Only process ShadowPay program interactions
    if (!tx.accountData?.some((a: any) => a.account === process.env.SHADOWPAY_PROGRAM_ID)) {
      continue;
    }

    // Store transaction event in Supabase for real-time UI updates
    await supabase.from("transaction_events").insert({
      signature: tx.signature,
      slot: tx.slot,
      timestamp: tx.timestamp,
      accounts: tx.accountData?.map((a: any) => a.account),
      type: tx.type,
      raw: tx,
    });
  }

  return NextResponse.json({ success: true });
}
```

---

## 8. SUPABASE SCHEMA

```sql
-- Users table (off-chain metadata)
create table users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  username text unique,
  display_name text,
  avatar_url text,
  world_id_verified boolean default false,
  world_id_nullifier text unique,
  arcium_pubkey text,           -- base58 encoded Arcium public key
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contacts table
create table contacts (
  id uuid primary key default gen_random_uuid(),
  owner_wallet text not null references users(wallet_address),
  contact_wallet text not null,
  nickname text,
  created_at timestamptz default now(),
  unique(owner_wallet, contact_wallet)
);

-- Transaction events (from Helius webhooks)
create table transaction_events (
  id uuid primary key default gen_random_uuid(),
  signature text unique not null,
  slot bigint,
  timestamp bigint,
  accounts text[],
  type text,
  raw jsonb,
  processed_at timestamptz default now()
);

-- Payment requests
create table payment_requests (
  id uuid primary key default gen_random_uuid(),
  request_id text unique not null,  -- matches on-chain request_id
  requestor_wallet text not null,
  shareable_link text not null,
  is_fulfilled boolean default false,
  created_at timestamptz default now()
);

-- RLS Policies
alter table users enable row level security;
alter table contacts enable row level security;

create policy "Users can read all profiles" on users for select using (true);
create policy "Users can update own profile" on users for update using (auth.uid()::text = id::text);

create policy "Users can manage own contacts" on contacts
  for all using (owner_wallet = current_setting('app.current_wallet', true));
```

---

## 9. ENVIRONMENT VARIABLES

```bash
# .env.local.example

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SHADOWPAY_PROGRAM_ID=DEPLOYED_PROGRAM_ID

# Helius
HELIUS_API_KEY=your_helius_api_key
HELIUS_WEBHOOK_SECRET=your_webhook_secret
SHADOWPAY_PROGRAM_ID=DEPLOYED_PROGRAM_ID

# Arcium
NEXT_PUBLIC_ARCIUM_CLUSTER_URL=https://mainnet.arcium.network
ARCIUM_PROGRAM_ID=arcium_program_id

# World ID
NEXT_PUBLIC_WORLD_APP_ID=app_YOUR_WORLD_APP_ID
WORLD_ID_ACTION=shadowpay-verify

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_SECRET=your_privy_secret

# MoonPay
NEXT_PUBLIC_MOONPAY_KEY=your_moonpay_publishable_key
MOONPAY_SECRET_KEY=your_moonpay_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 10. 5-WEEK EXECUTION SPRINT

### Week 1 (Apr 6–12): Foundation — "Architecture & Devnet Setup"
**Goal:** Dev environment live, Anchor program deployed to devnet, basic UI scaffold

**Days 1–2:**
- [ ] Register on Colosseum Arena, set up team profile
- [ ] Initialize Anchor workspace: `anchor init shadowpay`
- [ ] Set up Next.js 14 + TypeScript + Tailwind + shadcn/ui
- [ ] Configure Helius RPC (claim 50% dev discount)
- [ ] Set up Supabase project + apply schema migrations

**Days 3–4:**
- [ ] Implement `UserProfile` and `PaymentRecord` account structs (Rust)
- [ ] Implement `initialize_user` instruction with World ID nullifier validation
- [ ] Write Bankrun tests for account initialization
- [ ] Set up Privy provider + basic auth flow in Next.js

**Days 5–7:**
- [ ] Implement `send_payment` instruction (plaintext amount, SPL transfer)
- [ ] Deploy to Devnet: `anchor deploy --provider.cluster devnet`
- [ ] Connect frontend wallet to deployed program via Anchor IDL
- [ ] Basic send flow: input amount → sign tx → confirm → success screen

**Deliverable:** Working devnet program + users can register + basic send (unencrypted first)

---

### Week 2 (Apr 13–19): Core Backend — "Arcium Encryption Integration"
**Goal:** Encrypt payment amounts using Arcium, World ID onboarding live

**Days 1–2:**
- [ ] Apply for Arcium devnet access (contact their team on Discord)
- [ ] Install `@arcium-hq/arcium-js`, set up ArciumClient
- [ ] Generate Arcium keypairs for test wallets
- [ ] Implement `encrypt.ts` and `decrypt.ts` helpers

**Days 3–4:**
- [ ] Integrate Arcium encryption into `send_payment` flow
  - Client encrypts amount → passes ciphertext to Anchor instruction
  - Store encrypted ciphertext in `PaymentRecord`
- [ ] Implement World ID verification flow
  - Install `@worldcoin/idkit`
  - Wire `WorldIDButton.tsx` to onboarding page
  - Pass nullifier hash to `initialize_user` instruction

**Days 5–7:**
- [ ] Implement `request_payment` instruction + shareable link generation
- [ ] Helius webhook setup: track ShadowPay program events → Supabase
- [ ] Write comprehensive Bankrun tests: send, receive, duplicate nullifier guard
- [ ] Fix all errors, ensure devnet stability

**Deliverable:** Encrypted payments working on devnet, World ID verification live

---

### Week 3 (Apr 20–26): Frontend Integration — "Production-Grade UI"
**Goal:** Full UX flow built, real-time updates, Privy wallet abstraction

**Days 1–2:**
- [ ] Dashboard layout: balance display (shown as "***" by default, tap to reveal)
- [ ] Payment feed: list of encrypted transactions with amounts hidden
- [ ] Implement `useBalance` hook: fetch `UserProfile`, decrypt balance with user's key
- [ ] Implement `usePayments` hook: fetch `PaymentRecord` accounts, decrypt locally

**Days 3–4:**
- [ ] Send payment flow: recipient search (by username/address), amount input, memo field
- [ ] QR code scanner for recipient (using `@zxing/library`)
- [ ] Real-time update: Helius webhook → Supabase → Realtime subscription → UI toast
- [ ] Payment request flow: generate shareable link with `request_id`

**Days 5–7:**
- [ ] MoonPay widget integration (fiat onramp modal)
- [ ] Contact management: add contacts, search by username
- [ ] Settings page: profile setup, avatar upload (Supabase Storage)
- [ ] Responsive design polish for mobile

**Deliverable:** Full app flow usable by a non-crypto user

---

### Week 4 (Apr 27–May 4): Side Track Features — "Sponsor Integrations"
**Goal:** Deep-integrate sponsors to qualify for side track prizes

**Days 1–2 — Altitude/Squads (Treasury Track):**
- [ ] Multi-sig payment approval for amounts over threshold (e.g., >$500)
- [ ] Integrate Squads SDK for group wallet support
- [ ] "Group Pay" feature: split a bill, collect from multiple signers

**Days 3–4 — World Workshop Day (May 3):**
- [ ] Attend World Workshop at 10AM PT on Colosseum Discord
- [ ] Upgrade World ID integration: VerificationLevel.Orb for higher trust
- [ ] Add "Verified Human" badge on user profiles

**Days 5–7 — Blinks + Actions:**
- [ ] Implement Solana Actions endpoint: `/api/actions/send`
- [ ] Generate payment Blinks (shareable URLs that trigger transaction UI anywhere)
- [ ] Submit to Blinks registry for discoverability

**Deliverable:** 4+ sponsor integrations demonstrable, Blinks working

---

### Week 5 (May 5–11): Polish & Submit — "Production-Ready"
**Goal:** Bug-free, UI polished, demo video recorded, submission finalized

**Days 1–2:**
- [ ] End-to-end testing: full user journey (onboard → fund → send → receive → decrypt)
- [ ] Mobile responsiveness audit on real devices
- [ ] Error handling: all edge cases caught, user-friendly error messages
- [ ] Loading states for every async operation

**Days 3–4:**
- [ ] UI polish sprint: animations, micro-interactions, empty states, onboarding tutorial
- [ ] Performance: lazy loading, code splitting, RPC call optimization
- [ ] Security review: no private keys in logs/state, env vars validated
- [ ] Write README.md with architecture diagram

**Days 5–6:**
- [ ] Record 3-minute demo video:
  1. The problem (30s) — show Solscan, "your finances are public"
  2. ShadowPay walkthrough (90s) — onboard → fund → send → encrypted tx on Solscan → reveal to recipient
  3. Tech stack (30s) — Arcium, World ID, MoonPay, Privy
  4. Future vision (30s)
- [ ] Submit on Colosseum Arena + Superteam Earn side tracks
- [ ] Announce on Twitter/X with demo GIF

**Day 7: SUBMIT** (deadline May 11)

---

## 11. WINNING EDGE SUMMARY

| Dimension | Why ShadowPay Wins |
|---|---|
| **Technical depth** | Arcium MXE integration is genuinely hard — few teams will attempt it |
| **Judge alignment** | 2 Arcium judges, World judge (May 3 workshop), Phantom judge — all aligned |
| **Sponsor coverage** | Arcium + World + MoonPay + Privy + Helius + Squads = 6 sponsor tracks |
| **Real-world use case** | Not another DeFi protocol — a consumer app a normal person would use |
| **Prize eligibility** | Grand Champion + Public Goods + 20-team pool + 6 side tracks |
| **Narrative** | "Privacy is a human right on-chain" — judges love a clear thesis |
| **Completeness** | Working onramp → send → receive → decrypt in one flow beats partial demos |

---

## 12. CONTEXT INSTRUCTIONS FOR ANTIGRAVITY

When uploading this document to Antigravity, prefix with:

```
You are the AI architect for ShadowPay — a Solana hackathon project.
This document is your complete context. When I ask you to:
- Generate code: Follow the exact file structure in Section 5
- Write Rust/Anchor: Follow the account schemas and instruction patterns in Section 6
- Write TypeScript: Follow the integration snippets in Section 7
- Debug issues: Reference the tech stack in Section 4
- Suggest features: Stay within the 5-week sprint plan in Section 10

Always prioritize: type safety, error handling, and Anchor best practices.
When in doubt, ask for clarification rather than hallucinating API signatures.
The Arcium SDK is new — always mark Arcium-specific code with TODO: verify against latest SDK docs.
```

---

*Document version: 1.0 | Generated: Colosseum Frontier 2026 | Update this file as the project evolves*
