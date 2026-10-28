import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState, PageHeader, Thumb } from "@/components/admin/PageHeader";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { useInvalidateMenu, useMenuData } from "@/hooks/use-menu-data";
import { type Article, type Category, errorMessage, formatPrice, swapOrder, uploadImage } from "@/lib/menu";

export const Route = createFileRoute("/_authenticated/admin/articles")({
  validateSearch: (s: Record<string, unknown>): { new?: boolean } => (s.new ? { new: true } : {}),
  component: ArticlesPage,
});

function ArticlesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { categories, articles, images, isLoading, error } = useMenuData();
  const invalidate = useInvalidateMenu();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<Article | "new" | null>(null);
  const [deleting, setDeleting] = useState<Article | null>(null);

  useEffect(() => {
    if (search.new) {
      setEditing("new");
      navigate({ to: "/admin/articles", search: {}, replace: true });
    }
  }, [search.new, navigate]);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";
  const list = articles.filter(
    (a) => (cat === "all" || a.category_id === cat) && a.name.toLowerCase().includes(q.toLowerCase()),
  );

  async function move(a: Article, dir: -1 | 1) {
    const siblings = articles.filter((x) => x.category_id === a.category_id);
    try {
      await swapOrder("menu_articles", siblings, siblings.findIndex((x) => x.id === a.id), dir);
      await invalidate();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const { error } = await supabase.from("menu_articles").delete().eq("id", deleting.id);
    if (error) toast.error(errorMessage(error));
    else toast.success("Article deleted.");
    setDeleting(null);
    invalidate();
  }

  return (
    <div>
      <PageHeader
        title="Menu Articles"
        subtitle="Dishes and drinks shown on your menu."
        actions={
          <Button className="rounded-full" disabled={!categories.length} onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> New article
          </Button>
        }
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search articles" className="rounded-full pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-full rounded-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-destructive">{errorMessage(error)}</p>
      ) : !categories.length ? (
        <EmptyState title="Create a category first">Articles must belong to a category.</EmptyState>
      ) : list.length === 0 ? (
        <EmptyState title={q || cat !== "all" ? "No matching articles" : "No articles yet"} />
      ) : (
        <div className="space-y-3">
          {list.map((a) => {
            const siblings = articles.filter((x) => x.category_id === a.category_id);
            const i = siblings.findIndex((x) => x.id === a.id);
            return (
              <div key={a.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
                <Thumb src={a.image_url ? images[a.image_url] : undefined} alt={a.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{a.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{catName(a.category_id)}</p>
                </div>
                <p className="shrink-0 font-bold text-primary">{formatPrice(a.price)}</p>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" className="hidden sm:inline-flex" disabled={!!q || i === 0} onClick={() => move(a, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="hidden sm:inline-flex" disabled={!!q || i === siblings.length - 1} onClick={() => move(a, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditing(a)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleting(a)} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <ArticleForm
          article={editing === "new" ? null : editing}
          categories={categories}
          defaultCategory={cat !== "all" ? cat : categories[0]?.id}
          currentImage={editing !== "new" && editing.image_url ? images[editing.image_url] : undefined}
          nextOrder={(c) => articles.filter((a) => a.category_id === c).length}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); invalidate(); }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>It will disappear from the public menu. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ArticleForm({
  article, categories, defaultCategory, currentImage, nextOrder, onClose, onSaved,
}: {
  article: Article | null; categories: Category[]; defaultCategory?: string; currentImage?: string;
  nextOrder: (categoryId: string) => number; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(article?.name ?? "");
  const [description, setDescription] = useState(article?.description ?? "");
  const [price, setPrice] = useState(article ? String(article.price) : "");
  const [categoryId, setCategoryId] = useState(article?.category_id ?? defaultCategory ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [keepImage, setKeepImage] = useState(!!article?.image_url);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const p = Number(price.replace(",", "."));
    if (!name.trim()) errs.name = "Name is required.";
    if (price.trim() === "" || !Number.isFinite(p) || p < 0) errs.price = "Enter a valid price (0 or more).";
    if (!categories.some((c) => c.id === categoryId)) errs.category = "Choose a category.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      let image_url = keepImage ? article?.image_url ?? null : null;
      if (file) image_url = await uploadImage(file);
      const payload = { name: name.trim(), description: description.trim() || null, price: p, category_id: categoryId, image_url };
      const moved = article && article.category_id !== categoryId;
      const { error } = article
        ? await supabase.from("menu_articles").update(moved ? { ...payload, display_order: nextOrder(categoryId) } : payload).eq("id", article.id)
        : await supabase.from("menu_articles").insert({ ...payload, display_order: nextOrder(categoryId) });
      if (error) throw error;
      toast.success(article ? "Article updated." : "Article created.");
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader><DialogTitle>{article ? "Edit article" : "New article"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aname">Name</Label>
            <Input id="aname" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="adesc">Description</Label>
            <Textarea id="adesc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="aprice">Price</Label>
              <div className="relative">
                <Input id="aprice" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className="pr-12" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">DT</span>
              </div>
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <ImagePicker
              currentUrl={keepImage ? currentImage : undefined}
              file={file}
              onFile={(f) => { setFile(f); setErrors((e) => ({ ...e, image: "" })); }}
              onClear={() => { setFile(null); setKeepImage(false); }}
              error={errors.image}
              onError={(m) => setErrors((e) => ({ ...e, image: m }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="rounded-full" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
