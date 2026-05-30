"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  getRatings,
  getReviews,
  deleteRating,
  deleteReview,
  updateReview,
  fetchMediaTitles,
  ApiError,
} from "@/lib/api";
import type { RatingRecord, ReviewRecord } from "@/types/community";
import ProfileHeader from "@/components/profile/ProfileHeader";
import TabBar from "@/components/profile/TabBar";
import type { Tab } from "@/components/profile/TabBar";
import RatingsList from "@/components/profile/RatingsList";
import ReviewsList from "@/components/profile/ReviewsList";

interface Toast {
  type: "success" | "error";
  message: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>("ratings");
  const [ratings, setRatings] = useState<RatingRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [titles, setTitles] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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

      // Fetch media titles for all unique tmdbId+type combos
      const seen = new Set<string>();
      const deduped: { tmdbId: number; isMovie: boolean }[] = [];
      for (const item of [...r, ...v]) {
        const key = `${item.isMovie ? "m" : "s"}-${item.tmdbIdentifier}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push({ tmdbId: item.tmdbIdentifier, isMovie: item.isMovie });
        }
      }
      if (deduped.length > 0) {
        fetchMediaTitles(deduped).then(setTitles);
      }
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

  const handleDeleteRating = async (ratingId: number) => {
    if (!session?.accessToken) return;
    try {
      await deleteRating(session.accessToken, ratingId);
      setRatings((prev) => prev.filter((r) => r.ratingId !== ratingId));
    } catch {
      // item stays in list; user can retry
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!session?.accessToken) return;
    try {
      await deleteReview(session.accessToken, reviewId);
      setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
      setToast({ type: "success", message: "Review deleted." });
    } catch (e) {
      setToast({
        type: "error",
        message: e instanceof ApiError ? e.message : "Failed to delete review.",
      });
    }
  };

  const handleUpdateReview = async (reviewId: number, content: string) => {
    if (!session?.accessToken) throw new Error("Not authenticated");
    await updateReview(session.accessToken, reviewId, { reviewContent: content });
    setReviews((prev) =>
      prev.map((r) =>
        r.reviewId === reviewId ? { ...r, reviewContent: content } : r,
      ),
    );
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
      <ProfileHeader name={user.name} email={user.email} image={user.image} />

      <TabBar active={tab} onChange={setTab} />

      {tab === "ratings" ? (
        <RatingsList
          ratings={ratings}
          titles={titles}
          onDelete={handleDeleteRating}
          loading={loading}
          error={error}
          onRetry={() => session.accessToken && fetchData(session.accessToken)}
        />
      ) : (
        <ReviewsList
          reviews={reviews}
          titles={titles}
          onDelete={handleDeleteReview}
          onUpdate={handleUpdateReview}
          loading={loading}
          error={error}
          onRetry={() => session.accessToken && fetchData(session.accessToken)}
        />
      )}

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
