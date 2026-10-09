pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("JCDzW3eNtDGaP4R87EanqBERKyCLxVeWoxbWyTaGyWF8");

#[program]
pub mod solsecureai {
    use super::*;


    pub fn create_challenge(ctx: Context<CreateChallenge>,
    id:u64,
    prize: u64,
    start_time: i64,
    end_time: i64,
    secret_hash: [u8; 32]
    ) -> Result<()>{
        crate::instructions::handle_create_challenge(ctx, id, prize, start_time, end_time, secret_hash)
    }

    pub fn fund_challenge(
        ctx: Context<FundChallenge>,
        id: u64,
        amount: u64,
    ) -> Result<()>{
        crate::instructions::fund_challenge(ctx, id, amount)
    }

    pub fn change_status_challenge(
        ctx: Context<ChangeStatusChallenge>,
        id: u64,
        status: ChallengeStatus
    ) -> Result<()>{
        crate::instructions::change_status_challenge(ctx,id , status)
    }

    pub fn close_challenge(
        ctx: Context<CloseChallenge>,
        id: u64,
    ) ->Result<()>{
        crate::instructions::close_challenge(ctx,id)
    }

    pub fn commit_solution(
        ctx: Context<CommitSolution>,
        id: u64,
        commitment_hash: [u8; 32]
    )->Result<()>{
        crate::instructions::commit_solution(ctx,id,commitment_hash)
    }

    pub fn reveal_solution(
        ctx: Context<RevealSolution>,
        id: u64,
        secret: String,
        nonce: [u8; 32]
    )->Result<()>{
        crate::instructions::reveal_solution(ctx,id,secret, nonce)
    }
}
