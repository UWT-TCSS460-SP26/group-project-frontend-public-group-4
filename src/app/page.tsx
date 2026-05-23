import MediaGrid from "@/components/MediaGrid";
import type { ListResponse, MovieResult, ShowResult } from "@/types/media";
import { apiGet } from "@/lib/api";
import { normalizeMovie, normalizeShow } from "@/lib/normalize";

export default async function Home() {
  const [movieData, showData] = await Promise.all([
    apiGet<ListResponse<MovieResult>>("/movies/popular"),
    apiGet<ListResponse<ShowResult>>("/shows/popular"),
  ]);

  const movies = (movieData.results ?? []).map(normalizeMovie);
  const shows = (showData.results ?? []).map(normalizeShow);

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
