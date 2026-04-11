
# SHADOWPAY BIBLE — SECTION UPDATE
### Replace Section: Database & Realtime Infrastructure
### Stack Change: Supabase REMOVED → MongoDB Atlas + Firebase Realtime DB
### Date: April 2026

---

## PASTE THIS INTO YOUR MAIN BIBLE — REPLACE OLD SECTIONS 8, 3E, 4E-REALTIME

---

## SECTION 8 (UPDATED) — DATABASE & REALTIME STACK

### Stack Decision
```
OLD (BANNED)          NEW (APPROVED)
──────────────────────────────────────────────
Supabase Postgres  →  MongoDB Atlas (free 512MB)
Supabase Realtime  →  Firebase Realtime DB (free)
Supabase Storage   →  Uploadthing (free 2GB)
Supabase Auth      →  Privy (already in stack, no change)
Supabase Functions →  Next.js API Routes (already in stack)
```

### Why This Combination
```
MongoDB Atlas   = JSON documents, no SQL, free tier, 5 min setup
                  Perfect for: users, contacts, metadata
Firebase RTDB   = Real-time websocket subscriptions in 1 line
                  Perfect for: payment notifications, live updates
Uploadthing     = File uploads with zero config
                  Perfect for: avatar photos
```

---

## SECTION 8A — MONGODB ATLAS SETUP

### Step 1: Create Free Cluster
```
1. Go to mongodb.com/atlas
2. Sign up → Create free cluster (M0 — always free)
3. Create DB user: username + password
4. Network Access → Add IP: 0.0.0.0/0 (allow all for dev)
5. Connect → Drivers → Copy connection string
   Format: mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/shadowpay
6. Paste into MONGODB_URI in .env.local
```

### Step 2: Install
```bash
npm install mongoose
```

### Step 3: Connection (lib/db/mongodb.ts)
```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI not defined in .env.local");
}

// Cache connection across hot reloads in Next.js dev
let cached = (global as any).__mongoose ?? { conn: null, promise: null };
(global as any).__mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
```

---

## SECTION 8B — MONGODB MODELS (Full Code)

### lib/db/models/User.ts
```typescript
import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  walletAddress: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  worldIdVerified: boolean;
  worldIdNullifier?: string;
  arciumPubkey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,     // allows multiple null values
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-z0-9_]+$/, // alphanumeric + underscore only
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    avatarUrl: {
      type: String,
    },
    worldIdVerified: {
      type: Boolean,
      default: false,
    },
    worldIdNullifier: {
      type: String,
      unique: true,
      sparse: true,     // only one account per World ID
    },
    arciumPubkey: {
      type: String,     // base58 encoded Arcium encryption public key
    },
  },
  {
    timestamps: true,   // auto createdAt + updatedAt
  }
);

// Indexes for fast lookup
UserSchema.index({ username: 1 });
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ worldIdNullifier: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
```

---

### lib/db/models/Contact.ts
```typescript
import mongoose, { Document, Model } from "mongoose";

export interface IContact extends Document {
  ownerWallet: string;
  contactWallet: string;
  nickname?: string;
  createdAt: Date;
}

const ContactSchema = new mongoose.Schema<IContact>(
  {
    ownerWallet: {
      type: String,
      required: true,
      index: true,
    },
    contactWallet: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      trim: true,
      maxlength: 30,
    },
  },
  { timestamps: true }
);

// Prevent duplicate contacts
ContactSchema.index({ ownerWallet: 1, contactWallet: 1 }, { unique: true });

export const Contact: Model<IContact> =
  mongoose.models.Contact ||
  mongoose.model<IContact>("Contact", ContactSchema);
```

---

