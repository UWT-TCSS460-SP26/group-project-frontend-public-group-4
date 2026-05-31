import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { apiGet, getRatings, getReviews } from "@/lib/api";
import { auth } from "@/auth";
import BlurredBackground from "@/components/BlurredBackground";
import MediaActionButtons from "@/components/MediaActionButtons";
import CommunityStats from "@/components/CommunityStats";
import RecentReviews from "@/components/RecentReviews";
import ImagePlaceholderIcon from "@/components/ImagePlaceholderIcon";
import { formatDateAndYear } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Movie Details — MediaRate",
};

interface MovieDetail {
  type: string;
  tmdbId: number;
  metadata: {
    title: string;
    poster_path: string | null;
    release_date: string;
    overview: string;
    revenue: number;
    runtime: number;
    budget: number;
    tagline?: string;
    status?: string;
    vote_average?: number;
    vote_count?: number;
    genres?: { id: number; name: string }[];
    production_companies?: { name: string; logo_path?: string | null }[];
    spoken_languages?: { english_name: string }[];
    popularity?: number;
    homepage?: string;
  };
  community: {
    averageRating: number | null;
    reviewCount: number;
    recentReviews: {
      reviewId?: number;
      author?: { displayName: string } | string;
      username?: string;
      userId?: number;
      dateOfReview?: string;
      reviewContent?: string;
    }[];
  };
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const accessToken = session?.accessToken;
  let movie: MovieDetail | null = null;
  let error = false;

  try {
    movie = await apiGet<MovieDetail>(`/movies/details/${id}`);
  } catch (e) {
    error = true;
  }

  if (error || !movie) {
    return (
      <div className="pt-16 px-4 sm:px-8 pb-16 max-w-7xl mx-auto text-[color:var(--text-primary)]">
        <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
        <Link
          href="/movies"
          className="text-[color:var(--primary-color)] hover:text-[color:var(--primary-hover)] underline-offset-2 hover:underline"
        >
          &larr; Back to Movies
        </Link>
      </div>
    );
  }

  const { metadata, community } = movie;

  let userRating = null;
  let userReview = null;
  if (isLoggedIn && session?.accessToken) {
    const [ratings, reviews] = await Promise.all([
      getRatings(session.accessToken),
      getReviews(session.accessToken),
    ]);
    const foundRating = ratings.find(
      (r: any) => r.tmdbIdentifier === movie.tmdbId && r.isMovie === true,
    );
    if (foundRating) {
      userRating = {
        id: foundRating.ratingId,
        value: (foundRating as any).rating ?? (foundRating as any).value,
      };
    }
    const foundReview = reviews.find(
      (r) => r.tmdbIdentifier === movie.tmdbId && r.isMovie === true,
    );
    if (foundReview) {
      userReview = {
        reviewId: foundReview.reviewId,
        reviewContent: foundReview.reviewContent,
        dateOfReview: foundReview.dateOfReview,
      };
    }
  }

  const { releaseYear, formattedDate: formattedReleaseDate } =
    formatDateAndYear(metadata.release_date);
  const posterUrl = metadata.poster_path
    ? `https://image.tmdb.org/t/p/w500${metadata.poster_path}`
    : null;

  const genreString = (metadata.genres || []).map((g) => g.name).join(", ");

