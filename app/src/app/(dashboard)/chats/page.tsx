"use client";
import { useState, useEffect, useMemo } from "react";
import { Cloud, Link2, Copy, Check } from "lucide-react";
import {
  getChallengesParticipants,
  getChatSessions,
} from "@/lib/dashboard/api";
import Link from "next/link";
import "react-responsive-modal/styles.css";
import "react-responsive-modal/styles.css";
import { socket } from "@/lib/socket";
import { useSearch } from "@/hooks/useSearch";
import CopyTextCard from "@/components/dashboard/challenges/CopyTextCard";

interface ChatSession {
  id: string;
  challenge_pda: string;
  researcher_wallet: string;
  created_at: string;
  company_wallet: string;
  description: string;
  model_name: string;
  provider: string;
  status: string;
  title: string;
}

export default function page() {
  const [challenges, setChallenges] = useState(null);
  const [copy, setCopy] = useState("");
  const [chatSessions, setChatSessions] = useState<ChatSession[] | null>(null);
  const { searchQuery } = useSearch();
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return chatSessions;
    return chatSessions?.filter((i) => i.title.toLowerCase().includes(q));
  }, [searchQuery, chatSessions]);
  const fetchAPIs = async () => {
    try {
      const getChallenge = await getChallengesParticipants();
      setChallenges(getChallenge.activities);
      const res = await getChatSessions();

      setChatSessions(res.result.reverse());
    } catch (err) {
      console.error("Invalid to fetch api credentials");
    }
  };
  useEffect(() => {
    if (socket.connected) socket.connect();
    socket?.on("dashboard:update", fetchAPIs);
    fetchAPIs();
    return () => {
      socket?.off("dashboard:update", fetchAPIs);
      socket.disconnect();
    };
  }, [socket]);
  return (
    <div className="mt-5 p-4">
      <div className="grid grid-cols-1 gap-4 mx-auto">
        {filtered?.length === 0 && (
          <p className="text-foreground text-center">No data yet</p>
        )}
        {filtered &&
          filtered.map((challenge: ChatSession, index: number) => {
            const c = chatSessions?.find(
              (item) => item.challenge_pda === challenge.challenge_pda,
            );
            return (
              <div key={`${challenge.id}-${index}`}>
                {challenge.status === "active" ? (
                  <Link
                    href={`/chats/challenge/${c?.challenge_pda}/c/${c?.id}/`}
                    className="bg-background backdrop-blur-md border border-border rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 shadow-xl group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-foreground/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all duration-300">
                        <Cloud className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-foreground font-semibold text-base tracking-wide group-hover:text-emerald-400 transition-colors">
                          {challenge.title}
                        </h3>
                        <div className="flex flex-row gap-3 items-center">
                          <div>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 opacity-80">
                              <Link2 className="w-3.5 h-3.5 text-foreground" />
                              <span className="truncate max-w-[200px]">
                                {challenge.challenge_pda.slice(0, 10)}...
                              </span>
                            </p>
                          </div>
                          <CopyTextCard
                            copy={copy}
                            setCopy={setCopy}
                            challenge={challenge}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {challenge.status === "active" && (
                        <button
                          onClick={() => {}}
                          className="border-primary/30 px-4 bg-emerald-500/5 text-primary hover:bg-primary hover:text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300"
                        >
                          Research
                        </button>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="bg-background backdrop-blur-md border border-white/[0.05] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 shadow-xl group">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-foreground/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all duration-300">
                        <Cloud className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-foreground font-semibold text-base tracking-wide group-hover:text-emerald-400 transition-colors">
                          {challenge.title}
                        </h3>
                        <div className="flex flex-row gap-3 items-center">
                          <div>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 opacity-80">
                              <Link2 className="w-3.5 h-3.5 text-foreground" />
                              <span className="truncate max-w-[200px]">
                                {challenge.challenge_pda.slice(0, 10)}...
                              </span>
                            </p>
                          </div>
                          <CopyTextCard
                            copy={copy}
                            setCopy={setCopy}
                            challenge={challenge}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {challenge.status === "active" && (
                        <button
                          onClick={() => {}}
                          className="border-primary/30 px-4 bg-emerald-500/5 text-primary hover:bg-primary hover:text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300"
                        >
                          Research
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
