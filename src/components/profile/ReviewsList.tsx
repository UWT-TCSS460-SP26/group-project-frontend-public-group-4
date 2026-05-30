"use client";

import { useState, useEffect } from "react";
import { RateReview, Delete, Edit, Close, Check } from "@mui/icons-material";
import { ApiError } from "@/lib/api";
import MediaBadge from "./MediaBadge";
import type { ReviewRecord } from "@/types/community";

const ITEMS_PER_PAGE = 25;

interface Toast {
  type: "success" | "error";
  message: string;
}

interface ReviewsListProps {
  reviews: ReviewRecord[];
  titles: Map<string, string>;
  onDelete: (reviewId: number) => void;
  onUpdate: (reviewId: number, content: string) => Promise<void>;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReviewsList({
  reviews,
  titles,
  onDelete,
  onUpdate,
  loading,
  error,
  onRetry,
}: ReviewsListProps) {
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const sorted = [...reviews].sort(
    (a, b) =>
      new Date(b.dateOfReview).getTime() - new Date(a.dateOfReview).getTime(),
  );
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
        <p className="text-zinc-400">Could not load reviews.</p>
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
        <RateReview
          className="mx-auto mb-2 text-zinc-600"
          style={{ fontSize: 40 }}
        />
        <p className="text-zinc-500">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pageItems.map((r) => {
        const isEditing = editingId === r.reviewId;
        const contentId = `review-content-${r.reviewId}`;
        const isLong = r.reviewContent.length > 300;
        const expanded = expandedIds.has(r.reviewId);

        return (
        <div
          key={r.reviewId}
          className="p-4 rounded-lg bg-zinc-800/60 border border-zinc-700/50 space-y-2 group"
        >
          <div className="flex items-center gap-2">
            <MediaBadge isMovie={r.isMovie} />
            <span className="text-base text-zinc-400 truncate max-w-70">
              {titles.get(
                r.isMovie ? `m-${r.tmdbIdentifier}` : `s-${r.tmdbIdentifier}`,
              ) ?? `TMDB #${r.tmdbIdentifier}`}
            </span>
            <span className="text-xs text-zinc-600 ml-auto">
              {formatDate(r.dateOfReview)}
            </span>

            {!isEditing && (
              <>
                <button
                  onClick={() => {
                    setEditingId(r.reviewId);
                    setEditContent(r.reviewContent);
                  }}
                  aria-label={`Edit review for ${titles.get(r.isMovie ? `m-${r.tmdbIdentifier}` : `s-${r.tmdbIdentifier}`) ?? `TMDB #${r.tmdbIdentifier}`}`}
                  className="p-1 rounded-md text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Edit review"
                >
                  <Edit style={{ fontSize: 16 }} aria-hidden="true" />
                </button>
                <button
                  onClick={() => {
                    setDeleting(r.reviewId);
                    onDelete(r.reviewId);
                  }}
                  disabled={deleting === r.reviewId}
                  className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  title="Delete review"
                  aria-label={`Delete review for ${titles.get(r.isMovie ? `m-${r.tmdbIdentifier}` : `s-${r.tmdbIdentifier}`) ?? `TMDB #${r.tmdbIdentifier}`}`}
                >
                  <Delete style={{ fontSize: 16 }} aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <label htmlFor={`edit-review-${r.reviewId}`} className="sr-only">
                Edit your review
              </label>
              <textarea
                id={`edit-review-${r.reviewId}`}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                maxLength={2000}
                disabled={saving}
                className="w-full bg-zinc-900 text-zinc-200 rounded p-2 text-sm resize-y border border-zinc-600 focus:border-amber-400 focus:outline-none transition-colors"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {editContent.length}/2000
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingId(null); setEditContent(""); }}
                    disabled={saving}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                  >
                    <Close style={{ fontSize: 14 }} aria-hidden="true" />
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!editContent.trim() || saving) return;
                      setSaving(true);
                      try {
                        await onUpdate(r.reviewId, editContent.trim());
                        setEditingId(null);
                        setEditContent("");
                        setToast({ type: "success", message: "Review updated!" });
                      } catch (e) {
                        setToast({
                          type: "error",
                          message: e instanceof ApiError ? e.message : "Failed to update review.",
                        });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={!editContent.trim() || saving}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-amber-500 text-black font-medium hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Check style={{ fontSize: 14 }} aria-hidden="true" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p id={contentId} className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                {isLong && !expanded ? r.reviewContent.slice(0, 300) + "..." : r.reviewContent}
              </p>
              {isLong && (
                <button
                  onClick={() => {
                    setExpandedIds((prev) => {
                      const next = new Set(prev);
                      expanded ? next.delete(r.reviewId) : next.add(r.reviewId);
                      return next;
                    });
                  }}
                  aria-expanded={expanded}
                  aria-controls={contentId}
                  className="text-amber-400 hover:text-amber-300 text-xs font-semibold mt-1 uppercase tracking-wider transition-colors"
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}
        </div>
        );
      })}

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

      {/* Toast Popup */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg px-5 py-4 shadow-xl border transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-900/95 border-green-700 text-green-100"
              : "bg-red-900/95 border-red-700 text-red-100"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0" aria-hidden="true">
              {toast.type === "success" ? "✓" : "✕"}
            </span>
            <p className="text-sm leading-relaxed">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              aria-label="Close notification"
              className="shrink-0 text-white/60 hover:text-white ml-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
