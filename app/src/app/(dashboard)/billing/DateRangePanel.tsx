"use client";
import { useState } from "react";

const PARTS = ["second", "minute", "hour", "day", "month", "year"] as const;
const EMPTY = {
  second: "",
  minute: "",
  hour: "",
  day: "",
  month: "",
  year: "",
  period: "AM",
};
type Field = typeof EMPTY;
type Side = "from" | "to";

const toDate = (f: Field) => {
  if (!PARTS.some((p) => f[p])) return null;
  const n = (v: string, d: number) => (v === "" ? d : Number(v));
  let h = n(f.hour, 0);
  if (f.period === "PM" && h < 12) h += 12;
  else if (f.period === "AM" && h === 12) h = 0;
  return new Date(
    n(f.year, new Date().getFullYear()),
    n(f.month, 1) - 1,
    n(f.day, 1),
    h,
    n(f.minute, 0),
    n(f.second, 0),
  );
};

export default function DateRangePanel({
  onApply,
}: {
  onApply: (from: Date | null, to: Date | null) => void;
}) {
  const [range, setRange] = useState({ from: EMPTY, to: EMPTY });
  const set = (side: Side, patch: Partial<Field>) =>
    setRange((r) => ({ ...r, [side]: { ...r[side], ...patch } }));

  const apply = () => {
    const from = toDate(range.from);
    const to = toDate(range.to);
    if (from && to && from > to)
      throw new Error("From date cannot be after To date!");
    onApply(from, to);
  };

  return (
    <div className="flex flex-col gap-3 pt-2">
      {(["from", "to"] as const).map((side,i) => (
        <div key={i}>
          <span className="w-10 text-xs font-semibold capitalize text-gray-400">
            {side}
          </span>

          <div key={side} className="grid grid-cols-3 md:flex items-center gap-2">
            {PARTS.toReversed().map((p) => (
              <div key={p} className="relative">
                <input
                  inputMode="numeric"
                  maxLength={p === "year" ? 4 : 2}
                  placeholder="0"
                  value={range[side][p]}
                  onChange={(e) =>
                    set(side, { [p]: e.target.value.replace(/\D/g, "") })
                  }
                  className="h-10 w-10 rounded-2xl border border-foreground/20 text-center text-xs outline-none transition-all focus:border-foreground/50"
                />
                <label className="absolute -top-2 left-1/2 -translate-x-1/2 select-none bg-background px-1 text-[9px] capitalize text-gray-400">
                  {p}
                </label>
              </div>
            ))}
            <button
              className="w-8 text-sm"
              onClick={() =>
                set(side, { period: range[side].period === "AM" ? "PM" : "AM" })
              }
            >
              {range[side].period}
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={apply}
        className="self-start rounded-xl bg-foreground px-2 py-1 text-background hover:bg-foreground/90"
      >
        Apply
      </button>
    </div>
  );
}
