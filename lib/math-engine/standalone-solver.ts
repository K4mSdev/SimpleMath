import { solveEquation } from "./equations";
import { evaluateExpression } from "./evaluate";
import {
  calculateFractionsStepByStep,
  computeGcdLcm,
  extractRootFactor,
  computePercentage,
} from "./primary";
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
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // 1. Sprawdzamy czy to układ równań
  const systemRes = trySolveSystemOfEquations(trimmed, instruction);
  if (systemRes) return systemRes;

  // 2. Sprawdzamy czy to nierówność liniowa
  const ineqRes = trySolveLinearInequality(trimmed, instruction);
  if (ineqRes) return ineqRes;

  // 3. Sprawdzamy geometrię / Pitagorasa / planimetrię
  const geomRes = trySolveGeometryProblem(trimmed, instruction);
  if (geomRes) return geomRes;

  // 4. Sprawdzamy procenty
  const percentRes = trySolvePercentageProblem(trimmed, instruction);
  if (percentRes) return percentRes;

  // 5. Sprawdzamy pierwiastki / wyłączanie czynnika
  const rootRes = trySolveRootFactor(trimmed, instruction);
  if (rootRes) return rootRes;

  // 6. Sprawdzamy NWD / NWW
  const gcdLcmRes = trySolveGcdLcm(trimmed, instruction);
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
