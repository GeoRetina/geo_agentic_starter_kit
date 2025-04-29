"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="absolute top-4 left-4 z-20 w-full max-w-xs">
      <Card className="shadow-lg">
        <CardHeader className="pb-2 pt-4 px-4 flex justify-between flex-row items-center space-y-0">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="text-lg font-semibold text-blue-600 dark:text-blue-300">
            {value !== null ? `${value}${unit ? ` ${unit}` : ""}` : "N/A"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
