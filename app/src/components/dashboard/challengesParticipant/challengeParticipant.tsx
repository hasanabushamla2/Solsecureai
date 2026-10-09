"use client";
import { Modal } from "react-responsive-modal";
import { motion, AnimatePresence } from "motion/react";
import Input from "@/components/dashboard/create-challenge/Input";
import { useState } from "react";
import { Copy, Check, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { submitSecret } from "@/components/dashboard/my-challenges/web3-transaction";
import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Challenge } from "@/types/challenge";
import CopyText from "../challenges/CopyText";
import { useQueryClient } from "@tanstack/react-query";
interface statusConfig {
  bg: string;
  dot: string;
  label: string;
}
export default function ChallengeParticipantModal({
  open,
  setOpen,
  statusConfig,
}: {
  open: Challenge | null;
  setOpen: React.Dispatch<React.SetStateAction<Challenge | null>>;
  statusConfig: statusConfig | null;
}) {
  const queryClient = useQueryClient();
  const connect = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet"
      ? process.env.NEXT_PUBLIC_DEVNET_RPC!
      : process.env.NEXT_PUBLIC_MAINNET_RPC!,
    "confirmed",
  );
  const wallet = useAnchorWallet();
  const [copy, setCopy] = useState(true);
  const [copyChallenge, setCopyChallenge] = useState(true);
  const [secret, setSecret] = useState("");

  const handleCopy = async (str: string) => {
    await navigator.clipboard.writeText(str);
    setCopy(false);

    setTimeout(() => {
      setCopy(true);
    }, 2000);
  };
  const handleSubmit = async (
    wallet: AnchorWallet,
    connect: Connection,
    wallet_address: string | PublicKey,
    challenge_pda: string,
    secret: string,
    company_wallet?: string,
  ) => {
    const toastId = toast.loading("Claiming .......");
    try {
      if (wallet_address.toString() === company_wallet) {
        toast.error("You cannot fully challenge your own company.", {
          id: toastId,
        });
        setOpen(null);
        return;
      }
      if (secret.trim() === "") {
        toast.error("Secret input is required.", { id: toastId });
        return;
      }
      const res = await submitSecret(
        wallet,
        connect,
        wallet_address,
        challenge_pda,
        secret,
      );
      setSecret("");
      setOpen(null);
      toast.success("I got the challenge claim", { id: toastId });
    } catch (err) {
      toast.error("An error occurred in the challenge claim.", { id: toastId });
    }
  };
  if (!open) return null;
  return (
    <Modal
      key={open.challenge_pda}
      open={open && true}
      onClose={() => setOpen(null)}
      center
      classNames={{
        modal:
          "backdrop-blur-md border border-border/5 p-6 rounded-2xl max-w-md w-10/12 md:w-full",
        overlay: " backdrop-blur-sm",
      }}
      styles={{
        modal: {
          background:
            typeof document !== "undefined" &&
            document.documentElement.classList.contains("dark")
              ? "#000"
              : "#fff",
        },
        closeButton: {
          fill: "currentColor",
          color:
            typeof document !== "undefined" &&
            document.documentElement.classList.contains("dark")
              ? "#fff"
              : "#000",
        },
      }}
    >
      <h2 className="text-foreground text-lg font-bold mb-4">View Challenge</h2>
      <div className="text-foreground gap-2 flex flex-col">
        <p className="text-xl font-bold">{open.title}</p>
        <p>{open.description}</p>
        <p
          className={`flex items-center gap-2 ${statusConfig!.bg} rounded-full w-28 justify-center font-bold py-0.5 capitalize`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${statusConfig!.dot} inline-block`}
          ></span>
          {statusConfig!.label}
        </p>
        <div className="flex items-center gap-2">
          <p>
            Owner Challenge:{" "}
            <span className="text-foreground/50">
              {open.company_wallet?.slice(0, 8)}....
              {open.company_wallet?.slice(-8)}
            </span>
          </p>
          <button
            type="button"
            className="flex items-center outline-0"
            onClick={() => handleCopy(open.company_wallet)}
          >
            <AnimatePresence mode="wait">
              {copy === true ? (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  className="inline-block"
                >
                  <Copy className="w-5 h-5 text-foreground hover:text-primary transition-all duration-300 ease-in-out" />
                </motion.span>
              ) : (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: "95%" }}
                  animate={{ opacity: 1, scale: "105%" }}
                  className="inline-block"
                >
                  <Check className="w-5 h-5 text-primary" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
        <p>
          Model name:{" "}
          <span className="text-foreground/50">
            {open.model_name ? open.model_name : "Not data yet"}
          </span>
        </p>
        <p>
          Provider:{" "}
          <span className="text-foreground/50">
            {open.provider ? open.provider : "Not data yet"}
          </span>
        </p>
        <CopyText
          label="Challenge PDA"
          text={open.challenge_pda}
          copy={copyChallenge}
          setCopy={setCopyChallenge}
        />
        {open.status === "active" && (
          <Input
            input={secret}
            setInput={setSecret}
            placeholder="Secret"
            type="password"
            Icon={KeyRound}
            isPassword={true}
            label="Secret"
            className="outline-0 w-full"
          />
        )}
      </div>
      {open.status === "active" && (
        <button
          onClick={async () => {
            await handleSubmit(
              wallet!,
              connect!,
              wallet?.publicKey!,
              open.challenge_pda,
              secret,
              open.company_wallet,
            );
            queryClient.invalidateQueries({
              queryKey: ["challengesParticipant"],
            });
          }}
          className="text-white bg-primary float-right mt-2 font-semibold py-3 px-12 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(16,185,129,0.2)]"
          type="submit"
        >
          Submit secret
        </button>
      )}
    </Modal>
  );
}
