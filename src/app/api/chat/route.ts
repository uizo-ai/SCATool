// app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { z } from "zod";

export const runtime = "edge";

const BodySchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string() })),
  studentProfile: z
    .object({
      firstGen: z.boolean().optional(),
      identityNotes: z.string().optional(),
      interests: z.array(z.string()).optional(),
      confidence: z.enum(["low", "medium", "high"]).optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { messages, studentProfile } = BodySchema.parse(json);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const profileStr = studentProfile
      ? `\n\nSTUDENT CONTEXT (use this to personalize your coaching approach):\n${JSON.stringify(studentProfile, null, 2)}\n\nRemember to tailor your advice based on their confidence level, first-gen status, interests, and any constraints they've shared.`
      : "";

    const sys = [{ role: "system" as const, content: SYSTEM_PROMPT + profileStr }];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      temperature: 0.7,
      messages: [...sys, ...messages],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content ?? "";
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
