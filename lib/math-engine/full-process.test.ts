import { describe, expect, it } from "vitest";
import { solveTaskWithFullProcess } from "./full-process";

describe("solveTaskWithFullProcess (Wbudowany Silnik Rozwiązywania Zadań)", () => {
  it("generuje pełny proces dla równania kwadratowego z deltą", () => {
    const res = solveTaskWithFullProcess("x^2 - 5x + 6 = 0", "Zadanie 4b");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.detectedTaskTitle).toContain("Zadanie 4b");
      expect(res.taskType).toBe("equation");
      expect(res.givenData?.length).toBeGreaterThan(0);
      expect(res.appliedFormulas?.length).toBeGreaterThan(0);
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

  it("generuje pełny proces dla układu równań liniowych", () => {
    const res = solveTaskWithFullProcess("2x + y = 7, x - y = 2");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.taskType).toBe("equation");
      expect(res.finalAnswerTex).toContain("x = 3");
      expect(res.finalAnswerTex).toContain("y = 1");
      expect(res.steps.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("generuje pełny proces dla nierówności liniowej", () => {
    const res = solveTaskWithFullProcess("2x - 4 > 6");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.taskType).toBe("equation");
      expect(res.finalAnswerTex).toContain("5");
      expect(res.finalAnswerTex).toContain("+\\infty");
    }
  });

  it("generuje pełny proces dla geometrii (Twierdzenie Pitagorasa)", () => {
    const res = solveTaskWithFullProcess("Pitagoras a=3, b=4");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.taskType).toBe("geometry");
      expect(res.finalAnswerTex).toContain("c = 5");
      expect(res.steps.length).toBe(3);
    }
  });

  it("generuje pełny proces dla procentów", () => {
    const res = solveTaskWithFullProcess("20% z 150");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.taskType).toBe("word_problem");
      expect(res.finalAnswerTex).toBe("30");
    }
  });

  it("generuje pełny proces dla wyłączania czynnika przed pierwiastek", () => {
    const res = solveTaskWithFullProcess("sqrt(50)");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.taskType).toBe("expression");
      expect(res.finalAnswerTex).toContain("5\\sqrt{2}");
    }
  });

  it("generuje pełny proces dla NWD i NWW", () => {
    const res = solveTaskWithFullProcess("NWD(24, 36)");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.taskType).toBe("expression");
      expect(res.finalAnswerTex).toContain("12");
      expect(res.finalAnswerTex).toContain("72");
    }
  });

  it("generuje pełny proces dla dodawania ułamków zwykłych", () => {
    const res = solveTaskWithFullProcess("1/2 + 1/3", "Zadanie 2");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.detectedTaskTitle).toContain("Zadanie 2");
      expect(res.taskType).toBe("expression");
      expect(res.appliedFormulas?.[0]).toContain("NWW");
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
