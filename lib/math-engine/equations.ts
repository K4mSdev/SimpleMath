import { formatNumber, fractionToFormatted, parseFraction, type Formatted } from "./format";
import { getMath } from "./instances";

export interface EquationStep {
  title: string;
  explanation: string;
  tex: string;
}

export type EquationType = "linear" | "quadratic" | "identity" | "contradiction";

export interface LinearSolution {
  type: "linear";
  a: number;
  b: number; // ax + b = 0
  x: number;
  xFormatted: Formatted;
  steps: EquationStep[];
}

export interface QuadraticSolution {
  type: "quadratic";
  a: number;
  b: number;
  c: number; // ax^2 + bx + c = 0
  delta: number;
  deltaSqrt: number | null; // jeśli delta >= 0
  x1?: number;
  x2?: number;
  x0?: number;
  x1Formatted?: Formatted;
  x2Formatted?: Formatted;
  x0Formatted?: Formatted;
  vertex: { p: number; q: number; pTex: string; qTex: string };
  canonicalTex: string;
  factoredTex: string | null;
  steps: EquationStep[];
}

export interface SpecialSolution {
  type: "identity" | "contradiction";
  message: string;
  steps: EquationStep[];
}

export type EquationResult =
  | { status: "ok"; data: LinearSolution | QuadraticSolution | SpecialSolution }
  | { status: "error"; message: string };

const math = getMath("number", "deg");

/**
 * Upraszcza i normalizuje równanie z x (np. "2x + 4 = 10", "x^2 - 5x + 6 = 0")
 * i wyznacza postać zredukowaną Ax² + Bx + C = 0.
 */
export function solveEquation(input: string): EquationResult {
  const trimmed = input.trim();
  if (!trimmed.includes("=")) {
    return {
      status: "error",
      message: "Równanie musi zawierać znak równości „=”, np. 2x + 4 = 10 lub x^2 - 5x + 6 = 0",
    };
  }

  // Zamiana symboli szkolnych
  const cleaned = trimmed
    .replace(/[×·∙]/g, "*")
    .replace(/[÷:]/g, "/")
    .replace(/²/g, "^2")
    .replace(/(\d),(\d)/g, "$1.$2")
    // 2x -> 2*x, -x -> -1*x
    .replace(/(\d)\s*([a-zA-Z])/g, "$1*$2")
    .replace(/(^|[^a-zA-Z0-9_])x(?=[^^a-zA-Z0-9_]|$)/g, "$1 1*x");

  const sides = cleaned.split("=");
  if (sides.length !== 2) {
    return { status: "error", message: "Równanie może zawierać tylko jeden znak równości" };
  }

  const leftStr = sides[0].trim() || "0";
  const rightStr = sides[1].trim() || "0";

  // Wyrażenie zredukowane: L - P = 0
  const diffExpr = `(${leftStr}) - (${rightStr})`;

  let a = 0;
  let b = 0;
  let c = 0;

  try {
    // Ewaluujemy współczynniki wielomianu poprzez próbkowanie:
    // P(x) = Ax^2 + Bx + C
    // P(0) = C
    // P(1) = A + B + C  => P(1) - P(0) = A + B
    // P(-1) = A - B + C => P(-1) - P(0) = A - B
    // Stąd 2A = [P(1) - P(0)] + [P(-1) - P(0)] => A = (P(1) + P(-1) - 2*P(0)) / 2
    // B = P(1) - P(0) - A
    const p0 = Number(math.evaluate(diffExpr, { x: 0 }));
    const p1 = Number(math.evaluate(diffExpr, { x: 1 }));
    const pm1 = Number(math.evaluate(diffExpr, { x: -1 }));
    const p2 = Number(math.evaluate(diffExpr, { x: 2 }));

    c = Math.round(p0 * 1e10) / 1e10;
    a = Math.round(((p1 + pm1 - 2 * p0) / 2) * 1e10) / 1e10;
    b = Math.round((p1 - p0 - a) * 1e10) / 1e10;

    // Sprawdzenie czy wielomian jest stopnia max 2:
    const expectedP2 = a * 4 + b * 2 + c;
    if (Math.abs(p2 - expectedP2) > 1e-4) {
      return {
        status: "error",
        message: "Obsługiwane są równania liniowe i kwadratowe (stopnia 1 i 2).",
      };
    }
  } catch (err) {
    return {
      status: "error",
      message: "Błąd w zapisie równania. Upewnij się, że używasz niewiadomej x.",
    };
  }

  // Analiza stopnia równania
  if (Math.abs(a) < 1e-10) {
    // Równanie stopnia 1 lub tożsamość/sprzeczność: bx + c = 0
    return solveLinear(b, c, trimmed);
  } else {
    // Równanie kwadratowe: ax^2 + bx + c = 0
    return solveQuadratic(a, b, c, trimmed);
  }
}

