import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MENU_SLUG, RESTAURANT_NAME, formatPrice } from "@/lib/menu";
import { MENU_LANGS, UI_TEXT, localized, type MenuLang } from "@/lib/menu-i18n";
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
  const [lang, setLang] = useState<MenuLang>("fr");
  useEffect(() => {
    const saved = localStorage.getItem("menu-lang");
    if (saved === "fr" || saved === "en" || saved === "ar") setLang(saved);
  }, []);
  const choose = (l: MenuLang) => { setLang(l); localStorage.setItem("menu-lang", l); };
  const t = UI_TEXT[lang];
  return (
    <div className="min-h-screen bg-background" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      <div className="flex justify-center gap-1 pt-6" role="group" aria-label="Language">
        {MENU_LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => choose(l.code)}
            aria-pressed={lang === l.code}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${lang === l.code ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent"}`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <header className="px-6 pb-10 pt-10 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-muted-foreground">{t.menu}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-primary md:text-5xl">{RESTAURANT_NAME}</h1>
      </header>
      <main className="mx-auto max-w-3xl space-y-12 px-4 pb-20">
        {isLoading && <p className="text-center text-muted-foreground">{t.loading}</p>}
        {!isLoading && categories.length === 0 && <p className="text-center text-muted-foreground">{t.soon}</p>}
        {categories.map((c) => {
          const items = articles.filter((a) => a.category_id === c.id);
          const lc = localized(c, lang);
          return (
            <section key={c.id}>
              <h2 className="text-2xl font-bold text-primary">{lc.name}</h2>
              {lc.description && <p className="mt-1 text-sm text-muted-foreground">{lc.description}</p>}
              <div className="mt-5 space-y-3">
                {items.length === 0 && <p className="text-sm text-muted-foreground">{t.empty}</p>}
                {items.map((a) => {
                  const la = localized(a, lang);
                  return (
                    <div key={a.id} className="flex gap-4 rounded-3xl bg-card p-4">
                      {a.image_url && images[a.image_url] && (
                        <img src={images[a.image_url]} alt={la.name} className="h-20 w-20 shrink-0 rounded-2xl object-cover" loading="lazy" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="font-semibold">{la.name}</p>
                          <p className="shrink-0 font-bold text-primary" dir="ltr">{formatPrice(a.price)}</p>
                        </div>
                        {la.description && <p className="mt-1 text-sm text-muted-foreground">{la.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
