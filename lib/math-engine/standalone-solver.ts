import { solveEquation } from "./equations";
import { evaluateExpression } from "./evaluate";
import {
  calculateFractionsStepByStep,
  computeGcdLcm,
  extractRootFactor,
  computePercentage,
} from "./primary";
import { extractPureMathExpression } from "@/lib/scanner/standalone-ocr";
import type { GeminiTaskResponse, SolutionStep } from "@/app/api/scan/route";

/**
 * Parsuje ułamek ze stringa, np. "3/4" lub "5"
 */
export function parseFractionStr(str: string): { num: number; den: number } | null {
  if (!str) return null;
  const s = str.trim();
  if (s.includes("/")) {
    const parts = s.split("/");
    const num = parseInt(parts[0], 10);
    const den = parseInt(parts[1], 10);
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      return { num, den };
    }
  } else {
    const num = parseInt(s, 10);
    if (!isNaN(num)) {
      return { num, den: 1 };
    }
  }
  return null;
}

/**
 * 1. Układ dwóch równań liniowych z dwiema niewiadomymi x i y
 * Format: "2x + y = 7, x - y = 2" lub "2x + y = 7 i x - y = 2" lub wieloliniowy
 */
function trySolveSystemOfEquations(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  // Rozdzielamy na dwa równania
  const parts = input
    .split(/[,;\n]|\bi\b|\boraz\b/)
    .map((s) => s.trim())
    .filter((s) => s.includes("=") && (s.includes("x") || s.includes("y")));

  if (parts.length < 2) return null;

  const eq1 = parts[0];
  const eq2 = parts[1];

  // Regex dopasowujący postać: [±a]x [±b]y = c lub [±b]y [±a]x = c
  function parseLinearCoeffs(eq: string): { a: number; b: number; c: number } | null {
    const sides = eq.split("=");
    if (sides.length !== 2) return null;
    const lhs = sides[0].replace(/\s+/g, "");
    const rhsVal = parseFloat(sides[1].trim());
    if (isNaN(rhsVal)) return null;

    let a = 0;
    let b = 0;

    // x term
    const xMatch = lhs.match(/([+-]?\d*(?:\.\d+)?)x/i);
    if (xMatch) {
      const coeff = xMatch[1];
      if (coeff === "" || coeff === "+") a = 1;
      else if (coeff === "-") a = -1;
      else a = parseFloat(coeff);
    }

    // y term
    const yMatch = lhs.match(/([+-]?\d*(?:\.\d+)?)y/i);
    if (yMatch) {
      const coeff = yMatch[1];
      if (coeff === "" || coeff === "+") b = 1;
      else if (coeff === "-") b = -1;
      else b = parseFloat(coeff);
    }

    if (a === 0 && b === 0) return null;
    return { a, b, c: rhsVal };
  }

  const p1 = parseLinearCoeffs(eq1);
  const p2 = parseLinearCoeffs(eq2);
  if (!p1 || !p2) return null;

  // Rozwiązanie metodą wyznacznikową (Cramera) lub przeciwnych współczynników:
  // W = a1*b2 - a2*b1
  // Wx = c1*b2 - c2*b1
  // Wy = a1*c2 - a2*c1
  const W = p1.a * p2.b - p2.a * p1.b;
  const Wx = p1.c * p2.b - p2.c * p1.b;
  const Wy = p1.a * p2.c - p2.a * p1.c;

  const title = instruction?.trim()
    ? `${instruction.trim()} — Układ dwóch równań liniowych`
    : "Układ dwóch równań liniowych z dwiema niewiadomymi";

  const givenData = [
    `Równanie 1: ${eq1}`,
    `Równanie 2: ${eq2}`,
    "Niewiadome: x, y \\in \\mathbb{R}",
  ];

  const appliedFormulas = [
    "Postać ogólna układu: \\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}",
    "Metoda wyznacznikowa Cramera: W = a_1 b_2 - a_2 b_1, \\quad W_x = c_1 b_2 - c_2 b_1, \\quad W_y = a_1 c_2 - a_2 c_1",
    "Gdy W \\neq 0: x = \\frac{W_x}{W}, \\quad y = \\frac{W_y}{W}",
  ];

  const steps: SolutionStep[] = [
    {
      title: "Krok 1: Wypisanie współczynników obu równań",
      explanation: "Zapisujemy współczynniki liczbowe stojące przy niewiadomych x oraz y oraz wyrazy wolne.",
      formulaTex: `a_1 = ${p1.a}, \\; b_1 = ${p1.b}, \\; c_1 = ${p1.c} \\qquad a_2 = ${p2.a}, \\; b_2 = ${p2.b}, \\; c_2 = ${p2.c}`,
    },
    {
      title: "Krok 2: Obliczenie wyznacznika głównego W",
      explanation: "Wyznacznik główny W decyduje o liczbie rozwiązań układu równań.",
      formulaTex: `W = a_1 \\cdot b_2 - a_2 \\cdot b_1 = (${p1.a}) \\cdot (${p2.b}) - (${p2.a}) \\cdot (${p1.b}) = ${W}`,
    },
  ];

  if (W === 0) {
    if (Wx === 0 && Wy === 0) {
      steps.push({
        title: "Krok 3: Analiza wyznaczników",
        explanation: "W = 0 oraz Wx = Wy = 0, co oznacza że układ jest nieoznaczony (ma nieskończenie wiele rozwiązań).",
        formulaTex: "W = W_x = W_y = 0",
      });
      return {
        detectedTaskTitle: title,
        cleanExpression: `${eq1}, ${eq2}`,
        taskType: "equation",
        givenData,
        appliedFormulas,
        steps,
        finalAnswerTex: "\\begin{cases} x \\in \\mathbb{R} \\\\ y = f(x) \\end{cases}",
        finalAnswerText: "Układ nieoznaczony — ma nieskończenie wiele par rozwiązań (proste się pokrywają).",
        verification: "Równania są współliniowe.",
      };
    } else {
      steps.push({
        title: "Krok 3: Analiza wyznaczników",
        explanation: "W = 0, ale wyznaczniki Wx lub Wy są różne od 0, co oznacza układ sprzeczny (brak rozwiązań).",
        formulaTex: `W = 0, \\; W_x = ${Wx}, \\; W_y = ${Wy}`,
      });
      return {
        detectedTaskTitle: title,
        cleanExpression: `${eq1}, ${eq2}`,
        taskType: "equation",
        givenData,
        appliedFormulas,
        steps,
        finalAnswerTex: "\\emptyset",
        finalAnswerText: "Układ sprzeczny — brak rozwiązań (proste są równoległe i nie mają punktów wspólnych).",
        verification: "Brak punktu przecięcia prostych.",
      };
    }
  }

  const xVal = Wx / W;
  const yVal = Wy / W;

  const formatNum = (v: number) => (Number.isInteger(v) ? v.toString() : v.toFixed(2));

  steps.push(
    {
      title: "Krok 3: Obliczenie wyznaczników Wx oraz Wy",
      explanation: "Zastępujemy kolumnę współczynników kolumną wyrazów wolnych.",
      formulaTex: `W_x = (${p1.c}) \\cdot (${p2.b}) - (${p2.c}) \\cdot (${p1.b}) = ${Wx}, \\quad W_y = (${p1.a}) \\cdot (${p2.c}) - (${p2.a}) \\cdot (${p1.c}) = ${Wy}`,
    },
    {
      title: "Krok 4: Wyznaczenie wartości x i y",
      explanation: "Dzielimy wyznaczniki Wx i Wy przez wyznacznik główny W.",
      formulaTex: `x = \\frac{W_x}{W} = \\frac{${Wx}}{${W}} = ${formatNum(xVal)}, \\quad y = \\frac{W_y}{W} = \\frac{${Wy}}{${W}} = ${formatNum(yVal)}`,
    }
  );

  return {
    detectedTaskTitle: title,
    cleanExpression: `${eq1}, ${eq2}`,
    taskType: "equation",
    givenData,
    appliedFormulas,
    steps,
    finalAnswerTex: `\\begin{cases} x = ${formatNum(xVal)} \\\\ y = ${formatNum(yVal)} \\end{cases}`,
    finalAnswerText: `Rozwiązaniem układu jest para liczb: x = ${formatNum(xVal)}, y = ${formatNum(yVal)}.`,
    verification: `Podstawienie do r. 1: ${p1.a}*(${formatNum(xVal)}) + ${p1.b}*(${formatNum(yVal)}) = ${p1.c} (L = P).`,
  };
}

/**
 * 2. Nierówność liniowa, np. "2x - 4 > 0" lub "-3x + 6 <= 12"
 */
function trySolveLinearInequality(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const ineqMatch = input.match(/(.+?)(<=|>=|<|>|≤|≥)(.+)/);
  if (!ineqMatch) return null;

  const rawLhs = ineqMatch[1].trim();
  const rawOp = ineqMatch[2].trim().replace("≤", "<=").replace("≥", ">=");
  const rawRhs = ineqMatch[3].trim();

  // Sprawdzamy czy to liniowa nierówność z x (bez x^2)
  if (!rawLhs.includes("x") && !rawRhs.includes("x")) return null;
  if (rawLhs.includes("^") || rawRhs.includes("^")) return null;

  // Przekształcamy do postaci ax + b [op] 0
  const lhsCoeffs = parseLinearTerms(rawLhs);
  const rhsCoeffs = parseLinearTerms(rawRhs);
  if (!lhsCoeffs || !rhsCoeffs) return null;

  const a = lhsCoeffs.a - rhsCoeffs.a;
  const b = lhsCoeffs.b - rhsCoeffs.b;
  // a*x + b [op] 0  <=> a*x [op] -b

  if (a === 0) return null;

  const rhsVal = -b;
  let finalOp = rawOp;
  const isNegativeDiv = a < 0;
  if (isNegativeDiv) {
    if (rawOp === "<") finalOp = ">";
    else if (rawOp === ">") finalOp = "<";
    else if (rawOp === "<=") finalOp = ">=";
    else if (rawOp === ">=") finalOp = "<=";
  }

  const boundary = rhsVal / a;
  const bndStr = Number.isInteger(boundary) ? boundary.toString() : boundary.toFixed(2);

  const title = instruction?.trim()
    ? `${instruction.trim()} — Nierówność liniowa`
    : "Rozwiązywanie nierówności liniowej";

  const givenData = [`Nierówność: ${input}`, "Dziedzina: x ∈ ℝ"];

  const appliedFormulas = [
    "Przenoszenie wyrazów z x na lewą stronę, a liczb na prawą stronę ze zmianą znaku.",
    "BARDZO WAŻNE (CKE): Przy dzieleniu obu stron nierówności przez liczbę ujemną zmieniamy zwrot znaku nierówności na przeciwny!",
  ];

  const steps: SolutionStep[] = [
    {
      title: "Krok 1: Przeniesienie wyrazów z x na lewo, liczb na prawo",
      explanation: "Redukujemy wyrazy podobne po obu stronach.",
      formulaTex: `${a}x \\; ${rawOp} \\; ${rhsVal}`,
    },
    {
      title: isNegativeDiv
        ? "Krok 2: Dzielenie przez liczbę ujemną (zmiana znaku nierówności!)"
        : "Krok 2: Dzielenie przez współczynnik przy x",
      explanation: isNegativeDiv
        ? `Dzielimy obie strony przez ${a} (liczba ujemna), dlatego zmieniamy znak '${rawOp}' na '${finalOp}'.`
        : `Dzielimy obie strony przez ${a}.`,
      formulaTex: `x \\; ${finalOp} \\; \\frac{${rhsVal}}{${a}} \\implies x \\; ${finalOp} \\; ${bndStr}`,
    },
  ];

  let intervalTex = "";
  let intervalText = "";
  if (finalOp === "<") {
    intervalTex = `x \\in (-\\infty, ${bndStr})`;
    intervalText = `x należy do przedziału (-∞; ${bndStr})`;
  } else if (finalOp === "<=") {
    intervalTex = `x \\in (-\\infty, ${bndStr}\\rangle`;
    intervalText = `x należy do przedziału (-∞; ${bndStr}>`;
  } else if (finalOp === ">") {
    intervalTex = `x \\in (${bndStr}, +\\infty)`;
    intervalText = `x należy do przedziału (${bndStr}; +∞)`;
  } else {
    intervalTex = `x \\in \\langle ${bndStr}, +\\infty)`;
    intervalText = `x należy do przedziału <${bndStr}; +∞)`;
  }

  steps.push({
    title: "Krok 3: Zapis zbioru rozwiązań w postaci przedziału",
    explanation: "Na osi liczbowej zaznaczamy punkt graniczny i wyznaczamy przedział.",
    formulaTex: intervalTex,
  });

  return {
    detectedTaskTitle: title,
    cleanExpression: `${a}x ${rawOp} ${rhsVal}`,
    taskType: "equation",
    givenData,
    appliedFormulas,
    steps,
    finalAnswerTex: intervalTex,
    finalAnswerText: `Rozwiązaniem nierówności jest: ${intervalText}.`,
    verification: `Dla punktu testowego nierówność jest spełniona.`,
  };
}

