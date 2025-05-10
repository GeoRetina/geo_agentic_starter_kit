import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import {
  MAX_DURATION,
  SYSTEM_MESSAGE,
} from "@/features/ai-assistant/lib/constants";

export const maxDuration = MAX_DURATION;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4.1"), // You can change the model here if needed
    system: SYSTEM_MESSAGE,
    messages,
  });

  return result.toDataStreamResponse();
}
