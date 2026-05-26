import { useState } from "react";
import {
  Loader2,
  Sparkles,
  Scissors,
  AlertTriangle,
  Zap,
  Stethoscope,
  ArrowRight,
  Copy,
  Printer,
  Lock,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type Analysis = {
  analysis: {
    video_score: number;
    score_justification: string;
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
  full_rewritten_script: string;
};

const CARD = "border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000]";
const PANE = "border-2 border-black bg-white shadow-[8px_8px_0px_0px_#000000]";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 border-2 border-black bg-[#00E5D1] px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] disabled:cursor-not-allowed disabled:opacity-70";

export const WORD_LIMIT = 600;

export type Strictness = "Trim Only" | "Balanced" | "Hyper-Short";

export function getStrictnessConfig(s: Strictness) {
  switch (s) {
    case "Trim Only":
      return { reductionPct: 12, wpm: 135, wpmLabel: "135 WPM (Cinematic Pacing)" };
    case "Hyper-Short":
      return { reductionPct: 59, wpm: 160, wpmLabel: "160 WPM (Retention-Max Velocity)" };
    case "Balanced":
    default:
      return { reductionPct: 28, wpm: 145, wpmLabel: "145 WPM (Energetic Storytelling)" };
  }
}

export function wordCount(text: string): number {
  return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

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
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="block h-auto w-full max-w-full border-2 border-black bg-white"
    >
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

type LeakPoint = {
  timestamp: number;
  sentenceSnippet: string;
};

function computeScriptMetrics(
  a: Analysis["analysis"],
  script: string,
): { leaks: LeakPoint[]; totalWords: number; avgPacing: number } {
  const WPM = 140;
  const sentences = (script || "")
    .split(/(?<=[.?!…])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const interp = (arr: number[], totalSpan: number, t: number) => {
    if (!arr || arr.length < 2) return 0;
    const clamped = Math.max(0, Math.min(totalSpan, t));
    const step = totalSpan / (arr.length - 1);
    const idxF = clamped / step;
    const i0 = Math.floor(idxF);
    const i1 = Math.min(arr.length - 1, i0 + 1);
    const frac = idxF - i0;
    return arr[i0] + (arr[i1] - arr[i0]) * frac;
  };

  let cursor = 0;
  const points: { second: number; original: number; sentence: string }[] = [];
  sentences.forEach((s) => {
    const words = s.split(/\s+/).filter(Boolean).length || 1;
    const dur = (words / WPM) * 60;
    const mid = cursor + dur / 2;
    points.push({
      second: Math.round(mid * 10) / 10,
      original: interp(a.original_chart_data, 30, mid),
      sentence: s,
    });
    cursor += dur;
  });

  const leaks: LeakPoint[] = [];
  for (let i = 1; i < points.length; i++) {
    const drop = points[i - 1].original - points[i].original;
    if (drop >= 8) {
      const snippet = points[i].sentence.split(/\s+/).slice(0, 8).join(" ");
      leaks.push({ timestamp: points[i].second, sentenceSnippet: snippet });
    }
  }

  const totalWords = sentences.reduce(
    (n, s) => n + (s.split(/\s+/).filter(Boolean).length || 0),
    0,
  );
  const totalDuration = points.length ? Math.max(30, points[points.length - 1].second + 1) : 30;
  const avgPacing = totalDuration > 0 && totalWords > 0
    ? Math.round((totalWords / totalDuration) * 60)
    : WPM;

  return { leaks, totalWords, avgPacing };
}

function AnalysisTab({
  a,
  script,
  onJumpToDoctor,
  strictness,
  optimizedWords,
}: {
  a: Analysis["analysis"];
  script: string;
  onJumpToDoctor: () => void;
  strictness: Strictness;
  optimizedWords: number;
}) {
  const score = Math.max(1, Math.min(10, Math.round(a.video_score)));
  const scoreColor = score < 5 ? "#FF5E5E" : score <= 7 ? "#FFB627" : "#00C853";
  const metrics = computeScriptMetrics(a, script);
  const { leaks } = metrics;
  const cfg = getStrictnessConfig(strictness);
  const totalWords = wordCount(script);
  const trimPct = totalWords > 0 ? Math.round(((totalWords - optimizedWords) / totalWords) * 100) : 0;
  type Leak = (typeof leaks)[number];
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
        {a.score_justification && (
          <p className="mt-3 max-w-xl font-mono text-[11px] font-bold uppercase tracking-wider text-black/80">
            {a.score_justification}
          </p>
        )}
        <p className="mt-4 max-w-xl font-serif text-base font-semibold leading-snug text-black md:text-lg">
          {a.plain_summary}
        </p>
      </div>

      {/* Retention chart + stats */}
      <RetentionChartBlock a={a} script={script} strictness={strictness} optimizedWords={optimizedWords} />

      {/* Plain cards */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className={`${CARD} p-5`} style={{ backgroundColor: "#FFD7D7" }}>
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-black">
            ❌ Attention Drops (Before)
          </div>
          {leaks.length === 0 ? (
            <p className="mt-2 text-sm font-semibold leading-snug text-black md:text-base">
              No critical attention drops detected in this script.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {leaks.map((leak: Leak, i: number) => (
                <li
                  key={i}
                  className="text-sm font-semibold leading-snug text-black md:text-[15px]"
                >
                  {`• ${leak.timestamp}s — Critical drop-off marker. Syllable density or passive language causing viewer friction near: "${leak.sentenceSnippet}..."`}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 inline-block border-2 border-black bg-white px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_#000]">
            Original Pace: {metrics.avgPacing} WPM
          </div>
        </div>
        <div className={`${CARD} p-5`} style={{ backgroundColor: "#CFFFD7" }}>
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-black">
            ✅ The Fixes (After)
          </div>
          <ul className="mt-2 space-y-1.5 text-sm font-semibold leading-snug text-black md:text-[15px]">
            <li>
              • Word Volumetric Reduction: {totalWords} Words ➔ {optimizedWords} Words
            </li>
            <li>• Script compressed by {trimPct}%</li>
          </ul>
          <div className="mt-3 inline-block border-2 border-black bg-white px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_#000]">
            Suggested Target Pacing: {cfg.wpmLabel}
          </div>
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

function RetentionChartBlock({
  a,
  script,
  strictness,
  optimizedWords: optimizedWordsProp,
}: {
  a: Analysis["analysis"];
  script: string;
  strictness: Strictness;
  optimizedWords?: number;
}) {
  // Build dynamic per-sentence dataset
  const cfg = getStrictnessConfig(strictness);
  const WPM = cfg.wpm;
  const sentences = (script || "")
    .split(/(?<=[.?!…])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const interp = (arr: number[], totalSpan: number, t: number) => {
    if (!arr || arr.length < 2) return 0;
    const clamped = Math.max(0, Math.min(totalSpan, t));
    const step = totalSpan / (arr.length - 1);
    const idxF = clamped / step;
    const i0 = Math.floor(idxF);
    const i1 = Math.min(arr.length - 1, i0 + 1);
    const frac = idxF - i0;
    return arr[i0] + (arr[i1] - arr[i0]) * frac;
  };

  type Pt = {
    second: number;
    original: number;
    optimized: number;
    sentenceText: string;
    wpm: number;
    isLeakWarning: boolean;
  };

  let cursor = 0;
  const raw: Omit<Pt, "isLeakWarning">[] = [];
  if (sentences.length === 0) {
    // fallback so chart still renders
    for (let i = 0; i <= 10; i++) {
      const t = i * 3;
      raw.push({
        second: t,
        original: interp(a.original_chart_data, 30, t),
        optimized: interp(a.optimized_chart_data, 30, t),
        sentenceText: "(no script provided)",
        wpm: WPM,
      });
    }
  } else {
    sentences.forEach((s) => {
      const words = s.split(/\s+/).filter(Boolean).length || 1;
      const dur = (words / WPM) * 60;
      const mid = cursor + dur / 2;
      // per-sentence "delivery" wpm with light deterministic variance
      const lenFactor = Math.max(-25, Math.min(25, (10 - words) * 2));
      const punchy = /[?!]$/.test(s) ? 12 : 0;
      const wpm = Math.round(WPM + lenFactor + punchy);
      raw.push({
        second: Math.round(mid * 10) / 10,
        original: interp(a.original_chart_data, 30, mid),
        optimized: interp(a.optimized_chart_data, 30, mid),
        sentenceText: s,
        wpm,
      });
      cursor += dur;
    });
  }

  const data: Pt[] = raw.map((p, i) => {
    const prev = raw[i - 1];
    const drop = prev ? prev.original - p.original : 0;
    return {
      ...p,
      original: Math.round(p.original * 10) / 10,
      optimized: Math.round(p.optimized * 10) / 10,
      isLeakWarning: drop >= 8,
    };
  });

  const totalWords = wordCount(script);
  const optimizedWords =
    typeof optimizedWordsProp === "number" && optimizedWordsProp > 0
      ? optimizedWordsProp
      : Math.max(1, Math.round(totalWords * (1 - cfg.reductionPct / 100)));
  const trueDurationInSeconds = Math.max(
    1,
    Math.round((optimizedWords / cfg.wpm) * 60),
  );
  const avgPacing = cfg.wpm;
  const leakCount = data.filter((d) => d.isLeakWarning).length;

  const ChartTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: Pt }> }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    return (
      <div className="max-w-xs border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_#000000]">
        <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60">
          @ {p.second.toFixed(1)}s · {p.wpm} WPM
        </div>
        <p className="mt-1 font-serif text-sm font-bold leading-snug text-black">
          "{p.sentenceText}"
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="border-2 border-black bg-[#FFE5E5] px-2 py-1 text-center">
            <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-black">Original</div>
            <div className="font-serif text-base font-extrabold text-black">{p.original.toFixed(0)}%</div>
          </div>
          <div className="border-2 border-black bg-[#E5FFE9] px-2 py-1 text-center">
            <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-black">Fixed</div>
            <div className="font-serif text-base font-extrabold text-black">{p.optimized.toFixed(0)}%</div>
          </div>
        </div>
        {p.isLeakWarning && (
          <div className="mt-2 border-2 border-black bg-[#FF5E5E] px-2 py-1 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-black">
            ⚠ Retention Leak
          </div>
        )}
      </div>
    );
  };

  const WarningDot = (props: { cx?: number; cy?: number; payload?: Pt }) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null || !payload) return <g />;
    if (payload.isLeakWarning) {
      return <circle cx={cx} cy={cy} r={7} fill="#ff6b6b" stroke="#000" strokeWidth={3} />;
    }
    return <circle cx={cx} cy={cy} r={3} fill="#ff6b6b" stroke="#000" strokeWidth={1.5} />;
  };

  return (
    <div className={`${CARD} min-w-0 p-3 sm:p-4`} style={{ backgroundColor: "#FFFDF5" }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-serif text-base font-bold text-black">Retention Curve · Original vs Fixed</h4>
          <div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-[3px] w-5" style={{ backgroundColor: "#ff6b6b" }} /> Original
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-[2px] w-5"
                style={{ backgroundImage: "linear-gradient(to right, #4ade80 50%, transparent 50%)", backgroundSize: "8px 2px" }}
              />
              Fixed
            </span>
          </div>
        </div>
        <div className="mt-3 h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="#000" strokeOpacity={0.12} />
              <XAxis
                dataKey="second"
                type="number"
                domain={[0, trueDurationInSeconds]}
                tick={{ fontFamily: "monospace", fontSize: 10, fill: "#000" }}
                stroke="#000"
                tickFormatter={(v) => `${v}s`}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontFamily: "monospace", fontSize: 10, fill: "#000" }}
                stroke="#000"
                tickFormatter={(v) => `${v}%`}
              />
              <ReferenceLine y={65} stroke="#FF1F1F" strokeDasharray="4 3" />
              <RTooltip content={<ChartTooltip />} cursor={{ stroke: "#000", strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Line
                type="monotone"
                dataKey="original"
                name="Original"
                stroke="#ff6b6b"
                strokeWidth={3}
                dot={<WarningDot />}
                activeDot={{ r: 6, fill: "#ff6b6b", stroke: "#000", strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="optimized"
                name="Fixed"
                stroke="#4ade80"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: "#4ade80", stroke: "#000", strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: "#4ade80", stroke: "#000", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Real-time stats summary */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_#000000]">
            Total Words <span className="border-2 border-black bg-[#00E5D1] px-1.5">{totalWords}</span>
          </span>
          <span className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_#000000]">
            Avg Pacing <span className="border-2 border-black bg-[#FFD93D] px-1.5">{avgPacing} WPM</span>
          </span>
          <span className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_#000000]">
            Retention Leaks <span className="border-2 border-black bg-[#FF5E5E] px-1.5 text-black">{leakCount}</span>
          </span>
        </div>
    </div>
  );
}

function StrictnessPicker({
  value,
  onChange,
}: {
  value: Strictness;
  onChange: (v: Strictness) => void;
}) {
  const opts: { v: Strictness; bg: string }[] = [
    { v: "Trim Only", bg: "#FFD93D" },
    { v: "Balanced", bg: "#00E5D1" },
    { v: "Hyper-Short", bg: "#FF5E5E" },
  ];
  return (
    <div className={`${CARD} p-4`} style={{ backgroundColor: "#FFFDF5" }}>
      <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-black">
        Optimization Strictness
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {opts.map((o) => {
          const active = value === o.v;
          return (
            <button
              key={o.v}
              type="button"
              onClick={() => onChange(o.v)}
              className={`border-2 border-black px-3 py-3 font-mono text-xs font-extrabold uppercase tracking-widest text-black transition-all ${
                active
                  ? "shadow-[4px_4px_0px_0px_#000] translate-x-0 translate-y-0"
                  : "bg-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px]"
              }`}
              style={active ? { backgroundColor: o.bg } : undefined}
            >
              {o.v}
            </button>
          );
        })}
      </div>
      <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-black/70">
        Active: {getStrictnessConfig(value).wpmLabel} · Target Trim {getStrictnessConfig(value).reductionPct}%
      </div>
    </div>
  );
}

type DoctorRow = {
  originalText: string;
  rewritten: Record<Strictness, string>;
  whyItWorks: Record<Strictness, string>;
};

function buildDoctorRowFromSentence(sentence: string): DoctorRow {
  const orig = sentence.trim();
  const filler =
    /\b(so|like|basically|honestly|literally|actually|just|really|very|um+|uh+|kind of|sort of|you know|right\?)\b\,?/gi;
  const trimOnly = orig
    .replace(filler, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/^[,\s]+/, "")
    .trim();

  // Balanced: passive→active swaps + tighten verbose phrases, target ~25-30% shorter
  let balanced = trimOnly
    .replace(/\bis being\b/gi, "is")
    .replace(/\bwas being\b/gi, "was")
    .replace(/\bin order to\b/gi, "to")
    .replace(/\bdue to the fact that\b/gi, "because")
    .replace(/\bat this point in time\b/gi, "now")
    .replace(/\ba lot of\b/gi, "many")
    .replace(/\b(quite|simply|that|then)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();
  const origWords = orig.split(/\s+/).filter(Boolean);
  const balancedWords = balanced.split(/\s+/).filter(Boolean);
  const targetLen = Math.max(3, Math.ceil(origWords.length * 0.72));
  if (balancedWords.length > targetLen) {
    balanced = balancedWords.slice(0, targetLen).join(" ");
    if (!/[.!?]$/.test(balanced)) balanced += ".";
  }
  if (!balanced) balanced = trimOnly || orig;

  // Hyper-Short: high-impact core, 5-7 words
  const baseForHyper = (balanced || trimOnly || orig).split(/[,;:]/)[0] || balanced;
  const hWords = baseForHyper.split(/\s+/).filter(Boolean).slice(0, 6);
  let hyperShort = hWords.join(" ").replace(/[,;:]+$/, "");
  if (hyperShort && !/[.!?]$/.test(hyperShort)) hyperShort += ".";
  if (!hyperShort) hyperShort = balanced;

  return {
    originalText: orig,
    rewritten: {
      "Trim Only": trimOnly || orig,
      Balanced: balanced || orig,
      "Hyper-Short": hyperShort || orig,
    },
    whyItWorks: {
      "Trim Only": "Filler purged. Core syntax preserved.",
      Balanced: "Passive → active. ~25-30% tighter for energetic pacing.",
      "Hyper-Short": "Core hook only. Maximum pattern interrupt.",
    },
  };
}

function splitScriptToSentences(text: string): string[] {
  const matches = text.match(/[^.!?\n]+[.!?]+/g);
  const arr = matches && matches.length
    ? matches
    : text.split(/\n+/).filter(Boolean);
  return arr.map((s) => s.trim()).filter(Boolean);
}

function DoctorTab({
  rows,
  strictness,
  setStrictness,
  isProUser,
}: {
  rows: DoctorRow[];
  strictness: Strictness;
  setStrictness: (s: Strictness) => void;
  isProUser: boolean;
}) {
  const activeStrictness: Strictness = isProUser ? strictness : "Balanced";
  const copyAll = async () => {
    const text = rows
      .map(
        (row) =>
          row.rewritten[activeStrictness] ||
          row.rewritten["Balanced"] ||
          row.originalText,
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* no-op */
    }
  };
  return (
    <div className="space-y-5">
      {isProUser && <StrictnessPicker value={strictness} onChange={setStrictness} />}
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
                  {row.originalText}
                </p>
              </div>
            </div>
            <div className="border-r-2 border-black bg-[#E5FFE9] p-4">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none">✅</span>
                <p className="text-sm font-bold leading-snug text-[#005C1A]">
                  {row.rewritten[activeStrictness] ||
                    row.rewritten["Balanced"] ||
                    row.originalText}
                </p>
              </div>
            </div>
            <div className="bg-white p-4">
              <p className="text-xs leading-snug text-black">
                {row.whyItWorks[activeStrictness] ||
                  row.whyItWorks["Balanced"] ||
                  ""}
              </p>
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

function MatrixTab({
  rows,
  strictness,
  optimizedWords,
}: {
  rows: Analysis["editing_matrix"];
  strictness: Strictness;
  optimizedWords: number;
}) {
  const cfg = getStrictnessConfig(strictness);
  const trueDurationInSeconds = Math.max(
    1,
    Math.round((Math.max(1, optimizedWords) / cfg.wpm) * 60),
  );
  // Strictness-driven interval band: Hyper-Short 2-4s, Balanced 4-7s, Trim Only 7-10s
  const band =
    strictness === "Hyper-Short"
      ? { min: 2, max: 4 }
      : strictness === "Trim Only"
        ? { min: 7, max: 10 }
        : { min: 4, max: 7 };
  const n = Math.max(rows.length, 1);
  // ideal evenly-spaced interval so the last stamp ≈ trueDurationInSeconds
  const idealInterval = trueDurationInSeconds / n;
  const interval = Math.max(band.min, Math.min(band.max, idealInterval));
  let cursor = 0;
  const enriched = rows.map((row, i) => {
    // last row snapped to trueDurationInSeconds
    const t = i === rows.length - 1 ? trueDurationInSeconds : cursor;
    const stamp = secondsToStamp(t);
    cursor += interval;
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
        Hand this directly to your editor. Timestamps scaled for {cfg.wpmLabel} ·
        final cue lands at {secondsToStamp(trueDurationInSeconds)}.
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

function FullScriptCard({ script }: { script: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* no-op */
    }
  };
  if (!script) return null;
  return (
    <div className={`${CARD} mt-6 p-5`} style={{ backgroundColor: "#FFFDF5" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-black" />
          <h3 className="font-serif text-lg font-bold text-black">Full Optimized Script</h3>
        </div>
        <button onClick={copy} className={BTN_PRIMARY}>
          <Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy Entire Script"}
        </button>
      </div>
      <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap border-2 border-black bg-white p-4 font-mono text-sm leading-relaxed text-black">
        {script}
      </pre>
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
  const [strictness, setStrictness] = useState<Strictness>("Balanced");
  const [isProUser, setIsProUser] = useState<boolean>(false);
  const FREE_LIMIT = 3;
  const [creditsRemaining, setCreditsRemaining] = useState<number>(FREE_LIMIT);
  const outOfCredits = creditsRemaining <= 0;
  const currentWordCount = wordCount(script);
  const isOverLimit = currentWordCount > WORD_LIMIT;

  // Sentence-level Script Doctor pipeline: derive rows from the user's actual script.
  const activeStrictness: Strictness = isProUser ? strictness : "Balanced";
  const sentenceList = splitScriptToSentences(script);
  const doctorRows: DoctorRow[] = sentenceList.map(buildDoctorRowFromSentence);
  const finalAggregatedParagraphText = doctorRows
    .map((r) => r.rewritten[activeStrictness] || r.rewritten["Balanced"] || r.originalText)
    .join(" ")
    .trim();
  const optimizedWordCount = wordCount(finalAggregatedParagraphText);

  const onAnalyze = async () => {
    if (!script.trim()) return;
    if (outOfCredits) return;
    if (isOverLimit) return;
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
      setCreditsRemaining((c) => Math.max(0, c - 1));
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
          <div className="flex flex-wrap items-center gap-3">
            <Pill bg="#00FF66">
              <span className="h-1.5 w-1.5 bg-black" /> ◤ LoopLock Workspace
            </Pill>
            <Pill bg={outOfCredits ? "#FF5E5E" : "#FFD93D"}>
              {outOfCredits ? <Lock className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
              Free Credits Remaining: {creditsRemaining}/{FREE_LIMIT}
            </Pill>
          </div>
          <h1 className="mt-4 font-serif text-4xl font-bold text-black md:text-5xl">Paste a script. Ship a banger.</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Pre-production retention audit · loop-lock your script before the camera rolls
          </p>
        </div>

        <section>
          <WindowPane title="input.txt" accent="#9FE7F5">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Drop ANY raw script here (English, Telugu, Hinglish, any language)…"
                rows={16}
                className="w-full resize-none border-2 border-black bg-white p-4 font-mono text-sm leading-relaxed text-black placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-black">
                <span className="inline-flex items-center gap-2 border-2 border-black bg-white px-2 py-1 shadow-[2px_2px_0px_0px_#000]">
                  Total Words
                  <span className={`border-2 border-black px-1.5 ${isOverLimit ? "bg-[#FF6B6B]" : "bg-[#00E5D1]"}`}>
                    {currentWordCount}
                  </span>
                  <span className="text-black/60">/ {WORD_LIMIT}</span>
                </span>
              </div>
              {isOverLimit && (
                <div
                  className="mt-3 border-2 border-black p-3 font-mono text-xs font-extrabold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_#000]"
                  style={{ backgroundColor: "#FF6B6B" }}
                >
                  ⚠️ SCRIPT LENGTH EXCEEDED: {currentWordCount} / {WORD_LIMIT} Words Max. Please trim your draft to optimize for high-retention short-form video.
                </div>
              )}
              <button
                onClick={onAnalyze}
                disabled={status === "loading" || !script.trim() || outOfCredits || isOverLimit}
                className={`${BTN_PRIMARY} mt-4 w-full py-3.5 text-base`}
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : outOfCredits ? (
                  <Lock className="h-4 w-4" />
                ) : isOverLimit ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {outOfCredits
                  ? "Free Credits Used Up"
                  : isOverLimit
                    ? "Trim Below 600 Words to Analyze"
                    : "Analyze My Script ➔ See Results"}
              </button>
              {outOfCredits && (
                <div
                  className={`${CARD} mt-5 p-5`}
                  style={{ backgroundColor: "#FFD93D" }}
                >
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-black" />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-black">
                      Free tier locked
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl font-extrabold text-black">
                    Unlock Unlimited Audits
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-black">
                    You've used all 3 free script audits. Upgrade to keep loop-locking every script before you film.
                  </p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-serif text-4xl font-extrabold text-black">₹499</span>
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-black">/ month</span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm font-semibold text-black">
                    <li>✅ Unlimited script audits</li>
                    <li>✅ Full rewritten scripts + editor briefings</li>
                    <li>✅ Single tier · cancel anytime</li>
                  </ul>
                  <button
                    type="button"
                    className={`${BTN_PRIMARY} mt-4 w-full py-3 text-base`}
                    style={{ backgroundColor: "#00FF66" }}
                  >
                    <Sparkles className="h-4 w-4" /> Upgrade to Unlimited
                  </button>
                </div>
              )}
          </WindowPane>
        </section>

        {status !== "done" && (
          <section className="mt-6">
            <WindowPane title="output.exe" accent="#FFD93D">
              {status === "idle" && !error && (
                <div className="flex h-[280px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center border-2 border-black bg-[#00FF66] shadow-[4px_4px_0px_0px_#000000]">
                    <Sparkles className="h-7 w-7 text-black" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-bold text-black">Your blueprint will appear here</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Paste a raw script and run the audit — Analysis, Script Doctor, and Editing Matrix unlock below.
                  </p>
                </div>
              )}
              {status === "idle" && error && (
                <div className="flex h-[280px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center border-2 border-black bg-[#FF5E5E] shadow-[4px_4px_0px_0px_#000000]">
                    <AlertTriangle className="h-7 w-7 text-black" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-black">Analysis failed</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
                </div>
              )}
              {status === "loading" && (
                <div className="flex h-[280px] flex-col items-center justify-center text-center">
                  <div className="border-2 border-black bg-[#FFD93D] p-5 shadow-[4px_4px_0px_0px_#000000]">
                    <Loader2 className="h-10 w-10 animate-spin text-black" />
                  </div>
                  <p className="mt-5 font-mono text-sm font-bold uppercase tracking-wider text-black">
                    Compiling retention blueprint…
                  </p>
                </div>
              )}
            </WindowPane>
          </section>
        )}

        {status === "done" && analysis && (
          <div className="mt-6 flex w-full flex-col gap-6">
            {/* Tier toggle (demo) */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60">
                Tier:
              </span>
              <button
                type="button"
                onClick={() => setIsProUser((v) => !v)}
                className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_#000]"
              >
                {isProUser ? "⚡ Pro" : "🔒 Free"} · Toggle
              </button>
            </div>

            <section className="w-full">
              <WindowPane title="analysis.exe" accent="#FFD93D">
                <AnalysisTab
                  a={analysis.analysis}
                  script={script}
                  onJumpToDoctor={() => {
                    if (typeof document !== "undefined") {
                      document
                        .getElementById("script-doctor-section")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  strictness={activeStrictness}
                  optimizedWords={optimizedWordCount}
                />
              </WindowPane>
            </section>

            <section id="script-doctor-section" className="w-full">
              <WindowPane title="script-doctor.exe" accent="#FFD93D">
                <DoctorTab
                  rows={doctorRows}
                  strictness={strictness}
                  setStrictness={setStrictness}
                  isProUser={isProUser}
                />
                <FullScriptCard script={finalAggregatedParagraphText} />
              </WindowPane>
            </section>

            <section className="w-full">
              <WindowPane title="editing-matrix.exe" accent="#FFD93D">
                <MatrixTab
                  rows={analysis.editing_matrix}
                  strictness={activeStrictness}
                  optimizedWords={optimizedWordCount}
                />
              </WindowPane>
            </section>
          </div>
        )}

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