import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { apiGet } from "@/lib/api";
import BlurredBackground from "@/components/BlurredBackground";
import MediaActionButtons from "@/components/MediaActionButtons";
import CommunityStats from "@/components/CommunityStats";
import SeasonsCarousel from "@/components/SeasonsCarousel";
import RecentReviews from "@/components/RecentReviews";

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
      userId?: number;
      dateOfReview?: string;
      reviewContent?: string;
    }[];
  };
}

export default async function TVDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let show: ShowDetail | null = null;
  let error = false;

  try {
    show = await apiGet<ShowDetail>(`/shows/details/${id}`);
  } catch (e) {
    error = true;
  }

  if (error || !show) {
    return (
      <div className="pt-16 px-4 sm:px-8 pb-16 max-w-7xl mx-auto text-white">
        <h1 className="text-2xl font-bold mb-4">TV Show not found</h1>
        <Link href="/tv" className="text-blue-400 hover:underline">
          &larr; Back to TV Shows
        </Link>
      </div>
    );
  }

  const { metadata, community } = show;

  let releaseYear = "";
  let formattedReleaseDate = "";
  if (metadata.first_air_date) {
    releaseYear = metadata.first_air_date.split("-")[0];
    const [y, m, d] = metadata.first_air_date.split("-");
    if (y && m && d) {
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      formattedReleaseDate = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } else {
      formattedReleaseDate = metadata.first_air_date;
    }
  }

  // Just in case the backend sometimes returns relative paths like the movie endpoint
  const posterUrl = metadata.poster_path
    ? metadata.poster_path.startsWith("http")
      ? metadata.poster_path
      : `https://image.tmdb.org/t/p/w500${metadata.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";

  const genreString = (metadata.genres || []).map((g) => g.name).join(", ");

  return (
    <main className="relative w-full flex-grow flex flex-col min-h-screen">
      {/* Dynamic Blurred Poster Background */}
      <BlurredBackground imageUrl={posterUrl} />

      {/* Content Container */}
      <div className="relative z-10 pt-16 px-4 sm:px-8 pb-16 max-w-7xl mx-auto w-full text-white flex-grow">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/tv"
            className="text-neutral-400 hover:text-white flex items-center gap-2 transition-colors w-fit"
          >
            <span>&larr;</span> Back to TV Shows
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Poster & Action Buttons */}
          <div className="flex-shrink-0 w-full md:w-80 flex flex-col gap-4">
            <Image
              src={posterUrl}
              alt={`${metadata.name} poster`}
              className="w-full rounded-lg shadow-lg object-cover"
              priority
              loading="eager"
              width={500}
              height={750}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            />
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col flex-grow min-w-0">
            <h1 className="text-4xl font-bold mb-2">
              {metadata.name}{" "}
              {releaseYear && (
                <span className="text-neutral-400 font-normal">
                  ({releaseYear})
                </span>
              )}
            </h1>

            {metadata.tagline && (
              <p className="text-xl text-neutral-400 italic mb-4">
                {metadata.tagline}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-neutral-300 text-base mb-8">
              {formattedReleaseDate && <span>{formattedReleaseDate}</span>}
              {genreString && <span>{genreString}</span>}
            </div>

            {/* Differently Colored Description Box */}
            <div className="bg-neutral-800 p-6 rounded-lg shadow-inner mb-8">
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-neutral-200 leading-relaxed">
                {metadata.overview || "No description available."}
              </p>
            </div>

            {/* Important Metadata Grid (Non-Expandable) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 border-t border-neutral-800 pt-6">
              {metadata.status && (
                <div>
                  <span className="block text-neutral-500 text-sm mb-1">
                    Status
                  </span>
                  <span className="text-neutral-200 font-medium">
                    {metadata.status}
                  </span>
                </div>
              )}
              {metadata.networks && metadata.networks.length > 0 && (
                <div>
                  <span className="block text-neutral-500 text-sm mb-1">
                    Network
                  </span>
                  <span className="text-neutral-200 font-medium">
                    {metadata.networks[0].name}
                  </span>
                </div>
              )}
              {metadata.vote_average !== undefined &&
                metadata.vote_average > 0 && (
                  <div>
                    <span className="block text-neutral-500 text-sm mb-1">
                      TMDB Rating
                    </span>
                    <span className="text-neutral-200 font-medium">
                      {metadata.vote_average.toFixed(1)} / 10
                    </span>
                  </div>
                )}
              {metadata.last_air_date && (
                <div>
                  <span className="block text-neutral-500 text-sm mb-1">
                    Last Aired
                  </span>
                  <span className="text-neutral-200 font-medium">
                    {metadata.last_air_date}
                  </span>
                </div>
              )}
              {metadata.number_of_seasons > 0 && (
                <div>
                  <span className="block text-neutral-500 text-sm mb-1">
                    Seasons
                  </span>
                  <span className="text-neutral-200 font-medium">
                    {metadata.number_of_seasons}
                  </span>
                </div>
              )}
              {metadata.number_of_episodes > 0 && (
                <div>
                  <span className="block text-neutral-500 text-sm mb-1">
                    Episodes
                  </span>
                  <span className="text-neutral-200 font-medium">
                    {metadata.number_of_episodes}
                  </span>
                </div>
              )}
              {metadata.created_by && metadata.created_by.length > 0 && (
                <div className="col-span-2 sm:col-span-4">
                  <span className="block text-neutral-500 text-sm mb-1">
                    Created By
                  </span>
                  <span className="text-neutral-200 font-medium">
                    {metadata.created_by.map((c) => c.name).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-Width Seasons Carousel - Now a component */}
        {metadata.seasons && <SeasonsCarousel seasons={metadata.seasons} />}

        {/* Bottom Section: Actions & Reviews */}
        <div className="mt-16 flex flex-col md:flex-row gap-8">
          {/* Left Column: Actions align with poster */}
          <div className="flex-shrink-0 w-full md:w-80 flex flex-col gap-4">
            <MediaActionButtons />
            <CommunityStats community={community} />
          </div>

          {/* Right Column: Reviews */}
          <div className="flex flex-col flex-grow min-w-0">
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
