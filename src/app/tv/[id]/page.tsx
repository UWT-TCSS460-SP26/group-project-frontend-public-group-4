import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Show Details — MediaRate",
};

export default async function TVDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // TODO: Fetch TV show details from the backend using the id
  // Example: const show = await apiGet<ShowDetail>(`/shows/${id}`);

  return (
    <div className="pt-16 px-4 sm:px-8 pb-16 max-w-7xl mx-auto">
      <p className="text-neutral-400">TV show detail page for ID: {id}</p>
    </div>
  );
}
