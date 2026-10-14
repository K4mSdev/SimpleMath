import type { FunctionNode, MathNode, OperatorNode, SymbolNode } from "mathjs";
import {
  exactDecimal,
  formatNumber,
  fractionToFormatted,
  mixedNumber,
  parseFraction,
  type ExactFraction,
  type Formatted,
} from "./format";
import { getMath, MathDomainError, type AngleMode } from "./instances";
import { normalizeExpression } from "./normalize";

export interface PreviousAnswer {
  value: number;
  /** Dokładna postać ułamka, np. "7/3" – pozwala liczyć dalej bez utraty dokładności. */
  exact?: string;
}

export interface EvaluateOptions {
  angleMode: AngleMode;
  ans?: PreviousAnswer;
}

export interface CalcSuccess {
  status: "ok";
  inputTex: string;
  value: number;
  /** true, gdy wynik dziesiętny jest przybliżony (≈). */
  isApprox: boolean;
  decimal: Formatted;
  fraction?: Formatted;
  mixed?: Formatted;
  exact?: string;
  /** Cały wynik jako jeden wzór LaTeX, np. "= \frac{7}{3} = 2\frac{1}{3} = 2{,}(3)". */
  resultTex: string;
  resultText: string;
}

export interface CalcError {
  status: "error";
  message: string;
  inputTex?: string;
}

export interface CalcEmpty {
  status: "empty";
}

export type CalcResult = CalcSuccess | CalcError | CalcEmpty;

/** Maksymalny wykładnik, przy którym liczymy dokładnie na ułamkach (ochrona przed zawieszeniem). */
const MAX_EXACT_EXPONENT = 2000;

const TEX_FUNCTIONS: Record<string, string> = {
  ln: "\\ln",
  sin: "\\sin",
  cos: "\\cos",
  tg: "\\operatorname{tg}",
  tan: "\\operatorname{tg}",
  ctg: "\\operatorname{ctg}",
  cot: "\\operatorname{ctg}",
  arcsin: "\\arcsin",
  asin: "\\arcsin",
  arccos: "\\arccos",
  acos: "\\arccos",
  arctg: "\\operatorname{arctg}",
  atan: "\\operatorname{arctg}",
  arcctg: "\\operatorname{arcctg}",
};

function texHandler(node: MathNode, options: object): string | undefined {
  if (node.type !== "FunctionNode") return undefined;
  const fn = node as FunctionNode;
  const name = (fn.fn as SymbolNode).name;
  const args = fn.args.map((a) => a.toTex(options));

  if (name === "log") {
    return args.length === 2
      ? `\\log_{${args[1]}}\\left(${args[0]}\\right)`
      : `\\log\\left(${args[0]}\\right)`;
  }
  if (name in TEX_FUNCTIONS && args.length === 1) {
    return `${TEX_FUNCTIONS[name]}\\left(${args[0]}\\right)`;
  }
  return undefined;
}

function toTex(node: MathNode): string {
  const tex = node.toTex({ parenthesis: "keep", implicit: "hide", handler: texHandler });
  return tex.replace(/(\d)\.(\d)/g, "$1{,}$2");
}

export function translateError(err: unknown): string {
  if (err instanceof MathDomainError) return err.message;
  const msg = err instanceof Error ? err.message : String(err);
  let m: RegExpMatchArray | null;

  if ((m = msg.match(/Undefined symbol (\w+)/))) {
    return m[1] === "ans"
      ? "Brak poprzedniego wyniku – najpierw coś oblicz"
      : `Nieznany symbol: ${m[1]}`;
  }
  if ((m = msg.match(/Undefined function (\w+)/))) return `Nieznana funkcja: ${m[1]}`;
  if (/Parenthesis \) expected/.test(msg)) return "Brakuje nawiasu zamykającego „)”";
  if (/Unexpected end of expression/.test(msg)) return "Wyrażenie jest niedokończone";
  if (/Value expected/.test(msg)) return "Brakuje liczby lub wyrażenia";
  if (/Unexpected operator/.test(msg)) return "Nieoczekiwany operator";
  if (/Too (many|few) arguments|Unexpected type of argument/.test(msg)) {
    return "Nieprawidłowe argumenty funkcji";
  }
  if (/Division by zero/i.test(msg)) return "Nie można dzielić przez zero";
  return "Błąd w zapisie wyrażenia";
}

/** Sprawdza, czy obliczenia na ułamkach nie wygenerują gigantycznych liczb (np. 9^9^9). */
function isSafeForExact(node: MathNode, scope: Record<string, unknown>, angleMode: AngleMode) {
  const math = getMath("number", angleMode);
  let safe = true;
  node.traverse((n) => {
    if (!safe || n.type !== "OperatorNode" || (n as OperatorNode).fn !== "pow") return;
    try {
      const exponent = math.evaluate((n as OperatorNode).args[1].toString(), { ...scope });
      if (typeof exponent !== "number" || !Number.isFinite(exponent) ||
        Math.abs(exponent) > MAX_EXACT_EXPONENT) {
        safe = false;
      }
    } catch {
      safe = false;
    }
  });
  return safe;
}

