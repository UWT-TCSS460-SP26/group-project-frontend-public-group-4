import MediaGrid from "@/components/MediaGrid";
import type { MediaItem } from "@/types/media";
import { apiGet } from "@/lib/api";
import { normalizeMovie, normalizeShow } from "@/lib/normalize";

export default async function Home() {
  let movies: MediaItem[] = [];
  let shows: MediaItem[] = [];

  try {
    const [movieData, showData] = await Promise.all([
      apiGet<{
        count: number;
        results: {
          id: number;
          title: string;
          poster: string | null;
          releaseDate: string;
          description: string;
          genreIds: number[];
        }[];
      }>("/movies/popular"),
      apiGet<{
        count: number;
        results: {
          id: number;
          title: string;
          posterImage: string | null;
          releaseDate: string;
          shortDescription: string;
          genreIds: number[];
        }[];
      }>("/shows/popular"),
    ]);

    movies = (movieData.results ?? []).map(normalizeMovie);
    shows = (showData.results ?? []).map(normalizeShow);
  } catch {
    // API unreachable — show empty states
  }

  return (
    <div className="pt-16 px-4 sm:px-8 pb-16 max-w-7xl mx-auto">
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
