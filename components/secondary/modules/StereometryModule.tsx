"use client";

import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import { solveTaskWithFullProcess } from "@/lib/math-engine/standalone-solver";

type SolidType = "cylinder" | "sphere" | "cube";

export function StereometryModule({ onOpenScanner }: { onOpenScanner?: () => void }) {
  const [solid, setSolid] = useState<SolidType>("cylinder");
  const [r, setR] = useState("3");
  const [h, setH] = useState("5");
  const [a, setA] = useState("4");
  const [copied, setCopied] = useState(false);

  const query =
    solid === "cylinder"
      ? `walec r=${r}, h=${h}`
      : solid === "sphere"
      ? `kula r=${r}`
      : `sześcian a=${a}`;

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
              Stereometria CKE Matura
            </span>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Bryły Przestrzenne: Objętość i Pole Całkowite
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Obliczanie objętości V, pola powierzchni całkowitej Pc oraz przekątnych dla brył obrotowych i wielościanów.
            </p>
          </div>
          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Skanuj bryłę</span>
            </button>
          )}
        </div>

        {/* Wybór bryły */}
        <div className="my-5 flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setSolid("cylinder")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              solid === "cylinder"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Walec
          </button>
          <button
            type="button"
            onClick={() => setSolid("sphere")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              solid === "sphere"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Kula
          </button>
          <button
            type="button"
            onClick={() => setSolid("cube")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              solid === "cube"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Sześcian
          </button>
        </div>

        {/* Wymiary */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {solid === "cylinder" && (
            <>
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Promień podstawy (r):</label>
                <input
                  type="number"
                  value={r}
                  onChange={(e) => setR(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-sm font-bold text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Wysokość walca (h):</label>
                <input
                  type="number"
                  value={h}
                  onChange={(e) => setH(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-sm font-bold text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </>
          )}

          {solid === "sphere" && (
            <div>
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Promień kuli (r):</label>
              <input
                type="number"
                value={r}
                onChange={(e) => setR(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-sm font-bold text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          )}

          {solid === "cube" && (
            <div>
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Długość krawędzi (a):</label>
              <input
                type="number"
                value={a}
                onChange={(e) => setA(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-sm font-bold text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Wyniki */}
        {solution && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-indigo-50/70 p-4 ring-1 ring-indigo-500/10 dark:bg-indigo-950/40 dark:ring-indigo-500/20">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Objętość i pole całkowite bryły
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
