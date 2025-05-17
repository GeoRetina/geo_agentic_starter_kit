"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "ai/react";
import { ChatMessage } from "./chat-message";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  // messagesEndRef: React.RefObject<HTMLDivElement>; // Pass ref if needed for external scroll control
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <ScrollArea className="flex-1 overflow-y-auto">
      <div className="space-y-3 p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center space-x-2 max-w-[85%] rounded-md py-2 px-3 mr-auto bg-muted text-muted-foreground">
              <div className="flex space-x-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></div>
              </div>
            </div>
          )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
