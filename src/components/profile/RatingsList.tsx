"use client";

import { useState } from "react";
import { Star, Delete } from "@mui/icons-material";
import ScoreBadge from "./ScoreBadge";
import MediaBadge from "./MediaBadge";
import Link from "next/link";
import type { RatingRecord } from "@/types/community";

const ITEMS_PER_PAGE = 25;

interface RatingsListProps {
  ratings: RatingRecord[];
  titles: Map<string, string>;
  onDelete: (ratingId: number) => void;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

export default function RatingsList({
  ratings,
  titles,
  onDelete,
  loading,
  error,
  onRetry,
}: RatingsListProps) {
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);

  const sorted = [...ratings].sort((a, b) => b.ratingId - a.ratingId);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const pageItems = sorted.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-400">Could not load ratings.</p>
        <button
          onClick={onRetry}
          className="mt-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="mx-auto mb-2 text-zinc-600" style={{ fontSize: 40 }} />
        <p className="text-zinc-500">No ratings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {pageItems.map((r) => (
        <div
          key={r.ratingId}
          className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/60 border border-zinc-700/50 group"
        >
          <ScoreBadge score={r.rating} />
          <MediaBadge isMovie={r.isMovie} />
          <Link
              href={
                r.isMovie ? `/movies/${r.tmdbIdentifier}` : `/tv/${r.tmdbIdentifier}`
              }
              className="app-link text-base truncate max-w-70"
            >
              {titles.get(
                r.isMovie ? `m-${r.tmdbIdentifier}` : `s-${r.tmdbIdentifier}`,
              ) ?? `TMDB #${r.tmdbIdentifier}`}
          </Link>
          <button
            onClick={() => {
              setDeleting(r.ratingId);
              onDelete(r.ratingId);
            }}
            disabled={deleting === r.ratingId}
            className="ml-auto p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
            title="Delete rating"
          >
            <Delete style={{ fontSize: 16 }} />
          </button>
        </div>
      ))}

      {totalPages > 1 &&
        (() => {
          const MAX_VISIBLE = 5;
          const half = Math.floor(MAX_VISIBLE / 2);
          let start = Math.max(0, page - half);
          let end = Math.min(totalPages - 1, start + MAX_VISIBLE - 1);
          if (end - start < MAX_VISIBLE - 1) {
            start = Math.max(0, end - MAX_VISIBLE + 1);
          }
          const pages = Array.from(
            { length: end - start + 1 },
            (_, i) => start + i,
          );

          return (
            <div className="flex items-center justify-center gap-1 pt-4">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="px-2 py-1.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-2 py-1.5 rounded-md text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {pages.map((i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                    i === page
                      ? "bg-amber-400 text-black"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-2 py-1.5 rounded-md text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page === totalPages - 1}
                className="px-2 py-1.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          );
        })()}
    </div>
  );
}
