"use client";

import { useState } from "react";

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
  username?: string;
}

interface RecentReviewsProps {
  reviews: Review[];
}

function ReviewCard({ review }: { review: Review; idx: number }) {
  const [expanded, setExpanded] = useState(false);

  const content = review.reviewContent || review.review_content || "";
  const date = review.dateOfReview || review.date_of_review;
  const userId = review.userId || review.user_id || "Unknown";

  const MAX_LENGTH = 300;
  const isLong = content.length > MAX_LENGTH;
  const displayContent =
    isLong && !expanded
      ? content.slice(0, MAX_LENGTH) + "..."
      : content || "No review content provided.";

  return (
    <div
      className="border rounded-lg overflow-hidden flex flex-col"
      style={{ borderColor: "var(--review-card-border)" }}
    >
      <div
        className="px-5 py-3 flex items-center justify-between border-b"
        style={{
          backgroundColor: "var(--review-card-header-bg)",
          borderColor: "var(--review-card-border)",
        }}
      >
        <span className="font-semibold" style={{ color: "var(--review-card-text)" }}>
          {typeof review.author === "object" && review.author !== null
            ? review.author.displayName
            : review.author || review.username || `User ${userId}`}
        </span>
        <span className="text-sm" style={{ color: "var(--review-card-text-muted)" }} suppressHydrationWarning>
          {date ? new Date(date).toLocaleDateString() : ""}
        </span>
      </div>
      <div
        className="p-5"
        style={{ backgroundColor: "var(--review-card-bg)" }}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word" style={{ color: "var(--review-card-text)" }}>
          {displayContent}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold mt-3 uppercase tracking-wider transition-colors"
            style={{ color: "var(--primary-color)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--primary-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--primary-color)";
            }}
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
      <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--foreground)" }}>
        Recent Reviews
      </h2>
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
        <div
          className="border rounded-lg p-8 text-center"
          style={{
            backgroundColor: "var(--surface-bg)",
            borderColor: "var(--surface-border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--surface-text-dim)" }}>
            No reviews yet. Be the first to share your thoughts!
          </p>
        </div>
      )}
    </>
  );
}
