import { apiGet, searchShows } from "@/lib/api";
import { normalizeShow } from "@/lib/normalize";
import styles from "./page.module.css";
import type { ListResponse, ShowResult } from "@/types/media";
import MediaGrid from "@/components/MediaGrid";
import { ShowCard } from "@/components/result-cards";

export default async function TVPage({
  searchParams,
}: {
  searchParams?: Promise<{ title?: string }>;
}) {
  const resolvedParams = await searchParams;
  const title = (resolvedParams?.title ?? "").trim();

  // ── Search mode ──────────────────────────────────────────────
  if (title) {
    const results: ShowResult[] = await searchShows(title);

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
  const [popularData, topRatedData] = await Promise.all([
    apiGet<ListResponse<ShowResult>>("/shows/popular"),
    apiGet<ListResponse<ShowResult>>(
      "/community/discovery?type=show&sort=top-rated",
    ),
  ]);

  const popularShows = (popularData.results ?? []).map(normalizeShow);
  const topRatedShows = topRatedData
    ? (topRatedData.results ?? []).map(normalizeShow)
    : [];

  return (
    <div className="pt-16 px-2 sm:px-4 lg:px-6 pb-16">
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
