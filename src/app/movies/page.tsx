import React from "react";
import { searchMovies } from "@/lib/api";
import { MovieCard } from "@/components/result-cards";
import styles from "./page.module.css";

export default async function MoviesPage({
  searchParams,
}: {
  searchParams?: Promise<{ title?: string }>;
}) {
  const resolvedParams = await searchParams;
  const title = (resolvedParams?.title ?? "").trim();

  if (!title) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Search movies</h1>
        <p className={styles.emptyText}>Enter a title in the search box to find movies.</p>
      </main>
    );
  }

  const results = await searchMovies(title);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Search results for "{title}"</h1>

      {results.length === 0 ? (
        <p className={styles.emptyText}>No movies found for "{title}".</p>
      ) : (
        <div className={styles.grid}>
          {results.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </main>
  );
}