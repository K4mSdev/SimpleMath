import { describe, expect, it } from "vitest";
import { evaluateExpression, type CalcResult, type CalcSuccess } from "./index";

const deg = { angleMode: "deg" as const };
const rad = { angleMode: "rad" as const };

function ok(result: CalcResult): CalcSuccess {
  if (result.status !== "ok") {
    throw new Error(`Oczekiwano wyniku, otrzymano: ${JSON.stringify(result)}`);
  }
  return result;
}

function errorMessage(result: CalcResult): string {
  if (result.status !== "error") throw new Error(`Oczekiwano błędu: ${JSON.stringify(result)}`);
  return result.message;
}

describe("podstawowe działania", () => {
  it.each([
    ["2+2", "4"],
    ["2·3", "6"],
    ["2*3", "6"],
    ["8:2", "4"],
    ["8/2", "4"],
    ["2^10", "1024"],
    ["5!", "120"],
    ["2(3+4)", "14"],
    ["2,5·4", "10"],
    ["-3+1", "-2"],
  ])("%s = %s", (input, expected) => {
    expect(ok(evaluateExpression(input, deg)).decimal.text).toBe(expected);
  });

  it("pusty input", () => {
    expect(evaluateExpression("   ", deg).status).toBe("empty");
  });
});

describe("dokładność i ułamki", () => {
  it("0,1 + 0,2 = 0,3 (bez błędu zmiennoprzecinkowego)", () => {
    const r = ok(evaluateExpression("0,1+0,2", deg));
    expect(r.decimal.text).toBe("0,3");
    expect(r.fraction?.text).toBe("3/10");
    expect(r.isApprox).toBe(false);
  });

  it("1:3 → 1/3 = 0,(3)", () => {
    const r = ok(evaluateExpression("1:3", deg));
    expect(r.fraction?.text).toBe("1/3");
    expect(r.decimal.text).toBe("0,(3)");
    expect(r.mixed).toBeUndefined();
  });

  it("1/6 → 0,1(6)", () => {
    expect(ok(evaluateExpression("1/6", deg)).decimal.text).toBe("0,1(6)");
  });

  it("7/3 → liczba mieszana 2 1/3", () => {
    const r = ok(evaluateExpression("7/3", deg));
    expect(r.mixed?.text).toBe("2 1/3");
    expect(r.resultTex).toContain("2\\frac{1}{3}");
  });

  it("-7/3 → ujemny ułamek", () => {
    const r = ok(evaluateExpression("-7/3", deg));
    expect(r.fraction?.tex).toBe("-\\frac{7}{3}");
    expect(r.mixed?.tex).toBe("-2\\frac{1}{3}");
  });

  it("2^64 liczone dokładnie", () => {
    expect(ok(evaluateExpression("2^64", deg)).decimal.text).toBe("18446744073709551616");
  });

  it("ułamki zwykłe dodają się dokładnie", () => {
    expect(ok(evaluateExpression("1/2+1/3", deg)).fraction?.text).toBe("5/6");
  });
});

describe("pierwiastki i stałe", () => {
  it("√16 = 4", () => {
    expect(ok(evaluateExpression("√16", deg)).decimal.text).toBe("4");
  });

  it("√(2) jest przybliżony", () => {
    const r = ok(evaluateExpression("√(2)", deg));
    expect(r.isApprox).toBe(true);
    expect(r.decimal.text).toBe("1,41421356237");
  });

  it("2π", () => {
    expect(ok(evaluateExpression("2π", deg)).decimal.text).toBe("6,28318530718");
  });
});

describe("trygonometria", () => {
  it.each([
    ["sin(30)", "0,5"],
    ["cos(60)", "0,5"],
    ["cos(90)", "0"],
    ["tg(45)", "1"],
    ["ctg(45)", "1"],
    ["sin(30°)", "0,5"],
    ["arcsin(0,5)", "30"],
  ])("DEG: %s = %s", (input, expected) => {
    expect(ok(evaluateExpression(input, deg)).decimal.text).toBe(expected);
  });

  it("DEG: tg(90) nie istnieje", () => {
    expect(errorMessage(evaluateExpression("tg(90)", deg))).toContain("Tangens");
  });

  it("RAD: sin(π) = 0", () => {
    expect(ok(evaluateExpression("sin(π)", rad)).decimal.text).toBe("0");
  });

  it("RAD: sin(30°) = 0,5", () => {
    expect(ok(evaluateExpression("sin(30°)", rad)).decimal.text).toBe("0,5");
  });
});

describe("logarytmy", () => {
  it.each([
    ["log(100)", "2"],
    ["log(1000)", "3"],
    ["log(8;2)", "3"],
    ["ln(e)", "1"],
  ])("%s = %s", (input, expected) => {
    expect(ok(evaluateExpression(input, deg)).decimal.text).toBe(expected);
  });

  it("log z liczby ujemnej", () => {
    expect(errorMessage(evaluateExpression("log(-1)", deg))).toContain("dodatnich");
  });

  it("LaTeX logarytmu o podstawie", () => {
    expect(ok(evaluateExpression("log(8;2)", deg)).inputTex).toContain("\\log_{2}");
  });
});

describe("błędy po polsku", () => {
  it("dzielenie przez zero", () => {
    expect(errorMessage(evaluateExpression("1/0", deg))).toBe("Nie można dzielić przez zero");
  });

  it("pierwiastek z liczby ujemnej", () => {
    expect(errorMessage(evaluateExpression("√(-4)", deg))).toContain("rzeczywistych");
  });

  it("brak nawiasu", () => {
    expect(errorMessage(evaluateExpression("(2+3", deg))).toContain("nawias");
  });

  it("niedokończone wyrażenie", () => {
    expect(errorMessage(evaluateExpression("2+", deg))).toContain("niedokończone");
  });

  it("ans bez poprzedniego wyniku", () => {
    expect(errorMessage(evaluateExpression("ans+1", deg))).toContain("poprzedniego");
  });

  it("ogromna potęga nie zawiesza kalkulatora", () => {
    const start = Date.now();
    expect(errorMessage(evaluateExpression("9^9^9", deg))).toBe("Wynik jest zbyt duży");
    expect(Date.now() - start).toBeLessThan(2000);
  });
});

describe("poprzedni wynik (ans)", () => {
  it("ans zachowuje dokładny ułamek", () => {
    const r = ok(evaluateExpression("ans·2", { ...deg, ans: { value: 7 / 3, exact: "7/3" } }));
    expect(r.fraction?.text).toBe("14/3");
  });

  it("ans przybliżony", () => {
    const r = ok(evaluateExpression("ans^2", { ...deg, ans: { value: Math.SQRT2 } }));
    expect(r.decimal.text).toBe("2");
  });
});
