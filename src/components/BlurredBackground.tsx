export default function BlurredBackground({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 blur-[100px] scale-110 saturate-150"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/80 to-neutral-950" />
    </div>
  );
}
