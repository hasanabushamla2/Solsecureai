use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorSol {
    #[msg("Only the counter authority can update this counter")]
    Unauthorized,
    #[msg("Counter has reached the maximum value")]
    CounterOverflow,
    #[msg("Please empty the account before deleting it.")]
    CloseAmount,
    #[msg("End time cannot be earlier than the start time.")]
    ErrorTime,
    #[msg("Prize amount must be greater than zero.")]
    ErrorZeroPrize,
    #[msg("Funding is only allowed in draft status.")]
    ErrorDraft,
    #[msg("Funding amount must match the challenge prize.")]
    PrizeAmountMismatch,
    #[msg("This challenge status transition is not allowed.")]
    InvalidStatusTransition,
    #[msg("Challenge can only be closed when it is completed or cancelled.")]
    InvalidCloseStatus,
    #[msg("Transcation Unauthorized")]
    TranscationUnauthorized,
    #[msg("Challenge is not currently open for submissions.")]
    ChallengeNotOpen,
    #[msg("Challenge is not eligible for payout.")]
    ChallengeNotEligibleForPayout,
    #[msg("Secret Unauthorized")]
    SecretUnauthorized,
    #[msg("Commitment Unauthorized")]
    CommitmentUnauthorized,
    #[msg("Company cannot claim own challenge")]
    CompanyCannotClaimOwnChallenge,
}
