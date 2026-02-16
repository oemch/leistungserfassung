"use client";

interface FabProps {
  onClick: () => void;
}

export function Fab({ onClick }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 flex h-[40px] w-[40px] items-center justify-center rounded-full shadow-lg transition-opacity hover:opacity-90"
      style={{ backgroundColor: "var(--figma-primary)", color: "#FFFFFF" }}
      aria-label="Zeiterfassung öffnen"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  );
}
