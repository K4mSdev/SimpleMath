/**
 * Silnik obliczeń dla klas 4–8 szkoły podstawowej zgodny z podstawą programową CKE:
 * - NWD (Największy Wspólny Dzielnik) i NWW (Najmniejsza Wspólna Wielokrotność)
 * - Rozkład liczby na czynniki pierwsze
 * - Działania na ułamkach zwykłych krok po kroku (wspólny mianownik, skracanie, liczba mieszana)
 * - Wyłączanie czynnika przed znak pierwiastka (np. √50 = 5√2, ∛24 = 2∛3)
 * - Obliczenia procentowe (procent z liczby, jakim procentem, podwyżki/obniżki)
 * - Prędkość, droga, czas (v = s/t) z przeliczaniem km/h <-> m/s
 */

export interface StepItem {
  title: string;
  detail: string;
  tex?: string;
}

// 1. NWD i NWW
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round((a * b) / gcd(a, b)));
}

// Rozkład na czynniki pierwsze
export function primeFactors(n: number): number[] {
  n = Math.abs(Math.round(n));
  if (n <= 1) return [];
  const factors: number[] = [];
  let d = 2;
  while (d * d <= n) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
    d++;
  }
  if (n > 1) {
    factors.push(n);
  }
  return factors;
}

export interface GcdLcmResult {
  a: number;
  b: number;
  factorsA: number[];
  factorsB: number[];
  commonFactors: number[];
  gcd: number;
  lcm: number;
  steps: StepItem[];
}

export function computeGcdLcm(a: number, b: number): GcdLcmResult {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  const factorsA = primeFactors(a);
  const factorsB = primeFactors(b);
  const g = gcd(a, b);
  const l = lcm(a, b);

  // Wspólne czynniki
  const bCopy = [...factorsB];
  const commonFactors: number[] = [];
  for (const f of factorsA) {
    const idx = bCopy.indexOf(f);
    if (idx !== -1) {
      commonFactors.push(f);
      bCopy.splice(idx, 1);
    }
  }

  const steps: StepItem[] = [
    {
      title: "1. Rozkład obu liczb na czynniki pierwsze",
      detail: `${a} = ${factorsA.join(" · ") || a}, natomiast ${b} = ${factorsB.join(" · ") || b}`,
      tex: `${a} = ${factorsA.join(" \\cdot ") || a}, \\quad ${b} = ${factorsB.join(" \\cdot ") || b}`,
    },
    {
      title: "2. Największy Wspólny Dzielnik (NWD)",
      detail:
        commonFactors.length > 0
          ? `Wspólne czynniki to: ${commonFactors.join(", ")}. Mnożymy je: ${commonFactors.join(" · ")} = ${g}`
          : "Liczby nie mają wspólnych dzielników większych od 1 (liczby względnie pierwsze). NWD = 1",
      tex: `\\operatorname{NWD}(${a}; ${b}) = ${g}`,
    },
    {
      title: "3. Najmniejsza Wspólna Wielokrotność (NWW)",
      detail: `Obliczamy ze wzoru szkolnego: NWW(a; b) = (a · b) : NWD(a; b) = (${a} · ${b}) : ${g} = ${l}`,
      tex: `\\operatorname{NWW}(${a}; ${b}) = \\frac{${a} \\cdot ${b}}{${g}} = ${l}`,
    },
  ];

  return { a, b, factorsA, factorsB, commonFactors, gcd: g, lcm: l, steps };
}

// 2. Działania na ułamkach zwykłych krok po kroku
export interface FractionStepResult {
  n1: number;
  d1: number;
  op: "+" | "-" | "·" | ":";
  n2: number;
  d2: number;
  resultNum: number;
  resultDen: number;
  simplifiedNum: number;
  simplifiedDen: number;
  wholeNumber: number;
  remainderNum: number;
  steps: StepItem[];
  resultTex: string;
}

