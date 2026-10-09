import express, { Request, Response, NextFunction } from "express";
import pool from "./db";
import { Program, type Idl, BorshInstructionCoder } from "@coral-xyz/anchor";
import idl from "./idl/solsecureai.json";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { Pool, PoolClient, QueryResult } from "pg";
import nacl from "tweetnacl";
import cookieParser from "cookie-parser";
import { requireAuth } from "./middleware/auth.middleware";
import { PublicKey, Connection, ParsedAccountData } from "@solana/web3.js";
import { Solsecureai } from "./types/solsecureai";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { encrypt } from "./lib/encryption";
import { fetchFunction } from "./lib/ai";
import cors from "cors";
import { TokenListProvider } from "@solana/spl-token-registry";
import rateLimit from "express-rate-limit";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";

const app = express();

const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again later." },
});

app.use(globalLimiter);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  }),
);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    err.type === "entity.parse.failed"
  ) {
    res.status(400).json({
      error: "Invalid JSON",
    });
    return;
  }
  next(err);
});

const connection = new Connection(process.env.RPC_URL!, {
  commitment: "confirmed",
  disableRetryOnRateLimit: true,
});

export const program = new Program<Solsecureai>(idl as Idl, {
  connection,
});

interface AuthRow {
  id: string;
  used_at: Date | null;
  expires_at: Date;
  wallet_address: string;
  nonce_hash: string;
}

