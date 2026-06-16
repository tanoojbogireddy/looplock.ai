import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap } from "lucide-react";

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
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
  }, [navigate]);

  const onGoogle = async () => {
    setErr(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/app" },
    });
    if (error) setErr(error.message);
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background px-5 py-14">
      <div className={`${CARD} mx-auto max-w-md p-8`}>
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#00E5D1] shadow-[3px_3px_0px_0px_#000000]">
            <Zap className="h-5 w-5 text-black" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-black">Sign in</h1>
        </div>

        <button onClick={onGoogle} className={`${BTN} bg-[#00E5D1]`}>
          Continue with Google
        </button>

        {err && (
          <p className="mt-4 border-2 border-black bg-[#FF5E5E]/20 px-3 py-2 text-xs font-medium text-black">
            {err}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}