function usesSymbol(node: MathNode, name: string) {
  return node.filter((n) => n.type === "SymbolNode" && (n as SymbolNode).name === name).length > 0;
}

type ExactAttempt =
  | { kind: "fraction"; fraction: ExactFraction; raw: string }
  | { kind: "none" }
  | { kind: "error"; error: unknown };

/** Próbuje policzyć wyrażenie dokładnie (na ułamkach zwykłych). */
function evaluateExact(expr: string, node: MathNode, options: EvaluateOptions,
  numericScope: Record<string, unknown>): ExactAttempt {
  if (!isSafeForExact(node, numericScope, options.angleMode)) return { kind: "none" };

  const math = getMath("Fraction", options.angleMode);
  const scope: Record<string, unknown> = {};
  if (usesSymbol(node, "ans")) {
    if (!options.ans?.exact) return { kind: "none" };
    scope.ans = math.fraction(options.ans.exact);
  }

  try {
    const result = math.evaluate(expr, scope);
    if (math.typeOf(result) !== "Fraction") return { kind: "none" };
    const raw = (result as { toFraction: () => string }).toFraction();
    const fraction = parseFraction(raw);
    return fraction ? { kind: "fraction", fraction, raw } : { kind: "none" };
  } catch (error) {
    return { kind: "error", error };
  }
}

/**
 * Główna funkcja kalkulatora: przyjmuje wyrażenie w szkolnym zapisie
 * i zwraca wynik dokładny (ułamek, okres) oraz dziesiętny.
 */
export function evaluateExpression(input: string, options: EvaluateOptions): CalcResult {
  if (!input.trim()) return { status: "empty" };

  const expr = normalizeExpression(input, options.angleMode);
  const math = getMath("number", options.angleMode);

  let node: MathNode;
  try {
    node = math.parse(expr);
  } catch (err) {
    return { status: "error", message: translateError(err) };
  }

  let inputTex: string;
  try {
    inputTex = toTex(node);
  } catch {
    inputTex = expr;
  }

  const scope: Record<string, unknown> = {};
  if (options.ans) scope.ans = options.ans.value;

  let raw: unknown;
  try {
    raw = node.evaluate({ ...scope });
  } catch (err) {
    return { status: "error", message: translateError(err), inputTex };
  }

  if (typeof raw !== "number") {
    return { status: "error", message: "Wynik nie jest liczbą", inputTex };
  }
  if (Number.isNaN(raw)) {
    return {
      status: "error",
      message: "Wynik nie istnieje w zbiorze liczb rzeczywistych",
      inputTex,
    };
  }

  const exact = evaluateExact(expr, node, options, scope);

  if (!Number.isFinite(raw)) {
    const divByZero = exact.kind === "error" && /Division by zero/i.test(String(exact.error));
    return {
      status: "error",
      message: divByZero ? "Nie można dzielić przez zero" : "Wynik jest zbyt duży",
      inputTex,
    };
  }

  if (exact.kind === "fraction") {
    const f = exact.fraction;
    const exactDec = exactDecimal(f);
    const decimal = exactDec ?? formatNumber(raw);
    const isApprox = !exactDec && formatNumber(raw).rounded;
    const isInteger = f.denominator === 1n;
    const fraction = isInteger ? undefined : fractionToFormatted(f);
    const mixed = mixedNumber(f) ?? undefined;
    const rel = isApprox ? "\\approx" : "=";

    const texParts = [fraction && `= ${fraction.tex}`, mixed && `= ${mixed.tex}`,
      `${rel} ${decimal.tex}`].filter(Boolean);
    const textParts = [fraction?.text, mixed?.text, decimal.text].filter(Boolean);

    return {
      status: "ok",
      inputTex,
      value: raw,
      isApprox,
      decimal,
      fraction,
      mixed,
      exact: exact.raw,
      resultTex: texParts.join(" "),
      resultText: textParts.join(" = "),
    };
  }

  // Wynik niewymierny/przybliżony (pierwiastki, π, trygonometria)
  const value = Math.abs(raw) < 1e-14 ? 0 : raw;
  const decimal = formatNumber(value);
  const isApprox = decimal.rounded;

  return {
    status: "ok",
    inputTex,
    value,
    isApprox,
    decimal,
    resultTex: `${isApprox ? "\\approx" : "="} ${decimal.tex}`,
    resultText: `${isApprox ? "≈ " : ""}${decimal.text}`,
  };
}
