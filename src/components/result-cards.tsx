/**
 * The things you see when you search for a movie/show
 */

import Image from "next/image";
import React from "react";
import styles from "./result-cards.module.css";

export interface MovieSearchResult {
  id: number;
  title: string;
  poster: string | null;
  releaseDate: string;
  description: string;
}

export interface ShowSearchResult {
  id: number;
  title: string;
  posterImage: string | null;
  releaseDate: string;
  shortDescription: string;
  genreIds: number[];
}

// TMDB genre ID → name (covers both movies and TV)
const GENRE_NAMES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
  // TV-specific
  10759: "Action & Adventure", 10762: "Kids", 10763: "News",
  10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
  10767: "Talk", 10768: "War & Politics",
};

function getPosterUrl(poster?: string | null) {
  if (!poster) return null;
  if (poster.startsWith("http")) return poster;
  if (poster.startsWith("/")) return `https://image.tmdb.org/t/p/w500${poster}`;
  return poster;
}

const Badge: React.FC<{ children: React.ReactNode; muted?: boolean }> = ({ children, muted }) => (
  <span className={muted ? styles.badgeMuted : styles.badge}>{children}</span>
);

function PosterFallback({ title }: { title: string }) {
  return (
    <div className={styles.fallback}>
      <Image
        src="/file.svg"
        alt="Poster placeholder"
        width={48}
        height={64}
        style={{ objectFit: "contain" }}
      />
      <span className={styles.fallbackText}>{title}</span>
    </div>
  );
}

export function MovieCard({ movie }: { movie: MovieSearchResult }) {
  const posterUrl = getPosterUrl(movie.poster);
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "";

  return (
    <article className={styles.card} aria-labelledby={`movie-${movie.id}-title`}>
      <div className={styles.posterContainer}>
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`${movie.title} poster`}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <PosterFallback title={movie.title} />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.headline}>
          <h3 id={`movie-${movie.id}-title`} className={styles.title}>{movie.title}</h3>
          {year && <Badge>{year}</Badge>}
        </div>

        <p className={styles.description}>{movie.description || "No description available."}</p>

        <div className={styles.meta}>
          <Badge muted>TMDB #{movie.id}</Badge>
        </div>
      </div>
    </article>
  );
}

export function ShowCard({ show }: { show: ShowSearchResult }) {
  const posterUrl = getPosterUrl(show.posterImage);
  const year = show.releaseDate ? new Date(show.releaseDate).getFullYear() : "";

  return (
    <article className={styles.card} aria-labelledby={`show-${show.id}-title`}>
      <div className={styles.posterContainer}>
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`${show.title} poster`}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <PosterFallback title={show.title} />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.headline}>
          <h3 id={`show-${show.id}-title`} className={styles.title}>{show.title}</h3>
          {year && <Badge>{year}</Badge>}
        </div>

        <p className={styles.description}>{show.shortDescription || "No description available."}</p>

        <div className={styles.genres}>
          {show.genreIds?.slice(0, 4).map((g) => (
            <span key={g} className={styles.genreTag}>
              {GENRE_NAMES[g] ?? `#${g}`}
            </span>
          ))}
        </div>

        <div className={styles.meta}>
          <Badge muted>TMDB #{show.id}</Badge>
        </div>
      </div>
    </article>
  );
}