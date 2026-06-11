import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

// ---------- types ----------
type Sentence = { index: number; text: string; words: number; startTime: number; endTime: number };

// ---------- text processing ----------
function splitSentences(script: string): Sentence[] {
  const raw = script
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const WPS = 140 / 60; // 2.333 words/sec
  let cursor = 0;
  return raw.map((text, index) => {
    const words = text.split(/\s+/).filter(Boolean).length;
    const duration = words / WPS;
    const startTime = cursor;
    const endTime = cursor + duration;
    cursor = endTime;
    return { index, text, words, startTime, endTime };
  });
}

// ---------- hook quality ----------
const URGENCY = ["never", "secret", "mistake", "warning", "stop", "impossible", "shocking"];
const PATTERN = ["ways", "tips", "reasons", "secrets", "mistakes"];
const PRONOUNS = ["you", "your", "yourself"];
const CONTRAST = ["everyone", "nobody", "most people", "don't", "never"];

function hookQuality(first: string): number {
  if (!first) return 0.1;
  const lower = first.toLowerCase();
  let s = 0.25;
  if (/\?/.test(first)) s += 0.15;
  if (URGENCY.some((w) => new RegExp(`\\b${w}\\b`, "i").test(lower))) s += 0.15;
  if (PATTERN.some((w) => new RegExp(`\\b${w}\\b`, "i").test(lower))) s += 0.15;
  if (PRONOUNS.some((w) => new RegExp(`\\b${w}\\b`, "i").test(lower))) s += 0.15;
  if (CONTRAST.some((w) => new RegExp(`\\b${w.replace("'", "'?")}\\b`, "i").test(lower))) s += 0.15;
  return Math.min(Math.max(s, 0.1), 1.0);
}

// ---------- pacing ----------
function pacingQuality(sentences: Sentence[]): number {
  if (sentences.length === 0) return 0.1;
  const avg = sentences.reduce((a, s) => a + s.words, 0) / sentences.length;
  let violations = 0;
  for (const s of sentences) {
    if (s.words >= avg * 2 || s.words <= avg * 0.5) violations += 1;
  }
  for (let i = 1; i < sentences.length; i++) {
    const gap = sentences[i].startTime - sentences[i - 1].endTime;
    if (gap > 4) violations += 1;
  }
  const pf = 1.0 - (violations / sentences.length) * 0.6;
  return Math.max(pf, 0.1);
}

// ---------- value delivery ----------
const VALUE_KEYS = ["do this", "here's how", "heres how", "the secret", "the reason", "the hack", "this is", "the trick", "first", "key", "important"];
function valueDeliveryTime(sentences: Sentence[]): number {
  for (let i = 0; i < Math.min(10, sentences.length); i++) {
    const lower = sentences[i].text.toLowerCase();
    if (VALUE_KEYS.some((k) => lower.includes(k))) return Math.round(sentences[i].startTime * 10) / 10;
  }
  return -1;
}

// ---------- retention curve ----------
function retentionAt(t: number, S: number, Pf: number): number {
  const scale = Math.max(S * Pf * 30, 1);
  const r = Math.exp(-Math.pow(t / scale, 0.7));
  return Math.round(Math.min(Math.max(r, 0), 1) * 100);
}
function retentionCurve(S: number, Pf: number) {
  return [0, 5, 10, 15, 20, 25, 30].map((t) => ({ time: `${t}s`, retention: retentionAt(t, S, Pf) }));
}

// ---------- critical dropout ----------
function criticalDropout(sentences: Sentence[], S: number, Pf: number) {
  for (const s of sentences) {
    const r = retentionAt(s.startTime, S, Pf);
    if (r < 65) {
      return {
        sentenceIndex: s.index,
        timestamp: secondsToTimestamp(s.startTime),
        retentionScore: r,
        rawSeconds: s.startTime,
      };
    }
  }
  const last = sentences[sentences.length - 1];
  return {
    sentenceIndex: last?.index ?? 0,
    timestamp: secondsToTimestamp(last?.startTime ?? 0),
    retentionScore: last ? retentionAt(last.startTime, S, Pf) : 100,
    rawSeconds: last?.startTime ?? 0,
  };
}

