"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RateReview, Delete, Edit, Close, Check } from "@mui/icons-material";
import { ApiError } from "@/lib/api";
import MediaBadge from "./MediaBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import AppButton from "@/components/ui/AppButton";
import Toast from "@/components/ui/Toast";
import Pagination from "@/components/ui/Pagination";
import type { ReviewRecord } from "@/types/community";

const ITEMS_PER_PAGE = 25;

const BASE_URL = "";

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
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && editingId !== null) {
        setEditingId(null);
        setEditContent("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editingId]);

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
        <button onClick={onRetry} className="mt-2 text-sm btn-text-primary">
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
              <Link
                href={
                  r.isMovie
                    ? `/movies/${r.tmdbIdentifier}?returnUrl=%2Fprofile`
                    : `/tv/${r.tmdbIdentifier}?returnUrl=%2Fprofile`
                }
                className="text-base truncate max-w-70 no-underline"
                style={{ color: "var(--surface-text-muted)" }}
              >
                {titles.get(
                  r.isMovie ? `m-${r.tmdbIdentifier}` : `s-${r.tmdbIdentifier}`,
                ) ?? `TMDB #${r.tmdbIdentifier}`}
              </Link>
              <span
                className="text-xs ml-auto"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatDate(r.dateOfReview)}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <label
                  htmlFor={`edit-review-${r.reviewId}`}
                  className="sr-only"
                >
                  Edit your review
                </label>
                <textarea
                  id={`edit-review-${r.reviewId}`}
                  autoFocus
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === "Enter") {
                      e.preventDefault();
                      handleSaveEdit(r.reviewId);
                    }
                    if (e.key === "Escape") {
                      setEditingId(null);
                      setEditContent("");
                    }
                  }}
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
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {editContent.length}/2000
                  </span>
                  <div className="flex gap-2">
                    <AppButton
                      variant="secondary"
                      size="sm"
                      onClick={() => { setEditingId(null); setEditContent(""); }}
                      disabled={saving}
                      className="flex items-center gap-1"
                    >
                      <Close style={{ fontSize: 14 }} aria-hidden="true" />
                      Cancel
                    </AppButton>
                    <AppButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleSaveEdit(r.reviewId)}
                      disabled={!editContent.trim() || saving}
                      className="flex items-center gap-1 disabled:opacity-50"
                    >
                      <Check style={{ fontSize: 14 }} aria-hidden="true" />
                      {saving ? "Saving..." : "Save"}
                    </AppButton>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p
                  id={contentId}
                  className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word"
                  style={{ color: "var(--surface-text)" }}
                >
                  {isLong && !expanded
                    ? r.reviewContent.slice(0, 300) + "..."
                    : r.reviewContent}
                </p>
                {isLong && (
                  <button
                    onClick={() => {
                      setExpandedIds((prev) => {
                        const next = new Set(prev);
                        expanded
                          ? next.delete(r.reviewId)
                          : next.add(r.reviewId);
                        return next;
                      });
                    }}
                    aria-expanded={expanded}
                    aria-controls={contentId}
                    className="text-xs font-semibold mt-3 uppercase tracking-wider btn-text-primary"
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}

            {!isEditing && (
              <div className="flex justify-end gap-1 transition-all">
                <button
                  onClick={() => { setEditingId(r.reviewId); setEditContent(r.reviewContent); }}
                  className="p-1.5 btn-icon btn-icon-edit"
                  title="Edit review"
                  aria-label={`Edit review for ${titles.get(r.isMovie ? `m-${r.tmdbIdentifier}` : `s-${r.tmdbIdentifier}`) ?? `TMDB #${r.tmdbIdentifier}`}`}
                >
                  <Edit style={{ fontSize: 18 }} aria-hidden="true" />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(r.reviewId)}
                  disabled={deleting === r.reviewId}
                  className="p-1.5 btn-icon btn-icon-delete disabled:opacity-50"
                  title="Delete review"
                  aria-label={`Delete review for ${titles.get(r.isMovie ? `m-${r.tmdbIdentifier}` : `s-${r.tmdbIdentifier}`) ?? `TMDB #${r.tmdbIdentifier}`}`}
                >
                  <Delete style={{ fontSize: 18 }} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}

      {/* Toast Popup */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete Review"
        message="Are you sure you want to delete this review? Deleted content cannot be recovered."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting !== null}
        onConfirm={async () => {
          if (confirmDeleteId === null) return;

          const reviewId = confirmDeleteId;

          setConfirmDeleteId(null);
          setDeleting(reviewId);

          try {
            await onDelete(reviewId);
          } finally {
            setDeleting(null);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
