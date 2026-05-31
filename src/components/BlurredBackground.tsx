export default function BlurredBackground({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 blur-[100px] scale-110 saturate-150"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, transparent 0%, var(--gradient-overlay-via) 40%, var(--gradient-overlay-dark) 100%)",
        }}
      />
    </div>
  );
}
