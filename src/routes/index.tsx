import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MENU_SLUG, RESTAURANT_NAME } from "@/lib/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${RESTAURANT_NAME} — Digital Menu` },
      { name: "description", content: `Browse the digital menu of ${RESTAURANT_NAME}.` },
      { property: "og:title", content: `${RESTAURANT_NAME} — Digital Menu` },
      { property: "og:description", content: `Browse the digital menu of ${RESTAURANT_NAME}.` },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Digital menu</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-primary md:text-6xl">{RESTAURANT_NAME}</h1>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="rounded-full">
          <Link to="/menu/$slug" params={{ slug: MENU_SLUG }}>View the menu</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link to="/admin">Administration</Link>
        </Button>
      </div>
    </div>
  );
}
