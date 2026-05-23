interface CommunityStatsProps {
  community: {
    averageRating: number | null;
    reviewCount: number;
  };
}

export default function CommunityStats({ community }: CommunityStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-neutral-800/80 rounded-lg flex flex-col items-center justify-center p-3 text-center border border-neutral-700/50">
        <span className="text-xs text-neutral-400 font-medium mb-1">
          Avg Rating
        </span>
        <span className="text-2xl font-bold text-amber-400">
          {community.averageRating ? community.averageRating.toFixed(1) : "—"}
        </span>
      </div>
      <div className="bg-neutral-800/80 rounded-lg flex flex-col items-center justify-center p-3 text-center border border-neutral-700/50">
        <span className="text-xs text-neutral-400 font-medium mb-1">
          Reviews
        </span>
        <span className="text-2xl font-bold text-blue-400">
          {community.reviewCount}
        </span>
      </div>
    </div>
  );
}
