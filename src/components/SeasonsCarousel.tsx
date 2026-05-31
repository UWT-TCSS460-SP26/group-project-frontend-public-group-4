import Image from "next/image";
import ImagePlaceholderIcon from "./ImagePlaceholderIcon";

interface Season {
  id: number;
  name: string;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
  season_number: number;
  overview: string;
}

interface SeasonsCarouselProps {
  seasons: Season[];
}

export default function SeasonsCarousel({ seasons }: SeasonsCarouselProps) {
  const displaySeasons = seasons.filter((s) => s.season_number > 0);

  if (!displaySeasons || displaySeasons.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
        Seasons
      </h2>
      <div className="flex overflow-x-auto gap-4 pb-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full scrollbar-thin"
        style={{ scrollbarColor: "var(--surface-border) transparent" }}>
        {displaySeasons.map((season) => {
          const seasonPosterUrl = season.poster_path
            ? `https://image.tmdb.org/t/p/w185${season.poster_path}`
            : null;
          const seasonYear = season.air_date
            ? season.air_date.split("-")[0]
            : "";

          return (
            <div
              key={season.id}
              className="w-36 sm:w-40 shrink-0 group relative overflow-hidden rounded-lg transition-transform hover:scale-[1.03] border"
              style={{
                backgroundColor: "var(--season-card-bg)",
                borderColor: "var(--season-card-border)",
              }}
            >
              <div
                className="aspect-2/3 relative"
                style={{ backgroundColor: "var(--season-img-bg)" }}
              >
                {seasonPosterUrl ? (
                  <Image
                    src={seasonPosterUrl}
                    alt={`${season.name} poster`}
                    fill
                    sizes="(max-width: 640px) 144px, 160px"
                    className="object-cover"
                    loading="lazy"
                    unoptimized
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ color: "var(--season-card-text-muted)" }}
                  >
                    <ImagePlaceholderIcon className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--season-card-text)" }}
                  title={season.name}
                >
                  {season.name}
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--season-card-text-muted)" }}
                >
                  {seasonYear ? `${seasonYear} \u2022 ` : ""}
                  {season.episode_count} Episodes
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
