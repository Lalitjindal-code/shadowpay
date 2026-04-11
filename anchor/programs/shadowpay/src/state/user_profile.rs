use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    pub owner: Pubkey,               // 32 bytes — wallet pubkey
    pub world_id_nullifier: [u8; 32],// 32 bytes — World ID nullifier hash (prevents double registration)
    pub arcium_pubkey: [u8; 32],     // 32 bytes — user's Arcium encryption public key
    pub username_hash: [u8; 32],     // 32 bytes — hash of username
    pub encrypted_balance: [u8; 64], // 64 bytes — Arcium-encrypted USDC balance (ciphertext)
    pub payment_count: u64,          // 8 bytes  — total payments sent
    pub receive_count: u64,          // 8 bytes  — total payments received
    pub is_verified: bool,           // 1 byte   — World ID verified
    pub created_at: i64,             // 8 bytes  — unix timestamp
    pub bump: u8,                    // 1 byte   — PDA bump
}
