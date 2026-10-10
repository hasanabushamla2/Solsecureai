"use client";
import { getLeaderRes } from "@/lib/dashboard/api";
import { socket } from "@/lib/socket";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import { useEffect, useMemo, useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useQuery } from "@tanstack/react-query";
import ComponentLoading from "@/components/layout/Loading";
interface Leader {
  wallet_address: string;
  wins: number;
  total_earnings: Record<string, number>;
}
export default function page() {
  const [leader, setLeader] = useState<Leader[]>();
  const [tokenList, setList] = useState<TokenInfo[]>([]);
  const loadToken = async () => {
    try {
      const provider = await new TokenListProvider().resolve();
      const list = provider.filterByChainId(101).getList();
      return list;
      setList(list);
    } catch (err) {
      return [];
    }
  };
  const getLeader = async () => {
    try {
      const rs = await getLeaderRes();
      return rs;
      setLeader(rs);
    } catch (err) {
      return [];
    }
  };
  const { searchQuery } = useSearch();

  const {
    data: leaderCash = [],
    isLoading,
    refetch: refetchLeader,
  } = useQuery<Leader[]>({
    queryKey: ["leader"],
    queryFn: getLeader,
  });
  const {
    data: loadTokenCash = [],
    isLoading: isLoadingCash,
    refetch: refetchLoadTokenCash,
  } = useQuery<TokenInfo[]>({
    queryKey: ["leader"],
    queryFn: loadToken,
  });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return leaderCash;
    return leaderCash?.filter((i) =>
      i.wallet_address.toLowerCase().includes(q),
    );
  }, [searchQuery, leaderCash]);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket?.on("dashboard:update", refetchLeader);
    socket?.on("dashboard:update", refetchLoadTokenCash);
    return () => {
      socket?.off("dashboard:update");
    };
  }, [socket]);
  if (isLoadingCash) {
    return <ComponentLoading />;
  }
  return (
    <div className="m-6 rounded-2xl border border-border">
      <div className="flex items-center justify-between p-5">
        <p className="font-bold">Leaderboard</p>
        <div className="flex gap-2"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={` text-left`}>
            <tr>
              <th className={`font-medium text-center p-2`}>Rank</th>
              <th className={`font-medium text-center p-2`}>Wallet address</th>
              <th className={`font-medium text-center p-2`}>Earnings</th>
              <th className={`font-medium text-center p-2`}>Wins</th>
            </tr>
          </thead>

          {filtered && filtered.length === 0 ? (
            <div className="text-center text-foreground p-4">No data yet</div>
          ) : (
            <tbody>
              {filtered &&
                filtered
                  .filter((item) => item.wins > 0)
                  .map((item, index) => {
                    return (
                      <tr key={item?.wallet_address || index}>
                        <td className="font-medium p-2 text-center">
                          {index + 1}
                        </td>
                        <td className="font-medium p-2 text-center">
                          {item?.wallet_address}
                        </td>
                        <td className="font-medium p-2 text-center">
                          {Object.entries(item?.total_earnings || {}).map(
                            ([key, value], idx) => {
                              const dec =
                                loadTokenCash.find((i) => i?.symbol === key)
                                  ?.decimals || 9;
                              return (
                                <p
                                  key={`${item?.wallet_address}-${key}-${idx}`}
                                >
                                  {value / 10 ** dec} {key}
                                </p>
                              );
                            },
                          )}
                        </td>
                        <td className="font-medium p-2 text-center">
                          {item.wins}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
