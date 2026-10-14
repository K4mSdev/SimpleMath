import { all, create, type MathJsInstance } from "mathjs";

export type AngleMode = "deg" | "rad";
export type NumberKind = "number" | "Fraction";

/** Błąd dziedziny (np. tg 90°, log z liczby ujemnej) z komunikatem po polsku. */
export class MathDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MathDomainError";
  }
}

const DEG = Math.PI / 180;

const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Zaokrągla wynik do liczby całkowitej, jeśli różnica to tylko szum zmiennoprzecinkowy. */
const snapInteger = (v: number) => {
  const r = Math.round(v);
  return Math.abs(v - r) < 1e-12 * Math.max(1, Math.abs(v)) ? r : v;
};

// Dokładne wartości dla kątów "szkolnych", żeby sin 30° dawało dokładnie 0,5.
const SIN_EXACT: Record<number, number> = {
  0: 0, 30: 0.5, 90: 1, 150: 0.5, 180: 0, 210: -0.5, 270: -1, 330: -0.5,
};
const TAN_EXACT: Record<number, number> = { 0: 0, 45: 1, 135: -1 };
const COT_EXACT: Record<number, number> = { 90: 0, 45: 1, 135: -1 };

function sinDeg(x: unknown): number {
  const r = mod(Number(x), 360);
  return r in SIN_EXACT ? SIN_EXACT[r] : Math.sin(r * DEG);
}

function cosDeg(x: unknown): number {
  return sinDeg(Number(x) + 90);
}

function tanDeg(x: unknown): number {
  const r = mod(Number(x), 180);
  if (r === 90) throw new MathDomainError("Tangens nie istnieje dla tego kąta");
  return r in TAN_EXACT ? TAN_EXACT[r] : Math.tan(r * DEG);
}

function cotDeg(x: unknown): number {
  const r = mod(Number(x), 180);
  if (r === 0) throw new MathDomainError("Cotangens nie istnieje dla tego kąta");
  return r in COT_EXACT ? COT_EXACT[r] : 1 / Math.tan(r * DEG);
}

function cotRad(x: unknown): number {
  const t = Math.tan(Number(x));
  if (t === 0) throw new MathDomainError("Cotangens nie istnieje dla tego kąta");
  return 1 / t;
}

const toDeg = (rad: number) => snapInteger(rad / DEG);

function ln(x: unknown): number {
  const v = Number(x);
  if (v <= 0) throw new MathDomainError("Logarytm istnieje tylko dla liczb dodatnich");
  return Math.log(v);
}

/** Szkolna konwencja: log(x) = log₁₀(x), log(x; a) = logarytm o podstawie a. */
function log(x: unknown, base?: unknown): number {
  const v = Number(x);
  if (v <= 0) throw new MathDomainError("Logarytm istnieje tylko dla liczb dodatnich");
  if (base === undefined) return snapInteger(Math.log10(v));
  const b = Number(base);
  if (b <= 0 || b === 1) {
    throw new MathDomainError("Podstawa logarytmu musi być dodatnia i różna od 1");
  }
  return snapInteger(Math.log(v) / Math.log(b));
}

const commonFunctions = { ln, log };

const degreeFunctions = {
  sin: sinDeg,
  cos: cosDeg,
  tan: tanDeg,
  tg: tanDeg,
  cot: cotDeg,
  ctg: cotDeg,
  asin: (x: unknown) => toDeg(Math.asin(Number(x))),
  arcsin: (x: unknown) => toDeg(Math.asin(Number(x))),
  acos: (x: unknown) => toDeg(Math.acos(Number(x))),
  arccos: (x: unknown) => toDeg(Math.acos(Number(x))),
  atan: (x: unknown) => toDeg(Math.atan(Number(x))),
  arctg: (x: unknown) => toDeg(Math.atan(Number(x))),
  arcctg: (x: unknown) => toDeg(Math.PI / 2 - Math.atan(Number(x))),
};

const radianFunctions = {
  tg: (x: unknown) => Math.tan(Number(x)),
  cot: cotRad,
  ctg: cotRad,
  arcsin: (x: unknown) => Math.asin(Number(x)),
  arccos: (x: unknown) => Math.acos(Number(x)),
  arctg: (x: unknown) => Math.atan(Number(x)),
  arcctg: (x: unknown) => Math.PI / 2 - Math.atan(Number(x)),
};

const cache = new Map<string, MathJsInstance>();

/**
 * Zwraca (z cache) instancję mathjs:
 * - "number"   – szybkie obliczenia zmiennoprzecinkowe,
 * - "Fraction" – dokładne obliczenia na ułamkach (0,1 + 0,2 = 3/10).
 */
export function getMath(kind: NumberKind, angleMode: AngleMode): MathJsInstance {
  const key = `${kind}:${angleMode}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const math = create(all, { number: kind, predictable: true });
  math.import(commonFunctions, { override: true });
  math.import(angleMode === "deg" ? degreeFunctions : radianFunctions, { override: true });

  cache.set(key, math);
  return math;
}
