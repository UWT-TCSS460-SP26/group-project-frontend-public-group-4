"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const BASE_URL = "https://group-project-backend-group-3-1.onrender.com";

export async function submitReview(data: {
  tmdbIdentifier: number;
  isMovie: boolean;
  reviewContent: string;
}) {
  const session = await auth();

  if (!session?.accessToken) {
    return { error: "Not authenticated. Please sign in to review." };
  }

  try {
    const response = await fetch(`${BASE_URL}/reviews`, {
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
        // If conflict, try to fetch the user's reviews to find the existing reviewId for patching
        const meRes = await fetch(`${BASE_URL}/reviews/me`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        let existingReviewId = null;
        if (meRes.ok) {
          const myReviews = await meRes.json();
          const existing = myReviews.find(
            (r: any) =>
              r.tmdbIdentifier === data.tmdbIdentifier &&
              r.isMovie === data.isMovie,
          );
          if (existing) existingReviewId = existing.reviewId;
        }
        return {
          conflict: true,
          reviewId: existingReviewId,
          error: errData.error || "You have already reviewed this title.",
        };
      }

      return {
        error:
          errData.error || `Failed to submit review (${response.status})`,
      };
    }

    const result = await response.json();

    revalidatePath("/movies/[id]", "page");
    revalidatePath("/tv/[id]", "page");
    return { success: true, data: result };
  } catch (error) {
    return { error: "A network error occurred while submitting your review." };
  }
}

export async function updateReview(
  reviewId: number,
  body: { reviewContent: string },
) {
  const session = await auth();

  if (!session?.accessToken) {
    return { error: "Not authenticated. Please sign in to update your review." };
  }

  try {
    const response = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        error:
          errData.error || `Failed to update review (${response.status})`,
      };
    }

    const result = await response.json();

    revalidatePath("/movies/[id]", "page");
    revalidatePath("/tv/[id]", "page");
    return { success: true, data: result };
  } catch (error) {
    return { error: "A network error occurred while updating your review." };
  }
}

export async function deleteReview(reviewId: number) {
  const session = await auth();

  if (!session?.accessToken) {
    return { error: "Not authenticated. Please sign in to delete your review." };
  }

  try {
    const response = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        error:
          errData.error || `Failed to delete review (${response.status})`,
      };
    }

    revalidatePath("/movies/[id]", "page");
    revalidatePath("/tv/[id]", "page");
    return { success: true };
  } catch (error) {
    return { error: "A network error occurred while deleting your review." };
  }
}
