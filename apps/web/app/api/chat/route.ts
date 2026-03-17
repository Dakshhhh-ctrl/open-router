import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "OpenRouter Chat",
  },
});

export async function POST(req: NextRequest) {
  try {
    const { messages, model, systemPrompt, userName } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not set. Please add it to your .env.local file." },
        { status: 500 }
      );
    }

    const systemMessage = systemPrompt
      ? `${systemPrompt}${userName ? `\n\nThe user's name is ${userName}. Address them by name occasionally to make the conversation feel personal.` : ""}`
      : userName
      ? `You are a helpful AI assistant. The user's name is ${userName}. Address them by name occasionally to make the conversation feel personal.`
      : "You are a helpful AI assistant.";

    const stream = await client.chat.completions.create({
      model: model || "openai/gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        ...messages,
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
