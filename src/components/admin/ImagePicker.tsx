import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { validateImage } from "@/lib/menu";

export function ImagePicker({
  currentUrl,
  file,
  onFile,
  onClear,
  error,
  onError,
}: {
  currentUrl?: string;
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
  error?: string;
  onError: (msg: string) => void;
}) {
  const [preview, setPreview] = useState<string | undefined>();
  useEffect(() => {
    if (!file) return setPreview(undefined);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const shown = preview ?? currentUrl;

  return (
    <div>
      {shown ? (
        <div className="relative h-40 overflow-hidden rounded-2xl border">
          <img src={shown} alt="Preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 rounded-full bg-card p-1.5 text-foreground shadow"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/50 text-sm text-muted-foreground hover:border-primary">
          <ImagePlus className="h-6 w-6 text-primary" />
          Upload image (JPG, PNG, WebP · max 5 MB)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const err = validateImage(f);
              if (err) onError(err);
              else onFile(f);
              e.target.value = "";
            }}
          />
        </label>
      )}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
