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
        <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400 text-3xl font-bold ring-2 ring-amber-400">
          {(name ?? "U")[0].toUpperCase()}
        </div>
      )}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-100">{name ?? "User"}</h1>
        {email && <p className="text-sm text-zinc-500 mt-0.5">{email}</p>}
      </div>
    </div>
  );
}
