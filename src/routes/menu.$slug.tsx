import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Heart, UtensilsCrossed } from "lucide-react";
import { MENU_SLUG, RESTAURANT_NAME, formatPrice } from "@/lib/menu";
import { MENU_LANGS, UI_TEXT, localized, type MenuLang } from "@/lib/menu-i18n";
import { useMenuData } from "@/hooks/use-menu-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu/$slug")({
  beforeLoad: ({ params }) => {
    if (params.slug !== MENU_SLUG) throw notFound();
  },
  head: () => ({
    meta: [
      { title: `La carte — ${RESTAURANT_NAME}` },
      { name: "description", content: `${RESTAURANT_NAME}, street food grecque. Découvrez notre carte.` },
      { property: "og:title", content: `La carte — ${RESTAURANT_NAME}` },
      { property: "og:description", content: `${RESTAURANT_NAME}, street food grecque. Découvrez notre carte.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicMenu,
});

const TITLES: Record<MenuLang, { carte: string; see: string; tagline: string; sub: string }> = {
  fr: { carte: "La carte", see: "Voir la carte", tagline: "Simple. Authentique. Grec.", sub: "Street food grecque" },
  en: { carte: "The menu", see: "See the menu", tagline: "Simple. Authentic. Greek.", sub: "Greek street food" },
  ar: { carte: "القائمة", see: "عرض القائمة", tagline: "بسيط. أصيل. يوناني.", sub: "أكل شارع يوناني" },
};

function LangSwitch({ lang, choose, dark }: { lang: MenuLang; choose: (l: MenuLang) => void; dark?: boolean }) {
  return (
    <div className="flex justify-center gap-1" role="group" aria-label="Language">
      {MENU_LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => choose(l.code)}
          aria-pressed={lang === l.code}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            dark
              ? lang === l.code ? "bg-background text-primary" : "text-primary-foreground/80 hover:text-primary-foreground"
              : lang === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function PublicMenu() {
  const { categories, articles, images, isLoading } = useMenuData();
  const [lang, setLang] = useState<MenuLang>("fr");
  const [splash, setSplash] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [favs, setFavs] = useState<string[]>([]);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("menu-lang");
    if (saved === "fr" || saved === "en" || saved === "ar") setLang(saved);
    try { setFavs(JSON.parse(localStorage.getItem("menu-favs") || "[]")); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    if (!active && categories[0]) setActive(categories[0].id);
  }, [categories, active]);

  const choose = (l: MenuLang) => { setLang(l); localStorage.setItem("menu-lang", l); };
  const toggleFav = (id: string) => {
    const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    setFavs(next);
    localStorage.setItem("menu-favs", JSON.stringify(next));
  };
  const t = UI_TEXT[lang];
  const tt = TITLES[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  if (splash) {
    return (
      <div dir={dir} lang={lang} className="flex min-h-screen flex-col bg-primary px-6 pb-10 pt-6 text-primary-foreground">
        <LangSwitch lang={lang} choose={choose} dark />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <UtensilsCrossed className="h-14 w-14" strokeWidth={1.5} />
          <h1 className="mt-5 font-display text-6xl font-extrabold">{RESTAURANT_NAME}</h1>
          <p className="mt-2 text-lg opacity-90">{tt.sub}</p>
        </div>
        <div className="mx-auto w-full max-w-md space-y-3">
          <button
            onClick={() => setSplash(false)}
            className="w-full rounded-full bg-background py-4 text-sm font-semibold uppercase tracking-wider text-primary transition-transform active:scale-[0.98]"
          >
            {tt.see}
          </button>
          <div className="w-full rounded-full border border-primary-foreground/50 py-4 text-center text-sm font-semibold uppercase tracking-wider">
            {tt.tagline}
          </div>
        </div>
      </div>
    );
  }

  const cat = categories.find((c) => c.id === active);
  const lc = cat ? localized(cat, lang) : null;
  const items = articles.filter((a) => a.category_id === active);
  const catImage = (id: string, img: string | null) =>
    (img && images[img]) || images[articles.find((a) => a.category_id === id && a.image_url)?.image_url ?? ""];

  return (
    <div className="min-h-screen bg-background" dir={dir} lang={lang}>
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-4">
          <button onClick={() => setSplash(true)} aria-label="Back" className="p-1 text-primary">
            <ArrowLeft className={cn("h-6 w-6", dir === "rtl" && "rotate-180")} />
          </button>
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-wider text-primary">{tt.carte}</h1>
          <span className="w-8" />
        </div>
        <div className="mx-auto mt-2 max-w-3xl"><LangSwitch lang={lang} choose={choose} /></div>
        <div ref={tabsRef} className="mx-auto flex max-w-3xl gap-4 overflow-x-auto px-4 pb-3 pt-4 [scrollbar-width:none]">
          {categories.map((c) => {
            const on = c.id === active;
            const src = catImage(c.id, c.image_url);
            return (
              <button key={c.id} onClick={() => setActive(c.id)} className="flex w-20 shrink-0 flex-col items-center gap-1.5">
                <span className={cn("h-16 w-16 overflow-hidden rounded-full border-2 p-0.5", on ? "border-primary" : "border-transparent")}>
                  {src ? (
                    <img src={src} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-card font-display text-xl text-primary">
                      {localized(c, lang).name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className={cn("truncate text-xs font-semibold", on ? "text-primary" : "text-muted-foreground")}>
                  {localized(c, lang).name}
                </span>
                <span className={cn("h-0.5 w-10 rounded-full", on ? "bg-primary" : "bg-muted")} />
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-4">
        {isLoading && <p className="text-center text-muted-foreground">{t.loading}</p>}
        {!isLoading && categories.length === 0 && <p className="text-center text-muted-foreground">{t.soon}</p>}
        {lc && (
          <>
            <h2 className="font-display text-4xl font-extrabold text-primary">{lc.name}</h2>
            {lc.description && <p className="mt-2 text-sm text-muted-foreground">{lc.description}</p>}
            <div className="mt-3 h-1 w-16 rounded-full bg-muted" />
            <div className="mt-6 space-y-4">
              {items.length === 0 && <p className="text-sm text-muted-foreground">{t.empty}</p>}
              {items.map((a) => {
                const la = localized(a, lang);
                const src = a.image_url ? images[a.image_url] : undefined;
                const fav = favs.includes(a.id);
                return (
                  <div key={a.id} className="flex items-center gap-3">
                    {src && <img src={src} alt={la.name} loading="lazy" className="h-24 w-24 shrink-0 rounded-2xl object-cover" />}
                    <div className="relative min-w-0 flex-1 rounded-2xl bg-card p-4 shadow-soft">
                      <button onClick={() => toggleFav(a.id)} aria-label="Favorite" className="absolute end-3 top-3 text-primary">
                        <Heart className={cn("h-4 w-4", fav && "fill-current")} />
                      </button>
                      <p className="pe-6 font-display text-lg font-semibold text-primary">{la.name}</p>
                      {la.description && <p className="mt-1 text-sm text-muted-foreground">{la.description}</p>}
                      {a.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {a.tags.map((tg) => <span key={tg} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{tg}</span>)}
                        </div>
                      )}
                      <div dir="ltr" className="mt-3 flex flex-wrap gap-2">
                        {[{ label: a.price_label, price: a.price }, ...((a.extra_prices as { label: string; price: number }[] | null) ?? [])].map((p, i) => (
                          <span key={i} className="inline-flex items-baseline gap-1.5 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
                            {p.label && <span className="font-normal opacity-90">{p.label}</span>}
                            <span className="font-bold">{formatPrice(p.price)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
