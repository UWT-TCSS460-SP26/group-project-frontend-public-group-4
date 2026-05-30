"use client";

import { Star, RateReview } from "@mui/icons-material";

export type Tab = "ratings" | "reviews";

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { key: Tab; label: string; Icon: typeof Star }[] = [
  { key: "ratings", label: "Ratings", Icon: Star },
  { key: "reviews", label: "Reviews", Icon: RateReview },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 p-1 bg-zinc-800 rounded-lg">
      {tabs.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            active === key
              ? "bg-zinc-700 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Icon style={{ fontSize: 18 }} />
          {label}
        </button>
      ))}
    </div>
  );
}
