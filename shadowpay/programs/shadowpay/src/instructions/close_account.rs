use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CloseAccount {}

pub fn handler(_ctx: Context<CloseAccount>) -> Result<()> {
    Ok(())
}
