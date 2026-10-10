import { Trophy, MessageSquareMore, Clock, Coins } from "lucide-react";

interface Stats {
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
  company_wallet: string;
  title: string;
  description: string;
  model_name: string;
  provider: string;
  status: string;
}

interface TotalChallengesCardProps {
  chats: Chats | null;
  stats: Stats;
  challenges: MyChallenges[] | null;
}
export default function TotalChallengesCard({
  chats,
  stats,
  challenges,
}: TotalChallengesCardProps) {
  const cardItems = [
    {
      title: "Total Challenges",
      value: stats?.challenges_created ?? 0,
      icon: <Trophy className="text-emerald-500" />,
      bgClass: "bg-emerald-500/20",
      shadow: "shadow-[-5px_-5px_20px_10px_rgba(16,185,129,0.15)]",
    },
    {
      title: "Chat Sessions",
      value: chats?.result?.length ?? 0,
      icon: <MessageSquareMore className="text-blue-500" />,
      bgClass: "bg-blue-500/20",
      shadow: "shadow-[-5px_-5px_20px_10px_rgba(59,130,246,0.15)]",
    },
    {
      title: "Active Challenges",
      value: challenges?.length ?? 0,
      icon: <Clock className="text-indigo-500" />,
      bgClass: "bg-indigo-500/20",
      shadow: "shadow-[-5px_-5px_20px_10px_rgba(99,102,241,0.15)]",
    },
    {
      title: "Total Earnings",
      value: stats?.total_earnings ?? 0,
      icon: <Coins className="text-purple-500" />,
      bgClass: "bg-purple-500/20",
      shadow: "shadow-[-5px_-5px_20px_10px_rgba(168,85,247,0.15)]",
    },
  ];
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 justify-around items-center gap-3">
      {cardItems.map((item, index) => (
        <div
          key={index}
          className="w-full h-28 border-background/2 shadow-xl border-2 p-4 rounded-xl flex items-center gap-3 "
        >
          <div className={`${item.bgClass} p-2 rounded-xl ${item.shadow}`}>
            {item.icon}
          </div>
          <div>
            <p className="text-foreground text-md tracking-tight">
              {item.title}
            </p>
            {item.value &&
            typeof item.value === "object" &&
            Object.keys(item.value).length > 0 ? (
              Object.entries(item.value).map(([sym, amount]) => {
                const d = sym === "USDC" ? 6 : 9;
                const amountValue = amount / 10 ** d;
                return (
                  <div key={sym} className="flex items-center gap-2">
                    <span className="text-foreground text-md font-bold">
                      {amountValue?.toLocaleString() || 0}
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      {sym}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-foreground text-md font-bold truncate">
                {typeof item.value === "object" ? 0 : String(item.value ?? 0)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
