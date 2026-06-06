import { apiGet, searchMovies, getCommunityStats } from "@/lib/api";
import { normalizeMovie, normalizeDiscovery } from "@/lib/normalize";
import type {
  ListResponse,
  MovieResult,
  DiscoveryResponse,
} from "@/types/media";
import MediaGrid from "@/components/MediaGrid";
import { MovieCard } from "@/components/result-cards";

export default async function MoviesPage({
  searchParams,
}: {
  searchParams?: Promise<{ title?: string }>;
}) {
  const resolvedParams = await searchParams;
  const title = (resolvedParams?.title ?? "").trim();

  // ── Search mode ──────────────────────────────────────────────
  if (title) {
    const results: MovieResult[] = await searchMovies(title);

    return (
      <main className="pt-6 md:pt-12 px-4 pb-12">
        <section className="lg:w-11/12 lg:mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Search results for &ldquo;{title}&rdquo;
          </h1>

          {results.length === 0 ? (
            <p className="text-(--text-muted)">
              No movies found for &ldquo;{title}&rdquo;.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 md:gap-6 mt-6">
              {results.map((m, index) => (
                <MovieCard
                  key={m.id}
                  movie={m}
                  returnUrl={`/movies?title=${encodeURIComponent(title)}`}
                  priority={index < 5}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  // ── Browse mode ──────────────────────────────────────────────
  const [popularData, topRatedData, mostReviewedData] = await Promise.all([
    apiGet<ListResponse<MovieResult>>("/movies/popular"),
    apiGet<DiscoveryResponse>("/community/discovery?type=movie&sort=top-rated"),
    apiGet<DiscoveryResponse>(
      "/community/discovery?type=movie&sort=most-reviewed",
    ),
  ]);

  const rawPopular = popularData.results ?? [];
  const rawTopRated = topRatedData?.results ?? [];
  const rawMostReviewed = mostReviewedData?.results ?? [];

  // Batch-fetch community stats for popular movies only
  // Discovery results already include averageRating + reviewCount
  const popularIds = [...new Set(rawPopular.map((m) => m.id))];
  const statsMap =
    popularIds.length > 0
      ? await getCommunityStats(popularIds, "movie")
      : new Map();

  function withStats(items: MovieResult[]) {
    return items.map((item) => {
      const stats = statsMap.get(item.id);
      return normalizeMovie({
        ...item,
        ...(stats && {
          averageRating: stats.rating,
          reviewCount: stats.reviewCount,
        }),
      });
    });
  }

  const popularMovies = withStats(rawPopular);
  const topRatedMovies = rawTopRated.map(normalizeDiscovery);
  const mostReviewedMovies = rawMostReviewed.map(normalizeDiscovery);

  return (
    <main className="pt-6 md:pt-12 px-4 pb-12">
      {topRatedMovies.length > 0 && (
        <section className="mb-12 lg:w-11/12 lg:mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Top Rated Movies
          </h2>
          <MediaGrid
            items={topRatedMovies}
            getItemHref={(item) =>
              `/movies/${item.id}?returnUrl=${encodeURIComponent("/movies")}`
            }
            priorityCount={6}
          />
        </section>
      )}

      {mostReviewedMovies.length > 0 && (
        <section className="mb-12 lg:w-11/12 lg:mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Most Reviewed Movies
          </h2>
          <MediaGrid
            items={mostReviewedMovies}
            getItemHref={(item) =>
              `/movies/${item.id}?returnUrl=${encodeURIComponent("/movies")}`
            }
          />
        </section>
      )}

      <section className="lg:w-11/12 lg:mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-6">
          Popular Movies
        </h2>
        <MediaGrid
          items={popularMovies}
          getItemHref={(item) =>
            `/movies/${item.id}?returnUrl=${encodeURIComponent("/movies")}`
          }
        />
      </section>
    </main>
  );
}
