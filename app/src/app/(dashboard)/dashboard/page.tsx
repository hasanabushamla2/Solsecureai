"use client";
import { getProfile } from "@/lib/dashboard/api";
import Welcome from "@/components/dashboard/Welcome";
import CardStatistics from "@/components/dashboard/CardStatistics";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const { wallet } = useWallet();
  const getProfileRes = async () => {
    const profile = await getProfile();
    return profile.result.username;
  };
  const {
    data: profileCash = {},
    isLoading: isLoadingCash,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfileRes,
  });
  useEffect(() => {
    socket?.on("dashboard:update", refetchProfile);
    return () => {
      socket?.off("dashboard:update");
      socket.disconnect();
    };
  }, [socket]);
  if (isLoadingCash) {
    return (
      <div className="flex justify-center items-center p-8 animate-fade-in duration-200">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-foreground" />
      </div>
    );
  }
  return (
    <div className="px-6 py-10 bg-background flex flex-col gap-5">
      <Welcome username={profileCash} />
      <CardStatistics />
    </div>
  );
}
