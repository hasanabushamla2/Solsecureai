"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUp,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from "lucide-react";
import { getBilling } from "@/lib/dashboard/api";
import DateRangePanel from "./DateRangePanel";
import { socket } from "@/lib/socket";
import { useSearch } from "@/hooks/useSearch";
import CopyTextCard from "@/components/dashboard/challenges/CopyTextCard";
import { useQuery } from "@tanstack/react-query";

interface BillHistory {
  id: string;
  amount: number;
  type: "fund" | "earning";
  token_symbol: string;
  token_decimals: number;
  date: string;
  challenge_pda: string;
  challenge_title: string;
  wallet: string;
}
type SortKey = "date" | "amount";
const PAGE_SIZE = 10;
const darkBtn =
  "rounded-xl bg-foreground px-2 py-1 text-background hover:bg-foreground/90";
const navBtn = "transition-all hover:text-foreground/50 disabled:opacity-30 flex flex-row";
const td = "px-4 py-4";

const SortIcon = ({ active, asc }: { active: boolean; asc: boolean }) =>
  active ? (
    <ArrowUp
      size={16}
      className={`transition-transform duration-200 ${asc ? "" : "rotate-180"}`}
    />
  ) : (
    <ArrowUpDown size={16} className="text-foreground/30" />
  );