function secondsToTimestamp(sec: number): string {
  const total = Math.max(0, Math.round(sec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ---------- weak sentence detection ----------
function weakSentenceIndices(sentences: Sentence[]): number[] {
  if (sentences.length === 0) return [];
  const avg = sentences.reduce((a, s) => a + s.words, 0) / sentences.length;
  const weak: number[] = [];
  // first sentence weak if hookQuality < 0.55
  if (hookQuality(sentences[0].text) < 0.55) weak.push(0);
  for (const s of sentences) {
    if (weak.includes(s.index)) continue;
    if (s.words >= avg * 2 || s.words <= avg * 0.5) weak.push(s.index);
  }
  return weak.slice(0, 5);
}

// ---------- score ----------
function overallScore(S: number, Pf: number, valueT: number): number {
  const valueScore = valueT < 0 ? 0.3 : valueT <= 5 ? 1 : valueT <= 10 ? 0.7 : 0.4;
  const composite = S * 0.45 + Pf * 0.35 + valueScore * 0.2;
  return Math.round(Math.min(Math.max(composite * 10, 1), 10));
}

function avgRetention(curve: { retention: number }[]): number {
  return curve.reduce((a, p) => a + p.retention, 0) / curve.length;
}

// ---------- gemini ----------
type GeminiOutput = {
  rewrittenFirst: string[]; // 2-3 rewrites for first sentences
  weakRewrites: { index: number; rewritten: string; whyItWorks: string }[];
  editorBriefing: { index: number; editingTechnique: string; cameraFraming: string; soundEffect: string }[];
  strengths: string[];
  weaknesses: string[];
  dropoutReason: string;
};

function stripJsonMarkdown(raw: string): string {
  return raw
    .replace(/^\uFEFF/, "")
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();
}

function parseAiJson<T>(raw: string): T {
  const cleaned = stripJsonMarkdown(raw);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (!cleaned || start === -1) throw new Error("AI returned empty structured output. Please try again.");
  if (end <= start) throw new Error("AI response was cut off before it finished. Try a shorter script.");

  const candidate = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as T;
  } catch (error) {
    console.error("Failed to parse AI structured output", {
      rawResponse: raw,
      sanitizedResponse: candidate,
      error,
    });
    throw new Error("AI returned invalid or incomplete structured output");
  }
}

async function callGemini(
  apiKey: string,
  sentences: Sentence[],
  weakIdx: number[],
  S: number,
  Pf: number,
  dropoutIdx: number,
): Promise<GeminiOutput> {
  const tool = {
    type: "function" as const,
    function: {
      name: "emit_analysis",
      description: "Emit rewrites + editor briefing.",
      parameters: {
        type: "object",
        properties: {
          rewrittenFirst: {
            type: "array",
            items: { type: "string" },
            description: "Rewrites for first 2-3 sentences. Strong hook. Copy-paste ready.",
            minItems: 2,
            maxItems: 3,
          },
          weakRewrites: {
            type: "array",
            items: {
              type: "object",
              properties: {
                index: { type: "number" },
                rewritten: { type: "string" },
                whyItWorks: { type: "string", description: "Max 10 words." },
              },
              required: ["index", "rewritten", "whyItWorks"],
              additionalProperties: false,
            },
          },
          editorBriefing: {
            type: "array",
            items: {
              type: "object",
              properties: {
                index: { type: "number" },
                editingTechnique: { type: "string", description: "Format: '[Cut] + [Camera move] + [SFX]'" },
                cameraFraming: { type: "string" },
                soundEffect: { type: "string" },
              },
              required: ["index", "editingTechnique", "cameraFraming", "soundEffect"],
              additionalProperties: false,
            },
          },
          strengths: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2 },
          weaknesses: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2 },
          dropoutReason: { type: "string", description: "1 plain-English sentence why viewers drop here." },
        },
        required: ["rewrittenFirst", "weakRewrites", "editorBriefing", "strengths", "weaknesses", "dropoutReason"],
        additionalProperties: false,
      },
    },
  };

  const scriptListing = sentences.map((s) => `[${s.index}] (${s.words}w) ${s.text}`).join("\n");
  const system = `You are a short-form video retention engineer. Rewrite weak lines into strong, on-camera-ready replacements. Editor techniques must be specific (cut + camera move + SFX). No jargon, no filler.

ABSOLUTE FORMAT LOCK:
- Return ONLY one complete valid JSON object via the provided tool schema.
- Omit conversational filler, intro text, explanations, headings, and markdown.
- Do NOT wrap output in markdown fences such as \`\`\`json or \`\`\`.
- The function arguments must be parseable by JSON.parse with no cleanup.`;
  const user = `Script:
${scriptListing}

Computed metrics:
- Hook quality S = ${S.toFixed(2)} (1.0 best)
- Pacing quality Pf = ${Pf.toFixed(2)}
- Critical dropout sentence index: ${dropoutIdx}
- Weak sentence indices: ${weakIdx.join(", ") || "none"}

Tasks:
1. Rewrite first 2-3 sentences to push hook quality above 0.7.
2. For EVERY weak sentence index, produce a rewrite + <=10 word "why it works".
3. For EVERY sentence (use its index), produce an editor briefing row (technique + framing + SFX) tailored to that line's content.
4. 2 strengths + 2 weaknesses (short phrases).
5. dropoutReason: 1 plain sentence.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "emit_analysis" } },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway ${res.status}: ${t}`);
  }
  const payload = await res.json();
  const choice = payload?.choices?.[0];
  const args = choice?.message?.tool_calls?.[0]?.function?.arguments || choice?.message?.content;
  if (!args) {
    console.error("AI returned no structured output", { payload });
    throw new Error("AI returned empty structured output. Please try again.");
  }
  if (choice?.finish_reason === "length") {
    console.error("AI structured output was truncated", { rawResponse: args });
    throw new Error("AI response was cut off before it finished. Try a shorter script.");
  }
  return parseAiJson<GeminiOutput>(args);
}