### lib/db/models/TransactionEvent.ts
```typescript
import mongoose, { Document, Model } from "mongoose";

export interface ITransactionEvent extends Document {
  signature: string;
  slot: number;
  timestamp: number;
  programId: string;
  accounts: string[];
  instructionType: "initializeUser" | "sendPayment" | "requestPayment" | "unknown";
  sender?: string;
  recipient?: string;
  raw: Record<string, any>;
  processedAt: Date;
}

const TransactionEventSchema = new mongoose.Schema<ITransactionEvent>(
  {
    signature: {
      type: String,
      required: true,
      unique: true,
    },
    slot: Number,
    timestamp: Number,
    programId: String,
    accounts: [String],
    instructionType: {
      type: String,
      enum: ["initializeUser", "sendPayment", "requestPayment", "unknown"],
      default: "unknown",
    },
    sender: String,
    recipient: String,
    raw: mongoose.Schema.Types.Mixed,
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

TransactionEventSchema.index({ signature: 1 });
TransactionEventSchema.index({ sender: 1, timestamp: -1 });
TransactionEventSchema.index({ recipient: 1, timestamp: -1 });

export const TransactionEvent: Model<ITransactionEvent> =
  mongoose.models.TransactionEvent ||
  mongoose.model<ITransactionEvent>("TransactionEvent", TransactionEventSchema);
```

---

### lib/db/models/PaymentRequest.ts
```typescript
import mongoose, { Document, Model } from "mongoose";

export interface IPaymentRequest extends Document {
  requestId: string;          // matches on-chain [u8; 16] request_id
  requestorWallet: string;
  shareableLink: string;
  isFulfilled: boolean;
  fulfilledByWallet?: string;
  expiresAt: Date;
  createdAt: Date;
}

const PaymentRequestSchema = new mongoose.Schema<IPaymentRequest>(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
    },
    requestorWallet: {
      type: String,
      required: true,
      index: true,
    },
    shareableLink: {
      type: String,
      required: true,
    },
    isFulfilled: {
      type: Boolean,
      default: false,
    },
    fulfilledByWallet: String,
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const PaymentRequest: Model<IPaymentRequest> =
  mongoose.models.PaymentRequest ||
  mongoose.model<IPaymentRequest>("PaymentRequest", PaymentRequestSchema);
```

---

## SECTION 8C — MONGODB API ROUTES (Full Code)

### app/api/users/route.ts
```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/db/models/User";

// GET /api/users?wallet=8xKj... OR ?username=lalit123
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  const username = searchParams.get("username");
  const query = searchParams.get("query"); // for search

  try {
    if (wallet) {
      const user = await User.findOne({ walletAddress: wallet });
      if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(user);
    }

    if (username) {
      const user = await User.findOne({ username: username.toLowerCase() });
      if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(user);
    }

    if (query) {
      // Search by username prefix (for send form autocomplete)
      const users = await User.find({
        username: { $regex: `^${query.toLowerCase()}`, $options: "i" },
      })
        .select("walletAddress username displayName avatarUrl worldIdVerified")
        .limit(5);
      return NextResponse.json(users);
    }

    return NextResponse.json({ error: "Provide wallet, username, or query param" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/users — Create or update user profile
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { walletAddress, username, displayName, avatarUrl, arciumPubkey } = body;

  if (!walletAddress) {
    return NextResponse.json({ error: "walletAddress required" }, { status: 400 });
  }

  try {
    const user = await User.findOneAndUpdate(
      { walletAddress },
      {
        $set: {
          ...(username && { username: username.toLowerCase() }),
          ...(displayName && { displayName }),
          ...(avatarUrl && { avatarUrl }),
          ...(arciumPubkey && { arciumPubkey }),
        },
        $setOnInsert: { walletAddress },
      },
      { upsert: true, new: true, runValidators: true }
    );
    return NextResponse.json(user);
  } catch (error: any) {
    // Handle duplicate username
    if (error.code === 11000) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

### app/api/contacts/route.ts
```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Contact } from "@/lib/db/models/Contact";
import { User } from "@/lib/db/models/User";

