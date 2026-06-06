import { apiGet, searchShows, getCommunityStats } from "@/lib/api";
import { normalizeShow, normalizeDiscovery } from "@/lib/normalize";
import type {
  ListResponse,
  ShowResult,
  DiscoveryResponse,
} from "@/types/media";
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
      <main className="pt-6 md:pt-12 px-4 pb-12">
        <section className="lg:w-11/12 lg:mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Search results for &ldquo;{title}&rdquo;
          </h1>

          {results.length === 0 ? (
            <p className="text-(--text-muted)">
              No shows found for &ldquo;{title}&rdquo;.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 md:gap-6 mt-6">
              {results.map((s, index) => (
                <ShowCard
                  key={s.title + index}
                  show={s}
                  returnUrl={`/tv?title=${encodeURIComponent(title)}`}
                  priority={index < 5}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  // ── Browse mode ──────────────────────────────────────────────
  const [popularData, topRatedData, mostReviewedData] = await Promise.all([
    apiGet<ListResponse<ShowResult>>("/shows/popular"),
    apiGet<DiscoveryResponse>("/community/discovery?type=show&sort=top-rated"),
    apiGet<DiscoveryResponse>(
      "/community/discovery?type=show&sort=most-reviewed",
    ),
  ]);

  const rawPopular = popularData.results ?? [];
  const rawTopRated = topRatedData?.results ?? [];
  const rawMostReviewed = mostReviewedData?.results ?? [];

  // Batch-fetch community stats for popular shows only
  const popularIds = [...new Set(rawPopular.map((s) => s.id))];
  const statsMap =
    popularIds.length > 0
      ? await getCommunityStats(popularIds, "show")
      : new Map();

  function withStats(items: ShowResult[]) {
    return items.map((item) => {
      const stats = statsMap.get(item.id);
      return normalizeShow({
        ...item,
        ...(stats && {
          averageRating: stats.rating,
          reviewCount: stats.reviewCount,
        }),
      });
    });
  }

  const popularShows = withStats(rawPopular);
  const topRatedShows = rawTopRated.map(normalizeDiscovery);
  const mostReviewedShows = rawMostReviewed.map(normalizeDiscovery);

  return (
    <main className="pt-6 md:pt-12 px-4 pb-12">
      {topRatedShows.length > 0 && (
        <section className="mb-12 lg:w-11/12 lg:mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Top Rated TV Shows
          </h2>
          <MediaGrid
            items={topRatedShows}
            getItemHref={(item) =>
              `/tv/${item.id}?returnUrl=${encodeURIComponent("/tv")}`
            }
            priorityCount={6}
          />
        </section>
      )}

      {mostReviewedShows.length > 0 && (
        <section className="mb-12 lg:w-11/12 lg:mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Most Reviewed TV Shows
          </h2>
          <MediaGrid
            items={mostReviewedShows}
            getItemHref={(item) =>
              `/tv/${item.id}?returnUrl=${encodeURIComponent("/tv")}`
            }
            priorityCount={6}
          />
        </section>
      )}

      <section className="lg:w-11/12 lg:mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-6">
          Popular TV Shows
        </h2>
        <MediaGrid
          items={popularShows}
          getItemHref={(item) =>
            `/tv/${item.id}?returnUrl=${encodeURIComponent("/tv")}`
          }
          priorityCount={6}
        />
      </section>
    </main>
  );
}
