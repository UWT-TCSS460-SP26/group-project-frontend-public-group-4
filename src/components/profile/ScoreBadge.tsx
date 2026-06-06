"use client";

import { Star } from "@mui/icons-material";

export default function ScoreBadge({ score }: { score: number }) {
  const color =
  score >= 8
    ? "var(--badge-success)"
    : score >= 6
      ? "var(--badge-warning)"
      : "var(--badge-danger)";
  return (
    <span
      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-semibold"
      style={{ backgroundColor: color, color: "var(--badge-text)" }}
    >
      <Star style={{ fontSize: 14 }} />
      {score}/10
    </span>
  );
}