export const challengePasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    error:
      "Too many failed attempts. This action has been temporarily blocked for security reasons. Please try again in 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const financialActionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    error:
      "Too many requests. Please wait a moment before processing another transaction.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const challengeManagementLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    error:
      "You are performing actions too quickly. Please slow down and try again shortly.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const chatMessagesLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 15,
  message: {
    error:
      "Message rate limit exceeded. Please wait a minute before sending more messages.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const profileUpdateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 2,
  message: {
    error:
      "You can only update your profile details a limited number of times. Please try again in 5 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

interface createChallenge {
  challenge_pda: string;
  transaction_signature: string;
  title: string;
  description: string;
  model_name: string;
  provider: string;
  api_key: string;
  endpoint_url: string;
}

export interface ActivityPayload {
  dbConnect: Pool | PoolClient;
  wallet: string;
  challenge_pda: string;
  activity_type:
    | "login"
    | "logout"
    | "create_challenge"
    | "fund_challenge"
    | "pause_challenge"
    | "resume_challenge"
    | "close_challenge"
    | "claim_challenge"
    | "edit_challenge"
    | "chat_session"
    | "message"
    | "edit_username"
    | "win_challenge"
    | "complete_challenge";
  metadata: Record<string, string>;
}

const activity = async (payload: ActivityPayload): Promise<void> => {
  const { dbConnect, wallet, challenge_pda, activity_type, metadata } = payload;
  try {
    await dbConnect.query(
      "INSERT INTO user_activities(id,wallet_address,challenge_pda,activity_type,metadata) values($1,$2,$3,$4,$5)",
      [
        randomUUID(),
        wallet,
        challenge_pda,
        activity_type,
        JSON.stringify(metadata),
      ],
    );
  } catch (err) {
    throw err;
  }
};

app.post(
  "/api/create-challenge",
  challengeManagementLimiter,
  requireAuth,
  async (req, res) => {
    const {
      challenge_pda,
      transaction_signature,
      title,
      description,
      model_name,
      provider,
      api_key,
      endpoint_url,
    }: createChallenge = req.body;
    const company_wallet: string = res.locals.session.wallet_address;

    const fields: { name: string; value: string }[] = [
      { name: "challenge_pda", value: challenge_pda },
      { name: "transaction_signature", value: transaction_signature },
      { name: "company_wallet", value: company_wallet },
      { name: "title", value: title },
      { name: "description", value: description },
      { name: "model_name", value: model_name },
      { name: "provider", value: provider },
      { name: "api_key", value: api_key },
      { name: "endpoint_url", value: endpoint_url },
    ];

    for (const input of fields) {
      if (
        !input.value ||
        typeof input.value !== "string" ||
        input.value.trim() === ""
      ) {
        return res.status(400).json({
          error: "Invalid data entered!",
        });
      }
    }

    try {
      const tx = await connection.getParsedTransaction(transaction_signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      if (!tx || tx?.meta?.err !== null) {
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const challengePda = new PublicKey(challenge_pda);
      const coder = new BorshInstructionCoder(program.idl);

      const matches = tx.transaction.message.instructions.some(
        (ix) =>
          "accounts" in ix &&
          ix.programId.equals(program.programId) &&
          coder.decode(ix.data, "base58")?.name === "createChallenge" &&
          ix.accounts.some((a) => a.equals(challengePda)),
      );

      if (!matches) {
        return res.status(400).json({
          error: "Transaction does not match challenge",
        });
      }

      const challenge = await program.account.challenge.fetch(challengePda);
      const challangeCompanyWallet = new PublicKey(challenge.company);
      const info = await connection.getAccountInfo(challengePda);

      if (
        !info ||
        !info.owner.equals(program.programId) ||
        challangeCompanyWallet.toBase58() !== company_wallet
      ) {
        return res.status(403).json({
          error: "Challenge does not belong to this wallet",
        });
      }

      const resultQuery: QueryResult = await pool.query(
        "INSERT INTO challenges(challenge_pda,company_wallet,title,description,model_name,status,provider)" +
          " VALUES($1,$2,$3,$4,$5,'draft',$6) returning company_wallet,title,description,model_name,status",
        [
          challenge_pda,
          company_wallet,
          title,
          description,
          model_name,
          provider,
        ],
      );

      const key: string = encrypt(api_key);
      const rs: QueryResult = await pool.query(
        "insert into company_ai_credentials(id,company_wallet,provider,api_key_encrypted,endpoint_url,challenge_pda) values($1,$2,$3,$4,$5,$6)",
        [
          randomUUID(),
          company_wallet,
          provider,
          key,
          endpoint_url,
          challenge_pda,
        ],
      );
      await pool.query(
        `
      INSERT INTO user_stats (
        wallet_address,
        challenges_created
      )
      VALUES ($1, 1)

      ON CONFLICT (wallet_address)
      DO UPDATE SET
        challenges_created = user_stats.challenges_created + 1,
        updated_at = NOW()
      `,
        [res.locals.session.wallet_address],
      );

      if (resultQuery.rows.length === 0) {
        return res.status(400).json({
          error: "Invalid created challenge!",
        });
      }
      const result = resultQuery.rows[0];
      await activity({
        dbConnect: pool,
        wallet: company_wallet,
        challenge_pda: challenge_pda,
        activity_type: "create_challenge",
        metadata: { Activity: "Create Challenge" },
      });
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      res.status(201).json({
        message: "Challenge created successfully",
        result,
      });
    } catch (error: unknown) {
      if (error instanceof Error && "code" in error && error.code === "23503") {
        return res.status(404).json({
          error: "Company not found.",
        });
      } else if (
        error instanceof Error &&
        "code" in error &&
        error.code === "23505"
      ) {
        return res.status(409).json({
          error: "Challenge is already registered.",
        });
      }
      return res.status(500).json({
        error: "Failed to create challenge",
      });
    }
  },
);

app.post(
  "/api/fund-challenge",
  financialActionLimiter,
  requireAuth,
  async (req, res) => {
    const challenge_pda: string = req.body.challenge_pda;
    const transaction_signature: string = req.body.transaction_signature;
    const company_wallet: string = res.locals.session.wallet_address;
    if (!challenge_pda || !transaction_signature || !company_wallet) {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }
    if (
      typeof challenge_pda !== "string" ||
      typeof transaction_signature !== "string" ||
      typeof company_wallet !== "string"
    ) {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }
    if (challenge_pda.trim() === "" || transaction_signature.trim() === "") {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }

    let client;
    try {
      client = await pool.connect();
      const challenge =
        await program.account.challenge.fetchNullable(challenge_pda);

      if (!challenge) {
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }

      if (company_wallet !== challenge.company.toBase58()) {
        return res.status(403).json({
          error: "Challenge does not belong to this wallet",
        });
      }

      await client.query("BEGIN");
      const prize = challenge.prize;

      const tx = await connection.getParsedTransaction(transaction_signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      if (!tx || tx.meta?.err !== null) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const challengePda = new PublicKey(challenge_pda);
      const coder = new BorshInstructionCoder(program.idl);

      const matches = tx.transaction.message.instructions.some(
        (ix) =>
          "accounts" in ix &&
          ix.programId.equals(program.programId) &&
          coder.decode(ix.data, "base58")?.name === "fundChallenge" &&
          ix.accounts.some((a) => a.equals(challengePda)),
      );
      if (!matches) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Transaction does not match challenge",
        });
      }
      if (Object.keys(challenge?.status)[0] !== "active") {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const mintInfo = await connection.getParsedAccountInfo(
        challenge.tokenMint,
      );
      let decimals;
      if (mintInfo.value && "parsed" in mintInfo.value.data) {
        const parsedData = mintInfo.value.data as ParsedAccountData;
        decimals = (mintInfo.value.data as ParsedAccountData).parsed.info
          .decimals;
      }
      const tokenList = await new TokenListProvider().resolve();
      const tokenInfo = tokenList
        .filterByChainId(102)
        .getList()
        .find((t) => t.address === challenge.tokenMint.toBase58());
      const token_symbol = tokenInfo ? tokenInfo.symbol : "UNKNOWN";
      const rs = await client.query(
        "UPDATE challenges SET status = 'active' WHERE challenge_pda = $1 AND status = 'draft' RETURNING status",
        [challengePda.toBase58()],
      );
      await client.query(
        "insert into billing(id,challenge_pda,amount,type,token_symbol,token_decimals,wallet) values($1,$2,$3,$4,$5,$6,$7)",
        [
          randomUUID(),
          challengePda.toBase58(),
          challenge.prize.toNumber(),
          "fund",
          token_symbol,
          decimals,
          challenge.company.toBase58(),
        ],
      );
      if (rs.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      await activity({
        dbConnect: client,
        wallet: company_wallet,
        challenge_pda: challenge_pda,
        activity_type: "fund_challenge",
        metadata: { Activity: "Fund Challenge" },
      });
      await client.query("COMMIT");
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      res.status(200).json({
        ok: true,
      });
    } catch (error: unknown) {
      if (client) await client.query("ROLLBACK");
      return res.status(500).json({
        error: "Failed to fund challenge",
      });
    } finally {
      if (client) await client.release();
    }
  },
);

app.post(
  "/api/pause-challenge",
  challengeManagementLimiter,
  requireAuth,
  async (req, res) => {
    const challenge_pda: string = req.body.challenge_pda;
    const transaction_signature: string = req.body.transaction_signature;
    const company_wallet: string = res.locals.session.wallet_address;
    if (!challenge_pda || !transaction_signature || !company_wallet) {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }
    if (
      typeof challenge_pda !== "string" ||
      typeof transaction_signature !== "string" ||
      typeof company_wallet !== "string"
    ) {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }
    if (challenge_pda.trim() === "" || transaction_signature.trim() === "") {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }

    try {
      const challenge =
        await program.account.challenge.fetchNullable(challenge_pda);

      if (!challenge) {
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }

      if (company_wallet !== challenge.company.toBase58()) {
        return res.status(403).json({
          error: "Challenge does not belong to this wallet",
        });
      }

      const tx = await connection.getParsedTransaction(transaction_signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      if (!tx || tx.meta?.err !== null) {
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const challengePda = new PublicKey(challenge_pda);
      const coder = new BorshInstructionCoder(program.idl);

      const matches = tx.transaction.message.instructions.some((ix) => {
        if (!("accounts" in ix)) return false;
        if (!ix.programId.equals(program.programId)) return false;
        const decoded = coder.decode(ix.data, "base58");
        return (
          decoded?.name === "changeStatusChallenge" &&
          Object.values(decoded.data).some(
            (v) => v !== null && typeof v === "object" && "paused" in v,
          ) &&
          ix.accounts.some((a) => a.equals(challengePda))
        );
      });
      if (!matches) {
        return res.status(400).json({
          error: "Transaction does not match challenge",
        });
      }
      if (Object.keys(challenge?.status)[0] !== "paused") {
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const rs = await pool.query(
        "UPDATE challenges SET status = 'paused' WHERE challenge_pda = $1 AND status = 'active' RETURNING status",
        [challengePda.toBase58()],
      );
      if (rs.rowCount === 0) {
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      await activity({
        dbConnect: pool,
        wallet: company_wallet,
        challenge_pda: challenge_pda,
        activity_type: "pause_challenge",
        metadata: { Activity: "Pause Challenge" },
      });
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      io.emit("challenges:update");
      const statusFromRes = rs.rows[0].status;
      res.status(200).json({
        ok: true,
        status: statusFromRes,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        error: "Failed to pause challenge",
      });
    }
  },
);

app.post(
  "/api/resume-challenge",
  challengeManagementLimiter,
  requireAuth,
  async (req, res) => {
    const challenge_pda: string = req.body.challenge_pda;
    const transaction_signature: string = req.body.transaction_signature;
    const company_wallet: string = res.locals.session.wallet_address;
    if (!challenge_pda || !transaction_signature || !company_wallet) {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }
    if (
      typeof challenge_pda !== "string" ||
      typeof transaction_signature !== "string" ||
      typeof company_wallet !== "string"
    ) {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }
    if (challenge_pda.trim() === "" || transaction_signature.trim() === "") {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }

    try {
      const challenge =
        await program.account.challenge.fetchNullable(challenge_pda);

      if (!challenge) {
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }

      if (company_wallet !== challenge.company.toBase58()) {
        return res.status(403).json({
          error: "Challenge does not belong to this wallet",
        });
      }

      const tx = await connection.getParsedTransaction(transaction_signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      if (!tx || tx.meta?.err !== null) {
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const challengePda = new PublicKey(challenge_pda);
      const coder = new BorshInstructionCoder(program.idl);

      const matches = tx.transaction.message.instructions.some((ix) => {
        if (!("accounts" in ix)) return false;
        if (!ix.programId.equals(program.programId)) return false;
        const g = coder.decode(ix.data, "base58");

        return (
          g?.name === "changeStatusChallenge" &&
          Object.values(g.data).some(
            (v) => v !== null && typeof v === "object" && "active" in v,
          ) &&
          ix.accounts.some((b) => b.equals(challengePda))
        );
      });
      if (!matches) {
        return res.status(400).json({
          error: "Transaction does not match challenge",
        });
      }
      if (Object.keys(challenge?.status)[0] !== "active") {
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const rs = await pool.query(
        "UPDATE challenges SET status = 'active' WHERE challenge_pda = $1 AND status = 'paused' RETURNING status",
        [challengePda.toBase58()],
      );
      if (rs.rowCount === 0) {
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const statusFromRes = rs.rows[0].status;
      await activity({
        dbConnect: pool,
        wallet: company_wallet,
        challenge_pda: challenge_pda,
        activity_type: "resume_challenge",
        metadata: { Activity: "Resume Challenge" },
      });
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      res.status(200).json({
        ok: true,
        status: statusFromRes,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        error: "Failed to resume challenge",
      });
    }
  },
);

app.post(
  "/api/close-challenge",
  challengeManagementLimiter,
  requireAuth,
  async (req, res) => {
    const challenge_pda: string = req.body.challenge_pda;
    const transaction_signature: string = req.body.transaction_signature;
    const company_wallet: string = res.locals.session.wallet_address;
    if (!challenge_pda || !transaction_signature || !company_wallet) {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }
    if (
      typeof challenge_pda !== "string" ||
      typeof transaction_signature !== "string" ||
      typeof company_wallet !== "string"
    ) {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }
    if (challenge_pda.trim() === "" || transaction_signature.trim() === "") {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }
    const client = await pool.connect();
    try {
      const challengePda = new PublicKey(challenge_pda);
      await client.query("BEGIN");
      const r: QueryResult = await client.query(
        "select company_wallet from challenges where challenge_pda = $1",
        [challengePda.toBase58()],
      );
      if (r.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          error: "Not Found!",
        });
      }

      const rw = r.rows[0].company_wallet;

      if (rw !== company_wallet) {
        await client.query("ROLLBACK");
        return res.status(403).json({
          error: "Unauthorized!",
        });
      }

      const challenge =
        await program.account.challenge.fetchNullable(challengePda);

      if (challenge !== null) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          error: "Challenge still exists on Solana",
        });
      }

      const rs = await pool.query(
        "UPDATE challenges SET status = 'closed' WHERE challenge_pda = $1 AND status IN ('draft', 'active', 'paused', 'cancelled', 'completed') RETURNING status",
        [challengePda.toBase58()],
      );
      if (rs.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const querySelect = await client.query(
        "select * from billing where challenge_pda = $1",
        [challenge_pda],
      );
      const resultQuery = querySelect.rows[0];
      const queryInsert = await client.query(
        "insert into billing(id,challenge_pda,amount,type,token_symbol,token_decimals,wallet) values($1,$2,$3,$4,$5,$6,$7)",
        [
          randomUUID(),
          challenge_pda,
          resultQuery.amount,
          "earning",
          resultQuery.token_symbol,
          resultQuery.token_decimals,
          resultQuery.wallet,
        ],
      );
      await activity({
        dbConnect: pool,
        wallet: company_wallet,
        challenge_pda: challenge_pda,
        activity_type: "close_challenge",
        metadata: { Activity: "Close Challenge" },
      });
      await client.query("COMMIT");
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      const statusFromRes = rs.rows[0].status;
      res.status(200).json({
        ok: true,
        status: statusFromRes,
      });
    } catch (error: unknown) {
      await client.query("ROLLBACK");
      return res.status(500).json({
        error: "Failed to cancel challenge",
      });
    } finally {
      await client.release();
    }
  },
);

app.post(
  "/api/complete-challenge",
  challengePasswordLimiter,
  requireAuth,
  async (req, res) => {
    const challenge_pda: string = req.body.challenge_pda;
    const transaction_signature: string = req.body.transaction_signature;
    const company_wallet: string = res.locals.session.wallet_address;
    if (!challenge_pda || !transaction_signature || !company_wallet) {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }
    if (
      typeof challenge_pda !== "string" ||
      typeof transaction_signature !== "string" ||
      typeof company_wallet !== "string"
    ) {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }
    if (challenge_pda.trim() === "" || transaction_signature.trim() === "") {
      return res.status(400).json({
        error: "Invalid data entered.",
      });
    }
    const client = await pool.connect();
    try {
      const challenge =
        await program.account.challenge.fetchNullable(challenge_pda);

      await client.query("BEGIN");
      if (!challenge) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const prize = challenge.prize.toNumber();
      if (company_wallet === challenge.company.toBase58()) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Challenge does not complete your challenge",
        });
      }

      const tx = await connection.getParsedTransaction(transaction_signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      if (!tx || tx.meta?.err !== null) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const challengePda = new PublicKey(challenge_pda);
      const coder = new BorshInstructionCoder(program.idl);

      const matches = tx.transaction.message.instructions.some((ix) => {
        if (!("accounts" in ix)) return false;
        if (!ix.programId.equals(program.programId)) return false;
        const g = coder.decode(ix.data, "base58");

        return (
          g?.name === "revealSolution" &&
          ix.accounts.some((b) => b.equals(challengePda))
        );
      });
      if (!matches) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Transaction does not match challenge",
        });
      }
      if (Object.keys(challenge?.status)[0] !== "completed") {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const rs = await client.query(
        "UPDATE challenges SET status = 'completed' WHERE challenge_pda = $1 AND status = 'active' RETURNING status",
        [challengePda.toBase58()],
      );
      if (rs.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Invalid transaction!",
        });
      }
      const querySelect = await client.query(
        "select * from billing where challenge_pda = $1",
        [challenge_pda],
      );
      const resultQuery = querySelect.rows[0];
      const queryInsert = await client.query(
        "insert into billing(id,challenge_pda,amount,type,token_symbol,token_decimals,wallet) values($1,$2,$3,$4,$5,$6,$7)",
        [
          randomUUID(),
          challenge_pda,
          resultQuery.amount,
          "earning",
          resultQuery.token_symbol,
          resultQuery.token_decimals,
          challenge.winner?.toBase58(),
        ],
      );
      const queryInsertCompany = await client.query(
        "insert into billing(id,challenge_pda,amount,type,token_symbol,token_decimals,wallet) values($1,$2,$3,$4,$5,$6,$7)",
        [
          randomUUID(),
          challenge_pda,
          resultQuery.amount,
          "fund",
          resultQuery.token_symbol,
          resultQuery.token_decimals,
          challenge.company.toBase58(),
        ],
      );
      const statusFromRes = rs.rows[0].status;
      await client.query(
        `
  INSERT INTO user_stats (
    wallet_address,
    wins,
    total_earnings
  )
  VALUES ($1, 1,json_build_object($3::text,$2::numeric))

  ON CONFLICT (wallet_address)
  DO UPDATE SET
    wins = user_stats.wins + 1,
    total_earnings = jsonb_set(
      COALESCE(user_stats.total_earnings,'{}'::jsonb),
      ARRAY[$3::text],
      (COALESCE((user_stats.total_earnings->>$3)::numeric,0)+$2::numeric)::text::jsonb
    ),
    updated_at = NOW()
  `,
        [challenge.winner?.toBase58(), prize, resultQuery.token_symbol],
      );
      await activity({
        dbConnect: client,
        wallet: challenge.winner!.toBase58(),
        challenge_pda: challenge_pda,
        activity_type: "win_challenge",
        metadata: { Activity: "Win The Challenge" },
      });
      await activity({
        dbConnect: client,
        wallet: challenge.company.toBase58(),
        challenge_pda: challenge_pda,
        activity_type: "complete_challenge",
        metadata: { Activity: "Completed Challenge" },
      });
      await client.query(
        "insert into notification(id,wallet_address,content,isread,challenge_pda,created_at) values($1,$2,$3,false,$4,now())",
        [
          randomUUID(),
          challenge.company.toBase58(),
          JSON.stringify({
            message: `Completed challenge (PDA: ${challenge_pda.slice(0, 10)}...)`,
          }),
          challenge_pda,
        ],
      );
      await client.query("COMMIT");
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      res.status(200).json({
        ok: true,
        status: statusFromRes,
      });
    } catch (error: unknown) {
      await client.query("ROLLBACK");
      return res.status(500).json({
        error: "Failed to complete challenge",
      });
    } finally {
      await client.release();
    }
  },
);

app.get("/api/challenges", async (req, res) => {
  try {
    const rs: QueryResult = await pool.query(
      "SELECT c.challenge_pda, c.company_wallet, c.title, c.description, c.model_name, c.provider, c.status, c.created_at, (SELECT b.amount FROM billing b WHERE b.challenge_pda = c.challenge_pda LIMIT 1) AS amount, (SELECT b.token_symbol FROM billing b WHERE b.challenge_pda = c.challenge_pda LIMIT 1) AS token_symbol, (SELECT b.token_decimals FROM billing b WHERE b.challenge_pda = c.challenge_pda LIMIT 1) AS token_decimals, (SELECT COUNT(*) FROM challenge_participants ch WHERE ch.challenge_pda = c.challenge_pda) AS total_participants FROM challenges c ORDER BY c.created_at DESC;",
    );
    res.status(200).json(rs.rows);
  } catch (err: unknown) {
    res.status(500).json({
      message: "Cann't to fetch challenges",
    });
  }
});

app.get("/api/notification", requireAuth, async (req, res) => {
  if (!res.locals.session.wallet_address) {
    return res.status(401).json({
      error: "Unauthorized.",
    });
  }
  try {
    const q = await pool.query(
      "select * from notification where wallet_address=$1 order by created_at desc",
      [res.locals.session.wallet_address],
    );
    return res.status(200).json({ result: q.rows });
  } catch (err) {
    return res.status(500).json({
      error: "Error to connection.",
    });
  }
});

app.get("/api/notification-count", requireAuth, async (req, res) => {
  if (!res.locals.session.wallet_address) {
    return res.status(401).json({
      error: "Unauthorized.",
    });
  }
  try {
    const q = await pool.query(
      "select Count(id) from notification where wallet_address=$1 and isread=false",
      [res.locals.session.wallet_address],
    );
    return res.status(200).json({ result: q.rows });
  } catch (err) {
    return res.status(500).json({
      error: "Error to connection.",
    });
  }
});

app.post("/api/notification", requireAuth, async (req, res) => {
  if (!res.locals.session.wallet_address) {
    return res.status(401).json({
      error: "Unauthorized.",
    });
  }
  try {
    const q = await pool.query(
      "update notification set isread = true where wallet_address=$1 and isread = false",
      [res.locals.session.wallet_address],
    );
    return res.status(200).json({ result: q.rows });
  } catch (err) {
    return res.status(500).json({
      error: "Error to connection.",
    });
  }
});

app.get("/api/my-challenges", requireAuth, async (req, res) => {
  const wallet: string | undefined = res.locals.session.wallet_address;

  if (!wallet) {
    return res.status(401).json({
      error: "Unauthorized!",
    });
  }
  try {
    const rs: QueryResult = await pool.query(
      "select challenge_pda, company_wallet, title, description, model_name,provider, status from challenges where company_wallet = $1 order by created_at asc",
      [wallet],
    );
    res.status(200).json(rs.rows);
  } catch (err: unknown) {
    res.status(500).json({
      message: "Cann't to fetch challenges",
    });
  }
});

app.get("/api/challenges/:pda", async (req, res) => {
  const pda: PublicKey = new PublicKey(req.params.pda);

  try {
    const challenge = await program.account.challenge.fetchNullable(pda);

    if (!challenge) {
      return res.status(400).json({
        error: "Failed to fetch challenge",
      });
    }

    const rs: QueryResult = await pool.query(
      "select title, description, model_name, company_wallet, status, provider from challenges where challenge_pda = $1",
      [pda.toBase58()],
    );

    if (rs.rows.length === 0) {
      return res.status(400).json({
        error: "Failed to fetch challenge",
      });
    }
    const result: QueryResult = rs.rows[0];

    const startTime: string = challenge.startTime
      ? new Date(challenge.startTime.toNumber() * 1000).toISOString()
      : "";
    const endTime: string = challenge.endTime
      ? new Date(challenge.endTime.toNumber() * 1000).toISOString()
      : "";

    return res.status(200).json({
      startTime,
      endTime,
      status: challenge.status,
      winner: challenge.winner,
      result,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      error: "Failed to fetch challenge",
    });
  }
});

app.get("/api/challenge-ai-credentials/:pda", async (req, res) => {
  const pda: PublicKey = new PublicKey(req.params.pda);

  try {
    const challenge = await program.account.challenge.fetchNullable(pda);

    if (!challenge) {
      return res.status(400).json({
        error: "Failed to fetch challenge",
      });
    }

    const rs: QueryResult = await pool.query(
      "select co.provider, co.endpoint_url, ch.system_prompt_encrypted,co.api_key_encrypted from company_ai_credentials co join challenge_ai_configs ch on ch.challenge_pda = co.challenge_pda where co.challenge_pda = $1",
      [pda.toBase58()],
    );

    if (rs.rows.length === 0) {
      return res.status(400).json({
        error: "Failed to fetch challenge",
      });
    }
    const result: QueryResult = rs.rows[0];

    const startTime: string = challenge.startTime
      ? new Date(challenge.startTime.toNumber() * 1000).toISOString()
      : "";
    const endTime: string = challenge.endTime
      ? new Date(challenge.endTime.toNumber() * 1000).toISOString()
      : "";

    return res.status(200).json({
      result,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      error: "Failed to fetch challenge",
    });
  }
});

app.patch(
  "/api/challenges/:pda",
  challengeManagementLimiter,
  requireAuth,
  async (req, res) => {
    const pda: PublicKey = new PublicKey(req.params.pda);
    const description: string = req.body.description;
    const title: string = req.body.title;
    const provider: string = req.body.provider;
    const model_name: string = req.body.provider;
    const endpoint_url: string = req.body.endpoint_url;
    const api_key_encrypted: string = req.body.api_key_encrypted;
    const system_prompt_encrypted: string = req.body.system_prompt_encrypted;

    const state = {
      title,
      description,
      provider,
      endpoint_url,
      model_name,
      api_key_encrypted,
      system_prompt_encrypted,
    };

    let editChallenge: Record<string, string> = {};
    let editChallengeConfig: Record<string, string> = {};
    let editCompanyCred: Record<string, string> = {};

    for (const [key, value] of Object.entries(state)) {
      if (value) {
        if (typeof value !== "string" || !value.trim()) {
          return res.status(400).json({
            error: "Failed to edit challenge",
          });
        } else {
          if (
            key === "title" ||
            key === "provider" ||
            key === "description" ||
            key === "model_name"
          ) {
            editChallenge[key] = value;
          }
          if (
            key === "provider" ||
            key === "endpoint_url" ||
            key === "api_key_encrypted"
          ) {
            if (key === "api_key_encrypted") {
              editChallengeConfig[key] = encrypt(value);
            } else {
              editChallengeConfig[key] = value;
            }
          }
          if (key === "system_prompt_encrypted") {
            editCompanyCred[key] = encrypt(value);
          }
        }
      }
    }

    const client = await pool.connect();
    try {
      const challenge = await program.account.challenge.fetchNullable(pda);

      if (!challenge) {
        return res.status(400).json({
          error: "Failed to fetch challenge",
        });
      }
      await client.query("BEGIN");

      const rsCheck: QueryResult = await client.query(
        "select status from challenges where challenge_pda =$1",
        [pda.toBase58()],
      );

      if (rsCheck.rows.length === 0) {
        return res.status(400).json({
          error: "Challenge isn't found",
        });
      }
      const status = rsCheck.rows[0].status;
      if (
        Object.keys(editChallengeConfig).length > 0 ||
        Object.keys(editCompanyCred).length > 0 ||
        Object.keys(editChallenge).includes("provider") ||
        Object.keys(editChallenge).includes("model_name")
      ) {
        if (status !== "draft") {
          return res.status(403).json({
            error:
              "You can only edit challenges that are currently in draft status.",
          });
        }
      }

      const q1 = Object.keys(editChallenge)
        .map((key, i) => `${key} = $${i + 1}`)
        .join(", ");

      if (q1) {
        const rs: QueryResult = await client.query(
          `update challenges set ${q1} where challenge_pda = $${Object.keys(editChallenge).length + 1} RETURNING *`,
          [...Object.values(editChallenge), pda.toBase58()],
        );
      }

      const q2 = Object.keys(editChallengeConfig)
        .map((key, i) => `${key} = $${i + 1}`)
        .join(", ");

      if (q2) {
        const updateChallengeConfig: QueryResult = await client.query(
          `update company_ai_credentials set ${q2} where challenge_pda = $${Object.keys(editChallengeConfig).length + 1}`,
          [...Object.values(editChallengeConfig), pda.toBase58()],
        );
      }

      const q3 = Object.keys(editCompanyCred)
        .map((key, i) => `${key} = $${i + 1}`)
        .join(", ");

      if (q3) {
        const updateCompanyCred: QueryResult = await client.query(
          `update challenge_ai_configs set ${q3} where challenge_pda = $${Object.keys(editCompanyCred).length + 1}`,
          [...Object.values(editCompanyCred), pda.toBase58()],
        );
      }
      await activity({
        dbConnect: client,
        wallet: challenge.company.toBase58(),
        challenge_pda: pda.toBase58(),
        activity_type: "edit_challenge",
        metadata: { Activity: "Edited Challenge" },
      });
      await client.query("COMMIT");
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      return res.status(200).json({
        ok: true,
      });
    } catch (error: unknown) {
      await client.query("ROLLBACK");
      return res.status(500).json({
        error: "Failed to fetch challenge",
      });
    } finally {
      client.release();
    }
  },
);

app.post("/api/auth/nonce", challengePasswordLimiter, async (req, res) => {
  if (!req.is("application/json")) {
    return res.status(415).json({
      error: "Content-Type must be application/json",
    });
  } else if (!req.body) {
    return res.status(400).json({
      error: "Invalid user data",
    });
  }

  const id: string = randomUUID();
  const nonce: string = randomBytes(32).toString("hex");
  const nonceHash: string = createHash("sha256").update(nonce).digest("hex");
  const expiresAt: Date = new Date(Date.now() + 5 * 60 * 1000);

  let walletAddress: string = req.body.wallet_address
    ? req.body.wallet_address
    : "";

  const checkWalletAddress =
    typeof walletAddress !== "string" ||
    walletAddress?.trim().length < 3 ||
    walletAddress?.trim().length > 50;

  if (checkWalletAddress) {
    return res.status(400).json({
      error: "Invalid user data",
    });
  }

  let publicKey: PublicKey;
  let normalizedAddress: string;

  try {
    publicKey = new PublicKey(walletAddress.trim());

    normalizedAddress = publicKey.toBase58();
  } catch (error: unknown) {
    return res.status(400).json({
      error: "Invalid wallet address",
    });
  }

  const message = [
    "Sign in to SolSecureAI",
    "",
    "Origin: http://localhost:3000",
    `Wallet: ${normalizedAddress}`,
    `Request ID: ${id}`,
    `Nonce: ${nonce}`,
    `Expires At: ${expiresAt.toISOString()}`,
  ].join("\n");

  try {
    const result = await pool.query(
      "insert into auth_nonce(id,wallet_address,nonce_hash,expires_at) " +
        "values($1,$2,$3,$4)",
      [id, normalizedAddress, nonceHash, expiresAt],
    );
    res.status(201).json({
      ok: true,
      id: id,
      message: message,
      nonce: nonce,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error: unknown) {
    res.status(500).json({
      error: "Failed to fetch auth user",
    });
  }
});

app.post("/api/auth/verify", challengePasswordLimiter, async (req, res) => {
  if (!req.is("application/json")) {
    return res.status(415).json({
      error: "Content-Type must be application/json",
    });
  } else if (!req.body) {
    return res.status(400).json({
      error: "Invalid user data",
    });
  }

  const id: string = req.body.id;
  const nonce: string = req.body.nonce;
  const signature: string = req.body.signature;

  if (!id || !nonce || !signature) {
    return res.status(400).json({
      error: "Invalid user data",
    });
  }

  if (
    typeof id !== "string" ||
    typeof nonce !== "string" ||
    typeof signature !== "string"
  ) {
    return res.status(400).json({
      error: "Invalid user data",
    });
  }

  const correctId: string = id.trim();
  if (
    !/^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/i.test(
      correctId,
    )
  ) {
    return res.status(400).json({
      error: "Invalid user data",
    });
  }
  const client = await pool.connect();
  try {
    const result: QueryResult = await pool.query(
      "select id, used_at, expires_at, wallet_address, nonce_hash from auth_nonce where id=$1",
      [correctId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Invalid or expired authentication session.",
      });
    }

    const resultJson = result.rows[0] as AuthRow;
    const idFromJson: string = resultJson.id;
    const usedAt: Date | null = resultJson.used_at;
    const walletAddressFromJson: string = resultJson.wallet_address;
    const expiresAt: Date = resultJson.expires_at;
    const nonce_hash: string = resultJson.nonce_hash;
    const nonce_hash_check: string = createHash("sha256")
      .update(nonce)
      .digest("hex");

    if (usedAt !== null) {
      return res.status(400).json({
        error: "Invalid authentication.",
      });
    } else if (Date.now() > expiresAt.getTime()) {
      return res.status(400).json({
        error: "Invalid authentication.",
      });
    } else if (nonce_hash_check !== nonce_hash) {
      return res.status(400).json({
        error: "Invalid authentication.",
      });
    }
    const message: string = [
      "Sign in to SolSecureAI",
      "",
      "Origin: http://localhost:3000",
      `Wallet: ${walletAddressFromJson}`,
      `Request ID: ${idFromJson}`,
      `Nonce: ${nonce}`,
      `Expires At: ${expiresAt.toISOString()}`,
    ].join("\n");

    const messageBytes: Buffer<ArrayBuffer> = Buffer.from(message, "utf8");
    const signatureBytes: Buffer<ArrayBuffer> = Buffer.from(
      signature,
      "base64",
    );
    const publicKeyBytes: Uint8Array<ArrayBufferLike> = new PublicKey(
      walletAddressFromJson,
    ).toBytes();

    if (signatureBytes.length !== 64) {
      return res.status(400).json({
        error: "Invalid authentication.",
      });
    }

    const isVaild: boolean = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes,
    );
    if (!isVaild) {
      return res.status(401).json({
        error: "Invalid authentication.",
      });
    }

    await client.query("BEGIN");

    await client.query(
      "insert into users(wallet_address, username, created_at) values($1,$2,NOW()) on conflict(wallet_address) do nothing;",
      [walletAddressFromJson, `User_${randomBytes(8).toString("hex")}`],
    );

    const day: number = 24 * 60 * 60 * 1000;

    const expiresAtSession: Date = new Date(Date.now() + day);

    const random: string = randomBytes(32).toString("hex");

    const token_hash: string = createHash("sha256")
      .update(random)
      .digest("hex");

    const idToAuth: string = randomUUID();

    const updateAuth = await client.query(
      "update auth_nonce set used_at = NOW() where id = $1 and used_at is null and expires_at > NOW() returning id",
      [correctId],
    );

    if (updateAuth.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(401).json({
        error: "Invalid authentication.",
      });
    }

    const insertAuth: QueryResult = await client.query(
      "insert into auth_sessions(id, wallet_address, token_hash, expires_at) " +
        "values($1,$2,$3,$4)",
      [idToAuth, walletAddressFromJson, token_hash, expiresAtSession],
    );

    await client.query("COMMIT");

    res.cookie("session_token", random, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      id: idToAuth,
      walletAddress: walletAddressFromJson,
      created_at: new Date().toISOString(),
    });
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    return res.status(500).json({
      error: "Failed to fetch auth user",
    });
  } finally {
    await client.release();
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  const session = res.locals.session;
  return res.status(200).json(session);
});

app.get("/api/user/profile", requireAuth, async (req, res) => {
  const wallet_address = res.locals.session.wallet_address;
  try {
    const rs: QueryResult = await pool.query(
      "select * from users where wallet_address = $1",
      [wallet_address],
    );
    if (rs.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid to fetch your information",
      });
    }
    const result = rs.rows[0];
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({
      error: "Invalid to fetch your information",
    });
  }
});

