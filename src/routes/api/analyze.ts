import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are a data-driven short-form video attention optimization model.
Scan the script for the 3-second hook bottleneck, filler-word density, and pacing violations.
Evaluate linguistic pacing rules: sentence length cadence, pattern interrupts, sensory verbs, CTA strength.
Return ONLY structured data via the provided tool. No prose, no markdown.

Rules for chart data:
- Both original_chart_data and optimized_chart_data must be exactly 11 integers, each 0-100.
- They represent retention % at timestamps [0s, 3s, 6s, 9s, 12s, 15s, 18s, 21s, 24s, 27s, 30s].
- original_chart_data should show a sharp drop near the weak hook (typical floor 10-25%).
- optimized_chart_data should plateau in the 80-95% range after stabilizing.
- original_drop_second is the second (1-30) where the first major drop occurs.

Produce 2-4 script_doctor swaps and 3-6 editing_matrix rows.`;

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
            original_drop_second: { type: "number" },
            original_drop_reason: { type: "string" },
            original_chart_data: { type: "array", items: { type: "number" }, minItems: 11, maxItems: 11 },
            optimized_chart_data: { type: "array", items: { type: "number" }, minItems: 11, maxItems: 11 },
            optimized_summary: { type: "string" },
          },
          required: ["original_drop_second", "original_drop_reason", "original_chart_data", "optimized_chart_data", "optimized_summary"],
          additionalProperties: false,
        },
        script_doctor: {
          type: "array",
          items: {
            type: "object",
            properties: {
              flagged_weakness: { type: "string" },
              retaining_remedy: { type: "string" },
            },
            required: ["flagged_weakness", "retaining_remedy"],
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
            },
            required: ["corrected_line", "camera_framing", "b_roll_sound_fx"],
            additionalProperties: false,
          },
        },
      },
      required: ["analysis", "script_doctor", "editing_matrix"],
      additionalProperties: false,
    },
  },
};

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as { script?: unknown };
          const script = typeof body.script === "string" ? body.script.trim() : "";
          if (!script || script.length < 10) {
            return new Response(JSON.stringify({ error: "Script too short" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Audit this script:\n\n${script}` },
              ],
              tools: [TOOL],
              tool_choice: { type: "function", function: { name: "emit_retention_audit" } },
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

          const payload = await aiRes.json();
          const toolCall = payload?.choices?.[0]?.message?.tool_calls?.[0];
          const argsStr = toolCall?.function?.arguments;
          if (!argsStr) {
            return new Response(JSON.stringify({ error: "AI returned no structured output" }), {
              status: 502,
              headers: { "Content-Type": "application/json" },
            });
          }
          const parsed = JSON.parse(argsStr);
          return Response.json(parsed);
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
