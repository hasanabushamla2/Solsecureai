"use client";
import { getMe } from "@/lib/dashboard/api";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function UserWalletCard() {
  const { connect, connecting, connected, wallet, publicKey } = useWallet();
  const [timeSaved, setTimeSaved] = useState("");
  const [me, setMe] = useState("");
  const [copy, setCopy] = useState(true);
  useEffect(() => {
    const tryConnect = async () => {
      let savedtime = sessionStorage.getItem("joined_time");
      if (!savedtime) {
        savedtime = new Date().toLocaleDateString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        sessionStorage.setItem("joined_time", savedtime);
      }
      setTimeSaved(savedtime);
      try {
        if (!publicKey || !wallet) {
          await connect();
        }
        const getme = await getMe();
        if (getme && getme.id) {
          setMe(getme.id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    void tryConnect();
  }, []);
  const handleCopy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey.toBase58());
    setCopy(false);

    setTimeout(() => {
      setCopy(true);
    }, 2000);
  };
  return (
    <div className="flex flex-col gap-5 border-border/5 border shadow-lg p-4 rounded-xl">
      <div className="flex justify-between items-center">
        <p className="font-bold text-xl">Your Wallet</p>
        <button type="button" onClick={() => handleCopy()}>
          <AnimatePresence mode="wait">
            {copy === true ? (
              <motion.span
                key="copy"
                initial={{ opacity: 0, rotate: 360 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 360 }}
                className="inline-block"
              >
                <Copy className="w-5 h-5 text-foreground hover:text-primary transition-all duration-300 ease-in-out" />
              </motion.span>
            ) : (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale:"95%" }}
                animate={{ opacity: 1, scale: "105%" }}
                className="inline-block"
              >
                <Check className="w-5 h-5 text-primary" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <div className="border-b border-border/5 pb-4 flex items-center justify-between flex-col md:flex-row gap-4 md:gap-0">
        <Image
          className="object-center object-cover"
          src="/solanaLogoMark.svg"
          height={40}
          width={40}
          alt="Solana LOGO"
        />
        <p className="text-foreground/50 lg:text-sm">
          {publicKey?.toBase58().slice(0, 8)}.......
        </p>
        <p className="flex items-center text-xs md:text-sm gap-2 shadow-[0_0_20px_2px_rgba(52,211,153,0.2)] bg-primary/20 px-4 text-primary py-1 rounded-4xl">
          <span className="w-2 bg-primary h-2 rounded-full inline-block shadow-[0_0_12px_4px_rgba(52,211,153,0.2)]" />
          Connected
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <p>Joined</p>
        <p className="text-foreground/50">{timeSaved}</p>
        <p>User ID</p>
        <p className="text-foreground/50">{me.slice(0, 16)}....</p>
      </div>
    </div>
  );
}
