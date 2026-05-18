import { useState } from "react";
import { Loader2, Sparkles, Flame, Scissors, AlertTriangle, Zap, Link2, FileText, RefreshCw } from "lucide-react";

type Platform = "YouTube Shorts" | "Instagram Reels" | "TikTok";
type Aesthetic = "High-Energy Viral" | "Minimalist Corporate" | "Cinematic Documentary";
type Language = "English" | "Telugu" | "Hindi" | "Spanish";
type InputMode = "text" | "url";

type MatrixRow = { time: string; line: string; directive: string };

const HOOKS = [
  {
    label: "Negative Frame",
    text: "You are wasting 4 hours a day on emails. Stop doing this.",
  },
  {
    label: "Curiosity Gap",
    text: "This 5-minute automation forces emails to answer themselves.",
  },
  {
    label: "In Medias Res",
    text: "I watched this automated script delete 400 client emails in 3 seconds flat.",
  },
];

const MATRIX: MatrixRow[] = [
  {
    time: "0:00",
    line: "You are wasting 4 hours a day on emails.",
    directive: "Hard cut-in, face fills frame. SFX: glitch whoosh. Bold red text overlay: '4 HOURS GONE'.",
  },
  {
    time: "0:03",
    line: "Stop doing this — there is a better way.",
    directive: "Punch-in zoom 110%. B-roll: cluttered inbox screen recording. Subtle bass drop.",
  },
  {
    time: "0:06",
    line: "I built a script that auto-replies in your tone.",
    directive: "Cut to code editor b-roll. Keyboard typing SFX. Lower-third caption animates in.",
  },
  {
    time: "0:10",
    line: "Here is exactly how it works in 15 seconds.",
    directive: "Whip-pan transition. Numbered overlay: 'STEP 1'. Tempo lifts +10 BPM.",
  },
  {
    time: "0:14",
    line: "It reads your last 100 emails to learn your voice.",
    directive: "Screen capture: AI parsing animation. Highlighted keywords pulse green.",
  },
  {
    time: "0:18",
    line: "Then it drafts a reply you approve with one tap.",
    directive: "Phone mockup b-roll, thumb tap. Satisfying click SFX. Slow-mo on the tap (4 frames).",
  },
  {
    time: "0:22",
    line: "I saved 19 hours last week. The link is in my bio.",
    directive: "Return to face shot. Caption: 'LINK IN BIO' shakes. End with abrupt silence freeze.",
  },
];

function PlaceholderState() {
  return (
    <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/30">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Your video blueprint will appear here</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Paste a script, pick a platform, and we will reverse-engineer a retention-first cut, hook by hook.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-2xl border border-border bg-card/40 p-10 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-5 text-sm font-medium text-foreground">Analyzing retention curve…</p>
      <p className="mt-1 text-xs text-muted-foreground">Diagnosing fluff, rewriting hooks, generating editing matrix.</p>
    </div>
  );
}

const ALT_DIRECTIVES: Record<string, string[]> = {
  "0:00": [
    "Hard cut-in, face fills frame. SFX: glitch whoosh. Bold red text overlay: '4 HOURS GONE'.",
    "Cold open with screen-shake. SFX: cinematic boom. White text typewriter: 'STOP.'",
    "Extreme close-up on eyes. SFX: heartbeat. Caption flashes: 'WATCH THIS'.",
  ],
  "0:03": [
    "Punch-in zoom 110%. B-roll: cluttered inbox screen recording. Subtle bass drop.",
    "Jump cut to wide shot. B-roll: hands gripping phone. Tense synth pad.",
    "Whip-pan to monitor. B-roll: 5,000 unread badge. SFX: notification stack.",
  ],
  "0:06": [
    "Cut to code editor b-roll. Keyboard typing SFX. Lower-third caption animates in.",
    "Split-screen: face + terminal. Mechanical click loop. Caption slides from left.",
    "Over-shoulder shot of laptop. Code highlights neon green. Soft pad swells.",
  ],
  "0:10": [
    "Whip-pan transition. Numbered overlay: 'STEP 1'. Tempo lifts +10 BPM.",
    "Hard cut + zoom punch. Big '1' fills screen. Drum fill into beat.",
    "Glitch wipe. Stepper UI animates 1/3. Riser SFX builds.",
  ],
  "0:14": [
    "Screen capture: AI parsing animation. Highlighted keywords pulse green.",
    "Mockup of model 'reading' inbox. Particle trail follows cursor. Soft chime.",
    "Macro of text scrolling. Voice waveform overlay. Subtle vinyl crackle.",
  ],
  "0:18": [
    "Phone mockup b-roll, thumb tap. Satisfying click SFX. Slow-mo on the tap (4 frames).",
    "Top-down shot of phone. Haptic thump SFX. Approve button glows green.",
    "Hand-held POV of approving reply. Whoosh + UI pop. Frame freezes on send.",
  ],
  "0:22": [
    "Return to face shot. Caption: 'LINK IN BIO' shakes. End with abrupt silence freeze.",
    "Smash cut to wide. Arrow points up to bio. Beat drops out for 1 frame.",
    "Direct eye contact. CTA pulses with kick drum. Hard cut to black.",
  ],
};

