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
