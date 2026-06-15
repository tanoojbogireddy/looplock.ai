import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

type Strictness = "Trim Only" | "Balanced" | "Hyper-Short";

type StreamedAiOutput = {
  toolArguments: string;
  content: string;
  rawSse: string;
  finishReason?: string;
};

function stripJsonMarkdown(raw: string): string {
  return raw
    .replace(/^\uFEFF/, "")
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();
}

function extractJsonCandidate(raw: string): string {
  const cleaned = stripJsonMarkdown(raw);
  if (!cleaned) throw new Error("AI returned empty structured output");
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // Continue to boundary extraction below.
  }

  const objectStart = cleaned.indexOf("{");
  const arrayStart = cleaned.indexOf("[");
  const useArray = arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart);
  const start = useArray ? arrayStart : objectStart;
  const end = useArray ? cleaned.lastIndexOf("]") : cleaned.lastIndexOf("}");

  if (start === -1) throw new Error("No valid JSON structure found in AI response");
  if (end <= start) throw new Error("AI response was cut off before the JSON completed");
  return cleaned.slice(start, end + 1).trim();
}

function parseAiJson<T>(raw: string): T {
  let candidate = "";
  try {
    candidate = extractJsonCandidate(raw);
    return JSON.parse(candidate) as T;
  } catch (error) {
    console.error("Failed to parse AI structured output", {
      rawResponse: raw,
      sanitizedResponse: candidate,
      error,
    });
    const message = error instanceof Error && error.message.includes("cut off")
      ? "AI response was cut off before it finished. Try a shorter script."
      : "AI returned invalid or incomplete structured output";
    throw new Error(message);
  }
}

async function readStreamedStructuredOutput(res: Response): Promise<StreamedAiOutput> {
  if (!res.body) return { toolArguments: "", content: "", rawSse: "" };
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let toolArguments = "";
  let content = "";
  let rawSse = "";
  let finishReason: string | undefined;

  const consumeLine = (rawLine: string) => {
    const line = rawLine.trim();
    if (!line.startsWith("data:")) return;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") return;
    try {
      const chunk = JSON.parse(data);
      const choice = chunk?.choices?.[0];
      if (typeof choice?.finish_reason === "string") finishReason = choice.finish_reason;

      const delta = choice?.delta;
      const toolCalls = delta?.tool_calls;
      if (Array.isArray(toolCalls)) {
        for (const tc of toolCalls) {
          const piece = tc?.function?.arguments;
          if (typeof piece === "string") toolArguments += piece;
        }
      }

      const legacyArgs = delta?.function_call?.arguments;
      if (typeof legacyArgs === "string") toolArguments += legacyArgs;
      if (typeof delta?.content === "string") content += delta.content;

      const message = choice?.message;
      const fallbackArgs = message?.tool_calls?.[0]?.function?.arguments;
      if (typeof fallbackArgs === "string" && fallbackArgs.length > toolArguments.length) {
        toolArguments = fallbackArgs;
      }
      if (typeof message?.content === "string" && message.content.length > content.length) {
        content = message.content;
      }
    } catch {
      // Skip malformed SSE fragments; the raw stream is logged if final parsing fails.
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const decoded = decoder.decode(value, { stream: true });
    rawSse += decoded;
    buffer += decoded;
    let nl;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const rawLine = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      consumeLine(rawLine);
    }
  }
  const trailing = decoder.decode();
  if (trailing) {
    rawSse += trailing;
    buffer += trailing;
  }
  if (buffer.trim()) consumeLine(buffer);
  return { toolArguments, content, rawSse, finishReason };
}

function strictnessDirective(s: Strictness): string {
  if (s === "Trim Only")
    return "- Target: EXACTLY ~12% word reduction, 135 WPM (cinematic), conservative polish only: remove filler, preserve sentence order and most wording.";
  if (s === "Hyper-Short")
    return "- Target: EXACTLY ~59% word reduction, 160 WPM (retention-max), aggressive sentence stripping: short fragments, punch verbs, no soft setup.";
  return "- Target: EXACTLY ~28% word reduction, 145 WPM (energetic), sharp narrative hook metrics: tighter clauses, stronger contrast, clear emotional beats.";
}

