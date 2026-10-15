"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, HelpCircle, Sparkles } from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import { ParabolaDiagram } from "@/components/math/diagrams";
import { solveTaskWithFullProcess } from "@/lib/math-engine/standalone-solver";

const EXAMPLES = [
  { label: "x² - 5x + 6 > 0", expr: "x^2 - 5x + 6 > 0" },
  { label: "x² - 4 ≤ 0", expr: "x^2 - 4 <= 0" },
  { label: "-x² + 4x - 3 ≥ 0", expr: "-x^2 + 4x - 3 >= 0" },
  { label: "2x² + 3x - 5 < 0", expr: "2x^2 + 3x - 5 < 0" },
  { label: "x² + 2x + 5 > 0 (Δ < 0)", expr: "x^2 + 2x + 5 > 0" },
];

export function QuadraticInequalitiesModule({
  initialInput,
  onOpenScanner,
}: {
  initialInput?: string;
  onOpenScanner?: () => void;
}) {
  const [input, setInput] = useState(initialInput?.trim() || "x^2 - 5x + 6 > 0");
  const [solution, setSolution] = useState(() =>
    solveTaskWithFullProcess(initialInput?.trim() || "x^2 - 5x + 6 > 0")
  );
  const [showSteps, setShowSteps] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleSolve = (expr: string) => {
    setInput(expr);
    setSolution(solveTaskWithFullProcess(expr));
  };

  const copyResult = () => {
    if (!solution) return;
    const text = `Nierówność kwadratowa: ${input}\nWynik: ${solution.finalAnswerText}\nZapis LaTeX: ${solution.finalAnswerTex}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Parametry paraboli do rysunku
  let parabolaA = 1;
  let parabolaB = -5;
  let parabolaC = 6;
  const matchCoeffs = input.match(/([+-]?\d*)x\^?2?\s*([+-]\s*\d*)x?\s*([+-]\s*\d*)?/i);
  if (matchCoeffs) {
    const rawA = matchCoeffs[1];
    parabolaA = rawA === "" || rawA === "+" ? 1 : rawA === "-" ? -1 : parseFloat(rawA) || 1;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6 dark:bg-zinc-900 dark:ring-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              Pewniak Maturalny CKE (1-2 pkt)
            </span>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Nierówności Kwadratowe Krok po Kroku
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Wyznaczanie wyróżnika Δ, miejsc zerowych, analiza ramion paraboli i zapis przedziału liczbowego.
            </p>
          </div>
          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Skanuj nierówność</span>
            </button>
          )}
        </div>

        {/* Szybkie przykłady */}
        <div className="my-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-400">Przykłady CKE:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => handleSolve(ex.expr)}
              className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Pole wprowadzania */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSolve(input)}
            placeholder="np. x^2 - 5x + 6 > 0 lub -2x^2 + 8 <= 0"
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 font-mono text-base font-bold text-zinc-900 shadow-sm outline-none placeholder:font-sans placeholder:text-sm placeholder:font-normal focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          <button
            type="button"
            onClick={() => handleSolve(input)}
            className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Rozwiąż
          </button>
        </div>

        {/* Wynik i rozwiązanie */}
        {solution ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-indigo-50/70 p-4 ring-1 ring-indigo-500/10 dark:bg-indigo-950/40 dark:ring-indigo-500/20">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Zbiór rozwiązań nierówności
                </span>
                <div className="mt-1">
                  <MathTex tex={solution.finalAnswerTex} display className="text-xl font-bold" />
                </div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {solution.finalAnswerText}
                </p>
              </div>

              <button
                type="button"
                onClick={copyResult}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm ring-1 ring-black/5 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-white/10"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Skopiowano!" : "Kopiuj"}</span>
              </button>
            </div>

            {/* Rysunek paraboli */}
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                Szkic paraboli i interpretacja graficzna (CKE):
              </span>
              <div className="mt-2 flex justify-center">
                <ParabolaDiagram a={parabolaA} p={2} q={-1} delta={4} x1={2} x2={3} />
              </div>
            </div>

            {/* Kroki rozwiązania */}
            <div className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setShowSteps((prev) => !prev)}
                className="flex w-full items-center justify-between text-left text-sm font-bold text-zinc-900 dark:text-white"
              >
                <span>Pełny proces rozwiązania CKE ({solution.steps.length} kroków)</span>
                {showSteps ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
              </button>

              {showSteps && (
                <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {solution.steps.map((st, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                          {st.title}
                        </h4>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {st.explanation}
                      </p>
                      {st.formulaTex && (
                        <div className="mt-2 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
                          <MathTex tex={st.formulaTex} display />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Wpisz nierówność w postaci ax² + bx + c {">"} 0 (np. x^2 - 5x + 6 {">"} 0).</span>
          </div>
        )}
      </div>
    </div>
  );
}
