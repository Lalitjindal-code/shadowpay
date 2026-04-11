use anchor_lang::prelude::*;

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
