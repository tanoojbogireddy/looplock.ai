import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

type Strictness = "Trim Only" | "Balanced" | "Hyper-Short";

async function readStreamedToolArguments(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let args = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const rawLine = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!rawLine.startsWith("data:")) continue;
      const data = rawLine.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const chunk = JSON.parse(data);
        const delta = chunk?.choices?.[0]?.delta;
        const toolCalls = delta?.tool_calls;
        if (Array.isArray(toolCalls)) {
          for (const tc of toolCalls) {
            const piece = tc?.function?.arguments;
            if (typeof piece === "string") args += piece;
          }
        }
        const fallback = chunk?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
        if (typeof fallback === "string" && !args) args = fallback;
      } catch {
        // skip malformed chunk
      }
    }
  }
  return args;
}

function strictnessDirective(s: Strictness): string {
  if (s === "Trim Only")
    return "- Target: EXACTLY ~12% word reduction, 135 WPM (cinematic), conservative polish only: remove filler, preserve sentence order and most wording.";
  if (s === "Hyper-Short")
    return "- Target: EXACTLY ~59% word reduction, 160 WPM (retention-max), aggressive sentence stripping: short fragments, punch verbs, no soft setup.";
  return "- Target: EXACTLY ~28% word reduction, 145 WPM (energetic), sharp narrative hook metrics: tighter clauses, stronger contrast, clear emotional beats.";
}

function buildSystemPrompt(s: Strictness): string {
  const wpm = s === "Trim Only" ? 135 : s === "Hyper-Short" ? 160 : 145;
  return `You are an elite short-form video Script Doctor (YouTube Shorts, TikTok, Instagram Reels). Your job is to rewrite weak lines into retention-killing powerhouses, audit the script's retention curve, and brief the editor.

PRE-ANALYSIS — DETECT BEFORE YOU REWRITE:
1. INPUT LANGUAGE & SCRIPT STYLE: Identify exactly how the user wrote the script. Possible styles include Pure Hindi (Devanagari), Transliterated Hindi (Hinglish in Latin script), Pure Tamil, Transliterated Tamil (Tanglish), Pure Telugu, Transliterated Telugu, Native Spanish, French, German, English, or a code-mix. Lock onto that exact style.
2. VERTICAL INDUSTRY NICHE: Identify the niche from vocabulary and intent — Finance, Real Estate, Tech / Coding, Lifestyle, Music / Art, Political commentary, Fitness, Food, Education, etc.

CRITICAL LANGUAGE RULE:
- 'retaining_remedy', 'corrected_line', and 'full_rewritten_script' MUST be written in the EXACT same language and script style as the input. If input is Tanglish, output Tanglish. If input is Hinglish, output Hinglish. If input is Devanagari Hindi, output Devanagari. NEVER translate the spoken script into English.
- 'flagged_weakness', 'why_it_works', 'score_justification', 'plain_summary', 'problem_plain', 'fix_plain', 'original_drop_reason', 'optimized_summary', 'camera_framing', 'b_roll_sound_fx', and 'editing_technique' MUST always be in clean professional English so the analytics UI renders correctly.

CRITICAL NICHE ALIGNMENT:
- Tune hooks, vocabulary, pacing emphasis, and editor briefing to the detected niche audience — trust + speed for Finance, aspirational imagery for Real Estate, visual pacing locked to transients for Music, problem-solution speed for Tech, contrarian punch for Political, etc.

STRICTNESS MODE: ${s}
${strictnessDirective(s)}

STATE-SPECIFIC OUTPUT RULE:
- The selected STRICTNESS MODE is the source of truth. Do NOT reuse wording, row counts, or editing techniques from another mode.
- For Trim Only, retaining_remedy and full_rewritten_script should remain recognizably close to the source with only about 12% fewer words.
- For Balanced, retaining_remedy and full_rewritten_script must be visibly tighter than Trim Only with about 28% fewer words.
- For Hyper-Short, retaining_remedy and full_rewritten_script must be dramatically shorter than Balanced with about 59% fewer words.
- If the same input is requested under different modes, the text volume, pacing language, and editor instructions must be materially different.

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
- timestamps are computed by the UI against the active strictness pacing (${wpm} WPM) — do not return them.
- Match editing_technique to strictness: Trim Only = slow cinematic pans, smooth transitions, continuous visual blocks; Balanced = clean punch-in cuts and rhythmic 3-5 second changes; Hyper-Short = high-frequency jump-cuts, flash-frames, split-second sound cues, rapid pattern interrupts.
- camera_framing, b_roll_sound_fx, editing_technique MUST be 100% customized to the detected niche. Do NOT use generic placeholders. Examples per niche:
  • Finance → candlestick chart overlays, profit dashboards, cash-register cha-ching SFX, rapid mechanical keyboard typing.
  • Real Estate → wide-angle interior sweeps, marble kitchen macro, drone neighborhood flyovers, door-unlock click, luxury ambient lofi swoosh.
  • Tech / Coding → IDE syntax blocks, terminal logs, UI wireframes, digital typing clicks, system alert SFX.
  • Music / Art → frame-accurate cuts locked to transients, macro instrument close-ups, audio-reactive lightning, beat-drop indicators.
  • Political → archival news clips, lower-third name plates, gavel thud, crowd murmur swell.
  Pick the niche-appropriate set; cut every 3-5 seconds.

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
              temperature: 0.1,
              max_tokens: 1536,
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

          const argsStr = await readStreamedToolArguments(aiRes);
          if (!argsStr) {
            return new Response(JSON.stringify({ error: "AI returned no structured output" }), {
              status: 502,
              headers: { "Content-Type": "application/json" },
            });
          }
          const parsed = JSON.parse(argsStr);
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
