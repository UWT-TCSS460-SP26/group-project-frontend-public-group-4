"use client";

import { useState, useEffect, useRef } from "react";
import { submitRating, updateRating, deleteRating } from "@/lib/ratings";

interface RatingWidgetProps {
  tmdbIdentifier?: number;
  isMovie?: boolean;
  initialRatingId?: number;
  initialRatingValue?: number;
}

type ToastType = { message: string; type: "loading" | "success" | "error" };

function ToastOverlay({ toast }: { toast: ToastType | null }) {
  if (!toast) return null;
  return (
    <div
      className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded shadow-lg border text-sm font-semibold flex items-center gap-3 transition-all animate-in fade-in duration-300"
      style={
        toast.type === "loading"
          ? {
              backgroundColor: "var(--surface-bg)",
              borderColor: "var(--primary-color)",
              color: "var(--primary-color)",
            }
          : toast.type === "success"
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
      {toast.type === "loading" && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      )}
      {toast.type === "success" && "\u2713 "}
      {toast.type === "error" && "\u26A0 "}
      {toast.message}
    </div>
  );
}

export default function RatingWidget({
  tmdbIdentifier,
  isMovie,
  initialRatingId,
  initialRatingValue,
}: RatingWidgetProps) {
  const [rating, setRating] = useState(initialRatingValue || 0);
  const [savedRating, setSavedRating] = useState(initialRatingValue || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "success" | "error" | "existing" | "confirm-delete"
  >(initialRatingId !== undefined ? "existing" : "idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [knownRatingId, setKnownRatingId] = useState<number | null>(
    initialRatingId || null,
  );
  const [toast, setToast] = useState<ToastType | null>(null);
  const prevTmdbId = useRef(tmdbIdentifier);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHover = (val: number) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverRating(val);
    }, 40);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const isNewMedia = prevTmdbId.current !== tmdbIdentifier;
    prevTmdbId.current = tmdbIdentifier;

    if (initialRatingId !== undefined) {
      setKnownRatingId(initialRatingId);
      if (initialRatingValue && isNewMedia) {
        setRating(initialRatingValue);
        setSavedRating(initialRatingValue);
      }

      setStatus((prev) => {
        if (isNewMedia) return "existing";
        if (prev === "success") return prev;
        return "existing";
      });
    } else {
      setKnownRatingId(null);
      if (isNewMedia) {
        setStatus("idle");
        setRating(0);
        setSavedRating(0);
      }
    }
  }, [initialRatingId, initialRatingValue, tmdbIdentifier]);

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => setStatus("existing"), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && status === "confirm-delete") {
        setStatus(knownRatingId ? "existing" : "idle");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [status, knownRatingId]);

  const triggerToast = (newToast: ToastType, duration = 3000) => {
    setToast(newToast);
    if (newToast.type !== "loading") {
      setTimeout(() => {
        setToast((prev) => (prev?.message === newToast.message ? null : prev));
      }, duration);
    }
  };

  const handleStarClick = async (clickedRating: number) => {
    if (!tmdbIdentifier) {
      setStatus("error");
      setErrorMessage("Missing media identifier (tmdbIdentifier).");
      return;
    }

    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoverRating(0);

    // Optimistic UI updates
    setRating(clickedRating);
    setStatus("idle"); // Clear any error styles momentarily
    setErrorMessage("");
    triggerToast({ message: "Saving rating...", type: "loading" });

    if (knownRatingId) {
      const res = await updateRating(knownRatingId, clickedRating);
      if (res.error) {
        setStatus("error");
        setErrorMessage(res.error);
        setRating(savedRating); // rollback
        triggerToast({ message: "Failed to update rating", type: "error" });
      } else {
        setStatus("success");
        setSavedRating(clickedRating);
        triggerToast({ message: "Rating updated!", type: "success" });
      }
      return;
    }

    const res = await submitRating({
      tmdbIdentifier,
      isMovie: !!isMovie,
      rating: clickedRating,
    });

    if (res.conflict && res.ratingId) {
      // Assume conflict means seamless update
      setKnownRatingId(res.ratingId);
      const updateRes = await updateRating(res.ratingId, clickedRating);
      if (updateRes.error) {
        setStatus("error");
        setErrorMessage(updateRes.error);
        setRating(savedRating);
        triggerToast({ message: "Failed to save rating", type: "error" });
      } else {
        setStatus("success");
        setSavedRating(clickedRating);
        triggerToast({ message: "Rating locked!", type: "success" });
      }
    } else if (res.error) {
      setStatus("error");
      setErrorMessage(res.error);
      setRating(savedRating);
      triggerToast({ message: "Failed to save rating", type: "error" });
    } else {
      if (res.data?.ratingId) setKnownRatingId(res.data.ratingId);
      setStatus("success");
      setSavedRating(clickedRating);
      triggerToast({ message: "Rating locked!", type: "success" });
    }
  };

  const handleDelete = async () => {
    if (!knownRatingId) return;
    triggerToast({ message: "Removing rating...", type: "loading" });
    const res = await deleteRating(knownRatingId);
    if (res.error) {
      setStatus("error");
      setErrorMessage(res.error);
      triggerToast({ message: "Failed to delete rating", type: "error" });
    } else {
      setKnownRatingId(null);
      setSavedRating(0);
      setRating(0);
      setStatus("idle");
      triggerToast({ message: "Rating removed", type: "success" });
    }
  };

  const borderColor =
    status === "confirm-delete"
      ? "var(--destructive-color)"
      : status === "error"
        ? "var(--destructive-color)"
        : status === "success"
          ? "var(--badge-success)"
          : status === "idle"
            ? "var(--primary-color)"
            : "var(--review-card-border)";

  return (
    <>
      <div
        className="w-full p-3 rounded border flex flex-col gap-3 transition-colors duration-300"
        style={{
          backgroundColor: "var(--review-card-bg)",
          borderColor,
        }}
      >
        {status === "confirm-delete" ? (
          <div className="flex flex-col gap-3 h-[116px] justify-center">
            <div className="flex-1 flex items-center justify-center px-2">
              <p
                className="text-sm font-semibold text-center leading-relaxed"
                style={{ color: "var(--destructive-color)" }}
              >
                Are you sure you want to delete your rating?
              </p>
            </div>
            <div className="flex gap-2 shrink-0 h-[40px]">
              <button
                onClick={handleDelete}
                className="flex-1 rounded font-semibold transition-colors text-sm"
                style={{
                  backgroundColor: "var(--destructive-color)",
                  color: "#ffffff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--destructive-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--destructive-color)";
                }}
              >
                Yes, Delete
              </button>
              <button
                autoFocus
                onClick={() => setStatus(knownRatingId ? "existing" : "idle")}
                className="flex-1 rounded font-semibold transition-colors text-sm"
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
            </div>
          </div>
        ) : (
          <>
            {/* TOP ROW: Score Display & Delete Action */}
            <div className="flex gap-2 h-[64px]">
              {knownRatingId ? (
                <>
                  <button
                    onClick={() => setStatus("confirm-delete")}
                    className="shrink-0 w-[64px] rounded flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--destructive-color)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.backgroundColor =
                        "var(--destructive-color)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--destructive-color)";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    aria-label="Delete Rating"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  <div
                    className="flex-1 rounded flex flex-col items-center justify-center transition-colors"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div className="flex flex-col items-center justify-center -translate-x-[36px] md:translate-x-0 transition-transform">
                      <span
                        className="text-[10px] uppercase tracking-wider mb-0.5 font-semibold"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {status === "success" ? "You Rated" : "Your Rating"}
                      </span>
                      <span
                        className="font-bold text-3xl leading-none"
                        style={{
                          color:
                            status === "success"
                              ? "var(--badge-success)"
                              : "var(--primary-color)",
                        }}
                      >
                        {rating}
                        <span
                          className="text-lg font-medium ml-[1px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          /10
                        </span>
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="flex-1 rounded flex flex-col items-center justify-center"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <span
                    className="text-[10px] uppercase tracking-wider mb-0.5 font-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Select Rating
                  </span>
                  <span
                    className="font-bold text-3xl leading-none"
                    style={{
                      color:
                        hoverRating || rating
                          ? "var(--foreground)"
                          : "var(--text-muted)",
                    }}
                  >
                    {hoverRating || rating || "?"}
                    <span
                      className="text-lg font-medium ml-[1px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      /10
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* BOTTOM ROW: Interactive Scale */}
            <div className="flex flex-col w-full">
              <div
                className="flex justify-between items-center gap-1 w-full h-10"
                onMouseLeave={() => handleHover(0)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
                  const activeScore = hoverRating || rating;
                  const isActive = i <= activeScore;
                  const customStyle = isActive
                    ? {
                        backgroundColor: hoverRating
                          ? `hsl(${(activeScore - 1) * 14}, 84%, 50%)`
                          : "var(--primary-color)",
                        opacity: hoverRating ? 1 : 0.6,
                      }
                    : {};

                  return (
                    <button
                      key={i}
                      id={i === 1 ? "rating-bar-1" : undefined}
                      type="button"
                      style={{
                        ...customStyle,
                        backgroundColor: isActive
                          ? customStyle.backgroundColor
                          : "var(--rating-bar-inactive)",
                      }}
                      className="flex-1 h-full rounded-[2px] transition-all duration-150"
                      onMouseEnter={() => handleHover(i)}
                      onClick={() => handleStarClick(i)}
                      aria-label={`Rate ${i} out of 10`}
                    />
                  );
                })}
              </div>
              {status === "error" && errorMessage && (
                <p
                  className="text-[11px] text-center mt-2 leading-tight font-medium"
                  style={{ color: "var(--destructive-color)" }}
                >
                  {errorMessage}
                </p>
              )}
            </div>
          </>
        )}
      </div>
      <ToastOverlay toast={toast} />
    </>
  );
}
