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
    <div
      className="flex gap-1 p-1 rounded-lg"
      style={{ backgroundColor: "var(--tab-bar-bg)" }}
    >
      {tabs.map(({ key, label, Icon }) => (
       <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            active === key ? "tab-btn-active" : "tab-btn"
          }`}
        >
          <Icon style={{ fontSize: 18 }} />
          {label}
        </button>
      ))}
    </div>
  );
}
