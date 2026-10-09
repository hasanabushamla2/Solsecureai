use anchor_lang::prelude::*;

use crate::{error::ErrorSol, Challenge, ChallengeStatus};

#[account]
#[derive(InitSpace)]
pub struct SolutionCommit {
    pub researcher: Pubkey,
    pub commitment_hash: [u8; 32],
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CommitSolution<'info>{
    /// CHECK: Used only for its public key. The challenge PDA and has_one constraint verify it matches the company stored in Challenge.
    #[account(mut)]
    pub company: UncheckedAccount<'info>,

    #[account(mut)]
    pub researcher: Signer<'info>,

    #[account(
        mut,
        seeds=[
            b"challenge",
            company.key().as_ref(),
            id.to_le_bytes().as_ref(),
        ],
        bump,
        has_one = company,
    )]
    pub challenge: Account<'info, Challenge>,

    #[account(
        init_if_needed,
        payer = researcher,
        space = 8 + SolutionCommit::INIT_SPACE,
        seeds = [
            b"solution_commit",
            researcher.key().as_ref(),
            company.key().as_ref(),
            id.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    pub solution_commit: Account<'info, SolutionCommit>,

    pub system_program: Program<'info, System>,
}

pub fn commit_solution(
    ctx: Context<CommitSolution>,
    id: u64,
    commitment_hash: [u8; 32]
)->Result<()>{
    
    let time: i64 = Clock::get()?.unix_timestamp;
    let check: bool = time>=ctx.accounts.challenge.start_time && time<=ctx.accounts.challenge.end_time;
    require!(check&&
        ctx.accounts.challenge.status==ChallengeStatus::Active,ErrorSol::ChallengeNotOpen);
    let solution_commit: &mut Account<'_, SolutionCommit>= &mut ctx.accounts.solution_commit;
    solution_commit.researcher = ctx.accounts.researcher.key();
    solution_commit.commitment_hash = commitment_hash;
    solution_commit.bump = ctx.bumps.solution_commit;
    Ok(())
}