// GET /api/contacts?wallet=8xKj...
export async function GET(req: NextRequest) {
  await connectDB();
  const wallet = new URL(req.url).searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

  // Fetch contacts + join with user profiles
  const contacts = await Contact.find({ ownerWallet: wallet });
  const contactWallets = contacts.map((c) => c.contactWallet);
  const profiles = await User.find({ walletAddress: { $in: contactWallets } })
    .select("walletAddress username displayName avatarUrl worldIdVerified");

  const profileMap = Object.fromEntries(profiles.map((p) => [p.walletAddress, p]));

  const result = contacts.map((c) => ({
    id: c._id,
    contactWallet: c.contactWallet,
    nickname: c.nickname,
    ...profileMap[c.contactWallet],
  }));

  return NextResponse.json(result);
}

// POST /api/contacts — Add contact
export async function POST(req: NextRequest) {
  await connectDB();
  const { ownerWallet, contactWallet, nickname } = await req.json();

  try {
    const contact = await Contact.create({ ownerWallet, contactWallet, nickname });
    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Contact already added" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/contacts?owner=X&contact=Y
export async function DELETE(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  await Contact.deleteOne({
    ownerWallet: searchParams.get("owner"),
    contactWallet: searchParams.get("contact"),
  });
  return NextResponse.json({ success: true });
}
```

---

### app/api/worldid/verify/route.ts (Updated — MongoDB)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/db/models/User";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    merkle_root,
    nullifier_hash,
    proof,
    verification_level,
    walletAddress, // pass wallet as signal from frontend
  } = body;

  // 1. Verify with World ID cloud API
  const verifyRes = await fetch(
    `https://developer.worldcoin.org/api/v1/verify/${process.env.NEXT_PUBLIC_WORLD_APP_ID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merkle_root,
        nullifier_hash,
        proof,
        verification_level,
        action: "shadowpay-verify",
        signal: walletAddress,
      }),
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyRes.ok) {
    return NextResponse.json(
      { success: false, error: verifyData.detail ?? "Verification failed" },
      { status: 400 }
    );
  }

  // 2. Check nullifier not already used (duplicate account prevention)
  await connectDB();
  const existingUser = await User.findOne({ worldIdNullifier: nullifier_hash });

  if (existingUser && existingUser.walletAddress !== walletAddress) {
    return NextResponse.json(
      { success: false, error: "This World ID is already linked to another account" },
      { status: 409 }
    );
  }

  // 3. Update user in MongoDB
  await User.findOneAndUpdate(
    { walletAddress },
    {
      $set: {
        worldIdVerified: true,
        worldIdNullifier: nullifier_hash,
      },
    },
    { upsert: true }
  );

  return NextResponse.json({
    success: true,
    nullifier_hash,
    verification_level,
  });
}
```

---

### app/api/webhooks/helius/route.ts (Updated — MongoDB)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { TransactionEvent } from "@/lib/db/models/TransactionEvent";
import { notifyPayment } from "@/lib/realtime/firebase";

const PROGRAM_ID = process.env.NEXT_PUBLIC_SHADOWPAY_PROGRAM_ID!;

export async function POST(req: NextRequest) {
  // Verify Helius webhook secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== process.env.HELIUS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await req.json();
  await connectDB();

  for (const event of events) {
    // Only process ShadowPay program events
    const isShadowPay = event.instructions?.some(
      (ix: any) => ix.programId === PROGRAM_ID
    );
    if (!isShadowPay) continue;

    // Detect instruction type from logs
    const logs: string[] = event.logs ?? [];
    let instructionType: ITransactionEvent["instructionType"] = "unknown";
    if (logs.some((l: string) => l.includes("initialize_user"))) instructionType = "initializeUser";
    else if (logs.some((l: string) => l.includes("send_payment"))) instructionType = "sendPayment";
    else if (logs.some((l: string) => l.includes("request_payment"))) instructionType = "requestPayment";

    // Extract sender + recipient from token transfers
    const tokenTransfer = event.tokenTransfers?.[0];
    const sender = tokenTransfer?.fromUserAccount;
    const recipient = tokenTransfer?.toUserAccount;

    try {
      // Store in MongoDB
      await TransactionEvent.findOneAndUpdate(
        { signature: event.signature },
        {
          $setOnInsert: {
            signature: event.signature,
            slot: event.slot,
            timestamp: event.timestamp,
            programId: PROGRAM_ID,
            accounts: event.accountData?.map((a: any) => a.account) ?? [],
            instructionType,
            sender,
            recipient,
            raw: event,
          },
        },
        { upsert: true }
      );

      // Fire Firebase realtime notification to recipient
      if (instructionType === "sendPayment" && recipient) {
        await notifyPayment(recipient, {
          type: "payment_received",
          signature: event.signature,
          timestamp: event.timestamp,
        });
      }
    } catch (error: any) {
      // Skip duplicates (E11000)
      if (error.code !== 11000) console.error("Webhook error:", error);
    }
  }

  return NextResponse.json({ success: true });
}
```

