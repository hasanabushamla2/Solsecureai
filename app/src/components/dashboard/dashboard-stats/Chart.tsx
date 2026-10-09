"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { getCountRes } from "@/lib/dashboard/api";
import { ChartDataPoint, MyActivity } from "../CardStatistics";



export default function Chart({ res }: { res: ChartDataPoint[] | [] }) {
  const [activeTab, setActiveTab] = useState("7D");
  const tabs = ["7D", "30D", "3M", "1Y"] as const;
  const [filtered, setFiltered] = useState<ChartDataPoint[]>([]);

  useEffect(()=>{
    if(res&&res.length>0){
      handleDate(res,'7D')
    }
  },[res])

  const handleFilter = async (day:'7D'|'30D'|'3M'|'1Y')=>{
    try{
        const res = await getCountRes(day);
        handleDate(res,day)
      }catch(err){

      }
  }

  const handleDate = async (res: ChartDataPoint[],tab:string) => {
    setActiveTab(tab);
    if(!res) return;
    const f = res
      .filter((e) => {
        const date = new Date(e.activity_date);
        const now = new Date();
        date.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (tab === "7D") return diffDays <= 7;
        if (tab === "30D") return diffDays <= 30;
        if (tab === "3M") return diffDays <= 90;
        if (tab === "1Y") return diffDays <= 365;
        return true;
      })
      .map((e) => {
        if (tab === "7D") {
          return {
            ...e,
            date: new Date(e.activity_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          };
        }
        if (tab === "30D") {
          return {
            ...e,
            date: new Date(e.activity_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          };
        }
        if (tab === "3M") {
          return {
            ...e,
            date: new Date(e.activity_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          };
        }
        if (tab === "1Y") {
          return {
            ...e,
            date: new Date(e.activity_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            }),
          };
        }
      });
      
    setFiltered(f as ChartDataPoint[]);
  };
  return (
    <div className="w-full border-background/2 flex flex-col shadow-xl border-2 p-4 rounded-xl gap-3">
      <div
        className={`w-full py-2 flex justify-between`}
      >
        <p className="font-bold">Challenges Overview</p>
        <div className="text-blue-500 flex border-border/20 rounded-xl border">
          <AnimatePresence mode="wait">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <motion.button
                  type="button"
                  key={tab}
                  animate={{
                    backgroundColor:
                      activeTab === tab ? "#3b82f6" : "transparent",
                    color: activeTab === tab ? "#ffffff" : "#3b82f6",
                  }}
                  transition={{ duration: 0.55 }}
                  onClick={() => handleFilter(tab)}
                  className={`${isActive && "bg-blue-500"} rounded-xl p-1 font-bold text-primary-foreground`}
                >
                  {tab}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full h-[240px] text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="colorChallenges" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#DEDEDE"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              tickLine={false}
              axisLine={true}
              dy={10}
              
            />
            <YAxis
              domain={[0, 20]}
              stroke="#64748b"
              tickLine={false}
              axisLine={true}
              ticks={[0, 5, 10, 15, 20]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "12px",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />

            <Area
              dataKey="total_count"
              type="monotone"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorChallenges)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
              dot={{ r: 3, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-2 items-center">
        <span className="w-2 h-2 inline-block bg-primary rounded-full" />
        <p>Challenge Created</p>
      </div>
    </div>
  );
}