  return (
    <main className="relative w-full grow flex flex-col min-h-screen">
      {/* Dynamic Blurred Poster Background */}
      {posterUrl && <BlurredBackground imageUrl={posterUrl} />}

      {/* Content Container */}
      <div className="relative z-10 pt-16 px-4 sm:px-8 pb-16 max-w-7xl mx-auto w-full text-[color:var(--text-primary)] grow">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/movies"
            className="text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] flex items-center gap-2 transition-colors w-fit"
          >
            <span>&larr;</span> Back to Movies
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Poster & Placeholder Buttons */}
          <div className="shrink-0 w-full md:w-80 flex flex-col gap-4">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={`${metadata.title} poster`}
                className="w-full rounded-lg shadow-lg object-cover"
                priority
                loading="eager"
                width={500}
                height={750}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
              />
            ) : (
              <div className="w-full aspect-2/3 bg-[color:var(--secondary-bg)] rounded-lg shadow-lg border border-[color:var(--card-border)] flex items-center justify-center text-[color:var(--text-muted)]">
                <ImagePlaceholderIcon className="w-24 h-24" />
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col grow min-w-0">
            <h1 className="text-4xl font-bold mb-2">
              {metadata.title} {" "}
              {releaseYear && (
                <span className="text-[color:var(--text-muted)] font-normal">
                  ({releaseYear})
                </span>
              )}
            </h1>

            {metadata.tagline && (
              <p className="text-xl text-[color:var(--text-muted)] italic mb-4">
                {metadata.tagline}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-[color:var(--text-muted)] text-base mb-8">
              {formattedReleaseDate && <span>{formattedReleaseDate}</span>}
              {metadata.runtime > 0 && <span>{metadata.runtime} min</span>}
              {genreString && <span>{genreString}</span>}
            </div>

            {/* Differently Colored Description Box */}
            <div className="bg-[color:var(--secondary-bg)] p-6 rounded-lg shadow-inner mb-8">
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-[color:var(--text-primary)] leading-relaxed">
                {metadata.overview || "No description available."}
              </p>
            </div>

            {/* Important Metadata Grid (Non-Expandable) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 border-t border-[color:var(--card-border)] pt-6">
              {metadata.status && (
                <div>
                  <span className="block text-[color:var(--text-secondary)] text-sm mb-1">
                    Status
                  </span>
                  <span className="text-[color:var(--text-primary)] font-medium">
                    {metadata.status}
                  </span>
                </div>
              )}
              {metadata.vote_average !== undefined &&
                metadata.vote_average > 0 && (
                  <div>
                    <span className="block text-[color:var(--text-secondary)] text-sm mb-1">
                      TMDB Rating
                    </span>
                    <span className="text-[color:var(--text-primary)] font-medium">
                      {metadata.vote_average.toFixed(1)} / 10
                    </span>
                  </div>
                )}
              {metadata.budget > 0 && (
                <div>
                  <span className="block text-[color:var(--text-secondary)] text-sm mb-1">
                    Budget
                  </span>
                  <span className="text-[color:var(--text-primary)] font-medium">
                    ${metadata.budget.toLocaleString()}
                  </span>
                </div>
              )}
              {metadata.revenue > 0 && (
                <div>
                  <span className="block text-[color:var(--text-secondary)] text-sm mb-1">
                    Revenue
                  </span>
                  <span className="text-[color:var(--text-primary)] font-medium">
                    ${metadata.revenue.toLocaleString()}
                  </span>
                </div>
              )}
              {metadata.production_companies &&
                metadata.production_companies.length > 0 && (
                  <div className="col-span-2 sm:col-span-4">
                    <span className="block text-[color:var(--text-secondary)] text-sm mb-1">
                      Studios
                    </span>
                    <span className="text-[color:var(--text-primary)] font-medium">
                      {metadata.production_companies
                        .map((c) => c.name)
                        .join(", ")}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Actions & Reviews */}
        <div className="mt-12 flex flex-col md:flex-row gap-8">
          {/* Left Column: Actions align with poster */}
          <div className="shrink-0 w-full md:w-80 flex flex-col gap-4">
            <MediaActionButtons
              isLoggedIn={isLoggedIn}
              accessToken={accessToken}
              tmdbIdentifier={movie.tmdbId}
              isMovie={true}
              userRating={userRating}
              userReview={userReview}
              returnUrl={`/movies/${id}`}
            />
            <CommunityStats community={community} />
          </div>

          {/* Right Column: Reviews */}
          <div className="flex flex-col grow min-w-0">
            <RecentReviews
              reviews={
                community.recentReviews || (community as any).recent_reviews
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
