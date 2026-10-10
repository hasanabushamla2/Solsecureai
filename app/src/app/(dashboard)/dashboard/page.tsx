"use client";
import { getProfile } from "@/lib/dashboard/api";
import Welcome from "@/components/dashboard/Welcome";
import CardStatistics from "@/components/dashboard/CardStatistics";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import ComponentLoading from "@/components/layout/Loading";

export default function Page() {
  const { wallet } = useWallet();
  const getProfileRes = async () => {
    const profile = await getProfile();
    return profile.result.username;
  };
  const {
    data: profileCash = "",
    isLoading: isLoadingCash,
    refetch: refetchProfile,
  } = useQuery<string>({
    queryKey: ["profile"],
    queryFn: getProfileRes,
  });
  useEffect(() => {
    socket?.on("dashboard:update", refetchProfile);
    return () => {
      socket?.off("dashboard:update");
    };
  }, [socket]);
  if (isLoadingCash) {
    return <ComponentLoading />;
  }
  return (
    <div className="px-6 py-10 bg-background flex flex-col gap-5">
      <Welcome username={profileCash} />
      <CardStatistics />
    </div>
  );
}
