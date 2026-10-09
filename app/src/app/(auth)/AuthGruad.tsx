"use client";

import { getMe } from "@/lib/auth/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGraud({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "guest" | "authenticated">(
    "checking",
  );
  const router = useRouter();

  useEffect(() => {
    const getme = async () => {
      try {
        const res = await getMe();
        if (res.id) {
          setStatus("authenticated");
          router.replace("/dashboard");
        } else {
          setStatus("guest");
        }
      } catch (err) {
        setStatus("guest");
        console.error(err);
      }
    };
    void getme();
  }, []);

  if (status === "checking" || status === "authenticated") {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 animate-spin" />
        </div>

        <div className="mt-4 flex flex-col items-center gap-1">
          <p className="text-xs font-medium text-zinc-400 tracking-widest animate-pulse">
            Loading
          </p>
        </div>
      </div>
    );
  }

  return children;
}
