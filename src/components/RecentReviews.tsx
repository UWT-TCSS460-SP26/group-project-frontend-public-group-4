"use client";

import { useState } from "react";

// A more specific type for a review from the community object
interface Review {
  reviewId?: number;
  review_id?: number;
  author?: { displayName: string } | string;
  userId?: number;
  user_id?: number;
  dateOfReview?: string;
  date_of_review?: string;
  reviewContent?: string;
  review_content?: string;
}

interface RecentReviewsProps {
  reviews: Review[];
}

function ReviewCard({ review, idx }: { review: Review; idx: number }) {
  const [expanded, setExpanded] = useState(false);

  const content = review.reviewContent || review.review_content || "";
  const date = review.dateOfReview || review.date_of_review;
  const userId = review.userId || review.user_id || "Unknown";

  // Define the max length before truncating
  const MAX_LENGTH = 300;
  const isLong = content.length > MAX_LENGTH;
  const displayContent =
    isLong && !expanded
      ? content.slice(0, MAX_LENGTH) + "..."
      : content || "No review content provided.";

  return (
    <div className="border border-neutral-700/50 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-neutral-800/50 px-5 py-3 flex items-center justify-between border-b border-neutral-700/50">
        <span className="font-semibold text-neutral-200">
          {/* Handle both object and string shapes for author */}
          {typeof review.author === "object" && review.author !== null
            ? review.author.displayName
            : review.author || `User ${userId}`}
        </span>
        <span className="text-sm text-neutral-400" suppressHydrationWarning>
          {date ? new Date(date).toLocaleDateString() : ""}
        </span>
      </div>
      <div className="bg-neutral-900/60 p-5">
        <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {displayContent}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-amber-400 hover:text-amber-300 text-xs font-semibold mt-3 uppercase tracking-wider transition-colors"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function RecentReviews({ reviews }: RecentReviewsProps) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Recent Reviews</h2>
      {reviews && reviews.length > 0 ? (
        <div className="flex flex-col gap-4">
          {reviews.map((review, idx) => (
            <ReviewCard
              key={review.reviewId || review.review_id || idx}
              review={review}
              idx={idx}
            />
          ))}
        </div>
      ) : (
        <div className="bg-neutral-800/30 border border-neutral-800 rounded-lg p-8 text-center">
          <p className="text-neutral-500 text-sm">
            No reviews yet. Be the first to share your thoughts!
          </p>
        </div>
      )}
    </>
  );
}
