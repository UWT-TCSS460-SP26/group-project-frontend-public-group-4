import MediaGrid from "@/components/MediaGrid";
import type { ListResponse, MovieResult, ShowResult } from "@/types/media";
import { apiGet, getCommunityStats } from "@/lib/api";
import { normalizeMovie, normalizeShow } from "@/lib/normalize";

export default async function Home() {
  const [movieData, showData] = await Promise.all([
    apiGet<ListResponse<MovieResult>>("/movies/popular"),
    apiGet<ListResponse<ShowResult>>("/shows/popular"),
  ]);

  const rawMovies = movieData.results ?? [];
  const rawShows = showData.results ?? [];

  // Batch-fetch community stats
  const movieIds = [...new Set(rawMovies.map((m) => m.id))];
  const showIds = [...new Set(rawShows.map((s) => s.id))];
  const [movieStats, showStats] = await Promise.all([
    movieIds.length > 0 ? getCommunityStats(movieIds, "movie") : new Map(),
    showIds.length > 0 ? getCommunityStats(showIds, "show") : new Map(),
  ]);

  const movies = rawMovies.map((item) => {
    const stats = movieStats.get(item.id);
    return normalizeMovie({
      ...item,
      ...(stats && {
        averageRating: stats.rating,
        reviewCount: stats.reviewCount,
      }),
    });
  });
  const shows = rawShows.map((item) => {
    const stats = showStats.get(item.id);
    return normalizeShow({
      ...item,
      ...(stats && {
        averageRating: stats.rating,
        reviewCount: stats.reviewCount,
      }),
    });
  });

  return (
    <div className="pt-16 px-2 sm:px-4 lg:px-6 pb-16">
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6">Popular Movies</h2>
        <MediaGrid
          items={movies}
          getItemHref={(item) => `/movies/${item.id}`}
        />
      </section>

      <section>
        <h2 className="text-3xl font-bold text-white mb-6">Popular TV Shows</h2>
        <MediaGrid items={shows} getItemHref={(item) => `/tv/${item.id}`} />
      </section>
    </div>
  );
}
