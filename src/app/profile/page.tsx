"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Star, RateReview, Movie, Tv, Edit, Delete, Close, Check } from "@mui/icons-material";
import { getRatings, getReviews, updateReview, deleteReview, ApiError } from "@/lib/api";
import { RatingRecord, ReviewRecord } from "@/types/community";

type Tab = "ratings" | "reviews";

interface Toast {
  type: "success" | "error";
  message: string;
}

function ScoreBadge({ score }: { score: number }) {
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

function MediaBadge({ isMovie }: { isMovie: boolean }) {
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ExpandableText({ text, reviewId }: { text: string; reviewId: number }) {
  const [expanded, setExpanded] = useState(false);
  const MAX = 300;
  const isLong = text.length > MAX;
  const contentId = `review-content-${reviewId}`;

  return (
    <div>
      <p id={contentId} className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
        {isLong && !expanded ? text.slice(0, MAX) + "..." : text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={contentId}
          className="text-amber-400 hover:text-amber-300 text-xs font-semibold mt-1 uppercase tracking-wider transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>("ratings");
  const [ratings, setRatings] = useState<RatingRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchData = useCallback(async (token: string) => {
    setLoading(true);
    setError(false);
    try {
      const [r, v] = await Promise.all([getRatings(token), getReviews(token)]);
      setRatings(r);
      setReviews(v);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetchData(session.accessToken);
    } else if (status === "authenticated" && !session?.accessToken) {
      setLoading(false);
    }
  }, [status, session?.accessToken, fetchData]);

  const handleEdit = (review: ReviewRecord) => {
    setEditingId(review.reviewId);
    setEditContent(review.reviewContent);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (reviewId: number) => {
    if (!editContent.trim() || !session?.accessToken) return;
    setSaving(true);
    try {
      await updateReview(session.accessToken, reviewId, {
        reviewContent: editContent.trim(),
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.reviewId === reviewId ? { ...r, reviewContent: editContent.trim() } : r
        )
      );
      setEditingId(null);
      setEditContent("");
      setToast({ type: "success", message: "Review updated!" });
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : "Failed to update review.";
      setToast({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!session?.accessToken) return;
    try {
      await deleteReview(session.accessToken, reviewId);
      setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
      setToast({ type: "success", message: "Review deleted." });
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : "Failed to delete review.";
      setToast({ type: "error", message: msg });
    }
  };

  if (status === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </main>
    );
  }

  const user = session?.user;

  if (!user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <p className="text-zinc-400">You are not signed in.</p>
        <Link
          href="/sign-in"
          className="rounded-md bg-amber-400 px-6 py-2.5 font-medium text-black hover:bg-amber-300 transition-colors"
        >
          Sign In
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 space-y-8">
      {/* Profile header */}
      <div className="flex flex-col items-center gap-3">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? "Avatar"}
            className="w-20 h-20 rounded-full ring-2 ring-amber-400"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400 text-3xl font-bold ring-2 ring-amber-400">
            {(user.name ?? "U")[0].toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100">
            {user.name ?? "User"}
          </h1>
          {user.email && (
            <p className="text-sm text-zinc-500 mt-0.5">{user.email}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-800 rounded-lg">
        {(["ratings", "reviews"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t === "ratings" ? (
              <Star style={{ fontSize: 18 }} />
            ) : (
              <RateReview style={{ fontSize: 18 }} />
            )}
            {t === "ratings" ? "Ratings" : "Reviews"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div aria-live="polite" aria-busy={loading}>
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-zinc-400">Could not load data.</p>
          <button
            onClick={() =>
              session.accessToken && fetchData(session.accessToken)
            }
            className="mt-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : tab === "ratings" ? (
        ratings.length === 0 ? (
          <div className="text-center py-8">
            <Star
              className="mx-auto mb-2 text-zinc-600"
              style={{ fontSize: 40 }}
            />
            <p className="text-zinc-500">No ratings yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ratings.map((r) => (
              <div
                key={r.ratingId}
                className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/60 border border-zinc-700/50"
              >
                <ScoreBadge score={r.rating} />
                <MediaBadge isMovie={r.isMovie} />
                <span className="text-sm text-zinc-400 font-mono">
                  TMDB #{r.tmdbIdentifier}
                </span>
              </div>
            ))}
          </div>
        )
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <RateReview
            className="mx-auto mb-2 text-zinc-600"
            style={{ fontSize: 40 }}
          />
          <p className="text-zinc-500">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.reviewId}
              className="p-4 rounded-lg bg-zinc-800/60 border border-zinc-700/50 space-y-2"
            >
              <div className="flex items-center gap-2">
                <MediaBadge isMovie={r.isMovie} />
                <span className="text-xs text-zinc-500 font-mono">
                  TMDB #{r.tmdbIdentifier}
                </span>
                <span className="text-xs text-zinc-600 ml-auto">
                  {formatDate(r.dateOfReview)}
                </span>
              </div>

              {editingId === r.reviewId ? (
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
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                    >
                      <Close style={{ fontSize: 14 }} />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(r.reviewId)}
                      disabled={!editContent.trim() || saving}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-amber-500 text-black font-medium hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Check style={{ fontSize: 14 }} />
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>                </div>              ) : (
                <>
                  <ExpandableText text={r.reviewContent} reviewId={r.reviewId} />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(r)}
                      aria-label={`Edit review for TMDB #${r.tmdbIdentifier}`}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-700/50 transition-colors"
                    >
                      <Edit style={{ fontSize: 14 }} aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.reviewId)}
                      aria-label={`Delete review for TMDB #${r.tmdbIdentifier}`}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-700/50 transition-colors"
                    >
                      <Delete style={{ fontSize: 14 }} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Sign out */}
      <div className="pt-4 border-t border-zinc-800 flex justify-center">
        <Link
          href="/"
          className="rounded-md bg-zinc-700 px-6 py-2.5 font-medium text-zinc-100 hover:bg-zinc-600 transition-colors"
        >
          Back to Home
        </Link>
      </div>

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
    </main>
  );
}
