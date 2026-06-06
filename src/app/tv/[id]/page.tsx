import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { apiGet, getRatings, getReviews } from "@/lib/api";
import { auth } from "@/auth";
import BlurredBackground from "@/components/BlurredBackground";
import MediaActionButtons from "@/components/MediaActionButtons";
import CommunityStats from "@/components/CommunityStats";
import SeasonsCarousel from "@/components/SeasonsCarousel";
import RecentReviews from "@/components/RecentReviews";
import ImagePlaceholderIcon from "@/components/ImagePlaceholderIcon";
import { formatDateAndYear } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "TV Show Details — MediaRate",
};

interface ShowDetail {
  type: string;
  tmdbId: number;
  metadata: {
    name: string;
    overview: string;
    created_by: { name: string }[];
    genres: { id: number; name: string }[];
    first_air_date: string;
    number_of_episodes: number;
    number_of_seasons: number;
    poster_path: string | null;
    tagline?: string;
    status?: string;
    vote_average?: number;
    vote_count?: number;
    networks?: { name: string; logo_path?: string | null }[];
    spoken_languages?: { english_name: string }[];
    last_air_date?: string;
    popularity?: number;
    in_production?: boolean;
    homepage?: string;
    seasons?: {
      id: number;
      name: string;
      episode_count: number;
      air_date: string;
      poster_path: string | null;
      season_number: number;
      overview: string;
    }[];
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

export default async function TVDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const returnUrlParam =
    typeof resolvedSearchParams?.returnUrl === "string"
      ? resolvedSearchParams.returnUrl
      : undefined;
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const accessToken = session?.accessToken;
  let show: ShowDetail | null = null;
  let error = false;

  let backUrl = "/tv";
  let backText = "Back to TV Shows";

  if (returnUrlParam) {
    backUrl = returnUrlParam;
    if (returnUrlParam.includes("title=")) {
      backText = "Back to Search";
    } else if (returnUrlParam === "/") {
      backText = "Back to Home";
    } else if (returnUrlParam.includes("profile")) {
      backText = "Back to Profile";
    }
  }

  try {
    show = await apiGet<ShowDetail>(`/shows/details/${id}`);
  } catch (e) {
    error = true;
  }

  if (error || !show) {
    return (
      <div className="pt-6 md:pt-12 px-4 pb-12 max-w-7xl mx-auto text-(--text-primary)">
        <h1 className="text-2xl font-bold mb-4">TV Show not found</h1>
        <Link
          href={backUrl}
          className="text-(--primary-color) hover:text-(--primary-hover) underline-offset-2 hover:underline"
        >
          &larr; {backText}
        </Link>
      </div>
    );
  }

  const { metadata, community } = show;

  let userRating = null;
  let userReview = null;
  if (isLoggedIn && session?.accessToken) {
    const [ratings, reviews] = await Promise.all([
      getRatings(session.accessToken),
      getReviews(session.accessToken),
    ]);
    const foundRating = ratings.find(
      (r: any) => r.tmdbIdentifier === show.tmdbId && r.isMovie === false,
    );
    if (foundRating) {
      userRating = {
        id: foundRating.ratingId,
        value: (foundRating as any).rating ?? (foundRating as any).value,
      };
    }
    const foundReview = reviews.find(
      (r) => r.tmdbIdentifier === show.tmdbId && r.isMovie === false,
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
    formatDateAndYear(metadata.first_air_date);

  // Just in case the backend sometimes returns relative paths like the movie endpoint
  const posterUrl = metadata.poster_path
    ? metadata.poster_path.startsWith("http")
      ? metadata.poster_path
      : `https://image.tmdb.org/t/p/w500${metadata.poster_path}`
    : null;

  const genreString = (metadata.genres || []).map((g) => g.name).join(", ");

  return (
    <main className="relative w-full grow flex flex-col min-h-screen">
      {/* Dynamic Blurred Poster Background */}
      {posterUrl && <BlurredBackground imageUrl={posterUrl} />}

      {/* Content Container */}
      <div className="relative z-10 pt-6 md:pt-12 px-4 pb-12 max-w-7xl mx-auto w-full text-(--text-primary) grow">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href={backUrl}
            className="text-(--text-muted) hover:text-(--text-primary) flex items-center gap-2 transition-colors w-fit"
          >
            <span>&larr;</span> {backText}
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-x-8">
          {/* Left Column (Desktop: Poster + Actions) */}
          <div className="shrink-0 w-full md:w-80 flex flex-col gap-8">
            {/* POSTER */}
            <div className="w-56 sm:w-64 md:w-full mx-auto md:mx-0 flex flex-col gap-4">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={`${metadata.name} poster`}
                  className="w-full rounded-lg shadow-lg object-cover"
                  preload
                  width={500}
                  height={750}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                />
              ) : (
                <div className="w-full aspect-2/3 bg-(--secondary-bg) rounded-lg shadow-lg border border-(--card-border) flex items-center justify-center text-(--text-muted)">
                  <ImagePlaceholderIcon className="w-24 h-24" />
                </div>
              )}
            </div>

            {/* DESKTOP ACTIONS & STATS */}
            <div className="hidden md:flex flex-col gap-4 w-full">
              <MediaActionButtons
                isLoggedIn={isLoggedIn}
                accessToken={accessToken}
                tmdbIdentifier={show.tmdbId}
                isMovie={false}
                userRating={userRating}
                userReview={userReview}
                returnUrl={`/tv/${id}${
                  returnUrlParam
                    ? `?returnUrl=${encodeURIComponent(returnUrlParam)}`
                    : ""
                }`}
              />
              <CommunityStats community={community} />
            </div>
          </div>

          {/* Right Column (Desktop: Header + Details + Reviews) */}
          <div className="flex flex-col grow min-w-0">
            {/* HEADER */}
            <div className="text-center md:text-left flex flex-col min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {metadata.name}{" "}
                {releaseYear && (
                  <span className="text-(--text-muted) font-normal">
                    ({releaseYear})
                  </span>
                )}
              </h1>

              {metadata.tagline && (
                <p className="text-xl text-(--text-muted) italic mb-4">
                  {metadata.tagline}
                </p>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-(--text-muted) text-sm md:text-base mb-6 md:mb-8">
                {formattedReleaseDate && <span>{formattedReleaseDate}</span>}
                {genreString && <span>{genreString}</span>}
              </div>
            </div>

            {/* MOBILE ACTIONS & STATS */}
            <div className="md:hidden flex flex-col gap-4 w-full mb-8">
              <MediaActionButtons
                isLoggedIn={isLoggedIn}
                accessToken={accessToken}
                tmdbIdentifier={show.tmdbId}
                isMovie={false}
                userRating={userRating}
                userReview={userReview}
                returnUrl={`/tv/${id}${
                  returnUrlParam
                    ? `?returnUrl=${encodeURIComponent(returnUrlParam)}`
                    : ""
                }`}
              />
              <CommunityStats community={community} />
            </div>

            {/* DETAILS */}
            <div className="flex flex-col min-w-0">
              {/* Differently Colored Description Box */}
              <div className="bg-(--secondary-bg) p-5 md:p-6 rounded-lg shadow-inner mb-8 text-left">
                <h2 className="text-lg font-semibold mb-2">Overview</h2>
                <p className="text-(--text-primary) leading-relaxed">
                  {metadata.overview || "No description available."}
                </p>
              </div>

              {/* Important Metadata Grid (Non-Expandable) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 border-t border-(--card-border) pt-6 text-left">
                {metadata.status && (
                  <div>
                    <span className="block text-(--text-secondary) text-xs md:text-sm mb-1">
                      Status
                    </span>
                    <span className="text-(--text-primary) font-medium text-sm md:text-base">
                      {metadata.status}
                    </span>
                  </div>
                )}
                {metadata.networks && metadata.networks.length > 0 && (
                  <div>
                    <span className="block text-(--text-secondary) text-xs md:text-sm mb-1">
                      Network
                    </span>
                    <span className="text-(--text-primary) font-medium text-sm md:text-base">
                      {metadata.networks[0].name}
                    </span>
                  </div>
                )}
                {metadata.vote_average !== undefined &&
                  metadata.vote_average > 0 && (
                    <div>
                      <span className="block text-(--text-secondary) text-xs md:text-sm mb-1">
                        TMDB Rating
                      </span>
                      <span className="text-(--text-primary) font-medium text-sm md:text-base">
                        {metadata.vote_average.toFixed(1)} / 10
                      </span>
                    </div>
                  )}
                {metadata.last_air_date && (
                  <div>
                    <span className="block text-(--text-secondary) text-xs md:text-sm mb-1">
                      Last Aired
                    </span>
                    <span className="text-(--text-primary) font-medium text-sm md:text-base">
                      {metadata.last_air_date}
                    </span>
                  </div>
                )}
                {metadata.number_of_seasons > 0 && (
                  <div>
                    <span className="block text-(--text-secondary) text-xs md:text-sm mb-1">
                      Seasons
                    </span>
                    <span className="text-(--text-primary) font-medium text-sm md:text-base">
                      {metadata.number_of_seasons}
                    </span>
                  </div>
                )}
                {metadata.number_of_episodes > 0 && (
                  <div>
                    <span className="block text-(--text-secondary) text-xs md:text-sm mb-1">
                      Episodes
                    </span>
                    <span className="text-(--text-primary) font-medium text-sm md:text-base">
                      {metadata.number_of_episodes}
                    </span>
                  </div>
                )}
                {metadata.created_by && metadata.created_by.length > 0 && (
                  <div className="col-span-2 sm:col-span-4">
                    <span className="block text-(--text-secondary) text-xs md:text-sm mb-1">
                      Created By
                    </span>
                    <span className="text-(--text-primary) font-medium text-sm md:text-base">
                      {metadata.created_by.map((c) => c.name).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* SEASONS */}
            {metadata.seasons && (
              <div className="mt-8 md:mt-12 flex flex-col min-w-0">
                <SeasonsCarousel seasons={metadata.seasons} />
              </div>
            )}

            {/* REVIEWS */}
            <div className="mt-8 md:mt-12 flex flex-col min-w-0">
              <RecentReviews
                reviews={
                  community.recentReviews || (community as any).recent_reviews
                }
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