---

## SECTION 8D — FIREBASE REALTIME DB SETUP

### Step 1: Create Firebase Project
```
1. Go to console.firebase.google.com
2. Create project → "shadowpay"
3. Realtime Database → Create database → Start in test mode
4. Copy config object (Project Settings → Your apps → Web)
5. Copy Database URL: https://shadowpay-xxx-default-rtdb.firebaseio.com
```

### Step 2: Install
```bash
npm install firebase
```

### Step 3: Firebase Config (lib/realtime/firebase.ts)
```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, set, onValue, off, push } from "firebase/database";

const firebaseConfig = {
  apiKey:      process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL!,
  projectId:   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

// Prevent duplicate initialization in Next.js
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

// ─── WRITE ────────────────────────────────────────────────────

// Called from Helius webhook handler (server-side)
export async function notifyPayment(
  recipientWallet: string,
  data: {
    type: "payment_received" | "request_fulfilled";
    signature: string;
    timestamp: number;
  }
) {
  // Sanitize wallet address for Firebase key (no dots allowed)
  const safeKey = recipientWallet.replace(/\./g, "_");

  // Push to list (keeps history of notifications)
  const notifRef = ref(db, `notifications/${safeKey}`);
  await set(ref(db, `notifications/${safeKey}/latest`), {
    ...data,
    readAt: null,
    createdAt: Date.now(),
  });
}

// ─── READ (client-side hooks) ──────────────────────────────────

// Subscribe to payment notifications for a wallet
// Returns unsubscribe function
export function subscribeToPayments(
  walletAddress: string,
  callback: (data: {
    type: string;
    signature: string;
    timestamp: number;
  }) => void
): () => void {
  const safeKey = walletAddress.replace(/\./g, "_");
  const notifRef = ref(db, `notifications/${safeKey}/latest`);

  onValue(notifRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });

  // Return cleanup function
  return () => off(notifRef);
}
```

---

### Step 4: useRealtimePayments Hook (Updated — Firebase)
```typescript
// hooks/useRealtimePayments.ts
"use client";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeToPayments } from "@/lib/realtime/firebase";
import toast from "react-hot-toast";

export function useRealtimePayments(walletAddress?: string) {
  const queryClient = useQueryClient();
  const lastSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!walletAddress) return;

    const unsubscribe = subscribeToPayments(walletAddress, (data) => {
      // Prevent duplicate notifications (Firebase fires on subscribe too)
      if (data.signature === lastSignatureRef.current) return;
      lastSignatureRef.current = data.signature;

      // Invalidate queries → triggers refetch
      queryClient.invalidateQueries({ queryKey: ["payments", walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["balance", walletAddress] });

      // Show toast
      if (data.type === "payment_received") {
        toast.custom(
          (t) => (
            <div
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                bg-[#1a1a24] border border-purple-500/20
                shadow-xl transition-all duration-300
                ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
              `}
            >
              <span className="text-2xl">🔒</span>
              <div>
                <p className="text-sm font-medium text-white">
                  Private payment received
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  Tap to reveal amount
                </p>
              </div>
            </div>
          ),
          { duration: 5000, position: "top-right" }
        );
      }
    });

    return unsubscribe; // cleanup on unmount
  }, [walletAddress, queryClient]);
}
```

---

## SECTION 8E — FILE UPLOAD (Uploadthing)

### Step 1: Setup
```bash
npm install uploadthing @uploadthing/react
# Go to uploadthing.com → create app → get keys
```

### Step 2: File Router (app/api/uploadthing/core.ts)
```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Get wallet from request header (set by frontend)
      const wallet = req.headers.get("x-wallet-address");
      if (!wallet) throw new Error("Unauthorized");
      return { walletAddress: wallet };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update user avatarUrl in MongoDB
      const { connectDB } = await import("@/lib/db/mongodb");
      const { User } = await import("@/lib/db/models/User");
      await connectDB();
      await User.findOneAndUpdate(
        { walletAddress: metadata.walletAddress },
        { $set: { avatarUrl: file.url } }
      );
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

