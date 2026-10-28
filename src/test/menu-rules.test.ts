import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { formatPrice, validateImage } from "@/lib/menu";

describe("menu rules", () => {
  it("formats prices in Tunisian dinars", () => {
    expect(formatPrice(12.5)).toBe("12.5 DT");
    expect(formatPrice(8)).toBe("8 DT");
  });
  it("rejects images over 5 MB", () => {
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "a.jpg", { type: "image/jpeg" });
    expect(validateImage(big)).not.toBeNull();
  });
  it("rejects non JPG/PNG/WebP images", () => {
    expect(validateImage(new File(["x"], "a.gif", { type: "image/gif" }))).not.toBeNull();
  });
});
