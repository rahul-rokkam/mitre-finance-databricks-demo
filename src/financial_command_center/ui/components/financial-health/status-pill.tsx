import { cn } from "@/lib/utils";
import type { Status } from "./types";
import { getStatusColorClasses, getStatusLabel } from "./status-rules";

interface StatusPillProps {
  status: Status;
  className?: string;
  showLabel?: boolean;
}

export function StatusPill({ status, className, showLabel = true }: StatusPillProps) {
  const colors = getStatusColorClasses(status);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        colors.bg,
        colors.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
      {showLabel && <span>{getStatusLabel(status)}</span>}
    </div>
  );
}