function formatNum(v: number): Formatted {
  // Próbujemy jako ułamek zwykły
  try {
    const mathFrac = getMath("Fraction", "deg");
    const frac = mathFrac.fraction(v);
    const raw = (frac as { toFraction: () => string }).toFraction();
    const parsed = parseFraction(raw);
    if (parsed && parsed.denominator !== 1n && parsed.denominator < 10000n) {
      return fractionToFormatted(parsed);
    }
  } catch {
    // fallback
  }
  return formatNumber(v);
}

function solveLinear(b: number, c: number, originalInput: string): EquationResult {
  const steps: EquationStep[] = [];

  if (Math.abs(b) < 1e-10) {
    if (Math.abs(c) < 1e-10) {
      return {
        status: "ok",
        data: {
          type: "identity",
          message: "Równanie tożsamościowe – spełnione dla każdej liczby rzeczywistej (x ∈ ℝ).",
          steps: [
            {
              title: "Redukcja wyrazów podobnych",
              explanation: "Po uporządkowaniu stron otrzymujemy tożsamość:",
              tex: "0 = 0",
            },
          ],
        },
      };
    } else {
      return {
        status: "ok",
        data: {
          type: "contradiction",
          message: "Równanie sprzeczne – brak rozwiązań w zbiorze liczb rzeczywistych (x ∈ ∅).",
          steps: [
            {
              title: "Redukcja wyrazów podobnych",
              explanation: "Równanie sprowadza się do fałszu:",
              tex: `${formatNum(c).tex} = 0 \\quad (\\text{sprzeczność})`,
            },
          ],
        },
      };
    }
  }

  // bx + c = 0 => bx = -c => x = -c / b
  const xVal = -c / b;
  const xFormatted = formatNum(xVal);

  steps.push({
    title: "Postać uporządkowana",
    explanation: "Doprowadzamy równanie do postaci ax + b = 0:",
    tex: `${formatCoeff(b, "x")} ${c >= 0 ? "+ " + formatNum(c).tex : "- " + formatNum(Math.abs(c)).tex} = 0`,
  });

  steps.push({
    title: "Przeniesienie wyrazów wolnych",
    explanation: "Przenosimy liczby bez x na prawą stronę ze zmianą znaku:",
    tex: `${formatCoeff(b, "x")} = ${formatNum(-c).tex}`,
  });

  steps.push({
    title: "Wyznaczenie niewiadomej x",
    explanation: `Dzielimy obustronnie przez współczynnik przy x (${formatNum(b).text}):`,
    tex: `x = \\frac{${formatNum(-c).tex}}{${formatNum(b).tex}} = ${xFormatted.tex}`,
  });

  return {
    status: "ok",
    data: {
      type: "linear",
      a: b,
      b: c,
      x: xVal,
      xFormatted,
      steps,
    },
  };
}

