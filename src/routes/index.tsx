import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap, Stethoscope, Scissors, Check, ArrowRight, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Retention Engine — Escape the 200-View Trap" },
      {
        name: "description",
        content:
          "Turn raw scripts into high-retention video blueprints. AI-powered Script Doctor and Editing Matrix for short-form creators.",
      },
      { property: "og:title", content: "Retention Engine — Escape the 200-View Trap" },
      {
        property: "og:description",
        content: "AI-powered Script Doctor and Editing Matrix for short-form creators.",
      },
    ],
  }),
  component: LandingPage,
});

const CARD = "border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000]";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 border-2 border-black bg-[#00E5D1] px-6 py-3.5 text-base font-extrabold uppercase tracking-wider text-black shadow-[5px_5px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000000]";

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

function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 lg:px-8 lg:pt-20">
        <Pill bg="#FF5E5E">
          <AlertTriangle className="h-3 w-3" /> Pre-Production Audit
        </Pill>
        <h1 className="mt-5 max-w-4xl font-serif text-5xl font-bold leading-[1.02] tracking-tight text-black md:text-6xl lg:text-7xl">
          Stop Filming Boring Videos.{" "}
          <span className="relative inline-block">
            <span className="relative z-10 px-2">Fix Your Script</span>
            <span className="absolute inset-0 -z-0 bg-[#00E5D1]" />
          </span>{" "}
          Before You Turn on the Camera.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Retention Engine audits your script with a Weibull-based retention model (k = 0.7) — the
          same statistical curve that governs how viewers actually drop off short-form video.
        </p>
        <div className="mt-5">
          <Pill bg="#FFD93D">
            <Zap className="h-3 w-3" /> Powered by Weibull-Based Retention Modeling
          </Pill>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/app" className={BTN_PRIMARY}>
            <Zap className="h-4 w-4" /> Launch Workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Pill>Single tier · ₹499/mo · Unlimited audits</Pill>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className={`${CARD} p-7`}>
            <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-[#FFD93D] shadow-[3px_3px_0px_0px_#000000]">
              <Stethoscope className="h-6 w-6 text-black" />
            </div>
            <h3 className="mt-5 font-serif text-2xl font-bold text-black">The Script Doctor</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Strips conversational fluff line-by-line. Returns a stronger hook, emotional rewrite,
              and a CTA that doesn't sound like a YouTuber from 2019.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-black">
              {["Stronger Hook generation", "Emotional rewrite per line", "CTA rewrite that converts"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-black" /> {t}
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className={`${CARD} p-7`}>
            <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-[#00E5D1] shadow-[3px_3px_0px_0px_#000000]">
              <Scissors className="h-6 w-6 text-black" />
            </div>
            <h3 className="mt-5 font-serif text-2xl font-bold text-black">The Editing Matrix</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A timestamped production recipe — camera angles, b-roll ideas, and pacing cues every
              3–5 seconds so your editor has zero excuses.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-black">
              {["Camera angle suggestions", "B-roll ideas per beat", "Pacing & cut suggestions"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-black" /> {t}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="mb-10 text-center">
          <Pill bg="#00FF66">Pricing</Pill>
          <h2 className="mt-4 font-serif text-4xl font-bold text-black md:text-5xl">
            Pay less than your last failed boost.
          </h2>
        </div>
        <div className="mx-auto max-w-xl">
          <div className={`${CARD} relative p-8`} style={{ backgroundColor: "#FFFBEA" }}>
            <div className="absolute -top-3 right-5">
              <Pill bg="#FF5E5E">One Tier · All Access</Pill>
            </div>
            <Pill bg="#FFD93D">Full Terminal Access</Pill>
            <h3 className="mt-4 font-serif text-2xl font-bold text-black">
              Unlimited Audits for ₹499/month
            </h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-6xl font-bold text-black">₹499</span>
              <span className="font-mono text-sm text-muted-foreground">/month</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-black">
              {[
                "Unlimited Weibull script audits",
                "Script Doctor: hook, emotional & CTA rewrites",
                "Timestamped Editing Matrix (camera, B-roll, pacing)",
                "Locked k = 0.7 short-form retention model",
                "Priority support",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> {t}
                </li>
              ))}
            </ul>
            <Link to="/app" className={`${BTN_PRIMARY} mt-7 w-full`}>
              <Zap className="h-4 w-4" /> Launch Workspace
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div
          className={`${CARD} flex flex-col items-center gap-5 p-12 text-center`}
          style={{ backgroundColor: "#00E5D1" }}
        >
          <h2 className="font-serif text-4xl font-bold text-black md:text-5xl">
            Ready to break the 200-view ceiling?
          </h2>
          <Link to="/app" className={BTN_PRIMARY} style={{ backgroundColor: "#000", color: "#00E5D1" }}>
            <Zap className="h-4 w-4" /> Launch Workspace
          </Link>
        </div>
      </section>
    </main>
  );
}