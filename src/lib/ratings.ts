"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const BASE_URL = "https://group-project-backend-group-3-1.onrender.com";

export async function submitRating(data: {
  tmdbIdentifier: number;
  isMovie: boolean;
  rating: number;
}) {
  const session = await auth();

  if (!session?.accessToken) {
    return { error: "Not authenticated. Please sign in to rate." };
  }

  try {
    const response = await fetch(`${BASE_URL}/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));

      if (response.status === 409) {
        // If conflict, try to fetch the user's ratings to find the existing ratingId for patching
        const meRes = await fetch(`${BASE_URL}/ratings/me`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        let existingRatingId = null;
        if (meRes.ok) {
          const myRatings = await meRes.json();
          const existing = myRatings.find(
            (r: any) =>
              r.tmdbIdentifier === data.tmdbIdentifier &&
              r.isMovie === data.isMovie,
          );
          if (existing) existingRatingId = existing.ratingId;
        }
        return {
          conflict: true,
          ratingId: existingRatingId,
          error: errData.error || "You have already rated this title.",
        };
      }

      return {
        error: errData.error || `Failed to submit rating (${response.status})`,
      };
    }

    const result = await response.json();

    revalidatePath("/movies/[id]", "page");
    revalidatePath("/tv/[id]", "page");
    return { success: true, data: result };
  } catch (error) {
    return { error: "A network error occurred while submitting your rating." };
  }
}

export async function updateRating(ratingId: number, rating: number) {
  const session = await auth();

  if (!session?.accessToken) {
    return { error: "Not authenticated. Please sign in to rate." };
  }

  try {
    const response = await fetch(`${BASE_URL}/ratings/${ratingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ rating }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        error: errData.error || `Failed to update rating (${response.status})`,
      };
    }

    const result = await response.json();

    revalidatePath("/movies/[id]", "page");
    revalidatePath("/tv/[id]", "page");
    return { success: true, data: result };
  } catch (error) {
    return { error: "A network error occurred while updating your rating." };
  }
}

export async function deleteRating(ratingId: number) {
  const session = await auth();

  if (!session?.accessToken) {
    return { error: "Not authenticated. Please sign in to rate." };
  }

  try {
    const response = await fetch(`${BASE_URL}/ratings/${ratingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        error: errData.error || `Failed to delete rating (${response.status})`,
      };
    }

    revalidatePath("/movies/[id]", "page");
    revalidatePath("/tv/[id]", "page");
    return { success: true };
  } catch (error) {
    return { error: "A network error occurred while deleting your rating." };
  }
}
