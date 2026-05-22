import MediaGrid from "@/components/MediaGrid";
import type { MediaItem } from "@/types/media";
import { apiGet } from "@/lib/api";
import { normalizeShow } from "@/lib/normalize";

/** Shape the backend returns for /shows/popular */
interface ShowResult {
  id: number;
  title: string;
  posterImage: string | null;
  releaseDate: string;
  shortDescription: string;
  genreIds: number[];
}

interface ShowListResponse {
  count: number;
  results: ShowResult[];
}

export default async function TVPage() {
  let popularShows: MediaItem[] = [];
  let topRatedShows: MediaItem[] = [];

  try {
    const [popularData, topRatedData] = await Promise.all([
      apiGet<ShowListResponse>("/shows/popular"),
      apiGet<ShowListResponse>(
        "/community/discovery?type=show&sort=top-rated",
      ),
    ]);

    popularShows = (popularData.results ?? []).map(normalizeShow);
    if (topRatedData) {
      topRatedShows = (topRatedData.results ?? []).map(normalizeShow);
    }
  } catch {
    // API unreachable — show empty states
  }

  return (
    <div className="pt-16 px-4 sm:px-8 pb-16 max-w-7xl mx-auto">
      {topRatedShows.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            Top Rated TV Shows
          </h2>
          <MediaGrid items={topRatedShows} getItemHref={(item) => `/tv/${item.id}`} />
        </section>
      )}

      <section>
        <h2 className="text-3xl font-bold text-white mb-6">Popular TV Shows</h2>
        <MediaGrid items={popularShows} getItemHref={(item) => `/tv/${item.id}`} />
      </section>
    </div>
  );
}
