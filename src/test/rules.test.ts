import { describe, expect, it } from "vitest";
import { contactFor, looksLikeEmergency, SERVICES } from "@/lib/data";
import { mockRecommend, mockReport } from "@/lib/ai-mock";

describe("prototype rules", () => {
  it("routes water issues to Water & Sanitation for the area's municipality", () => {
    const c = contactFor("Water leak", "Bellville, Cape Town");
    expect(c.department).toBe("Water & Sanitation");
    expect(c.municipality).toBe("City of Cape Town (demo)");
  });
  it("marks missing location as not provided instead of inventing one", () => {
    expect(mockReport({ description: "bins not collected" })).toContain("Not provided");
  });
  it("only recommends services that exist in the directory", () => {
    const ids = new Set(SERVICES.map((s) => s.id));
    expect(mockRecommend("I need food support").matches.every((m) => ids.has(m.id))).toBe(true);
  });
  it("flags emergencies", () => {
    expect(looksLikeEmergency("there is a fire in the house")).toBe(true);
  });
});
