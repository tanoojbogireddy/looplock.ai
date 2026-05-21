import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Loader2, Zap } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Retention Engine" },
      { name: "description", content: "Sign in to the Retention Engine workspace." },
    ],
  }),
  component: LoginPage,
});

const CARD = "border-2 border-black bg-white shadow-[8px_8px_0px_0px_#000000]";
const BTN =
  "inline-flex w-full items-center justify-center gap-2 border-2 border-black px-4 py-3 text-sm font-extrabold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] disabled:opacity-60";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
  }, [navigate]);

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const fn =
        mode === "signin"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin + "/app" },
            });
      const { error } = await fn;
      if (error) throw error;
      if (mode === "signup") {
        setErr("Check your inbox to confirm your email, then sign in.");
      } else {
        navigate({ to: "/app" });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setErr(null);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/app",
    });
    if (res.error) setErr(res.error instanceof Error ? res.error.message : "Google sign-in failed");
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background px-5 py-14">
      <div className={`${CARD} mx-auto max-w-md p-8`}>
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#00E5D1] shadow-[3px_3px_0px_0px_#000000]">
            <Zap className="h-5 w-5 text-black" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-black">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
        </div>

        <button onClick={onGoogle} className={`${BTN} mb-4 bg-white`}>
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-0.5 flex-1 bg-black" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">or</span>
          <div className="h-0.5 flex-1 bg-black" />
        </div>

        <form onSubmit={onEmail} className="space-y-3">
          <input
            type="email"
            required
            placeholder="you@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2.5 font-mono text-sm text-black focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2.5 font-mono text-sm text-black focus:outline-none"
          />
          <button type="submit" disabled={loading} className={`${BTN} bg-[#00E5D1]`}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {err && (
          <p className="mt-4 border-2 border-black bg-[#FF5E5E]/20 px-3 py-2 text-xs font-medium text-black">
            {err}
          </p>
        )}

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center font-mono text-xs font-bold uppercase tracking-widest text-black underline"
        >
          {mode === "signin" ? "No account? Create one" : "Have an account? Sign in"}
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}