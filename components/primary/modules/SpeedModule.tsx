"use client";

import { useState } from "react";
import { MathTex } from "@/components/math/MathTex";

export function SpeedModule() {
  const [calcWhat, setCalcWhat] = useState<"v" | "s" | "t">("v");
  const [s, setS] = useState("120"); // km
  const [t, setT] = useState("2"); // h
  const [v, setV] = useState("60"); // km/h

  const sNum = parseFloat(s) || 0;
  const tNum = parseFloat(t) || 1;
  const vNum = parseFloat(v) || 0;

  let resVal = 0;
  let unit = "";
  let formula = "";
  let alternate = "";

  if (calcWhat === "v") {
    resVal = sNum / tNum;
    unit = "km/h";
    formula = `v = \\frac{s}{t} = \\frac{${sNum}\\text{ km}}{${tNum}\\text{ h}} = ${resVal}\\text{ km/h}`;
    alternate = `${(resVal / 3.6).toFixed(2).replace(".00", "")} m/s (dzielimy przez 3,6)`;
  } else if (calcWhat === "s") {
    resVal = vNum * tNum;
    unit = "km";
    formula = `s = v \\cdot t = ${vNum}\\text{ km/h} \\cdot ${tNum}\\text{ h} = ${resVal}\\text{ km}`;
  } else {
    resVal = vNum !== 0 ? sNum / vNum : 0;
    unit = "h";
    formula = `t = \\frac{s}{v} = \\frac{${sNum}\\text{ km}}{${vNum}\\text{ km/h}} = ${resVal}\\text{ h}`;
    alternate = `${Math.round(resVal * 60)} minut`;
  }

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Prędkość, Droga, Czas (Zadania z fizyki i matematyki SP)
        </h3>
        <p className="text-xs text-zinc-500">Klasyczne zadania: pociągi, samochody, rowerzyści (v = s / t).</p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setCalcWhat("v")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            calcWhat === "v" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Oblicz Prędkość (v)
        </button>
        <button
          type="button"
          onClick={() => setCalcWhat("s")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            calcWhat === "s" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Oblicz Drogę (s)
        </button>
        <button
          type="button"
          onClick={() => setCalcWhat("t")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            calcWhat === "t" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Oblicz Czas (t)
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {calcWhat !== "s" && (
          <div>
            <label className="text-xs font-semibold text-zinc-500">Droga s (km):</label>
            <input
              type="number"
              value={s}
              onChange={(e) => setS(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        )}

        {calcWhat !== "v" && (
          <div>
            <label className="text-xs font-semibold text-zinc-500">Prędkość v (km/h):</label>
            <input
              type="number"
              value={v}
              onChange={(e) => setV(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        )}

        {calcWhat !== "t" && (
          <div>
            <label className="text-xs font-semibold text-zinc-500">Czas t (godziny):</label>
            <input
              type="number"
              value={t}
              onChange={(e) => setT(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          Wynik:
        </span>
        <div className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">
          <MathTex tex={formula} />
        </div>
        {alternate && (
          <div className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            W innej jednostce: {alternate}
          </div>
        )}
      </div>
    </section>
  );
}
