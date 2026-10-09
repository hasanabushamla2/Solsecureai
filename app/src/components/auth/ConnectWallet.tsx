"use client";
import { getMe, getSign, verifySign } from "@/lib/auth/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

export default function ConnectWallet() {
  const {
    wallet,
    connected,
    connecting,
    connect,
    disconnect,
    publicKey,
    signMessage,
  } = useWallet();
  const { setVisible } = useWalletModal();
  const [error, setError] = useState("");
  const [mount, setMount] = useState(false);
  const login = useRef(false);
  const router = useRouter();

  useEffect(() => {
    setMount(true);
    
    if (!connected || !publicKey) return;
    const loadSign = async () => {
      if (login.current) return;
      login.current = true;
      try {
        const wallet = publicKey?.toBase58();
        const result = await getSign(wallet);
        const message = result.message;
        if (!signMessage) {
          toast.error("Wallet does not support message signing");
          return;
        }
        const messageBytes = new TextEncoder().encode(message);

        const signatureBytes = await signMessage(messageBytes);

        const signature = btoa(String.fromCharCode(...signatureBytes));
        const res = await verifySign(result.id, result.nonce, signature);

        const resMe = await getMe();
        if (resMe.wallet_address !== wallet) {
          toast.error("Wallet does not support message signing");
        }
        router.push("/dashboard");
      } catch (err) {
        console.error("Wallet does not support message signing");
      } finally {
        login.current = false;
      }
    };

    void loadSign();
  }, [publicKey, connected, signMessage]);
  


  const handleConnect = async () => {
    setError("");

    if (!wallet) {
      setVisible(true);
      return;
    }

    try {
      await connect();
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setError("Could not connect to Phantom.");
    }
  };

  if (!mount) {
    return <p />;
  }

  return (
    <>
   
      <div className="flex flex-col items-center gap-4">
        
        <button
          type="button"
          onClick={handleConnect}
          disabled={connecting}
          className="rounded-xl bg-primary p-4 mx-8 font-semibold text-primary-foreground"
        >
          {connecting
            ? "Connecting..."
            : connected
              ? "Wallet connected"
              : wallet
                ? `Connect ${wallet.adapter.name}`
                : "Select Wallet"}
        </button>

        

        {error && (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      
    </>
  );
}
