"use client";

import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import { solveTaskWithFullProcess } from "@/lib/math-engine/standalone-solver";

export function SequencesModule({ onOpenScanner }: { onOpenScanner?: () => void }) {
  const [seqType, setSeqType] = useState<"arithmetic" | "geometric">("arithmetic");
  const [a1, setA1] = useState("3");
  const [param, setParam] = useState("2"); // r dla arytmetycznego, q dla geometrycznego
  const [n, setN] = useState("10");
  const [copied, setCopied] = useState(false);

  const query =
    seqType === "arithmetic"
      ? `ciąg arytmetyczny a1=${a1}, r=${param}, n=${n}`
      : `ciąg geometryczny a1=${a1}, q=${param}, n=${n}`;

  const solution = solveTaskWithFullProcess(query);

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
              Kluczowy Dział Maturalny CKE
            </span>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Ciągi Liczbowe: Arytmetyczny i Geometryczny
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Obliczanie n-tego wyrazu aₙ, sumy wyrazów Sₙ, różnicy r oraz ilorazu q krok po kroku.
            </p>
          </div>
          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Skanuj zadanie z ciągów</span>
            </button>
          )}
        </div>

        {/* Przełącznik rodzaju ciągu */}
        <div className="my-5 flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setSeqType("arithmetic")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              seqType === "arithmetic"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Ciąg Arytmetyczny (r)
          </button>
          <button
            type="button"
            onClick={() => setSeqType("geometric")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              seqType === "geometric"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Ciąg Geometryczny (q)
          </button>
        </div>

        {/* Pola danych wejściowych */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Pierwszy wyraz (a₁)
            </label>
            <input
              type="number"
              value={a1}
              onChange={(e) => setA1(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-sm font-bold text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              {seqType === "arithmetic" ? "Różnica ciągu (r)" : "Iloraz ciągu (q)"}
            </label>
            <input
              type="number"
              value={param}
              onChange={(e) => setParam(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-sm font-bold text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Numer wyrazu / liczba wyrazów (n)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={n}
              onChange={(e) => setN(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-sm font-bold text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
        </div>

        {/* Wzory CKE do wglądu */}
        <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-800/50">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">Wzory z karty wzorów CKE:</span>
          {seqType === "arithmetic" ? (
            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
              <div>• Wzór ogólny: <MathTex tex="a_n = a_1 + (n-1)r" /></div>
              <div>• Suma n wyrazów: <MathTex tex="S_n = \frac{a_1 + a_n}{2} \cdot n" /></div>
            </div>
          ) : (
            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
              <div>• Wzór ogólny: <MathTex tex="a_n = a_1 \cdot q^{n-1}" /></div>
              <div>• Suma n wyrazów: <MathTex tex="S_n = a_1 \frac{1 - q^n}{1 - q}" /></div>
            </div>
          )}
        </div>

        {/* Wyniki */}
        {solution && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-indigo-50/70 p-4 ring-1 ring-indigo-500/10 dark:bg-indigo-950/40 dark:ring-indigo-500/20">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Wyraz n-ty oraz Suma początkowych wyrazów
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

            {/* Kroki obliczeń */}
            <div className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                Proces obliczeniowy krok po kroku:
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