export function calculateFractionsStepByStep(
  n1: number,
  d1: number,
  op: "+" | "-" | "·" | ":",
  n2: number,
  d2: number,
): FractionStepResult {
  d1 = d1 || 1;
  d2 = d2 || 1;
  const steps: StepItem[] = [];

  let rawNum = 0;
  let rawDen = 1;

  if (op === "+" || op === "-") {
    const commonDen = lcm(d1, d2);
    const m1 = commonDen / d1;
    const m2 = commonDen / d2;
    const expandedN1 = n1 * m1;
    const expandedN2 = n2 * m2;

    steps.push({
      title: "1. Sprowadzenie do wspólnego mianownika (NWW)",
      detail: `Wspólny mianownik dla ${d1} i ${d2} to NWW(${d1}; ${d2}) = ${commonDen}. Rozszerzamy ułamki:`,
      tex: `\\frac{${n1}}{${d1}} = \\frac{${n1} \\cdot ${m1}}{${commonDen}} = \\frac{${expandedN1}}{${commonDen}}, \\quad \\frac{${n2}}{${d2}} = \\frac{${n2} \\cdot ${m2}}{${commonDen}} = \\frac{${expandedN2}}{${commonDen}}`,
    });

    rawNum = op === "+" ? expandedN1 + expandedN2 : expandedN1 - expandedN2;
    rawDen = commonDen;

    steps.push({
      title: op === "+" ? "2. Dodawanie liczników" : "2. Odejmowanie liczników",
      detail: "Mianownik pozostawiamy bez zmian, działanie wykonujemy tylko na licznikach:",
      tex: `\\frac{${expandedN1}}{${commonDen}} ${op} \\frac{${expandedN2}}{${commonDen}} = \\frac{${expandedN1} ${op} ${expandedN2}}{${commonDen}} = \\frac{${rawNum}}{${commonDen}}`,
    });
  } else if (op === "·") {
    rawNum = n1 * n2;
    rawDen = d1 * d2;

    steps.push({
      title: "1. Mnożenie licznika przez licznik i mianownika przez mianownik",
      detail: `Mnożymy góry i doły:`,
      tex: `\\frac{${n1}}{${d1}} \\cdot \\frac{${n2}}{${d2}} = \\frac{${n1} \\cdot ${n2}}{${d1} \\cdot ${d2}} = \\frac{${rawNum}}{${rawDen}}`,
    });
  } else {
    // Dzielenie ułamków: mnożenie przez odwrotność drugiego
    rawNum = n1 * d2;
    rawDen = d1 * n2;

    steps.push({
      title: "1. Zamiana dzielenia na mnożenie przez odwrotność drugiego ułamka",
      detail: `Odwracamy drugi ułamek (licznik zamienia się z mianownikiem):`,
      tex: `\\frac{${n1}}{${d1}} : \\frac{${n2}}{${d2}} = \\frac{${n1}}{${d1}} \\cdot \\frac{${d2}}{${n2}} = \\frac{${n1} \\cdot ${d2}}{${d1} \\cdot ${n2}} = \\frac{${rawNum}}{${rawDen}}`,
    });
  }

  // Skracanie
  const g = gcd(Math.abs(rawNum), Math.abs(rawDen));
  const simNum = rawNum / g;
  const simDen = rawDen / g;

  if (g > 1) {
    steps.push({
      title: "Skracanie ułamka przez NWD",
      detail: `Dzielimy licznik i mianownik przez ${g}:`,
      tex: `\\frac{${rawNum}}{${rawDen}} = \\frac{${rawNum} : ${g}}{${rawDen} : ${g}} = \\frac{${simNum}}{${simDen}}`,
    });
  }

  // Liczba mieszana
  const whole = Math.floor(Math.abs(simNum) / simDen) * (simNum < 0 ? -1 : 1);
  const remainder = Math.abs(simNum) % simDen;

  let resultTex = `\\frac{${simNum}}{${simDen}}`;
  if (Math.abs(simNum) >= simDen && simDen !== 1) {
    const sign = whole < 0 ? "-" : "";
    resultTex = `${sign}${Math.abs(whole)}\\frac{${remainder}}{${simDen}} = \\frac{${simNum}}{${simDen}}`;
    steps.push({
      title: "Wyciąganie całości (liczba mieszana)",
      detail: `W liczbie ${Math.abs(simNum)} mieści się ${Math.abs(whole)} całych mianowników (${simDen}), zostaje reszta ${remainder}:`,
      tex: `\\frac{${simNum}}{${simDen}} = ${resultTex}`,
    });
  } else if (simDen === 1) {
    resultTex = `${simNum}`;
  }

  return {
    n1,
    d1,
    op,
    n2,
    d2,
    resultNum: rawNum,
    resultDen: rawDen,
    simplifiedNum: simNum,
    simplifiedDen: simDen,
    wholeNumber: whole,
    remainderNum: remainder,
    steps,
    resultTex,
  };
}

// 3. Wyłączanie czynnika przed pierwiastek (np. √50 = 5√2, ∛24 = 2∛3)
export interface RootFactorResult {
  original: number;
  degree: number; // 2 dla kwadratowego, 3 dla sześciennego
  outside: number;
  inside: number;
  tex: string;
  steps: StepItem[];
}

