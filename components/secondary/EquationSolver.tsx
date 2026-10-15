"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, HelpCircle, Sparkles } from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import { ParabolaDiagram } from "@/components/math/diagrams";
import { solveEquation, type EquationResult } from "@/lib/math-engine/equations";

const EXAMPLES = [
  { label: "Kwadratowe (Δ > 0)", expr: "x^2 - 5x + 6 = 0" },
  { label: "Kwadratowe (Δ = 0)", expr: "x^2 - 4x + 4 = 0" },
  { label: "Kwadratowe (Δ < 0)", expr: "x^2 + 2x + 5 = 0" },
  { label: "Liniowe CKE", expr: "2x + 8 = 14" },
  { label: "Ułamkowe / redukcja", expr: "3x - 5 = 2x + 4" },
];

export function EquationSolver() {
  const [input, setInput] = useState("x^2 - 5x + 6 = 0");
  const [result, setResult] = useState<EquationResult>(() => solveEquation("x^2 - 5x + 6 = 0"));
  const [showSteps, setShowSteps] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleSolve = (expr: string) => {
    setInput(expr);
    setResult(solveEquation(expr));
  };

  const copyResult = () => {
    if (result.status !== "ok") return;
    let text = `Rozwiązanie równania: ${input}\n`;
    if (result.data.type === "linear") {
      text += `x = ${result.data.xFormatted.text}`;
    } else if (result.data.type === "quadratic") {
      text += `Δ = ${result.data.delta}\n`;
      if (result.data.x1 !== undefined && result.data.x2 !== undefined) {
        text += `x₁ = ${result.data.x1Formatted?.text}, x₂ = ${result.data.x2Formatted?.text}\n`;
      } else if (result.data.x0 !== undefined) {
        text += `x₀ = ${result.data.x0Formatted?.text}\n`;
      }
      text += `Wierzchołek paraboli: W = (${result.data.vertex.p}, ${result.data.vertex.q})`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-black/5 sm:p-6 dark:bg-zinc-900 dark:ring-white/10">
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Kalkulator Równań i Delty (CKE)
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Rozwiązuje równania liniowe oraz kwadratowe z pełnym rozpisaniem kroków, wyróżnika Δ, wierzchołka paraboli i postaci kanonicznej.
        </p>
      </div>

      {/* Szybkie przykłady */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-zinc-400">Przykłady CKE:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.expr}
            type="button"
            onClick={() => handleSolve(ex.expr)}
            className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Pole wprowadzania */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => handleSolve(e.target.value)}
          placeholder="Wpisz równanie z x, np. x^2 - 5x + 6 = 0"
          className="flex-1 rounded-xl bg-zinc-50 px-4 py-3 font-mono text-lg text-zinc-900 ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10"
        />
        <button
          type="button"
          onClick={() => handleSolve(input)}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
        >
          Rozwiąż
        </button>
      </div>

      {/* Wynik */}
      {result.status === "error" ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
          {result.message}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Karta główna wyniku */}
          <div className="relative rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 sm:p-5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <button
              type="button"
              onClick={copyResult}
              title="Kopiuj wynik"
              className="absolute right-4 top-4 flex items-center gap-1 rounded-md bg-white/80 px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur-sm hover:bg-white dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Skopiowano</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Kopiuj</span>
                </>
              )}
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Odpowiedź końcowa
            </span>

            {result.data.type === "linear" && (
              <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                <MathTex tex={`x = ${result.data.xFormatted.tex}`} />
              </div>
            )}

            {result.data.type === "quadratic" && (
              <div className="mt-4 grid gap-5 md:grid-cols-2 md:items-center">
                <div className="space-y-3">
                  {result.data.delta > 0 && result.data.x1Formatted && result.data.x2Formatted && (
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                      <MathTex
                        tex={`x_1 = ${result.data.x1Formatted.tex}, \\quad x_2 = ${result.data.x2Formatted.tex}`}
                      />
                    </div>
                  )}
                  {result.data.delta === 0 && result.data.x0Formatted && (
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                      <MathTex tex={`x_0 = ${result.data.x0Formatted.tex}`} />
                    </div>
                  )}
                  {result.data.delta < 0 && (
                    <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
                      Brak rozwiązań w zbiorze liczb rzeczywistych (x ∈ ∅)
                    </div>
                  )}

                  {/* Kluczowe parametry CKE */}
                  <div className="flex flex-wrap gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    <span className="rounded-lg bg-white/80 px-2.5 py-1 ring-1 ring-black/5 dark:bg-zinc-900/60 dark:ring-white/10">
                      Δ = <strong>{result.data.delta}</strong>
                    </span>
                    <span className="rounded-lg bg-white/80 px-2.5 py-1 ring-1 ring-black/5 dark:bg-zinc-900/60 dark:ring-white/10">
                      W = <strong>({result.data.vertex.p}, {result.data.vertex.q})</strong>
                    </span>
                    <span className="rounded-lg bg-white/80 px-2.5 py-1 ring-1 ring-black/5 dark:bg-zinc-900/60 dark:ring-white/10">
                      Ramiona: <strong>{result.data.a > 0 ? "w górę (a > 0)" : "w dół (a < 0)"}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ParabolaDiagram
                    a={result.data.a}
                    p={result.data.vertex.p}
                    q={result.data.vertex.q}
                    delta={result.data.delta}
                    x1={result.data.x1 !== undefined ? Math.round(result.data.x1 * 100) / 100 : undefined}
                    x2={result.data.x2 !== undefined ? Math.round(result.data.x2 * 100) / 100 : undefined}
                    x0={result.data.x0 !== undefined ? Math.round(result.data.x0 * 100) / 100 : undefined}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {(result.data.type === "identity" || result.data.type === "contradiction") && (
              <div className="mt-2 text-base font-semibold text-zinc-800 dark:text-zinc-200">
                {result.data.message}
              </div>
            )}
          </div>

          {/* Przycisk rozwijania kroków */}
          <button
            type="button"
            onClick={() => setShowSteps(!showSteps)}
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            {showSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span>{showSteps ? "Ukryj kroki rozwiązania" : "Pokaż pełne rozpisanie krok po kroku"}</span>
          </button>

          {/* Rozpisanie krok po kroku */}
          {showSteps && (
            <div className="space-y-4 border-l-2 border-indigo-200 pl-4 dark:border-indigo-800">
              {result.data.steps.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{step.explanation}</p>
                  <div className="mt-1 overflow-x-auto rounded-lg bg-zinc-50 p-2.5 text-sm dark:bg-zinc-950">
                    <MathTex tex={step.tex} display />
                  </div>
                </div>
              ))}

              {/* Dodatkowe postacie funkcji kwadratowej w standardzie CKE */}
              {result.data.type === "quadratic" && (
                <div className="mt-4 rounded-xl bg-zinc-50 p-3.5 text-xs text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-300">
                  <span className="font-bold text-zinc-900 dark:text-white">
                    Postacie funkcji kwadratowej (często wymagane w poleceniach CKE):
                  </span>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <span className="text-zinc-400">Postać kanoniczna y = a(x - p)² + q:</span>
                      <div className="mt-0.5 font-mono text-sm">
                        <MathTex tex={result.data.canonicalTex} />
                      </div>
                    </div>
                    {result.data.factoredTex && (
                      <div>
                        <span className="text-zinc-400">Postać iloczynowa y = a(x - x₁)(x - x₂):</span>
                        <div className="mt-0.5 font-mono text-sm">
                          <MathTex tex={result.data.factoredTex} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
