import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info, ChevronRight } from "lucide-react";
import type { Signal } from "./types";
import { sortSignalsByPriority, getSignalTypeClasses } from "./status-rules";

interface SignalsListProps {
  signals: Signal[];
  onSignalClick?: (signal: Signal) => void;
  maxItems?: number;
}

export function SignalsList({ signals, onSignalClick, maxItems = 5 }: SignalsListProps) {
  const sortedSignals = sortSignalsByPriority(signals).slice(0, maxItems);

  const getSignalIcon = (type: Signal["type"]) => {
    switch (type) {
      case "critical":
        return AlertCircle;
      case "warning":
        return AlertTriangle;
      case "info":
        return Info;
    }
  };

  if (sortedSignals.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Governance Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
            No active signals - all metrics within thresholds
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Governance Signals
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {sortedSignals.length} active
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {sortedSignals.map((signal) => {
            const Icon = getSignalIcon(signal.type);
            const classes = getSignalTypeClasses(signal.type);

            return (
              <button
                key={signal.id}
                className={cn(
                  "w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors group",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                )}
                onClick={() => onSignalClick?.(signal)}
              >
                <div className={cn("p-1.5 rounded-md mt-0.5", classes.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", classes.icon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{signal.message}</p>
                  {signal.ffrdcId && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      FFRDC: {signal.ffrdcId.toUpperCase()}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


