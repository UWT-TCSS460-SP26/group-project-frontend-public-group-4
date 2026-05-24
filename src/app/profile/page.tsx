"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Star, RateReview, Movie, Tv } from "@mui/icons-material";
import { getRatings, getReviews, type RatingRecord, type ReviewRecord } from "@/lib/api";

type Tab = "ratings" | "reviews";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8
      ? "bg-green-600"
      : score >= 6
        ? "bg-amber-500"
        : "bg-red-500";
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
      {isMovie ? <Movie style={{ fontSize: 14 }} /> : <Tv style={{ fontSize: 14 }} />}
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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>("ratings");
  const [ratings, setRatings] = useState<RatingRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
            {t === "ratings" ? <Star style={{ fontSize: 18 }} /> : <RateReview style={{ fontSize: 18 }} />}
            {t === "ratings" ? "Ratings" : "Reviews"}
          </button>
        ))}
      </div>

      {/* Content */}
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
            onClick={() => session.accessToken && fetchData(session.accessToken)}
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
              <p className="text-sm text-zinc-300 leading-relaxed">
                {r.reviewContent}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Sign out */}
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
