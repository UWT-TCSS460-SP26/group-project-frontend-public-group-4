import MediaCard from "@/components/MediaCard";

import type { MediaItem } from "@/types/media";

interface MediaGridProps {
  items: MediaItem[];
  getItemHref?: (item: MediaItem) => string;
}

export default function MediaGrid({ items, getItemHref }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-neutral-400 text-center py-20">
        Nothing to show right now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} href={getItemHref?.(item)} />
      ))}
    </div>
  );
}
