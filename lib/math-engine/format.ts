import { format } from "mathjs";

export interface Formatted {
  text: string;
  tex: string;
}

export interface ExactFraction {
  negative: boolean;
  numerator: bigint;
  denominator: bigint;
}

/** Maksymalna liczba cyfr po przecinku przy szukaniu okresu. */
const MAX_FRACTION_DIGITS = 40;
/** Powyżej tylu cyfr części całkowitej przechodzimy na notację naukową. */
const MAX_INTEGER_DIGITS = 25;

/** Parsuje wynik Fraction.toFraction(), np. "-7/3" albo "5". */
export function parseFraction(text: string): ExactFraction | null {
  const m = text.trim().match(/^(-?)(\d+)(?:\/(\d+))?$/);
  if (!m) return null;
  return {
    negative: m[1] === "-" && m[2] !== "0",
    numerator: BigInt(m[2]),
    denominator: BigInt(m[3] ?? "1"),
  };
}

/**
 * Dokładne rozwinięcie dziesiętne ułamka z okresem w nawiasie (szkolny zapis):
 * 1/3 → 0,(3), 1/6 → 0,1(6), 1/8 → 0,125.
 * Zwraca null, jeśli okres jest zbyt długi lub liczba zbyt duża.
 */
export function exactDecimal(f: ExactFraction): Formatted | null {
  const { numerator: n, denominator: d } = f;
  const integer = n / d;
  if (integer.toString().length > MAX_INTEGER_DIGITS) return null;

  let remainder = n % d;
  const digits: string[] = [];
  const seen = new Map<bigint, number>();

  while (remainder !== 0n && !seen.has(remainder) && digits.length < MAX_FRACTION_DIGITS) {
    seen.set(remainder, digits.length);
    remainder *= 10n;
    digits.push((remainder / d).toString());
    remainder %= d;
  }

  if (remainder !== 0n && !seen.has(remainder)) return null;

  const all = digits.join("");
  const periodStart = remainder === 0n ? all.length : seen.get(remainder)!;
  const nonRepeating = all.slice(0, periodStart);
  const repeating = all.slice(periodStart);

  const sign = f.negative ? "-" : "";
  const fractional = all ? `${nonRepeating}${repeating ? `(${repeating})` : ""}` : "";

  return {
    text: `${sign}${integer}${fractional ? `,${fractional}` : ""}`,
    tex: `${sign}${integer}${fractional ? `{,}${fractional}` : ""}`,
  };
}

export function fractionToFormatted(f: ExactFraction): Formatted {
  const sign = f.negative ? "-" : "";
  return {
    text: `${sign}${f.numerator}/${f.denominator}`,
    tex: `${sign}\\frac{${f.numerator}}{${f.denominator}}`,
  };
}

/** Liczba mieszana, np. 7/3 → 2⅓. Null dla ułamków właściwych. */
export function mixedNumber(f: ExactFraction): Formatted | null {
  if (f.denominator === 1n || f.numerator < f.denominator) return null;
  const whole = f.numerator / f.denominator;
  const rest = f.numerator % f.denominator;
  const sign = f.negative ? "-" : "";
  return {
    text: `${sign}${whole} ${rest}/${f.denominator}`,
    tex: `${sign}${whole}\\frac{${rest}}{${f.denominator}}`,
  };
}

/** Formatuje liczbę zmiennoprzecinkową (12 cyfr znaczących, przecinek dziesiętny). */
export function formatNumber(value: number): Formatted & { rounded: boolean } {
  const raw = format(value, { notation: "auto", precision: 12, lowerExp: -9, upperExp: 15 });
  const rounded = Number(raw) !== value;
  const m = raw.match(/^(-?[\d.]+)e([+-]\d+)$/);

  if (m) {
    const mantissa = m[1].replace(".", ",");
    const exponent = m[2].replace("+", "");
    return {
      text: `${mantissa}·10^${exponent}`,
      tex: `${mantissa.replace(",", "{,}")} \\cdot 10^{${exponent}}`,
      rounded,
    };
  }

  return { text: raw.replace(".", ","), tex: raw.replace(".", "{,}"), rounded };
}
