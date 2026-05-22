const BASE_URL = "https://group-project-backend-group-3-1.onrender.com";

export interface RatingRecord {
  ratingId: number;
  userId: number;
  isMovie: boolean;
  rating: number;
  tmdbIdentifier: number;
  author: {
    subjectId: string;
    displayName: string;
  };
}

export interface ReviewRecord {
  reviewId: number;
  userId: number;
  isMovie: boolean;
  dateOfReview: string;
  reviewContent: string;
  tmdbIdentifier: number;
}

export interface MovieSearchResult {
  title: string;
  poster: string | null;
  releaseDate: string;
  id: number;
  description: string;
}

export interface ShowSearchResult {
  title: string;
  posterImage: string | null;
  releaseDate: string;
  id: number;
  shortDescription: string;
  genreIds: number[];
}

export async function searchMovies(
  title: string,
): Promise<MovieSearchResult[]> {
  try {
    const res = await fetch(`${BASE_URL}/movies?title=${encodeURIComponent(title)}`);
    if (!res.ok) throw new Error(`movies search returned ${res.status}`);
    return (await res.json()) as MovieSearchResult[];
  } catch (e) {
    return [];
  }
}

export async function searchShows(
  title: string,
): Promise<ShowSearchResult[]> {
  try {
    const res = await fetch(`${BASE_URL}/shows?title=${encodeURIComponent(title)}`);
    if (!res.ok) throw new Error(`shows search returned ${res.status}`);
    return (await res.json()) as ShowSearchResult[];
  } catch (e) {
    return [];
  }
}

async function fetchApi<T>(
  path: string,
  accessToken: string,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`API ${path} returned ${res.status}`);
  return res.json();
}

export async function getRatings(
  accessToken: string,
): Promise<RatingRecord[]> {
  try {
    return await fetchApi<RatingRecord[]>("/ratings/me", accessToken);
  } catch {
    return [];
  }
}

export async function getReviews(
  accessToken: string,
): Promise<ReviewRecord[]> {
  try {
    return await fetchApi<ReviewRecord[]>("/reviews/me", accessToken);
  } catch {
    return [];
  }
}
