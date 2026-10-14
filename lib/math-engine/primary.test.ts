import { describe, expect, it } from "vitest";
import {
  calculateFractionsStepByStep,
  computeGcdLcm,
  computePercentage,
  extractRootFactor,
  gcd,
  lcm,
  primeFactors,
} from "./primary";

describe("NWD, NWW i czynniki pierwsze (klasy 4-6)", () => {
  it("NWD i NWW dla 24 i 36", () => {
    expect(gcd(24, 36)).toBe(12);
    expect(lcm(24, 36)).toBe(72);
  });

  it("Rozkład na czynniki pierwsze 60", () => {
    expect(primeFactors(60)).toEqual([2, 2, 3, 5]);
  });

  it("Pełne kroki NWD/NWW dla 18 i 24", () => {
    const res = computeGcdLcm(18, 24);
    expect(res.gcd).toBe(6);
    expect(res.lcm).toBe(72);
    expect(res.steps.length).toBe(3);
  });
});

describe("Działania na ułamkach zwykłych krok po kroku (klasy 4-7)", () => {
  it("1/2 + 1/3 = 5/6", () => {
    const res = calculateFractionsStepByStep(1, 2, "+", 1, 3);
    expect(res.simplifiedNum).toBe(5);
    expect(res.simplifiedDen).toBe(6);
  });

  it("7/4 - 1/4 = 6/4 = 3/2 = 1 1/2", () => {
    const res = calculateFractionsStepByStep(7, 4, "-", 1, 4);
    expect(res.simplifiedNum).toBe(3);
    expect(res.simplifiedDen).toBe(2);
    expect(res.wholeNumber).toBe(1);
    expect(res.remainderNum).toBe(1);
  });

  it("2/3 · 3/4 = 6/12 = 1/2", () => {
    const res = calculateFractionsStepByStep(2, 3, "·", 3, 4);
    expect(res.simplifiedNum).toBe(1);
    expect(res.simplifiedDen).toBe(2);
  });

  it("3/4 : 1/2 = 3/4 · 2/1 = 6/4 = 3/2", () => {
    const res = calculateFractionsStepByStep(3, 4, ":", 1, 2);
    expect(res.simplifiedNum).toBe(3);
    expect(res.simplifiedDen).toBe(2);
  });
});

describe("Wyłączanie czynnika przed znak pierwiastka (klasy 7-8)", () => {
  it("√50 = 5√2", () => {
    const res = extractRootFactor(50, 2);
    expect(res.outside).toBe(5);
    expect(res.inside).toBe(2);
    expect(res.tex).toBe("5\\sqrt{2}");
  });

  it("√12 = 2√3", () => {
    const res = extractRootFactor(12, 2);
    expect(res.outside).toBe(2);
    expect(res.inside).toBe(3);
  });

  it("√16 = 4", () => {
    const res = extractRootFactor(16, 2);
    expect(res.outside).toBe(4);
    expect(res.inside).toBe(1);
    expect(res.tex).toBe("4");
  });

  it("∛24 = 2∛3", () => {
    const res = extractRootFactor(24, 3);
    expect(res.outside).toBe(2);
    expect(res.inside).toBe(3);
    expect(res.tex).toBe("2\\sqrt[3]{3}");
  });
});

describe("Kalkulator procentów (klasy 6-8)", () => {
  it("20% z 150 = 30", () => {
    const res = computePercentage("percent_of_number", 20, 150);
    expect(res.result).toBe(30);
  });

  it("jakim procentem 200 jest 50 = 25%", () => {
    const res = computePercentage("what_percent", 50, 200);
    expect(res.result).toBe(25);
  });

  it("podwyżka o 10% ze 100 = 110", () => {
    const res = computePercentage("change_increase", 10, 100);
    expect(res.result).toBe(110);
  });

  it("obniżka o 20% z 80 = 64", () => {
    const res = computePercentage("change_decrease", 20, 80);
    expect(res.result).toBe(64);
  });
});
