use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::{
    close_account, CloseAccount, Mint, TokenAccount, TokenInterface, transfer_checked ,TransferChecked
}};

use crate::{error::ErrorSol, Challenge, ChallengeStatus};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CloseChallenge<'info> {
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
        bump,
        has_one = token_mint,
        has_one = company,
        has_one = vault,
        close = company,
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

pub fn close_challenge(
    ctx: Context<CloseChallenge>,
    id: u64,
)->Result<()>{
    let challenge = &mut ctx.accounts.challenge;
    let vault = &mut ctx.accounts.vault;
    require!(challenge.status == ChallengeStatus::Cancelled
    || challenge.status == ChallengeStatus::Completed,ErrorSol::InvalidCloseStatus);
    
    let amount  = vault.amount;
    
    let cpi_program = ctx.accounts.token_program.key();

    let id_bytes = challenge.id.to_le_bytes();
    let company_seed = challenge.company;
    let bump_seed = [challenge.bump];

    let seeds:&[&[u8]] = &[
            b"challenge".as_ref(),
            company_seed.as_ref(),
            id_bytes.as_ref(),
            bump_seed.as_ref(),
    ];

    let signer_seeds:&[&[&[u8]]] = &[seeds];

    if amount > 0 {
         transfer_checked( 
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                TransferChecked{
                    from: vault.to_account_info(),
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.company_token_account.to_account_info(),
                    authority: challenge.to_account_info()
                },
                signer_seeds
            ),
            amount,
            ctx.accounts.token_mint.decimals
         )?;
    }

    vault.reload()?;
    
    require!(vault.amount == 0, ErrorSol::CloseAmount);

    let cpi_accounts = CloseAccount{
        account: ctx.accounts.vault.to_account_info(),
        destination: ctx.accounts.company.to_account_info(),
        authority: challenge.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

    close_account(cpi_ctx)?;
    Ok(())
}