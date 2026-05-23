import { apiGet, searchMovies } from "@/lib/api";
import { normalizeMovie } from "@/lib/normalize";
import styles from "./page.module.css";
import type { ListResponse, MovieResult } from "@/types/media";
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
  const [popularData, topRatedData] = await Promise.all([
    apiGet<ListResponse<MovieResult>>("/movies/popular"),
    apiGet<ListResponse<MovieResult>>(
      "/community/discovery?type=movie&sort=top-rated",
    ),
  ]);

  const popularMovies = (popularData.results ?? []).map(normalizeMovie);
  const topRatedMovies = topRatedData
    ? (topRatedData.results ?? []).map(normalizeMovie)
    : [];

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
