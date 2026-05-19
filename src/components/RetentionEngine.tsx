import { useState } from "react";
import {
  Loader2,
  Sparkles,
  Flame,
  Scissors,
  AlertTriangle,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Languages,
  Stethoscope,
  ArrowRight,
  ArrowDown,
  FileText,
} from "lucide-react";

type MatrixRow = { time: string; line: string; lineRoman: string; directive: string };

type Lang = "Telugu" | "Hindi" | "Spanish" | "English";

function detectLanguage(text: string): Lang {
  const t = text.trim();
  if (!t) return "English";
  if (/[\u0C00-\u0C7F]/.test(t)) return "Telugu";
  if (/[\u0900-\u097F]/.test(t)) return "Hindi";
  if (/[áéíóúñ¿¡]/i.test(t)) return "Spanish";
  return "English";
}

const HOOKS_TE = [
  { label: "Negative Frame", text: "మీరు రోజూ 4 గంటలు ఇమెయిల్స్‌లో వృథా చేస్తున్నారు. ఇది ఇప్పుడే ఆపండి." },
  { label: "Curiosity Gap", text: "ఈ 5-నిమిషాల ఆటోమేషన్ ఇమెయిల్స్‌ను తమంతట తామే రిప్లై ఇచ్చేలా చేస్తుంది." },
  { label: "In Medias Res", text: "ఒక స్క్రిప్ట్ 3 సెకన్లలో 400 క్లయింట్ ఇమెయిల్స్ క్లియర్ చేయడం నేను చూశాను." },
];

