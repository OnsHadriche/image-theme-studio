import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState, PageHeader, Thumb } from "@/components/admin/PageHeader";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { TranslationFields, emptyTranslations, translationsPayload } from "@/components/admin/TranslationFields";
import { useInvalidateMenu, useMenuData } from "@/hooks/use-menu-data";
import { type Category, errorMessage, swapOrder, uploadImage } from "@/lib/menu";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  validateSearch: (s: Record<string, unknown>): { new?: boolean } => (s["new"] ? { new: true } : {}),
  component: CategoriesPage,
});

function CategoriesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { categories, articles, images, isLoading, error } = useMenuData();
  const invalidate = useInvalidateMenu();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  useEffect(() => {
    if (search.new) {
      setEditing("new");
      navigate({ to: "/admin/categories", search: {}, replace: true });
    }
  }, [search.new, navigate]);

  const count = (id: string) => articles.filter((a) => a.category_id === id).length;
  const list = categories.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  async function move(i: number, dir: -1 | 1) {
    try {
      await swapOrder("categories", categories, i, dir);
      await invalidate();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const { error } = await supabase.from("categories").delete().eq("id", deleting.id);
    if (error) toast.error(errorMessage(error));
    else toast.success("Category deleted.");
    setDeleting(null);
    invalidate();
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Organise how your menu is grouped."
        actions={<Button className="rounded-full" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New category</Button>}
      />
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search categories" className="rounded-full pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-destructive">{errorMessage(error)}</p>
      ) : list.length === 0 ? (
        <EmptyState title={q ? "No matching categories" : "No categories yet"}>
          {!q && "Create your first category to start building the menu."}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {list.map((c) => {
            const i = categories.findIndex((x) => x.id === c.id);
            return (
              <div key={c.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
                <Thumb src={c.image_url ? images[c.image_url] : undefined} alt={c.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {count(c.id)} article{count(c.id) === 1 ? "" : "s"}
                    {c.description ? ` · ${c.description}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" disabled={!!q || i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" disabled={!!q || i === categories.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditing(c)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleting(c)} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <CategoryForm
          category={editing === "new" ? null : editing}
          currentImage={editing !== "new" && editing.image_url ? images[editing.image_url] : undefined}
          nextOrder={categories.length}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); invalidate(); }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && count(deleting.id) > 0
                ? `This category contains ${count(deleting.id)} article(s). Move them to another category or delete them first.`
                : "This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {deleting && count(deleting.id) === 0 && (
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CategoryForm({
  category, currentImage, nextOrder, onClose, onSaved,
}: {
  category: Category | null; currentImage?: string | undefined; nextOrder: number; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [tr, setTr] = useState(() => emptyTranslations(category));
  const [file, setFile] = useState<File | null>(null);
  const [keepImage, setKeepImage] = useState(!!category?.image_url);
  const [errors, setErrors] = useState<Partial<Record<"name" | "price" | "category" | "image", string>>>({});
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErrors({ name: "Name is required." });
    setBusy(true);
    try {
      let image_url = keepImage ? category?.image_url ?? null : null;
      if (file) image_url = await uploadImage(file);
      const payload = { name: name.trim(), description: description.trim() || null, image_url, ...translationsPayload(tr) };
      const { error } = category
        ? await supabase.from("categories").update(payload).eq("id", category.id)
        : await supabase.from("categories").insert({ ...payload, display_order: nextOrder });
      if (error) throw error;
      toast.success(category ? "Category updated." : "Category created.");
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
        <DialogHeader><DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cname">Name</Label>
            <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cdesc">Description (optional)</Label>
            <Textarea id="cdesc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <TranslationFields value={tr} onChange={setTr} />
          <div className="space-y-2">
            <Label>Image (optional)</Label>
            <ImagePicker
              currentUrl={keepImage ? currentImage : undefined}
              file={file}
              onFile={(f) => { setFile(f); setErrors({}); }}
              onClear={() => { setFile(null); setKeepImage(false); }}
              error={errors.image}
              onError={(m) => setErrors({ image: m })}
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
