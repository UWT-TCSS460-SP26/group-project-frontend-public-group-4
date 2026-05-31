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
      style={toast.type === "loading"
        ? { backgroundColor: "var(--surface-bg)", borderColor: "var(--primary-color)", color: "var(--primary-color)" }
        : toast.type === "success"
          ? { backgroundColor: "var(--toast-success-bg)", borderColor: "var(--toast-success-border)", color: "var(--toast-success-text)" }
          : { backgroundColor: "var(--toast-error-bg)", borderColor: "var(--toast-error-border)", color: "var(--toast-error-text)" }
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
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(initialRatingValue || 5);
  const [savedRating, setSavedRating] = useState(initialRatingValue || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<
    | "idle"
    | "submitting"
    | "success"
    | "error"
    | "conflict"
    | "existing"
    | "confirm-delete"
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
        if (prev === "success" || prev === "submitting" || prev === "conflict")
          return prev;
        return "existing";
      });
    } else {
      setKnownRatingId(null);
      if (isNewMedia) {
        setStatus("idle");
        setRating(5);
        setIsOpen(false);
      }
    }
  }, [initialRatingId, initialRatingValue, tmdbIdentifier]);

  const triggerToast = (newToast: ToastType, duration = 3000) => {
    setToast(newToast);
    if (newToast.type !== "loading") {
      setTimeout(() => {
        setToast((prev) => (prev?.message === newToast.message ? null : prev));
      }, duration);
    }
  };

  if (
    !isOpen &&
    status !== "success" &&
    status !== "submitting" &&
    status !== "existing" &&
    status !== "confirm-delete"
  ) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-2.5 px-4 rounded font-semibold transition-colors"
          style={{
            backgroundColor: "var(--rating-btn-bg)",
            color: "var(--rating-btn-text)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--rating-btn-hover-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--rating-btn-bg)";
          }}
        >
          Rate
        </button>
        <ToastOverlay toast={toast} />
      </>
    );
  }

  const handleSubmit = async () => {
    if (!tmdbIdentifier) {
      setStatus("error");
      setErrorMessage("Missing media identifier (tmdbIdentifier).");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");
    triggerToast({ message: "Saving rating...", type: "loading" });

    if (knownRatingId) {
      const res = await updateRating(knownRatingId, rating);
      if (res.error) {
        setStatus("error");
        setErrorMessage(res.error);
        triggerToast({ message: "Failed to update rating", type: "error" });
      } else {
        setStatus("success");
        setSavedRating(rating);
        triggerToast({ message: "Rating updated!", type: "success" });
      }
      return;
    }

    const res = await submitRating({
      tmdbIdentifier,
      isMovie: !!isMovie,
      rating,
    });

    if (res.conflict) {
      if (res.ratingId) setKnownRatingId(res.ratingId);
      setStatus("conflict");
      setToast(null);
      if (res.error && !res.ratingId)
        setErrorMessage(
          "You already rated this, but we couldn't fetch the record to update it.",
        );
    } else if (res.error) {
      setStatus("error");
      setErrorMessage(res.error);
      triggerToast({ message: "Failed to save rating", type: "error" });
    } else {
      if (res.data?.ratingId) setKnownRatingId(res.data.ratingId);
      setStatus("success");
      setSavedRating(rating);
      triggerToast({ message: "Rating locked!", type: "success" });
    }
  };

  const handleDelete = async () => {
    if (!knownRatingId) return;
    setStatus("submitting");
    triggerToast({ message: "Removing rating...", type: "loading" });
    const res = await deleteRating(knownRatingId);
    if (res.error) {
      setStatus("error");
      setErrorMessage(res.error);
      triggerToast({ message: "Failed to delete rating", type: "error" });
    } else {
      setKnownRatingId(null);
      setSavedRating(5);
      setRating(5);
      setIsOpen(false);
      setStatus("idle");
      triggerToast({ message: "Rating removed", type: "success" });
    }
  };

  if (status === "success" || status === "submitting") {
    return (
      <>
        <div
          className="w-full h-[104px] p-2 rounded flex gap-2 transition-all border"
          style={{
            backgroundColor: "var(--surface-bg)",
            borderColor: "var(--surface-border)",
            opacity: status === "submitting" ? 0.6 : 1,
          }}
        >
          <div className="flex flex-col gap-2 w-1/3 shrink-0">
            <button
              onClick={() => {
                setStatus("idle");
                setIsOpen(true);
              }}
              className="flex-1 rounded border font-semibold shadow-sm text-sm flex items-center justify-center transition-colors"
              style={{
                backgroundColor: "var(--surface-bg-alt)",
                color: "var(--primary-color)",
                borderColor: "var(--primary-color)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--surface-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--surface-bg-alt)";
              }}
            >
              Edit
            </button>
            {knownRatingId && (
              <button
                onClick={() => setStatus("confirm-delete")}
                className="flex-1 rounded border font-semibold shadow-sm text-sm flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: "var(--surface-bg-alt)",
                  color: "var(--destructive-color)",
                  borderColor: "var(--destructive-color)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--surface-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--surface-bg-alt)";
                }}
              >
                Delete
              </button>
            )}
          </div>
          <div
            className="flex-1 rounded border flex flex-col items-center justify-center"
            style={{
              backgroundColor: "var(--rating-display-bg)",
              borderColor: "var(--badge-success)",
            }}
          >
            <span className="text-[10px] uppercase tracking-wider mb-0.5 font-semibold" style={{ color: "var(--text-secondary)" }}>
              You Rated
            </span>
            <span className="font-bold text-3xl" style={{ color: "var(--badge-success)" }}>
              {rating}
              <span className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>/10</span>
            </span>
          </div>
        </div>
        <ToastOverlay toast={toast} />
      </>
    );
  }

  if (status === "existing") {
    return (
      <>
        <div
          className="w-full h-[104px] p-2 rounded flex gap-2 border"
          style={{
            backgroundColor: "var(--surface-bg)",
            borderColor: "var(--surface-border)",
          }}
        >
          <div className="flex flex-col gap-2 w-1/3 shrink-0">
            <button
              onClick={() => {
                setStatus("idle");
                setIsOpen(true);
              }}
              className="flex-1 rounded border font-semibold shadow-sm text-sm flex items-center justify-center transition-colors"
              style={{
                backgroundColor: "var(--surface-bg-alt)",
                color: "var(--primary-color)",
                borderColor: "var(--primary-color)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--surface-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--surface-bg-alt)";
              }}
            >
              Edit
            </button>
            {knownRatingId && (
              <button
                onClick={() => setStatus("confirm-delete")}
                className="flex-1 rounded border font-semibold shadow-sm text-sm flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: "var(--surface-bg-alt)",
                  color: "var(--destructive-color)",
                  borderColor: "var(--destructive-color)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--surface-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--surface-bg-alt)";
                }}
              >
                Delete
              </button>
            )}
          </div>
          <div
            className="flex-1 rounded border flex flex-col items-center justify-center"
            style={{
              backgroundColor: "var(--rating-display-bg)",
              borderColor: "var(--primary-color)",
            }}
          >
            <span className="text-[10px] uppercase tracking-wider mb-0.5 font-semibold" style={{ color: "var(--text-secondary)" }}>
              Your Rating
            </span>
            <span className="font-bold text-3xl" style={{ color: "var(--primary-color)" }}>
              {rating}
              <span className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>/10</span>
            </span>
          </div>
        </div>
        <ToastOverlay toast={toast} />
      </>
    );
  }

  if (status === "confirm-delete") {
    return (
      <>
        <div
          className="w-full h-[144px] p-3 rounded flex flex-col border"
          style={{
            backgroundColor: "var(--surface-bg)",
            borderColor: "var(--destructive-color)",
          }}
        >
          <div className="flex-1 flex items-center justify-center px-2">
            <p className="text-sm font-semibold text-center leading-relaxed" style={{ color: "var(--destructive-color)" }}>
              Are you sure you want to delete your rating?
            </p>
          </div>
          <div className="flex gap-2 shrink-0 h-10">
            <button
              onClick={handleDelete}
              className="flex-1 rounded font-semibold transition-colors text-sm"
              style={{
                backgroundColor: "var(--destructive-color)",
                color: "#ffffff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--destructive-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--destructive-color)";
              }}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setStatus(knownRatingId ? "existing" : "idle")}
              className="flex-1 rounded font-semibold transition-colors text-sm"
              style={{
                backgroundColor: "var(--btn-secondary-bg)",
                color: "var(--btn-secondary-text)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--btn-secondary-hover-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--btn-secondary-bg)";
              }}
            >
              Cancel
            </button>
          </div>
        </div>
        <ToastOverlay toast={toast} />
      </>
    );
  }

  if (status === "conflict") {
    return (
      <>
        <div
          className="w-full h-[144px] p-3 rounded flex flex-col border"
          style={{
            backgroundColor: "var(--surface-bg)",
            borderColor: "var(--primary-color)",
          }}
        >
          <div className="flex-1 flex flex-col items-center justify-center gap-1 overflow-hidden">
            <p className="text-sm font-semibold text-center leading-tight" style={{ color: "var(--primary-color)" }}>
              {errorMessage || "You already rated this title."}
            </p>
            {knownRatingId && (
              <p className="text-xs text-center" style={{ color: "var(--surface-text)" }}>
                Would you like to update it to {rating}?
              </p>
            )}
          </div>
          {knownRatingId ? (
            <div className="flex gap-2 shrink-0 h-[38px] mt-2">
              <button
                onClick={handleSubmit}
                className="flex-1 rounded font-semibold transition-colors text-xs"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--primary-foreground)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--primary-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--primary-color)";
                }}
              >
                Yes, Update
              </button>
              <button
                onClick={() => {
                  if (knownRatingId) {
                    setRating(savedRating);
                    setStatus("existing");
                  } else {
                    setRating(5);
                    setIsOpen(false);
                  }
                }}
                className="flex-1 rounded font-semibold transition-colors text-xs"
                style={{
                  backgroundColor: "var(--btn-secondary-bg)",
                  color: "var(--btn-secondary-text)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--btn-secondary-hover-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--btn-secondary-bg)";
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2 shrink-0 h-[38px] mt-2">
              <button
                onClick={() => {
                  setRating(5);
                  setIsOpen(false);
                }}
                className="w-full rounded font-semibold transition-colors text-xs"
                style={{
                  backgroundColor: "var(--btn-secondary-bg)",
                  color: "var(--btn-secondary-text)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--btn-secondary-hover-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--btn-secondary-bg)";
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
        <ToastOverlay toast={toast} />
      </>
    );
  }

  return (
    <>
      <div
        className="w-full h-[144px] p-3 rounded border flex flex-col justify-between"
        style={{
          backgroundColor: "var(--rating-widget-bg)",
          borderColor: "var(--rating-widget-border)",
        }}
      >
        <div className="flex justify-between items-center shrink-0 mb-1">
          <span className="text-sm font-semibold flex items-baseline" style={{ color: "var(--surface-text)" }}>
            {knownRatingId ? "Change Rating: " : "Select Rating: "}
            <span className="ml-1 inline-block w-[2ch] text-center" style={{ color: "var(--foreground)" }}>
              {hoverRating || rating}
            </span>
            <span className="text-xs ml-0.5" style={{ color: "var(--text-secondary)" }}>/10</span>
          </span>
          <button
            onClick={() => {
              if (knownRatingId) {
                setRating(savedRating);
                setStatus("existing");
              } else {
                setRating(5);
                setIsOpen(false);
              }
            }}
            className="text-xs transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--foreground)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Cancel
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div
            className="flex justify-between items-center gap-1 w-full h-8"
            onMouseLeave={() => handleHover(0)}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
              const activeScore = hoverRating || rating;
              const isActive = i <= activeScore;

              const customStyle = isActive
                ? {
                    backgroundColor: `hsl(${(activeScore - 1) * 14}, 84%, 50%)`,
                  }
                : {};

              return (
                <button
                  key={i}
                  type="button"
                  style={{
                    ...customStyle,
                    backgroundColor: isActive ? customStyle.backgroundColor : "var(--rating-bar-inactive)",
                  }}
                  className="flex-1 h-full rounded-[2px] transition-colors duration-150"
                  onMouseEnter={() => handleHover(i)}
                  onClick={() => setRating(i)}
                  aria-label={`Rate ${i} out of 10`}
                />
              );
            })}
          </div>
          {status === "error" && (
            <p className="text-[10px] text-center mt-1 leading-tight" style={{ color: "var(--destructive-color)" }}>
              {errorMessage}
            </p>
          )}
        </div>
        <button
          onClick={handleSubmit}
          className="w-full h-[38px] rounded font-semibold transition-colors text-sm shrink-0 mt-2"
          style={{
            backgroundColor: "var(--rating-btn-bg)",
            color: "var(--rating-btn-text)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--rating-btn-hover-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--rating-btn-bg)";
          }}
        >
          {knownRatingId ? "Update Rating" : "Submit Rating"}
        </button>
      </div>
      <ToastOverlay toast={toast} />
    </>
  );
}
