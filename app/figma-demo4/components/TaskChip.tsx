interface TaskChipProps {
  label: string;
  className?: string;
}

export function TaskChip({ label, className = "" }: TaskChipProps) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs truncate max-w-full ${className}`}
      title={label}
    >
      {label}
    </span>
  );
}
