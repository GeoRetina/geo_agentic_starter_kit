"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalysisResultProps {
  isVisible: boolean;
  title: string;
  value: string | number | null;
  unit?: string;
  onClose: () => void;
}

export function AnalysisResult({
  isVisible,
  title,
  value,
  unit = "",
  onClose,
}: AnalysisResultProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute top-4 left-4 z-20 w-full max-w-xs animate-in slide-in-from-left-5 duration-300">
      <Card className="shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
        <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-primary/80 via-primary to-primary/60"></div>
        <CardHeader className="pb-2 pt-4 px-5 flex justify-between flex-row items-center space-y-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        <CardContent className="px-5 pb-4 pt-1">
          <div
            className={cn(
              "text-lg font-semibold",
              "bg-gradient-to-r from-primary to-blue-500 dark:from-blue-400 dark:to-primary bg-clip-text text-transparent"
            )}
          >
            {value !== null ? `${value}${unit ? ` ${unit}` : ""}` : "N/A"}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Calculated result
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
