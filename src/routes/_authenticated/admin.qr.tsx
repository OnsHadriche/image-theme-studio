import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, ExternalLink, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/PageHeader";
import { MENU_SLUG, RESTAURANT_NAME } from "@/lib/menu";

export const Route = createFileRoute("/_authenticated/admin/qr")({
  component: QrPage,
});

const QR_OPTS = { errorCorrectionLevel: "M" as const, margin: 4, color: { dark: "#063E9E", light: "#FFFFFF" } };

function QrPage() {
  const [url, setUrl] = useState("");
  const [png, setPng] = useState("");
  const [svg, setSvg] = useState("");

  useEffect(() => {
    const u = `${window.location.origin}/menu/${MENU_SLUG}`;
    setUrl(u);
    QRCode.toDataURL(u, { ...QR_OPTS, width: 1024 }).then(setPng);
    QRCode.toString(u, { ...QR_OPTS, type: "svg" }).then(setSvg);
  }, []);

  const isPreview = url.includes("id-preview--") || url.includes("localhost");

  function download(href: string, name: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.click();
  }

  function print() {
    const w = window.open("", "_blank");
    if (!w) return toast.error("Allow pop-ups to print.");
    w.document.write(`<!doctype html><html><head><title>${RESTAURANT_NAME} — QR</title>
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,700&display=swap" rel="stylesheet">
      <style>body{font-family:Satoshi,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;color:#063E9E;background:#fff}
      .c{text-align:center;padding:48px;border:2px solid #063E9E;border-radius:32px}h1{font-size:36px;margin:0}p{letter-spacing:.3em;text-transform:uppercase;font-size:12px}
      img{width:320px;height:320px;margin:24px 0}small{font-size:12px;color:#555}</style></head>
      <body><div class="c"><h1>${RESTAURANT_NAME}</h1><p>Scan for our menu</p><img src="${png}"/><br/><small>${url}</small></div>
      <script>window.onload=()=>{window.print()}</script></body></html>`);
    w.document.close();
  }

  return (
    <div>
      <PageHeader title="QR Code" subtitle="One permanent code for your tables — menu edits never require reprinting." />
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="rounded-3xl border bg-card p-6 text-center shadow-soft">
          {png ? <img src={png} alt="Menu QR code" className="mx-auto h-64 w-64 rounded-2xl" /> : <div className="h-64 w-64" />}
          <p className="mt-4 font-bold text-primary">{RESTAURANT_NAME}</p>
        </div>
        <div className="space-y-6 rounded-3xl border bg-card p-6">
          <div>
            <p className="mb-2 text-sm font-medium">Public menu address</p>
            <div className="flex gap-2">
              <Input readOnly value={url} className="rounded-full" />
              <Button variant="outline" size="icon" className="shrink-0 rounded-full" aria-label="Copy link"
                onClick={() => navigator.clipboard.writeText(url).then(() => toast.success("Link copied."))}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {isPreview && (
              <p className="mt-2 text-sm text-destructive">
                This is a preview address. Publish your app and open this page from the live site before printing.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full" disabled={!png} onClick={() => download(png, "monaco-menu-qr.png")}><Download className="h-4 w-4" /> PNG</Button>
            <Button variant="outline" className="rounded-full" disabled={!svg}
              onClick={() => download(URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })), "monaco-menu-qr.svg")}>
              <Download className="h-4 w-4" /> SVG
            </Button>
            <Button variant="outline" className="rounded-full" disabled={!png} onClick={print}><Printer className="h-4 w-4" /> Print</Button>
            <Button asChild variant="ghost" className="rounded-full">
              <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Test link</a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            The code always points to the same address. Changing dishes, prices or photos updates the menu instantly — printed codes keep working. Only changing your website address would require a new print.
          </p>
        </div>
      </div>
    </div>
  );
}
