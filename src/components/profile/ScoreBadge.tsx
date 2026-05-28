"use client";

import { Star } from "@mui/icons-material";

export default function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? "bg-green-600" : score >= 6 ? "bg-amber-500" : "bg-red-500";
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-semibold text-white ${color}`}
    >
      <Star style={{ fontSize: 14 }} />
      {score}/10
    </span>
  );
}
