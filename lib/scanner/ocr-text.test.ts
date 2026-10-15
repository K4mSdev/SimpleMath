import { describe, expect, it } from "vitest";
import { classifyScan, cleanOcrText } from "./ocr-text";

describe("cleanOcrText", () => {
  it("zamienia znaki typograficzne na zapis kalkulatora", () => {
    expect(cleanOcrText("12 × 3 − 4")).toBe("12 * 3 - 4");
    expect(cleanOcrText("8 ÷ 2")).toBe("8 : 2");
  });

  it("usuwa numerację zadania", () => {
    expect(cleanOcrText("Zad. 4. 2x + 8 = 14")).toBe("2x + 8 = 14");
    expect(cleanOcrText("3) 5 + 5")).toBe("5 + 5");
  });

  it("wybiera linię z matematyką zamiast treści słownej", () => {
    const raw = "Oblicz wartość wyrażenia\n2 + 3 * 4\nOdpowiedź zapisz w zeszycie";
    expect(cleanOcrText(raw)).toBe("2 + 3 * 4");
  });

  it("rozpoznaje x jako mnożenie tylko między liczbami", () => {
    expect(cleanOcrText("3 x 4")).toBe("3*4");
    expect(cleanOcrText("5x + 6 = 0")).toBe("5x + 6 = 0");
    expect(cleanOcrText("X^2 - 4 = 0")).toBe("x^2 - 4 = 0");
  });

  it("poprawia O na 0 i obcina końcowe znaki", () => {
    expect(cleanOcrText("x^2 - 4x + 4 = O")).toBe("x^2 - 4x + 4 = 0");
    expect(cleanOcrText("7 + 8.")).toBe("7 + 8");
  });

  it("zwraca pusty tekst dla pustego wejścia", () => {
    expect(cleanOcrText("  \n ")).toBe("");
  });
});

describe("classifyScan", () => {
  it("rozpoznaje równanie", () => {
    expect(classifyScan("x^2 - 5x + 6 = 0")).toBe("equation");
  });
  it("rozpoznaje wyrażenie", () => {
    expect(classifyScan("2 + 3 * 4")).toBe("expression");
  });
  it("zwraca unknown dla tekstu bez liczb", () => {
    expect(classifyScan("abc")).toBe("unknown");
    expect(classifyScan("")).toBe("unknown");
  });
});
