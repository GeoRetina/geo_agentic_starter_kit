"use client";

import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from "react";

import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChat({ isOpen, onClose }: AIChatProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    stop,
  } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome-ai",
        content:
          "Hello! I'm your geospatial AI assistant. How can I help with your maps and spatial analysis?",
        role: "assistant",
      },
    ],
  });

  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleCloseAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleFormSubmitWrapper = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    originalHandleSubmit(e);
  };

  const handleKeyDownWrapper = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim()) return;
      originalHandleSubmit(e as any);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 right-8 z-[100] w-[380px] max-w-[calc(100vw-1rem)] h-[500px] flex flex-col",
        "bg-background border border-border shadow-xl rounded-lg",
        "transition-all duration-300 ease-out",
        isOpen
          ? "opacity-100 translate-y-0 animate-fade-in-up"
          : "opacity-0 translate-y-8 animate-fade-out-down",
        isClosing && "opacity-0 translate-y-8 animate-fade-out-down"
      )}
    >
      <ChatHeader onClose={handleCloseAnimation} />
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmitWrapper}
        isLoading={isLoading}
        stop={stop}
        inputRef={inputRef}
        handleKeyDown={handleKeyDownWrapper}
      />
    </div>
  );
}
