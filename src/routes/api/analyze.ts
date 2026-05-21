import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

// Hardcoded Weibull-based retention analysis payload.
// Shape parameter k = 0.7 models the early short-form drop-off cliff.
// R(t) = e^(-(t / λ)^0.7)
const PAYLOAD = {
  retention_score: 84,
  hook_strength_lambda: 92,
  pacing_frequency: 85,
  drop_risk_line: 3,
  weibull_formula_display: "R(t) = e^(-(t / λ)^0.7)",
  weibull_shape_k: 0.7,
  script_doctor: {
    stronger_hook:
      "Applying to jobs online is dead in 2026. Here is the hidden outbound loop instead...",
    emotional_rewrite:
      "If you are clicking 'easy apply' on LinkedIn, you are competing with 5,000 desperate freshers. It's a losing game.",
    cta_rewrite:
      "Drop your open repository link below, and I'll audit your custom script frontend logic live in your DMs.",
  },
  editing_matrix: [
    {
      timestamp: "0:01",
      angle: "Punch in to tight close-up",
      b_roll: "Macro shot of phone screen scrolling infinitely",
      pacing: "Fast clip cuts to survive the 0.7 Weibull early cliff",
    },
    {
      timestamp: "0:04",
      angle: "Standard medium shot",
      b_roll: "Pop up bold kinetic text: 'COMPETING WITH 5,000 PEOPLE'",
      pacing: "Pattern interrupt alert sound to stabilize retention plateau",
    },
  ],
} as const;

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
          return Response.json(PAYLOAD);
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
