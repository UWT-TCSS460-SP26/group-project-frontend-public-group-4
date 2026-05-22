import MediaGrid from "@/components/MediaGrid";
import { MovieCard } from "@/components/result-cards";
import type { MediaItem } from "@/types/media";
import { apiGet, searchMovies } from "@/lib/api";
import { normalizeMovie } from "@/lib/normalize";
import styles from "./page.module.css";
import type { MovieSearchResult } from "@/lib/api";

/** Shape returned by /movies/popular and /community/discovery?type=movie */
interface MovieResult {
  id: number;
  title: string;
  poster: string | null;
  releaseDate: string;
  description: string;
  genreIds: number[];
}

interface MovieListResponse {
  count: number;
  results: MovieResult[];
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams?: Promise<{ title?: string }>;
}) {
  const resolvedParams = await searchParams;
  const title = (resolvedParams?.title ?? "").trim();

  // ── Search mode ──────────────────────────────────────────────
  if (title) {
    const results: MovieSearchResult[] = await searchMovies(title);

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
  let popularMovies: MediaItem[] = [];
  let topRatedMovies: MediaItem[] = [];

  try {
    const [popularData, topRatedData] = await Promise.all([
      apiGet<MovieListResponse>("/movies/popular"),
      apiGet<MovieListResponse>(
        "/community/discovery?type=movie&sort=top-rated",
      ),
    ]);

    popularMovies = (popularData.results ?? []).map(normalizeMovie);
    if (topRatedData) {
      topRatedMovies = (topRatedData.results ?? []).map(normalizeMovie);
    }
  } catch {
    // API unreachable — show empty states
  }

  return (
    <div className="pt-16 px-4 sm:px-8 pb-16 max-w-7xl mx-auto">
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
