"use client";

interface ProfileHeaderProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function ProfileHeader({
  name,
  email,
  image,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {image ? (
        <img
          src={image}
          alt={name ?? "Avatar"}
          className="w-20 h-20 rounded-full ring-2 ring-amber-400"
        />
      ) : (
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ring-2 ring-amber-400"
          style={{
            backgroundColor: "var(--profile-avatar-bg)",
            color: "var(--profile-avatar-text)",
          }}
        >
          {(name ?? "U")[0].toUpperCase()}
        </div>
      )}
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: "var(--profile-text)" }}>
          {name ?? "User"}
        </h1>
        {email && (
          <p className="text-sm mt-0.5" style={{ color: "var(--profile-text-muted)" }}>
            {email}
          </p>
        )}
      </div>
    </div>
  );
}
