import { useState } from "react";
import {
  Loader2,
  Sparkles,
  Scissors,
  AlertTriangle,
  Zap,
  Stethoscope,
  Gauge,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type MatrixRow = {
  timestamp: string;
  angle: string;
  b_roll: string;
  pacing: string;
};

type Analysis = {
  retention_score: number;
  hook_strength_lambda: number;
  pacing_frequency: number;
  drop_risk_line: number;
  weibull_formula_display: string;
  weibull_shape_k?: number;
  script_doctor: {
    stronger_hook: string;
    emotional_rewrite: string;
    cta_rewrite: string;
  };
  editing_matrix: MatrixRow[];
};

const CARD = "border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000]";
const PANE = "border-2 border-black bg-white shadow-[8px_8px_0px_0px_#000000]";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 border-2 border-black bg-[#00E5D1] px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] disabled:cursor-not-allowed disabled:opacity-70";

function Pill({ children, bg = "#FFFFFF" }: { children: React.ReactNode; bg?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 border-2 border-black px-3 py-1 text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_#000000]"
      style={{ backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

function trackUsage() {
  if (typeof window === "undefined") return;
  const month = new Date().toISOString().slice(0, 7);
  const key = `re_usage_${month}`;
  const cur = Number(localStorage.getItem(key) ?? "0") || 0;
  localStorage.setItem(key, String(cur + 1));
}

function RetentionCurve({
  variant,
  color,
}: {
  variant: "trap" | "loop";
  color: string;
}) {
  // Width 320, Height 140, y axis = retention %
  const W = 320;
  const H = 140;
  const pad = { l: 28, r: 8, t: 10, b: 22 };
  const y = (pct: number) => pad.t + (1 - pct / 100) * (H - pad.t - pad.b);
  const x = (t: number) => pad.l + (t / 30) * (W - pad.l - pad.r); // 30s timeline

  const trapPts = [
    [0, 100], [2, 92], [4, 45], [8, 32], [14, 24], [20, 18], [30, 12],
  ] as const;
  const loopPts = [
    [0, 100], [3, 95], [6, 90], [10, 89], [15, 88], [22, 88], [30, 87],
  ] as const;
  const pts = variant === "trap" ? trapPts : loopPts;
  const path = pts.map(([t, p], i) => `${i === 0 ? "M" : "L"} ${x(t)} ${y(p)}`).join(" ");
  const area = `${path} L ${x(30)} ${y(0)} L ${x(0)} ${y(0)} Z`;

  const yTicks = [0, 25, 50, 75, 100];
  const xTicks = [0, 5, 10, 15, 20, 25, 30];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full border-2 border-black bg-white">
      {/* grid */}
      {yTicks.map((t) => (
        <line key={`y${t}`} x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#000" strokeOpacity={0.12} />
      ))}
      {yTicks.map((t) => (
        <text key={`yt${t}`} x={4} y={y(t) + 3} fontSize={8} fontFamily="monospace" fill="#000">
          {t}
        </text>
      ))}
      {xTicks.map((t) => (
        <text key={`xt${t}`} x={x(t) - 4} y={H - 6} fontSize={8} fontFamily="monospace" fill="#000">
          {t}s
        </text>
      ))}
      {/* axes */}
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} stroke="#000" strokeWidth={1.5} />
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#000" strokeWidth={1.5} />
      {/* area + line */}
      <path d={area} fill={color} fillOpacity={0.25} />
      <path d={path} stroke="#000" strokeWidth={2.5} fill="none" />
      {/* marker at the inflection */}
      {variant === "trap" && (
        <>
          <circle cx={x(4)} cy={y(45)} r={5} fill="#FF5E5E" stroke="#000" strokeWidth={2} />
          <text x={x(4) + 8} y={y(45) - 6} fontSize={9} fontFamily="monospace" fontWeight={700} fill="#000">
            0:04 — 45%
          </text>
        </>
      )}
      {variant === "loop" && (
        <>
          <circle cx={x(15)} cy={y(88)} r={5} fill="#00FF66" stroke="#000" strokeWidth={2} />
          <text x={x(15) + 8} y={y(88) - 6} fontSize={9} fontFamily="monospace" fontWeight={700} fill="#000">
            STABLE — 88%
          </text>
        </>
      )}
    </svg>
  );
}

function AnalysisTab() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* LEFT — Original Trap */}
        <div className={`${CARD} p-5`} style={{ backgroundColor: "#FFE5E5" }}>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-black" />
            <Pill bg="#FF5E5E">Original Script Path</Pill>
          </div>
          <h4 className="mt-3 font-serif text-lg font-bold text-black">The 200-View Trap</h4>
          <div className="mt-3">
            <RetentionCurve variant="trap" color="#FF5E5E" />
          </div>
          <div className="mt-4 border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
              <AlertTriangle className="h-3.5 w-3.5" /> Diagnostic Breakdown
            </div>
            <p className="mt-2 text-sm font-semibold leading-snug text-black">
              <span className="bg-[#FF5E5E] px-1 font-bold">CRITICAL DROPOUT AT 0:04</span> — Reason: Dead intro hook
              combined with high filler-word density. Viewer cognitive load spiked, triggering a bounce.
            </p>
          </div>
        </div>

        {/* RIGHT — LoopLock */}
        <div className={`${CARD} p-5`} style={{ backgroundColor: "#E5FFE9" }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-black" />
            <Pill bg="#00FF66">LoopLock Optimized Path</Pill>
          </div>
          <h4 className="mt-3 font-serif text-lg font-bold text-black">The Retention Loop</h4>
          <div className="mt-3">
            <RetentionCurve variant="loop" color="#00FF66" />
          </div>
          <div className="mt-4 border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
              <TrendingUp className="h-3.5 w-3.5" /> Analytical Readout
            </div>
            <p className="mt-2 text-sm font-semibold leading-snug text-black">
              <span className="bg-[#00FF66] px-1 font-bold">PREDICTED TRAFFIC LEVEL: STABLE</span> — Reason: Dynamic
              attention hook successfully locked the initial 3-second cliff, while rhythmic pacing cuts drop cognitive
              fatigue to near-zero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const DOCTOR_SWAPS = [
  {
    bad: "Hey guys, welcome back to my channel. In today's video, I basically wanted to talk about...",
    good: "◤ Stop filming boring videos. Fix the script before you film.",
  },
  {
    bad: "...honestly, it just comes down to consistency. So yeah, definitely make sure you hit that follow button...",
    good: "◤ Top agencies run text through attention-decay models. If you want to break the trap, click the link.",
  },
];

function DoctorTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-black" />
        <h3 className="font-serif text-xl font-bold text-black">Linguistic Swaps</h3>
      </div>
      <div className="overflow-hidden border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="grid grid-cols-2 border-b-2 border-black bg-black text-xs uppercase tracking-widest text-white">
          <div className="border-r-2 border-white/20 px-4 py-3 font-mono font-bold">Flagged Weakness</div>
          <div className="px-4 py-3 font-mono font-bold">➔ Retaining Remedy</div>
        </div>
        {DOCTOR_SWAPS.map((row, idx) => (
          <div key={idx} className="grid grid-cols-2 border-t-2 border-black first:border-t-0">
            <div className="border-r-2 border-black bg-[#FFE5E5] p-4">
              <span className="inline-block border-2 border-black bg-[#FF5E5E] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                Weak
              </span>
              <p className="mt-2 text-sm leading-snug text-black line-through decoration-[#FF5E5E] decoration-2">
                {row.bad}
              </p>
            </div>
            <div className="bg-[#E5FFE9] p-4">
              <span className="inline-block border-2 border-black bg-[#00FF66] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                Loop-Locked
              </span>
              <p className="mt-2 text-sm font-bold leading-snug text-black">{row.good}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MATRIX_ROWS = [
  {
    line: "Stop filming boring videos. Fix the script before you film.",
    framing: "Close-up punch-in",
    cues: "Word-by-word kinetic text popups + crisp whoosh audio effect.",
  },
  {
    line: "You waste three hours editing un-paced footage...",
    framing: "Medium profile cut",
    cues: "B-roll of a frustrated editor scrolling a video timeline + subtle audio glitch transition.",
  },
];

function MatrixTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Scissors className="h-5 w-5 text-black" />
        <h3 className="font-serif text-xl font-bold text-black">Production Blueprint</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Line-by-line shooting guide built from the loop-locked script.
      </p>
      <div className="overflow-hidden border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-black text-xs uppercase tracking-widest text-white">
              <tr>
                <th className="border-r-2 border-white/20 px-4 py-3 font-mono font-bold">Corrected Script Line</th>
                <th className="w-44 border-r-2 border-white/20 px-4 py-3 font-mono font-bold">Camera Framing</th>
                <th className="px-4 py-3 font-mono font-bold">B-Roll & Sound FX</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX_ROWS.map((row, idx) => (
                <tr key={idx} className={`border-t-2 border-black ${idx % 2 === 0 ? "bg-white" : "bg-secondary"}`}>
                  <td className="border-r-2 border-black px-4 py-4 align-top">
                    <p className="text-sm font-bold leading-snug text-black">"{row.line}"</p>
                  </td>
                  <td className="border-r-2 border-black px-4 py-4 align-top">
                    <span className="inline-block border-2 border-black bg-[#FFD93D] px-2 py-1 font-mono text-xs font-bold text-black">
                      {row.framing}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-black">{row.cues}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function WindowPane({
  title,
  accent = "#FFD93D",
  children,
}: {
  title: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={PANE}>
      <div
        className="flex items-center justify-between border-b-2 border-black px-4 py-2.5"
        style={{ backgroundColor: accent }}
      >
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-black">{title}</span>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 border-2 border-black bg-[#FF5E5E]" />
          <span className="h-3 w-3 border-2 border-black bg-[#FFD93D]" />
          <span className="h-3 w-3 border-2 border-black bg-[#00FF66]" />
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Workspace() {
  const [script, setScript] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onAnalyze = async () => {
    if (!script.trim()) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as Analysis;
      setAnalysis(data);
      trackUsage();
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
        <div className="mb-8">
          <Pill bg="#00FF66">
            <span className="h-1.5 w-1.5 bg-black" /> ◤ LoopLock Workspace
          </Pill>
          <h1 className="mt-4 font-serif text-4xl font-bold text-black md:text-5xl">Paste a script. Ship a banger.</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Pre-production retention audit · loop-lock your script before the camera rolls
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <section>
            <WindowPane title="input.txt" accent="#9FE7F5">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Drop ANY raw script here (English, Telugu, Hinglish, any language)…"
                rows={16}
                className="w-full resize-none border-2 border-black bg-white p-4 font-mono text-sm leading-relaxed text-black placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={onAnalyze}
                disabled={status === "loading"}
                className={`${BTN_PRIMARY} mt-4 w-full py-3.5 text-base`}
              >
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Run Retention Audit
              </button>
            </WindowPane>
          </section>

          <section>
            <WindowPane title="output.exe" accent="#FFD93D">
              {status === "idle" && !error && (
                <div className="flex h-[480px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center border-2 border-black bg-[#00FF66] shadow-[4px_4px_0px_0px_#000000]">
                    <Sparkles className="h-7 w-7 text-black" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-bold text-black">Your blueprint will appear here</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Paste a raw script and run the audit — Analysis, Script Doctor, and Editing Matrix on the right.
                  </p>
                </div>
              )}
              {status === "idle" && error && (
                <div className="flex h-[480px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center border-2 border-black bg-[#FF5E5E] shadow-[4px_4px_0px_0px_#000000]">
                    <AlertTriangle className="h-7 w-7 text-black" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-black">Analysis failed</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
                </div>
              )}
              {status === "loading" && (
                <div className="flex h-[480px] flex-col items-center justify-center text-center">
                  <div className="border-2 border-black bg-[#FFD93D] p-5 shadow-[4px_4px_0px_0px_#000000]">
                    <Loader2 className="h-10 w-10 animate-spin text-black" />
                  </div>
                  <p className="mt-5 font-mono text-sm font-bold uppercase tracking-wider text-black">
                    Auditing retention curve…
                  </p>
                </div>
              )}
              {status === "done" && analysis && (
                <Tabs defaultValue="analysis" className="w-full">
                  <TabsList className="mb-4 grid w-full grid-cols-3 gap-0 border-2 border-black bg-white p-0 shadow-[3px_3px_0px_0px_#000000] h-auto rounded-none">
                    {[
                      { v: "analysis", l: "Analysis", icon: Gauge },
                      { v: "doctor", l: "Script Doctor", icon: Stethoscope },
                      { v: "matrix", l: "Editing Matrix", icon: Scissors },
                    ].map((t) => (
                      <TabsTrigger
                        key={t.v}
                        value={t.v}
                        className="rounded-none border-r-2 border-black px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-black data-[state=active]:bg-[#00E5D1] data-[state=active]:shadow-none last:border-r-0"
                      >
                        <t.icon className="mr-1.5 h-3.5 w-3.5" />
                        {t.l}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <TabsContent value="analysis">
                    <AnalysisTab />
                  </TabsContent>
                  <TabsContent value="doctor">
                    <DoctorTab />
                  </TabsContent>
                  <TabsContent value="matrix">
                    <MatrixTab />
                  </TabsContent>
                </Tabs>
              )}
            </WindowPane>
          </section>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <Zap className="h-4 w-4 text-black" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            ◤ LOOPLOCK WORKSPACE V1.0
          </span>
        </div>
      </div>
    </main>
  );
}
