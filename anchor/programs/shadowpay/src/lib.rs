use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("SHADOW_PROGRAM_ID_PLACEHOLDER");

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
        amount: u64,
        encrypted_amount: [u8; 64],
        encrypted_memo: [u8; 128],
    ) -> Result<()> {
        instructions::send_payment::handler(ctx, amount, encrypted_amount, encrypted_memo)
    }

    pub fn request_payment(
        ctx: Context<CreatePaymentRequest>,
        request_id: [u8; 16],
        encrypted_amount: [u8; 64],
        encrypted_memo: [u8; 128],
        expires_at: i64,
    ) -> Result<()> {
        instructions::request_payment::handler(ctx, request_id, encrypted_amount, encrypted_memo, expires_at)
    }
    
    pub fn close_account(ctx: Context<CloseAccount>) -> Result<()> {
        instructions::close_account::handler(ctx)
    }
}