const HOOKS_EN = [
  { label: "Negative Frame", text: "You're wasting 4 hours a day inside your inbox. Stop — right now." },
  { label: "Curiosity Gap", text: "This 5-minute automation makes emails reply to themselves, in your voice." },
  { label: "In Medias Res", text: "I just watched one script clear 400 client emails in 3 seconds flat." },
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

const INITIAL_MATRIX_TE: MatrixRow[] = [
  { time: "0:00", line: "మీరు రోజూ 4 గంటలు ఇమెయిల్స్‌లో వృథా చేస్తున్నారు.", lineRoman: "Meeru roju 4 gantalu emails lo vrutha chestunnaru.", directive: ALT_DIRECTIVES["0:00"][0] },
  { time: "0:03", line: "ఇది ఇప్పుడే ఆపండి — మంచి మార్గం ఉంది.", lineRoman: "Idi ippude apandi — manchi margam undi.", directive: ALT_DIRECTIVES["0:03"][0] },
  { time: "0:06", line: "మీ టోన్‌లోనే ఆటో-రిప్లై ఇచ్చే స్క్రిప్ట్ నేను రూపొందించాను.", lineRoman: "Mee tone lone auto-reply iche script nenu roopondinchanu.", directive: ALT_DIRECTIVES["0:06"][0] },
  { time: "0:10", line: "15 సెకన్లలో ఇది ఎలా పనిచేస్తుందో చూడండి.", lineRoman: "15 secondula lo idi ela panicheystundo choodandi.", directive: ALT_DIRECTIVES["0:10"][0] },
  { time: "0:14", line: "ఇది మీ చివరి 100 ఇమెయిల్స్ చదివి మీ వాయిస్ నేర్చుకుంటుంది.", lineRoman: "Idi mee chivari 100 emails chadivi mee voice nerchukuntundi.", directive: ALT_DIRECTIVES["0:14"][0] },
  { time: "0:18", line: "తర్వాత ఒక్క ట్యాప్‌తో అప్రూవ్ చేసే రిప్లై తయారు చేస్తుంది.", lineRoman: "Tarvata okka tap to approve chese reply tayaru chestundi.", directive: ALT_DIRECTIVES["0:18"][0] },
  { time: "0:22", line: "గత వారం నేను 19 గంటలు సేవ్ చేశాను. లింక్ బయోలో ఉంది.", lineRoman: "Gata varam nenu 19 gantalu save chesanu. Link bio lo undi.", directive: ALT_DIRECTIVES["0:22"][0] },
];

const INITIAL_MATRIX_EN: MatrixRow[] = [
  { time: "0:00", line: "You're burning 4 hours a day inside your inbox.", lineRoman: "", directive: ALT_DIRECTIVES["0:00"][0] },
  { time: "0:03", line: "Stop. There's a smarter way — and it's already built.", lineRoman: "", directive: ALT_DIRECTIVES["0:03"][0] },
  { time: "0:06", line: "I built a script that auto-replies in your exact tone.", lineRoman: "", directive: ALT_DIRECTIVES["0:06"][0] },
  { time: "0:10", line: "Watch how it works in the next 15 seconds.", lineRoman: "", directive: ALT_DIRECTIVES["0:10"][0] },
  { time: "0:14", line: "It reads your last 100 emails and learns your voice.", lineRoman: "", directive: ALT_DIRECTIVES["0:14"][0] },
  { time: "0:18", line: "Then it drafts a one-tap-approve reply for every new email.", lineRoman: "", directive: ALT_DIRECTIVES["0:18"][0] },
  { time: "0:22", line: "Last week it saved me 19 hours. Link's in the bio.", lineRoman: "", directive: ALT_DIRECTIVES["0:22"][0] },
];

const SCRIPT_DOCTOR_TE = {
  original:
    "హాయ్ గైస్, వెల్‌కమ్ బ్యాక్ టు మై ఛానల్! ఈరోజు నేను మీకు ఒక చాలా ఇంట్రెస్టింగ్ టాపిక్ గురించి చెప్పబోతున్నాను, అది ఏంటంటే... అమ్... మీరు రోజూ చాలా టైమ్ ఇమెయిల్స్ చెక్ చేయడంలో పెడుతున్నారు కదా? అంటే నేను కూడా చాలా స్ట్రగుల్ అయ్యాను దీంతో, సో నేను ఒక సొల్యూషన్ ఫైండ్ చేశాను, లెట్ మి షో యూ హౌ ఇట్ వర్క్స్...",
  optimized: INITIAL_MATRIX_TE.map((r) => r.line),
};

const SCRIPT_DOCTOR_EN = {
  original:
    "Hey guys, welcome back to my channel! So today I wanted to talk about something really, really interesting, um, basically you know how we all spend like a crazy amount of time every single day just checking emails over and over again? Yeah, I struggled with this too for the longest time, so I went ahead and found a solution, and let me kind of walk you through how it actually works…",
  optimized: INITIAL_MATRIX_EN.map((r) => r.line),
};

type Replacement = { wrong: string; right: string };

const REPLACEMENTS_TE: Replacement[] = [
  { wrong: "హాయ్ గైస్, వెల్‌కమ్ బ్యాక్ టు మై ఛానల్!", right: INITIAL_MATRIX_TE[0].line },
  { wrong: "ఈరోజు నేను మీకు ఒక చాలా ఇంట్రెస్టింగ్ టాపిక్ గురించి చెప్పబోతున్నాను, అది ఏంటంటే... అమ్...", right: INITIAL_MATRIX_TE[1].line },
  { wrong: "మీరు రోజూ చాలా టైమ్ ఇమెయిల్స్ చెక్ చేయడంలో పెడుతున్నారు కదా?", right: INITIAL_MATRIX_TE[2].line },
  { wrong: "అంటే నేను కూడా చాలా స్ట్రగుల్ అయ్యాను దీంతో,", right: INITIAL_MATRIX_TE[3].line },
  { wrong: "సో నేను ఒక సొల్యూషన్ ఫైండ్ చేశాను,", right: INITIAL_MATRIX_TE[4].line },
  { wrong: "లెట్ మి షో యూ హౌ ఇట్ వర్క్స్...", right: INITIAL_MATRIX_TE[5].line },
  { wrong: "మీరు కూడా ట్రై చేసి చూడండి, లింక్ డిస్క్రిప్షన్ లో పెడతాను.", right: INITIAL_MATRIX_TE[6].line },
];

const REPLACEMENTS_EN: Replacement[] = [
  { wrong: "Hey guys, welcome back to my channel!", right: INITIAL_MATRIX_EN[0].line },
  { wrong: "So today I wanted to talk about something really, really interesting, um,", right: INITIAL_MATRIX_EN[1].line },
  { wrong: "basically you know how we all spend like a crazy amount of time every single day just checking emails over and over again?", right: INITIAL_MATRIX_EN[2].line },
  { wrong: "Yeah, I struggled with this too for the longest time,", right: INITIAL_MATRIX_EN[3].line },
  { wrong: "so I went ahead and found a solution,", right: INITIAL_MATRIX_EN[4].line },
  { wrong: "and let me kind of walk you through how it actually works…", right: INITIAL_MATRIX_EN[5].line },
  { wrong: "Anyway, hope you guys enjoyed, don't forget to like and subscribe!", right: INITIAL_MATRIX_EN[6].line },
];

const LANG_PACK: Record<Lang, { hooks: typeof HOOKS_EN; matrix: MatrixRow[]; doctor: typeof SCRIPT_DOCTOR_EN; fluff: string; replacements: Replacement[] }> = {
  Telugu: { hooks: HOOKS_TE, matrix: INITIAL_MATRIX_TE, doctor: SCRIPT_DOCTOR_TE, fluff: 'మొదటి 8 సెకన్లు "welcome back" అని మీ గురించి మాట్లాడుతూ వృథా చేశారు. వీక్షకులు వెంటనే స్వైప్ చేస్తారు.', replacements: REPLACEMENTS_TE },
  English: { hooks: HOOKS_EN, matrix: INITIAL_MATRIX_EN, doctor: SCRIPT_DOCTOR_EN, fluff: 'The first 8 seconds are spent on "welcome back" filler. Viewers swipe before you even reach the hook.', replacements: REPLACEMENTS_EN },
  Hindi: { hooks: HOOKS_EN, matrix: INITIAL_MATRIX_EN, doctor: SCRIPT_DOCTOR_EN, fluff: 'The first 8 seconds are spent on "welcome back" filler. Viewers swipe before you even reach the hook.', replacements: REPLACEMENTS_EN },
  Spanish: { hooks: HOOKS_EN, matrix: INITIAL_MATRIX_EN, doctor: SCRIPT_DOCTOR_EN, fluff: 'The first 8 seconds are spent on "welcome back" filler. Viewers swipe before you even reach the hook.', replacements: REPLACEMENTS_EN },
};

// Neo-brutalist primitives
const CARD = "border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000]";
const PANE = "border-2 border-black bg-white shadow-[8px_8px_0px_0px_#000000]";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 border-2 border-black bg-[#00E5D1] px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[0px_0px_0px_0px_#000000] disabled:cursor-not-allowed disabled:opacity-70";
const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 border-2 border-black bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000]";

function WindowPane({
  title,
  accent = "#FFD93D",
  children,
  right,
}: {
  title: string;
  accent?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className={PANE}>
      <div
        className="flex items-center justify-between border-b-2 border-black px-4 py-2.5"
        style={{ backgroundColor: accent }}
      >
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-black">
          {title}
        </div>
        <div className="flex items-center gap-3">
          {right}
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 border-2 border-black bg-[#FF5E5E]" />
            <span className="h-3 w-3 border-2 border-black bg-[#FFD93D]" />
            <span className="h-3 w-3 border-2 border-black bg-[#00FF66]" />
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function PlaceholderState() {
  return (
    <div className={`${CARD} flex h-full min-h-[480px] flex-col items-center justify-center p-10 text-center`}>
      <div className="mb-6 flex h-16 w-16 items-center justify-center border-2 border-black bg-[#00FF66] shadow-[4px_4px_0px_0px_#000000]">
        <Sparkles className="h-8 w-8 text-black" />
      </div>
      <h3 className="font-serif text-2xl font-bold tracking-tight text-black">
        Your video blueprint will appear here
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Drop a raw script in any language. We'll auto-detect everything and return a retention-first cut.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className={`${CARD} flex h-full min-h-[480px] flex-col items-center justify-center p-10 text-center`}>
      <div className="border-2 border-black bg-[#FFD93D] p-5 shadow-[4px_4px_0px_0px_#000000]">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
      <p className="mt-5 font-mono text-sm font-bold uppercase tracking-wider text-black">
        Detecting language &amp; analyzing retention…
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Auto-routing platform style, rewriting hooks, building editing matrix.
      </p>
    </div>
  );
}

function Pill({
  children,
  bg = "#FFFFFF",
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 border-2 border-black px-3 py-1 text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_#000000]"
      style={{ backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

type Analysis = {
  language: string;
  platform: string;
  style: string;
  dropOffRisk: number;
  watchTimeLift: string;
  fillerReduction: string;
  hookCount: number;
  cutCount: number;
  fluffDiagnosis: string;
  hooks: { label: string; text: string }[];
  replacements: { wrong: string; right: string }[];
  matrix: MatrixRow[];
};

function ResultView({ analysis }: { analysis: Analysis }) {
  const [rows, setRows] = useState<MatrixRow[]>(analysis.matrix);
  const [copied, setCopied] = useState(false);
  const [assembled, setAssembled] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  const onCopy = async () => {
    const text = rows.map((r) => `${r.time}\t${r.line}\t${r.directive}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const finalScript = analysis.replacements.map((r) => r.right).join("\n\n");

  const onCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(finalScript);
    } catch {
      /* ignore */
    }
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 1600);
  };

  return (
    <div className="space-y-8">
      {/* Auto-detected pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Pill bg="#00FF66">
          <Languages className="h-3 w-3" /> Detected: {analysis.language}
        </Pill>
        <Pill>Platform: {analysis.platform}</Pill>
        <Pill bg="#FFD93D">Style: {analysis.style}</Pill>
      </div>

      {/* Metrics row */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className={`${CARD} p-5`}>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
            <AlertTriangle className="h-3.5 w-3.5" />
            Retention Audit
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 border-2 border-black bg-[#FF5E5E] px-3 py-1.5 text-sm font-extrabold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000000]">
              <Flame className="h-4 w-4" />
              Drop-off Risk {analysis.dropOffRisk}/10
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-black">
            <span className="font-bold">Fluff Diagnosis:</span> {analysis.fluffDiagnosis}
          </p>
        </div>

        <div className={`${CARD} p-5`}>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
            <Zap className="h-3.5 w-3.5" />
            Optimization Score
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 border-2 border-black bg-[#00FF66] px-3 py-1.5 text-sm font-extrabold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000000]">
              {analysis.watchTimeLift}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { k: "Filler", v: analysis.fillerReduction },
              { k: "Hooks", v: `${analysis.hookCount} New` },
              { k: "Cuts", v: String(analysis.cutCount) },
            ].map((m) => (
              <div key={m.k} className="border-2 border-black bg-secondary p-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{m.k}</div>
                <div className="mt-0.5 font-serif text-base font-bold text-black">{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rewritten Hooks */}
      <div className={`${CARD} p-5`}>
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
          <Zap className="h-3.5 w-3.5" />
          Rewritten Viral Hooks
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {analysis.hooks.map((h, i) => (
            <div key={h.label} className="border-2 border-black bg-secondary p-4 shadow-[3px_3px_0px_0px_#000000]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                  Hook 0{i + 1}
                </span>
                <span className="border-2 border-black bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                  {h.label}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium leading-snug text-black">"{h.text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* SCRIPT DOCTOR window pane */}
      <WindowPane
        title="script-doctor.exe"
        accent="#FFD93D"
        right={<Pill bg="#00FF66">−68% Filler</Pill>}
      >
        <div className="mb-4 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-black" />
          <h3 className="font-serif text-2xl font-bold tracking-tight text-black">The Script Doctor</h3>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          Aggressive cut-down: conversational fluff stripped into punchy, teleprompter-ready lines.
        </p>

        {/* Line-by-line replacement grid */}
        <div className="space-y-5">
          {analysis.replacements.map((r, i) => (
            <div
              key={i}
              className="grid items-stretch gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
            >
              {/* WRONG */}
              <div className="border-2 border-black bg-[#FF5E5E]/15 p-4 shadow-[4px_4px_0px_0px_#000000]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                    Line {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="border-2 border-black bg-[#FF5E5E] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                    Wrong / Fluffy
                  </span>
                </div>
                <p className="text-sm leading-snug text-black/80 line-through decoration-black/50 decoration-1">
                  {r.wrong}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#00E5D1] shadow-[3px_3px_0px_0px_#000000]">
                  <ArrowRight className="hidden h-5 w-5 text-black md:block" />
                  <ArrowDown className="h-5 w-5 text-black md:hidden" />
                </div>
              </div>

              {/* REPLACED */}
              <div className="border-2 border-black bg-[#00FF66]/30 p-4 shadow-[4px_4px_0px_0px_#000000]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                    High-Retention
                  </span>
                  <span className="border-2 border-black bg-[#00FF66] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                    Replaced With
                  </span>
                </div>
                <p className="text-sm font-semibold leading-snug text-black">{r.right}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ASSEMBLE BUTTON */}
        <div className="mt-8 flex flex-col items-center">
          <button
            onClick={() => setAssembled((v) => !v)}
            className={`${BTN_PRIMARY} px-8 py-4 text-base`}
          >
            <FileText className="h-4 w-4" />
            {assembled ? "Hide Consolidated Script" : "Generate Final Consolidated Script"}
          </button>

          {assembled && (
            <div className="mt-6 w-full border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000]">
              <div className="flex items-center justify-between border-b-2 border-black bg-black px-4 py-2.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                  final-script.txt · Teleprompter-ready
                </span>
                <button
                  onClick={onCopyScript}
                  className={BTN_SECONDARY}
                  style={{ backgroundColor: scriptCopied ? "#00FF66" : "#ffffff" }}
                >
                  {scriptCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {scriptCopied ? "Copied!" : "Copy Script"}
                </button>
              </div>
              <div className="max-h-[420px] overflow-y-auto p-5">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-black">
                  {finalScript}
                </pre>
              </div>
            </div>
          )}
        </div>
      </WindowPane>

      {/* EDITING MATRIX window pane */}
      <WindowPane
        title="editing-matrix.exe"
        accent="#00E5D1"
        right={
          <button onClick={onCopy} className={BTN_SECONDARY} style={{ backgroundColor: copied ? "#00FF66" : "#ffffff" }}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Blueprint"}
          </button>
        }
      >
        <div className="mb-4 flex items-center gap-2">
          <Scissors className="h-5 w-5 text-black" />
          <h3 className="font-serif text-2xl font-bold tracking-tight text-black">The Editing Matrix</h3>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          Production recipe: timestamped pattern interrupts, sound effects, and camera moves every 3–5 seconds.
        </p>

        <div className="overflow-hidden border-2 border-black">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-black text-xs uppercase tracking-widest text-white">
                <tr>
                  <th className="w-20 border-r-2 border-white/20 px-4 py-3 font-mono font-bold">Time</th>
                  <th className="border-r-2 border-white/20 px-4 py-3 font-mono font-bold">Optimized Line</th>
                  <th className="px-4 py-3 font-mono font-bold">Visual, Audio &amp; Pacing Cues</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={`${row.time}-${idx}`}
                    className={`border-t-2 border-black ${idx % 2 === 0 ? "bg-white" : "bg-secondary"}`}
                  >
                    <td className="whitespace-nowrap border-r-2 border-black px-4 py-4 align-top">
                      <span className="inline-block border-2 border-black bg-[#FFD93D] px-2 py-0.5 font-mono text-xs font-bold text-black">
                        {row.time}
                      </span>
                    </td>
                    <td className="border-r-2 border-black px-4 py-4 align-top">
                      <p className="font-medium text-black">{row.line}</p>
                      {row.lineRoman && (
                        <p className="mt-1 font-mono text-xs italic text-muted-foreground">{row.lineRoman}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-black">
                      <div className="flex items-start gap-3">
                        <span className="flex-1 text-sm">{row.directive}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </WindowPane>
    </div>
  );
}

export function RetentionEngine() {
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
        if (res.status === 429) throw new Error("Rate limit reached — please wait a moment and retry.");
        if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as Analysis;
      setAnalysis(data);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#00E5D1] shadow-[3px_3px_0px_0px_#000000]">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-black">
              Retention Engine
            </span>
          </div>
          <Pill bg="#FFD93D">v1.0 · Magic Box</Pill>
        </header>

        {/* Hero */}
        <div className="mb-10 max-w-4xl">
          <Pill bg="#00FF66">
            <span className="h-1.5 w-1.5 bg-black" /> Magic Box · Auto-detect everything
          </Pill>
          <h1 className="mt-5 font-serif text-5xl font-bold leading-[1.05] tracking-tight text-black md:text-6xl lg:text-7xl">
            You've never met an
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 px-2">editing engine</span>
              <span className="absolute inset-0 -z-0 bg-[#00E5D1]" />
            </span>{" "}
            like this.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground">
            Transform raw scripts into high-retention video blueprints. Zero settings, zero friction —
            paste, analyze, ship.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* INPUT */}
          <section>
            <WindowPane title="workspace.txt" accent="#9FE7F5">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Drop ANY raw script here (English, Telugu, Hinglish, or any language)... Our AI will automatically detect the language, platform style, and format your pacing blueprint instantly."
                rows={14}
                className="w-full resize-none border-2 border-black bg-white p-4 font-mono text-sm leading-relaxed text-black placeholder:text-muted-foreground focus:outline-none focus:ring-0"
              />

              <button
                onClick={onAnalyze}
                disabled={status === "loading"}
                className={`${BTN_PRIMARY} mt-4 w-full py-3.5 text-base`}
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Analyze &amp; Optimize Script
              </button>
            </WindowPane>
          </section>

          {/* OUTPUT */}
          <section>
            {status === "idle" && !error && <PlaceholderState />}
            {status === "idle" && error && (
              <div className={`${CARD} flex h-full min-h-[480px] flex-col items-center justify-center p-10 text-center`}>
                <div className="mb-4 flex h-14 w-14 items-center justify-center border-2 border-black bg-[#FF5E5E] shadow-[4px_4px_0px_0px_#000000]">
                  <AlertTriangle className="h-7 w-7 text-black" />
                </div>
                <h3 className="font-serif text-xl font-bold text-black">Analysis failed</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">{error}</p>
              </div>
            )}
            {status === "loading" && <LoadingState />}
            {status === "done" && analysis && <ResultView analysis={analysis} />}
          </section>
        </div>
      </div>
    </main>
  );
}