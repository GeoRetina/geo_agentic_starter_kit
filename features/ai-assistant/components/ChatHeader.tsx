"use client";

import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-border shrink-0">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        AI Assistant
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close Chat</span>
      </Button>
    </div>
  );
}
