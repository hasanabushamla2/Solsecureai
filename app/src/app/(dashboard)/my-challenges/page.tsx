"use client";
import { useState, useEffect, useMemo } from "react";
import { Cloud, Link2 } from "lucide-react";
import { getChallenges } from "@/lib/dashboard/api";
import "react-responsive-modal/styles.css";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import ModalMyChallenge from "@/components/dashboard/my-challenges/Model";
import { Challenge } from "@/types/challenge";
import {
  handleFund,
  handleClose,
  handleEdit,
  handlePauseOrResume,
} from "@/lib/dashboard/apiMyChallange";
import { socket } from "@/lib/socket";
import CopyTextCard from "@/components/dashboard/challenges/CopyTextCard";
import { useSearch } from "@/hooks/useSearch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ComponentLoading from "@/components/layout/Loading";

export default function page() {
  const walletProvider = useAnchorWallet();
  const { connect, wallet } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [MyChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [challenge, setChallenge] = useState<Challenge>();
  const [open, setOpen] = useState(false);
  const [copy, setCopy] = useState("");
  const { searchQuery } = useSearch();
  const queryClient = useQueryClient();
  const [loadingFund, setLoadingFund] = useState<boolean>(false);
  const [loadingEdit, setLoadingEdit] = useState<boolean>(false);
  const [loadingClose, setLoadingClose] = useState<boolean>(false);

  const fetchAPIs = async () => {
    try {
      const res = await getChallenges();
      const challenge_reverse = res.reverse();
      setMyChallenges(challenge_reverse);
      return challenge_reverse;
    } catch (err) {
      console.error("Invalid to fetch api credentials");
      return [];
    }
  };

  const {
    data: MyChallengesCash = [],
    isLoading: isLoadingCash,
    refetch: refetchAPIs,
  } = useQuery<Challenge[]>({
    queryKey: ["myChallenge"],
    queryFn: fetchAPIs,
  });
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MyChallengesCash;
    return MyChallengesCash?.filter((i) => i.title.toLowerCase().includes(q));
  }, [searchQuery, MyChallengesCash]);

  useEffect(() => {
    
    const tryconnect = async () => {
      try {
        const tx = await connect();
      } catch (e) {
        console.error("Error to connect wallet");
      }
    };
    tryconnect();
    socket?.on("dashboard:update", refetchAPIs);
    if (!socket.connected) socket.connect();
    return () => {
      socket?.off("dashboard:update");
    };
  }, [socket]);
  if (isLoadingCash) {
    return <ComponentLoading />;
  }
  return (
    <div className="mt-5 p-4">
      <div className="grid grid-cols-1 gap-4 mx-auto">
        {filtered.length === 0 && (
          <p className="text-foreground text-center">No data yet</p>
        )}
        {filtered ? (
          filtered?.map((my) => {
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

            const statusConfig = getStatusStyle(my.status);

            return (
              <div
                key={my.challenge_pda}
                className={`bg-background/40 backdrop-blur-md border border-border rounded-2xl p-5 flex flex-col md:flex-row  items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 shadow-xl group`}
              >
                <div className="flex items-center gap-3 justify-between w-full">
                  <div className="flex flex-row gap-2">
                    <div className="p-3 bg-foreground/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all duration-300">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold text-base tracking-wide group-hover:text-emerald-400 transition-colors">
                        {my.title}
                      </h3>
                      <div className="flex flex-row items-center gap-3">
                        <p className="text-xs text-slate-400 mt-1 flex gap-1.5 opacity-80">
                          <Link2 className="w-3.5 h-3.5 text-foreground" />
                          <span className="truncate max-w-[200px]">
                            {my.challenge_pda.slice(0, 10)}...
                          </span>
                        </p>
                        {my && (
                          <CopyTextCard
                            copy={copy}
                            setCopy={setCopy}
                            challenge={my}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex">
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

                <div className="flex gap-2">
                  {(my.status === "draft" ||
                    my.status === "active" ||
                    my.status === "paused") && (
                    <button
                      onClick={async() => {
                        handleEdit(my, setOpen, setChallenge);
                        await Promise.all([
                          queryClient.invalidateQueries({
                            queryKey: ["challenges"],
                          }),
                          queryClient.invalidateQueries({
                            queryKey: ["dashboardStats"],
                          }),
                          ]);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium border border-border/10 flex items-center gap-1.5 shadow-sm text-primary bg-background/5 hover:scale-105 transition-all ease-in-out duration-300 hover:text-primary hover:border-primary"
                    >
                      Edit
                    </button>
                  )}
                  {my.status === "draft" && (
                    <button
                      disabled={loadingFund}
                      onClick={async () => {
                        await handleFund(
                          walletProvider!,
                          connect!,
                          my.company_wallet,
                          my.challenge_pda,
                          setOpen,
                          setLoadingFund,
                        );

                        await Promise.all([
                          queryClient.invalidateQueries({
                            queryKey: ["challenges"],
                          }),
                          queryClient.invalidateQueries({
                            queryKey: ["dashboardStats"],
                          }),
                          
                        ]);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium border border-border/10 flex items-center gap-1.5 shadow-sm text-primary bg-background/5 hover:scale-105 transition-all ease-in-out duration-300 hover:text-primary hover:border-primary"
                    >
                      {loadingFund && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      )}
                      {loadingFund ? "Funding..." : "Fund"}
                    </button>
                  )}
                  {(my.status === "active" || my.status === "paused") && (
                    <button
                      disabled={loadingEdit}
                      onClick={async () => {
                        await handlePauseOrResume(
                          walletProvider!,
                          connect,
                          my.company_wallet,
                          my.challenge_pda,
                          my.status === "active" ? true : false,
                          setOpen,
                          setLoadingEdit,
                        );
                        await Promise.all([
                          queryClient.invalidateQueries({
                            queryKey: ["challenges"],
                          }),
                          queryClient.invalidateQueries({
                            queryKey: ["dashboardStats"],
                          }),
                          
                        ]);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium border border-border/10 flex items-center gap-1.5 shadow-sm text-primary bg-background/5 hover:scale-105 transition-all ease-in-out duration-300 hover:text-primary hover:border-primary"
                    >
                      {loadingEdit && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      )}
                      {my.status === "paused"
                        ? loadingEdit
                          ? "Resume..."
                          : "Resume"
                        : loadingEdit
                          ? "Pause..."
                          : "Pause"}
                    </button>
                  )}
                  {(my.status === "active" ||
                    my.status === "paused" ||
                    my.status === "draft") && (
                    <button
                      disabled={loadingClose}
                      onClick={async () => {
                        await handleClose(
                          walletProvider!,
                          connect,
                          my.company_wallet,
                          my.challenge_pda,
                          setOpen,
                          setLoadingClose,
                        );
                        await Promise.all([
                          queryClient.invalidateQueries({
                            queryKey: ["challenges"],
                          }),
                          queryClient.invalidateQueries({
                            queryKey: ["dashboardStats"],
                          }),
                          
                        ]);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium border border-border/10 flex items-center gap-1.5 shadow-sm text-primary bg-background/5 hover:scale-105 transition-all ease-in-out duration-300 hover:text-primary hover:border-primary"
                    >
                      {loadingClose && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      )}
                      {loadingClose ? "Closing..." : "Close"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-foreground text-center">No data yet</p>
        )}
        {open && (
          <ModalMyChallenge
            open={open}
            setOpen={setOpen}
            challenge={challenge!}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>
    </div>
  );
}
