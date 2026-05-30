import RatingWidget from "./RatingWidget";
import Link from "next/link";

export default function MediaActionButtons({
  isLoggedIn,
  tmdbIdentifier,
  isMovie,
  userRating,
  returnUrl,
}: {
  isLoggedIn?: boolean;
  tmdbIdentifier?: number;
  isMovie?: boolean;
  userRating?: { id: number; value: number } | null;
  returnUrl?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {isLoggedIn ? (
        <>
          <RatingWidget
            tmdbIdentifier={tmdbIdentifier}
            isMovie={isMovie}
            initialRatingId={userRating?.id}
            initialRatingValue={userRating?.value}
          />
          <button className="w-full bg-neutral-700 text-white py-2.5 px-4 rounded font-semibold hover:bg-neutral-600 transition-colors">
            Write a Review (Coming Soon)
          </button>
        </>
      ) : (
        <>
          <Link
            href={`/sign-in${returnUrl ? `?callbackUrl=${encodeURIComponent(returnUrl)}` : ""}`}
            className="block w-full text-center bg-amber-600 text-white py-2.5 px-4 rounded font-semibold hover:bg-amber-700 transition-colors"
          >
            Sign in to Rate
          </Link>
          <button
            disabled
            className="w-full bg-neutral-700/50 text-white py-2.5 px-4 rounded font-semibold cursor-not-allowed opacity-70 transition-opacity hover:opacity-100"
          >
            Sign in to Review (Coming Soon)
          </button>
        </>
      )}
    </div>
  );
}
