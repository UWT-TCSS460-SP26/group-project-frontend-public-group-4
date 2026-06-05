"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  getRatings,
  getReviews,
  deleteRating,
  fetchMediaTitles,
  ApiError,
} from "@/lib/api";
import { deleteReview, updateReview } from "@/lib/reviews";
import { updateRating } from "@/lib/ratings";
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

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Keyboard shortcut: r toggles ratings/reviews tab
  useEffect(() => {
    function handleToggleTab() {
      setTab((prev) => (prev === "ratings" ? "reviews" : "ratings"));
    }
    window.addEventListener("shortcut:toggle-profile-tab", handleToggleTab);
    return () =>
      window.removeEventListener(
        "shortcut:toggle-profile-tab",
        handleToggleTab,
      );
  }, []);

  const fetchData = useCallback(async (token: string) => {
    setLoading(true);
    setError(false);
    try {
      const [r, v] = await Promise.all([getRatings(token), getReviews(token)]);
      setRatings(r);
      setReviews(v);

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

  const handleUpdateRating = async (ratingId: number, newScore: number) => {
    const result = await updateRating(ratingId, newScore);
    if (result.error) {
      throw new Error(result.error);
    }
    setRatings((prev) =>
      prev.map((r) =>
        r.ratingId === ratingId ? { ...r, rating: newScore } : r,
      ),
    );
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const result = await deleteReview(reviewId);
      if (result.error) {
        setToast({ type: "error", message: result.error });
        return;
      }
      setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
      setToast({ type: "success", message: "Review deleted." });
    } catch (e) {
      setToast({
        type: "error",
        message: "Failed to delete review.",
      });
    }
  };

  const handleUpdateReview = async (reviewId: number, content: string) => {
    const result = await updateReview(reviewId, { reviewContent: content });
    if (result.error) {
      throw new Error(result.error);
    }
    setReviews((prev) =>
      prev.map((r) =>
        r.reviewId === reviewId ? { ...r, reviewContent: content } : r,
      ),
    );
  };

  if (status === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p style={{ color: "var(--text-primary)" }}>Loading...</p>
      </main>
    );
  }

  const user = session?.user;

  if (!user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <p style={{ color: "var(--text-primary)" }}>You are not signed in.</p>
        <Link
          href="/sign-in"
          className="rounded-md bg-amber-400 px-6 py-2.5 font-medium text-black hover:bg-amber-300 transition-colors no-underline"
        >
          Sign In
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full pt-6 md:pt-12 px-4 pb-12 space-y-8">
      <ProfileHeader name={user.name} email={user.email} image={user.image} />

      <TabBar active={tab} onChange={setTab} />

      {tab === "ratings" ? (
        <RatingsList
          ratings={ratings}
          titles={titles}
          onDelete={handleDeleteRating}
          onUpdate={handleUpdateRating}
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

      <div
        className="pt-4 border-t flex justify-center"
        style={{ borderColor: "var(--profile-border)" }}
      >
        <Link
          href="/"
          className="rounded-md px-6 py-2.5 font-medium transition-colors no-underline"
          style={{
            backgroundColor: "var(--btn-secondary-bg)",
            color: "var(--btn-secondary-text)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              "var(--btn-secondary-hover-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--btn-secondary-bg)";
          }}
        >
          Back to Home
        </Link>
      </div>

      {/* Toast Popup */}
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
    </main>
  );
}
