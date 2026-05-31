import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

type Strictness = "Trim Only" | "Balanced" | "Hyper-Short";

function strictnessDirective(s: Strictness): string {
  if (s === "Trim Only")
    return "- Target: 12% word reduction, 135 WPM (cinematic), keep flow intact, remove only filler.";
  if (s === "Hyper-Short")
    return "- Target: 59% word reduction, 160 WPM (retention-max), every word earns its place, aggressive hooks.";
  return "- Target: 28% word reduction, 145 WPM (energetic), tighten hooks, improve emotional beats.";
}

function buildSystemPrompt(s: Strictness): string {
  return `You are a Script Doctor for short-form video creators (YouTube Shorts, TikTok, Instagram Reels). Your job is to rewrite weak lines into retention-killing powerhouses, audit the script's retention curve, and brief the editor.

STRICTNESS MODE: ${s}
${strictnessDirective(s)}

Return ONLY structured data via the provided tool. No prose, no markdown.

CHART DATA RULES:
- Both original_chart_data and optimized_chart_data must be exactly 11 integers, each 0-100.
- They represent retention % at timestamps [0s, 3s, 6s, 9s, 12s, 15s, 18s, 21s, 24s, 27s, 30s].
- original_chart_data should show a sharp drop near the weak hook (typical floor 10-25%).
- optimized_chart_data should plateau in the 80-95% range after stabilizing.
- original_drop_second is the second (1-30) where the first major drop occurs.

PLAIN-LANGUAGE RULES (explain like to a 15-year-old, NO jargon):
- video_score: integer 1-10 rating the script's retention quality.
- score_justification: ONE data-backed sentence citing the specific drop second / filler density / hook weakness. Max 22 words.
- plain_summary: ONE short sentence in plain English summarizing what will happen with viewers.
- problem_plain: ONE short sentence describing what's going wrong, no technical terms.
- fix_plain: ONE short sentence describing the improvement after the rewrite.

SCRIPT DOCTOR RULES (produce 2-5 rows for the weakest lines):
- flagged_weakness: a SPECIFIC weakness (not generic). Examples:
  • 'Passive voice + 9 words = 23% slower processing speed in viewer brains'
  • 'Vague phrase "some things" = removes urgency perception'
  • 'Hook lacks contrast words (everyone/nobody/don't) = lower curiosity gap'
  • 'Run-on sentence (14+ words) = 31% higher drop-off rate'
- retaining_remedy: the exact rewrite — active voice (creator/viewer as subject), under 12 words for hook lines, under 15 for body, contains ONE pattern word (ways/tips/reasons) OR urgency word (never/stop/secret/warning) OR contrast word (everyone/don't), simple 6th-grade vocabulary, no jargon. Honor the STRICTNESS MODE word-reduction target.
- why_it_works: explain via VIEWER PSYCHOLOGY or NEUROSCIENCE, not generic praise. Examples:
  • 'Active voice = 12% higher engagement because viewers' mirror neurons activate (subconscious identification).'
  • 'Word "blocked" triggers FOMO = amygdala activation = 8% longer watch-time.'
  • 'Shorter sentences = faster comprehension = less cognitive load = higher retention likelihood.'
  • 'Urgency words in first 3 seconds = 2.8x hook effectiveness (eye-tracking studies).'
  • 'Contrast structure (Everyone does X, but you...) = curiosity gap = 15% lower drop-off.'

EDITING MATRIX RULES (produce one row per spoken line of the rewritten script, 3-8 rows):
- corrected_line: the rewritten sentence as it should be spoken on camera.
- timestamp implied by 145 WPM pacing (you don't return it — UI computes it).
- camera_framing: specific shot type, e.g. "wide shot of creator at desk", "close-up on phone screen".
- b_roll_sound_fx: visual suggestion in ~3 words + named SFX. Example: "Productivity app dashboard + ticking clock SFX".
- editing_technique: specific cut + transition + SFX. Example: "Hard cut, 0.2s transition, add ticking clock SFX to reinforce urgency". Cut every 3-5 seconds.

FULL SCRIPT RULE:
- full_rewritten_script: the complete end-to-end rewritten script as a single string, concatenating every optimized line in shoot order, separated by line breaks. Ready to read on camera. No headings, no notes, no markdown.`;
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
                { role: "system", content: buildSystemPrompt(strictness) },
                { role: "user", content: `STRICTNESS MODE: ${strictness}\n\nAudit and rewrite this script:\n\n${script}` },
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