function buildSystemPrompt(s: Strictness): string {
  return `You are an elite short-form video Script Doctor (YouTube Shorts, TikTok, Reels).

DETECT FIRST — before writing anything:
1. INPUT LANGUAGE/STYLE: Pure Hindi (Devanagari), Hinglish (Latin), Tanglish, Telugu, Spanish, French, English, code-mix, etc. Lock onto the exact style.
2. NICHE: Finance, Real Estate, Tech, Lifestyle, Music, Political, Fitness, Food, Education, etc.

LANGUAGE RULE (non-negotiable):
• retaining_remedy, corrected_line, full_rewritten_script → EXACT same language/script as input. NEVER translate.
• All metadata fields (flagged_weakness, why_it_works, score_justification, plain_summary, problem_plain, fix_plain, original_drop_reason, optimized_summary, camera_framing, b_roll_sound_fx, editing_technique) → clean English.

STRICTNESS MODE: ${s}
${strictnessDirective(s)}
• Output text volume MUST reflect this strictness. Different modes must produce materially different word counts and pacing.

FORMAT LOCK (absolute):
• Return ONLY one complete valid JSON object via the emit_retention_audit tool.
• No markdown, no fences, no text outside the JSON. Must be parseable by JSON.parse with zero cleanup.

CHART DATA:
• original_chart_data + optimized_chart_data: exactly 11 integers 0-100 for [0s,3s,6s,9s,12s,15s,18s,21s,24s,27s,30s].
• original_chart_data: realistic drop near the weak hook, floor 10-30%.
• optimized_chart_data: plateau 75-95% after the improved hook stabilizes.
• original_drop_second: integer 1-30 of the first major viewer drop.

PLAIN LANGUAGE (write for a 15-year-old, zero jargon):
• video_score: integer 1-10.
• score_justification: ONE sentence, max 22 words, cite the specific drop second or filler density.
• plain_summary, problem_plain, fix_plain: ONE short sentence each.

SCRIPT DOCTOR — 2 to 4 rows, only the weakest lines:
• flagged_weakness: specific flaw — e.g. "Passive voice + 9 words slows processing 23%", "Vague opener lacks urgency word", "Run-on 14+ words raises drop-off rate".
• retaining_remedy: exact rewrite in INPUT LANGUAGE. Active voice. ≤15 words. Must include one urgency word (stop/never/secret/warning) OR contrast word (everyone/nobody/don't) OR pattern word (ways/tips/reasons).
• why_it_works: cite specific viewer psychology or neuroscience. Be concrete, not generic.

EDITING MATRIX — exactly 3 to 5 rows, one per key spoken beat:
• corrected_line: optimized line in INPUT LANGUAGE.
• editing_technique: locked to strictness — ${s === "Hyper-Short" ? "rapid jump-cuts, flash-frames, sub-2s cuts" : s === "Trim Only" ? "cinematic pans, smooth transitions, 6-8s holds" : "punch-in cuts, 3-5s rhythm changes"}.
• camera_framing + b_roll_sound_fx: 100% niche-specific. Zero generic placeholders.

FULL SCRIPT:
• full_rewritten_script: complete rewritten script in shoot order, line breaks between lines, INPUT LANGUAGE only. No headings or notes.`;
}

