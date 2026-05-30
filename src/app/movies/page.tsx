import { apiGet, searchMovies, getCommunityStats } from "@/lib/api";
import { normalizeMovie, normalizeDiscovery } from "@/lib/normalize";
import styles from "./page.module.css";
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
      <main className={styles.container}>
        <h1 className={styles.title}>
          Search results for &ldquo;{title}&rdquo;
        </h1>

        {results.length === 0 ? (
          <p className={styles.emptyText}>
            No movies found for &ldquo;{title}&rdquo;.
          </p>
        ) : (
          <div className={styles.grid}>
            {results.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </main>
    );
  }

  // ── Browse mode ──────────────────────────────────────────────
  const [popularData, topRatedData, mostReviewedData] = await Promise.all([
    apiGet<ListResponse<MovieResult>>("/movies/popular"),
    apiGet<DiscoveryResponse>("/community/discovery?type=movie&sort=top-rated"),
    apiGet<DiscoveryResponse>("/community/discovery?type=movie&sort=most-reviewed"),
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
    <div className="pt-16 px-2 sm:px-4 lg:px-6 pb-16">
      {topRatedMovies.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            Top Rated Movies
          </h2>
          <MediaGrid
            items={topRatedMovies}
            getItemHref={(item) => `/movies/${item.id}`}
          />
        </section>
      )}

      {mostReviewedMovies.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            Most Reviewed Movies
          </h2>
          <MediaGrid
            items={mostReviewedMovies}
            getItemHref={(item) => `/movies/${item.id}`}
          />
        </section>
      )}

      <section>
        <h2 className="text-3xl font-bold text-white mb-6">Popular Movies</h2>
        <MediaGrid
          items={popularMovies}
          getItemHref={(item) => `/movies/${item.id}`}
        />
      </section>
    </div>
  );
}
