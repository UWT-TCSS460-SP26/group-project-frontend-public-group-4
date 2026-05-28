"use client";

import { Movie, Tv } from "@mui/icons-material";

export default function MediaBadge({ isMovie }: { isMovie: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300">
      {isMovie ? (
        <Movie style={{ fontSize: 14 }} />
      ) : (
        <Tv style={{ fontSize: 14 }} />
      )}
      {isMovie ? "Movie" : "Show"}
    </span>
  );
}
