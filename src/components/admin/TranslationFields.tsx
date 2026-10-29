import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type Translations = {
  name_en: string; description_en: string; name_ar: string; description_ar: string;
};

export const emptyTranslations = (src?: Partial<Record<keyof Translations, string | null>> | null): Translations => ({
  name_en: src?.name_en ?? "", description_en: src?.description_en ?? "",
  name_ar: src?.name_ar ?? "", description_ar: src?.description_ar ?? "",
});

export const translationsPayload = (t: Translations) => ({
  name_en: t.name_en.trim() || null, description_en: t.description_en.trim() || null,
  name_ar: t.name_ar.trim() || null, description_ar: t.description_ar.trim() || null,
});

export function TranslationFields({ value, onChange }: { value: Translations; onChange: (t: Translations) => void }) {
  const set = (k: keyof Translations) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value });
  return (
    <details className="rounded-2xl border p-4">
      <summary className="cursor-pointer text-sm font-medium">Translations (English, Arabic)</summary>
      <p className="mt-2 text-xs text-muted-foreground">Leave empty to show the French text.</p>
      <div className="mt-4 space-y-3">
        <Label>English</Label>
        <Input placeholder="Name in English" value={value.name_en} onChange={set("name_en")} />
        <Textarea placeholder="Description in English" value={value.description_en} onChange={set("description_en")} />
        <Label>العربية</Label>
        <Input dir="rtl" placeholder="الاسم بالعربية" value={value.name_ar} onChange={set("name_ar")} />
        <Textarea dir="rtl" placeholder="الوصف بالعربية" value={value.description_ar} onChange={set("description_ar")} />
      </div>
    </details>
  );
}