export function extractRootFactor(n: number, degree: number = 2): RootFactorResult {
  n = Math.abs(Math.round(n));
  degree = degree === 3 ? 3 : 2;

  let outside = 1;
  let inside = n;

  const factors = primeFactors(n);
  // Zliczanie powtórzeń czynników
  const counts: Record<number, number> = {};
  for (const f of factors) {
    counts[f] = (counts[f] || 0) + 1;
  }

  for (const fStr of Object.keys(counts)) {
    const f = Number(fStr);
    const count = counts[f];
    const groupCount = Math.floor(count / degree);
    if (groupCount > 0) {
      outside *= Math.pow(f, groupCount);
      inside /= Math.pow(f, groupCount * degree);
    }
  }

  const rootSymbol = degree === 3 ? "\\sqrt[3]" : "\\sqrt";
  let tex = `${rootSymbol}{${n}}`;

  const steps: StepItem[] = [
    {
      title: "1. Rozkład liczby podpierwiastkowej na czynniki pierwsze",
      detail: `${n} = ${factors.join(" · ") || n}`,
      tex: `${n} = ${factors.join(" \\cdot ") || n}`,
    },
  ];

  if (outside > 1 && inside > 1) {
    const perfectPower = Math.pow(outside, degree);
    steps.push({
      title: "2. Rozbicie na iloczyn potęgi i reszty",
      detail: `Zauważamy, że ${n} = ${perfectPower} · ${inside}, gdzie ${perfectPower} = ${outside}^${degree}:`,
      tex: `${rootSymbol}{${n}} = ${rootSymbol}{${perfectPower} \\cdot ${inside}} = ${rootSymbol}{${perfectPower}} \\cdot ${rootSymbol}{${inside}} = ${outside}${rootSymbol}{${inside}}`,
    });
    tex = `${outside}${rootSymbol}{${inside}}`;
  } else if (outside > 1 && inside === 1) {
    steps.push({
      title: "2. Liczba jest dokładną potęgą",
      detail: `Pierwiastek wyciąga się w całości:`,
      tex: `${rootSymbol}{${n}} = ${outside}`,
    });
    tex = `${outside}`;
  } else {
    steps.push({
      title: "2. Brak czynników do wyłączenia",
      detail: `Liczby nie da się rozbić na pełne potęgi stopnia ${degree}. Pierwiastek pozostaje w prostej postaci.`,
      tex: `${rootSymbol}{${n}}`,
    });
  }

  return { original: n, degree, outside, inside, tex, steps };
}

// 4. Obliczenia procentowe dla klas 6–8
export type PercentCalcMode = "percent_of_number" | "what_percent" | "change_increase" | "change_decrease";

export interface PercentResult {
  mode: PercentCalcMode;
  a: number;
  b: number;
  result: number;
  tex: string;
  explanation: string;
}

export function computePercentage(mode: PercentCalcMode, a: number, b: number): PercentResult {
  let result = 0;
  let tex = "";
  let explanation = "";

  if (mode === "percent_of_number") {
    // a % z liczby b
    result = Math.round(((a / 100) * b) * 1e10) / 1e10;
    tex = `\\frac{${a}}{100} \\cdot ${b} = ${result}`;
    explanation = `Obliczono ${a}% z liczby ${b}: zamieniamy procent na ułamek (${a}/100) i mnożymy przez ${b}.`;
  } else if (mode === "what_percent") {
    // Jakim procentem liczby b jest liczba a
    result = b !== 0 ? Math.round(((a / b) * 100) * 1e10) / 1e10 : 0;
    tex = `\\frac{${a}}{${b}} \\cdot 100\\% = ${result.toFixed(2).replace(".00", "")}\\%`;
    explanation = `Liczba ${a} stanowi ${result.toFixed(2).replace(".00", "")}% liczby ${b}.`;
  } else if (mode === "change_increase") {
    // Liczba b powiększona o a %
    result = Math.round((b * (1 + a / 100)) * 1e10) / 1e10;
    tex = `${b} \\cdot (1 + \\frac{${a}}{100}) = ${b} \\cdot ${1 + a / 100} = ${result}`;
    explanation = `Podwyżka o ${a}%: nowa wartość to ${result}.`;
  } else {
    // Liczba b pomniejszona o a %
    result = Math.round((b * (1 - a / 100)) * 1e10) / 1e10;
    tex = `${b} \\cdot (1 - \\frac{${a}}{100}) = ${b} \\cdot ${1 - a / 100} = ${result}`;
    explanation = `Obniżka o ${a}%: nowa wartość po rabacie to ${result}.`;
  }

  return { mode, a, b, result, tex, explanation };
}
