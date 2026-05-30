"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { postReview, ApiError } from "@/lib/api";

interface MediaActionButtonsProps {
  isLoggedIn?: boolean;
  accessToken?: string;
  tmdbId: number;
  isMovie: boolean;
}

interface Toast {
  type: "success" | "error";
  message: string;
}

export default function MediaActionButtons({
  isLoggedIn,
  accessToken: serverToken,
  tmdbId,
  isMovie,
}: MediaActionButtonsProps) {
  const { data: session, status } = useSession();
  const accessToken = serverToken || session?.accessToken;
  const loggedIn = isLoggedIn || status === "authenticated";

  const [reviewContent, setReviewContent] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Auto-dismiss toast after 5s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSubmitReview = async () => {
    if (!reviewContent.trim() || !accessToken) return;
    setReviewSubmitting(true);
    try {
      await postReview(accessToken, {
        tmdbIdentifier: tmdbId,
        isMovie,
        reviewContent: reviewContent.trim(),
      });
      setReviewContent("");
      setToast({ type: "success", message: "Your review has been submitted!" });
    } catch (e) {
      if (e instanceof ApiError) {
        setToast({
          type: "error",
          message: e.message,
        });
      } else {
        setToast({
          type: "error",
          message: "Failed to submit review. Please try again.",
        });
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="flex flex-col gap-2">
        <button
          disabled
          className="w-full bg-blue-600/50 text-white py-2.5 px-4 rounded font-semibold cursor-not-allowed opacity-70"
        >
          Sign in to Rate
        </button>
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
      <button className="w-full bg-blue-600 text-white py-2.5 px-4 rounded font-semibold hover:bg-blue-700 transition-colors">
        Rate
      </button>

      {/* Review Form — always visible when signed in */}
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
          <span className="text-neutral-500 text-xs">
            {reviewContent.length}/2000
          </span>
          <button
            onClick={handleSubmitReview}
            disabled={!reviewContent.trim() || reviewSubmitting}
            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {reviewSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Toast Popup */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg px-5 py-4 shadow-xl border transition-all duration-300 animate-[slideUp_0.3s_ease-out] ${
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
