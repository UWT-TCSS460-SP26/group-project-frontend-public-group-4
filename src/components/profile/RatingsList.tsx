"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Delete, Edit, Close } from "@mui/icons-material";
import ScoreBadge from "./ScoreBadge";
import MediaBadge from "./MediaBadge";
import type { RatingRecord } from "@/types/community";
import ConfirmDialog from "@/components/ConfirmDialog";

const ITEMS_PER_PAGE = 25;

interface Toast {
  type: "success" | "error";
  message: string;
}

interface RatingsListProps {
  ratings: RatingRecord[];
  titles: Map<string, string>;
  onDelete: (ratingId: number) => void;
  onUpdate: (ratingId: number, newScore: number) => Promise<void>;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

export default function RatingsList({
  ratings,
  titles,
  onDelete,
  onUpdate,
  loading,
  error,
  onRetry,
}: RatingsListProps) {
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editScore, setEditScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [editStatus, setEditStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (editStatus === "success") {
      const timer = setTimeout(() => setEditStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [editStatus]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && editingId !== null) {
        setEditingId(null);
        setEditStatus("idle");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editingId]);

  const handleStarClick = async (
    ratingId: number,
    clickedScore: number,
    originalScore: number,
  ) => {
    if (editStatus === "saving") return;
    setHoverScore(0);
    setEditScore(clickedScore);
    setEditStatus("saving");
    try {
      await onUpdate(ratingId, clickedScore);
      setEditStatus("success");
      setToast({ type: "success", message: "Rating updated!" });
    } catch (e) {
      setEditStatus("error");
      setEditScore(originalScore); // Revert on failure
      setToast({
        type: "error",
        message: e instanceof Error ? e.message : "Failed to update rating.",
      });
    }
  };

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
        <button onClick={onRetry} className="mt-2 text-sm btn-text-primary">
          Retry
        </button>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8">
        <Star
          className="mx-auto mb-2"
          style={{ fontSize: 40, color: "var(--surface-text-dim)" }}
        />
        <p style={{ color: "var(--text-secondary)" }}>No ratings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pageItems.map((r) => {
        const isEditing = editingId === r.ratingId;

        return (
          <div
            key={r.ratingId}
            className="flex flex-col rounded-lg border group overflow-hidden"
            style={{
              backgroundColor: "var(--surface-bg)",
              borderColor: "var(--surface-border)",
            }}
          >
            <div className="flex items-center gap-4 p-4">
              <ScoreBadge score={r.rating} />
              <MediaBadge isMovie={r.isMovie} />
              <Link
                href={
                  r.isMovie
                    ? `/movies/${r.tmdbIdentifier}?returnUrl=%2Fprofile`
                    : `/tv/${r.tmdbIdentifier}?returnUrl=%2Fprofile`
                }
                className="text-base truncate max-w-[320px] no-underline"
                style={{ color: "var(--surface-text)" }}
              >
                {titles.get(
                  r.isMovie ? `m-${r.tmdbIdentifier}` : `s-${r.tmdbIdentifier}`,
                ) ?? `TMDB #${r.tmdbIdentifier}`}
              </Link>

              <div className="ml-auto flex gap-1 transition-all">
                <button
                  onClick={() => {
                    if (isEditing) {
                      setEditingId(null);
                      setEditStatus("idle");
                    } else {
                      setEditingId(r.ratingId);
                      setEditScore(r.rating);
                      setEditStatus("idle");
                    }
                  }}
                  className="p-1.5 btn-icon btn-icon-edit"
                  title={isEditing ? "Close" : "Edit rating"}
                >
                  {isEditing ? (
                    <Close style={{ fontSize: 18 }} />
                  ) : (
                    <Edit style={{ fontSize: 18 }} />
                  )}
                </button>

                {!isEditing && (
                  <button
                    onClick={() => setConfirmDeleteId(r.ratingId)}
                    disabled={deleting === r.ratingId}
                    className="p-1.5 btn-icon btn-icon-delete disabled:opacity-50"
                    title="Delete rating"
                  >
                    <Delete style={{ fontSize: 18 }} />
                  </button>
                )}
              </div>
            </div>

            {isEditing && (
              <div
                className="p-4 border-t rounded-b-lg flex flex-col gap-4 transition-all duration-300"
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor:
                    editStatus === "saving"
                      ? "var(--primary-color)"
                      : editStatus === "success"
                        ? "var(--badge-success)"
                        : editStatus === "error"
                          ? "var(--destructive-color)"
                          : "var(--surface-border)",
                  boxShadow:
                    editStatus === "saving"
                      ? "inset 0 0 0 1px var(--primary-color)"
                      : editStatus === "success"
                        ? "inset 0 0 0 1px var(--badge-success)"
                        : editStatus === "error"
                          ? "inset 0 0 0 1px var(--destructive-color)"
                          : "none",
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 text-center shrink-0">
                    <span
                      className="font-bold text-3xl leading-none"
                      style={{ color: "var(--primary-color)" }}
                    >
                      {hoverScore || editScore}
                      <span
                        className="text-lg font-medium ml-px"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        /10
                      </span>
                    </span>
                  </div>
                  {/* Rating Bar */}
                  <div
                    className="flex-1 flex justify-between items-center gap-1 h-10"
                    onMouseLeave={() => setHoverScore(0)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
                      const activeScore = hoverScore || editScore;
                      const isActive = i <= activeScore;
                      const customStyle = isActive
                        ? {
                            backgroundColor: hoverScore
                              ? `hsl(${(activeScore - 1) * 14}, 84%, 50%)`
                              : "var(--primary-color)",
                            opacity: hoverScore ? 1 : 0.6,
                          }
                        : {};

                      return (
                        <button
                          key={i}
                          autoFocus={i === r.rating}
                          type="button"
                          style={{
                            ...customStyle,
                            backgroundColor: isActive
                              ? customStyle.backgroundColor
                              : "var(--rating-bar-inactive)",
                          }}
                          className="flex-1 h-full rounded-xs transition-all duration-150"
                          onMouseEnter={() => setHoverScore(i)}
                          onClick={() =>
                            handleStarClick(r.ratingId, i, r.rating)
                          }
                          aria-label={`Rate ${i} out of 10`}
                        />
                      );
                    })}
                  </div>
                </div>
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
                  if (page !== 0)
                    e.currentTarget.style.backgroundColor =
                      "var(--surface-bg-hover)";
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
                  if (page !== 0)
                    e.currentTarget.style.backgroundColor =
                      "var(--surface-bg-hover)";
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
                      ? {
                          backgroundColor: "var(--primary-color)",
                          color: "var(--primary-foreground)",
                        }
                      : {
                          backgroundColor: "var(--surface-bg)",
                          color: "var(--surface-text-dim)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (i !== page) {
                      e.currentTarget.style.color = "var(--surface-text)";
                      e.currentTarget.style.backgroundColor =
                        "var(--surface-bg-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (i !== page) {
                      e.currentTarget.style.color = "var(--surface-text-dim)";
                      e.currentTarget.style.backgroundColor =
                        "var(--surface-bg)";
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
                  if (page !== totalPages - 1)
                    e.currentTarget.style.backgroundColor =
                      "var(--surface-bg-hover)";
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
                  if (page !== totalPages - 1)
                    e.currentTarget.style.backgroundColor =
                      "var(--surface-bg-hover)";
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

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete Rating"
        message="Are you sure you want to delete this rating? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting !== null}
        onConfirm={() => {
          if (confirmDeleteId !== null) {
            setDeleting(confirmDeleteId);
            onDelete(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg px-5 py-4 shadow-xl border transition-all duration-300"
          style={
            toast.type === "success"
              ? {
                  backgroundColor: "var(--toast-success-bg)",
                  borderColor: "var(--toast-success-border)",
                  color: "var(--toast-success-text)",
                }
              : {
                  backgroundColor: "var(--toast-error-bg)",
                  borderColor: "var(--toast-error-border)",
                  color: "var(--toast-error-text)",
                }
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
