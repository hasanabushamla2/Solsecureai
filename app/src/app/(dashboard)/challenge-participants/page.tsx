"use client";
import { useState, useEffect, useMemo } from "react";
import { Cloud, Link2 } from "lucide-react";
import { getChallengesParticipants } from "@/lib/dashboard/api";
import "react-responsive-modal/styles.css";
import { Challenge } from "@/types/challenge";
import ChallengeParticipantModal from "@/components/dashboard/challengesParticipant/challengeParticipant";
import { socket } from "@/lib/socket";
import CopyTextCard from "@/components/dashboard/challenges/CopyTextCard";
import { useSearch } from "@/hooks/useSearch";
import { useQuery } from "@tanstack/react-query";
import ComponentLoading from "@/components/layout/Loading";
interface statusConfig {
  bg: string;
  dot: string;
  label: string;
}
export default function page() {
  const [statusConfig, setStatusConfig] = useState<statusConfig | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>();
  const [open, setOpen] = useState<Challenge | null>(null);
  const [copy, setCopy] = useState("");
  const { searchQuery } = useSearch();
  const [loading,setLoading] = useState<boolean>(false)

  const fetchAPIs = async () => {
    try {
      const res = await getChallengesParticipants();
      const c = res.activities;
      return c;
      setChallenges(c);
    } catch (err) {
      return [];
    }
  };

  const {
    data: challengesParticipant = [],
    isLoading,
    refetch: refetchChallengesParticipant,
  } = useQuery<Challenge[]>({
    queryKey: ["challengesParticipant"],
    queryFn: fetchAPIs,
  });

  const filter = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return challengesParticipant;
    return challengesParticipant?.filter((i) =>
      i.title.toLowerCase().includes(q),
    );
  }, [searchQuery, challengesParticipant]);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket?.on("dashboard:update", refetchChallengesParticipant);
    return () => {
      socket?.off("dashboard:update");
    };
  }, [socket]);
  if (isLoading) {
    return <ComponentLoading />;
  }
  return (
    <div className="mt-5 p-4">
      <div className="grid grid-cols-1 gap-4 mx-auto">
        {filter?.length === 0 && (
          <p className="text-foreground text-center">No data yet</p>
        )}
        {filter &&
          filter.map((challenge) => {
            const getStatusStyle = (status: string) => {
              switch (status?.toLowerCase()) {
                case "active":
                  return {
                    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                    dot: "bg-emerald-400 animate-pulse",
                    label: "Active",
                  };
                case "paused":
                  return {
                    bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
                    dot: "bg-amber-400",
                    label: "Paused",
                  };
                case "completed":
                  return {
                    bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                    dot: "bg-blue-400",
                    label: "Completed",
                  };
                case "closed":
                  return {
                    bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
                    dot: "bg-rose-400",
                    label: "Closed",
                  };
                default:
                  return {
                    bg: "bg-slate-500/10 border-slate-500/20 text-slate-400",
                    dot: "bg-slate-400",
                    label: "Draft",
                  };
              }
            };

            const statusConfig = getStatusStyle(challenge.status);

            return (
              <div
                onClick={() => {
                  setOpen(challenge);
                  setStatusConfig(statusConfig);
                }}
                key={challenge.challenge_pda}
                className="bg-background backdrop-blur-md border border-border rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 shadow-xl group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-foreground/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all duration-300">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-start">
                    <h3 className="text-foreground font-semibold text-base tracking-wide group-hover:text-emerald-400 transition-colors">
                      {challenge.title}
                    </h3>
                    <div className="flex flex-row items-center gap-3 justify-center">
                      {" "}
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 opacity-80">
                        <Link2 className="w-3.5 h-3.5 text-foreground" />
                        <span className="truncate max-w-[200px]">
                          {challenge.challenge_pda.slice(0, 10)}...
                        </span>
                      </p>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(null);
                        }}
                      >
                        <CopyTextCard
                          copy={copy}
                          setCopy={setCopy}
                          challenge={challenge}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 max-md:flex-col">
                  {challenge.status === "active" && (
                    <button
                      onClick={() => setOpen(challenge)}
                      className="border-primary/30 px-4 text-sm md:text-lg bg-primary/20 text-primary hover:bg-primary hover:text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300"
                    >
                      Submit secret
                    </button>
                  )}
                  <div className="flex gap-2">
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium border flex items-center gap-1.5 shadow-sm transition-all duration-300 ${statusConfig.bg}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                      ></span>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        {open && (
          <ChallengeParticipantModal
            open={open}
            setOpen={setOpen}
            statusConfig={statusConfig}
            setLoading={setLoading}
          />
        )}
      </div>
    </div>
  );
}
