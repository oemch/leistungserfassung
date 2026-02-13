import type { Entry } from "@/lib/types";

interface TaskChipProps extends Pick<Entry, "text" | "bg" | "fg"> {}

export function TaskChip({ text, bg, fg }: TaskChipProps) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded truncate block"
      style={{ backgroundColor: bg, color: fg }}
      title={text}
    >
      {text}
    </span>
  );
}
