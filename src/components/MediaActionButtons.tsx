"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { postReview, updateReview, deleteReview, ApiError } from "@/lib/api";
import RatingWidget from "./RatingWidget";

interface MediaActionButtonsProps {
  isLoggedIn?: boolean;
  accessToken?: string;
  tmdbIdentifier?: number;
  isMovie?: boolean;
  userRating?: { id: number; value: number } | null;
  userReview?: { reviewId: number; reviewContent: string; dateOfReview: string } | null;
  returnUrl?: string;
}

interface Toast {
  type: "success" | "error";
  message: string;
}

export default function MediaActionButtons({
  isLoggedIn,
  accessToken: serverToken,
  tmdbIdentifier,
  isMovie,
  userRating,
  userReview,
  returnUrl,
}: MediaActionButtonsProps) {
  const { data: session, status } = useSession();
  const accessToken = serverToken || session?.accessToken;
  const loggedIn = isLoggedIn || status === "authenticated";

  const [reviewContent, setReviewContent] = useState(userReview?.reviewContent ?? "");
  const [existingReview, setExistingReview] = useState(userReview);
  const [editing, setEditing] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Auto-dismiss toast after 5s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) return;
    if (!accessToken) {
      setToast({ type: "error", message: "Not authenticated. Try signing out and back in." });
      return;
    }
    if (tmdbIdentifier == null) return;
    setReviewSubmitting(true);
    try {
      await postReview(accessToken, {
        tmdbIdentifier,
        isMovie: !!isMovie,
        reviewContent: reviewContent.trim(),
      });
      const newReview = {
        reviewId: Date.now(),
        reviewContent: reviewContent.trim(),
        dateOfReview: new Date().toISOString(),
      };
      setExistingReview(newReview);
      setReviewContent("");
      setToast({ type: "success", message: "Your review has been submitted!" });
    } catch (e) {
      if (e instanceof ApiError) {
        setToast({ type: "error", message: e.message });
      } else {
        setToast({ type: "error", message: "Failed to submit review. Please try again." });
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview || !accessToken) return;
    setDeleting(true);
    try {
      await deleteReview(accessToken, existingReview.reviewId);
      setExistingReview(null);
      setReviewContent("");
      setToast({ type: "success", message: "Review deleted." });
    } catch (e) {
      setToast({ type: "error", message: e instanceof ApiError ? e.message : "Failed to delete review." });
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateReview = async () => {
    if (!reviewContent.trim() || !existingReview || !accessToken) return;
    setReviewSubmitting(true);
    try {
      await updateReview(accessToken, existingReview.reviewId, { reviewContent: reviewContent.trim() });
      setExistingReview({ ...existingReview, reviewContent: reviewContent.trim() });
      setEditing(false);
      setToast({ type: "success", message: "Review updated!" });
    } catch (e) {
      setToast({ type: "error", message: e instanceof ApiError ? e.message : "Failed to update review." });
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="flex flex-col gap-2">
        <Link
          href={`/sign-in${returnUrl ? `?callbackUrl=${encodeURIComponent(returnUrl)}` : ""}`}
          className="block w-full text-center bg-amber-600 text-white py-2.5 px-4 rounded font-semibold hover:bg-amber-700 transition-colors"
        >
          Sign in to Rate
        </Link>
        <button
          disabled
          className="w-full bg-neutral-700/50 text-white py-2.5 px-4 rounded font-semibold cursor-not-allowed opacity-70"
        >
          Sign in to Review
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <RatingWidget
        tmdbIdentifier={tmdbIdentifier}
        isMovie={isMovie}
        initialRatingId={userRating?.id}
        initialRatingValue={userRating?.value}
      />

      {/* Review Section */}
      {existingReview ? (
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400 text-xs">
              Your review &middot; {new Date(existingReview.dateOfReview).toLocaleDateString()}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => { setEditing(true); setReviewContent(existingReview.reviewContent); }}
                disabled={editing || deleting}
                className="text-xs px-2 py-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-700/50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteReview}
                disabled={deleting}
                className="text-xs px-2 py-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-700/50 transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                rows={3}
                maxLength={2000}
                disabled={reviewSubmitting}
                className="w-full bg-neutral-900 text-white rounded p-2 text-sm resize-y border border-neutral-600 focus:border-amber-400 focus:outline-none transition-colors"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">{reviewContent.length}/2000</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(false); setReviewContent(existingReview.reviewContent); }}
                    disabled={reviewSubmitting}
                    className="text-xs px-3 py-1.5 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateReview}
                    disabled={!reviewContent.trim() || reviewSubmitting}
                    className="text-xs px-3 py-1.5 rounded bg-amber-500 text-black font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
                  >
                    {reviewSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
              {existingReview.reviewContent}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <label htmlFor="review-textarea" className="text-neutral-300 text-sm mb-2 block font-medium">
            Write a Review
          </label>
          <textarea
            id="review-textarea"
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            placeholder="What did you think..."
            rows={4}
            maxLength={2000}
            disabled={reviewSubmitting}
            className="w-full bg-neutral-900 text-white rounded p-3 text-sm resize-y border border-neutral-700 focus:border-blue-500 focus:outline-none transition-colors placeholder:text-neutral-500"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-neutral-500 text-xs">{reviewContent.length}/2000</span>
            <button
              onClick={handleSubmitReview}
              disabled={!reviewContent.trim() || reviewSubmitting}
              className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {reviewSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}

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