### Step 3: API Route (app/api/uploadthing/route.ts)
```typescript
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
```

### Step 4: Avatar Upload Component
```typescript
// components/settings/AvatarUpload.tsx
"use client";
import { useUploadThing } from "@uploadthing/react";
import { useState } from "react";

interface Props {
  walletAddress: string;
  currentAvatar?: string;
  onUploadComplete: (url: string) => void;
}

export function AvatarUpload({ walletAddress, currentAvatar, onUploadComplete }: Props) {
  const [preview, setPreview] = useState(currentAvatar);

  const { startUpload, isUploading } = useUploadThing("avatarUploader", {
    headers: { "x-wallet-address": walletAddress },
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url;
      if (url) {
        setPreview(url);
        onUploadComplete(url);
      }
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    startUpload([file]);
  };

  return (
    <label className="relative cursor-pointer group">
      <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 
                      border-2 border-white/10 group-hover:border-purple-500/50
                      transition-colors">
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            👤
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent 
                            rounded-full animate-spin" />
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={isUploading}
      />
    </label>
  );
}
```

---

## SECTION 8F — UPDATED .env.local (Complete)

```bash
# ─── SOLANA ────────────────────────────────────────────────────
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SHADOWPAY_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID

# ─── HELIUS ────────────────────────────────────────────────────
HELIUS_API_KEY=your_helius_api_key
HELIUS_WEBHOOK_SECRET=make_a_random_string_here_32chars

# ─── MONGODB ATLAS ─────────────────────────────────────────────
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/shadowpay

# ─── FIREBASE REALTIME DB ──────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=shadowpay-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DB_URL=https://shadowpay-xxx-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=shadowpay-xxx

# ─── ARCIUM ────────────────────────────────────────────────────
NEXT_PUBLIC_ARCIUM_CLUSTER_URL=https://devnet.arcium.network

# ─── WORLD ID ──────────────────────────────────────────────────
NEXT_PUBLIC_WORLD_APP_ID=app_YOUR_WORLD_APP_ID
WORLD_ID_ACTION=shadowpay-verify

# ─── PRIVY ─────────────────────────────────────────────────────
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_SECRET=your_privy_secret_key

# ─── MOONPAY ───────────────────────────────────────────────────
NEXT_PUBLIC_MOONPAY_KEY=pk_test_your_publishable_key
MOONPAY_SECRET_KEY=sk_test_your_secret_key

# ─── UPLOADTHING ───────────────────────────────────────────────
UPLOADTHING_SECRET=sk_live_your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# ─── APP URL ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Change to: https://shadowpay.vercel.app after deployment
```

---

## SECTION 8G — UPDATED FILE STRUCTURE (DB FILES ONLY)