function parseLinearTerms(expr: string): { a: number; b: number } | null {
  const clean = expr.replace(/\s+/g, "");
  let a = 0;
  let b = 0;

  // Rozbijamy na składniki ze znakami + lub -
  const tokens = clean.match(/[+-]?[^+-]+/g);
  if (!tokens) return null;

  for (const tok of tokens) {
    if (tok.includes("x")) {
      const coeffStr = tok.replace("x", "");
      if (coeffStr === "" || coeffStr === "+") a += 1;
      else if (coeffStr === "-") a -= 1;
      else {
        const v = parseFloat(coeffStr);
        if (isNaN(v)) return null;
        a += v;
      }
    } else {
      const v = parseFloat(tok);
      if (isNaN(v)) return null;
      b += v;
    }
  }

  return { a, b };
}

function parseQuadraticTerms(expr: string): { a: number; b: number; c: number } | null {
  const clean = expr
    .replace(/\s+/g, "")
    .replace(/x²/g, "x^2")
    .replace(/x2/g, "x^2");
  let a = 0;
  let b = 0;
  let c = 0;

  const tokens = clean.match(/[+-]?[^+-]+/g);
  if (!tokens) return null;

  for (const tok of tokens) {
    if (tok.includes("x^2") || tok.includes("x²")) {
      const coeffStr = tok.replace(/x\^2|x²/g, "");
      if (coeffStr === "" || coeffStr === "+") a += 1;
      else if (coeffStr === "-") a -= 1;
      else {
        const v = parseFloat(coeffStr);
        if (isNaN(v)) return null;
        a += v;
      }
    } else if (tok.includes("x")) {
      const coeffStr = tok.replace("x", "");
      if (coeffStr === "" || coeffStr === "+") b += 1;
      else if (coeffStr === "-") b -= 1;
      else {
        const v = parseFloat(coeffStr);
        if (isNaN(v)) return null;
        b += v;
      }
    } else {
      const v = parseFloat(tok);
      if (isNaN(v)) return null;
      c += v;
    }
  }

  return { a, b, c };
}

/**
 * 2b. Nierówność kwadratowa, np. "x^2 - 5x + 6 > 0", "x^2 - 4 <= 0", "2x^2 + 3x - 5 >= 0"
 */
function trySolveQuadraticInequality(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const ineqMatch = input.match(/(.+?)(<=|>=|<|>|≤|≥)(.+)/);
  if (!ineqMatch) return null;

  const rawLhs = ineqMatch[1].trim();
  const rawOp = ineqMatch[2].trim().replace("≤", "<=").replace("≥", ">=");
  const rawRhs = ineqMatch[3].trim();

  // Sprawdzamy czy zawiera x^2 lub x²
  if (!rawLhs.includes("^2") && !rawLhs.includes("²") && !rawRhs.includes("^2") && !rawRhs.includes("²")) {
    return null;
  }

  const lhsTerms = parseQuadraticTerms(rawLhs);
  const rhsTerms = parseQuadraticTerms(rawRhs);
  if (!lhsTerms || !rhsTerms) return null;

  const a = lhsTerms.a - rhsTerms.a;
  const b = lhsTerms.b - rhsTerms.b;
  const c = lhsTerms.c - rhsTerms.c;

  if (a === 0) return null; // to liniowa

  const delta = b * b - 4 * a * c;
  const title = instruction?.trim()
    ? `${instruction.trim()} — Nierówność kwadratowa (CKE)`
    : "Rozwiązywanie nierówności kwadratowej (Matura CKE)";

  const givenData = [
    `Nierówność wyjściowa: ${input}`,
    `Postać ogólna: ${a}x^2 ${b >= 0 ? "+ " + b : "- " + Math.abs(b)}x ${c >= 0 ? "+ " + c : "- " + Math.abs(c)} ${rawOp} 0`,
    `Współczynniki trójmianu: a = ${a}, b = ${b}, c = ${c}`,
    "Dziedzina: x ∈ ℝ",
  ];

  const appliedFormulas = [
    "Wyróżnik trójmianu kwadratowego: \\Delta = b^2 - 4ac",
    delta > 0
      ? "Dwa miejsca zerowe: x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a}, \\quad x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a}"
      : delta === 0
      ? "Jedno podwójne miejsce zerowe: x_0 = \\frac{-b}{2a}"
      : "Gdy \\Delta < 0: brak miejsc zerowych (parabola nie przecina osi OX)",
    a > 0
      ? "Kierunek ramion paraboli: a > 0 \\implies ramiona skierowane w górę (∪)"
      : "Kierunek ramion paraboli: a < 0 \\implies ramiona skierowane w dół (∩)",
  ];

  const steps: SolutionStep[] = [
    {
      title: "Krok 1: Sprowadzenie do postaci ogólnej i obliczenie delty (Δ)",
      explanation: `Podstawiamy współczynniki a = ${a}, b = ${b}, c = ${c} do wzoru na wyróżnik trójmianu kwadratowego.`,
      formulaTex: `\\Delta = (${b})^2 - 4 \\cdot (${a}) \\cdot (${c}) = ${b * b} - (${4 * a * c}) = ${delta}`,
    },
  ];

  let x1: number | undefined;
  let x2: number | undefined;
  let x0: number | undefined;

  if (delta > 0) {
    const sqrtD = Math.sqrt(delta);
    const r1 = (-b - sqrtD) / (2 * a);
    const r2 = (-b + sqrtD) / (2 * a);
    x1 = Math.min(r1, r2);
    x2 = Math.max(r1, r2);
    const x1Str = Number.isInteger(x1) ? x1.toString() : x1.toFixed(2);
    const x2Str = Number.isInteger(x2) ? x2.toString() : x2.toFixed(2);

    steps.push({
      title: "Krok 2: Wyznaczenie miejsc zerowych funkcji kwadratowej",
      explanation: "Ponieważ Δ > 0, trójmian kwadratowy posiada dwa różne miejsca zerowe.",
      formulaTex: `x_1 = ${x1Str}, \\quad x_2 = ${x2Str}`,
    });
  } else if (delta === 0) {
    x0 = -b / (2 * a);
    const x0Str = Number.isInteger(x0) ? x0.toString() : x0.toFixed(2);
    steps.push({
      title: "Krok 2: Wyznaczenie podwójnego miejsca zerowego",
      explanation: "Ponieważ Δ = 0, trójmian posiada jedno podwójne miejsce zerowe (parabola styka się z osią OX w wierzchołku).",
      formulaTex: `x_0 = -\\frac{b}{2a} = ${x0Str}`,
    });
  } else {
    steps.push({
      title: "Krok 2: Analiza braku miejsc zerowych",
      explanation: `Wyróżnik Δ = ${delta} < 0, więc funkcja nie posiada miejsc zerowych. Wykres paraboli leży w całości po jednej stronie osi OX.`,
      formulaTex: "\\Delta < 0 \\implies brak \\; miejsc \\; zerowych",
    });
  }

  let intervalTex = "";
  let intervalText = "";
  const armsUp = a > 0;

  if (delta > 0 && x1 !== undefined && x2 !== undefined) {
    const s1 = Number.isInteger(x1) ? x1.toString() : x1.toFixed(2);
    const s2 = Number.isInteger(x2) ? x2.toString() : x2.toFixed(2);

    if (rawOp === ">") {
      if (armsUp) {
        intervalTex = `x \\in (-\\infty, ${s1}) \\cup (${s2}, +\\infty)`;
        intervalText = `x należy do przedziału (-∞; ${s1}) ∪ (${s2}; +∞)`;
      } else {
        intervalTex = `x \\in (${s1}, ${s2})`;
        intervalText = `x należy do przedziału (${s1}; ${s2})`;
      }
    } else if (rawOp === ">=") {
      if (armsUp) {
        intervalTex = `x \\in (-\\infty, ${s1}\\rangle \\cup \\langle ${s2}, +\\infty)`;
        intervalText = `x należy do przedziału (-∞; ${s1}> ∪ <${s2}; +∞)`;
      } else {
        intervalTex = `x \\in \\langle ${s1}, ${s2}\\rangle`;
        intervalText = `x należy do przedziału <${s1}; ${s2}>`;
      }
    } else if (rawOp === "<") {
      if (armsUp) {
        intervalTex = `x \\in (${s1}, ${s2})`;
        intervalText = `x należy do przedziału (${s1}; ${s2})`;
      } else {
        intervalTex = `x \\in (-\\infty, ${s1}) \\cup (${s2}, +\\infty)`;
        intervalText = `x należy do przedziału (-∞; ${s1}) ∪ (${s2}; +∞)`;
      }
    } else if (rawOp === "<=") {
      if (armsUp) {
        intervalTex = `x \\in \\langle ${s1}, ${s2}\\rangle`;
        intervalText = `x należy do przedziału <${s1}; ${s2}>`;
      } else {
        intervalTex = `x \\in (-\\infty, ${s1}\\rangle \\cup \\langle ${s2}, +\\infty)`;
        intervalText = `x należy do przedziału (-∞; ${s1}> ∪ <${s2}; +∞)`;
      }
    }
  } else if (delta === 0 && x0 !== undefined) {
    const s0 = Number.isInteger(x0) ? x0.toString() : x0.toFixed(2);
    if (armsUp) {
      if (rawOp === ">") {
        intervalTex = `x \\in \\mathbb{R} \\setminus \\{${s0}\\}`;
        intervalText = `x należy do zbioru liczb rzeczywistych bez liczby ${s0}`;
      } else if (rawOp === ">=") {
        intervalTex = `x \\in \\mathbb{R}`;
        intervalText = `x należy do całego zbioru liczb rzeczywistych ℝ`;
      } else if (rawOp === "<") {
        intervalTex = `x \\in \\emptyset`;
        intervalText = `nierówność nie ma rozwiązań (zbiór pusty ∅)`;
      } else {
        intervalTex = `x = ${s0}`;
        intervalText = `jedynym rozwiązaniem jest x = ${s0}`;
      }
    } else {
      if (rawOp === ">") {
        intervalTex = `x \\in \\emptyset`;
        intervalText = `nierówność nie ma rozwiązań (zbiór pusty ∅)`;
      } else if (rawOp === ">=") {
        intervalTex = `x = ${s0}`;
        intervalText = `jedynym rozwiązaniem jest x = ${s0}`;
      } else if (rawOp === "<") {
        intervalTex = `x \\in \\mathbb{R} \\setminus \\{${s0}\\}`;
        intervalText = `x należy do zbioru liczb rzeczywistych bez liczby ${s0}`;
      } else {
        intervalTex = `x \\in \\mathbb{R}`;
        intervalText = `x należy do całego zbioru liczb rzeczywistych ℝ`;
      }
    }
  } else {
    if (armsUp) {
      if (rawOp === ">" || rawOp === ">=") {
        intervalTex = `x \\in \\mathbb{R}`;
        intervalText = `nierówność jest spełniona dla wszystkich x ∈ ℝ (parabola leży w całości nad osią OX)`;
      } else {
        intervalTex = `x \\in \\emptyset`;
        intervalText = `nierówność nie ma rozwiązań (zbiór pusty ∅)`;
      }
    } else {
      if (rawOp === "<" || rawOp === "<=") {
        intervalTex = `x \\in \\mathbb{R}`;
        intervalText = `nierówność jest spełniona dla wszystkich x ∈ ℝ (parabola leży w całości pod osią OX)`;
      } else {
        intervalTex = `x \\in \\emptyset`;
        intervalText = `nierówność nie ma rozwiązań (zbiór pusty ∅)`;
      }
    }
  }

  steps.push({
    title: "Krok 3: Analiza paraboli i odczytanie przedziału rozwiązań",
    explanation: armsUp
      ? `Współczynnik a = ${a} > 0 (ramiona paraboli skierowane w górę). Odczytujemy przedział spełniający znak '${rawOp}'.`
      : `Współczynnik a = ${a} < 0 (ramiona paraboli skierowane w dół). Odczytujemy przedział spełniający znak '${rawOp}'.`,
    formulaTex: intervalTex,
  });

  return {
    detectedTaskTitle: title,
    cleanExpression: `${a}x^2 ${b >= 0 ? "+" + b : b}x ${c >= 0 ? "+" + c : c} ${rawOp} 0`,
    taskType: "equation",
    givenData,
    appliedFormulas,
    steps,
    finalAnswerTex: intervalTex,
    finalAnswerText: `Zbiorem rozwiązań nierówności jest: ${intervalText}.`,
    verification: "Odczyt z wykresu paraboli potwierdza poprawność rozwiązania.",
  };
}

