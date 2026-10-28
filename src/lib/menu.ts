import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Category = Tables<"categories">;
export type Article = Tables<"menu_articles">;

export const RESTAURANT_NAME = "Monaco Club Gammarth";
export const MENU_SLUG = "monaco-club-gammarth";
export const IMAGE_BUCKET = "menu-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const formatPrice = (p: number) =>
  `${Number(p).toFixed(3).replace(/\.?0+$/, "") || "0"} DT`;

export function validateImage(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return "Image must be JPG, PNG or WebP.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 5 MB or smaller.";
  return null;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order")
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function fetchArticles() {
  const { data, error } = await supabase
    .from("menu_articles")
    .select("*")
    .order("display_order")
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function uploadImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export async function signImages(paths: string[]) {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return {} as Record<string, string>;
  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrls(unique, 60 * 60 * 24);
  if (error) throw error;
  const map: Record<string, string> = {};
  data.forEach((d) => {
    if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
  });
  return map;
}

/** Swap display_order of two items in a sorted list. */
export async function swapOrder(
  table: "categories" | "menu_articles",
  list: { id: string }[],
  index: number,
  dir: -1 | 1,
) {
  const j = index + dir;
  if (j < 0 || j >= list.length) return;
  const reordered = [...list];
  [reordered[index], reordered[j]] = [reordered[j]!, reordered[index]!];
  const results = await Promise.all(
    reordered.map((item, i) => supabase.from(table).update({ display_order: i }).eq("id", item.id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

export const errorMessage = (e: unknown) => {
  const msg = (e as { message?: string })?.message ?? "Something went wrong.";
  if (msg.includes("categories_name_unique")) return "A category with this name already exists.";
  if (msg.includes("menu_articles_category_id_fkey"))
    return "This category still contains articles. Move or delete them first.";
  return msg;
};
