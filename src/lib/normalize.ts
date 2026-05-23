import type { MediaItem } from "@/types/media";

/**
 * Map the partner API's movie shape into our internal MediaItem type.
 */
export function normalizeMovie(m: {
  id: number;
  title: string;
  poster: string | null;
  releaseDate: string;
  description: string;
  genreIds: number[];
}): MediaItem {
  return {
    id: m.id,
    title: m.title,
    posterPath: m.poster,
    releaseDate: m.releaseDate,
    description: m.description,
    genreIds: m.genreIds,
  };
}

/**
 * Map the partner API's show shape into our internal MediaItem type.
 */
export function normalizeShow(s: {
  id: number;
  title: string;
  posterImage: string | null;
  releaseDate: string;
  shortDescription: string;
  genreIds: number[];
}): MediaItem {
  return {
    id: s.id,
    title: s.title,
    posterPath: s.posterImage,
    releaseDate: s.releaseDate,
    description: s.shortDescription,
    genreIds: s.genreIds,
  };
}
