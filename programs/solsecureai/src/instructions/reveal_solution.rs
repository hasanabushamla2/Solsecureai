use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked
}};

use crate::{error::ErrorSol, Challenge, ChallengeStatus, SolutionCommit};

use solana_sha256_hasher::{hash, hashv};


#[derive(Accounts)]
#[instruction(id: u64)]
pub struct RevealSolution<'info> {
    /// CHECK: Used only for its public key. The challenge PDA and has_one constraint verify it matches the company stored in Challenge.
    #[account(
        mut,
        constraint = company.key() == challenge.company.key() @ ErrorSol::Unauthorized,
    )]
    pub company: UncheckedAccount<'info>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub researcher: Signer<'info>,

    #[account(
        init_if_needed,
        payer = researcher,
        associated_token::mint = token_mint,
        associated_token::authority = researcher,
        associated_token::token_program = token_program,
    )]
    pub researcher_account:InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds=[
            b"challenge",
            company.key().as_ref(),
            id.to_le_bytes().as_ref(),
        ],
        has_one = vault,
        has_one = company,
        has_one = token_mint,
        bump,
    )]
    pub challenge: Account<'info, Challenge>,

    #[account(
        mut,
        associated_token::mint=token_mint,
        associated_token::authority=challenge,
        associated_token::token_program=token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds=[
            b"solution_commit",
            researcher.key.as_ref(),
            company.key().as_ref(),
            id.to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub solution_commit: Account<'info, SolutionCommit>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn reveal_solution(
    ctx: Context<RevealSolution>,
    id: u64,
    secret: String,
    nonce: [u8; 32]
)->Result<()>{
    let secret_hash = hash(secret.as_bytes()).to_bytes();
    let commitment_hash = hashv(&[
        b"challenge",
        secret.as_bytes(),
        ctx.accounts.researcher.key().as_ref(),
        ctx.accounts.challenge.key().as_ref(),
        nonce.as_ref(),
    ]).to_bytes();
    require!(
    ctx.accounts.researcher.key() != ctx.accounts.challenge.company.key(),
    ErrorSol::CompanyCannotClaimOwnChallenge
    );

    let time = Clock::get()?.unix_timestamp;
    let check = time>=ctx.accounts.challenge.start_time && time<=ctx.accounts.challenge.end_time;
    require!(check&&
        ctx.accounts.challenge.status==ChallengeStatus::Active,ErrorSol::ChallengeNotOpen);
    require!(
        ctx.accounts.challenge.secret_hash == secret_hash,
        ErrorSol::SecretUnauthorized
    );

    require!(
        commitment_hash == ctx.accounts.solution_commit.commitment_hash,
        ErrorSol::CommitmentUnauthorized
    );
    require!(ctx.accounts.challenge.status==ChallengeStatus::Active&&ctx.accounts.challenge.winner==None,ErrorSol::ChallengeNotEligibleForPayout);

    let cpi_program = ctx.accounts.token_program.key();
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.researcher_account.to_account_info(),
        authority: ctx.accounts.challenge.to_account_info(),
        mint: ctx.accounts.token_mint.to_account_info(),
    };
    
    let bump = [ctx.accounts.challenge.bump];
    let id_bytes = ctx.accounts.challenge.id.to_le_bytes();

    let seeds = &[
        b"challenge".as_ref(),
        ctx.accounts.challenge.company.as_ref(),
        id_bytes.as_ref(),
        bump.as_ref(),
    ][..];

    let signer_seeds = &[seeds][..];
    let cpi =
    CpiContext::new_with_signer(cpi_program
    , cpi_accounts, signer_seeds);

    transfer_checked(cpi, ctx.accounts.challenge.prize, ctx.accounts.token_mint.decimals)?;

    ctx.accounts.challenge.winner = Some(ctx.accounts.researcher.key());
    ctx.accounts.challenge.status = ChallengeStatus::Completed;
    Ok(())
}