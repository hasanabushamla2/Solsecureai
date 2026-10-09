"use client";
import ThemeToggle from "@/components/layout/ThemeToggle";
import Link from "next/link";
import Image from "next/image";
import ConnectWallet from "@/components/auth/ConnectWallet";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "react-hot-toast";
import { Check } from "lucide-react";
import { motion } from "motion/react";

export default function Page() {
  const { publicKey } = useWallet();
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Public key copied to clipboard!");
    }
  };

  return (
    <section
      aria-labelledby="login-title"
      className="flex items-center justify-center min-h-screen flex-col gap-5"
    >
      <h1 id="login-title" className="text-3xl font-bold">
        Sign in to SolSecureAI
      </h1>
      <div className="text-primary bg-foreground p-4 rounded-xl flex justify-between items-center">
        <Link href="/" aria-label="SolSecureAI home">
          <Image src="/icon.png" width={40} height={40} alt="SolSecureAI" />
        </Link>
        <ConnectWallet />
        <ThemeToggle />
      </div>
      <div className="flex flex-row items-center justify-between gap-5">
        {publicKey && (
          <>
            <p className="font-mono">{publicKey?.toBase58()}</p>

            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy public key to clipboard"
              aria-live="polite"
              className="hover:scale-105 active:scale-95 transition-transform"
            >
              {copied === false ? (
                <motion.span
                  key="check-icon"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.55 }}
                >
                  <Copy aria-hidden="true" />
                </motion.span>
              ) : (
                <motion.span
                  key="copy-icon"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.55 }}
                >
                  <Check className="text-primary" aria-hidden="true" />
                </motion.span>
              )}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
