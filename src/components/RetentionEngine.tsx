import { useState } from "react";
import { Loader2, Sparkles, Flame, Scissors, AlertTriangle, Zap, RefreshCw, Copy, Check, Languages } from "lucide-react";

type MatrixRow = { time: string; line: string; lineRoman: string; directive: string };

const HOOKS = [
  { label: "Negative Frame", text: "మీరు రోజూ 4 గంటలు ఇమెయిల్స్‌లో వృథా చేస్తున్నారు. ఇది ఇప్పుడే ఆపండి." },
  { label: "Curiosity Gap", text: "ఈ 5-నిమిషాల ఆటోమేషన్ ఇమెయిల్స్‌ను తమంతట తామే రిప్లై ఇచ్చేలా చేస్తుంది." },
  { label: "In Medias Res", text: "ఒక స్క్రిప్ట్ 3 సెకన్లలో 400 క్లయింట్ ఇమెయిల్స్ క్లియర్ చేయడం నేను చూశాను." },
];

const ALT_DIRECTIVES: Record<string, string[]> = {
  "0:00": [
    "Hard cut-in, face fills frame. SFX: glitch whoosh. Bold red text overlay: '4 గంటలు పోయాయి'.",
    "Cold open with screen-shake. SFX: cinematic boom. Typewriter caption: 'ఆగండి.'",
    "Extreme close-up on eyes. SFX: heartbeat. Caption flashes: 'ఇది చూడండి'.",
  ],
  "0:03": [
    "Punch-in zoom 110%. B-roll: cluttered inbox screen recording. Subtle bass drop.",
    "Jump cut to wide shot. B-roll: hands gripping phone. Tense synth pad.",
    "Whip-pan to monitor. B-roll: 5,000 unread badge. SFX: notification stack.",
  ],
  "0:06": [
    "Cut to code editor b-roll. Keyboard typing SFX. Lower-third Telugu caption animates in.",
    "Split-screen: face + terminal. Mechanical click loop. Caption slides from left.",
    "Over-shoulder shot of laptop. Code highlights neon green. Soft pad swells.",
  ],
  "0:10": [
    "Whip-pan transition. Numbered overlay: 'STEP 1'. Tempo lifts +10 BPM.",
    "Hard cut + zoom punch. Big '1' fills screen. Drum fill into beat.",
    "Glitch wipe. Stepper UI animates 1/3. Riser SFX builds.",
  ],
  "0:14": [
    "Screen capture: AI parsing animation. Highlighted Telugu keywords pulse green.",
    "Mockup of model 'reading' inbox. Particle trail follows cursor. Soft chime.",
    "Macro of text scrolling. Voice waveform overlay. Subtle vinyl crackle.",
  ],
  "0:18": [
    "Phone mockup b-roll, thumb tap. Satisfying click SFX. Slow-mo on the tap (4 frames).",
    "Top-down shot of phone. Haptic thump SFX. Approve button glows green.",
    "Hand-held POV of approving reply. Whoosh + UI pop. Frame freezes on send.",
  ],
  "0:22": [
    "Return to face shot. Caption: 'లింక్ బయోలో ఉంది' shakes. End with abrupt silence freeze.",
    "Smash cut to wide. Arrow points up to bio. Beat drops out for 1 frame.",
    "Direct eye contact. CTA pulses with kick drum. Hard cut to black.",
  ],
};

const INITIAL_MATRIX: MatrixRow[] = [
  { time: "0:00", line: "మీరు రోజూ 4 గంటలు ఇమెయిల్స్‌లో వృథా చేస్తున్నారు.", lineRoman: "Meeru roju 4 gantalu emails lo vrutha chestunnaru.", directive: ALT_DIRECTIVES["0:00"][0] },
  { time: "0:03", line: "ఇది ఇప్పుడే ఆపండి — మంచి మార్గం ఉంది.", lineRoman: "Idi ippude apandi — manchi margam undi.", directive: ALT_DIRECTIVES["0:03"][0] },
  { time: "0:06", line: "మీ టోన్‌లోనే ఆటో-రిప్లై ఇచ్చే స్క్రిప్ట్ నేను రూపొందించాను.", lineRoman: "Mee tone lone auto-reply iche script nenu roopondinchanu.", directive: ALT_DIRECTIVES["0:06"][0] },
  { time: "0:10", line: "15 సెకన్లలో ఇది ఎలా పనిచేస్తుందో చూడండి.", lineRoman: "15 secondula lo idi ela panicheystundo choodandi.", directive: ALT_DIRECTIVES["0:10"][0] },
  { time: "0:14", line: "ఇది మీ చివరి 100 ఇమెయిల్స్ చదివి మీ వాయిస్ నేర్చుకుంటుంది.", lineRoman: "Idi mee chivari 100 emails chadivi mee voice nerchukuntundi.", directive: ALT_DIRECTIVES["0:14"][0] },
  { time: "0:18", line: "తర్వాత ఒక్క ట్యాప్‌తో అప్రూవ్ చేసే రిప్లై తయారు చేస్తుంది.", lineRoman: "Tarvata okka tap to approve chese reply tayaru chestundi.", directive: ALT_DIRECTIVES["0:18"][0] },
  { time: "0:22", line: "గత వారం నేను 19 గంటలు సేవ్ చేశాను. లింక్ బయోలో ఉంది.", lineRoman: "Gata varam nenu 19 gantalu save chesanu. Link bio lo undi.", directive: ALT_DIRECTIVES["0:22"][0] },
];

