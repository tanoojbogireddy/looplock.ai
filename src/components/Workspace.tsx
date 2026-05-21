import { useState } from "react";
import {
  Loader2,
  Sparkles,
  Scissors,
  AlertTriangle,
  Zap,
  Copy,
  Check,
  Stethoscope,
  FileText,
  Gauge,
  Activity,
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
const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 border-2 border-black bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000]";

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

function RetentionRing({ score }: { score: number }) {
  const size = 160;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#000" strokeWidth={stroke} fill="none" opacity={0.12} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#00E5D1"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="butt"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-4xl font-bold text-black">{score}%</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/70">Retention</span>
      </div>
    </div>
  );
}

function MetricsTab({ a }: { a: Analysis }) {
  return (
    <div className="space-y-6">
      <div className={`${CARD} flex flex-col items-center gap-5 p-6 md:flex-row md:gap-7`}>
        <RetentionRing score={a.retention_score} />
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Pill bg="#FFD93D">Weibull k = {a.weibull_shape_k ?? 0.7}</Pill>
            <Pill>λ = {a.hook_strength_lambda}</Pill>
            <Pill bg="#00FF66">Pacing {a.pacing_frequency}</Pill>
          </div>
          <p className="font-mono text-xs leading-relaxed text-black">
            <span className="font-bold uppercase tracking-widest">Formula:</span>{" "}
            <span className="border-2 border-black bg-secondary px-2 py-0.5">{a.weibull_formula_display}</span>
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_#000000]">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/70">Scale (λ)</div>
              <div className="mt-1 font-serif text-2xl font-bold text-black">{a.hook_strength_lambda}</div>
            </div>
            <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_#000000]">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/70">Pacing Frequency</div>
              <div className="mt-1 font-serif text-2xl font-bold text-black">{a.pacing_frequency}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${CARD} p-5`}>
        <div className="flex items-center justify-between font-mono text-xs text-black">
          <span className="font-bold uppercase tracking-widest">Scale (λ)</span>
          <span className="font-bold">{a.hook_strength_lambda} / 100</span>
        </div>
        <div className="mt-2 h-5 w-full border-2 border-black bg-white">
          <div className="h-full border-r-2 border-black bg-[#00E5D1] transition-all" style={{ width: `${a.hook_strength_lambda}%` }} />
        </div>
      </div>

      <div className={`${CARD} p-5`} style={{ backgroundColor: "#FFE5E5" }}>
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
          <AlertTriangle className="h-3.5 w-3.5" /> Critical Weibull Alert
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center gap-2 border-2 border-black bg-[#FF5E5E] px-3 py-2 text-sm font-extrabold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000000]">
            <AlertTriangle className="h-4 w-4" />
            Critical Weibull Drop Risk Detected at Line {a.drop_risk_line} (Pacing Violation)
          </span>
        </div>
      </div>
    </div>
  );
}

function DoctorTab({ a }: { a: Analysis }) {
  const [copied, setCopied] = useState(false);
  const finalScript = [
    `HOOK: ${a.script_doctor.stronger_hook}`,
    `BODY: ${a.script_doctor.emotional_rewrite}`,
    `CTA:  ${a.script_doctor.cta_rewrite}`,
  ].join("\n\n");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalScript);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const boxes = [
    { label: "Stronger Hook", color: "#FFD93D", text: a.script_doctor.stronger_hook },
    { label: "Emotional Rewrite", color: "#FF5E5E", text: a.script_doctor.emotional_rewrite },
    { label: "CTA Rewrite", color: "#00FF66", text: a.script_doctor.cta_rewrite },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-black" />
        <h3 className="font-serif text-xl font-bold text-black">Script Doctor Rewrites</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {boxes.map((b) => (
          <div key={b.label} className={`${CARD} p-5`}>
            <span
              className="inline-block border-2 border-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black"
              style={{ backgroundColor: b.color }}
            >
              {b.label}
            </span>
            <p className="mt-3 text-sm font-semibold leading-snug text-black">"{b.text}"</p>
          </div>
        ))}
      </div>

      <div className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center justify-between border-b-2 border-black bg-black px-4 py-2.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white">final-script.txt</span>
          <button onClick={onCopy} className={BTN_SECONDARY} style={{ backgroundColor: copied ? "#00FF66" : "#fff" }}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-5">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-black">{finalScript}</pre>
        </div>
      </div>
      <div className="flex items-center justify-center pt-1">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <FileText className="h-3 w-3" /> Teleprompter-ready
        </span>
      </div>
    </div>
  );
}

function MatrixTab({ a }: { a: Analysis }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Scissors className="h-5 w-5 text-black" />
        <h3 className="font-serif text-xl font-bold text-black">Timestamped Production Matrix</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Camera angles, B-roll, and pacing cues tuned to the Weibull retention curve.
      </p>
      <div className="overflow-hidden border-2 border-black">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-black text-xs uppercase tracking-widest text-white">
              <tr>
                <th className="w-20 border-r-2 border-white/20 px-4 py-3 font-mono font-bold">Time</th>
                <th className="border-r-2 border-white/20 px-4 py-3 font-mono font-bold">Camera Angle</th>
                <th className="border-r-2 border-white/20 px-4 py-3 font-mono font-bold">B-Roll Idea</th>
                <th className="px-4 py-3 font-mono font-bold">Pacing Suggestion</th>
              </tr>
            </thead>
            <tbody>
              {a.editing_matrix.map((row, idx) => (
                <tr
                  key={`${row.timestamp}-${idx}`}
                  className={`border-t-2 border-black ${idx % 2 === 0 ? "bg-white" : "bg-secondary"}`}
                >
                  <td className="whitespace-nowrap border-r-2 border-black px-4 py-4 align-top">
                    <span className="inline-block border-2 border-black bg-[#FFD93D] px-2 py-0.5 font-mono text-xs font-bold text-black">
                      {row.timestamp}
                    </span>
                  </td>
                  <td className="border-r-2 border-black px-4 py-4 align-top font-medium text-black">{row.angle}</td>
                  <td className="border-r-2 border-black px-4 py-4 align-top text-black">{row.b_roll}</td>
                  <td className="px-4 py-4 align-top text-black">{row.pacing}</td>
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
            <span className="h-1.5 w-1.5 bg-black" /> Workspace Terminal · Weibull Engine
          </Pill>
          <h1 className="mt-4 font-serif text-4xl font-bold text-black md:text-5xl">Paste a script. Ship a banger.</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            R(t) = e^(-(t / λ)^0.7) · early drop-off cliff locked
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
                Run Weibull Audit
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
                    Paste a raw script and run the Weibull audit — Metrics, Doctor, and Matrix on the right.
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
                    Computing Weibull curve…
                  </p>
                </div>
              )}
              {status === "done" && analysis && (
                <Tabs defaultValue="metrics" className="w-full">
                  <TabsList className="mb-4 grid w-full grid-cols-3 gap-0 border-2 border-black bg-white p-0 shadow-[3px_3px_0px_0px_#000000] h-auto rounded-none">
                    {[
                      { v: "metrics", l: "Metrics", icon: Gauge },
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
                  <TabsContent value="metrics">
                    <MetricsTab a={analysis} />
                  </TabsContent>
                  <TabsContent value="doctor">
                    <DoctorTab a={analysis} />
                  </TabsContent>
                  <TabsContent value="matrix">
                    <MatrixTab a={analysis} />
                  </TabsContent>
                </Tabs>
              )}
            </WindowPane>
          </section>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <Zap className="h-4 w-4 text-black" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Retention Engine · Weibull Workspace v1.0 · k=0.7
          </span>
        </div>
      </div>
    </main>
  );
}