app.patch(
  "/api/user/profile",
  profileUpdateLimiter,
  requireAuth,
  async (req, res) => {
    const wallet_address = res.locals.session.wallet_address;
    const username: string = req.body.username;
    if (!username || typeof username !== "string" || username.trim() === "") {
      return res.status(400).json({
        error: "Invalid data entered!",
      });
    }
    try {
      const rs: QueryResult = await pool.query(
        "update users set username = $1 where wallet_address = $2",
        [username, wallet_address],
      );
      if (rs.rowCount === 0) {
        return res.status(400).json({
          error: "Invalid to fetch your information",
        });
      }
      await activity({
        dbConnect: pool,
        wallet: wallet_address,
        challenge_pda: "",
        activity_type: "edit_challenge",
        metadata: { Activity: "Edited Username" },
      });
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({
        error: "Invalid to fetch your information",
      });
    }
  },
);

app.post("/api/auth/logout", async (req, res) => {
  const session_token: string = req.cookies.session_token;
  if (!session_token) {
    return res.status(400).json({
      error: "Invaild request.",
    });
  }
  if (typeof session_token !== "string") {
    return res.status(400).json({
      error: "Invaild request.",
    });
  }

  const token_hash: string = await createHash("sha256")
    .update(session_token)
    .digest("hex");

  try {
    const result: QueryResult = await pool.query(
      "update auth_sessions set revoked_at = NOW() where token_hash = $1 and revoked_at is null",
      [token_hash],
    );

    res.clearCookie("session_token");

    if (result.rowCount === 0) {
      return res.status(200).json({
        message: "Already logged out",
      });
    }

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error: unknown) {
    return res.status(500).json({
      error: "Failed to fetch auth user",
    });
  }
});