function PlaceholderState() {
  return (
    <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/30">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Your video blueprint will appear here</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Drop a raw script in any language. We'll auto-detect everything and return a retention-first cut.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-2xl border border-border bg-card/40 p-10 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-5 text-sm font-medium text-foreground">Detecting language &amp; analyzing retention curve…</p>
      <p className="mt-1 text-xs text-muted-foreground">Auto-routing platform style, rewriting hooks, building editing matrix.</p>
    </div>
  );
}

function ResultView() {
  const [rows, setRows] = useState<MatrixRow[]>(INITIAL_MATRIX);
  const [copied, setCopied] = useState(false);

  const regenerate = (i: number) => {
    setRows((prev) => {
      const next = [...prev];
      const opts = ALT_DIRECTIVES[next[i].time] ?? [next[i].directive];
      const pool = opts.filter((o) => o !== next[i].directive);
      next[i] = { ...next[i], directive: pool[Math.floor(Math.random() * pool.length)] ?? opts[0] };
      return next;
    });
  };

  const onCopy = async () => {
    const text = rows
      .map((r) => `${r.time}\t${r.line}\t${r.directive}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-6">
      {/* Auto-detected pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Languages className="h-3 w-3" /> Detected: Telugu
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
          Platform: Instagram Reels
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
          Style: High-Energy Viral
        </span>
      </div>

      {/* Retention Audit */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5" />
          Retention Audit
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/15 px-4 py-1.5 text-sm font-semibold text-destructive">
            <Flame className="h-4 w-4" />
            Drop-off Risk: 8/10 — High Threat
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Fluff Diagnosis:</span> మొదటి 8 సెకన్లు "welcome back" అని
          మీ గురించి మాట్లాడుతూ వృథా చేశారు. వీక్షకులు వెంటనే స్వైప్ చేస్తారు.
        </p>
      </section>

      {/* Rewritten Hooks */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-primary" />
          Rewritten Viral Hooks
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {HOOKS.map((h, i) => (
            <div
              key={h.label}
              className="group relative overflow-hidden rounded-xl border border-border bg-secondary/40 p-4 transition hover:border-primary/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Hook {i + 1}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{h.label}</span>
              </div>
              <p className="mt-3 text-sm font-medium leading-snug text-foreground">"{h.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editing Matrix */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Scissors className="h-3.5 w-3.5 text-primary" />
            Editing Matrix
          </div>
          <button
            onClick={onCopy}
            className={`group inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
              copied
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
            } shadow-[0_0_20px_-6px_oklch(0.78_0.18_155/0.6)] hover:shadow-[0_0_28px_-4px_oklch(0.78_0.18_155/0.8)]`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Blueprint"}
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-16 px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Spoken Line (Cleaned Telugu)</th>
                  <th className="px-4 py-3 font-semibold">Visual &amp; Audio Directives</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.time} className={idx % 2 === 0 ? "bg-card" : "bg-secondary/25"}>
                    <td className="whitespace-nowrap px-4 py-4 align-top font-mono text-xs text-primary">{row.time}</td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-foreground">{row.line}</p>
                      <p className="mt-1 text-xs italic text-muted-foreground/80">{row.lineRoman}</p>
                    </td>
                    <td className="px-4 py-4 align-top text-muted-foreground">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex-1">{row.directive}</span>
                        <button
                          onClick={() => regenerate(idx)}
                          aria-label="Regenerate cue"
                          title="Regenerate cue"
                          className="group/btn mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/40 text-muted-foreground transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                        >
                          <RefreshCw className="h-3.5 w-3.5 transition group-hover/btn:rotate-180" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export function RetentionEngine() {
  const [script, setScript] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const onAnalyze = () => {
    setStatus("loading");
    setTimeout(() => setStatus("done"), 1500);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[480px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Retention Engine</span>
          </div>
          <span className="hidden rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground sm:inline">
            v1.0 · Magic Box · Auto-detect everything
          </span>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* INPUT */}
          <section>
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Magic Box
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                The Retention <span className="text-primary">Engine</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground">
                Transform raw scripts into high-retention video blueprints — zero settings, zero friction.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Drop ANY raw script here (English, Telugu, Hinglish, or any language)... Our AI will automatically detect the language, platform style, and format your pacing blueprint instantly."
                rows={14}
                className="w-full resize-none rounded-xl border border-border bg-background/60 p-4 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />

              <button
                onClick={onAnalyze}
                disabled={status === "loading"}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-6px_oklch(0.78_0.18_155/0.6)] transition hover:shadow-[0_0_36px_-4px_oklch(0.78_0.18_155/0.75)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze &amp; Optimize Script
              </button>
            </div>
          </section>

          {/* OUTPUT */}
          <section>
            {status === "idle" && <PlaceholderState />}
            {status === "loading" && <LoadingState />}
            {status === "done" && <ResultView />}
          </section>
        </div>
      </div>
    </main>
  );
}