use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub count: u64,
    pub authority: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
#[derive(PartialEq)]
pub enum ChallengeStatus {
    Active,
    Paused,
    Completed,
    Cancelled,
    Draft
}

#[account]
#[derive(InitSpace)]
pub struct Challenge {
    pub company: Pubkey,
    pub id: u64,

    pub token_mint: Pubkey,
    pub vault: Pubkey,
    pub prize: u64,

    pub secret_hash: [u8; 32],

    pub start_time: i64,
    pub end_time: i64,

    pub winner: Option<Pubkey>,

    pub bump: u8,
    pub status: ChallengeStatus,
}