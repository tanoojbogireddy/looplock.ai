import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, User, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [{ title: "Profile — Retention Engine" }],
  }),
  component: ProfilePage,
});

const CARD = "border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000000]";
const BTN =
  "inline-flex items-center justify-center gap-2 border-2 border-black bg-[#00E5D1] px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000]";

function getLifetimeUsage(): number {
  if (typeof window === "undefined") return 0;
  const direct = localStorage.getItem("re_usage_lifetime");
  if (direct) return Number(direct) || 0;
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("re_usage_")) total += Number(localStorage.getItem(k)) || 0;
  }
  return total;
}

function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    setUsed(getLifetimeUsage());
  }, []);

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
      <h1 className="font-serif text-4xl font-bold text-black md:text-5xl">Account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage your plan and usage.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Usage card */}
        <div className={`${CARD} flex flex-col p-8`}>
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
            Lifetime Scripts Analyzed
          </div>
          <span className="mt-3 font-serif text-7xl font-bold leading-none text-black">{used}</span>

          <div className="mt-8 inline-flex w-fit items-center gap-2 border-2 border-black bg-[#00E5D1] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_#000000]">
            Monthly Usage: Unlimited
          </div>

          <p className="mt-auto pt-8 text-xs text-muted-foreground">
            Your unlimited quota automatically renews on the 1st of next month.
          </p>
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
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-black">Solo</span>
              <span className="font-mono text-sm text-black">· ₹499/mo</span>
            </div>
            <div
              className="mt-3 inline-flex items-center gap-1.5 border-2 border-black bg-[#0a0a0a] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#22ff88] shadow-[2px_2px_0px_0px_#000000]"
              style={{ textShadow: "0 0 8px #22ff88" }}
            >
              <span
                className="h-2 w-2 rounded-full bg-[#22ff88]"
                style={{ boxShadow: "0 0 8px #22ff88, 0 0 14px #22ff88" }}
              />
              Active Unlimited
            </div>
          </div>

          <button onClick={() => setOpen(true)} className={`${BTN} mt-6 w-full`}>
            <CreditCard className="h-4 w-4" /> Manage Subscription
          </button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Upgrade, downgrade, or cancel anytime.
          </p>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000000]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 border-2 border-black bg-white p-1 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000000]"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
              ◤ LOOPLOCK BILLING
            </div>
            <h3 className="mt-1 font-serif text-2xl font-bold text-black">Billing Management</h3>
            <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
              Logged in as {email || "—"}
            </p>

            <div className="mt-5 space-y-3">
              <div className="border-2 border-black bg-[#F5F5F5] p-3 shadow-[3px_3px_0px_0px_#000000]">
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                  Next Invoice Date
                </div>
                <div className="mt-1 font-serif text-lg font-bold text-black">June 1st, 2026</div>
              </div>
              <div className="border-2 border-black bg-[#F5F5F5] p-3 shadow-[3px_3px_0px_0px_#000000]">
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                  Payment Method
                </div>
                <div className="mt-1 font-serif text-lg font-bold text-black">
                  UPI <span className="font-mono text-xs text-[#0B2545]">(AutoPay Active)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => {
                  console.log("Update Payment Method clicked");
                  window.open("about:blank", "_blank");
                }}
                className={`${BTN} w-full`}
              >
                Update Payment Method
              </button>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 border-2 border-black bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}