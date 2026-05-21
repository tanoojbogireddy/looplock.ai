import { useState } from "react";
import {
  Loader2,
  Sparkles,
  Scissors,
  AlertTriangle,
  Zap,
  Stethoscope,
  Gauge,
  ArrowRight,
  Copy,
  Printer,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Analysis = {
  analysis: {
    video_score: number;
    plain_summary: string;
    problem_plain: string;
    fix_plain: string;
    original_drop_second: number;
    original_drop_reason: string;
    original_chart_data: number[];
    optimized_chart_data: number[];
    optimized_summary: string;
  };
  script_doctor: { flagged_weakness: string; retaining_remedy: string; why_it_works: string }[];
  editing_matrix: {
    corrected_line: string;
    camera_framing: string;
    b_roll_sound_fx: string;
    editing_technique: string;
  }[];
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
  data,
  color,
  markerSecond,
  markerLabel,
}: {
  data: number[];
  color: string;
  markerSecond?: number;
  markerLabel?: string;
}) {
  const W = 320;
  const H = 140;
  const pad = { l: 28, r: 8, t: 10, b: 22 };
  const y = (pct: number) => pad.t + (1 - Math.max(0, Math.min(100, pct)) / 100) * (H - pad.t - pad.b);
  const x = (t: number) => pad.l + (t / 30) * (W - pad.l - pad.r);

  // map 11 samples to 0..30s
  const safe = (data && data.length >= 2 ? data : [100, 0]).slice(0, 11);
  const step = 30 / (safe.length - 1);
  const path = safe
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i * step)} ${y(p)}`)
    .join(" ");
  const area = `${path} L ${x(30)} ${y(0)} L ${x(0)} ${y(0)} Z`;

  const yTicks = [0, 25, 50, 75, 100];
  const xTicks = [0, 5, 10, 15, 20, 25, 30];

  // interpolate marker y
  let markerY: number | null = null;
  let markerPct: number | null = null;
  if (typeof markerSecond === "number" && markerSecond >= 0 && markerSecond <= 30) {
    const idxF = markerSecond / step;
    const i0 = Math.floor(idxF);
    const i1 = Math.min(safe.length - 1, i0 + 1);
    const frac = idxF - i0;
    markerPct = safe[i0] + (safe[i1] - safe[i0]) * frac;
    markerY = y(markerPct);
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full border-2 border-black bg-white">
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
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} stroke="#000" strokeWidth={1.5} />
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#000" strokeWidth={1.5} />
      {/* 65% threshold line */}
      <line
        x1={pad.l}
        x2={W - pad.r}
        y1={y(65)}
        y2={y(65)}
        stroke="#FF1F1F"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <path d={area} fill={color} fillOpacity={0.25} />
      <path d={path} stroke="#000" strokeWidth={2.5} fill="none" />
      {markerY !== null && markerPct !== null && typeof markerSecond === "number" && (
        <>
          <circle cx={x(markerSecond)} cy={markerY} r={5} fill={color} stroke="#000" strokeWidth={2} />
          {markerLabel && (
            <text
              x={Math.min(W - 80, x(markerSecond) + 8)}
              y={Math.max(14, markerY - 6)}
              fontSize={9}
              fontFamily="monospace"
              fontWeight={700}
              fill="#000"
            >
              {markerLabel}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

function AnalysisTab({
  a,
  onJumpToDoctor,
}: {
  a: Analysis["analysis"];
  onJumpToDoctor: () => void;
}) {
  const score = Math.max(1, Math.min(10, Math.round(a.video_score)));
  const scoreColor = score < 5 ? "#FF5E5E" : score <= 7 ? "#FFB627" : "#00C853";
  return (
    <div className="space-y-5">
      {/* Score */}
      <div
        className={`${CARD} flex flex-col items-center p-6 text-center`}
        style={{ backgroundColor: "#FFFDF5" }}
      >
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-black">
          Your Video Score
        </span>
        <div
          className="mt-2 border-2 border-black px-6 py-2 shadow-[4px_4px_0px_0px_#000000]"
          style={{ backgroundColor: scoreColor }}
        >
          <span className="font-serif text-5xl font-extrabold text-black md:text-6xl">
            {score}/10
          </span>
        </div>
        <p className="mt-4 max-w-xl font-serif text-base font-semibold leading-snug text-black md:text-lg">
          {a.plain_summary}
        </p>
      </div>

      {/* Two charts side by side */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className={`${CARD} p-4`} style={{ backgroundColor: "#FFE5E5" }}>
          <h4 className="font-serif text-base font-bold text-black">When people stop watching</h4>
          <div className="mt-3">
            <RetentionCurve
              data={a.original_chart_data}
              color="#FF5E5E"
              markerSecond={a.original_drop_second}
              markerLabel="Most people leave here"
            />
          </div>
        </div>
        <div className={`${CARD} p-4`} style={{ backgroundColor: "#E5FFE9" }}>
          <h4 className="font-serif text-base font-bold text-black">After the fix</h4>
          <div className="mt-3">
            <RetentionCurve data={a.optimized_chart_data} color="#00FF66" />
          </div>
        </div>
      </div>

      {/* Plain cards */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className={`${CARD} p-5`} style={{ backgroundColor: "#FFD7D7" }}>
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-black">
            ❌ What's happening
          </div>
          <p className="mt-2 text-sm font-semibold leading-snug text-black md:text-base">
            {a.problem_plain}
          </p>
        </div>
        <div className={`${CARD} p-5`} style={{ backgroundColor: "#CFFFD7" }}>
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-black">
            ✅ After fixing this
          </div>
          <p className="mt-2 text-sm font-semibold leading-snug text-black md:text-base">
            {a.fix_plain}
          </p>
        </div>
      </div>

      <div className="flex justify-center pt-1">
        <button onClick={onJumpToDoctor} className={BTN_PRIMARY}>
          See how to fix it <ArrowRight className="h-4 w-4" /> Script Doctor
        </button>
      </div>
    </div>
  );
}

function DoctorTab({ rows }: { rows: Analysis["script_doctor"] }) {
  const copyAll = async () => {
    const text = rows.map((r) => r.retaining_remedy).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* no-op */
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-black" />
        <h3 className="font-serif text-xl font-bold text-black">Fix My Script</h3>
      </div>
      <div className="overflow-hidden border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="grid grid-cols-[1fr_1fr_minmax(140px,0.7fr)] border-b-2 border-black bg-black text-xs uppercase tracking-widest text-white">
          <div className="border-r-2 border-white/20 px-4 py-3 font-mono font-bold">Original Line</div>
          <div className="border-r-2 border-white/20 px-4 py-3 font-mono font-bold">Rewritten Line</div>
          <div className="px-4 py-3 font-mono font-bold">Why this works</div>
        </div>
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[1fr_1fr_minmax(140px,0.7fr)] border-t-2 border-black first:border-t-0"
          >
            <div className="border-r-2 border-black bg-[#FFE5E5] p-4">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none">❌</span>
                <p className="text-sm leading-snug text-[#B30000] line-through decoration-[#FF1F1F] decoration-2">
                  {row.flagged_weakness}
                </p>
              </div>
            </div>
            <div className="border-r-2 border-black bg-[#E5FFE9] p-4">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none">✅</span>
                <p className="text-sm font-bold leading-snug text-[#005C1A]">{row.retaining_remedy}</p>
              </div>
            </div>
            <div className="bg-white p-4">
              <p className="text-xs leading-snug text-black">{row.why_it_works}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button onClick={copyAll} className={BTN_PRIMARY}>
          <Copy className="h-4 w-4" /> Copy All Rewritten Lines
        </button>
      </div>
    </div>
  );
}

function secondsToStamp(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function MatrixTab({ rows }: { rows: Analysis["editing_matrix"] }) {
  const WPM = 140;
  let cursor = 0;
  const enriched = rows.map((row) => {
    const stamp = secondsToStamp(cursor);
    const words = row.corrected_line.trim().split(/\s+/).filter(Boolean).length;
    cursor += (words / WPM) * 60;
    const technique =
      row.editing_technique?.trim() ||
      `${row.camera_framing} + ${row.b_roll_sound_fx}`;
    return { line: row.corrected_line, stamp, technique };
  });

  const exportPdf = () => {
    if (typeof window === "undefined") return;
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
    if (!w) return;
    const rowsHtml = enriched
      .map(
        (r) => `
        <tr>
          <td>${escapeHtml(r.line)}</td>
          <td style="white-space:nowrap;font-family:monospace;">${r.stamp}</td>
          <td>${escapeHtml(r.technique)}</td>
        </tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><title>Editor Briefing</title>
      <style>
        body{font-family:Helvetica,Arial,sans-serif;color:#000;padding:32px;}
        h1{font-size:22px;margin:0 0 16px;}
        table{width:100%;border-collapse:collapse;font-size:13px;}
        th,td{border:1.5px solid #000;padding:10px;text-align:left;vertical-align:top;}
        th{background:#000;color:#fff;font-size:11px;letter-spacing:.08em;text-transform:uppercase;}
      </style></head><body>
      <h1>Editor Briefing</h1>
      <table><thead><tr><th>Line</th><th>Timestamp</th><th>Editing Technique</th></tr></thead>
      <tbody>${rowsHtml}</tbody></table>
      <script>window.onload=()=>{window.print();}<\/script>
      </body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Scissors className="h-5 w-5 text-black" />
        <h3 className="font-serif text-xl font-bold text-black">Editor Briefing</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Hand this directly to your editor. Timestamps are calculated at 140 words per minute.
      </p>
      <div className="overflow-hidden border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-black text-xs uppercase tracking-widest text-white">
              <tr>
                <th className="border-r-2 border-white/20 px-4 py-3 font-mono font-bold">Line</th>
                <th className="w-24 border-r-2 border-white/20 px-4 py-3 font-mono font-bold">Timestamp</th>
                <th className="px-4 py-3 font-mono font-bold">Editing Technique</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((row, idx) => (
                <tr key={idx} className={`border-t-2 border-black ${idx % 2 === 0 ? "bg-white" : "bg-secondary"}`}>
                  <td className="border-r-2 border-black px-4 py-4 align-top">
                    <p className="text-sm font-bold leading-snug text-black">"{row.line}"</p>
                  </td>
                  <td className="border-r-2 border-black px-4 py-4 align-top font-mono text-sm font-bold text-black">
                    {row.stamp}
                  </td>
                  <td className="px-4 py-4 align-top text-sm font-semibold text-black">{row.technique}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-center">
        <button onClick={exportPdf} className={BTN_PRIMARY}>
          <Printer className="h-4 w-4" /> Export as PDF
        </button>
      </div>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
                disabled={status === "loading" || !script.trim()}
                className={`${BTN_PRIMARY} mt-4 w-full py-3.5 text-base`}
              >
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Fix My Script ➔ Lock Your Loop
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
                    Compiling retention blueprint…
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
                    <AnalysisTab a={analysis.analysis} />
                  </TabsContent>
                  <TabsContent value="doctor">
                    <DoctorTab rows={analysis.script_doctor} />
                  </TabsContent>
                  <TabsContent value="matrix">
                    <MatrixTab rows={analysis.editing_matrix} />
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