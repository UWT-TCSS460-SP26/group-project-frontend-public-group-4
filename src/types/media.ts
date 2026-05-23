export interface MediaItem {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  description: string;
  genreIds: number[];
}
