import MediaGrid from "@/components/MediaGrid";
import { ShowCard } from "@/components/result-cards";
import type { MediaItem } from "@/types/media";
import { apiGet, searchShows } from "@/lib/api";
import { normalizeShow } from "@/lib/normalize";
import styles from "./page.module.css";
import type { ShowSearchResult } from "@/lib/api";

/** Shape returned by /shows/popular and /community/discovery?type=show */
interface ShowListResponse {
  count: number;
  results: ShowSearchResult[];
}

export default async function TVPage({
  searchParams,
}: {
  searchParams?: Promise<{ title?: string }>;
}) {
  const resolvedParams = await searchParams;
  const title = (resolvedParams?.title ?? "").trim();

  // ── Search mode ──────────────────────────────────────────────
  if (title) {
    const results: ShowSearchResult[] = await searchShows(title);

    return (
      <main className={styles.container}>
        <h1 className={styles.title}>
          Search results for &ldquo;{title}&rdquo;
        </h1>

        {results.length === 0 ? (
          <p className={styles.emptyText}>
            No shows found for &ldquo;{title}&rdquo;.
          </p>
        ) : (
          <div className={styles.grid}>
            {results.map((s, idx) => (
              <ShowCard key={s.title + idx} show={s} />
            ))}
          </div>
        )}
      </main>
    );
  }

  // ── Browse mode ──────────────────────────────────────────────
  let popularShows: MediaItem[] = [];
  let topRatedShows: MediaItem[] = [];

  try {
    const [popularData, topRatedData] = await Promise.all([
      apiGet<ShowListResponse>("/shows/popular"),
      apiGet<ShowListResponse>("/community/discovery?type=show&sort=top-rated"),
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
          <MediaGrid
            items={topRatedShows}
            getItemHref={(item) => `/tv/${item.id}`}
          />
        </section>
      )}

      <section>
        <h2 className="text-3xl font-bold text-white mb-6">Popular TV Shows</h2>
        <MediaGrid
          items={popularShows}
          getItemHref={(item) => `/tv/${item.id}`}
        />
      </section>
    </div>
  );
}
