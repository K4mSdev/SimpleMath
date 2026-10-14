import type { AngleMode } from "./instances";

/**
 * Zamienia "szkolny" zapis na składnię mathjs:
 * - przecinek dziesiętny: 2,5 → 2.5
 * - średnik jako separator argumentów: log(8; 2) → log(8, 2)
 * - symbole: · × → *, : ÷ → /, − → -, π → pi, √ → sqrt, ² ³ → ^2 ^3
 * - stopnie: 30° (w trybie RAD zamieniane na radiany)
 */
export function normalizeExpression(input: string, angleMode: AngleMode): string {
  let s = input.trim();

  s = s
    .replace(/[×·∙⋅*]/g, "*")
    .replace(/[÷:]/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/π/g, "pi")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3");

  // √9 → sqrt(9), √π → sqrt(pi); √(…) → sqrt(…)
  s = s.replace(/√\s*(\d+(?:[.,]\d+)?|pi|e)(?![a-z(])/gi, "sqrt($1)");
  s = s.replace(/√/g, "sqrt");

  // Przecinek dziesiętny
  s = s.replace(/(\d),(?=\d)/g, "$1.");
  s = s.replace(/(^|[^\d]),(\d)/g, (_m, pre: string, digit: string) => `${pre}0.${digit}`);

  // Średnik oddziela argumenty funkcji
  s = s.replace(/;/g, ",");

  // Znak stopnia
  s = s.replace(/(\d+(?:\.\d+)?)\s*°/g, (_m, num: string) =>
    angleMode === "deg" ? num : `(${num}*pi/180)`,
  );

  return s;
}
