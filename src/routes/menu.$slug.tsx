import { createFileRoute, notFound } from "@tanstack/react-router";
import { MENU_SLUG, RESTAURANT_NAME, formatPrice } from "@/lib/menu";
import { useMenuData } from "@/hooks/use-menu-data";

export const Route = createFileRoute("/menu/$slug")({
  beforeLoad: ({ params }) => {
    if (params.slug !== MENU_SLUG) throw notFound();
  },
  head: () => ({
    meta: [
      { title: `Menu — ${RESTAURANT_NAME}` },
      { name: "description", content: `Our dishes and drinks at ${RESTAURANT_NAME}.` },
      { property: "og:title", content: `Menu — ${RESTAURANT_NAME}` },
      { property: "og:description", content: `Our dishes and drinks at ${RESTAURANT_NAME}.` },
    ],
  }),
  component: PublicMenu,
});

function PublicMenu() {
  const { categories, articles, images, isLoading } = useMenuData();
  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 pb-10 pt-14 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-muted-foreground">Menu</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-primary md:text-5xl">{RESTAURANT_NAME}</h1>
      </header>
      <main className="mx-auto max-w-3xl space-y-12 px-4 pb-20">
        {isLoading && <p className="text-center text-muted-foreground">Loading…</p>}
        {!isLoading && categories.length === 0 && <p className="text-center text-muted-foreground">The menu is coming soon.</p>}
        {categories.map((c) => {
          const items = articles.filter((a) => a.category_id === c.id);
          return (
            <section key={c.id}>
              <h2 className="text-2xl font-bold text-primary">{c.name}</h2>
              {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
              <div className="mt-5 space-y-3">
                {items.length === 0 && <p className="text-sm text-muted-foreground">No items yet.</p>}
                {items.map((a) => (
                  <div key={a.id} className="flex gap-4 rounded-3xl bg-card p-4">
                    {a.image_url && images[a.image_url] && (
                      <img src={images[a.image_url]} alt={a.name} className="h-20 w-20 shrink-0 rounded-2xl object-cover" loading="lazy" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-semibold">{a.name}</p>
                        <p className="shrink-0 font-bold text-primary">{formatPrice(a.price)}</p>
                      </div>
                      {a.description && <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
