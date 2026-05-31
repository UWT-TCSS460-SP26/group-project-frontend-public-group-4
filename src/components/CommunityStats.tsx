interface CommunityStatsProps {
  community: {
    averageRating: number | null;
    reviewCount: number;
  };
}

export default function CommunityStats({ community }: CommunityStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div
        className="rounded-lg flex flex-col items-center justify-center p-3 text-center border"
        style={{
          backgroundColor: "var(--surface-bg)",
          borderColor: "var(--surface-border)",
        }}
      >
        <span className="text-xs font-medium mb-1" style={{ color: "var(--surface-text-muted)" }}>
          Avg Rating
        </span>
        <span className="text-2xl font-bold" style={{ color: "var(--primary-color)" }}>
          {community.averageRating ? community.averageRating.toFixed(1) : "\u2014"}
        </span>
      </div>
      <div
        className="rounded-lg flex flex-col items-center justify-center p-3 text-center border"
        style={{
          backgroundColor: "var(--surface-bg)",
          borderColor: "var(--surface-border)",
        }}
      >
        <span className="text-xs font-medium mb-1" style={{ color: "var(--surface-text-muted)" }}>
          Reviews
        </span>
        <span className="text-2xl font-bold" style={{ color: "var(--primary-hover)" }}>
          {community.reviewCount}
        </span>
      </div>
    </div>
  );
}