function ResultView() {
  const [rows, setRows] = useState<MatrixRow[]>(MATRIX);
  const regenerate = (i: number) => {
    setRows((prev) => {
      const next = [...prev];
      const opts = ALT_DIRECTIVES[next[i].time] ?? [next[i].directive];
      const current = next[i].directive;
      const pool = opts.filter((o) => o !== current);
      next[i] = { ...next[i], directive: pool[Math.floor(Math.random() * pool.length)] ?? opts[0] };
      return next;
    });
  };
  return (
    <div className="space-y-6">
      {/* Retention Audit */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
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
          <span className="font-semibold text-foreground">Fluff Diagnosis:</span> You wasted the first 8 seconds saying
          "welcome back" and talking about yourself. Viewers will swipe away immediately.
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Hook {i + 1}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {h.label}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium leading-snug text-foreground">"{h.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editing Matrix */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Scissors className="h-3.5 w-3.5 text-primary" />
          Editing Matrix
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-16 px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Spoken Line (Cleaned of Filler Words)</th>
                  <th className="px-4 py-3 font-semibold">Visual &amp; Audio Cues</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={row.time}
                    className={idx % 2 === 0 ? "bg-card" : "bg-secondary/25"}
                  >
                    <td className="whitespace-nowrap px-4 py-4 align-top font-mono text-xs text-primary">{row.time}</td>
                    <td className="px-4 py-4 align-top text-foreground">{row.line}</td>
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
  const [videoUrl, setVideoUrl] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [platform, setPlatform] = useState<Platform>("YouTube Shorts");
  const [aesthetic, setAesthetic] = useState<Aesthetic>("High-Energy Viral");
  const [language, setLanguage] = useState<Language>("English");
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
            v1.0 · Built for swipe-resistant scripts
          </span>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* INPUT */}
          <section>
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Script Surgeon
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                The Retention <span className="text-primary">Engine</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground">
                Transform raw scripts into high-retention video blueprints.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              {/* Tabs */}
              <div className="inline-flex w-full rounded-xl border border-border bg-background/40 p-1 sm:w-auto">
                {([
                  { id: "text", label: "Paste Script Text", icon: FileText },
                  { id: "url", label: "Import from Video Link", icon: Link2 },
                ] as const).map((t) => {
                  const Icon = t.icon;
                  const active = inputMode === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setInputMode(t.id)}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition sm:flex-none ${
                        active
                          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {inputMode === "text" ? (
                <>
                  <label className="mt-5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Raw Script
                  </label>
                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Paste your raw, messy video script draft here..."
                    rows={12}
                    className="mt-2 w-full resize-none rounded-xl border border-border bg-background/60 p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </>
              ) : (
                <>
                  <label className="mt-5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Video URL
                  </label>
                  <div className="relative mt-2">
                    <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Paste viral YouTube/Instagram URL here..."
                      className="w-full rounded-xl border border-border bg-background/60 py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    We'll transcribe the audio and reverse-engineer its retention structure.
                  </p>
                </>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Target Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as Platform)}
                    className="mt-2 w-full appearance-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm font-medium text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option>YouTube Shorts</option>
                    <option>Instagram Reels</option>
                    <option>TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Editing Aesthetic Style
                  </label>
                  <select
                    value={aesthetic}
                    onChange={(e) => setAesthetic(e.target.value as Aesthetic)}
                    className="mt-2 w-full appearance-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm font-medium text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option>High-Energy Viral</option>
                    <option>Minimalist Corporate</option>
                    <option>Cinematic Documentary</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Script Language Output
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="mt-2 w-full appearance-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm font-medium text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option>English</option>
                    <option>Telugu</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={onAnalyze}
                  disabled={status === "loading"}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-6px_oklch(0.78_0.18_155/0.6)] transition hover:shadow-[0_0_36px_-4px_oklch(0.78_0.18_155/0.75)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Analyze &amp; Optimize Script
                </button>
              </div>
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