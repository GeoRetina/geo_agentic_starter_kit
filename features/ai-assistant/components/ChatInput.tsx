"use client";

import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import React from "react";

interface ChatInputProps {
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function ChatInput({
  input,
  handleInputChange,
  handleFormSubmit,
  isLoading,
  stop,
  inputRef,
  handleKeyDown,
}: ChatInputProps) {
  return (
    <div className="p-3 border-t border-border bg-background/80 backdrop-blur-sm shrink-0">
      <form onSubmit={handleFormSubmit} className="flex items-end space-x-2">
        <Textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI Assistant..."
          className={cn(
            "flex-1 resize-none min-h-10 max-h-32 p-2.5 pr-10",
            "border-border bg-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary rounded-md shadow-sm",
            "text-sm placeholder:text-muted-foreground"
          )}
          disabled={isLoading}
        />
        {isLoading ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={stop}
            className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10 rounded-md h-10 w-10 shadow-sm transition-colors duration-150"
            aria-label="Stop generating"
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className={cn(
              "shrink-0 rounded-md h-10 w-10 shadow-sm transition-colors duration-150",
              input.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
