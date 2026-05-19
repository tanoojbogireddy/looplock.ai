import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const ReplacementSchema = z.object({
  wrong: z.string(),
  right: z.string(),
});

const MatrixRowSchema = z.object({
  time: z.string(),
  line: z.string(),
  lineRoman: z.string(),
  directive: z.string(),
});

const HookSchema = z.object({
  label: z.string(),
  text: z.string(),
});

const AnalysisSchema = z.object({
  language: z.string(),
  platform: z.string(),
  style: z.string(),
  dropOffRisk: z.number().min(0).max(10),
  watchTimeLift: z.string(),
  fillerReduction: z.string(),
  hookCount: z.number(),
  cutCount: z.number(),
  fluffDiagnosis: z.string(),
  hooks: z.array(HookSchema).min(3).max(3),
  replacements: z.array(ReplacementSchema).min(3).max(10),
  matrix: z.array(MatrixRowSchema).min(5).max(10),
});

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as { script?: unknown };
          const script = typeof body.script === "string" ? body.script.trim() : "";
          if (!script || script.length < 10) {
            return new Response(JSON.stringify({ error: "Script too short" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          if (script.length > 8000) {
            return new Response(JSON.stringify({ error: "Script too long (max 8000 chars)" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const key = process.env.LOVABLE_API_KEY;
          if (!key) {
            return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("google/gemini-3-flash-preview");

          const system = `You are an elite short-form video retention strategist. You take raw scripts (any language: English, Telugu, Hindi, Spanish, Hinglish, etc.) and convert them into a high-retention production blueprint optimized for Instagram Reels / TikTok / YouTube Shorts.

You MUST respond in the SAME language as the input script. Detect the language from the actual text content (script characters, words) — never default. Preserve native script (Telugu/Devanagari/etc).

Output strict JSON matching the provided schema:
- language: detected language name (e.g. "Telugu", "English", "Hindi", "Spanish")
- platform: best target platform ("Instagram Reels", "TikTok", "YouTube Shorts")
- style: a punchy style label (e.g. "High-Energy Viral", "Quiet Authority", "Story-Driven")
- dropOffRisk: 0-10 integer rating of how likely viewers swipe away from the ORIGINAL script
- watchTimeLift: e.g. "+312% Watch-Time" — your honest estimate
- fillerReduction: e.g. "-68%"
- hookCount: number of new hooks generated (always 3)
- cutCount: number of cuts in the matrix
- fluffDiagnosis: 1-2 sentence diagnosis of why the original loses viewers (in the input language)
- hooks: EXACTLY 3 rewritten viral hooks. Labels MUST be "Negative Frame", "Curiosity Gap", "In Medias Res". Text in input language.
- replacements: 5-8 line-by-line fixes. Each {wrong: exact fluffy phrase from original, right: optimized punchy rewrite}. Both in input language.
- matrix: 6-8 timestamped beats. {time: "0:00", "0:03", ... incremented by 3-5 sec; line: the spoken line in input language; lineRoman: romanized transliteration if non-Latin script else ""; directive: vivid visual+audio+pacing cue (cuts, zooms, SFX, captions, b-roll)}

Be specific, punchy, and ruthless. No generic advice.`;

          const { output } = await generateText({
            model,
            system,
            prompt: `Raw script:\n\n${script}`,
            output: Output.object({ schema: AnalysisSchema }),
          });

          return Response.json(output);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          const status = /rate.?limit|429/i.test(message)
            ? 429
            : /402|credit/i.test(message)
              ? 402
              : 500;
          return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});