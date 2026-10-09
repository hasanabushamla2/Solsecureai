use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked
}};

use crate::{error::ErrorSol, Challenge, ChallengeStatus};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct FundChallenge<'info> {
    #[account(
        mut,
        constraint = challenge.company.key() == company.key() @ ErrorSol::Unauthorized,
    )]
    pub company: Signer<'info>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer=company,
        associated_token::mint = token_mint,
        associated_token::authority = company,
        associated_token::token_program = token_program,
    )]
    pub company_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            b"challenge",
            company.key().as_ref(),
            id.to_le_bytes().as_ref()
        ],
        has_one=company,
        has_one=token_mint,
        has_one=vault,
        bump,
    )]
    pub challenge: Account<'info, Challenge>,
    
    #[account(
        mut,
        associated_token::mint=token_mint,
        associated_token::authority=challenge,
        associated_token::token_program=token_program,
    )]
    pub vault: Box<InterfaceAccount<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
}


pub fn fund_challenge(
    ctx: Context<FundChallenge>,
    id: u64,
    amount: u64
)->Result<()>{
    let challenge = &mut ctx.accounts.challenge;
    require!(amount>0,ErrorSol::ErrorZeroPrize);
    require!(challenge.status == ChallengeStatus::Draft,ErrorSol::ErrorDraft);
    require!(challenge.prize==amount,ErrorSol::PrizeAmountMismatch);
    transfer_checked(
    CpiContext::new(
        ctx.accounts.token_program.key(),
        TransferChecked {
            from: ctx.accounts.company_token_account.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.company.to_account_info(),
        }
    ),
    amount,
    ctx.accounts.token_mint.decimals,
    )?;
    challenge.status = ChallengeStatus::Active;
    Ok(())
}