app.get("/api/users/:wallet_address", async (req, res) => {
  const walletAddress: string = req.params.wallet_address;

  try {
    const result = await pool.query(
      "SELECT wallet_address, username FROM users WHERE wallet_address = $1",
      [walletAddress],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: unknown) {
    return res.status(500).json({
      error: "Failed to fetch user",
    });
  }
});

app.post(
  "/api/chat/sessions",
  chatMessagesLimiter,
  requireAuth,
  async (req, res) => {
    const wallet: string = res.locals.session.wallet_address;
    if (!wallet) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
    const challenge_pda: string = req.body.challenge_pda;
    if (
      !challenge_pda ||
      typeof challenge_pda !== "string" ||
      challenge_pda.trim() === ""
    ) {
      return res.status(400).json({
        error: "Invalid data entered!",
      });
    }

    try {
      const rs: QueryResult = await pool.query(
        "select status from challenges where challenge_pda = $1",
        [challenge_pda],
      );
      if (rs.rows.length === 0) {
        return res.status(404).json({
          error: "Not found challenge!",
        });
      }

      if (rs.rows[0].status !== "active") {
        return res.status(422).json({
          error: "The challenge is not active.",
        });
      }

      const id: string = randomUUID();

      const resultQuery: QueryResult = await pool.query(
        "insert into chat_sessions(id,challenge_pda,researcher_wallet) values($1,$2,$3) returning id",
        [id, challenge_pda, wallet],
      );

      if (resultQuery.rowCount === 0) {
        return res.status(400).json({
          error: "Invalid to create chat session!",
        });
      }
      const result = resultQuery.rows[0].id;
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      return res.status(201).json({
        message: "Chat session created successfully.",
        id: result,
      });
    } catch (err: unknown) {
      return res.status(500).json({
        error: "Failed to fetch chats",
      });
    }
  },
);

app.get("/api/chat/sessions", requireAuth, async (req, res) => {
  const wallet: string = res.locals.session.wallet_address;
  if (!wallet) {
    return res.status(401).json({
      error: "Unauthorized!",
    });
  }
  try {
    const r: QueryResult = await pool.query(
      "select c.id,c.challenge_pda,c.researcher_wallet,c.created_at,ch.company_wallet, ch.description, ch.model_name, ch.provider, ch.status, ch.title from chat_sessions c join challenges ch on ch.challenge_pda = c.challenge_pda where c.researcher_wallet = $1 order by c.created_at asc",
      [wallet],
    );
    const result = r.rows;
    return res.status(200).json({
      result,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      error: "Failed to fetch chats!",
    });
  }
});

app.get(
  "/api/chat/sessions/:id/challenge/:challenge_pda/messages",
  requireAuth,
  async (req, res) => {
    const wallet: string = res.locals.session.wallet_address;
    const challenge_pda = req.params.challenge_pda;

    if (!wallet) {
      return res.status(401).json({
        error: "Unauthorized!",
      });
    }
    if (
      !challenge_pda ||
      typeof challenge_pda !== "string" ||
      challenge_pda.trim() === ""
    ) {
      return res.status(400).json({
        error: "Invalid data entered!",
      });
    }

    const id = req.params.id;
    const checkRegex =
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (
      !id ||
      typeof id !== "string" ||
      id.trim() === "" ||
      !checkRegex.test(id)
    ) {
      return res.status(400).json({
        error: "Invalid data entered",
      });
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const responseCheck: QueryResult = await client.query(
        "select ch.wallet_address,c.challenge_pda from challenge_participants ch join chat_sessions c on c.challenge_pda = ch.challenge_pda where ch.wallet_address = $1 and c.challenge_pda = $2",
        [wallet, challenge_pda],
      );
      if (responseCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Failed to fetch chats.",
        });
      }
      const r: QueryResult = await client.query(
        "SELECT m.id,m.chat_session_id,m.role,m.content,m.created_at FROM messages m JOIN chat_sessions ch ON ch.id = m.chat_session_id WHERE m.chat_session_id = $1 AND ch.researcher_wallet = $2 and ch.challenge_pda = $3;",
        [id, wallet, challenge_pda],
      );
      const result = r.rows;

      await client.query("COMMIT");

      return res.status(200).json({
        result,
      });
    } catch (error: unknown) {
      await client.query("ROLLBACK");
      return res.status(500).json({
        error: "Failed to fetch chats!",
      });
    } finally {
      await client.release();
    }
  },
);

