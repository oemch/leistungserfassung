import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg
        width="180"
        height="180"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="16" fill="#22c55e" />
        <line x1="16" y1="16" x2="16" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="16" x2="22" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="1.5" fill="white" />
      </svg>
    ),
    { ...size }
  );
}
