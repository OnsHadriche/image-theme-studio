import { describe, expect, it } from "vitest";
import { localized } from "@/lib/menu-i18n";

const dish = { name: "Salade", description: "Fraîche", name_en: "Salad", description_en: null, name_ar: "", description_ar: "طازجة" };

describe("menu translations", () => {
  it("shows French by default", () => expect(localized(dish, "fr").name).toBe("Salade"));
  it("shows the English name when filled", () => expect(localized(dish, "en").name).toBe("Salad"));
  it("falls back to French when a translation is empty", () => {
    expect(localized(dish, "en").description).toBe("Fraîche");
    expect(localized(dish, "ar").name).toBe("Salade");
  });
  it("shows the Arabic description when filled", () => expect(localized(dish, "ar").description).toBe("طازجة"));
});
