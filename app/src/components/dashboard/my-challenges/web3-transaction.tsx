import {
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";

import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { BN, Program, AnchorProvider } from "@coral-xyz/anchor";
import idl from "@/anchor/idl/solsecureai.json";
import { Connection } from "@solana/web3.js";
import { Solsecureai } from "@/anchor/types/solsecureai";
import {
  fundChallenge,
  closeChallenge,
  pauseOrResumeChallenge,
  submitSecretChallenge
} from "@/lib/dashboard/api";
import { createHash, randomBytes } from "crypto";

export async function web3Transaction(
  wallet: any,
  connect: any,
  wallet_address: any,
  pda: string,
) {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet"
      ? process.env.NEXT_PUBLIC_DEVNET_RPC!
      : process.env.NEXT_PUBLIC_MAINNET_RPC!,
    "confirmed",
  );
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const program = new Program<Solsecureai>(idl, provider);
  const challengeAccount = await program.account.challenge.fetch(pda);

  const tokenMintAddress = challengeAccount.tokenMint;

  const companyTokenAccountAddress = getAssociatedTokenAddressSync(
    new PublicKey(tokenMintAddress),
    new PublicKey(wallet_address),
    true,
  );

  try {
    const tx: TransactionSignature = await program.methods
      .fundChallenge(challengeAccount.id, challengeAccount.prize)
      .accountsStrict({
        company: new PublicKey(wallet_address),
        tokenMint: new PublicKey(tokenMintAddress),
        companyTokenAccount: companyTokenAccountAddress,
        challenge: new PublicKey(pda),
        vault: new PublicKey(challengeAccount.vault),
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    const rs = await fundChallenge(pda, tx, wallet_address);

  } catch (err) {
    throw err;
  }
}

export async function closeAccount(
  wallet: any,
  connect: any,
  wallet_address: any,
  pda: string,
) {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet"
      ? process.env.NEXT_PUBLIC_DEVNET_RPC!
      : process.env.NEXT_PUBLIC_MAINNET_RPC!,
    "confirmed",
  );
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const program = new Program<Solsecureai>(idl, provider);
  const challengeAccount = await program.account.challenge.fetch(pda);

  const tokenMintAddress = challengeAccount.tokenMint;

  const companyTokenAccountAddress = getAssociatedTokenAddressSync(
    new PublicKey(tokenMintAddress),
    new PublicKey(wallet_address),
    true,
  );

  const [challenge_pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"),
      new PublicKey(wallet_address).toBuffer(),
      challengeAccount.id.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  try {
    const status = { cancelled: {} };
    await program.methods
      .changeStatusChallenge(challengeAccount.id, status)
      .accountsStrict({
        company: new PublicKey(wallet_address),
        challenge: challenge_pda,
      })
      .rpc();

    const tx = await program.methods
      .closeChallenge(challengeAccount.id)
      .accountsStrict({
        company: new PublicKey(wallet_address),
        tokenMint: challengeAccount.tokenMint,
        companyTokenAccount: companyTokenAccountAddress,
        challenge: challenge_pda,
        vault: challengeAccount.vault,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    await closeChallenge(pda, tx, wallet_address);
  } catch (err) {
    throw err;
  }
}

export async function PauseOrResumeAccount(
  wallet: any,
  connect: any,
  wallet_address: any,
  pda: string,
  pause: boolean,
) {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet"
      ? process.env.NEXT_PUBLIC_DEVNET_RPC!
      : process.env.NEXT_PUBLIC_MAINNET_RPC!,
    "confirmed",
  );
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const program = new Program<Solsecureai>(idl, provider);
  const challengeAccount = await program.account.challenge.fetch(pda);

  const tokenMintAddress = challengeAccount.tokenMint;

  const companyTokenAccountAddress = getAssociatedTokenAddressSync(
    new PublicKey(tokenMintAddress),
    new PublicKey(wallet_address),
    true,
  );

  const [challenge_pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"),
      new PublicKey(wallet_address).toBuffer(),
      challengeAccount.id.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );
  try {
    const status = pause === true ? { paused: {} } : { active: {} };
    const tx = await program.methods
      .changeStatusChallenge(challengeAccount.id, status)
      .accountsStrict({
        company: new PublicKey(wallet_address),
        challenge: challenge_pda,
      })
      .rpc();

    await pauseOrResumeChallenge(pda, tx, wallet_address, pause);
  } catch (err) {
    throw err;
  }
}

export async function submitSecret(
  wallet: any,
  connect: any,
  wallet_address: any,
  pda: string,
  secret: string
) {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet"
      ? process.env.NEXT_PUBLIC_DEVNET_RPC!
      : process.env.NEXT_PUBLIC_MAINNET_RPC!,
    "confirmed",
  );
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const program = new Program<Solsecureai>(idl, provider);
  const challengeAccount = await program.account.challenge.fetch(pda);

  const tokenMintAddress = challengeAccount.tokenMint;

  const companyTokenAccountAddress = getAssociatedTokenAddressSync(
    new PublicKey(tokenMintAddress),
    new PublicKey(wallet_address),
    true,
  );

  const [challenge_pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"),
      challengeAccount.company.toBuffer(),
      challengeAccount.id.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  const nonce: number[] = Array.from(randomBytes(32));

  const commitment_hash: number[] = Array.from(
            createHash("sha256")
            .update(Buffer.from("challenge"))
            .update(Buffer.from(secret))
            .update(new PublicKey(wallet_address).toBuffer())
            .update(challenge_pda.toBuffer())
            .update(Buffer.from(nonce))
            .digest()
        );
  const [solutionCommit] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("solution_commit"),
                new PublicKey(wallet_address).toBuffer(),
                challengeAccount.company.toBuffer(),
                challengeAccount.id.toArrayLike(Buffer,"le",8)
            ],
            program.programId
        );

    const researcherAccount = getAssociatedTokenAddressSync(
        challengeAccount.tokenMint,
        new PublicKey(wallet_address),
        true
    )
  
  try {
    

        const txOne = await program.methods
        .commitSolution(challengeAccount.id,commitment_hash)
        .accountsStrict({
            company:challengeAccount.company,
            researcher: new PublicKey(wallet_address),
            challenge: challenge_pda,
            solutionCommit,
            systemProgram: SystemProgram.programId,
        })
        .rpc();
        

        const tx = await program.methods
        .revealSolution(challengeAccount.id,secret,nonce)
        .accountsStrict({
            company:challengeAccount.company,
            tokenMint: challengeAccount.tokenMint,
            researcher: new PublicKey(wallet_address),
            researcherAccount: researcherAccount,
            challenge: challenge_pda,
            vault: challengeAccount.vault,
            solutionCommit,
            systemProgram: SystemProgram.programId,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
        

    await submitSecretChallenge(pda, tx, wallet_address);
  } catch (err) {
    
    throw err;
  }
}