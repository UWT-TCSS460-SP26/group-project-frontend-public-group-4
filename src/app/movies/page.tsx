import MediaGrid from "@/components/MediaGrid";
import type { MediaItem } from "@/types/media";
import { apiGet } from "@/lib/api";
import { normalizeMovie } from "@/lib/normalize";

/** Shape the backend returns for both /movies/popular and /community/discovery?type=movie */
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

export default async function MoviesPage() {
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
