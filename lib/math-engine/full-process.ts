import { solveEquation } from "./equations";
import { evaluateExpression } from "./evaluate";
import { calculateFractionsStepByStep } from "./primary";
import type { GeminiTaskResponse } from "@/app/api/scan/route";

function parseFractionStr(str: string): { num: number; den: number } | null {
  if (str.includes("/")) {
    const parts = str.split("/");
    const num = parseInt(parts[0], 10);
    const den = parseInt(parts[1], 10);
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      return { num, den };
    }
  } else {
    const num = parseInt(str, 10);
    if (!isNaN(num)) {
      return { num, den: 1 };
    }
  }
  return null;
}

/**
 * Generuje pełny proces rozwiązywania zadania krok po kroku (lokalnie bez AI),
 * gwarantując że uczeń zawsze zobaczy dane, wzory, obliczenia pośrednie i wynik.
 */
export function solveTaskWithFullProcess(
  rawInput: string,
  instruction?: string
): GeminiTaskResponse | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // 1. Sprawdzamy czy to równanie z x (np. "2x^2 - 4x - 6 = 0" lub "3x + 5 = 14")
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

  // 2. Sprawdzamy czy to dodawanie/odejmowanie/mnożenie/dzielenie ułamków zwykłych
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

  // 3. Ogólne wyrażenie arytmetyczne / naukowe
  const evalRes = evaluateExpression(trimmed, { angleMode: "deg" });
  if (evalRes.status === "ok") {
    const title = instruction?.trim()
      ? `${instruction.trim()} — Obliczenia arytmetyczne`
      : "Wartość wyrażenia arytmetycznego";

    const givenData = [`Wyrażenie: ${trimmed}`];
    const appliedFormulas = ["Kolejność wykonywania działań: nawiasy, potęgowanie, mnożenie/dzielenie, dodawanie/odejmowanie"];

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