export default function BillingPage() {
  const [all, setAll] = useState<BillHistory[]>([]);
  const [type, setType] = useState<"all" | BillHistory["type"]>("all");
  const [applied, setApplied] = useState<(Date | null)[]>([null, null]);
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({
    key: "date",
    asc: false,
  });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<"date" | "filter" | null>(null);
  const [panelKey, setPanelKey] = useState(0);
  const { searchQuery } = useSearch();
  const [copy,setCopy] = useState('')

  const getBillingFun = async ()=>{
    try {
      const res = await getBilling();
      return res.billingHistory;
    }
    catch(err) {
      console.error(err)
      return []
    }
  }

  const {data: allCash = [],isLoading,refetch:refetchAllCash} = useQuery<BillHistory[]>({
    queryKey: ["billHistory"],
    queryFn: getBillingFun
  })

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket?.on("dashboard:update", refetchAllCash);
    return () => {
      socket?.off("dashboard:update");
      socket.disconnect();
    };
  }, [socket]);

  const rows = useMemo(() => {
    if(allCash.length === 0)return;
    const time = (r: BillHistory) => new Date(r.date).getTime();
    const value = (r: BillHistory) => r.amount / 10 ** r.token_decimals;
    const [from, to] = applied;
    const dir = sort.asc ? 1 : -1;
    const safeData = allCash || [];
    return safeData
      .filter(
        (r) =>
          (type === "all" || r.type === type) &&
          (!from || time(r) >= from.getTime()) &&
          (!to || time(r) <= to.getTime()),
      )
      .sort(
        (a, b) =>
          (sort.key === "date" ? time(a) - time(b) : value(a) - value(b)) *
            dir || time(b) - time(a),
      );
  }, [allCash, type, applied, sort]);

  const filterSearch: BillHistory[]|undefined = useMemo(() => {
    if(rows?.length===0)return;
    const q = searchQuery.trim().toLowerCase();
    if(!q) return rows;
    return rows?.filter(i=>(i.challenge_pda.toLowerCase().includes(q)))
  }, [searchQuery, rows]);
  useEffect(() => {
  setPage(1);
}, [searchQuery]);

  const pages = Math.max(1, Math.ceil((filterSearch?.length || 0) / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filterSearch?.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const isFiltered = type !== "all" || applied[0] || applied[1];
  const toggleSort = (key: SortKey) => {
    setSort((s) => ({ key, asc: s.key === key ? !s.asc : true }));
    setPage(1);
  };
  const reset = () => {
    setType("all");
    setApplied([null, null]);
    setPanelKey((k) => k + 1);
    setPage(1);
  };

  const menu = (
    id: "date" | "filter",
    trigger: React.ReactNode,
    body: React.ReactNode,
  ) => (
    <div
      className="relative"
      onMouseEnter={() => setOpen(id)}
      onMouseLeave={() => setOpen(null)}
    >
      {trigger}
      {open === id && (
        <div className="absolute right-0 top-full z-10 pt-2">
          <div className="rounded-xl border border-border bg-background p-2 overflow-auto">
            {body}
          </div>
        </div>
      )}
    </div>
  );

  const th = (key: SortKey, label: string) => (
    <th
      className={td}
      aria-sort={
        sort.key !== key ? "none" : sort.asc ? "ascending" : "descending"
      }
    >
      <button
        onClick={() => toggleSort(key)}
        aria-label={`Sort by ${label}`}
        className="flex items-center gap-2 font-medium"
      >
        {label} <SortIcon active={sort.key === key} asc={sort.asc} />
      </button>
    </th>
  );

  const getDynamic=(currentPage:number)=>{
    let size=4;
    let start = currentPage===1 ? currentPage: currentPage-1;

    if(start + size-1 > pages){
      start = Math.max(1,pages -size+1);
    }
    if(pages>4){
    const a =Array.from({length: size},(_,index)=>index+start);
    return a}
    else{
      const a =Array.from({length: pages},(_,index)=>index+start);
    return a
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 animate-fade-in duration-200">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="m-6 rounded-2xl border border-border">
      <div className="flex items-center justify-between p-5">
        <p className="font-bold">Billing</p>
        <div className="flex gap-2 flex-col md:flex-row">
          {isFiltered && (
            <button onClick={reset} className={darkBtn}>
              Reset
            </button>
          )}
          {menu(
            "date",
            <button
              onClick={() => setOpen(open === null ? "date" : null)}
              className="flex items-center gap-2 rounded-xl border border-border px-2 py-1"
            >
              <Calendar size={16} /> Choose date
            </button>,
            <DateRangePanel
              key={panelKey}
              onApply={(from, to) => {
                setApplied([from, to]);
                setPage(1);
              }}
            />,
          )}
          {menu(
            "filter",
            <button
              onClick={() => {
                setOpen(!open ? "filter" : null);
              }}
              className={`flex items-center justify-center gap-2 max-md:w-full ${darkBtn}`}
            >
              <Filter size={16} /> Filter
            </button>,
            (["fund", "earning", "all"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setPage(1);
                }}
                className="block w-full rounded-lg px-4 py-2 capitalize hover:bg-foreground hover:text-background"
              >
                {t}
              </button>
            )),
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-y border-border text-left">
            <tr>
              <th className={`${td} font-medium`}>Transaction Id</th>
              {th("amount", "Amount")}
              {th("date", "Date")}
              <th className={`${td} font-medium`}>Type</th>
              <th className={`${td} font-medium`}>Challenge PDA</th>
            </tr>
          </thead>
          <tbody>
            {visible?.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-foreground/50"
                >
                  No transactions found
                </td>
              </tr>
            )}
            {visible?.map((b) => (
              <tr key={b.id} className="border-b border-border">
                <td className={td}>{b.id.slice(0, 10)}... <CopyTextCard copy={copy} setCopy={setCopy} content={b.id}/></td>
                <td className={td}>
                  {b.amount / 10 ** b.token_decimals} {b.token_symbol}
                </td>
                <td className={td}>{new Date(b.date).toLocaleString()}</td>
                <td className={td}>{b.type}</td>
                <td className={td}>{b.challenge_pda.slice(0, 10)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-5 p-4">
        <button
          aria-label="Previous page"
          disabled={current === 1}
          onClick={() => setPage(1)}
          className={navBtn}
        >
          <ChevronsLeft />
        </button>
        <button
          aria-label="Previous page"
          disabled={current === 1}
          onClick={() => setPage(current === 1 ? 1 : current - 1)}
          className={navBtn}
        >
          <ChevronLeft />
        </button>
        <div className="flex gap-2 text-foreground/50">
          {
          
        getDynamic(current).map((k) => (
            <button
              key={k}
              onClick={() => setPage(k)}
              className={`transition-all hover:text-foreground/90 ${k === current ? "font-bold text-foreground" : ""}`}
            >
              {k}
            </button>
          ))}
          
        </div>
        
        <button
          aria-label="Next page"
          disabled={current === pages}
          onClick={() => setPage(current !== pages ? current + 1 : current)}
          className={navBtn}
        >
          <ChevronRight />
        </button>
        <button
          aria-label="Next page"
          disabled={current === pages}
          onClick={() => setPage(pages)}
          className={navBtn}
        >
          <ChevronsRight />
        </button>
      </div>
    </div>
  );
}
