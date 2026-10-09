"use client";
import { getChallengesAll } from "@/lib/dashboard/api";
import { Challenge } from "@/types/challenge";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, Cpu, Server, Sparkle, User2, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Card() {
  

  const fetchChallenges = async () => {
    try {
      const res = await getChallengesAll();
      return res;
      
    } catch (err) {}
  };
  const {data: challengesCash,isLoading,refetch} = useQuery<Challenge[]>({
    queryKey: ['challenges'],
    queryFn: fetchChallenges
  })
  
  const challengeThemes = [
    {
      name: "Cosmic Purple",
      accent: "#8B5CF6",
      glow: "rgba(139, 92, 246, 0.8)",
      glowCard: "rgba(124, 58, 237, 0.28)",
      image: "/challenges/1.png",
    },
    {
      name: "Cyber Cyan",
      accent: "#06B6D4",
      glow: "rgba(6, 182, 212, 0.8)",
      glowCard: "rgba(124, 58, 237, 0.28)",
      image: "/challenges/2.png",
    },
    {
      name: "Emerald Core",
      accent: "#10B981",
      glow: "rgba(16, 185, 129, 0.8)",
      glowCard: "rgba(124, 58, 237, 0.28)",
      image: "/challenges/3.png",
    },
    {
      name: "Neon Pink",
      accent: "#EC4899",
      glow: "rgba(236, 72, 153, 0.8)",
      glowCard: "rgba(124, 58, 237, 0.28)",
      image: "/challenges/4.png",
    },
    {
      name: "Solar Orange",
      accent: "#F97316",
      glow: "rgba(249, 115, 22, 0.8)",
      glowCard: "rgba(124, 58, 237, 0.28)",
      image: "/challenges/5.png",
    },
    {
      name: "Electric Blue",
      accent: "#3B82F6",
      glow: "rgba(59, 130, 246, 0.8)",
      glowCard: "rgba(124, 58, 237, 0.28)",
      image: "/challenges/6.png",
    },
    {
      name: "Crimson AI",
      accent: "#EF4444",
      glow: "rgba(239, 68, 68, 0.8)",
      glowCard: "rgba(124, 58, 237, 0.28)",
      image: "/challenges/7.png",
    },
    {
      name: "Golden Matrix",
      accent: "#F59E0B",
      glow: "rgba(245, 158, 11, 0.8)",
      glowCard: "rgba(124, 58, 237, 0.28)",
      image: "/challenges/8.png",
    },
    {
      name: "Teal Flow",
      accent: "#14B8A6",
      glow: "rgba(20, 184, 166, 0.8)",
      glowCard: "rgba(124, 58, 237, 0.28)",
      image: "/challenges/9.png",
    },
    {
      name: "Crystal Violet",
      accent: "#7C3AED",
      glow: "rgba(124, 58, 237, 0.8)",
      glowCard: "rgba(124, 58, 237, 0.28)",
      image: "/challenges/10.png",
    },
  ];
  const statusConfig: Record<string, { label: string; classes: string }> = {
    active: {
      label: "Active",
      classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    paused: {
      label: "Paused",
      classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    completed: {
      label: "Completed",
      classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    draft: {
      label: "Draft",
      classes: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    },
    closed: {
      label: "Closed",
      classes: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
  };

  
    const now = new Date().getTime();
    return (
      <div className="text-foreground py-10 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {challengesCash &&
            challengesCash?.map((e, index) => {
              const date =
                (now - new Date(e.created_at || "").getTime()) /
                (1000 * 60 * 60 * 24);

              const p = Math.floor(Math.random() * 10);

              return (
                <div
                  className={`flex flex-col p-4 bg-background gap-4 transition-all duration-300 ease-in-out hover:scale-105 border-y-2 rounded-2xl`}
                  key={index}
                  style={{
                    borderColor: "transparent",
                    borderImage: `linear-gradient(to right, rgba(255,255,255,0) 0%, ${challengeThemes[p]?.accent || "#7C3AED"} 50%, rgba(255,255,255,0.0) 100%) 1`,
                  }}
                >
                  <div className="flex relative flex-row justify-between items-center">
                    <div
                      className={` px-4 rounded-full text-center items-center text-white transition-all duration-300 ease-in-out flex flex-row`}
                      style={{
                        backgroundColor:
                          challengeThemes[p]?.accent || "#10B981",
                        boxShadow: `2px 2px 10px ${challengeThemes[p]?.glow || "rgba(37,99,235,0.12)"}`,
                      }}
                    >
                      <div className=" flex flex-row items-center">
                        <svg
                          className="w-3.5 h-3.5 text-blue-100 fill-current drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c0 6.627-5.373 12-12 12 6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" />
                        </svg>
                        AI Challenge
                      </div>
                    </div>
                    <Image
                      src={challengeThemes[p]?.image || ""}
                      width={100}
                      height={100}
                      alt="challenge"
                      className="absolute right-0 top-1/2 w-30 z-0 opacity-50"
                      style={{
                        filter: `drop-shadow(5px 10px 20px ${challengeThemes[p]?.glow || "rgba(37,99,235,0.12)"})`,
                      }}
                    />
                  </div>
                  <p className="font-bold z-99 truncate">{e?.title}</p>
                  <p className="z-99 truncate">{e?.description}</p>
                  <div
                    className="flex flex-row text-white items-center px-2 rounded-full"
                    style={{
                      backgroundColor: challengeThemes[p]?.accent || "#10B981",
                    }}
                  >
                    <Server />
                    <p className="text-white truncate px-4 py-1 rounded-full gap-2">
                      {e?.provider}
                    </p>
                  </div>
                  <div
                    className="flex flex-row text-white items-center px-2 rounded-full"
                    style={{
                      backgroundColor: challengeThemes[p]?.accent || "#10B981",
                    }}
                  >
                    <Cpu/>
                    <p className="text-white truncate px-4 py-1 rounded-full gap-2">
                      
                      {e?.model_name}
                    </p>
                  </div>

                  <div className="flex flex-row items-center justify-between">
                    <p className="flex flex-row items-center gap-2">
                      <Wallet />
                      {(e?.amount || 0) / 10 ** (e.token_decimals || 1)}{" "}
                      {e.token_symbol}
                    </p>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border backdrop-blur-sm ${
                          statusConfig[e?.status?.toLowerCase()]?.classes ||
                          "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            e?.status?.toLowerCase() === "active"
                              ? "bg-emerald-400"
                              : e?.status?.toLowerCase() === "paused"
                                ? "bg-amber-400"
                                : e?.status?.toLowerCase() === "completed"
                                  ? "bg-blue-400"
                                  : e?.status?.toLowerCase() === "closed"
                                    ? "bg-rose-400"
                                    : "bg-zinc-400"
                          }`}
                        />
                        {statusConfig[e?.status?.toLowerCase()]?.label ||
                          e?.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-between">
                    <p className="flex flex-row gap-2">
                      <User2 /> {e?.total_participants || 0}{" "}
                    </p>
                    <p className="flex flex-row gap-2">
                      <Clock /> {Math.round(date)} day left
                    </p>
                  </div>

                  <Link
                    href={"/challenges"}
                    className="px-4 py-2.5 rounded-full w-full text-center text-white font-bold block transition-all duration-300 bg-[var(--btn-bg)] hover:brightness-125 hover:scale-[1.02] active:scale-[0.98]"
                    style={
                      {
                        "--btn-bg": challengeThemes[p]?.accent || "#10B981",
                        boxShadow: `2px 2px 20px ${challengeThemes[p]?.glow || "rgba(37,99,235,0.12)"}`,
                      } as React.CSSProperties
                    }
                  >
                    claim
                  </Link>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

