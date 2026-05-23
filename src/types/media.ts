/** Shape returned by /movies/popular, /tv/popular, /community/discovery?type=show and /community/discovery?type=movie */
export interface MediaItem {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  description: string;
  genreIds: number[];
  rating?: number;
  reviewCount?: number;
}

export interface ShowResult {
  id: number;
  title: string;
  posterImage: string | null;
  releaseDate: string;
  shortDescription: string;
  genreIds: number[];
}

export interface ListResponse<T> {
  count: number;
  results: T[];
}

export interface MovieResult {
  id: number;
  title: string;
  poster: string | null;
  releaseDate: string;
  description: string;
  genreIds: number[];
}

/** Shape of a single item inside GET /community/discovery results */
export interface DiscoveryResult {
  tmdbId: number;
  title: string | null;
  posterPath: string | null;
  overview: string | null;
  releaseDate: string | null;
  averageRating: number | null;
  reviewCount: number;
}

export interface DiscoveryResponse {
  type: "movie" | "show";
  sort: "top-rated" | "most-reviewed";
  results: DiscoveryResult[];
}
