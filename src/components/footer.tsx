"use client";

export default function Footer() {
  const handleOpenHelp = () => {
    window.dispatchEvent(new CustomEvent("shortcut:open-help"));
  };

  return (
    <footer
      className="mt-auto border-t py-3 px-4 text-center text-xs"
      style={{
        borderColor: "var(--header-border)",
        color: "var(--text-secondary)",
      }}
    >
      <button
        onClick={handleOpenHelp}
        className="underline underline-offset-2 hover:opacity-80 transition-opacity"
        style={{ color: "var(--primary-color)" }}
      >
        Keyboard Shortcuts
      </button>
    </footer>
  );
}
