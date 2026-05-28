"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  getRatings,
  getReviews,
  deleteRating,
  deleteReview,
  fetchMediaTitles,
} from "@/lib/api";
import type { RatingRecord, ReviewRecord } from "@/types/community";
import ProfileHeader from "@/components/profile/ProfileHeader";
import TabBar from "@/components/profile/TabBar";
import type { Tab } from "@/components/profile/TabBar";
import RatingsList from "@/components/profile/RatingsList";
import ReviewsList from "@/components/profile/ReviewsList";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>("ratings");
  const [ratings, setRatings] = useState<RatingRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [titles, setTitles] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    } catch {
      // item stays in list; user can retry
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
    </main>
  );
}
