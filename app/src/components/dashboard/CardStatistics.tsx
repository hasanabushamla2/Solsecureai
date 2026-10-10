"use client";
import ActiveChallengesCard from "./dashboard-stats/ActiveChallengesCard";
import Chart from "./dashboard-stats/Chart";
import {
  getAnalyticsMessage,
  getBilling,
  getCountRes,
} from "@/lib/dashboard/api";
import TotalChallengesCard from "./dashboard-stats/TotalChallengesCard";
import ChartFunds from "./user-analytics/ChartFunds";
import RecentActivityCard from "./user-analytics/RecentActivityCard";
import UserWalletCard from "./user-analytics/UserWalletCard";
import {
  getActivity,
  getChallenges,
  getSession,
  getStats,
} from "@/lib/dashboard/api";
import { useEffect, useState } from "react";
import ChartMessages from "./dashboard-stats/ChartMessages";
import { useQuery } from "@tanstack/react-query";
import { socket } from "@/lib/socket";

export interface Stats {
  wallet_address: string;
  challenges_created: number;
  challenges_participated: number;
  wins: number;
  total_earnings: Record<string, number> | {};
}

interface Chats {
  result: { id: string }[];
}

interface MyChallenges {
  challenge_pda: string;
  company_wallet: string;
  title: string;
  description: string;
  model_name: string;
  provider: string;
  status: string;
}
export interface MyActivity {
  id: string;
  wallet: string;
  activity_type: string;
  challenge_pda: string;
  metadata: Record<string, string>;
  created_at: string;
}
export interface Amount {
  challenge_pda: string;
  id: string;
  amount: number;
  token_symbol: string;
  token_decimals: number;
  type: "fund" | "earning";
  date: string;
  wallet: string;
}
export interface ChartDataPoint {
  activity_date: string;
  total_count: number;
}

export default function CardStatistics() {
  const getFun = async () => {
    try {
      const [
        statsRes,
        activityRes,
        chatsRes,
        myChallengesRes,
        getBillingRes,
        getCountR,
        getMessageR,
      ] = await Promise.all([
        getStats(),
        getActivity(),
        getSession(),
        getChallenges(),
        getBilling(),
        getCountRes("7D"),
        getAnalyticsMessage("7D"),
      ]);
      return {
        activity: activityRes,
        chats: chatsRes,
        stats: statsRes,
        myChallenges: myChallengesRes,
        amount: getBillingRes.billingHistory,
        count: getCountR,
        countMessage: getMessageR,
      };
    } catch (err) {
      console.error("Failed to fetch statistics");
      return {};
    }
  };

  const {
    data: statsCash,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getFun,
  });

  useEffect(() => {
    socket?.on("dashboard:update", refetch);

    if (!socket.connected) socket.connect();
    return () => {
      socket?.off("dashboard:update");
    };
  }, [socket]);
  return (
    <div className="text-foreground grid grid-cols-1 xl:grid-cols-12 items-stretch justify-between gap-2">
      <div className="flex flex-col xl:col-span-8 gap-4">
        <TotalChallengesCard
          chats={statsCash?.chats || []}
          stats={statsCash?.stats || []}
          challenges={statsCash?.myChallenges || []}
        />
        <ActiveChallengesCard
          amount={statsCash?.amount || []}
          challenges={statsCash?.myChallenges || []}
        />
        <div className="flex flex-col md:flex-row gap-5">
          <Chart res={statsCash?.count || []} />
          <ChartMessages res={statsCash?.countMessage || []} />
        </div>
      </div>
      <div className="xl:col-span-4 flex flex-col gap-4">
        <UserWalletCard />
        <RecentActivityCard activity={statsCash?.activity?.activities || []} />
        <ChartFunds amount={statsCash?.amount || []} />
      </div>
    </div>
  );
}