app.post(
  "/api/company/ai-credentials",
  challengeManagementLimiter,
  requireAuth,
  async (req, res) => {
    const api_key: string = req.body.api_key;
    const provider: string = req.body.provider;
    const endpoint_url: string = req.body.endpoint_url;
    const challenge_pda: string = req.body.challenge_pda;

    if (
      !api_key ||
      typeof api_key !== "string" ||
      api_key.trim() === "" ||
      !provider ||
      typeof provider !== "string" ||
      provider.trim() === "" ||
      !endpoint_url ||
      typeof endpoint_url !== "string" ||
      !endpoint_url.trim() ||
      !challenge_pda ||
      typeof challenge_pda !== "string" ||
      !challenge_pda.trim()
    ) {
      return res.status(400).json({
        error: "Invalid data entered!",
      });
    }

    const wallet: string = res.locals.session.wallet_address;

    if (!wallet) {
      return res.status(401).json({
        error: "Unauthorized!",
      });
    }

    try {
      const key: string = encrypt(api_key);
      const rs: QueryResult = await pool.query(
        "insert into company_ai_credentials(id,company_wallet,provider,api_key_encrypted,endpoint_url,challenge_pda) values($1,$2,$3,$4,$5,$6)",
        [randomUUID(), wallet, provider, key, endpoint_url, challenge_pda],
      );
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      return res.status(200).json({
        ok: true,
      });
    } catch (err: unknown) {
      return res.status(500).json({
        error: "Failed to save credentials.",
      });
    }
  },
);

