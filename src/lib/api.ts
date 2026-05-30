const BASE_URL = "https://group-project-backend-group-3-1.onrender.com";

import type { MovieResult, ShowResult } from "@/types/media";
import type { RatingRecord, ReviewRecord } from "@/types/community";

export async function searchMovies(title: string): Promise<MovieResult[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/movies?title=${encodeURIComponent(title)}`,
    );
    if (!res.ok) throw new Error(`movies search returned ${res.status}`);
    return (await res.json()) as MovieResult[];
  } catch (e) {
    return [];
  }
}

export async function searchShows(title: string): Promise<ShowResult[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/shows?title=${encodeURIComponent(title)}`,
    );
    if (!res.ok) throw new Error(`shows search returned ${res.status}`);
    return (await res.json()) as ShowResult[];
  } catch (e) {
    return [];
  }
}

async function fetchApi<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new ApiError(res.status, res.statusText, await res.text());
  return res.json();
}

export async function getRatings(accessToken: string): Promise<RatingRecord[]> {
  try {
    return await fetchApi<RatingRecord[]>("/ratings/me", accessToken);
  } catch {
    return [];
  }
}

export async function getReviews(accessToken: string): Promise<ReviewRecord[]> {
  try {
    return await fetchApi<ReviewRecord[]>("/reviews/me", accessToken);
  } catch {
    return [];
  }
}

export async function postReview(
  accessToken: string,
  body: { tmdbIdentifier: number; isMovie: boolean; reviewContent: string},
): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new ApiError(res.status, res.statusText, await res.text());
  }
  return res.json();
}

export async function updateReview(
  accessToken: string,
  reviewId: number,
  body: { reviewContent: string},
): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new ApiError(res.status, res.statusText, await res.text());
  }
  return res.json();
}

export async function deleteReview(
  accessToken: string,
  reviewId: number,
): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    throw new ApiError(res.status, res.statusText, await res.text());
  }
  return res.json();
}

/**
 * Wraps a non-2xx fetch response so callers can branch on `instanceof ApiError`
 * and surface the server-supplied body if there is one.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: string,
  ) {
    super(`${status} ${statusText}: ${body}`);
    this.name = "ApiError";
  }
}

/**
 * Public GET against the partner API. No auth header attached.
 * Use for routes that don't require a token (e.g. /movies/popular).
 */
export async function apiGet<T = unknown>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      await response.text(),
    );
  }
  return response.json() as Promise<T>;
}

/**
 * Fetches community stats (avg rating + review count) for a batch of
 * movie or show IDs. Returns a Map of tmdbId → stats.
 */
export async function getCommunityStats(
  ids: number[],
  type: "movie" | "show",
): Promise<Map<number, { rating: number | null; reviewCount: number }>> {
  const endpoint = type === "movie" ? "/movies/details" : "/shows/details";
  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const res = await fetch(`${BASE_URL}${endpoint}/${id}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new ApiError(res.status, res.statusText, await res.text());
      const data = (await res.json()) as {
        community: { averageRating: number | null; reviewCount: number };
      };
      return { id, community: data.community };
    }),
  );

  const map = new Map<number, { rating: number | null; reviewCount: number }>();
  for (const r of results) {
    if (r.status === "fulfilled") {
      map.set(r.value.id, {
        rating: r.value.community.averageRating,
        reviewCount: r.value.community.reviewCount,
      });
    }
  }
  return map;
}