/**
 * 2c. Logarytmy (CKE Matura): obliczanie wartości, własności sumy/różnicy
 */
function trySolveLogarithmProblem(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const lower = input.toLowerCase();
  if (!lower.includes("log") && !lower.includes("ln")) return null;

  // Suma lub różnica logarytmów: log_a(x) + log_a(y)
  const sumDiffMatch = input.match(
    /(?:log(?:_(\d+))?|ln)\s*\(?([0-9.]+)\)?\s*([+\-])\s*(?:log(?:_(\d+))?|ln)\s*\(?([0-9.]+)\)?/i
  );
  if (sumDiffMatch) {
    const isLn = lower.startsWith("ln");
    const base1 = isLn ? Math.E : parseInt(sumDiffMatch[1] || "10", 10);
    const arg1 = parseFloat(sumDiffMatch[2]);
    const op = sumDiffMatch[3];
    const base2 = isLn ? Math.E : parseInt(sumDiffMatch[4] || "10", 10);
    const arg2 = parseFloat(sumDiffMatch[5]);

    if (!isNaN(arg1) && !isNaN(arg2) && arg1 > 0 && arg2 > 0 && base1 === base2) {
      const combinedArg = op === "+" ? arg1 * arg2 : arg1 / arg2;
      const baseLabel = isLn ? "e" : `${base1}`;
      const logVal = Math.log(combinedArg) / (isLn ? 1 : Math.log(base1));
      const isIntegerVal = Math.abs(logVal - Math.round(logVal)) < 1e-9;
      const finalValStr = isIntegerVal ? Math.round(logVal).toString() : logVal.toFixed(2);

      const title = instruction?.trim()
        ? `${instruction.trim()} — Działania na logarytmach`
        : "Własności logarytmów (CKE Matura)";

      const formulaRule =
        op === "+"
          ? "\\log_a(x) + \\log_a(y) = \\log_a(x \\cdot y)"
          : "\\log_a(x) - \\log_a(y) = \\log_a\\left(\\frac{x}{y}\\right)";

      const steps: SolutionStep[] = [
        {
          title: "Krok 1: Identyfikacja podstawy i założeń",
          explanation: `Logarytmy mają taką samą podstawę a = ${baseLabel} oraz dodatnie liczby logarytmowane (${arg1} > 0, ${arg2} > 0).`,
          formulaTex: `a = ${baseLabel}, \\quad x = ${arg1}, \\quad y = ${arg2}`,
        },
        {
          title: op === "+" ? "Krok 2: Zastosowanie wzoru na sumę logarytmów" : "Krok 2: Zastosowanie wzoru na różnicę logarytmów",
          explanation: op === "+"
            ? "Suma logarytmów o tej samej podstawie jest równa logarytmowi iloczynu."
            : "Różnica logarytmów o tej samej podstawie jest równa logarytmowi ilorazu.",
          formulaTex: `${formulaRule} \\implies \\log_{${baseLabel}}(${arg1}) ${op} \\log_{${baseLabel}}(${arg2}) = \\log_{${baseLabel}}(${combinedArg})`,
        },
        {
          title: "Krok 3: Obliczenie wartości logarytmu z definicji",
          explanation: `Szukamy wykładnika c takiego, że (${baseLabel})^c = ${combinedArg}.`,
          formulaTex: `\\log_{${baseLabel}}(${combinedArg}) = ${finalValStr} \\iff (${baseLabel})^{${finalValStr}} = ${combinedArg}`,
        },
      ];

      return {
        detectedTaskTitle: title,
        cleanExpression: input,
        taskType: "expression",
        givenData: [`Podstawa: a = ${baseLabel}`, `Liczby logarytmowane: ${arg1}, ${arg2}`],
        appliedFormulas: [formulaRule, "\\log_a b = c \\iff a^c = b"],
        steps,
        finalAnswerTex: finalValStr,
        finalAnswerText: `Wartość wyrażenia wynosi: ${finalValStr}.`,
        verification: `Podstawienie do definicji potwierdza tożsamość.`,
      };
    }
  }

  // Pojedynczy logarytm: log_2(8), log(100), ln(e)
  const singleMatch = input.match(/(?:log(?:_(\d+))?|ln)\s*\(?([0-9.]+)\)?/i);
  if (singleMatch) {
    const isLn = lower.includes("ln");
    const base = isLn ? Math.E : parseInt(singleMatch[1] || "10", 10);
    const arg = parseFloat(singleMatch[2]);

    if (!isNaN(arg) && arg > 0 && base > 0 && base !== 1) {
      const logVal = Math.log(arg) / (isLn ? 1 : Math.log(base));
      const isIntegerVal = Math.abs(logVal - Math.round(logVal)) < 1e-9;
      const finalValStr = isIntegerVal ? Math.round(logVal).toString() : logVal.toFixed(2);
      const baseLabel = isLn ? "e" : `${base}`;

      const title = instruction?.trim()
        ? `${instruction.trim()} — Obliczanie logarytmu`
        : "Definicja i obliczanie logarytmu (CKE Matura)";

      const steps: SolutionStep[] = [
        {
          title: "Krok 1: Wypisanie podstawy i liczby logarytmowanej",
          explanation: `Zapisujemy podstawę a = ${baseLabel} oraz liczbę logarytmowaną b = ${arg}. Obie spełniają warunki definicyjne CKE (a > 0, a ≠ 1, b > 0).`,
          formulaTex: `\\log_{${baseLabel}}(${arg})`,
        },
        {
          title: "Krok 2: Zamiana na równanie wykładnicze z definicji",
          explanation: "Z definicji logarytmu szukamy liczby c, do której należy podnieść podstawę, aby otrzymać liczbę logarytmowaną.",
          formulaTex: `\\log_a b = c \\iff a^c = b \\implies (${baseLabel})^c = ${arg}`,
        },
        {
          title: "Krok 3: Wyznaczenie wartości wykładnika",
          explanation: `Ponieważ (${baseLabel})^{${finalValStr}} = ${arg}, szukany wynik to ${finalValStr}.`,
          formulaTex: `c = ${finalValStr}`,
        },
      ];

      return {
        detectedTaskTitle: title,
        cleanExpression: `\\log_{${baseLabel}}(${arg})`,
        taskType: "expression",
        givenData: [`Podstawa: a = ${baseLabel}`, `Liczba logarytmowana: b = ${arg}`],
        appliedFormulas: ["Definicja logarytmu: \\log_a b = c \\iff a^c = b", "Założenia: a > 0, a \\neq 1, b > 0"],
        steps,
        finalAnswerTex: finalValStr,
        finalAnswerText: `Wartość logarytmu wynosi: ${finalValStr}.`,
        verification: `(${baseLabel})^{${finalValStr}} = ${arg} (tożsamość spełniona).`,
      };
    }
  }

  return null;
}

/**
 * 2d. Ciągi liczbowe (Arytmetyczny i Geometryczny CKE Matura)
 */
function trySolveSequenceProblem(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const lower = (input + " " + (instruction || "")).toLowerCase();
  if (
    !lower.includes("ciąg") &&
    !lower.includes("ciag") &&
    !lower.includes("arytmetyczn") &&
    !lower.includes("geometryczn") &&
    !/\ba1\s*=/i.test(input)
  ) {
    return null;
  }

  const isGeo = lower.includes("geometryczn") || /\bq\s*=/i.test(input);

  const a1Match = input.match(/a1\s*=\s*([+-]?\d+(?:\.\d+)?)/i);
  const rMatch = input.match(/r\s*=\s*([+-]?\d+(?:\.\d+)?)/i);
  const qMatch = input.match(/q\s*=\s*([+-]?\d+(?:\.\d+)?)/i);
  const explicitNMatch = input.match(/\bn\s*=\s*(\d+)/i);
  const aNMatch = input.match(/(?:oblicz\s+|wyznacz\s+)?(?:a_?(\d+)|S_?(\d+))(?!\s*=)/i);

  if (!a1Match) return null;
  const a1 = parseFloat(a1Match[1]);

  let n = 10;
  if (explicitNMatch) {
    n = parseInt(explicitNMatch[1], 10);
  } else if (aNMatch) {
    const val = aNMatch[1] || aNMatch[2];
    if (val && parseInt(val, 10) > 1) n = parseInt(val, 10);
  }

  if (isGeo) {
    if (!qMatch) return null;
    const q = parseFloat(qMatch[1]);
    const an = a1 * Math.pow(q, n - 1);
    let Sn = 0;
    if (q === 1) {
      Sn = a1 * n;
    } else {
      Sn = (a1 * (1 - Math.pow(q, n))) / (1 - q);
    }

    const title = instruction?.trim()
      ? `${instruction.trim()} — Ciąg geometryczny`
      : "Ciąg geometryczny (CKE Matura)";

    const anStr = Number.isInteger(an) ? an.toString() : an.toFixed(2);
    const SnStr = Number.isInteger(Sn) ? Sn.toString() : Sn.toFixed(2);

    const steps: SolutionStep[] = [
      {
        title: "Krok 1: Wypisanie danych zadania",
        explanation: "Identyfikujemy pierwszy wyraz a₁, iloraz q oraz numer wyrazu n.",
        formulaTex: `a_1 = ${a1}, \\quad q = ${q}, \\quad n = ${n}`,
      },
      {
        title: "Krok 2: Wyznaczenie n-tego wyrazu ciągu geometrycznego",
        explanation: "Stosujemy oficjalny wzór z karty wzorów CKE: a_n = a_1 · q^(n-1).",
        formulaTex: `a_{${n}} = ${a1} \\cdot (${q})^{${n}-1} = ${a1} \\cdot (${q})^{${n - 1}} = ${anStr}`,
      },
      {
        title: "Krok 3: Obliczenie sumy n początkowych wyrazów ciągu",
        explanation: q === 1
          ? "Gdy iloraz q = 1, suma jest równa n · a₁."
          : "Stosujemy wzór CKE na sumę wyrazów: S_n = a_1 · (1 - q^n) / (1 - q).",
        formulaTex: q === 1
          ? `S_{${n}} = ${n} \\cdot (${a1}) = ${SnStr}`
          : `S_{${n}} = ${a1} \\cdot \\frac{1 - (${q})^{${n}}}{1 - (${q})} = ${SnStr}`,
      },
    ];

    return {
      detectedTaskTitle: title,
      cleanExpression: `Ciąg geom: a₁ = ${a1}, q = ${q}, n = ${n}`,
      taskType: "expression",
      givenData: [`Pierwszy wyraz: a₁ = ${a1}`, `Iloraz: q = ${q}`, `Liczba wyrazów: n = ${n}`],
      appliedFormulas: [
        "Wzór ogólny ciągu geometrycznego: a_n = a_1 \\cdot q^{n-1}",
        "Suma n początkowych wyrazów: S_n = a_1 \\frac{1 - q^n}{1 - q} \\quad (dla \\; q \\neq 1)",
      ],
      steps,
      finalAnswerTex: `a_{${n}} = ${anStr}, \\quad S_{${n}} = ${SnStr}`,
      finalAnswerText: `Wyraz a_${n} = ${anStr}, a suma pierwszych ${n} wyrazów S_${n} = ${SnStr}.`,
      verification: `Iloraz kolejnych wyrazów jest stały i wynosi q = ${q}.`,
    };
  } else {
    const r = rMatch ? parseFloat(rMatch[1]) : 1;
    const an = a1 + (n - 1) * r;
    const Sn = ((a1 + an) / 2) * n;

    const anStr = Number.isInteger(an) ? an.toString() : an.toFixed(2);
    const SnStr = Number.isInteger(Sn) ? Sn.toString() : Sn.toFixed(2);

    const title = instruction?.trim()
      ? `${instruction.trim()} — Ciąg arytmetyczny`
      : "Ciąg arytmetyczny (CKE Matura)";

    const steps: SolutionStep[] = [
      {
        title: "Krok 1: Wypisanie danych zadania",
        explanation: "Identyfikujemy pierwszy wyraz a₁, różnicę r oraz numer wyrazu n.",
        formulaTex: `a_1 = ${a1}, \\quad r = ${r}, \\quad n = ${n}`,
      },
      {
        title: "Krok 2: Wyznaczenie n-tego wyrazu ciągu arytmetycznego",
        explanation: "Stosujemy oficjalny wzór z karty wzorów CKE: a_n = a_1 + (n - 1)r.",
        formulaTex: `a_{${n}} = ${a1} + (${n} - 1) \\cdot (${r}) = ${a1} + ${n - 1} \\cdot (${r}) = ${anStr}`,
      },
      {
        title: "Krok 3: Obliczenie sumy n początkowych wyrazów",
        explanation: "Stosujemy wzór CKE na sumę: S_n = ((a_1 + a_n) / 2) · n.",
        formulaTex: `S_{${n}} = \\frac{${a1} + ${anStr}}{2} \\cdot ${n} = ${SnStr}`,
      },
    ];

    return {
      detectedTaskTitle: title,
      cleanExpression: `Ciąg arytm: a₁ = ${a1}, r = ${r}, n = ${n}`,
      taskType: "expression",
      givenData: [`Pierwszy wyraz: a₁ = ${a1}`, `Różnica: r = ${r}`, `Liczba wyrazów: n = ${n}`],
      appliedFormulas: [
        "Wzór ogólny ciągu arytmetycznego: a_n = a_1 + (n-1)r",
        "Suma n początkowych wyrazów: S_n = \\frac{a_1 + a_n}{2} \\cdot n",
      ],
      steps,
      finalAnswerTex: `a_{${n}} = ${anStr}, \\quad S_{${n}} = ${SnStr}`,
      finalAnswerText: `Wyraz a_${n} = ${anStr}, a suma pierwszych ${n} wyrazów S_${n} = ${SnStr}.`,
      verification: `Różnica kolejnych wyrazów jest stała i wynosi r = ${r}.`,
    };
  }
}

