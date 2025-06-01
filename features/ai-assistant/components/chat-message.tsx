"use client";

import { cn } from "@/lib/utils";
import { Message } from "ai/react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const toolInvocationParts =
    message.parts?.filter((part) => part.type === "tool-invocation") || [];

  const textParts = message.parts?.filter((part) => part.type === "text") || [];

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
      {toolInvocationParts.length > 0 && (
        <div className="mb-2 pb-2 border-b border-border/50">
          {/* Ensure part is of type 'tool-invocation' before accessing toolInvocation properties */}
          {toolInvocationParts.map(
            (part) =>
              part.type === "tool-invocation" && (
                <div
                  key={part.toolInvocation.toolCallId}
                  className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5"
                >
                  <span>
                    Tool called: <strong>{part.toolInvocation.toolName}</strong>
                  </span>
                </div>
              )
          )}
        </div>
      )}
      {textParts.map((part, index) => (
        <div key={`text-${index}`} className="whitespace-pre-wrap break-words">
          {part.type === "text" && part.text}
        </div>
      ))}
      {/* Fallback for message.content if no text parts and message.content exists */}
      {textParts.length === 0 && message.content && (
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      )}
    </div>
  );
}