function solveQuadratic(a: number, b: number, c: number, originalInput: string): EquationResult {
  const steps: EquationStep[] = [];

  steps.push({
    title: "Współczynniki równania kwadratowego",
    explanation: "Zapisujemy równanie w postaci ogólnej ax² + bx + c = 0 i odczytujemy współczynniki:",
    tex: `a = ${formatNum(a).tex}, \\quad b = ${formatNum(b).tex}, \\quad c = ${formatNum(c).tex}`,
  });

  // Obliczenie wyróżnika: Delta = b^2 - 4ac
  const delta = b * b - 4 * a * c;
  const deltaFormatted = formatNum(delta);

  steps.push({
    title: "Obliczenie wyróżnika równania (Δ)",
    explanation: "Korzystamy z oficjalnego wzoru CKE: Δ = b² - 4ac",
    tex: `\\Delta = (${formatNum(b).tex})^2 - 4 \\cdot (${formatNum(a).tex}) \\cdot (${formatNum(c).tex}) = ${formatNum(b * b).tex} - (${formatNum(4 * a * c).tex}) = ${deltaFormatted.tex}`,
  });

  // Wierzchołek paraboli W = (p, q)
  const p = -b / (2 * a);
  const q = -delta / (4 * a);
  const pFormatted = formatNum(p);
  const qFormatted = formatNum(q);

  // Postać kanoniczna
  const canonicalTex = `y = ${a !== 1 ? (a === -1 ? "-" : formatNum(a).tex) : ""}(x ${p >= 0 ? "- " + pFormatted.tex : "+ " + formatNum(Math.abs(p)).tex})^2 ${q >= 0 ? "+ " + qFormatted.tex : "- " + formatNum(Math.abs(q)).tex}`;

  let x1: number | undefined;
  let x2: number | undefined;
  let x0: number | undefined;
  let x1Formatted: Formatted | undefined;
  let x2Formatted: Formatted | undefined;
  let x0Formatted: Formatted | undefined;
  let factoredTex: string | null = null;

  if (delta > 0) {
    const sqrtDelta = Math.sqrt(delta);
    const sqrtDeltaFormatted = formatNum(sqrtDelta);

    x1 = (-b - sqrtDelta) / (2 * a);
    x2 = (-b + sqrtDelta) / (2 * a);
    x1Formatted = formatNum(x1);
    x2Formatted = formatNum(x2);

    steps.push({
      title: "Dwa rozwiązania (Δ > 0)",
      explanation: "Ponieważ wyróżnik jest dodatni, równanie posiada dwa różne pierwiastki:",
      tex: `\\sqrt{\\Delta} = ${sqrtDeltaFormatted.tex} \\\\[8pt] x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a} = \\frac{-(${formatNum(b).tex}) - ${sqrtDeltaFormatted.tex}}{2 \\cdot (${formatNum(a).tex})} = ${x1Formatted.tex} \\\\[8pt] x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a} = \\frac{-(${formatNum(b).tex}) + ${sqrtDeltaFormatted.tex}}{2 \\cdot (${formatNum(a).tex})} = ${x2Formatted.tex}`,
    });

    factoredTex = `y = ${a !== 1 ? (a === -1 ? "-" : formatNum(a).tex) : ""}(x ${x1 >= 0 ? "- " + x1Formatted.tex : "+ " + formatNum(Math.abs(x1)).tex})(x ${x2 >= 0 ? "- " + x2Formatted.tex : "+ " + formatNum(Math.abs(x2)).tex})`;
  } else if (Math.abs(delta) < 1e-10) {
    x0 = -b / (2 * a);
    x0Formatted = formatNum(x0);

    steps.push({
      title: "Jedno rozwiązanie podwójne (Δ = 0)",
      explanation: "Wyróżnik jest równy zero, zatem równanie posiada jeden pierwiastek podwójny:",
      tex: `x_0 = \\frac{-b}{2a} = \\frac{-(${formatNum(b).tex})}{2 \\cdot (${formatNum(a).tex})} = ${x0Formatted.tex}`,
    });

    factoredTex = `y = ${a !== 1 ? (a === -1 ? "-" : formatNum(a).tex) : ""}(x ${x0 >= 0 ? "- " + x0Formatted.tex : "+ " + formatNum(Math.abs(x0)).tex})^2`;
  } else {
    steps.push({
      title: "Brak rozwiązań rzeczywistych (Δ < 0)",
      explanation: "Wyróżnik Δ jest ujemny. Równanie nie posiada rozwiązań w zbiorze liczb rzeczywistych (x ∈ ∅). Parabola leży całkowicie nad lub pod osią OX.",
      tex: `\\Delta < 0 \\implies x \\in \\emptyset`,
    });
  }

  return {
    status: "ok",
    data: {
      type: "quadratic",
      a,
      b,
      c,
      delta,
      deltaSqrt: delta >= 0 ? Math.sqrt(delta) : null,
      x1,
      x2,
      x0,
      x1Formatted,
      x2Formatted,
      x0Formatted,
      vertex: { p, q, pTex: pFormatted.tex, qTex: qFormatted.tex },
      canonicalTex,
      factoredTex,
      steps,
    },
  };
}

function formatCoeff(coeff: number, symbol: string): string {
  if (coeff === 1) return symbol;
  if (coeff === -1) return `-${symbol}`;
  return `${formatNum(coeff).tex}${symbol}`;
}
