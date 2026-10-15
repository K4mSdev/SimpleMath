import { describe, expect, it } from "vitest";
import {
  normalizeOcrMath,
  extractPureMathExpression,
  extractTaskCandidates,
  selectBestCandidate,
} from "./standalone-ocr";

describe("standalone-ocr (Wbudowany Silnik Odczytu)", () => {
  it("normalizuje znaki matematyczne i pomyłki OCR", () => {
    const raw = "2x² - 5x + 2 ＝ O";
    const cleaned = normalizeOcrMath(raw);
    expect(cleaned).toBe("2x^2 - 5x + 2 = 0");

    const frac = "3 ÷ 4 × 2";
    expect(normalizeOcrMath(frac)).toBe("3 : 4 * 2");

    // Potęgi w druku szkolnym
    const pow = "x2 - 5x + 6 = 0";
    expect(normalizeOcrMath(pow)).toBe("x^2 - 5x + 6 = 0");
  });

  it("oczyszcza polecenia szkolne z treści równania", () => {
    const t1 = "Zadanie 1. Rozwiąż równanie: 2x2 - 4x - 6 = 0";
    const res1 = extractPureMathExpression(t1);
    expect(res1.expression).toBe("2x^2 - 4x - 6 = 0");
    expect(res1.detectedType).toBe("equation");

    const t2 = "Zad. 3a) 2x + 4 = 10.";
    const res2 = extractPureMathExpression(t2);
    expect(res2.expression).toBe("2x + 4 = 10");

    const t3 = "Oblicz wartość wyrażenia: 1/2 + 2/3 =";
    const res3 = extractPureMathExpression(t3);
    expect(res3.expression).toBe("1/2 + 2/3");
    expect(res3.detectedType).toBe("expression");
  });

  it("wyodrębnia zadania z tekstu wielozadaniowego", () => {
    const pageText = `
Zadanie 1. Rozwiąż równanie: 2x + 4 = 10
Zadanie 2. Oblicz deltę: x^2 - 5x + 6 = 0
Zadanie 3. Oblicz ułamek: 1/2 + 1/3
`;
    const candidates = extractTaskCandidates(pageText);
    expect(candidates.length).toBe(3);
    expect(candidates[0].label).toContain("Zadanie 1");
    expect(candidates[0].cleanMath).toBe("2x + 4 = 10");
    expect(candidates[1].label).toContain("Zadanie 2");
    expect(candidates[1].cleanMath).toBe("x^2 - 5x + 6 = 0");
    expect(candidates[2].label).toContain("Zadanie 3");
    expect(candidates[2].cleanMath).toBe("1/2 + 1/3");
  });

  it("dopasowuje kandydata na podstawie instrukcji użytkownika", () => {
    const candidates = [
      {
        id: "1",
        label: "Zadanie 1",
        rawText: "2x + 4 = 10",
        cleanMath: "2x + 4 = 10",
        confidence: 90,
      },
      {
        id: "2",
        label: "Zadanie 2",
        rawText: "x^2 - 5x + 6 = 0",
        cleanMath: "x^2 - 5x + 6 = 0",
        confidence: 90,
      },
      {
        id: "3",
        label: "Zadanie 3b",
        rawText: "1/2 + 1/3",
        cleanMath: "1/2 + 1/3",
        confidence: 90,
      },
    ];

    const best1 = selectBestCandidate(candidates, "Zadanie 2");
    expect(best1?.id).toBe("2");

    const best2 = selectBestCandidate(candidates, "3b");
    expect(best2?.id).toBe("3");
  });
});
