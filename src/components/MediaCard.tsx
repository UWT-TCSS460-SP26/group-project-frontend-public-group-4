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
  return `https://image.tmdb.org/t/p/w342${path}`;
}

function extractYear(dateStr: string): string {
  return dateStr ? dateStr.slice(0, 4) : "—";
}

export default function MediaCard({ item, href }: MediaCardProps) {
  const card = (
    <div className="group relative overflow-hidden rounded-lg bg-neutral-800 transition-transform hover:scale-[1.03]">
      <div className="aspect-2/3 relative">
        {item.rating != null && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 backdrop-blur-sm">
            <svg
              className="h-3.5 w-3.5 text-amber-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-medium text-amber-400">
              {item.rating.toFixed(1)}
            </span>
          </div>
        )}
        {item.reviewCount != null && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 backdrop-blur-sm">
            <svg
              className="h-3.5 w-3.5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-xs font-medium text-blue-400">
              {item.reviewCount}
            </span>
          </div>
        )}
        <Image
          src={posterUrl(item.posterPath)}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          className="object-cover"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-sm text-neutral-300 line-clamp-4">
              {item.description}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-white truncate">
          {item.title}
        </h3>
        <p className="text-sm text-neutral-400">
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