app.patch(
  "/api/company/ai-credentials/:id",
  challengeManagementLimiter,
  requireAuth,
  async (req, res) => {
    const api_key: string = req.body.api_key;
    const provider: string = req.body.provider;
    const endpoint_url: string = req.body.endpoint_url;
    const id = req.params.id;
    if (
      !id ||
      typeof id !== "string" ||
      id.trim() === "" ||
      !provider ||
      typeof provider !== "string" ||
      provider.trim() === "" ||
      !endpoint_url ||
      typeof endpoint_url !== "string" ||
      !endpoint_url.trim()
    ) {
      return res.status(400).json({
        error: "Invalid data entered!",
      });
    }

    const wallet: string = res.locals.session.wallet_address;

    if (!wallet) {
      return res.status(401).json({
        error: "Unauthorized!",
      });
    }

    try {
      const updateNotDraft = await pool.query(
        "SELECT c.status, co.challenge_pda FROM company_ai_credentials co JOIN challenges c ON c.challenge_pda = co.challenge_pda WHERE co.id = $1;",
        [id],
      );
      if (updateNotDraft.rows[0].status !== "draft") {
        return res.status(400).json({
          error: "Failed to save credentials, Because challenge is not draft.",
        });
      }
      if (api_key) {
        if (typeof api_key !== "string" || !api_key.trim()) {
          const key: string = encrypt(api_key);
          const rs: QueryResult = await pool.query(
            "update company_ai_credentials set provider = $1, endpoint_url = $2, api_key_encrypted=$3 where id=$4",
            [provider, endpoint_url, key, id],
          );
        }
      } else {
        const rs: QueryResult = await pool.query(
          "update company_ai_credentials set provider = $1, endpoint_url = $2 where id=$3",
          [provider, endpoint_url, id],
        );
      }
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      return res.status(200).json({
        ok: true,
      });
    } catch (err: unknown) {
      return res.status(500).json({
        error: "Failed to save credentials.",
      });
    }
  },
);

app.get("/api/company/ai-credentials", requireAuth, async (req, res) => {
  const wallet: string = res.locals.session.wallet_address;

  if (!wallet) {
    return res.status(401).json({
      error: "Unauthorized!",
    });
  }

  try {
    const rs: QueryResult = await pool.query(
      "select id,provider,endpoint_url from company_ai_credentials where company_wallet = $1",
      [wallet],
    );
    if (rs.rows.length === 0) {
      return res.status(400).json({
        error: "Failed to fetch credentials.",
      });
    }
    const result = rs.rows;
    return res.status(200).json({
      result,
    });
  } catch (err: unknown) {
    return res.status(500).json({
      error: "Failed to fetch credentials.",
    });
  }
});

