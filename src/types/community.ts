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
