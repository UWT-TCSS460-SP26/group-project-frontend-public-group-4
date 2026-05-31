import MediaCard from "@/components/MediaCard";

import type { MediaItem } from "@/types/media";

interface MediaGridProps {
  items: MediaItem[];
  getItemHref?: (item: MediaItem) => string;
}

export default function MediaGrid({ items, getItemHref }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-center py-20" style={{ color: "var(--text-muted)" }}>
        Nothing to show right now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))] gap-4">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} href={getItemHref?.(item)} />
      ))}
    </div>
  );
}
