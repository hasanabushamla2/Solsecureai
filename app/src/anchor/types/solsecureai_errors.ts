
export const SolsecureaiErrorCode = {
  Unauthorized: 6000,
  CounterOverflow: 6001,
  CloseAmount: 6002,
  ErrorTime: 6003,
  ErrorZeroPrize: 6004,
  ErrorDraft: 6005,
  PrizeAmountMismatch: 6006,
  InvalidStatusTransition: 6007,
  InvalidCloseStatus: 6008,
  TranscationUnauthorized: 6009,
  ChallengeNotOpen: 6010,
  ChallengeNotEligibleForPayout: 6011,
  SecretUnauthorized: 6012,
  CommitmentUnauthorized: 6013,
  CompanyCannotClaimOwnChallenge: 6014
};

export type SolsecureaiErrorName = keyof typeof SolsecureaiErrorCode;