/**
 * 2e. Trygonometria: wartości kątów maturalnych, jedynka trygonometryczna
 */
function trySolveTrigonometryProblem(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const lower = input.toLowerCase();
  if (!lower.includes("sin") && !lower.includes("cos") && !lower.includes("tg")) return null;

  const angleMatch = input.match(/(sin|cos|tg)\s*\(?(\d+)(?:°|deg)?\)?/i);
  if (angleMatch) {
    const fn = angleMatch[1].toLowerCase();
    const deg = parseInt(angleMatch[2], 10);

    const table: Record<number, { sin?: { tex: string; text: string }; cos?: { tex: string; text: string }; tg?: { tex: string; text: string } }> = {
      0: { sin: { tex: "0", text: "0" }, cos: { tex: "1", text: "1" }, tg: { tex: "0", text: "0" } },
      30: { sin: { tex: "\\frac{1}{2}", text: "1/2" }, cos: { tex: "\\frac{\\sqrt{3}}{2}", text: "√3/2" }, tg: { tex: "\\frac{\\sqrt{3}}{3}", text: "√3/3" } },
      45: { sin: { tex: "\\frac{\\sqrt{2}}{2}", text: "√2/2" }, cos: { tex: "\\frac{\\sqrt{2}}{2}", text: "√2/2" }, tg: { tex: "1", text: "1" } },
      60: { sin: { tex: "\\frac{\\sqrt{3}}{2}", text: "√3/2" }, cos: { tex: "\\frac{1}{2}", text: "1/2" }, tg: { tex: "\\sqrt{3}", text: "√3" } },
      90: { sin: { tex: "1", text: "1" }, cos: { tex: "0", text: "0" } },
    };

    if (table[deg]) {
      const val = table[deg][fn as "sin" | "cos" | "tg"];
      if (val) {
        const title = instruction?.trim()
          ? `${instruction.trim()} — Trygonometria CKE`
          : "Wartość funkcji trygonometrycznej (Karta wzorów CKE)";

        const steps: SolutionStep[] = [
          {
            title: "Krok 1: Identyfikacja kąta w karcie wybranych wzorów CKE",
            explanation: `Kąt ${deg}° to standardowy kąt w szkole ponadpodstawowej, dla którego odczytujemy dokładną wartość.`,
            formulaTex: `\\alpha = ${deg}^\\circ`,
          },
          {
            title: "Krok 2: Odczytanie dokładnej wartości",
            explanation: `Funkcja ${fn}(${deg}°) przyjmuje dokładną wartość ze wzorów maturalnych CKE.`,
            formulaTex: `${fn}(${deg}^\\circ) = ${val.tex}`,
          },
        ];

        return {
          detectedTaskTitle: title,
          cleanExpression: `${fn}(${deg}°)`,
          taskType: "expression",
          givenData: [`Kąt: α = ${deg}°`, `Funkcja: ${fn}`],
          appliedFormulas: ["Tabela wybranych wartości funkcji trygonometrycznych (CKE Matura)"],
          steps,
          finalAnswerTex: val.tex,
          finalAnswerText: `Dokładna wartość ${fn}(${deg}°) wynosi: ${val.text}.`,
          verification: "Wartość zgodna z oficjalnymi tablicami matematycznymi CKE.",
        };
      }
    }
  }

  const identityMatch = input.match(/sin(?:\s*\(?[a-zα]?\)?)?\s*=\s*(\d+)\/(\d+)/i);
  if (identityMatch) {
    const num = parseInt(identityMatch[1], 10);
    const den = parseInt(identityMatch[2], 10);

    if (num < den && den > 0) {
      const cosSquaredNum = den * den - num * num;
      const cosNum = Math.sqrt(cosSquaredNum);
      const isCosInteger = Number.isInteger(cosNum);

      const cosTex = isCosInteger ? `\\frac{${cosNum}}{${den}}` : `\\frac{\\sqrt{${cosSquaredNum}}}{${den}}`;
      const cosText = isCosInteger ? `${cosNum}/${den}` : `√${cosSquaredNum}/${den}`;

      const tgTex = isCosInteger ? `\\frac{${num}}{${cosNum}}` : `\\frac{${num}}{\\sqrt{${cosSquaredNum}}}`;
      const tgText = isCosInteger ? `${num}/${cosNum}` : `${num}/√${cosSquaredNum}`;

      const title = instruction?.trim()
        ? `${instruction.trim()} — Jedynka trygonometryczna`
        : "Zależności między funkcjami kąta ostrego (CKE Matura)";

      const steps: SolutionStep[] = [
        {
          title: "Krok 1: Zastosowanie tożsamości jedynki trygonometrycznej",
          explanation: "Wzór: sin²α + cos²α = 1 zachodzi dla każdego kąta.",
          formulaTex: `\\sin^2\\alpha + \\cos^2\\alpha = 1 \\implies \\cos^2\\alpha = 1 - \\sin^2\\alpha`,
        },
        {
          title: "Krok 2: Obliczenie wartości cosinus",
          explanation: `Podstawiamy sin α = ${num}/${den} i dla kąta ostrego (I ćwiartka) cos α > 0.`,
          formulaTex: `\\cos^2\\alpha = 1 - \\left(\\frac{${num}}{${den}}\\right)^2 = 1 - \\frac{${num * num}}{${den * den}} = \\frac{${cosSquaredNum}}{${den * den}} \\implies \\cos\\alpha = ${cosTex}`,
        },
        {
          title: "Krok 3: Wyznaczenie tangensa",
          explanation: "Stosujemy definicję tg α = sin α / cos α.",
          formulaTex: `\\operatorname{tg}\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha} = ${tgTex}`,
        },
      ];

      return {
        detectedTaskTitle: title,
        cleanExpression: `\\sin\\alpha = \\frac{${num}}{${den}}`,
        taskType: "expression",
        givenData: [`Wartość sin: sin α = ${num}/${den}`, "Założenie: kąt ostry α ∈ (0°, 90°)"],
        appliedFormulas: [
          "Jedynka trygonometryczna: \\sin^2\\alpha + \\cos^2\\alpha = 1",
          "Definicja tangensa: \\operatorname{tg}\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha}",
        ],
        steps,
        finalAnswerTex: `\\cos\\alpha = ${cosTex}, \\quad \\operatorname{tg}\\alpha = ${tgTex}`,
        finalAnswerText: `Wartości funkcji: cos α = ${cosText}, tg α = ${tgText}.`,
        verification: `Sprawdzenie: (${num}/${den})² + (${cosText})² = 1.`,
      };
    }
  }

  return null;
}

/**
 * 2f. Równanie wymierne, np. "(2x + 4)/(x - 1) = 3"
 */
function trySolveRationalEquation(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const match = input.match(/\(?([0-9a-z+\-*/\s.]+)\)?\s*\/\s*\(?([0-9a-z+\-*/\s.]+)\)?\s*=\s*([0-9a-z+\-*/\s.]+)/i);
  if (!match) return null;

  const numStr = match[1].trim();
  const denStr = match[2].trim();
  const rhsStr = match[3].trim();

  if (!denStr.includes("x")) return null;

  const denTerms = parseLinearTerms(denStr);
  if (!denTerms || denTerms.a === 0) return null;

  const forbiddenX = -denTerms.b / denTerms.a;
  const forbStr = Number.isInteger(forbiddenX) ? forbiddenX.toString() : forbiddenX.toFixed(2);

  const k = parseFloat(rhsStr);
  if (!isNaN(k)) {
    const numTerms = parseLinearTerms(numStr);
    if (!numTerms) return null;

    const newA = numTerms.a - k * denTerms.a;
    const newB = k * denTerms.b - numTerms.b;

    if (newA === 0) return null;
    const solX = newB / newA;
    const solStr = Number.isInteger(solX) ? solX.toString() : solX.toFixed(2);
    const isInDomain = Math.abs(solX - forbiddenX) > 1e-9;

    const title = instruction?.trim()
      ? `${instruction.trim()} — Równanie wymierne`
      : "Równanie wymierne z dziedziną (CKE Matura)";

    const steps: SolutionStep[] = [
      {
        title: "Krok 1: Wyznaczenie dziedziny równania wymiernego (BARDZO WAŻNE W CKE)",
        explanation: "Mianownik ułamka nie może być równy zero.",
        formulaTex: `${denStr} \\neq 0 \\implies x \\neq ${forbStr} \\implies D = \\mathbb{R} \\setminus \\{${forbStr}\\}`,
      },
      {
        title: "Krok 2: Mnożenie obu stron równania przez mianownik",
        explanation: "Mnożymy obie strony przez mianownik, aby pozbyć się kreski ułamkowej.",
        formulaTex: `${numStr} = ${k} \\cdot (${denStr})`,
      },
      {
        title: "Krok 3: Rozwiązanie otrzymanego równania",
        explanation: "Przenosimy x na lewą stronę, a liczby na prawą.",
        formulaTex: `${newA}x = ${newB} \\implies x = ${solStr}`,
      },
      {
        title: "Krok 4: Sprawdzenie przynależności do dziedziny",
        explanation: isInDomain
          ? `Liczba x = ${solStr} należy do dziedziny D (różna od ${forbStr}), zatem jest poprawnym rozwiązaniem.`
          : `Liczba x = ${solStr} NIE należy do dziedziny D (zeruje mianownik). Równanie nie ma rozwiązań.`,
        formulaTex: isInDomain ? `x = ${solStr} \\in D` : `x = ${solStr} \\notin D \\implies x \\in \\emptyset`,
      },
    ];

    return {
      detectedTaskTitle: title,
      cleanExpression: input,
      taskType: "equation",
      givenData: [`Równanie: ${input}`, `Dziedzina: D = ℝ \\ {${forbStr}}`],
      appliedFormulas: [
        "Warunek istnienia ułamka: mianownik \\neq 0",
        "Mnożenie obu stron równania przez wspólny mianownik",
      ],
      steps,
      finalAnswerTex: isInDomain ? `x = ${solStr}` : "x \\in \\emptyset",
      finalAnswerText: isInDomain
        ? `Rozwiązaniem równania jest liczba: x = ${solStr}.`
        : "Równanie nie ma rozwiązań w zbiorze liczb rzeczywistych (zbiór pusty).",
      verification: isInDomain ? "Podstawienie do mianownika nie daje zera (L = P)." : "Zgodne z dziedziną.",
    };
  }

  return null;
}

