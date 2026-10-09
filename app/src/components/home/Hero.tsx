"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import HeroState from "./HeroStates";
import { usePathname } from "next/navigation";


export default function Hero() {
  const pathname = usePathname();
  return (
    <>
    <section aria-labelledby="hero-title" className="flex relative flex-col gap-5 mt-5">
      <p className="bg-[#7AD9B0] rounded-full py-2 px-3 w-fit font-semibold text-primary">
        PROMPT INJECTION AREA
      </p>
      <h1
        id="hero-title"
        className="text-2xl min-[400]:text-4xl md:text-5xl text-white! font-black tracking-tight"
      >
        Challenge AI skills, earn <br className="hidden md:block" /> crypto{" "}
        <span className="bg-gradient-to-r bg-clip-text text-transparent from-primary via-primary to-white">
          {" "}
          rewards.
        </span>
      </h1>
      <p className="text-white/50 font-light">
        The ultimate arena to stress-test autonomous agents, expose AI{" "}
        <br className="hidden md:block" />
        vulnerability gaps, and claim web3 cryptographic bounties.
      </p>
      <div className="flex flex-col md:flex-row gap-5">
        <Button className="font-semibold text-white bg-gradient-to-r from-primary via-primary/50 to-primary ">
          <Link
            href="/challenges"
            aria-current={pathname === "/challenges" ? "page" : undefined}
          >
            Explore Challenges
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="font-semibold text-white backdrop-blur-md transition-all hover:text-primary/80"
        >
          <Link
            href="/challenges"
            aria-current={pathname === "/challenges" ? "page" : undefined}
          >
            Create Challenge
          </Link>
        </Button>
      </div>
      <HeroState />
      
    </section>
    </>
  );
}
