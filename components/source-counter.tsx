"use client";

import { FileText } from "lucide-react";

interface SourceCounterProps {
  totalSources: number;
  sourceLimit: number;
}

export function SourceCounter({
  totalSources,
  sourceLimit,
}: SourceCounterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Source limit
        </div>
        <span>
          {totalSources} / {sourceLimit}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: `${Math.min((totalSources / sourceLimit) * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
