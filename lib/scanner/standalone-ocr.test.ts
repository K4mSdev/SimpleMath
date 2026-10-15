import { describe, expect, it } from "vitest";
import {
  normalizeOcrMath,
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
    expect(candidates[1].label).toContain("Zadanie 2");
    expect(candidates[2].label).toContain("Zadanie 3");
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
