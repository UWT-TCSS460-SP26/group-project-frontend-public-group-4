"use client";

import { useEffect } from "react";

export default function TVError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="pt-16 px-4 sm:px-8 pb-16 max-w-7xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
        Couldn&apos;t load TV shows
      </h2>
      <p className="mb-6" style={{ color: "var(--text-muted)" }}>
        The server might be temporarily unavailable. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-amber-400 text-black rounded-md font-medium hover:bg-amber-300 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
