use anchor_lang::prelude::*;
use crate::state::UserProfile;
use crate::constants::SEED_USER_PROFILE;

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + UserProfile::INIT_SPACE,
        seeds = [SEED_USER_PROFILE, owner.key().as_ref()],
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
    profile.encrypted_balance = [0; 64];
    profile.payment_count = 0;
    profile.receive_count = 0;
    profile.is_verified = true;
    profile.created_at = Clock::get()?.unix_timestamp;
    profile.bump = ctx.bumps.user_profile;
    
    Ok(())
}
