import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, LayoutDashboard, LogOut, Menu as MenuIcon, QrCode, Tags, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { MENU_SLUG, RESTAURANT_NAME } from "@/lib/menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: `Admin — ${RESTAURANT_NAME}` }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/articles", label: "Menu Articles", icon: UtensilsCrossed },
  { to: "/admin/qr", label: "QR Code", icon: QrCode },
] as const;

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="flex h-full flex-col bg-sidebar p-5 text-sidebar-foreground">
      <div className="px-2 pb-8 pt-2">
        <p className="text-2xl font-bold tracking-tight">Milos.</p>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em] opacity-70">Street food grecque · Admin</p>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = "exact" in item ? path === item.to || path === item.to + "/" : path.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <a
          href={`/menu/${MENU_SLUG}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent"
        >
          <ExternalLink className="h-4 w-4" />
          View Public Menu
        </a>
      </nav>
      <button onClick={signOut} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const role = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error) throw error;
      return data;
    },
  });

  if (role.isLoading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!role.data)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <div className="max-w-sm rounded-3xl border bg-card p-8">
          <h1 className="text-xl font-bold text-primary">No admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You are signed in as {user.email}, but this account is not an administrator.
          </p>
          <Button className="mt-6 rounded-full" onClick={() => supabase.auth.signOut().then(() => location.assign("/auth"))}>
            Sign out
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 md:block">
        <Nav />
      </aside>
      <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
        <p className="text-lg font-bold text-primary">Milos.</p>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Nav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <main className="min-w-0 flex-1 p-4 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
