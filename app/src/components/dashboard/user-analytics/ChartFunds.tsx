"use client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Amount } from "../CardStatistics";
import { useMemo, useState } from "react";

const LIMITS: Record<string, number> = { "7D": 7, "30D": 30, "3M": 90 };
type activeTab = "7D" | "30D" | "3M" | "1Y";

export default function ChartFunds({ amount }: { amount: Amount[] }) {
  const [activeTab, setActiveTab] = useState<activeTab>("7D");
  const [token, setToken] = useState("");
  function lastDays(n: number): string[] {
    const days: string[] = [];
    for (let i = n; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString("en-CA"));
    }
    return days;
  }
  const tokens = useMemo(
    () => [...new Set(amount?.map((e) => e.token_symbol))],
    [amount],
  );
  function lastYear(): string[] {
    const l = [];
    let nowYear = new Date().getFullYear();
    let nowMonth = new Date().getMonth();
    let n = nowMonth + 1;
    for (let i = 0; i <= 12; i++) {
      const o = new Date(`${n}/1/${nowYear}`)
        .toLocaleDateString("en-CA")
        .slice(0, 7);
      l.push(o);

      if (n === 1) {
        n = 12;
        nowYear--;
      } else {
        n--;
      }
      if (n === nowMonth && nowYear !== new Date().getFullYear()) {
        break;
      }
    }
    return l;
  }

  const selected = token || tokens[0];

  const list = useMemo(() => {
    const byDay: Record<string, any> = {};
    if (!amount) return;
    if (activeTab !== "1Y") {
      const day = lastDays(LIMITS[activeTab]);
      for (const i of day) {
        byDay[i] = { day: i, fund: 0, earning: 0, token_symbol: selected };
      }
    }
    else{
      for(const i of lastYear()){
        byDay[i] = { day: i, fund: 0, earning: 0, token_symbol: selected };
      }
    }
    for (const e of amount) {
      if (e.token_symbol !== selected) continue;
      const d = new Date(e.date).toLocaleDateString("en-CA");
      if (activeTab === "1Y") {
        const day = new Date(e.date).toLocaleDateString("en-CA").slice(0, 7);
        if(!byDay[day]) continue;
        const value = Number(e.amount) / 10 ** e.token_decimals;

        if (e.type === "fund") byDay[day].fund += value;
        else byDay[day].earning += value;
      } else {
        if (!byDay[d]) continue;
        const value = Number(e.amount) / 10 ** e.token_decimals;

        if (e.type === "fund") byDay[d].fund += value;
        else byDay[d].earning += value;
      }
    }

    return Object.values(byDay).sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
    );
  }, [amount, selected, activeTab]);
  return (
    <div className="w-full rounded-2xl min-h-[300px] flex-1 bg-background p-6 shadow-lg border-border border">
      <p className="font-bold">Funds & Earnings Chart</p>
      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex gap-3 mb-2">
          {tokens.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setToken(t)}
              className={
                t === selected ? "font-bold text-blue-500" : "text-gray-400"
              }
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-3 mb-2">
          {["7D", "30D", "3M", "1Y"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t as activeTab)}
              className={
                t === activeTab ? "font-bold text-blue-500" : "text-gray-400"
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer className={"pb-12"}>
        <AreaChart
          data={list}
          style={{ left: -20, top: -5, bottom: 10, right: 10 }}
        >
          <defs>
            <linearGradient id="gFund" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gEarn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tickFormatter={(d) =>
              new Date(
                d.length === 7 ? d + "-01T00:00:00" : d + "T00:00:00",
              ).toLocaleDateString(
                "en-US",
                activeTab === "1Y"
                  ? { year: "numeric", month: "short" }
                  : { month: "short", day: "numeric" },
              )
            }
            stroke="#64748b"
            tickLine={false}
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis
            stroke="#64748b"
            tickLine={false}
            axisLine={true}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 12,
              color: "#fff",
            }}
            labelFormatter={(d) => d}
            formatter={(value, name, item) => [
              `${Number(value).toLocaleString()} ${item.payload.token_symbol}`,
              name,
            ]}
          />
          <Area
            dataKey="fund"
            name="Funds"
            type="monotone"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#gFund)"
            dot={
              activeTab === "7D"
                ? { r: 3, fill: "#fff", stroke: "#a855f7", strokeWidth: 2 }
                : false
            }
            activeDot={{ r: 5 }}
          />
          <Area
            dataKey="earning"
            name="Earning"
            type="monotone"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#gEarn)"
            dot={
              activeTab === "7D"
                ? { r: 3, fill: "#fff", stroke: "#a855f7", strokeWidth: 2 }
                : false
            }
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
