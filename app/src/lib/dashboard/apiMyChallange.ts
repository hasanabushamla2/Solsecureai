import {
  web3Transaction,
  closeAccount,
  PauseOrResumeAccount,
} from "@/components/dashboard/my-challenges/web3-transaction";
import toast from "react-hot-toast";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Challenge } from "@/types/challenge";
import { updateAPI } from "./api";
import React from "react";

export const handleFund = async (
  WalletProvider: AnchorWallet,
  connect: () => Promise<void>,
  company_wallet: string,
  challenge_pda: string,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  setOpen(false);
  const toastId = toast.loading("Transaction loading......");
  try {
    const tx = await web3Transaction(
      WalletProvider,
      connect,
      company_wallet,
      challenge_pda,
    );
    toast.success("Transaction Success and funded challenge", {
      id: toastId,
    });
  } catch (err) {
    if (
      err instanceof Error &&
      err?.message?.includes("User rejected the request")
    ) {
      toast.error("Transaction Failed because user rejected ", {
        id: toastId,
      });
    } else {
      toast.error("Transaction Failed", { id: toastId });
    }
  }
};

export const handleClose = async (
  WalletProvider: AnchorWallet,
  connect: () => Promise<void>,
  company_wallet: string,
  challenge_pda: string,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  setOpen(false);
  const toastId = toast.loading("Transaction loading......");
  try {
    const tx = await closeAccount(
      WalletProvider,
      connect,
      company_wallet,
      challenge_pda,
    );
    toast.success("Transaction Success and closed challenge", {
      id: toastId,
    });
  } catch (err) {
    if (
      err instanceof Error &&
      err?.message?.includes("User rejected the request")
    ) {
      toast.error("Transaction Failed because user rejected ", {
        id: toastId,
      });
    } else {
      toast.error("Transaction Failed", { id: toastId });
    }
  }
};

export const handlePauseOrResume = async (
  WalletProvider: AnchorWallet,
  connect: () => Promise<void>,
  company_wallet: string,
  challenge_pda: string,
  pause: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  setOpen(false);
  const toastId = toast.loading("Transaction loading......");
  try {
    const tx = await PauseOrResumeAccount(
      WalletProvider,
      connect,
      company_wallet,
      challenge_pda,
      pause,
    );
    toast.success(
      `Transaction Success and ${pause === true ? "Paused" : "Activated"} challenge`,
      { id: toastId },
    );
  } catch (err) {
    console.error(err);
    if (
      err instanceof Error &&
      err?.message?.includes("User rejected the request")
    ) {
      toast.error("Transaction Failed because user rejected ", {
        id: toastId,
      });
    } else {
      toast.error("Transaction Failed", { id: toastId });
    }
  }
};

export const handleEdit = (
  my: Challenge,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setChallenge: React.Dispatch<React.SetStateAction<Challenge | undefined>>,
) => {
  setOpen(true);
  setChallenge(my);
};

export const submitEdit = async (
  id: string,
  updatedFields: Record<string, string>,
  loading: boolean,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  try {
    setLoading(true);
    const response = await updateAPI(id, updatedFields);
    toast.success("Save edits.");
    setOpen(false)
  } catch (err) {
    console.error(err)
    toast.error("Failed to edit.");
  } finally {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }
};
