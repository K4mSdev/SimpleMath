"use client";

import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import { ParabolaDiagram } from "@/components/math/diagrams";
import { solveTaskWithFullProcess } from "@/lib/math-engine/standalone-solver";

const EXAMPLES = [
  { label: "f(x) = x² - 4x + 3", expr: "f(x) = x^2 - 4x + 3" },
  { label: "f(x) = -2x² + 4x + 6", expr: "f(x) = -2x^2 + 4x + 6" },
  { label: "f(x) = x² + 2x + 1", expr: "f(x) = x^2 + 2x + 1" },
  { label: "f(x) = 2x - 6 (liniowa)", expr: "2x - 6 = 0" },
];

export function FunctionAnalysisModule({ onOpenScanner }: { onOpenScanner?: () => void }) {
  const [expr, setExpr] = useState("f(x) = x^2 - 4x + 3");
  const [solution, setSolution] = useState(() =>
    solveTaskWithFullProcess("f(x) = x^2 - 4x + 3")
  );
  const [copied, setCopied] = useState(false);

  const handleSolve = (val: string) => {
    setExpr(val);
    setSolution(solveTaskWithFullProcess(val));
  };

  const copyResult = () => {
    if (!solution) return;
    const text = `${solution.detectedTaskTitle}\n${solution.finalAnswerText}\nLaTeX: ${solution.finalAnswerTex}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6 dark:bg-zinc-900 dark:ring-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              Funkcje & Wykresy CKE Matura
            </span>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Własności Funkcji Kwadratowej i Liniowej
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Postać kanoniczna a(x-p)²+q, współrzędne wierzchołka paraboli W(p, q), oś symetrii i zbiór wartości.
            </p>
          </div>
          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Skanuj funkcję</span>
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

        {/* Wprowadzanie */}
        <div className="flex gap-2">
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSolve(expr)}
            placeholder="np. f(x) = x^2 - 4x + 3 lub y = -2x^2 + 8x - 5"
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 font-mono text-base font-bold text-zinc-900 shadow-sm outline-none placeholder:font-sans placeholder:text-sm placeholder:font-normal focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          <button
            type="button"
            onClick={() => handleSolve(expr)}
            className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Analizuj
          </button>
        </div>

        {/* Wyniki */}
        {solution && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-indigo-50/70 p-4 ring-1 ring-indigo-500/10 dark:bg-indigo-950/40 dark:ring-indigo-500/20">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Wierzchołek i Postać Kanoniczna
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
                Wykres funkcji i położenie wierzchołka W(p, q):
              </span>
              <div className="mt-2 flex justify-center">
                <ParabolaDiagram a={1} p={2} q={-1} delta={4} x1={1} x2={3} />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                Proces analizy funkcji krok po kroku:
              </h3>
              <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                {solution.steps.map((st, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {st.title}
                    </span>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{st.explanation}</p>
                    {st.formulaTex && (
                      <div className="mt-1.5 rounded-lg bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800/60">
                        <MathTex tex={st.formulaTex} display />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
