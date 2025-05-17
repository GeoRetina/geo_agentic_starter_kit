"use client";

import { cn } from "@/lib/utils";
import { Message } from "ai/react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col max-w-[85%] rounded-md py-2 px-3 text-sm leading-relaxed shadow-sm",
        message.role === "user"
          ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
          : "mr-auto bg-muted text-foreground rounded-bl-none",
        "transition-all duration-150 ease-in-out"
      )}
    >
      <div className="whitespace-pre-wrap break-words">{message.content}</div>
    </div>
  );
}
