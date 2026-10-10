"use client";
import { useState, useEffect, useMemo } from "react";
import { Cloud, Link2 } from "lucide-react";
import {
  claimChallenge,
  getChallengesAll,
  getChallengesParticipants,
} from "@/lib/dashboard/api";
import toast from "react-hot-toast";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { socket } from "@/lib/socket";
import { useSearch } from "@/hooks/useSearch";
import CopyText from "@/components/dashboard/challenges/CopyText";
import { useWallet } from "@solana/wallet-adapter-react";
import { Challenge } from "@/types/challenge";
import CopyTextCard from "@/components/dashboard/challenges/CopyTextCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ComponentLoading from "@/components/layout/Loading";
import ReactMarkdown from "react-markdown";
interface statusConfig {
  bg: string;
  dot: string;
  label: string;
}

export default function page() {
  const { publicKey } = useWallet();
  const [challenges, setChallenges] = useState<Challenge[]>();
  const [challengesParticipant, setChallengesParticipant] =
    useState<Challenge[]>();
  const [open, setOpen] = useState<Challenge | null>(null);
  const [statusConfig, setStatusConfig] = useState<statusConfig | null>(null);
  const [copy, setCopy] = useState(true);
  const [copyPda, setCopyPda] = useState(true);
  const [copyPdaCard, setCopyPdaCard] = useState("");
  const { searchQuery } = useSearch();

  const queryClient = useQueryClient();
  const fetchAPIs = async () => {
    try {
      const res = await getChallengesAll();
      setChallenges(res);
      return res;
    } catch (err) {
      console.error(err);
    }
  };
  const getChallengeParticipent = async () => {
    try {
      const res = await getChallengesParticipants();
      setChallengesParticipant(res.activities.reverse());
      return res.activities.reverse();
    } catch (err) {
      console.error(err);
    }
  };

  const {
    data: challengesCashParticipants = [],
    isLoading: isLoadingParticipants,
    refetch: refetchChallengesCashParticipants,
  } = useQuery<Challenge[]>({
    queryKey: ["challengesParticipants"],
    queryFn: getChallengeParticipent,
  });
  const {
    data: challengesCash = [],
    isLoading,
    refetch: refetchChallenges,
  } = useQuery<Challenge[]>({
    queryKey: ["challenges"],
    queryFn: fetchAPIs,
  });
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return challengesCash;
    return challengesCash?.filter((i) => i.title.toLowerCase().includes(q));
  }, [searchQuery, challengesCash]);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket?.on("dashboard:update", () => {
      refetchChallenges();
      refetchChallengesCashParticipants();
    });
    return () => {
      socket?.off("dashboard:update");
    };
  }, [socket]);

  const handleClaim = async (challenge_pda: string) => {
    const toastId = toast.loading("Claiming .......");
    try {
      const res = await claimChallenge(challenge_pda);
      setOpen(null);
      toast.success("I got the challenge claim", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["challengesParticipants"] });
      queryClient.invalidateQueries({ queryKey: ["challengesParticipant"] });
    } catch (err) {
      console.error(err);
      toast.error("An error occurred in the challenge claim.", { id: toastId });
    }
  };
  if (isLoading || isLoadingParticipants) {
    return <ComponentLoading />;
  }
  return (
    <div className="mt-5 p-4">
      <div className="grid grid-cols-1 gap-4 mx-auto">
        {filtered?.length === 0 && (
          <p className="text-foreground text-center">No data yet</p>
        )}
        {filtered &&
          filtered.map((challenge) => {
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
            const check = challengesCashParticipants?.some(
              (item) => item.challenge_pda === challenge.challenge_pda,
            );

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
                          copy={copyPdaCard}
                          setCopy={setCopyPdaCard}
                          challenge={challenge}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-col md:flex-row">
                  {challenge.status === "active" && (
                    <p>
                      {(challenge.amount || 0) /
                        10 ** (challenge.token_decimals || 9)}{" "}
                      {challenge.token_symbol}
                    </p>
                  )}
                  {challenge.status === "active" &&
                    challenge.company_wallet !== publicKey?.toBase58() && (
                      <button
                        onClick={() => setOpen(challenge)}
                        disabled={check}
                        className={`${check && "disabled:cursor-not-allowed! disabled:opacity-50"} border-primary/30 px-4 bg-emerald-500/5 text-primary hover:bg-primary hover:text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300`}
                      >
                        {check ? "Claimed" : "Claim"}
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
          <Modal
            key={open.challenge_pda}
            open={open && true}
            onClose={() => setOpen(null)}
            center
            classNames={{
              modal:
                "backdrop-blur-md border border-border/5 p-6 rounded-2xl max-w-md w-10/12 md:w-full",
              overlay: " backdrop-blur-sm",
            }}
            styles={{
              modal: {
                background:
                  typeof document !== "undefined" &&
                  document.documentElement.classList.contains("dark")
                    ? "#000"
                    : "#fff",
              },
              closeButton: {
                fill: "currentColor",
                color:
                  typeof document !== "undefined" &&
                  document.documentElement.classList.contains("dark")
                    ? "#fff"
                    : "#000",
              },
            }}
          >
            <h2 className="text-foreground text-lg font-bold mb-4">
              View Challenge
            </h2>
            <div className="text-foreground gap-2 flex flex-col">
              <p className="text-xl font-bold">{open.title}</p>
              <p>
                <ReactMarkdown>{open.description}</ReactMarkdown>
              </p>
              <p
                className={`flex items-center gap-2 ${statusConfig!.bg} rounded-full w-28 justify-center font-bold py-0.5 capitalize text-foreground`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusConfig!.dot} inline-block`}
                ></span>
                {statusConfig!.label}
              </p>
              <CopyText
                label="Owner Challenge"
                text={open.company_wallet}
                copy={copy}
                setCopy={setCopy}
              />

              <CopyText
                label="Challenge PDA"
                text={open.challenge_pda}
                copy={copyPda}
                setCopy={setCopyPda}
              />
              <p>
                Model name:{" "}
                <span className="text-foreground/50">
                  {open.model_name ? open.model_name : "Not data yet"}
                </span>
              </p>
              <p>
                Provider:{" "}
                <span className="text-foreground/50">
                  {open.provider ? open.provider : "Not data yet"}
                </span>
              </p>
            </div>
            {open.status === "active" &&
              open.company_wallet !== publicKey?.toBase58() && (
                <button
                  onClick={() => handleClaim(open.challenge_pda)}
                  className="text-white bg-primary float-right mt-2 font-semibold py-3 px-12 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                  type="submit"
                >
                  Claim Challenge
                </button>
              )}
          </Modal>
        )}
      </div>
    </div>
  );
}
