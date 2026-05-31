"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Delete } from "@mui/icons-material";
import ScoreBadge from "./ScoreBadge";
import MediaBadge from "./MediaBadge";
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
          <div
            key={i}
            className="h-20 rounded-lg animate-pulse"
            style={{ backgroundColor: "var(--surface-bg)" }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p style={{ color: "var(--text-muted)" }}>Could not load ratings.</p>
        <button
          onClick={onRetry}
          className="mt-2 text-sm transition-colors"
          style={{ color: "var(--primary-color)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--primary-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--primary-color)";
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="mx-auto mb-2" style={{ fontSize: 40, color: "var(--surface-text-dim)" }} />
        <p style={{ color: "var(--text-secondary)" }}>No ratings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {pageItems.map((r) => (
        <div
          key={r.ratingId}
          className="flex items-center gap-4 p-4 rounded-lg border group"
          style={{
            backgroundColor: "var(--surface-bg)",
            borderColor: "var(--surface-border)",
          }}
        >
          <ScoreBadge score={r.rating} />
          <MediaBadge isMovie={r.isMovie} />
          <Link
            href={r.isMovie ? `/movies/${r.tmdbIdentifier}` : `/tv/${r.tmdbIdentifier}`}
            className="text-base truncate max-w-[320px] no-underline"
            style={{ color: "var(--surface-text)" }}
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
            className="ml-auto p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
            style={{ color: "var(--surface-text-dim)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--destructive-color)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--surface-text-dim)";
            }}
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
                className="px-2 py-1.5 rounded-md text-xs font-medium transition-colors disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--surface-bg)",
                  color: "var(--surface-text)",
                  opacity: page === 0 ? 0.4 : 1,
                }}
                onMouseEnter={(e) => {
                  if (page !== 0) e.currentTarget.style.backgroundColor = "var(--surface-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--surface-bg)";
                }}
              >
                First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-2 py-1.5 rounded-md text-sm transition-colors disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--surface-bg)",
                  color: "var(--surface-text)",
                  opacity: page === 0 ? 0.4 : 1,
                }}
                onMouseEnter={(e) => {
                  if (page !== 0) e.currentTarget.style.backgroundColor = "var(--surface-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--surface-bg)";
                }}
              >
                Prev
              </button>
              {pages.map((i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className="w-8 h-8 rounded-md text-sm font-medium transition-colors"
                  style={
                    i === page
                      ? { backgroundColor: "var(--primary-color)", color: "var(--primary-foreground)" }
                      : { backgroundColor: "var(--surface-bg)", color: "var(--surface-text-dim)" }
                  }
                  onMouseEnter={(e) => {
                    if (i !== page) {
                      e.currentTarget.style.color = "var(--surface-text)";
                      e.currentTarget.style.backgroundColor = "var(--surface-bg-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (i !== page) {
                      e.currentTarget.style.color = "var(--surface-text-dim)";
                      e.currentTarget.style.backgroundColor = "var(--surface-bg)";
                    }
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-2 py-1.5 rounded-md text-sm transition-colors disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--surface-bg)",
                  color: "var(--surface-text)",
                  opacity: page === totalPages - 1 ? 0.4 : 1,
                }}
                onMouseEnter={(e) => {
                  if (page !== totalPages - 1) e.currentTarget.style.backgroundColor = "var(--surface-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--surface-bg)";
                }}
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page === totalPages - 1}
                className="px-2 py-1.5 rounded-md text-xs font-medium transition-colors disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--surface-bg)",
                  color: "var(--surface-text)",
                  opacity: page === totalPages - 1 ? 0.4 : 1,
                }}
                onMouseEnter={(e) => {
                  if (page !== totalPages - 1) e.currentTarget.style.backgroundColor = "var(--surface-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--surface-bg)";
                }}
              >
                Last
              </button>
            </div>
          );
        })()}
    </div>
  );
}