```
lib/
├── db/
│   ├── mongodb.ts                ← Connection + cache
│   └── models/
│       ├── User.ts               ← User profiles
│       ├── Contact.ts            ← Address book
│       ├── TransactionEvent.ts   ← Helius webhook events
│       └── PaymentRequest.ts     ← Payment request links
│
├── realtime/
│   └── firebase.ts               ← notifyPayment() + subscribeToPayments()
│
└── storage/
    └── uploadthing.ts            ← File upload client

app/
├── api/
│   ├── users/
│   │   └── route.ts              ← GET + POST user profiles
│   ├── contacts/
│   │   └── route.ts              ← GET + POST + DELETE contacts
│   ├── worldid/
│   │   └── verify/route.ts       ← World ID verification + MongoDB update
│   ├── webhooks/
│   │   └── helius/route.ts       ← Helius events → MongoDB + Firebase
│   └── uploadthing/
│       ├── core.ts               ← File router definition
│       └── route.ts              ← API route handler

hooks/
└── useRealtimePayments.ts        ← Firebase subscription hook
```

---

## SECTION 8H — PACKAGE.JSON DEPENDENCIES (DB Related)

```json
{
  "dependencies": {
    "mongoose": "^8.3.0",
    "firebase": "^10.11.0",
    "uploadthing": "^6.10.0",
    "@uploadthing/react": "^6.10.0"
  }
}
```

```bash
# Install all at once
npm install mongoose firebase uploadthing @uploadthing/react
```

---

## SECTION 8I — QUICK SETUP CHECKLIST

```
MongoDB Atlas Setup (5 min)
  [ ] Go to mongodb.com/atlas → sign up
  [ ] Create free M0 cluster
  [ ] Database Access → Add user (username + password)
  [ ] Network Access → Add IP 0.0.0.0/0
  [ ] Connect → Drivers → Copy connection string
  [ ] Paste into MONGODB_URI in .env.local
  [ ] npm install mongoose
  [ ] Test: node -e "require('mongoose').connect(process.env.MONGODB_URI)"

Firebase Setup (3 min)
  [ ] Go to console.firebase.google.com → New project
  [ ] Build → Realtime Database → Create database
  [ ] Rules → Set: { "rules": { ".read": true, ".write": true } } (dev only)
  [ ] Project Settings → Your apps → Add web app
  [ ] Copy firebaseConfig object
  [ ] Copy Database URL
  [ ] Paste all into .env.local
  [ ] npm install firebase

Uploadthing Setup (2 min)
  [ ] Go to uploadthing.com → sign up → create app
  [ ] Copy UPLOADTHING_SECRET + UPLOADTHING_APP_ID
  [ ] Paste into .env.local
  [ ] npm install uploadthing @uploadthing/react

Total setup time: ~10 minutes
```

---

## SECTION 8J — ANTIGRAVITY CONTEXT ADDITION

**Add this block to Section 7 (Antigravity Context) in main Bible:**

```
DATABASE STACK (Supabase is BANNED — do not use it):
  Database    : MongoDB Atlas via Mongoose ODM
  Realtime    : Firebase Realtime Database
  File upload : Uploadthing

MONGODB RULES:
  - Always call connectDB() at top of every API route
  - Use findOneAndUpdate with upsert:true for create-or-update patterns
  - Error code 11000 = duplicate key → return 409 Conflict
  - All models are in lib/db/models/ — import from there

FIREBASE RULES:
  - notifyPayment() is called from Helius webhook handler (server-side)
  - subscribeToPayments() is called from useRealtimePayments hook (client-side)
  - Sanitize wallet addresses: replace . with _ for Firebase keys
  - Always return the unsubscribe function from useEffect for cleanup

UPLOADTHING RULES:
  - Avatar uploads only
  - Max 2MB per file
  - Pass wallet address via x-wallet-address header

DO NOT generate any Supabase code — it is banned.
DO NOT use supabase client, createClient, or any @supabase/* package.
```

---

*Section Update v1.0 — MongoDB + Firebase + Uploadthing*
*Replaces: Supabase (all references)*
*Paste into: SHADOWPAY_COMPLETE_BIBLE.md — Sections 8, 3E, 4E-Realtime*