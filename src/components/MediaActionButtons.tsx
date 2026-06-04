"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitReview, updateReview, deleteReview } from "@/lib/reviews";
import RatingWidget from "./RatingWidget";
import ConfirmDialog from "@/components/ConfirmDialog";

interface MediaActionButtonsProps {
  isLoggedIn?: boolean;
  accessToken?: string;
  tmdbIdentifier?: number;
  isMovie?: boolean;
  userRating?: { id: number; value: number } | null;
  userReview?: {
    reviewId: number;

    reviewContent: string;

    dateOfReview: string;
  } | null;
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
  const router = useRouter();
  const accessToken = serverToken || session?.accessToken;
  const loggedIn = isLoggedIn || status === "authenticated";

  const [reviewContent, setReviewContent] = useState(
    userReview?.reviewContent ?? "",
  );
  const [existingReview, setExistingReview] = useState(userReview);

  useEffect(() => {
    setExistingReview(userReview);
  }, [userReview]);

  const [editing, setEditing] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Keyboard shortcut listeners
  useEffect(() => {
    function handleFocusRating() {
      document.getElementById("rating-bar-1")?.focus();
    }
    function handleFocusReview() {
      document.getElementById("review-textarea")?.focus();
    }
    window.addEventListener("shortcut:focus-rating", handleFocusRating);
    window.addEventListener("shortcut:focus-review", handleFocusReview);
    return () => {
      window.removeEventListener("shortcut:focus-rating", handleFocusRating);
      window.removeEventListener("shortcut:focus-review", handleFocusReview);
    };
  }, []);

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) return;
    if (tmdbIdentifier == null) return;
    setReviewSubmitting(true);
    try {
      const result = await submitReview({
        tmdbIdentifier,
        isMovie: !!isMovie,
        reviewContent: reviewContent.trim(),
      });

      if (result.error) {
        setToast({ type: "error", message: result.error });
        return;
      }

      const newReview = {
        reviewId: (result.data as any)?.reviewId ?? 0,
        reviewContent: reviewContent.trim(),
        dateOfReview: new Date().toISOString(),
      };
      setExistingReview(newReview);
      setReviewContent("");
      setToast({ type: "success", message: "Your review has been submitted!" });
      router.refresh();
    } catch (e) {
      setToast({
        type: "error",

        message: "Failed to submit review. Please try again.",
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview) return;
    setDeleting(true);
    try {
      const result = await deleteReview(existingReview.reviewId);
      if (result.error) {
        setToast({ type: "error", message: result.error });
        return;
      }
      setExistingReview(null);
      setReviewContent("");
      setToast({ type: "success", message: "Review deleted." });
      router.refresh();
    } catch (e) {
      setToast({ type: "error", message: "Failed to delete review." });
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateReview = async () => {
    if (!reviewContent.trim() || !existingReview) return;
    setReviewSubmitting(true);
    try {
      const result = await updateReview(existingReview.reviewId, {
        reviewContent: reviewContent.trim(),
      });
      if (result.error) {
        setToast({ type: "error", message: result.error });
        return;
      }
      setExistingReview({
        ...existingReview,

        reviewContent: reviewContent.trim(),
      });
      setEditing(false);
      setToast({ type: "success", message: "Review updated!" });
      router.refresh();
    } catch (e) {
      setToast({ type: "error", message: "Failed to update review." });
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="flex flex-col gap-2">
        <Link
          href={`/sign-in${returnUrl ? `?callbackUrl=${encodeURIComponent(returnUrl)}` : ""}`}
          className="block w-full text-center py-2.5 px-4 rounded font-semibold transition-colors no-underline"
          style={{
            backgroundColor: "var(--rating-btn-bg)",
            color: "var(--rating-btn-text)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              "var(--rating-btn-hover-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--rating-btn-bg)";
          }}
        >
          Sign in to Rate
        </Link>
        <Link
          href={`/sign-in${returnUrl ? `?callbackUrl=${encodeURIComponent(returnUrl)}` : ""}`}
          className="block w-full text-center py-2.5 px-4 rounded font-semibold transition-colors no-underline"
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
          Sign in to Review
        </Link>
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
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: "var(--review-card-bg)",
            borderColor: "var(--review-card-border)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs"
              style={{ color: "var(--review-card-text-muted)" }}
            >
              Your review &middot;{" "}
              {new Date(existingReview.dateOfReview).toLocaleDateString()}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setEditing(true);

                  setReviewContent(existingReview.reviewContent);
                }}
                disabled={editing || deleting}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--primary-color)";
                  e.currentTarget.style.backgroundColor =
                    "var(--surface-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={deleting}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--destructive-color)";
                  e.currentTarget.style.backgroundColor =
                    "var(--surface-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
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
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === "Enter") {
                    e.preventDefault();
                    handleUpdateReview();
                  }
                }}
                rows={3}
                maxLength={2000}
                disabled={reviewSubmitting}
                className="w-full rounded p-2 text-sm resize-y border focus:outline-none transition-colors placeholder:text-[color:var(--text-muted)]"
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
                  {reviewContent.length}/2000
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(false);

                      setReviewContent(existingReview.reviewContent);
                    }}
                    disabled={reviewSubmitting}
                    className="text-xs px-3 py-1.5 rounded transition-colors"
                    style={{
                      backgroundColor: "var(--btn-secondary-bg)",
                      color: "var(--btn-secondary-text)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--btn-secondary-hover-bg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--btn-secondary-bg)";
                    }}
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
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap break-words"
              style={{ color: "var(--review-card-text)" }}
            >
              {existingReview.reviewContent}
            </p>
          )}
        </div>
      ) : (
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: "var(--review-card-bg)",
            borderColor: "var(--review-card-border)",
          }}
        >
          <label
            htmlFor="review-textarea"
            className="text-sm mb-2 block font-medium"
            style={{ color: "var(--review-card-text)" }}
          >
            Write a Review
          </label>
          <textarea
            id="review-textarea"
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                handleSubmitReview();
              }
            }}
            placeholder="What did you think..."
            rows={4}
            maxLength={2000}
            disabled={reviewSubmitting}
            className="w-full rounded p-3 text-sm resize-y border focus:outline-none transition-colors placeholder:text-[color:var(--text-muted)]"
            style={{
              backgroundColor: "var(--input-bg)",
              color: "var(--foreground)",
              borderColor: "var(--input-border)",
            }}
          />
          <div className="flex items-center justify-between mt-3">
            <span
              className="text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {reviewContent.length}/2000
            </span>
            <button
              onClick={handleSubmitReview}
              disabled={!reviewContent.trim() || reviewSubmitting}
              className="text-sm px-4 py-1.5 rounded font-semibold transition-colors"
              style={{
                backgroundColor: "var(--primary-color)",
                color: "var(--primary-foreground)",
                opacity: !reviewContent.trim() || reviewSubmitting ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!(!reviewContent.trim() || reviewSubmitting)) {
                  e.currentTarget.style.backgroundColor =
                    "var(--primary-hover)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary-color)";
              }}
            >
              {reviewSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? Deleted content cannot be recovered."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={() => {
          setConfirmDelete(false);
          handleDeleteReview();
        }}
        onCancel={() => setConfirmDelete(false)}
      />

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
    </div>
  );
}
