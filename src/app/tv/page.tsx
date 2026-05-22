import React from "react";
import { searchShows } from "@/lib/api";
import { ShowCard } from "@/components/result-cards";
import styles from "./page.module.css";

export default async function TvPage({
  searchParams,
}: {
  searchParams?: Promise<{ title?: string }>;
}) {
  const resolvedParams = await searchParams;
  const title = (resolvedParams?.title ?? "").trim();

  if (!title) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Search TV shows</h1>
        <p className={styles.emptyText}>Enter a title in the search box to find TV shows.</p>
      </main>
    );
  }

  const results = await searchShows(title);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Search results for "{title}"</h1>

      {results.length === 0 ? (
        <p className={styles.emptyText}>No shows found for "{title}".</p>
      ) : (
        <div className={styles.grid}>
          {results.map((s, idx) => (
            <ShowCard key={s.title + idx} show={s} />
          ))}
        </div>
      )}
    </main>
  );
}