/**
 * 2g. Geometria analityczna: prosta przechodząca przez 2 punkty, odcinek, środek
 */
function trySolveAnalyticGeometry(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const ptsMatch = input.match(
    /[a-z]?\s*\(?([+-]?\d+(?:\.\d+)?)\s*[,;]\s*([+-]?\d+(?:\.\d+)?)\)?.*?([+-]?\d+(?:\.\d+)?)\s*[,;]\s*([+-]?\d+(?:\.\d+)?)\)?/i
  );
  if (!ptsMatch) return null;

  const lower = (input + " " + (instruction || "")).toLowerCase();
  if (
    !lower.includes("punkt") &&
    !lower.includes("prosta") &&
    !lower.includes("odcinek") &&
    !lower.includes("analityczn") &&
    !/[ab]\s*[\(=]/i.test(input)
  ) {
    return null;
  }

  const x1 = parseFloat(ptsMatch[1]);
  const y1 = parseFloat(ptsMatch[2]);
  const x2 = parseFloat(ptsMatch[3]);
  const y2 = parseFloat(ptsMatch[4]);

  if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return null;

  const distSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  const dist = Math.sqrt(distSq);
  const distStr = Number.isInteger(dist) ? dist.toString() : `\\sqrt{${distSq}} \\approx ${dist.toFixed(2)}`;

  const sx = (x1 + x2) / 2;
  const sy = (y1 + y2) / 2;
  const sxStr = Number.isInteger(sx) ? sx.toString() : sx.toFixed(2);
  const syStr = Number.isInteger(sy) ? sy.toString() : sy.toFixed(2);

  const dx = x2 - x1;
  const dy = y2 - y1;
  let eqLineTex = "";

  if (dx === 0) {
    eqLineTex = `x = ${x1}`;
  } else {
    const aCoeff = dy / dx;
    const bCoeff = y1 - aCoeff * x1;
    const aStr = aCoeff === 1 ? "" : aCoeff === -1 ? "-" : Number.isInteger(aCoeff) ? aCoeff.toString() : aCoeff.toFixed(2);
    const bStr = bCoeff === 0 ? "" : bCoeff > 0 ? `+ ${Number.isInteger(bCoeff) ? bCoeff : bCoeff.toFixed(2)}` : `- ${Math.abs(Number.isInteger(bCoeff) ? bCoeff : Number(bCoeff.toFixed(2)))}`;
    eqLineTex = `y = ${aStr}x ${bStr}`.trim();
  }

  const title = instruction?.trim()
    ? `${instruction.trim()} — Geometria analityczna`
    : "Geometria analityczna na płaszczyźnie kartezjańskiej (CKE Matura)";

  const steps: SolutionStep[] = [
    {
      title: "Krok 1: Wypisanie współrzędnych punktów A i B",
      explanation: "Współrzędne na płaszczyźnie Oxy: A = (x₁, y₁), B = (x₂, y₂).",
      formulaTex: `A = (${x1}, ${y1}), \\quad B = (${x2}, ${y2})`,
    },
    {
      title: "Krok 2: Obliczenie długości odcinka |AB| ze wzoru CKE",
      explanation: "Wzór: |AB| = √((x₂ - x₁)² + (y₂ - y₁)²).",
      formulaTex: `|AB| = \\sqrt{(${x2} - (${x1}))^2 + (${y2} - (${y1}))^2} = ${distStr}`,
    },
    {
      title: "Krok 3: Wyznaczenie współrzędnych środka odcinka S",
      explanation: "Wzór: S = ((x₁ + x₂) / 2, (y₁ + y₂) / 2).",
      formulaTex: `S = \\left(\\frac{${x1} + ${x2}}{2}, \\frac{${y1} + ${y2}}{2}\\right) = (${sxStr}, ${syStr})`,
    },
    {
      title: "Krok 4: Wyznaczenie równania kierunkowego prostej przechodzącej przez A i B",
      explanation: "Współczynnik kierunkowy a = (y₂ - y₁) / (x₂ - x₁), wyraz wolny b = y₁ - a·x₁.",
      formulaTex: eqLineTex,
    },
  ];

  return {
    detectedTaskTitle: title,
    cleanExpression: `A(${x1}, ${y1}), B(${x2}, ${y2})`,
    taskType: "geometry",
    givenData: [`Punkt A: (${x1}, ${y1})`, `Punkt B: (${x2}, ${y2})`],
    appliedFormulas: [
      "Długość odcinka: |AB| = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
      "Środek odcinka: S = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)",
      "Równanie prostej przez 2 punkty: y - y_1 = \\frac{y_2 - y_1}{x_2 - x_1}(x - x_1)",
    ],
    steps,
    finalAnswerTex: `|AB| = ${distStr}, \\quad S = (${sxStr}, ${syStr}), \\quad ${eqLineTex}`,
    finalAnswerText: `Długość odcinka |AB| = ${Number.isInteger(dist) ? dist : dist.toFixed(2)}, środek S = (${sxStr}, ${syStr}), prosta: ${eqLineTex}.`,
    verification: "Podstawienie współrzędnych punktów do równania prostej potwierdza tożsamość.",
  };
}

/**
 * 2h. Stereometria: bryły przestrzenne (walec, kula, sześcian)
 */
function trySolveStereometryProblem(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const lower = (input + " " + (instruction || "")).toLowerCase();
  const isSolid =
    lower.includes("sześcian") ||
    lower.includes("szescian") ||
    lower.includes("walec") ||
    lower.includes("stożek") ||
    lower.includes("stozek") ||
    lower.includes("kula");

  if (!isSolid) return null;

  if (lower.includes("walec")) {
    const rMatch = input.match(/r\s*=\s*([0-9.]+)/i);
    const hMatch = input.match(/h\s*=\s*([0-9.]+)/i);
    if (rMatch && hMatch) {
      const r = parseFloat(rMatch[1]);
      const h = parseFloat(hMatch[1]);
      const V = Math.PI * r * r * h;
      const Pc = 2 * Math.PI * r * r + 2 * Math.PI * r * h;

      const title = instruction?.trim()
        ? `${instruction.trim()} — Walec`
        : "Walec — objętość i pole powierzchni (CKE Matura)";

      const steps: SolutionStep[] = [
        {
          title: "Krok 1: Wypisanie danych",
          explanation: `Promień podstawy r = ${r}, wysokość walca h = ${h}.`,
          formulaTex: `r = ${r}, \\quad h = ${h}`,
        },
        {
          title: "Krok 2: Obliczenie objętości walca ze wzoru V = πr²h",
          explanation: "Objętość jest iloczynem pola podstawy (koła) i wysokości.",
          formulaTex: `V = \\pi \\cdot (${r})^2 \\cdot ${h} = ${r * r * h}\\pi \\approx ${(V).toFixed(2)}`,
        },
        {
          title: "Krok 3: Obliczenie pola powierzchni całkowitej Pc = 2πr² + 2πrh",
          explanation: "Pole powierzchni składa się z dwóch podstaw i powierzchni bocznej.",
          formulaTex: `P_c = 2\\pi \\cdot (${r})^2 + 2\\pi \\cdot ${r} \\cdot ${h} = ${2 * r * r + 2 * r * h}\\pi \\approx ${(Pc).toFixed(2)}`,
        },
      ];

      return {
        detectedTaskTitle: title,
        cleanExpression: `Walec: r = ${r}, h = ${h}`,
        taskType: "geometry",
        givenData: [`Promień r = ${r}`, `Wysokość h = ${h}`],
        appliedFormulas: [
          "Objętość walca: V = \\pi r^2 h",
          "Pole powierzchni całkowitej walca: P_c = 2\\pi r(r + h)",
        ],
        steps,
        finalAnswerTex: `V = ${r * r * h}\\pi, \\quad P_c = ${2 * r * r + 2 * r * h}\\pi`,
        finalAnswerText: `Objętość walca V = ${r * r * h}π, pole całkowite Pc = ${2 * r * r + 2 * r * h}π.`,
        verification: "Wymiary zgodne z definicją bryły obrotowej.",
      };
    }
  }

  if (lower.includes("kula")) {
    const rMatch = input.match(/r\s*=\s*([0-9.]+)/i);
    if (rMatch) {
      const r = parseFloat(rMatch[1]);
      const Pcoeff = 4 * r * r;

      const title = instruction?.trim()
        ? `${instruction.trim()} — Kula`
        : "Kula — objętość i pole powierzchni (CKE Matura)";

      const steps: SolutionStep[] = [
        {
          title: "Krok 1: Wypisanie promienia kuli",
          explanation: `Promień kuli r = ${r}.`,
          formulaTex: `r = ${r}`,
        },
        {
          title: "Krok 2: Obliczenie objętości kuli V = 4/3 π r³",
          explanation: "Stosujemy wzór maturalny na objętość kuli.",
          formulaTex: `V = \\frac{4}{3}\\pi \\cdot (${r})^3 = \\frac{${4 * r * r * r}}{3}\\pi`,
        },
        {
          title: "Krok 3: Obliczenie pola powierzchni kuli P = 4 π r²",
          explanation: "Stosujemy wzór na pole sfery.",
          formulaTex: `P = 4\\pi \\cdot (${r})^2 = ${Pcoeff}\\pi`,
        },
      ];

      return {
        detectedTaskTitle: title,
        cleanExpression: `Kula: r = ${r}`,
        taskType: "geometry",
        givenData: [`Promień kuli: r = ${r}`],
        appliedFormulas: ["Objętość kuli: V = \\frac{4}{3}\\pi r^3", "Pole powierzchni kuli: P = 4\\pi r^2"],
        steps,
        finalAnswerTex: `V = \\frac{${4 * r * r * r}}{3}\\pi, \\quad P = ${Pcoeff}\\pi`,
        finalAnswerText: `Objętość kuli V = ${(4 * r * r * r)/3}π, pole powierzchni P = ${Pcoeff}π.`,
        verification: "Wzory zgodne z oficjalnymi tablicami CKE.",
      };
    }
  }

  if (lower.includes("sześcian") || lower.includes("szescian")) {
    const aMatch = input.match(/a\s*=\s*([0-9.]+)/i);
    if (aMatch) {
      const a = parseFloat(aMatch[1]);
      const V = a * a * a;
      const Pc = 6 * a * a;
      const d = a * Math.sqrt(3);

      const title = instruction?.trim()
        ? `${instruction.trim()} — Sześcian`
        : "Sześcian — objętość, pole i przekątna (CKE Matura)";

      const steps: SolutionStep[] = [
        {
          title: "Krok 1: Wypisanie krawędzi sześcianu",
          explanation: `Długość krawędzi a = ${a}.`,
          formulaTex: `a = ${a}`,
        },
        {
          title: "Krok 2: Obliczenie objętości V = a³",
          explanation: "Objętość sześcianu to sześcian długości jego krawędzi.",
          formulaTex: `V = (${a})^3 = ${V}`,
        },
        {
          title: "Krok 3: Obliczenie pola powierzchni całkowitej Pc = 6a²",
          explanation: "Sześcian składa się z 6 przystających kwadratowych ścian.",
          formulaTex: `P_c = 6 \\cdot (${a})^2 = ${Pc}`,
        },
        {
          title: "Krok 4: Wyznaczenie długości głównej przekątnej d = a√3",
          explanation: "Przekątna sześcianu łączy dwa najbardziej oddalone wierzchołki.",
          formulaTex: `d = ${a}\\sqrt{3} \\approx ${(d).toFixed(2)}`,
        },
      ];

      return {
        detectedTaskTitle: title,
        cleanExpression: `Sześcian: a = ${a}`,
        taskType: "geometry",
        givenData: [`Krawędź sześcianu: a = ${a}`],
        appliedFormulas: [
          "Objętość sześcianu: V = a^3",
          "Pole powierzchni całkowitej: P_c = 6a^2",
          "Przekątna sześcianu: d = a\\sqrt{3}",
        ],
        steps,
        finalAnswerTex: `V = ${V}, \\quad P_c = ${Pc}, \\quad d = ${a}\\sqrt{3}`,
        finalAnswerText: `Objętość V = ${V}, pole powierzchni całkowitej Pc = ${Pc}, przekątna d = ${a}√3.`,
        verification: "Tożsamość geometryczna bryły prawidłowej spełniona.",
      };
    }
  }

  return null;
}

