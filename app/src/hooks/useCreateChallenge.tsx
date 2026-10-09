import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import idl from "@/anchor/idl/solsecureai.json";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { Connection } from "@solana/web3.js";
import { createHash } from "crypto";

import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import toast from "react-hot-toast";
import { createChallenge } from "@/lib/dashboard/api";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useCreateChallenge() {
  const RPC_URL = process.env.NEXT_PUBLIC_DEVNET_RPC;
  const connection = new Connection(RPC_URL!, {
    commitment: "confirmed",
    disableRetryOnRateLimit: true,
  });
  const wallet = useAnchorWallet();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [modelName, setModelName] = useState<string>("");
  const [providerAI, setProviderAI] = useState<string>("");
  const [prize, setPrize] = useState<string>("");
  const [api_key, setAPI] = useState<string>("");
  const [endpoint_url, setEndpoint] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16),
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(
      new Date().getTime() +
        7 * 24 * 60 * 60 * 1000 -
        new Date().getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16),
  );
  const [secret, setSecret] = useState<string>();
  const [sysProm, setSysProm] = useState<string>("");
  const [inputMintAddress, setInputMintAddress] = useState<string>();
  const [tokenDecimals, setTokenDecimals] = useState(9);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const sign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(
      "Preparing transaction... Please confirm in your wallet.",
    );
    if (!wallet?.publicKey) {
      toast.error("Please connect your wallet first", { id: toastId });
      return;
    }
    if (!inputMintAddress) {
      toast.error("Mint address is required", { id: toastId });
      return;
    }
    if (!title || title.trim() === "") {
      toast.error("Title is required", { id: toastId });
      return;
    }
    if (!description || description.trim() === "") {
      toast.error("Description is required", { id: toastId });
      return;
    }
    if (!modelName || modelName.trim() === "") {
      toast.error("Model name is required", { id: toastId });
      return;
    }
    if (!providerAI || providerAI.trim() === "") {
      toast.error("Provider is required", { id: toastId });
      return;
    }
    if (!prize || Number(prize) <= 0) {
      toast.error("Prize must be greater than 0", { id: toastId });
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Dates are required", { id: toastId });
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("Start date must be before end date", { id: toastId });
      return;
    }
    if (!secret || secret.trim() === "") {
      toast.error("Secret is required", { id: toastId });
      return;
    }
    if (!endpoint_url || endpoint_url.trim() === "") {
      toast.error("Endpoint URL is required", { id: toastId });
      return;
    }
    if (!sysProm || sysProm.trim() === "") {
      toast.error("System Prompt is required", { id: toastId });
      return;
    }
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new Program(idl, provider);

    const challengeId = new anchor.BN(Date.now());

    const mintPublicKey = new PublicKey(inputMintAddress.trim());
    const mintInfo = await getMint(connection, mintPublicKey);
    setTokenDecimals(mintInfo.decimals);
    setInputMintAddress(mintPublicKey.toBase58());
    if (!mintInfo) {
      toast.error("Mint not found or invalid to fetch", { id: toastId });
      return;
    }

    const [challengeAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("challenge"),
        wallet.publicKey.toBuffer(),
        challengeId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );

    const vaultAddress = getAssociatedTokenAddressSync(
      new PublicKey(inputMintAddress),
      new PublicKey(challengeAddress),
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const secret_hash: number[] = Array.from(
      createHash("sha256").update(secret!).digest(),
    );
    try {
      const txSignature = await program.methods
        .createChallenge(
          challengeId,
          new anchor.BN(Number(prize || 0) * Math.pow(10, tokenDecimals)),
          new anchor.BN(new Date(startDate).getTime() / 1000),
          new anchor.BN(new Date(endDate).getTime() / 1000),
          secret_hash,
        )
        .accountsStrict({
          company: wallet.publicKey,
          tokenMint: new PublicKey(inputMintAddress),
          challenge: challengeAddress,
          vault: vaultAddress,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .rpc();

      const result = await createChallenge(
        challengeAddress.toBase58(),
        txSignature,
        title,
        description,
        modelName,
        providerAI,
        api_key,
        endpoint_url,
        sysProm,
        secret,
      );

      if (result.error) {
        toast.error("Invalid to save challenge", {
          id: toastId,
        });
        return;
      }
      setTitle("");
      setDescription("");
      setModelName("");
      setProviderAI("");
      setPrize("");
      setStartDate("");
      setEndDate("");
      setSecret("");
      setInputMintAddress(undefined);
      setAPI("");
      setEndpoint("");
      setSysProm("");

      toast.success("Challenge created successfully on Solana Devnet!", {
        id: toastId,
      });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error && error.message?.includes("User rejected")) {
        toast.error("Transaction cancelled by user.", { id: toastId });
      } else {
        toast.error(
          "Failed to create challenge. Please check your inputs and balance.",
          { id: toastId },
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    states: {
      title,
      description,
      modelName,
      providerAI,
      prize,
      api_key,
      endpoint_url,
      secret,
      inputMintAddress,
      tokenDecimals,
      loading,
      startDate,
      endDate,
      sysProm,
    },
    setters: {
      setTitle,
      setDescription,
      setModelName,
      setProviderAI,
      setPrize,
      setAPI,
      setEndpoint,
      setSecret,
      setInputMintAddress,
      setTokenDecimals,
      setStartDate,
      setEndDate,
      setSysProm,
    },
    sign,
  };
}
