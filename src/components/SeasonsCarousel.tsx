import Image from "next/image";

// Define the shape of a single season object
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
  // Filter out "Specials" which often have season_number 0
  const displaySeasons = seasons.filter((s) => s.season_number > 0);

  if (!displaySeasons || displaySeasons.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Seasons</h2>
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x [color-scheme:dark] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:#404040_transparent]">
        {displaySeasons.map((season) => {
          const seasonPosterUrl = season.poster_path
            ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
            : "https://via.placeholder.com/500x750?text=No+Poster";
          const seasonYear = season.air_date
            ? season.air_date.split("-")[0]
            : "";

          return (
            <div
              key={season.id}
              className="w-36 sm:w-40 flex-shrink-0 snap-start group relative overflow-hidden rounded-lg bg-neutral-800/50 transition-transform hover:scale-[1.03] border border-neutral-700/50"
            >
              <div className="aspect-[2/3] relative bg-neutral-900">
                <Image
                  src={seasonPosterUrl}
                  alt={`${season.name} poster`}
                  fill
                  sizes="(max-width: 640px) 144px, 160px"
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <h3
                  className="text-sm font-semibold text-white truncate"
                  title={season.name}
                >
                  {season.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {seasonYear ? `${seasonYear} • ` : ""}
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
