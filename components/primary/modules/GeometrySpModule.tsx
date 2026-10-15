"use client";

import { useState } from "react";
import { MathTex } from "@/components/math/MathTex";

export function GeometrySpModule() {
  const [shape, setShape] = useState<"triangle" | "trapezoid" | "rhombus" | "parallelogram">("triangle");
  const [a, setA] = useState("6");
  const [b, setB] = useState("4");
  const [h, setH] = useState("5");

  const aNum = parseFloat(a) || 0;
  const bNum = parseFloat(b) || 0;
  const hNum = parseFloat(h) || 0;

  let area = 0;
  let formulaTex = "";

  if (shape === "triangle") {
    area = (aNum * hNum) / 2;
    formulaTex = `P = \\frac{a \\cdot h}{2} = \\frac{${aNum} \\cdot ${hNum}}{2} = ${area}`;
  } else if (shape === "trapezoid") {
    area = ((aNum + bNum) * hNum) / 2;
    formulaTex = `P = \\frac{(a + b) \\cdot h}{2} = \\frac{(${aNum} + ${bNum}) \\cdot ${hNum}}{2} = ${area}`;
  } else if (shape === "rhombus") {
    area = (aNum * bNum) / 2; // e * f / 2
    formulaTex = `P = \\frac{e \\cdot f}{2} = \\frac{${aNum} \\cdot ${bNum}}{2} = ${area}`;
  } else {
    area = aNum * hNum;
    formulaTex = `P = a \\cdot h = ${aNum} \\cdot ${hNum} = ${area}`;
  }

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Kalkulator Pól Figur Płaskich (Klasy 4–8)
        </h3>
        <p className="text-xs text-zinc-500">Wzory na pola trójkątów i czworokątów z podręcznika szkoły podstawowej.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShape("triangle")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            shape === "triangle" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Trójkąt
        </button>
        <button
          type="button"
          onClick={() => setShape("trapezoid")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            shape === "trapezoid" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Trapez
        </button>
        <button
          type="button"
          onClick={() => setShape("rhombus")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            shape === "rhombus" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Romb (przekątne e, f)
        </button>
        <button
          type="button"
          onClick={() => setShape("parallelogram")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
            shape === "parallelogram" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Równoległobok
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold text-zinc-500">
            {shape === "rhombus" ? "Przekątna e:" : "Podstawa a:"}
          </label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
          />
        </div>

        {shape === "trapezoid" && (
          <div>
            <label className="text-xs font-semibold text-zinc-500">Druga podstawa b:</label>
            <input
              type="number"
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        )}

        {shape === "rhombus" ? (
          <div>
            <label className="text-xs font-semibold text-zinc-500">Druga przekątna f:</label>
            <input
              type="number"
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-zinc-500">Wysokość h:</label>
            <input
              type="number"
              value={h}
              onChange={(e) => setH(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-50 px-3 py-2 text-base font-bold ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          Pole figury P:
        </span>
        <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
          <MathTex tex={formulaTex} />
        </div>
      </div>
    </section>
  );
}
