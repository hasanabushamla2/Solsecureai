use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::{
    Mint,
    TokenAccount,
    TokenInterface
}};

use crate::{error::ErrorSol, Challenge, ChallengeStatus};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateChallenge<'info> {
    #[account(mut)]
    pub company: Signer<'info>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer=company,
        space=8+Challenge::INIT_SPACE,
        seeds = [
            b"challenge",
            company.key().as_ref(),
            id.to_le_bytes().as_ref()
        ],
        bump,
    )]
    pub challenge: Account<'info, Challenge>,

    #[account(
        init_if_needed,
        payer=company,
        associated_token::mint=token_mint,
        associated_token::authority=challenge,
        associated_token::token_program=token_program,
    )]
    pub vault: Box<InterfaceAccount<'info, TokenAccount>>,


    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>
}

pub fn handle_create_challenge(
    ctx: Context<CreateChallenge>,
    id: u64,
    prize: u64,
    start_time: i64,
    end_time: i64,
    secret_hash: [u8; 32],
) -> Result<()>{
    let challenge = &mut ctx.accounts.challenge;

    challenge.id = id;
    require!(prize>0,ErrorSol::ErrorZeroPrize);
    challenge.prize = prize;
    
    require!(end_time>=start_time,ErrorSol::ErrorTime);
    
    challenge.start_time = start_time;
    challenge.end_time = end_time;
    challenge.secret_hash = secret_hash;
    challenge.status = ChallengeStatus::Draft;
    challenge.winner = None;
    challenge.bump = ctx.bumps.challenge;
    challenge.vault = ctx.accounts.vault.key();
    challenge.token_mint = ctx.accounts.token_mint.key();
    challenge.company = ctx.accounts.company.key();

    Ok(())
}