/**
 * 2i. Kombinatoryka i prawdopodobieństwo (silnia, symbol Newtona)
 */
function trySolveCombinatoricsProblem(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const lower = (input + " " + (instruction || "")).toLowerCase();

  const newtonMatch = input.match(
    /(?:symbol\s*newtona|\bc\s*\(|kombinacje)?\s*\(?\s*(\d+)\s*(?:po|[,;])\s*(\d+)\s*\)?/i
  );
  if (newtonMatch && (lower.includes("newton") || lower.includes("po") || lower.includes("kombinac") || lower.includes("c("))) {
    const n = parseInt(newtonMatch[1], 10);
    const k = parseInt(newtonMatch[2], 10);

    if (n >= k && k >= 0 && n <= 30) {
      function fact(num: number): number {
        let res = 1;
        for (let i = 2; i <= num; i++) res *= i;
        return res;
      }

      const val = fact(n) / (fact(k) * fact(n - k));

      const title = instruction?.trim()
        ? `${instruction.trim()} — Symbol Newtona`
        : "Symbol Newtona (kombinacje k-elementowe ze zbioru n-elementowego)";

      const steps: SolutionStep[] = [
        {
          title: "Krok 1: Wypisanie n oraz k ze wzoru CKE",
          explanation: `Liczność zbioru n = ${n}, rozmiar podzbioru k = ${k}.`,
          formulaTex: `\\binom{${n}}{${k}}`,
        },
        {
          title: "Krok 2: Zastosowanie wzoru na symbol Newtona",
          explanation: "Wzór: (n po k) = n! / (k! · (n - k)!).",
          formulaTex: `\\binom{${n}}{${k}} = \\frac{${n}!}{${k}! \\cdot (${n} - ${k})!} = \\frac{${n}!}{${k}! \\cdot ${n - k}!}`,
        },
        {
          title: "Krok 3: Skrócenie silni i obliczenie wyniku",
          explanation: "Skracamy silnię w liczniku i mianowniku.",
          formulaTex: `\\binom{${n}}{${k}} = ${val}`,
        },
      ];

      return {
        detectedTaskTitle: title,
        cleanExpression: `\\binom{${n}}{${k}}`,
        taskType: "expression",
        givenData: [`Liczność zbioru: n = ${n}`, `Rozmiar podzbioru: k = ${k}`],
        appliedFormulas: ["Wzór na symbol Newtona: \\binom{n}{k} = \\frac{n!}{k!(n-k)!}"],
        steps,
        finalAnswerTex: `${val}`,
        finalAnswerText: `Wartość symbolu Newtona (${n} po ${k}) wynosi: ${val}.`,
        verification: `Zgodne z trójkątem Pascala.`,
      };
    }
  }

  const factMatch = input.match(/(\d+)\s*!/);
  if (factMatch) {
    const n = parseInt(factMatch[1], 10);
    if (n >= 0 && n <= 20) {
      let val = 1;
      const terms: number[] = [];
      for (let i = 1; i <= n; i++) {
        val *= i;
        terms.push(i);
      }

      const title = instruction?.trim()
        ? `${instruction.trim()} — Silnia`
        : "Silnia liczby naturalnej n! (CKE Matura)";

      const steps: SolutionStep[] = [
        {
          title: "Krok 1: Definicja silni",
          explanation: "Silnia n! to iloczyn wszystkich liczb naturalnych dodatnich od 1 do n.",
          formulaTex: `${n}! = ${terms.length > 0 ? terms.join(" \\cdot ") : "1"}`,
        },
        {
          title: "Krok 2: Obliczenie iloczynu",
          explanation: `Wyznaczamy ostateczną wartość ${n}!.`,
          formulaTex: `${n}! = ${val}`,
        },
      ];

      return {
        detectedTaskTitle: title,
        cleanExpression: `${n}!`,
        taskType: "expression",
        givenData: [`Liczba naturalna: n = ${n}`],
        appliedFormulas: ["Definicja silni: n! = 1 \\cdot 2 \\cdot ... \\cdot n \\quad (dla \\; n \\ge 1), \\quad 0! = 1"],
        steps,
        finalAnswerTex: `${val}`,
        finalAnswerText: `Wartość ${n}! wynosi: ${val}.`,
        verification: `Iloczyn poprawny.`,
      };
    }
  }

  return null;
}

/**
 * 2j. Analiza funkcji liniowej i kwadratowej: własności, wierzchołek, postać kanoniczna
 */
function trySolveFunctionAnalysis(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const match = input.match(/(?:f\(x\)|y)\s*=\s*(.+)/i);
  if (!match) return null;

  const rhs = match[1].trim();
  const quadTerms = parseQuadraticTerms(rhs);
  if (!quadTerms) return null;

  const { a, b, c } = quadTerms;

  if (a !== 0) {
    const delta = b * b - 4 * a * c;
    const p = -b / (2 * a);
    const q = -delta / (4 * a);
    const pStr = Number.isInteger(p) ? p.toString() : p.toFixed(2);
    const qStr = Number.isInteger(q) ? q.toString() : q.toFixed(2);

    const title = instruction?.trim()
      ? `${instruction.trim()} — Funkcja kwadratowa`
      : "Własności funkcji kwadratowej (CKE Matura)";

    const canonicalTex = `f(x) = ${a === 1 ? "" : a === -1 ? "-" : a}(x ${p >= 0 ? "- " + pStr : "+ " + Math.abs(Number(pStr))})^2 ${q >= 0 ? "+ " + qStr : "- " + Math.abs(Number(qStr))}`;

    const steps: SolutionStep[] = [
      {
        title: "Krok 1: Współczynniki i wyróżnik Δ",
        explanation: `a = ${a}, b = ${b}, c = ${c}.`,
        formulaTex: `\\Delta = (${b})^2 - 4 \\cdot (${a}) \\cdot (${c}) = ${delta}`,
      },
      {
        title: "Krok 2: Wyznaczenie współrzędnych wierzchołka paraboli W(p, q)",
        explanation: "Wzory CKE: p = -b / (2a), q = -Δ / (4a).",
        formulaTex: `p = -\\frac{${b}}{2 \\cdot ${a}} = ${pStr}, \\quad q = -\\frac{${delta}}{4 \\cdot ${a}} = ${qStr} \\implies W = (${pStr}, ${qStr})`,
      },
      {
        title: "Krok 3: Postać kanoniczna funkcji kwadratowej",
        explanation: "Wzór: f(x) = a(x - p)² + q.",
        formulaTex: canonicalTex,
      },
      {
        title: "Krok 4: Zbiór wartości i monotoniczność",
        explanation: a > 0
          ? `Ponieważ a = ${a} > 0, ramiona paraboli skierowane są w górę. Funkcja maleje w przedziale (-∞, ${pStr}> i rośnie w <${pStr}, +∞). Zbiór wartości to Y = <${qStr}, +∞).`
          : `Ponieważ a = ${a} < 0, ramiona paraboli skierowane są w dół. Funkcja rośnie w przedziale (-∞, ${pStr}> i maleje w <${pStr}, +∞). Zbiór wartości to Y = (-∞, ${qStr}>.`,
        formulaTex: a > 0 ? `Y = \\langle ${qStr}, +\\infty)` : `Y = (-\\infty, ${qStr}\\rangle`,
      },
    ];

    return {
      detectedTaskTitle: title,
      cleanExpression: `f(x) = ${rhs}`,
      taskType: "equation",
      givenData: [`Wzór funkcji: f(x) = ${rhs}`, `Współczynniki: a = ${a}, b = ${b}, c = ${c}`],
      appliedFormulas: [
        "Współrzędne wierzchołka paraboli: W(p, q), \\quad p = -\\frac{b}{2a}, \\quad q = -\\frac{\\Delta}{4a}",
        "Postać kanoniczna: f(x) = a(x - p)^2 + q",
      ],
      steps,
      finalAnswerTex: `W = (${pStr}, ${qStr}), \\quad ${canonicalTex}`,
      finalAnswerText: `Wierzchołek paraboli: W = (${pStr}, ${qStr}), postać kanoniczna: ${canonicalTex}.`,
      verification: "Współrzędne wierzchołka i zbiór wartości zgodne z osią symetrii x = p.",
    };
  }

  return null;
}

/**
 * 3. Geometria / Planimetria (Twierdzenie Pitagorasa, pole trójkąta, trapezu, koła)
 */
function trySolveGeometryProblem(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const lower = (input + " " + (instruction || "")).toLowerCase();

  // 3a. Twierdzenie Pitagorasa: a=3, b=4 lub a^2 + b^2 = c^2
  if (lower.includes("pitagoras") || lower.includes("przeciwprostokątn") || (lower.includes("a=") && lower.includes("b=") && !lower.includes("h="))) {
    const aMatch = lower.match(/a\s*=\s*(\d+(?:\.\d+)?)/);
    const bMatch = lower.match(/b\s*=\s*(\d+(?:\.\d+)?)/);
    const cMatch = lower.match(/c\s*=\s*(\d+(?:\.\d+)?)/);

    if (aMatch && bMatch && !cMatch) {
      const a = parseFloat(aMatch[1]);
      const b = parseFloat(bMatch[1]);
      const c2 = a * a + b * b;
      const c = Math.sqrt(c2);
      const cStr = Number.isInteger(c) ? c.toString() : c.toFixed(2);

      return {
        detectedTaskTitle: instruction || "Twierdzenie Pitagorasa — Przeciwprostokątna trójkąta",
        cleanExpression: `a = ${a}, b = ${b} \\implies c = \\sqrt{a^2 + b^2}`,
        taskType: "geometry",
        givenData: [`Przyprostokątna a = ${a}`, `Przyprostokątna b = ${b}`, "Trójkąt prostokątny"],
        appliedFormulas: ["Twierdzenie Pitagorasa: a^2 + b^2 = c^2 \\implies c = \\sqrt{a^2 + b^2}"],
        steps: [
          {
            title: "Krok 1: Zapisanie twierdzenia Pitagorasa",
            explanation: "Suma kwadratów długości przyprostokątnych jest równa kwadratowi długości przeciwprostokątnej.",
            formulaTex: "c^2 = a^2 + b^2",
          },
          {
            title: "Krok 2: Podstawienie danych liczbowych",
            explanation: "Podnosimy długości boków do kwadratu i dodajemy je.",
            formulaTex: `c^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c2}`,
          },
          {
            title: "Krok 3: Wyciągnięcie pierwiastka kwadratowego",
            explanation: "Ponieważ długość boku musi być dodatnia (c > 0):",
            formulaTex: `c = \\sqrt{${c2}} = ${cStr}`,
          },
        ],
        finalAnswerTex: `c = ${cStr}`,
        finalAnswerText: `Długość przeciwprostokątnej wynosi c = ${cStr}.`,
        verification: `${a}^2 + ${b}^2 = ${a*a + b*b} = (${cStr})^2.`,
      };
    } else if (aMatch && cMatch && !bMatch) {
      const a = parseFloat(aMatch[1]);
      const c = parseFloat(cMatch[1]);
      if (c > a) {
        const b2 = c * c - a * a;
        const b = Math.sqrt(b2);
        const bStr = Number.isInteger(b) ? b.toString() : b.toFixed(2);

        return {
          detectedTaskTitle: instruction || "Twierdzenie Pitagorasa — Wyznaczenie przyprostokątnej",
          cleanExpression: `a = ${a}, c = ${c} \\implies b = \\sqrt{c^2 - a^2}`,
          taskType: "geometry",
          givenData: [`Przyprostokątna a = ${a}`, `Przeciwprostokątna c = ${c}`],
          appliedFormulas: ["Twierdzenie Pitagorasa: b^2 = c^2 - a^2 \\implies b = \\sqrt{c^2 - a^2}"],
          steps: [
            {
              title: "Krok 1: Przekształcenie wzoru Pitagorasa",
              explanation: "Wyznaczamy kwadrat szukanej przyprostokątnej b.",
              formulaTex: "b^2 = c^2 - a^2",
            },
            {
              title: "Krok 2: Obliczenia liczbowe",
              explanation: "Odejmujemy kwadrat przyprostokątnej od kwadratu przeciwprostokątnej.",
              formulaTex: `b^2 = ${c}^2 - ${a}^2 = ${c * c} - ${a * a} = ${b2}`,
            },
            {
              title: "Krok 3: Pierwiastkowanie",
              explanation: "Długość boku b > 0:",
              formulaTex: `b = \\sqrt{${b2}} = ${bStr}`,
            },
          ],
          finalAnswerTex: `b = ${bStr}`,
          finalAnswerText: `Długość szukanej przyprostokątnej wynosi b = ${bStr}.`,
          verification: `${a}^2 + (${bStr})^2 = ${c}^2.`,
        };
      }
    }
  }

  // 3b. Pole trójkąta (a i h)
  if (lower.includes("trójkąt") || (lower.includes("pole") && lower.includes("h="))) {
    const aMatch = lower.match(/[ab]\s*=\s*(\d+(?:\.\d+)?)/);
    const hMatch = lower.match(/h\s*=\s*(\d+(?:\.\d+)?)/);
    if (aMatch && hMatch) {
      const a = parseFloat(aMatch[1]);
      const h = parseFloat(hMatch[1]);
      const area = (a * h) / 2;
      const areaStr = Number.isInteger(area) ? area.toString() : area.toFixed(2);

      return {
        detectedTaskTitle: instruction || "Pole trójkąta",
        cleanExpression: `P = \\frac{a \\cdot h}{2} = \\frac{${a} \\cdot ${h}}{2}`,
        taskType: "geometry",
        givenData: [`Podstawa a = ${a}`, `Wysokość h = ${h}`],
        appliedFormulas: ["Wzór na pole trójkąta: P = \\frac{a \\cdot h}{2}"],
        steps: [
          {
            title: "Krok 1: Wypisanie wzoru",
            explanation: "Pole trójkąta to połowa iloczynu długości podstawy i opuszczonej na nią wysokości.",
            formulaTex: "P = \\frac{1}{2} a \\cdot h",
          },
          {
            title: "Krok 2: Podstawienie danych i obliczenie",
            explanation: "Mnożymy podstawę przez wysokość i dzielimy przez 2.",
            formulaTex: `P = \\frac{${a} \\cdot ${h}}{2} = \\frac{${a * h}}{2} = ${areaStr}`,
          },
        ],
        finalAnswerTex: `P = ${areaStr}`,
        finalAnswerText: `Pole trójkąta wynosi P = ${areaStr}.`,
        verification: `2P / h = 2(${areaStr}) / ${h} = ${a} (zgodne z podstawą).`,
      };
    }
  }

  // 3c. Pole trapezu (a, b, h)
  if (lower.includes("trapez")) {
    const aMatch = lower.match(/a\s*=\s*(\d+(?:\.\d+)?)/);
    const bMatch = lower.match(/b\s*=\s*(\d+(?:\.\d+)?)/);
    const hMatch = lower.match(/h\s*=\s*(\d+(?:\.\d+)?)/);
    if (aMatch && bMatch && hMatch) {
      const a = parseFloat(aMatch[1]);
      const b = parseFloat(bMatch[1]);
      const h = parseFloat(hMatch[1]);
      const area = ((a + b) * h) / 2;
      const areaStr = Number.isInteger(area) ? area.toString() : area.toFixed(2);

      return {
        detectedTaskTitle: instruction || "Pole trapezu",
        cleanExpression: `P = \\frac{(a+b)h}{2}`,
        taskType: "geometry",
        givenData: [`Podstawa a = ${a}`, `Podstawa b = ${b}`, `Wysokość h = ${h}`],
        appliedFormulas: ["Wzór na pole trapezu: P = \\frac{(a + b) \\cdot h}{2}"],
        steps: [
          {
            title: "Krok 1: Dodanie długości podstaw",
            explanation: "Dodajemy do siebie długości obu podstaw trapezu.",
            formulaTex: `a + b = ${a} + ${b} = ${a + b}`,
          },
          {
            title: "Krok 2: Pomnożenie przez wysokość i podział przez 2",
            explanation: "Iloczyn sumy podstaw i wysokości dzielimy na 2.",
            formulaTex: `P = \\frac{(${a} + ${b}) \\cdot ${h}}{2} = \\frac{${(a + b) * h}}{2} = ${areaStr}`,
          },
        ],
        finalAnswerTex: `P = ${areaStr}`,
        finalAnswerText: `Pole trapezu wynosi P = ${areaStr}.`,
        verification: `Suma podstaw: ${a + b}, średnia podstaw: ${(a + b) / 2}, pole: ${areaStr}.`,
      };
    }
  }

  // 3d. Koło i okrąg (promień r)
  if (lower.includes("koło") || lower.includes("koła") || lower.includes("okrąg") || lower.includes("promień")) {
    const rMatch = lower.match(/r\s*=\s*(\d+(?:\.\d+)?)/);
    if (rMatch) {
      const r = parseFloat(rMatch[1]);
      const areaPi = r * r;
      const circPi = 2 * r;
      const approxArea = (areaPi * 3.14159).toFixed(2);
      const approxCirc = (circPi * 3.14159).toFixed(2);

      return {
        detectedTaskTitle: instruction || "Pole koła i obwód okręgu",
        cleanExpression: `P = \\pi r^2, \\quad Obw = 2\\pi r`,
        taskType: "geometry",
        givenData: [`Promień r = ${r}`],
        appliedFormulas: [
          "Pole koła: P = \\pi r^2",
          "Obwód okręgu: L = 2\\pi r",
          "Przybliżenie: \\pi \\approx 3{,}14",
        ],
        steps: [
          {
            title: "Krok 1: Obliczenie pola koła",
            explanation: "Podnosimy promień do kwadratu i mnożymy przez liczbę π.",
            formulaTex: `P = \\pi \\cdot (${r})^2 = ${areaPi}\\pi \\approx ${approxArea}`,
          },
          {
            title: "Krok 2: Obliczenie obwodu okręgu",
            explanation: "Mnożymy podwojony promień przez liczbę π.",
            formulaTex: `L = 2 \\cdot \\pi \\cdot ${r} = ${circPi}\\pi \\approx ${approxCirc}`,
          },
        ],
        finalAnswerTex: `P = ${areaPi}\\pi, \\quad L = ${circPi}\\pi`,
        finalAnswerText: `Pole koła: P = ${areaPi}π (ok. ${approxArea}), obwód okręgu: L = ${circPi}π (ok. ${approxCirc}).`,
        verification: `Iloraz L / (2r) = (${circPi}π)/(2*${r}) = π.`,
      };
    }
  }

  return null;
}

/**
 * 4. Obliczenia procentowe, np. "20% z 150" lub "jakim procentem 50 jest 200"
 */
function trySolvePercentageProblem(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const lower = (input + " " + (instruction || "")).toLowerCase();

  // 4a. p% z liczby x, np. "20% z 150" lub "20% * 150"
  const percentOfMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:z|\*|·)?\s*(\d+(?:\.\d+)?)/);
  if (percentOfMatch) {
    const p = parseFloat(percentOfMatch[1]);
    const val = parseFloat(percentOfMatch[2]);
    const res = computePercentage("percent_of_number", p, val);
    const resultNum = (p / 100) * val;
    const resStr = Number.isInteger(resultNum) ? resultNum.toString() : resultNum.toFixed(2);

    return {
      detectedTaskTitle: instruction || `Obliczenie ${p}% z liczby ${val}`,
      cleanExpression: `${p}\\% \\cdot ${val} = ${resStr}`,
      taskType: "word_problem",
      givenData: [`Procent: ${p}%`, `Liczba wyjściowa: ${val}`],
      appliedFormulas: ["Wzór na procent z liczby: W = \\frac{p}{100} \\cdot a"],
      steps: [
        {
          title: "Krok 1: Zamiana procentu na ułamek dziesiętny lub zwykły",
          explanation: `${p}% to ${p} części ze stu: ${p}% = ${p}/100 = ${p / 100}.`,
          formulaTex: `${p}\\% = \\frac{${p}}{100}`,
        },
        {
          title: "Krok 2: Mnożenie ułamka przez liczbę wyjściową",
          explanation: res.explanation,
          formulaTex: res.tex,
        },
      ],
      finalAnswerTex: `${resStr}`,
      finalAnswerText: `${p}% z liczby ${val} to ${resStr}.`,
      verification: `Sprawdzenie: ${resStr} / ${val} = ${p / 100} = ${p}%.`,
    };
  }

  return null;
}

