"use client";
import { useSearchParams } from "next/navigation";

export default function ContentArea({ children }: { children: React.ReactNode }) {
  const open = useSearchParams().get("sidebar") === "true";

  return (
    <div className={`${open ? "hidden lg:block" : "block"} w-full flex-1 bg-background`}>
      {children}
    </div>
  );
}