import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4.1"), // You can change the model here if needed
    system:
      "You are a helpful geospatial AI assistant. Your primary goal is to assist users with their questions related to maps, spatial analysis, and geographical data. Be concise and informative in your responses.",
    messages,
  });

  return result.toDataStreamResponse();
}