app.get("/api/company/ai-credentials/:id", requireAuth, async (req, res) => {
  const wallet: string = res.locals.session.wallet_address;

  if (!wallet) {
    return res.status(401).json({
      error: "Unauthorized!",
    });
  }
  const id = req.params.id;
  if (!id || typeof id !== "string" || id.trim() === "") {
    return res.status(400).json({
      error: "Invalid data entered",
    });
  }
  try {
    const rs: QueryResult = await pool.query(
      "select id,provider,endpoint_url,challenge_pda from company_ai_credentials where company_wallet = $1 and id =$2",
      [wallet, id],
    );
    if (rs.rows.length === 0) {
      return res.status(400).json({
        error: "Failed to fetch credentials.",
      });
    }
    const result = rs.rows[0];
    return res.status(200).json({
      result,
    });
  } catch (err: unknown) {
    return res.status(500).json({
      error: "Failed to fetch credentials.",
    });
  }
});

app.post(
  "/api/challenges/:challengePda/ai-config",
  challengeManagementLimiter,
  requireAuth,
  async (req, res) => {
    const system_prompt: string = req.body.system_prompt;
    const secret: string = req.body.secret;
    const challengePda = req.params.challengePda;

    if (
      !system_prompt ||
      typeof system_prompt !== "string" ||
      system_prompt.trim() === "" ||
      !secret ||
      typeof secret !== "string" ||
      secret.trim() === ""
    ) {
      return res.status(400).json({
        error: "Invalid data entered!",
      });
    }
    if (typeof challengePda !== "string" || !challengePda.trim()) {
      return res.status(400).json({
        error: "Invalid challenge PDA",
      });
    }

    const wallet: string = res.locals.session.wallet_address;

    if (!wallet) {
      return res.status(401).json({
        error: "Unauthorized!",
      });
    }

    try {
      const rs: QueryResult = await pool.query(
        "select challenge_pda,company_wallet from challenges where company_wallet = $1 and challenge_pda=$2",
        [wallet, challengePda],
      );

      if (rs.rows.length === 0) {
        return res.status(403).json({
          error: "Unauthorized access",
        });
      }

      const sec: string = encrypt(secret);
      const sys_pr: string = encrypt(system_prompt);

      const result: QueryResult = await pool.query(
        "insert into challenge_ai_configs(challenge_pda,system_prompt_encrypted,secret_encrypted) values($1,$2,$3) on conflict(challenge_pda) do update set system_prompt_encrypted = excluded.system_prompt_encrypted, secret_encrypted = excluded.secret_encrypted",
        [challengePda, sys_pr, sec],
      );
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      return res.status(200).json({
        ok: true,
      });
    } catch (err: unknown) {
      return res.status(500).json({
        error: "Failed to save config.",
      });
    }
  },
);

app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const wallet = res.locals.session.wallet_address;

    const result = await pool.query(
      `SELECT * FROM user_stats WHERE wallet_address = $1`,
      [wallet],
    );

    return res.json(
      result.rows[0] ?? {
        wallet_address: wallet,
        challenges_created: 0,
        challenges_participated: 0,
        wins: 0,
        total_earnings: "0",
      },
    );
  } catch (error) {
    return res.status(500).json({ error: "Failed to load stats" });
  }
});

app.get("/api/dashboard/activity", requireAuth, async (req, res) => {
  try {
    const wallet = res.locals.session.wallet_address;

    const result = await pool.query(
      `
      SELECT
        id,
        wallet_address,
        activity_type,
        challenge_pda,
        metadata,
        created_at
      FROM user_activities
      WHERE wallet_address = $1
      ORDER BY created_at DESC, id DESC
      LIMIT 10
      `,
      [wallet],
    );

    return res.status(200).json({
      activities: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch recent activity",
    });
  }
});

app.get("/api/challenges-participants", requireAuth, async (req, res) => {
  try {
    const wallet = res.locals.session.wallet_address;

    const result = await pool.query(
      `
      SELECT
        c.challenge_pda, c.company_wallet, c.description, c.model_name, c.provider, c.status, c.title, ch.created_at
      FROM challenge_participants ch Join challenges c on ch.challenge_pda = c.challenge_pda
      WHERE c.company_wallet = $1
      ORDER BY ch.created_at DESC
      `,
      [wallet],
    );

    return res.status(200).json({
      activities: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch recent activity",
    });
  }
});

app.post(
  "/api/challenges/:challengePda/claim",
  challengeManagementLimiter,
  requireAuth,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const wallet = res.locals.session.wallet_address;
      const { challengePda } = req.params;

      await client.query("BEGIN");

      const r = await client.query(
        "select status,company_wallet from challenges where challenge_pda = $1",
        [challengePda],
      );
      if (r.rows[0].status !== "active") {
        await client.query("ROLLBACK");
        return res.status(403).json({
          error: "challenge is not active",
        });
      }
      if (r.rows[0].company_wallet === wallet) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "challenge cannot claim your challenge",
        });
      }

      const result = await client.query(
        `
      INSERT INTO challenge_participants (
        wallet_address,
        challenge_pda
      )
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING wallet_address
      `,
        [wallet, challengePda],
      );

      if (result.rowCount === 1) {
        await client.query(
          `
        INSERT INTO user_stats (
          wallet_address,
          challenges_participated
        )
        VALUES ($1, 1)

        ON CONFLICT (wallet_address)
        DO UPDATE SET
          challenges_participated =
            user_stats.challenges_participated + 1,
          updated_at = NOW()
        `,
          [wallet],
        );
      }
      await activity({
        dbConnect: pool,
        wallet: wallet,
        challenge_pda: challengePda as string,
        activity_type: "claim_challenge",
        metadata: { Activity: "Claimed Challenge" },
      });

      await client.query("COMMIT");
      io.to(`wallet:${res.locals.session.wallet_address}`).emit(
        "dashboard:update",
      );
      return res.json({
        success: true,
        newParticipation: result.rowCount === 1,
      });
    } catch (error) {
      await client.query("ROLLBACK");

      return res.status(500).json({
        error: "Failed to register participation",
      });
    } finally {
      client.release();
    }
  },
);

app.get("/api/user/billing", requireAuth, async (req, res) => {
  try {
    const walletAddress = res.locals.session?.wallet_address;

    if (!walletAddress) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const billingQuery = `
    SELECT id, amount, type, token_symbol, token_decimals, date, challenge_pda, wallet
    FROM billing
    WHERE wallet = $1
    ORDER BY date ASC`;

    const rs = await pool.query(billingQuery, [walletAddress]);

    return res.status(200).json({
      success: true,
      billingHistory: rs.rows,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
    });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const queryLeader: QueryResult = await pool.query(
      "SELECT wallet_address, wins, total_earnings FROM user_stats ORDER BY wins DESC LIMIT 10;",
    );
    return res.status(200).json(queryLeader.rows);
  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
    });
  }
});

app.get(
  "/api/analytics/activity-overview/:day",
  requireAuth,
  async (req, res) => {
    const day = req.params.day;
    if (day !== "7D" && day !== "30D" && day !== "3M" && day !== "1Y") {
      return res.status(400).json({
        error: "Invalid data entered",
      });
    }
    try {
      const walletAddress = res.locals.session?.wallet_address;
      const queryOverview: QueryResult = await pool.query(
        `SELECT days.generated_date::date AS activity_date, COALESCE(COUNT(ua.id), 0) AS total_count FROM (SELECT generate_series(CURRENT_DATE - INTERVAL '${day === "7D" ? "6 day" : day === "30D" ? "28 day" : day === "3M" ? "90 day" : "330 day"}', CURRENT_DATE, '${day === "7D" ? "1 day" : day === "30D" ? "7 day" : day === "3M" ? "30 day" : "30 day"}'::interval)::date AS generated_date) days LEFT JOIN user_activities ua ON ua.created_at >= days.generated_date AND ua.created_at < days.generated_date + '${day === "7D" ? "1 day" : day === "30D" ? "6 day" : day === "3M" ? "29 day" : "29 day"}'::interval AND ua.wallet_address = $1 AND ua.activity_type = 'create_challenge' GROUP BY days.generated_date ORDER BY activity_date ASC;`,
        [walletAddress],
      );
      return res.status(200).json(queryOverview.rows);
    } catch (error) {
      return res.status(500).json({
        error: "Server Error",
      });
    }
  },
);

