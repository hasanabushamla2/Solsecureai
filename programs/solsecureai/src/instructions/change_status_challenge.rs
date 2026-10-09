use anchor_lang::prelude::*;

use crate::{error::ErrorSol, Challenge, ChallengeStatus};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct ChangeStatusChallenge<'info> {
    #[account(
        mut,
        constraint = challenge.company.key() == company.key() @ ErrorSol::Unauthorized,
    )]
    pub company: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"challenge",
            company.key().as_ref(),
            id.to_le_bytes().as_ref()
        ],
        bump,
    )]
    pub challenge: Account<'info, Challenge>,
}

pub fn change_status_challenge(
    ctx: Context<ChangeStatusChallenge>,
    id: u64,
    status: ChallengeStatus, 
) -> Result<()>{
    let challenge = &mut ctx.accounts.challenge;
    
    if (status==ChallengeStatus::Active && challenge.status==ChallengeStatus::Paused) 
    || (status==ChallengeStatus::Paused && challenge.status==ChallengeStatus::Active) {
        challenge.status = status;
    }
    else if (challenge.status==ChallengeStatus::Draft || challenge.status==ChallengeStatus::Active || challenge.status==ChallengeStatus::Paused)
    && status == ChallengeStatus::Cancelled {
        challenge.status = status;
    }
    else{
        return err!(ErrorSol::InvalidStatusTransition);
    }
    
    Ok(())
}