use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{UserProfile, PaymentRecord};
use crate::constants::SEED_PAYMENT_RECORD;
use crate::errors::ShadowPayError;

#[derive(Accounts)]
pub struct SendPayment<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    
    #[account(
        mut,
        constraint = sender_profile.owner == sender.key(),
        constraint = sender_profile.is_verified == true @ ShadowPayError::NotVerified
    )]
    pub sender_profile: Account<'info, UserProfile>,
    
    /// CHECK: Validated via logic/CPI
    #[account(mut)]
    pub recipient: AccountInfo<'info>,

    #[account(mut)]
    pub recipient_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = sender,
        space = 8 + PaymentRecord::INIT_SPACE,
        seeds = [SEED_PAYMENT_RECORD, sender.key().as_ref(), &sender_profile.payment_count.to_le_bytes()],
        bump
    )]
    pub payment_record: Account<'info, PaymentRecord>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SendPayment>,
    amount: u64,
    encrypted_amount: [u8; 64],
    encrypted_memo: [u8; 128],
) -> Result<()> {
    // 1. Transfer SPL Tokens
    let cpi_accounts = Transfer {
        from: ctx.accounts.sender_token_account.to_account_info(),
        to: ctx.accounts.recipient_token_account.to_account_info(),
        authority: ctx.accounts.sender.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    // 2. Log Payment Record
    let record = &mut ctx.accounts.payment_record;
    record.sender = ctx.accounts.sender.key();
    record.recipient = ctx.accounts.recipient.key();
    record.encrypted_amount = encrypted_amount;
    record.encrypted_memo = encrypted_memo;
    record.token_mint = ctx.accounts.sender_token_account.mint;
    record.timestamp = Clock::get()?.unix_timestamp;
    record.payment_index = ctx.accounts.sender_profile.payment_count;
    record.bump = ctx.bumps.payment_record;

    // 3. Update Profiles
    ctx.accounts.sender_profile.payment_count = ctx.accounts.sender_profile.payment_count.checked_add(1).unwrap();
    ctx.accounts.recipient_profile.receive_count = ctx.accounts.recipient_profile.receive_count.checked_add(1).unwrap();

    Ok(())
}
