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

  it("rozpoznaje i rozwiązuje zadanie z pełnym poleceniem po polsku ze zdjęcia", () => {
    const res = solveTaskWithFullProcess("Zadanie 1. Rozwiąż równanie: 2x2 - 4x - 6 = 0");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.taskType).toBe("equation");
      expect(res.cleanExpression).toBe("2x^2 - 4x - 6 = 0");
      expect(res.finalAnswerTex).toContain("x_1");
      expect(res.finalAnswerTex).toContain("x_2");
    }
  });

  it("rozpoznaje ułamki z prefiksem i znakiem równości na końcu", () => {
    const res = solveTaskWithFullProcess("Oblicz wartość wyrażenia: 3/4 + 1/2 =");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.taskType).toBe("expression");
      expect(res.cleanExpression).toBe("3/4 + 1/2");
      expect(res.finalAnswerTex).toContain("5");
      expect(res.finalAnswerTex).toContain("4");
    }
  });

  it("generuje pełny proces dla nierówności kwadratowej (Matura CKE)", () => {
    const res = solveTaskWithFullProcess("x^2 - 5x + 6 > 0");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.taskType).toBe("equation");
      expect(res.finalAnswerTex).toContain("-\\infty");
      expect(res.finalAnswerTex).toContain("+\\infty");
      expect(res.finalAnswerTex).toContain("2");
      expect(res.finalAnswerTex).toContain("3");
    }
  });

  it("generuje pełny proces dla logarytmów", () => {
    const res1 = solveTaskWithFullProcess("log_2(8)");
    expect(res1).not.toBeNull();
    if (res1) {
      expect(res1.finalAnswerTex).toBe("3");
    }

    const res2 = solveTaskWithFullProcess("log_2(16) + log_2(4)");
    expect(res2).not.toBeNull();
    if (res2) {
      expect(res2.finalAnswerTex).toBe("6");
    }
  });

  it("generuje pełny proces dla ciągów liczbowych", () => {
    const resA = solveTaskWithFullProcess("ciąg arytmetyczny a1=3, r=2, n=10");
    expect(resA).not.toBeNull();
    if (resA) {
      expect(resA.finalAnswerTex).toContain("21"); // a10 = 3 + 9*2 = 21
      expect(resA.finalAnswerTex).toContain("120"); // S10 = ((3+21)/2)*10 = 120
    }

    const resG = solveTaskWithFullProcess("ciąg geometryczny a1=2, q=3, n=4");
    expect(resG).not.toBeNull();
    if (resG) {
      expect(resG.finalAnswerTex).toContain("54"); // a4 = 2*27 = 54
    }
  });

  it("generuje pełny proces dla trygonometrii", () => {
    const res = solveTaskWithFullProcess("sin(30)");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.finalAnswerTex).toContain("1");
      expect(res.finalAnswerTex).toContain("2");
    }
  });

  it("generuje pełny proces dla równania wymiernego", () => {
    const res = solveTaskWithFullProcess("(2x + 4)/(x - 1) = 3");
    expect(res).not.toBeNull();
    if (res) {
      expect(res.taskType).toBe("equation");
      expect(res.finalAnswerTex).toContain("7");
    }
  });

  it("generuje pełny proces dla geometrii analitycznej i brył", () => {
    const resGeom = solveTaskWithFullProcess("A(1, 2), B(4, 6)");
    expect(resGeom).not.toBeNull();
    if (resGeom) {
      expect(resGeom.finalAnswerTex).toContain("5"); // |AB| = sqrt(3^2 + 4^2) = 5
      expect(resGeom.finalAnswerTex).toContain("S = (2.5");
    }

    const resSolid = solveTaskWithFullProcess("walec r=3, h=5");
    expect(resSolid).not.toBeNull();
    if (resSolid) {
      expect(resSolid.finalAnswerTex).toContain("45\\pi"); // V = pi * 9 * 5 = 45pi
    }
  });

  it("generuje pełny proces dla kombinatoryki (silnia i symbol Newtona)", () => {
    const resFact = solveTaskWithFullProcess("5!");
    expect(resFact).not.toBeNull();
    if (resFact) {
      expect(resFact.finalAnswerTex).toBe("120");
    }

    const resNewton = solveTaskWithFullProcess("symbol Newtona (6 po 2)");
    expect(resNewton).not.toBeNull();
    if (resNewton) {
      expect(resNewton.finalAnswerTex).toBe("15");
    }
  });
});

