import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchArticles, fetchCategories, signImages } from "@/lib/menu";

export function useMenuData() {
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const articles = useQuery({ queryKey: ["articles"], queryFn: fetchArticles });
  const paths = [
    ...(categories.data ?? []).map((c) => c.image_url ?? ""),
    ...(articles.data ?? []).map((a) => a.image_url ?? ""),
  ].filter(Boolean);
  const images = useQuery({
    queryKey: ["images", paths.sort().join("|")],
    queryFn: () => signImages(paths),
    enabled: categories.isSuccess && articles.isSuccess,
    staleTime: 1000 * 60 * 60,
  });
  return {
    categories: categories.data ?? [],
    articles: articles.data ?? [],
    images: images.data ?? {},
    isLoading: categories.isLoading || articles.isLoading,
    error: categories.error || articles.error,
  };
}

export function useInvalidateMenu() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["categories"] }),
      qc.invalidateQueries({ queryKey: ["articles"] }),
      qc.invalidateQueries({ queryKey: ["images"] }),
    ]);
}
