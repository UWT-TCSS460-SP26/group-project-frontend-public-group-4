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
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded shadow-lg border text-sm font-semibold flex items-center gap-3 transition-all animate-in fade-in duration-300 ${
        toast.type === "loading"
          ? "bg-blue-900 border-blue-700 text-blue-100"
          : toast.type === "success"
            ? "bg-green-900 border-green-700 text-green-100"
            : "bg-red-900 border-red-700 text-red-100"
      }`}
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
      {toast.type === "success" && "✓ "}
      {toast.type === "error" && "⚠ "}
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
    }, 40); // 40ms is short enough to feel instant, but enough to skip fast swipes
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
          className="w-full bg-amber-600 text-white py-2.5 px-4 rounded font-semibold hover:bg-amber-700 transition-colors"
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
          className={`w-full h-[104px] bg-neutral-800/80 border border-neutral-700/50 p-2 rounded flex gap-2 transition-all ${
            status === "submitting"
              ? "animate-pulse opacity-60 pointer-events-none saturate-50"
              : ""
          }`}
        >
          <div className="flex flex-col gap-2 w-1/3 shrink-0">
            <button
              onClick={() => {
                setStatus("idle");
                setIsOpen(true);
              }}
              className="flex-1 rounded bg-neutral-900 text-amber-400 border border-amber-700 hover:bg-amber-900/50 hover:border-amber-400 hover:text-amber-300 transition-colors font-semibold shadow-sm text-sm flex items-center justify-center"
            >
              Edit
            </button>
            {knownRatingId && (
              <button
                onClick={() => setStatus("confirm-delete")}
                className="flex-1 rounded bg-neutral-900 text-red-400 border border-red-700 hover:bg-red-900/50 hover:border-red-400 hover:text-red-300 transition-colors font-semibold shadow-sm text-sm flex items-center justify-center"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex-1 bg-neutral-900 border border-green-500/50 rounded flex flex-col items-center justify-center">
            <span className="text-neutral-400 text-[10px] uppercase tracking-wider mb-0.5 font-semibold">
              You Rated
            </span>
            <span className="text-green-400 font-bold text-3xl">
              {rating}
              <span className="text-lg text-neutral-500 font-medium">/10</span>
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
        <div className="w-full h-[104px] bg-neutral-800/80 border border-neutral-700/50 p-2 rounded flex gap-2">
          <div className="flex flex-col gap-2 w-1/3 shrink-0">
            <button
              onClick={() => {
                setStatus("idle");
                setIsOpen(true);
              }}
              className="flex-1 rounded bg-neutral-900 text-amber-400 border border-amber-700 hover:bg-amber-900/50 hover:border-amber-400 hover:text-amber-300 transition-colors font-semibold shadow-sm text-sm flex items-center justify-center"
            >
              Edit
            </button>
            {knownRatingId && (
              <button
                onClick={() => setStatus("confirm-delete")}
                className="flex-1 rounded bg-neutral-900 text-red-400 border border-red-700 hover:bg-red-900/50 hover:border-red-400 hover:text-red-300 transition-colors font-semibold shadow-sm text-sm flex items-center justify-center"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex-1 bg-neutral-900 border border-amber-500/50 rounded flex flex-col items-center justify-center">
            <span className="text-neutral-400 text-[10px] uppercase tracking-wider mb-0.5 font-semibold">
              Your Rating
            </span>
            <span className="text-amber-400 font-bold text-3xl">
              {rating}
              <span className="text-lg text-neutral-500 font-medium">/10</span>
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
        <div className="w-full h-[144px] bg-neutral-800/80 border border-red-500/50 p-3 rounded flex flex-col">
          <div className="flex-1 flex items-center justify-center px-2">
            <p className="text-red-400 text-sm font-semibold text-center leading-relaxed">
              Are you sure you want to delete your rating?
            </p>
          </div>
          <div className="flex gap-2 shrink-0 h-10">
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors text-sm"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setStatus(knownRatingId ? "existing" : "idle")}
              className="flex-1 bg-neutral-700 text-white rounded font-semibold hover:bg-neutral-600 transition-colors text-sm"
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
        <div className="w-full h-[144px] bg-amber-600/20 border border-amber-500/50 p-3 rounded flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center gap-1 overflow-hidden">
            <p className="text-amber-400 text-sm font-semibold text-center leading-tight">
              {errorMessage || "You already rated this title."}
            </p>
            {knownRatingId && (
              <p className="text-neutral-300 text-xs text-center">
                Would you like to update it to {rating}?
              </p>
            )}
          </div>
          {knownRatingId ? (
            <div className="flex gap-2 shrink-0 h-[38px] mt-2">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-amber-600 text-white rounded font-semibold hover:bg-amber-700 transition-colors text-xs"
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
                className="flex-1 bg-neutral-700 text-white rounded font-semibold hover:bg-neutral-600 transition-colors text-xs"
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
                className="w-full bg-neutral-700 text-white rounded font-semibold hover:bg-neutral-600 transition-colors text-xs"
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
      <div className="w-full h-[144px] bg-neutral-800/80 p-3 rounded border border-neutral-700/50 flex flex-col justify-between">
        <div className="flex justify-between items-center shrink-0 mb-1">
          <span className="text-sm font-semibold text-neutral-200 flex items-baseline">
            {knownRatingId ? "Change Rating: " : "Select Rating: "}
            <span className="text-white ml-1 inline-block w-[2ch] text-center">
              {hoverRating || rating}
            </span>
            <span className="text-neutral-500 text-xs ml-0.5">/10</span>
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
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          {/*
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
          */}
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
                  style={customStyle}
                  className={`flex-1 h-full rounded-[2px] transition-colors duration-150 ${isActive ? "" : "bg-neutral-700 hover:bg-neutral-600"}`}
                  onMouseEnter={() => handleHover(i)}
                  onClick={() => setRating(i)}
                  aria-label={`Rate ${i} out of 10`}
                />
              );
            })}
          </div>
          {status === "error" && (
            <p className="text-red-400 text-[10px] text-center mt-1 leading-tight">
              {errorMessage}
            </p>
          )}
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-amber-600 text-white h-[38px] rounded font-semibold hover:bg-amber-700 transition-colors text-sm shrink-0 mt-2"
        >
          {knownRatingId ? "Update Rating" : "Submit Rating"}
        </button>
      </div>
      <ToastOverlay toast={toast} />
    </>
  );
}