// ---------- handler ----------
const FREE_LIMIT = 3;

export const Route = createFileRoute("/api/analyze-script")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as {
            script?: unknown;
            userId?: unknown;
            tier?: unknown;
            scriptsUsed?: unknown;
          };
          const script = typeof body.script === "string" ? body.script.trim() : "";
          const userId = typeof body.userId === "string" ? body.userId : "anonymous";
          const tier = body.tier === "premium" ? "premium" : "free";
          const scriptsUsed = typeof body.scriptsUsed === "number" ? body.scriptsUsed : 0;

          if (!script || script.length < 10) {
            return Response.json({ success: false, error: "Script too short" }, { status: 400 });
          }

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json({ success: false, error: "AI gateway not configured" }, { status: 500 });
          }

          // 1-5
          const sentences = splitSentences(script);
          if (sentences.length === 0) {
            return Response.json({ success: false, error: "Could not parse script" }, { status: 400 });
          }
          const S = hookQuality(sentences[0].text);
          const Pf = pacingQuality(sentences);
          const valueT = valueDeliveryTime(sentences);

          // 6-7
          const curveOrig = retentionCurve(S, Pf);
          const dropout = criticalDropout(sentences, S, Pf);

          // weak indices for Gemini
          const weakIdx = weakSentenceIndices(sentences);

          // 8-10 (Gemini)
          let ai: GeminiOutput;
          try {
            ai = await callGemini(apiKey, sentences, weakIdx, S, Pf, dropout.sentenceIndex);
          } catch (err) {
            const msg = err instanceof Error ? err.message : "AI failure";
            return Response.json({ success: false, error: msg }, { status: 502 });
          }

          // build optimized script: replace first N + weak rewrites
          const optimizedSentences: Sentence[] = sentences.map((s) => ({ ...s }));
          ai.rewrittenFirst.forEach((txt, i) => {
            if (optimizedSentences[i]) {
              const words = txt.split(/\s+/).filter(Boolean).length;
              optimizedSentences[i] = { ...optimizedSentences[i], text: txt, words };
            }
          });
          for (const w of ai.weakRewrites) {
            if (optimizedSentences[w.index]) {
              const words = w.rewritten.split(/\s+/).filter(Boolean).length;
              optimizedSentences[w.index] = { ...optimizedSentences[w.index], text: w.rewritten, words };
            }
          }
          // recompute timings
          const WPS = 140 / 60;
          let cursor = 0;
          for (const s of optimizedSentences) {
            const dur = s.words / WPS;
            s.startTime = cursor;
            s.endTime = cursor + dur;
            cursor = s.endTime;
          }

          const Sopt = Math.max(hookQuality(optimizedSentences[0].text), 0.7);
          const Pfopt = pacingQuality(optimizedSentences);
          const valueTopt = valueDeliveryTime(optimizedSentences);
          const curveOpt = retentionCurve(Sopt, Pfopt);

          const origScore = overallScore(S, Pf, valueT);
          const optScore = overallScore(Sopt, Pfopt, valueTopt);
          const retentionGain = Math.round(avgRetention(curveOpt) - avgRetention(curveOrig));
          const viewersSavedPer10k = Math.max(0, Math.round((avgRetention(curveOpt) - avgRetention(curveOrig)) * 100));

          // rewrittenSentences for optimized panel = first N rewrites
          const rewrittenSentences = ai.rewrittenFirst.map((rw, i) => ({
            index: i,
            original: sentences[i]?.text ?? "",
            rewritten: rw,
            reason: i === 0 ? "Stronger hook in first 3 seconds." : "Reinforces hook before viewers swipe.",
          }));

          // script doctor weak sentences
          const weakSentences = ai.weakRewrites
            .filter((w) => sentences[w.index])
            .map((w) => ({
              index: w.index,
              original: sentences[w.index].text,
              rewritten: w.rewritten,
              whyItWorks: w.whyItWorks,
            }));
          const copyAllText = weakSentences.map((w) => w.rewritten).join("\n");

          // editor briefing
          const briefingMap = new Map(ai.editorBriefing.map((b) => [b.index, b]));
          const productionChecklist = optimizedSentences.map((s, i) => {
            const b = briefingMap.get(s.index) ?? briefingMap.get(i);
            return {
              lineNumber: i + 1,
              sentence: s.text,
              timestamp: secondsToTimestamp(s.startTime),
              editingTechnique: b?.editingTechnique ?? "Hard cut + static + subtle whoosh",
              cameraFraming: b?.cameraFraming ?? "Medium close-up, direct eye contact",
              soundEffect: b?.soundEffect ?? "Soft transition swell",
            };
          });

          const tierInfo =
            tier === "premium"
              ? { tier, scriptsUsed, scriptsRemaining: "unlimited" as const, unlimited: true }
              : {
                  tier,
                  scriptsUsed: scriptsUsed + 1,
                  scriptsRemaining: Math.max(0, FREE_LIMIT - (scriptsUsed + 1)),
                  warning:
                    scriptsUsed + 1 >= FREE_LIMIT
                      ? "Upgrade to premium for unlimited"
                      : undefined,
                };

          return Response.json({
            success: true,
            userId,
            scriptStrengthAnalysis: {
              original: {
                score: origScore,
                hookQuality: Number(S.toFixed(2)),
                pacingQuality: Number(Pf.toFixed(2)),
                valueDeliveryTime: valueT,
                criticalDroppoint: {
                  sentenceIndex: dropout.sentenceIndex,
                  timestamp: dropout.timestamp,
                  retentionScore: dropout.retentionScore,
                  reason: ai.dropoutReason,
                },
                retentionCurve: curveOrig,
              },
              optimized: {
                score: optScore,
                hookQuality: Number(Sopt.toFixed(2)),
                pacingQuality: Number(Pfopt.toFixed(2)),
                valueDeliveryTime: valueTopt,
                rewrittenSentences,
                retentionCurve: curveOpt,
              },
              improvement: {
                scoreGain: Math.max(0, optScore - origScore),
                retentionGain,
                viewersSavedPer10k,
                strengths: ai.strengths,
                weaknesses: ai.weaknesses,
              },
            },
            scriptDoctorTab: {
              weakSentences,
              copyAllText,
            },
            editorBriefingTab: {
              productionChecklist,
            },
            tierInfo,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return Response.json({ success: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
