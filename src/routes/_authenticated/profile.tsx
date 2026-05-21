import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [{ title: "Profile — Retention Engine" }],
  }),
  component: ProfilePage,
});

const CARD = "border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000]";
const BTN =
  "inline-flex items-center justify-center gap-2 border-2 border-black bg-[#00E5D1] px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000]";

function getMonthlyUsage(): number {
  if (typeof window === "undefined") return 0;
  const month = new Date().toISOString().slice(0, 7);
  const raw = localStorage.getItem(`re_usage_${month}`);
  return raw ? Number(raw) || 0 : 0;
}

function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const limit = 50;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    setUsed(getMonthlyUsage());
  }, []);

  const pct = Math.min(100, Math.round((used / limit) * 100));
  const radius = 64;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
      <h1 className="font-serif text-4xl font-bold text-black md:text-5xl">Account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage your plan and monthly script usage.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Usage ring */}
        <div className={`${CARD} flex flex-col items-center p-8`}>
          <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
            Monthly Usage
          </div>
          <h2 className="font-serif text-2xl font-bold text-black">Scripts Analyzed</h2>

          <div className="relative my-6">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="#000"
                strokeWidth="14"
                opacity="0.1"
              />
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="#00E5D1"
                strokeWidth="14"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                transform="rotate(-90 90 90)"
                style={{ transition: "stroke-dashoffset 600ms" }}
              />
              <circle cx="90" cy="90" r={radius} fill="none" stroke="#000" strokeWidth="2" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-4xl font-bold text-black">
                {used}
                <span className="text-2xl text-muted-foreground">/{limit}</span>
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                {pct}% used
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">Resets on the 1st of next month.</p>
        </div>

        {/* Plan card */}
        <div className={`${CARD} p-8`}>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
            <User className="h-3.5 w-3.5" /> Signed in as
          </div>
          <p className="mt-2 break-all font-mono text-sm font-bold text-black">{email || "—"}</p>

          <div className="mt-6 border-2 border-black bg-[#FFD93D] p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
              Current Plan
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-black">Solo</span>
              <span className="font-mono text-sm text-black">· ₹499/mo</span>
            </div>
          </div>

          <button className={`${BTN} mt-6 w-full`}>
            <CreditCard className="h-4 w-4" /> Manage Subscription
          </button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Upgrade, downgrade, or cancel anytime.
          </p>
        </div>
      </div>
    </main>
  );
}