app.get("/api/analytics/chat-messages/:day", requireAuth, async (req, res) => {
  const day = req.params.day;
  if (day !== "7D" && day !== "30D" && day !== "3M" && day !== "1Y") {
    return res.status(400).json({
      error: "Invalid data entered",
    });
  }
  const wallet = res.locals.session.wallet_address;
  try {
    const queryGetMessage = await pool.query(
      "select id as chat_session_id from chat_sessions where researcher_wallet = $1",
      [wallet],
    );
    const result = queryGetMessage.rows;

    let g: string[] = [];
    result.forEach((item) => {
      g.push(item.chat_session_id);
    });

    const queryOverview: QueryResult = await pool.query(
      `SELECT days.generated_date::date AS activity_date, COALESCE(COUNT(m.id), 0) AS total_count FROM (SELECT generate_series(CURRENT_DATE - INTERVAL '${day === "7D" ? "6 day" : day === "30D" ? "28 day" : day === "3M" ? "90 day" : "330 day"}', CURRENT_DATE, '${day === "7D" ? "1 day" : day === "30D" ? "7 day" : day === "3M" ? "30 day" : "30 day"}'::interval)::date AS generated_date) days LEFT JOIN messages m ON m.created_at >= days.generated_date - '${day === "7D" ? "0 day" : day === "30D" ? "6 day" : day === "3M" ? "29 day" : "29 day"}'::interval AND m.created_at < days.generated_date + INTERVAL '1 day'  AND m.chat_session_id = ANY($1) GROUP BY days.generated_date ORDER BY activity_date ASC;`,
      [g],
    );
    return res.status(200).json(queryOverview.rows);
  } catch (error) {
    return res.status(500).json({
      error: "Server Error",
    });
  }
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
  transports: ["polling", "websocket"],
});

const pubClient = new Redis("redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
});
const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.log("Redis connecting..."));
subClient.on("error", (err) => console.log("Redis connecting..."));

io.adapter(createAdapter(pubClient, subClient));

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("Unauthorized: No cookie found"));
    }

    const session_token = cookieHeader
      .split(";")
      .map((m) => m.trim())
      .find((m) => m.startsWith("session_token"))
      ?.slice("session_token=".length);

    if (!session_token) {
      return next(new Error("Unauthorized: No token found"));
    }

    const hash = createHash("sha256").update(session_token).digest("hex");

    const result = await pool.query(
      "select id, wallet_address, created_at, expires_at, revoked_at " +
        "from auth_sessions where token_hash = $1",
      [hash],
    );

    if (result.rows.length === 0) {
      return next(new Error("Unauthorized: Invalid session token"));
    }

    const session = result.rows[0];

    if (
      session.expires_at.getTime() <= Date.now() ||
      session.revoked_at !== null
    ) {
      return next(new Error("Unauthorized: Invalid session token"));
    }

    socket.data.session = session;

    next();
  } catch (error: unknown) {
    next(new Error("Authentication failed"));
  }
});

const socketMessages = new Map<string, number[]>();
const activeChats = new Set<string>();

io.on("connection", (socket) => {
  socket.join(`wallet:${socket.data.session.wallet_address}`);

  socket.on("chat:join", async (chatSessionId: string) => {
    const wallet: string = socket.data.session.wallet_address;
    if (!wallet) {
      return socket.emit("chat:error", {
        status: 401,
        message: "Unauthorized!",
      });
    }

    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (
      !chatSessionId ||
      typeof chatSessionId !== "string" ||
      chatSessionId.trim() === "" ||
      !regex.test(chatSessionId)
    ) {
      return socket.emit("chat:error", {
        status: 400,
        message: "Invalid data entered",
      });
    }

    try {
      const pg: QueryResult = await pool.query(
        "select id from chat_sessions where id = $1 and researcher_wallet = $2",
        [chatSessionId, wallet],
      );

      if (pg.rows.length === 0) {
        return socket.emit("chat:error", {
          status: 400,
          message: "Chat not found!",
        });
      }
      const data = pg.rows;
      socket.join(`chat:${chatSessionId}`);

      socket.emit("chat:joined", {
        chatSessionId,
      });
    } catch (err: unknown) {
      return socket.emit("chat:error", {
        status: 500,
        message: "Error to connection!",
      });
    }
  });

  socket.on("chat:send", async ({ chatSessionId, content }) => {
    const wallet: string = socket.data.session.wallet_address;
    if (!wallet) {
      return socket.emit("chat:error", {
        status: 401,
        message: "Unauthorized!",
      });
    }

    const currentTime = Date.now();
    const windowms = 60 * 1000;
    const maxmessage = 15;

    let usertime = socketMessages.get(wallet) || [];
    usertime = usertime.filter((i) => currentTime - i < windowms);

    if (usertime.length >= maxmessage) {
      return socket.emit("chat:error", {
        status: 429,
        message: "Too many messages. Please wait a minute before trying again.",
      });
    }

    usertime.push(currentTime);
    socketMessages.set(wallet, usertime);

    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (
      !chatSessionId ||
      typeof chatSessionId !== "string" ||
      chatSessionId.trim() === "" ||
      !regex.test(chatSessionId)
    ) {
      return socket.emit("chat:error", {
        status: 400,
        message: "Invalid data entered",
      });
    }

    if (
      !content ||
      typeof content !== "string" ||
      content.trim() === "" ||
      content.length > 10000
    ) {
      return socket.emit("chat:error", {
        status: 400,
        message: "Invalid message",
      });
    }

    try {
      const rs = await pool.query(
        "select id from chat_sessions where id = $1 and researcher_wallet = $2",
        [chatSessionId, wallet],
      );

      if (rs.rows.length === 0) {
        return socket.emit("chat:error", {
          status: 403,
          message: "Chat not found or unauthorized",
        });
      }

      const insertUserMessage: QueryResult = await pool.query(
        "insert into messages(id,chat_session_id,role,content) values($1,$2,'user',$3)",
        [randomUUID(), chatSessionId, content],
      );
      if (insertUserMessage.rowCount === 0) {
        return socket.emit("chat:error", {
          status: 400,
          message: "Sending failed!",
        });
      }
      if (!socket.rooms.has(`chat:${chatSessionId}`)) {
        return socket.emit("chat:error", {
          status: 403,
          message: "Join the chat first",
        });
      }
      if (activeChats.has(chatSessionId)) {
        return socket.emit("chat:error", {
          status: 409,
          message: "AI is already responding. Please wait.",
        });
      }
      activeChats.add(chatSessionId);
      io.to(`chat:${chatSessionId}`).emit("chat:message", {
        id: chatSessionId,
        role: "user",
        content,
      });

      const messagesQuery = await pool.query(
        "select role, content from messages where chat_session_id = $1 order by created_at asc, id asc",
        [chatSessionId],
      );

      const messages = messagesQuery.rows.map((e) => {
        return {
          role: e.role,
          content: e.content,
        };
      });

      const query: QueryResult = await pool.query(
        "select challenge_pda from chat_sessions where researcher_wallet=$1 and id =$2",
        [wallet, chatSessionId],
      );

      const challengePda = query.rows[0].challenge_pda;

      const responseAi = await fetchFunction(challengePda, messages, (text) => {
        io.to(`chat:${chatSessionId}`).emit("chat:chunk", { text });
      });

      const insertResposnseAi: QueryResult = await pool.query(
        "insert into messages(id,chat_session_id,role,content) values($1,$2,'assistant',$3)",
        [randomUUID(), chatSessionId, responseAi],
      );
      io.to(`chat:${chatSessionId}`).emit("chat:done");
    } catch (err: unknown) {
      if (err instanceof Error && "code" in err && err.code === 503) {
        return socket.emit("chat:error", {
          status: 503,
          message: "AI provider is busy. Please try again later.",
        });
      }
      if (err instanceof Error && "code" in err && err.code === 429) {
        return socket.emit("chat:error", {
          status: 429,
          message: "Too many requests. Please try again later.",
        });
      }
      return socket.emit("chat:error", {
        status: 500,
        message: "Error to connection!",
      });
    } finally {
      activeChats.delete(chatSessionId);
    }
  });
});

httpServer.listen(3000, () => {});
