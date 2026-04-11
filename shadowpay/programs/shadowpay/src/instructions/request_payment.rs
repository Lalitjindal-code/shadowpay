use anchor_lang::prelude::*;
use crate::state::PaymentRequest;
use crate::constants::SEED_PAYMENT_REQUEST;

#[derive(Accounts)]
#[instruction(request_id: [u8; 16])]
pub struct CreatePaymentRequest<'info> {
    #[account(mut)]
    pub requestor: Signer<'info>,

    #[account(
        init,
        payer = requestor,
        space = 8 + PaymentRequest::INIT_SPACE,
        seeds = [SEED_PAYMENT_REQUEST, requestor.key().as_ref(), &request_id],
        bump
    )]
    pub payment_request: Account<'info, PaymentRequest>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreatePaymentRequest>,
    request_id: [u8; 16],
    encrypted_amount: [u8; 64],
    encrypted_memo: [u8; 128],
    expires_at: i64,
) -> Result<()> {
    let req = &mut ctx.accounts.payment_request;
    req.requestor = ctx.accounts.requestor.key();
    req.payer = None;
    req.encrypted_amount = encrypted_amount;
    req.encrypted_memo = encrypted_memo;
    req.is_fulfilled = false;
    req.expires_at = expires_at;
    req.request_id = request_id;
    req.bump = ctx.bumps.payment_request;
    Ok(())
}
