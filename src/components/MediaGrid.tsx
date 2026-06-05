import MediaCard from "@/components/MediaCard";

import type { MediaItem } from "@/types/media";

interface MediaGridProps {
  items: MediaItem[];
  getItemHref?: (item: MediaItem) => string;
  priorityCount?: number;
}

export default function MediaGrid({
  items,
  getItemHref,
  priorityCount = 0,
}: MediaGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-center py-20" style={{ color: "var(--text-muted)" }}>
        Nothing to show right now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 lg:gap-8">
      {items.map((item, index) => (
        <MediaCard
          key={item.id}
          item={item}
          href={getItemHref?.(item)}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
