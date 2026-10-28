import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Plus, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { useMenuData } from "@/hooks/use-menu-data";
import { MENU_SLUG } from "@/lib/menu";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { categories, articles, isLoading } = useMenuData();
  const noImage = articles.filter((a) => !a.image_url).length;
  const last = [...categories, ...articles].map((x) => x.updated_at).sort().pop();

  const stats = [
    { label: "Categories", value: categories.length },
    { label: "Menu articles", value: articles.length },
    { label: "Articles without photo", value: noImage },
    { label: "Last update", value: last ? new Date(last).toLocaleString() : "—" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your digital menu."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/admin/categories" search={{ new: true }}><Plus className="h-4 w-4" /> Category</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/admin/articles" search={{ new: true }}><Plus className="h-4 w-4" /> Article</Link>
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border bg-card p-6 shadow-soft">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="mt-3 text-2xl font-bold text-primary">{isLoading ? "…" : s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link to="/admin/qr" className="group rounded-3xl bg-primary p-8 text-primary-foreground transition-transform hover:-translate-y-0.5">
          <QrCode className="h-8 w-8" />
          <p className="mt-6 text-xl font-bold">QR Code</p>
          <p className="mt-1 text-sm opacity-80">Download or print the code for your tables.</p>
        </Link>
        <a href={`/menu/${MENU_SLUG}`} target="_blank" rel="noreferrer" className="rounded-3xl border bg-card p-8 transition-transform hover:-translate-y-0.5">
          <ExternalLink className="h-8 w-8 text-primary" />
          <p className="mt-6 text-xl font-bold text-primary">Preview public menu</p>
          <p className="mt-1 text-sm text-muted-foreground">See exactly what your guests see.</p>
        </a>
      </div>
    </div>
  );
}
