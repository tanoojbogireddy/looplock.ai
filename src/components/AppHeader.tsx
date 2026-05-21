import { Link, useNavigate } from "@tanstack/react-router";
import { Zap, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const linkBase =
  "px-3 py-1.5 border-2 border-black font-mono text-xs font-bold uppercase tracking-widest text-black bg-white shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all";
const linkActive = "bg-[#00E5D1]";

export function AppHeader() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setEmail(s?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-[#FFD93D]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center border-2 border-black bg-[#00E5D1] shadow-[3px_3px_0px_0px_#000000]">
            <Zap className="h-4 w-4 text-black" />
          </div>
          <span className="font-mono text-sm font-bold uppercase tracking-widest text-black">
            Retention Engine
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/" activeOptions={{ exact: true }}>
            {({ isActive }) => <span className={`${linkBase} ${isActive ? linkActive : ""}`}>Home</span>}
          </Link>
          <Link to="/app">
            {({ isActive }) => <span className={`${linkBase} ${isActive ? linkActive : ""}`}>Workspace</span>}
          </Link>
          <Link to="/profile">
            {({ isActive }) => <span className={`${linkBase} ${isActive ? linkActive : ""}`}>Profile</span>}
          </Link>
          {email ? (
            <button onClick={onLogout} className={`${linkBase} flex items-center gap-1.5`}>
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          ) : (
            <Link to="/login">
              {({ isActive }) => <span className={`${linkBase} ${isActive ? linkActive : ""}`}>Login</span>}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}