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

  const handleSaveEdit = async (reviewId: number) => {
    if (!editContent.trim() || saving) return;
    setSaving(true);
    try {
      await onUpdate(reviewId, editContent.trim());
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
  };

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
        <p style={{ color: "var(--text-muted)" }}>Could not load reviews.</p>
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
        <RateReview
          className="mx-auto mb-2"
          style={{ fontSize: 40, color: "var(--text-secondary)" }}
        />
        <p style={{ color: "var(--text-secondary)" }}>No reviews yet</p>
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
          className="p-4 rounded-lg border space-y-2 group"
          style={{
            backgroundColor: "var(--surface-bg)",
            borderColor: "var(--surface-border)",
          }}
        >
          <div className="flex items-center gap-2">
            <MediaBadge isMovie={r.isMovie} />
            <span
              className="text-base truncate max-w-70"
              style={{ color: "var(--surface-text-muted)" }}
            >
              {titles.get(
                r.isMovie ? `m-${r.tmdbIdentifier}` : `s-${r.tmdbIdentifier}`,
              ) ?? `TMDB #${r.tmdbIdentifier}`}
            </span>
            <span className="text-xs ml-auto" style={{ color: "var(--text-secondary)" }}>
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
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--primary-color)";
                    e.currentTarget.style.backgroundColor = "var(--surface-bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
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
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--destructive-color)";
                    e.currentTarget.style.backgroundColor = "var(--surface-bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
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
                onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); handleSaveEdit(r.reviewId); } }}
                rows={3}
                maxLength={2000}
                disabled={saving}
                className="w-full rounded p-2 text-sm resize-y border focus:outline-none transition-colors"
                style={{
                  backgroundColor: "var(--input-bg)",
                  color: "var(--foreground)",
                  borderColor: "var(--input-border)",
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {editContent.length}/2000
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingId(null); setEditContent(""); }}
                    disabled={saving}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded transition-colors"
                    style={{
                      backgroundColor: "var(--btn-secondary-bg)",
                      color: "var(--btn-secondary-text)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--btn-secondary-hover-bg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--btn-secondary-bg)";
                    }}
                  >
                    <Close style={{ fontSize: 14 }} aria-hidden="true" />
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(r.reviewId)}
                    disabled={!editContent.trim() || saving}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded font-medium transition-colors"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "var(--primary-foreground)",
                      opacity: !editContent.trim() || saving ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (editContent.trim() && !saving) {
                        e.currentTarget.style.backgroundColor = "var(--primary-hover)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--primary-color)";
                    }}
                  >
                    <Check style={{ fontSize: 14 }} aria-hidden="true" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p
                id={contentId}
                className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                style={{ color: "var(--surface-text)" }}
              >
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
                  className="text-xs font-semibold mt-1 uppercase tracking-wider transition-colors"
                  style={{ color: "var(--primary-color)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--primary-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--primary-color)";
                  }}
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
                  style={i === page
                    ? { backgroundColor: "var(--primary-color)", color: "var(--primary-foreground)" }
                    : { backgroundColor: "var(--surface-bg)", color: "var(--surface-text-muted)" }
                  }
                  onMouseEnter={(e) => {
                    if (i !== page) {
                      e.currentTarget.style.color = "var(--surface-text)";
                      e.currentTarget.style.backgroundColor = "var(--surface-bg-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (i !== page) {
                      e.currentTarget.style.color = "var(--surface-text-muted)";
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

      {/* Toast Popup */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg px-5 py-4 shadow-xl border transition-all duration-300"
          style={toast.type === "success"
            ? { backgroundColor: "var(--toast-success-bg)", borderColor: "var(--toast-success-border)", color: "var(--toast-success-text)" }
            : { backgroundColor: "var(--toast-error-bg)", borderColor: "var(--toast-error-border)", color: "var(--toast-error-text)" }
          }
        >
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0" aria-hidden="true">
              {toast.type === "success" ? "\u2713" : "\u2715"}
            </span>
            <p className="text-sm leading-relaxed">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              aria-label="Close notification"
              className="shrink-0 opacity-60 hover:opacity-100 ml-2 transition-colors"
            >
              {"\u2715"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
