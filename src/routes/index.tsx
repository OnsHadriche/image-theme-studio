import { createFileRoute, redirect } from "@tanstack/react-router";
import { MENU_SLUG, RESTAURANT_NAME } from "@/lib/menu";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/menu/$slug", params: { slug: MENU_SLUG }, replace: true });
  },
  head: () => ({
    meta: [
      { title: `${RESTAURANT_NAME} — Menu` },
      { name: "description", content: `Découvrez le menu de ${RESTAURANT_NAME}.` },
      { property: "og:title", content: `${RESTAURANT_NAME} — Menu` },
      { property: "og:description", content: `Découvrez le menu de ${RESTAURANT_NAME}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
