import { describe, expect, it } from "vitest";
import { solveTaskWithFullProcess } from "./full-process";

describe("solveTaskWithFullProcess", () => {
  it("generuje pełny proces dla równania kwadratowego z deltą", () => {
    const res = solveTaskWithFullProcess("x^2 - 5x + 6 = 0", "Zadanie 4b");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.detectedTaskTitle).toContain("Zadanie 4b");
      expect(res.taskType).toBe("equation");
      expect(res.givenData.length).toBeGreaterThan(0);
      expect(res.appliedFormulas.length).toBeGreaterThan(0);
      expect(res.steps.length).toBeGreaterThan(0);
      expect(res.finalAnswerTex).toContain("x_1");
      expect(res.finalAnswerTex).toContain("x_2");
      expect(res.verification).toBeDefined();
    }
  });

  it("generuje pełny proces dla równania liniowego", () => {
    const res = solveTaskWithFullProcess("2x + 4 = 10");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.taskType).toBe("equation");
      expect(res.finalAnswerTex).toBe("x = 3");
      expect(res.steps.length).toBeGreaterThan(0);
    }
  });

  it("generuje pełny proces dla dodawania ułamków zwykłych", () => {
    const res = solveTaskWithFullProcess("1/2 + 1/3", "Zadanie 2");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.detectedTaskTitle).toContain("Zadanie 2");
      expect(res.taskType).toBe("expression");
      expect(res.appliedFormulas[0]).toContain("NWW");
      expect(res.finalAnswerTex).toContain("5");
      expect(res.finalAnswerTex).toContain("6");
    }
  });

  it("generuje pełny proces dla wyrażenia arytmetycznego", () => {
    const res = solveTaskWithFullProcess("2 + 2 * 2");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.finalAnswerText).toBe("6");
      expect(res.steps.length).toBe(2);
    }
  });
});
