import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RESTAURANT_NAME } from "@/lib/menu";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: `Admin sign in — ${RESTAURANT_NAME}` },
      { name: "description", content: "Sign in to manage the digital menu." },
      { property: "og:title", content: `Admin sign in — ${RESTAURANT_NAME}` },
      { property: "og:description", content: "Sign in to manage the digital menu." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "forgot" | "code" | "newpass">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("newpass");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/admin" });
        else toast.success("Check your email to confirm your account.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("We sent you an email with a sign-in code.");
        setMode("code");
      } else if (mode === "code") {
        const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "recovery" });
        if (error) throw new Error("This code is wrong or has expired.");
        setPassword("");
        setMode("newpass");
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("Password updated.");
        navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const titles = { in: "Sign in", up: "Create account", forgot: "Send me a code", code: "Sign in with code", newpass: "Save new password" };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl border bg-card p-8 shadow-soft">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Administration
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-primary">{RESTAURANT_NAME}</h1>
        {mode === "forgot" && <p className="mt-4 text-sm text-muted-foreground">Enter your email and we'll send you a code to sign in.</p>}
        {mode === "code" && <p className="mt-4 text-sm text-muted-foreground">Enter the code from the email sent to {email}, or tap the link in that email.</p>}
        {mode === "newpass" && <p className="mt-4 text-sm text-muted-foreground">You're signed in. Choose a new password.</p>}
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode !== "newpass" && mode !== "code" && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}
          {mode === "code" && (
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
          )}
          {(mode === "in" || mode === "up" || mode === "newpass") && (
            <div className="space-y-2">
              <Label htmlFor="password">{mode === "newpass" ? "New password" : "Password"}</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <Button type="submit" className="w-full rounded-full" disabled={busy}>
            {busy ? "Please wait…" : titles[mode]}
          </Button>
        </form>
        {mode === "in" && (
          <button type="button" onClick={() => setMode("forgot")} className="mt-4 w-full text-center text-sm text-primary hover:underline">
            Forgot password?
          </button>
        )}
        {mode !== "newpass" && (
          <button
            type="button"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary"
          >
            {mode === "in" ? "No account yet? Create one" : "Back to sign in"}
          </button>
        )}
      </div>
    </div>
  );
}
