# 🔒 ShadowPay

**Private-by-default P2P payments on Solana.**

ShadowPay is a precision-engineered consumer payments application built for the Solana ecosystem. It combines the speed of Solana with advanced privacy-preserving computation to ensure that your financial activity remains your business.

---

## 🚀 Vision

In a world of total blockchain transparency, ShadowPay provides a "Venmo-style" experience where:
- **Balances are Private**: No one can scout your wallet balance on Solscan.
- **Amounts are Confidential**: Transaction values are encrypted using **Arcium's** Multi-Party Computation (MPC).
- **Identity is Human**: Integrated with **World ID** for sybil-resistance (one human, one account).
- **UX is Seamless**: Onboard via **Privy** (email/social) and fund via **MoonPay** fiat onramp.

---

## 🏗️ Project Structure

This is a monorepo organized for clarity and scalability:

- **[`web/`](./web)**: Next.js 15 frontend application (Frontend-as-a-Service architecture).
- **[`anchor/`](./anchor)**: Anchor (Rust) smart contracts and test suites.
- **[`docs/`](./docs)**: Technical deep-dives, master context, and database schemas.

---

## 🛠️ Tech Stack

### Privacy & Computation
- **[Arcium](https://arcium.com/)**: Encrypted Computation Network for confidential state.
- **[Solana](https://solana.com/)**: High-speed L1 for near-instant settlement.

### Identity & UX
- **[World ID](https://worldcoin.org/world-id)**: Proof of Personhood to prevent bots.
- **[Privy](https://www.privy.io/)**: Embedded wallets and social onboarding.
- **[MoonPay](https://www.moonpay.com/)**: Native fiat-to-crypto onramp.

### Infrastructure
- **[Helius](https://helius.dev/)**: RPC and Webhook infrastructure for real-time events.
- **Supabase**: Off-chain metadata (usernames, avatars, contacts).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- Anchor CLI 0.30+
- Solana CLI 1.18+
- Rust 1.75+

### Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/Lalitjindal-code/shadowpay.git
   cd shadowpay
   ```

2. **Setup Anchor:**
   ```bash
   cd anchor
   anchor build
   anchor test
   ```

3. **Setup Web:**
   ```bash
   cd web
   npm install
   npm run dev
   ```

---

## 📜 Documentation

For more detailed information, check the **[`/docs`](./docs)** folder:
- [Master Context Document](./docs/SHADOWPAY_MASTER_CONTEXT.md)
- [Database Updates](./docs/SHADOWPAY_DB_UPDATE.md)
- [ShadowPay Bible](./docs/SHADOWPAY_COMPLETE_BIBLE.md)

---

## ⚖️ License

MIT License - see [LICENSE](LICENSE) for details.