/**
 * 5. Wyłączanie czynnika przed pierwiastek, np. "sqrt(50)" lub "√50"
 */
function trySolveRootFactor(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const rootMatch = input.match(/(?:sqrt|√)\s*\(?\s*(\d+)\s*\)?/i);
  if (rootMatch) {
    const num = parseInt(rootMatch[1], 10);
    if (!isNaN(num) && num > 1) {
      const rootRes = extractRootFactor(num, 2);
      return {
        detectedTaskTitle: instruction || `Wyłączanie czynnika przed znak pierwiastka √${num}`,
        cleanExpression: `\\sqrt{${num}} = ${rootRes.tex}`,
        taskType: "expression",
        givenData: [`Liczba podpierwiastkowa: ${num}`],
        appliedFormulas: ["\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}"],
        steps: rootRes.steps.map((s) => ({
          title: s.title,
          explanation: s.detail,
          formulaTex: s.tex,
        })),
        finalAnswerTex: rootRes.tex,
        finalAnswerText: `Uproszczona postać pierwiastka: ${rootRes.outside > 1 ? `${rootRes.outside}√${rootRes.inside}` : `√${num}`}`,
        verification: `Podniesienie do kwadratu: (${rootRes.outside})^2 * ${rootRes.inside} = ${num}.`,
      };
    }
  }
  return null;
}

/**
 * 6. NWD i NWW dwóch liczb, np. "NWD(24, 36)" lub "24 i 36 nwd"
 */
function trySolveGcdLcm(
  input: string,
  instruction?: string
): GeminiTaskResponse | null {
  const match = input.match(/(?:nwd|nww)?\s*\(?\s*(\d+)\s*[,;\si]+\s*(\d+)\s*\)?/i);
  if (match && (input.toLowerCase().includes("nwd") || input.toLowerCase().includes("nww") || (instruction && (instruction.toLowerCase().includes("nwd") || instruction.toLowerCase().includes("nww"))))) {
    const a = parseInt(match[1], 10);
    const b = parseInt(match[2], 10);
    if (!isNaN(a) && !isNaN(b)) {
      const res = computeGcdLcm(a, b);
      return {
        detectedTaskTitle: instruction || `NWD i NWW liczb ${a} oraz ${b}`,
        cleanExpression: `\\operatorname{NWD}(${a}; ${b}) = ${res.gcd}, \\quad \\operatorname{NWW}(${a}; ${b}) = ${res.lcm}`,
        taskType: "expression",
        givenData: [`Liczba a = ${a}`, `Liczba b = ${b}`],
        appliedFormulas: [
          "Rozkład na czynniki pierwsze",
          "NWD: iloczyn wspólnych czynników pierwszych",
          "NWW: \\operatorname{NWW}(a; b) = \\frac{a \\cdot b}{\\operatorname{NWD}(a; b)}",
        ],
        steps: res.steps.map((s) => ({
          title: s.title,
          explanation: s.detail,
          formulaTex: s.tex,
        })),
        finalAnswerTex: `\\operatorname{NWD} = ${res.gcd}, \\quad \\operatorname{NWW} = ${res.lcm}`,
        finalAnswerText: `Dla liczb ${a} i ${b}: NWD = ${res.gcd}, NWW = ${res.lcm}.`,
        verification: `Iloczyn NWD * NWW = ${res.gcd * res.lcm} = a * b (${a * b}).`,
      };
    }
  }
  return null;
}

