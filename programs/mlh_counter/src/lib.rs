use anchor_lang::prelude::*;

declare_id!("7nUsE6D9TwY3dDrASLTkyRiEgqeiW9qx8CwsJqNYC7eu");

// Data logics
#[program]
pub mod mlh_counter {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, counter_bump: u8) -> ProgramResult {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        counter.authority = ctx.accounts.authority.key();
        counter.counter_bump = counter_bump;
        Ok(())
    }
    pub fn update(ctx: Context<Update>) -> ProgramResult {
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;
        Ok(())
    }
}

// Data Validators
#[derive(Accounts)]
#[instruction(counter_bump: u8)]
pub struct Initialize<'info> {
    pub authority: Signer<'info>,
    #[account(init, seeds = [authority.key().as_ref()], bump=counter_bump, payer = authority, space =  128)]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    pub authority: Signer<'info>,
    #[account(mut, has_one = authority)]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// Data Structures
#[account]
pub struct Counter {
    pub authority: Pubkey,
    pub count: u64,
    pub counter_bump: u8,
}
