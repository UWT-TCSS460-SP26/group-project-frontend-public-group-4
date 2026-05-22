export default function MediaActionButtons() {
  return (
    <div className="flex flex-col gap-2">
      <button
        disabled
        className="w-full bg-blue-600/50 text-white py-2.5 px-4 rounded font-semibold cursor-not-allowed opacity-70 transition-opacity hover:opacity-100"
      >
        Sign in to Rate
      </button>
      <button
        disabled
        className="w-full bg-neutral-700/50 text-white py-2.5 px-4 rounded font-semibold cursor-not-allowed opacity-70 transition-opacity hover:opacity-100"
      >
        Sign in to Review (Coming Soon)
      </button>
    </div>
  );
}