const TOOL = {
  type: "function" as const,
  function: {
    name: "emit_retention_audit",
    description: "Emit the retention audit payload.",
    parameters: {
      type: "object",
      properties: {
        analysis: {
          type: "object",
          properties: {
            video_score: { type: "number", minimum: 1, maximum: 10 },
            score_justification: { type: "string" },
            plain_summary: { type: "string" },
            problem_plain: { type: "string" },
            fix_plain: { type: "string" },
            original_drop_second: { type: "number" },
            original_drop_reason: { type: "string" },
            original_chart_data: { type: "array", items: { type: "number" }, minItems: 11, maxItems: 11 },
            optimized_chart_data: { type: "array", items: { type: "number" }, minItems: 11, maxItems: 11 },
            optimized_summary: { type: "string" },
          },
          required: ["video_score", "score_justification", "plain_summary", "problem_plain", "fix_plain", "original_drop_second", "original_drop_reason", "original_chart_data", "optimized_chart_data", "optimized_summary"],
          additionalProperties: false,
        },
        script_doctor: {
          type: "array",
          items: {
            type: "object",
            properties: {
              flagged_weakness: { type: "string" },
              retaining_remedy: { type: "string" },
              why_it_works: { type: "string" },
            },
            required: ["flagged_weakness", "retaining_remedy", "why_it_works"],
            additionalProperties: false,
          },
        },
        editing_matrix: {
          type: "array",
          items: {
            type: "object",
            properties: {
              corrected_line: { type: "string" },
              camera_framing: { type: "string" },
              b_roll_sound_fx: { type: "string" },
              editing_technique: { type: "string" },
            },
            required: ["corrected_line", "camera_framing", "b_roll_sound_fx", "editing_technique"],
            additionalProperties: false,
          },
        },
        full_rewritten_script: { type: "string" },
      },
      required: ["analysis", "script_doctor", "editing_matrix", "full_rewritten_script"],
      additionalProperties: false,
    },
  },
};

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as {
            script?: unknown;
            strictness?: unknown;
          };
          const script = typeof body.script === "string" ? body.script.trim() : "";
          const strictness: Strictness =
            body.strictness === "Trim Only" || body.strictness === "Hyper-Short"
              ? body.strictness
              : "Balanced";
          if (!script || script.length < 10) {
            return new Response(JSON.stringify({ error: "Script too short" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // On Lovable's platform LOVABLE_API_KEY is auto-injected; locally use GEMINI_API_KEY.
          const lovableKey = process.env.LOVABLE_API_KEY;
          const geminiKey = process.env.GEMINI_API_KEY;
          const apiKey = lovableKey || geminiKey;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "No AI API key configured. Set GEMINI_API_KEY in your .env file." }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
          const aiEndpoint = lovableKey
            ? "https://ai.gateway.lovable.dev/v1/chat/completions"
            : "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
          const aiModel = lovableKey ? "google/gemini-2.5-flash" : "gemini-2.5-flash";

          const aiRes = await fetch(aiEndpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: aiModel,
              messages: [
                { role: "system", content: buildSystemPrompt(strictness) },
                { role: "user", content: `STRICTNESS MODE: ${strictness}\n\nAudit and rewrite this script:\n\n${script}` },
              ],
              tools: [TOOL],
              tool_choice: { type: "function", function: { name: "emit_retention_audit" } },
              temperature: 0,
              max_tokens: 8192,
              stream: true,
            }),
          });

          if (!aiRes.ok) {
            if (aiRes.status === 429) {
              return new Response(JSON.stringify({ error: "Rate limit hit. Try again in a moment." }), {
                status: 429,
                headers: { "Content-Type": "application/json" },
              });
            }
            if (aiRes.status === 402) {
              return new Response(JSON.stringify({ error: "AI credits exhausted. Top up your workspace." }), {
                status: 402,
                headers: { "Content-Type": "application/json" },
              });
            }
            const t = await aiRes.text();
            console.error("AI gateway error", aiRes.status, t);
            return new Response(JSON.stringify({ error: "AI gateway failure" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const streamed = await readStreamedStructuredOutput(aiRes);
          const rawStructuredOutput = streamed.toolArguments || streamed.content;
          if (!rawStructuredOutput) {
            console.error("AI returned no structured output", {
              finishReason: streamed.finishReason,
              rawSse: streamed.rawSse,
            });
            return new Response(JSON.stringify({ error: "AI returned empty structured output. Please try again." }), {
              status: 502,
              headers: { "Content-Type": "application/json" },
            });
          }
          if (streamed.finishReason === "length") {
            console.error("AI structured output was truncated", { rawResponse: rawStructuredOutput });
            return new Response(JSON.stringify({ error: "AI response was cut off before it finished. Try a shorter script." }), {
              status: 502,
              headers: { "Content-Type": "application/json" },
            });
          }

          const parsed = parseAiJson(rawStructuredOutput);
          return new Response(JSON.stringify(parsed), {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store, max-age=0",
            },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
