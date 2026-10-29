export type MenuLang = "fr" | "en" | "ar";
export const MENU_LANGS: { code: MenuLang; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

type Translatable = {
  name: string;
  description: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
};

/** French is the main text; other languages fall back to it when empty. */
export function localized(item: Translatable, lang: MenuLang) {
  if (lang === "fr") return { name: item.name, description: item.description };
  const name = item[`name_${lang}`]?.trim();
  const description = item[`description_${lang}`]?.trim();
  return { name: name || item.name, description: description || item.description };
}

export const UI_TEXT: Record<MenuLang, { menu: string; soon: string; empty: string; loading: string }> = {
  fr: { menu: "Menu", soon: "Le menu arrive bientôt.", empty: "Aucun article pour le moment.", loading: "Chargement…" },
  en: { menu: "Menu", soon: "The menu is coming soon.", empty: "No items yet.", loading: "Loading…" },
  ar: { menu: "القائمة", soon: "القائمة قادمة قريبًا.", empty: "لا توجد أصناف بعد.", loading: "جارٍ التحميل…" },
};
