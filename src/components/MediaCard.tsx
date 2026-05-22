import Image from "next/image";
import Link from "next/link";

import type { MediaItem } from "@/types/media";

interface MediaCardProps {
  item: MediaItem;
  href?: string;
}

const PLACEHOLDER = "/placeholder-poster.svg";

function posterUrl(path: string | null): string {
  if (!path) return PLACEHOLDER;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/w500${path}`;
}

function extractYear(dateStr: string): string {
  return dateStr ? dateStr.slice(0, 4) : "—";
}

export default function MediaCard({ item, href }: MediaCardProps) {
  const card = (
    <div className="group relative overflow-hidden rounded-lg bg-neutral-800 transition-transform hover:scale-[1.03]">
      <div className="aspect-[2/3] relative">
        <Image
          src={posterUrl(item.posterPath)}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-xs text-neutral-300 line-clamp-4">
              {item.description}
            </p>
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate">
          {item.title}
        </h3>
        <p className="text-xs text-neutral-400">
          {extractYear(item.releaseDate)}
        </p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }
  return card;
}
