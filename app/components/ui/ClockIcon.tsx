/** Uhr-Icon: ausgefüllter Kreis mit weissen Zeigern, Farbe über fill/currentColor. */
export function ClockIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="16" cy="16" r="16" fill="currentColor" />
      <line x1="16" y1="16" x2="16" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="16" x2="22" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="1.5" fill="white" />
    </svg>
  );
}
