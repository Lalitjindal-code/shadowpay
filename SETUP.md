# ShadowPay — Local Setup Guide

## Step 1: Get Your API Keys

### Helius (Solana RPC)
1. Go to helius.dev
2. Sign up free
3. Create new app
4. Copy API Key
5. Paste into: HELIUS_API_KEY and NEXT_PUBLIC_SOLANA_RPC_URL

### MongoDB Atlas (Database)
1. Go to mongodb.com/atlas
2. Sign up free — choose M0 (free tier)
3. Create cluster
4. Database Access → Add user
5. Network Access → Add 0.0.0.0/0
6. Connect → Drivers → Copy connection string
7. Replace <password> with your password
8. Paste into: MONGODB_URI

### Firebase (Realtime Notifications)
1. Go to console.firebase.google.com
2. Create project → "shadowpay"
3. Build → Realtime Database → Create database
4. Start in test mode
5. Project Settings → Your apps → Add web app
6. Copy the firebaseConfig values:
   - apiKey → NEXT_PUBLIC_FIREBASE_API_KEY
   - authDomain → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - databaseURL → NEXT_PUBLIC_FIREBASE_DB_URL
   - projectId → NEXT_PUBLIC_FIREBASE_PROJECT_ID

### Privy (Auth + Embedded Wallet)
1. Go to privy.io
2. Sign up → Create new app
3. Name: ShadowPay
4. Settings → Copy App ID → NEXT_PUBLIC_PRIVY_APP_ID
5. Settings → API Keys → Copy Secret → PRIVY_SECRET
6. Settings → Allowed Origins → Add http://localhost:3000

### World ID (Sybil Resistance)
1. Go to developer.worldcoin.org
2. Sign up → Create new app
3. Name: ShadowPay
4. Action: shadowpay-verify
5. Copy App ID → NEXT_PUBLIC_WORLD_APP_ID

### Uploadthing (Avatar Uploads)
1. Go to uploadthing.com
2. Sign up free → Create app
3. Copy Secret → UPLOADTHING_SECRET
4. Copy App ID → UPLOADTHING_APP_ID

### MoonPay (Fiat Onramp) — Do this last
1. Go to moonpay.com/business
2. Sign up → Apply for sandbox access
3. Copy publishable key → NEXT_PUBLIC_MOONPAY_KEY
4. Copy secret key → MOONPAY_SECRET_KEY

## Step 2: Run the Project

### Frontend
cd web
npm install
npm run dev
Open http://localhost:3000

### Anchor Program (Requires WSL2 on Windows)
cd anchor
anchor build
anchor deploy --provider.cluster devnet

## Step 3: Verify Everything Works
- [ ] localhost:3000 loads
- [ ] Login with email works (Privy)
- [ ] MongoDB connected (check /api/users)
- [ ] Firebase connected (check browser console)
- [ ] Anchor program deployed (check Program ID)
