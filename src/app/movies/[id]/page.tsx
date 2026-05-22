import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movie Details — MediaRate",
};

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // TODO: Fetch movie details from the backend using the id
  // Example: const movie = await apiGet<MovieDetail>(`/movies/${id}`);

  return (
    <div className="pt-16 px-4 sm:px-8 pb-16 max-w-7xl mx-auto">
      <p className="text-neutral-400">Movie detail page for ID: {id}</p>
    </div>
  );
}