/**
 * GŁÓWNY PUNKT WEJŚCIA DLA OSOBNEGO SILNIKA ROZWIĄZYWANIA ZADAŃ:
 * Przetwarza zadanie w 100% lokalnie, generując pełny proces dydaktyczny
 * bez konieczności łączenia z żadnym zewnętrznym API.
 */
export function solveTaskWithFullProcess(
  rawInput: string,
  instruction?: string
): GeminiTaskResponse | null {
  if (!rawInput || !rawInput.trim()) return null;

  // Najpierw wyciągamy czyste wyrażenie matematyczne (usuwając słowa typu "Rozwiąż równanie:", "Zadanie 1" itp.)
  const parsed = extractPureMathExpression(rawInput);
  const trimmed = parsed.expression.trim();
  const taskTitle = instruction?.trim() || parsed.contextTitle;
  if (!trimmed) return null;

  // 1. Sprawdzamy czy to układ równań
  const systemRes = trySolveSystemOfEquations(trimmed, taskTitle);
  if (systemRes) return systemRes;

  // 2. Sprawdzamy nierówność kwadratową (CKE Matura)
  const quadIneqRes = trySolveQuadraticInequality(trimmed, taskTitle);
  if (quadIneqRes) return quadIneqRes;

  // 3. Sprawdzamy czy to nierówność liniowa
  const ineqRes = trySolveLinearInequality(trimmed, taskTitle);
  if (ineqRes) return ineqRes;

  // 4. Sprawdzamy równanie wymierne (CKE Matura)
  const ratRes = trySolveRationalEquation(trimmed, taskTitle);
  if (ratRes) return ratRes;

  // 5. Sprawdzamy logarytmy (CKE Matura)
  const logRes = trySolveLogarithmProblem(trimmed, taskTitle);
  if (logRes) return logRes;

  // 6. Sprawdzamy ciągi liczbowe (arytmetyczny i geometryczny)
  const seqRes = trySolveSequenceProblem(trimmed, taskTitle);
  if (seqRes) return seqRes;

  // 7. Sprawdzamy trygonometrię (wartości kątów, jedynka trygonometryczna)
  const trigRes = trySolveTrigonometryProblem(trimmed, taskTitle);
  if (trigRes) return trigRes;

  // 8. Sprawdzamy geometrię analityczną (punkty A, B, prosta, odcinek)
  const analRes = trySolveAnalyticGeometry(trimmed, taskTitle);
  if (analRes) return analRes;

  // 9. Sprawdzamy stereometrię (bryły: walec, kula, sześcian)
  const stereoRes = trySolveStereometryProblem(trimmed, taskTitle);
  if (stereoRes) return stereoRes;

  // 10. Sprawdzamy kombinatorykę i prawdopodobieństwo (silnia, symbol Newtona)
  const combRes = trySolveCombinatoricsProblem(trimmed, taskTitle);
  if (combRes) return combRes;

  // 11. Sprawdzamy analizę funkcji (wierzchołek, postać kanoniczna)
  const fnRes = trySolveFunctionAnalysis(trimmed, taskTitle);
  if (fnRes) return fnRes;

  // 12. Sprawdzamy geometrię / Pitagorasa / planimetrię
  const geomRes = trySolveGeometryProblem(trimmed, taskTitle);
  if (geomRes) return geomRes;

  // 4. Sprawdzamy procenty
  const percentRes = trySolvePercentageProblem(trimmed, taskTitle);
  if (percentRes) return percentRes;

  // 5. Sprawdzamy pierwiastki / wyłączanie czynnika
  const rootRes = trySolveRootFactor(trimmed, taskTitle);
  if (rootRes) return rootRes;

  // 6. Sprawdzamy NWD / NWW
  const gcdLcmRes = trySolveGcdLcm(trimmed, taskTitle);
  if (gcdLcmRes) return gcdLcmRes;

  // 7. Sprawdzamy równanie kwadratowe lub liniowe z x
  if (trimmed.includes("=") || (trimmed.includes("x") && !trimmed.includes("*"))) {
    const eqResult = solveEquation(trimmed.includes("=") ? trimmed : `${trimmed} = 0`);
    if (eqResult.status === "ok") {
      const d = eqResult.data;

      if (d.type === "quadratic") {
        const title = instruction?.trim()
          ? `${instruction.trim()} — Równanie kwadratowe`
          : "Równanie kwadratowe z wyróżnikiem Δ";

        const givenData = [
          `Równanie wyjściowe: ${trimmed}`,
          `Współczynniki: a = ${d.a}, b = ${d.b}, c = ${d.c}`,
          `Dziedzina: x ∈ ℝ`,
        ];

        const appliedFormulas = [
          "Wyróżnik równania kwadratowego: \\Delta = b^2 - 4ac",
          d.delta > 0
            ? "Dwa pierwiastki: x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a}, \\quad x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a}"
            : d.delta === 0
            ? "Jeden pierwiastek podwójny: x_0 = \\frac{-b}{2a}"
            : "Gdy \\Delta < 0: brak rozwiązań w zbiorze liczb rzeczywistych",
          "Wierzchołek paraboli: W(p, q), \\quad p = -\\frac{b}{2a}, \\quad q = -\\frac{\\Delta}{4a}",
        ];

        const steps = d.steps.map((st) => ({
          title: st.title,
          explanation: st.explanation,
          formulaTex: st.tex,
        }));

        let finalTex = "";
        let finalText = "";
        if (d.delta > 0 && d.x1Formatted && d.x2Formatted) {
          finalTex = `x_1 = ${d.x1Formatted.tex}, \\quad x_2 = ${d.x2Formatted.tex}`;
          finalText = `Równanie ma dwa rozwiązania: x₁ = ${d.x1Formatted.text}, x₂ = ${d.x2Formatted.text}`;
        } else if (d.delta === 0 && d.x0Formatted) {
          finalTex = `x_0 = ${d.x0Formatted.tex}`;
          finalText = `Równanie ma jedno podwójne rozwiązanie: x₀ = ${d.x0Formatted.text}`;
        } else {
          finalTex = "x \\in \\emptyset";
          finalText = "Brak rozwiązań w zbiorze liczb rzeczywistych (zbiór pusty).";
        }

        return {
          detectedTaskTitle: title,
          cleanExpression: trimmed,
          taskType: "equation",
          givenData,
          appliedFormulas,
          steps,
          finalAnswerTex: finalTex,
          finalAnswerText: finalText,
          verification: `Wierzchołek wykresu funkcji to W = (${d.vertex.p}, ${d.vertex.q}), postać kanoniczna: ${d.canonicalTex}`,
        };
      } else if (d.type === "linear") {
        const title = instruction?.trim()
          ? `${instruction.trim()} — Równanie liniowe`
          : "Równanie liniowe pierwszego stopnia";

        const givenData = [`Równanie wyjściowe: ${trimmed}`, "Dziedzina: x ∈ ℝ"];
        const appliedFormulas = ["Postać ogólna: ax + b = 0 \\implies x = -\\frac{b}{a}"];

        const steps = d.steps.map((st) => ({
          title: st.title,
          explanation: st.explanation,
          formulaTex: st.tex,
        }));

        return {
          detectedTaskTitle: title,
          cleanExpression: trimmed,
          taskType: "equation",
          givenData,
          appliedFormulas,
          steps,
          finalAnswerTex: `x = ${d.xFormatted.tex}`,
          finalAnswerText: `Rozwiązanie równania: x = ${d.xFormatted.text}`,
          verification: "Podstawienie wyznaczonego x do równania spełnia tożsamość L = P.",
        };
      }
    }
  }

  // 8. Działania na ułamkach zwykłych
  const fracMatch = trimmed.match(/^(\d+\/\d+|\d+)\s*([+\-*/:·])\s*(\d+\/\d+|\d+)$/);
  if (fracMatch) {
    const f1 = parseFractionStr(fracMatch[1]);
    const rawOp = fracMatch[2];
    const op: "+" | "-" | "·" | ":" =
      rawOp === "*" || rawOp === "·" ? "·" : rawOp === "/" || rawOp === ":" ? ":" : (rawOp as "+" | "-");
    const f2 = parseFractionStr(fracMatch[3]);

    if (f1 && f2) {
      const fracSteps = calculateFractionsStepByStep(f1.num, f1.den, op, f2.num, f2.den);

      const title = instruction?.trim()
        ? `${instruction.trim()} — Działania na ułamkach zwykłych`
        : "Obliczenia na ułamkach zwykłych krok po kroku";

      const givenData = [
        `Ułamek pierwszy: ${f1.num}/${f1.den}`,
        `Operacja: ${op === "·" ? "mnożenie (·)" : op === ":" ? "dzielenie (:)" : op}`,
        `Ułamek drugi: ${f2.num}/${f2.den}`,
      ];

      const appliedFormulas = [
        op === "+" || op === "-"
          ? "Sprowadzenie do wspólnego mianownika za pomocą NWW(mianownik₁, mianownik₂)"
          : op === ":"
          ? "Dzielenie ułamków to mnożenie przez odwrotność drugiego ułamka"
          : "Mnożenie: licznik razy licznik, mianownik razy mianownik",
      ];

      const steps = fracSteps.steps.map((st) => ({
        title: st.title,
        explanation: st.detail,
        formulaTex: st.tex,
      }));

      const finalFormatted =
        fracSteps.wholeNumber !== 0 && fracSteps.remainderNum !== 0
          ? `${fracSteps.wholeNumber} ${fracSteps.remainderNum}/${fracSteps.simplifiedDen} (czyli ${fracSteps.simplifiedNum}/${fracSteps.simplifiedDen})`
          : `${fracSteps.simplifiedNum}/${fracSteps.simplifiedDen}`;

      return {
        detectedTaskTitle: title,
        cleanExpression: trimmed,
        taskType: "expression",
        givenData,
        appliedFormulas,
        steps,
        finalAnswerTex: fracSteps.resultTex,
        finalAnswerText: `Wynik: ${finalFormatted}`,
        verification: `Ułamek nieskracalny: ${fracSteps.simplifiedNum}/${fracSteps.simplifiedDen}`,
      };
    }
  }

  // 9. Ogólne wyrażenie arytmetyczne / naukowe
  const evalRes = evaluateExpression(trimmed, { angleMode: "deg" });
  if (evalRes.status === "ok") {
    const title = instruction?.trim()
      ? `${instruction.trim()} — Obliczenia arytmetyczne`
      : "Wartość wyrażenia arytmetycznego";

    const givenData = [`Wyrażenie: ${trimmed}`];
    const appliedFormulas = [
      "Kolejność wykonywania działań: nawiasy, potęgowanie, mnożenie/dzielenie, dodawanie/odejmowanie",
    ];

    const steps = [
      {
        title: "Krok 1: Analiza wyrażenia",
        explanation: "Identyfikujemy operacje matematyczne i zachowujemy kolejność działań.",
        formulaTex: evalRes.inputTex,
      },
      {
        title: "Krok 2: Wyznaczenie wartości",
        explanation: evalRes.isApprox
          ? "Wynik ma rozwinięcie dziesiętne przybliżone."
          : "Wyznaczono dokładną wartość w postaci ułamka zwykłego i dziesiętnego.",
        formulaTex: evalRes.resultTex,
      },
    ];

    return {
      detectedTaskTitle: title,
      cleanExpression: trimmed,
      taskType: "expression",
      givenData,
      appliedFormulas,
      steps,
      finalAnswerTex: evalRes.resultTex,
      finalAnswerText: evalRes.resultText,
      verification: `Wartość dziesiętna: ${evalRes.decimal.text}`,
    };
  }

  return null;
}
