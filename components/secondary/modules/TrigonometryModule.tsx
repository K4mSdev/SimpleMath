"use client";

import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import { solveTaskWithFullProcess } from "@/lib/math-engine/standalone-solver";

const TABLE_ANGLES = [0, 30, 45, 60, 90];

export function TrigonometryModule({ onOpenScanner }: { onOpenScanner?: () => void }) {
  const [activeTab, setActiveTab] = useState<"table" | "identity">("table");
  const [selectedAngle, setSelectedAngle] = useState(30);
  const [selectedFn, setSelectedFn] = useState<"sin" | "cos" | "tg">("sin");
  const [sinNum, setSinNum] = useState("3");
  const [sinDen, setSinDen] = useState("5");
  const [copied, setCopied] = useState(false);

  const query =
    activeTab === "table"
      ? `${selectedFn}(${selectedAngle})`
      : `sin(x) = ${sinNum}/${sinDen}`;

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
              Trygonometria Kąta Ostrego & Jedynka Trygonometryczna
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Wartości funkcji trygonometrycznych dla kątów 0°, 30°, 45°, 60°, 90° oraz zależności z jedynki trygonometrycznej.
            </p>
          </div>
          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Skanuj trygonometrię</span>
            </button>
          )}
        </div>

        {/* Zakładki */}
        <div className="my-5 flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              activeTab === "table"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Tabela wartości kątów CKE (30°, 45°, 60°)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              activeTab === "identity"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Jedynka trygonometryczna (sin²α + cos²α = 1)
          </button>
        </div>

        {/* Tryb 1: Tabela wartości kątów */}
        {activeTab === "table" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Wybierz funkcję:</span>
              {(["sin", "cos", "tg"] as const).map((fn) => (
                <button
                  key={fn}
                  type="button"
                  onClick={() => setSelectedFn(fn)}
                  className={`rounded-xl px-4 py-2 font-mono text-sm font-bold transition ${
                    selectedFn === fn
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {fn}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Wybierz kąt α:</span>
              {TABLE_ANGLES.map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => setSelectedAngle(deg)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    selectedAngle === deg
                      ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tryb 2: Jedynka trygonometryczna */}
        {activeTab === "identity" && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">
              Wpisz wartość sin α dla kąta ostrego (np. 3/5), aby obliczyć cos α oraz tg α:
            </p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">sin α =</span>
              <input
                type="number"
                value={sinNum}
                onChange={(e) => setSinNum(e.target.value)}
                placeholder="licznik"
                className="w-20 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-center font-mono text-sm font-bold text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <span className="text-lg font-bold text-zinc-400">/</span>
              <input
                type="number"
                value={sinDen}
                onChange={(e) => setSinDen(e.target.value)}
                placeholder="mianownik"
                className="w-20 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-center font-mono text-sm font-bold text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Wyniki */}
        {solution && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-indigo-50/70 p-4 ring-1 ring-indigo-500/10 dark:bg-indigo-950/40 dark:ring-indigo-500/20">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Wyznaczone wartości funkcji trygonometrycznych
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
