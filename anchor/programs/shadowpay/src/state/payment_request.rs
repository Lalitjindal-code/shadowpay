use anchor_lang::prelude::*;

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
