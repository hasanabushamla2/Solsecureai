"use client";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import MenuSmall from "./MenuSmall";
import { useEffect, useState } from "react";
import MenuSmallContent from "./MenuSmallContent";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);
  return (
    <>
      <header
        role="banner"
        className={`p-4 sticky top-0 w-full border-b border-white/10 bg-black/10 backdrop-blur-md transition-all duration-300 ease-in-out header-scroll-blur z-99 flex items-center justify-center`}
      >
        <div className="flex items-center justify-between flex-col md:flex-row gap-5 w-full md:w-7xl">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 no-underline text-white"
              aria-current={pathname === "/" ? "page" : undefined}
            >
              <Image src="/icon.png" width={40} height={40} alt="" />
              <h2 className="text-2xl font-black tracking-tight m-0">
                SolSecureAI
              </h2>
            </Link>
          </div>
          <Navbar />
          <div className="flex justify-between items-center gap-4">
            <MenuSmall open={open} setOpen={setOpen}  />
            
            <div className="flex gap-5">
              <ThemeToggle header />

              <Link href={'/login'}>
              <Button className="bg-primary font-semibold text-white">
                Connect Wallet
              </Button>
              </Link>
            </div>
          </div>
        </div>
        <motion.div
          initial={false}
          animate={{ gridTemplateRows: open ? "1fr" : "0fr" }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="grid lg:hidden absolute inset-x-0 top-full"
        >
          <div className="min-h-0 overflow-hidden">
            <MenuSmallContent open={open} setOpen={setOpen} />
          </div>
        </motion.div>
      </header>
    </>
  );
}
