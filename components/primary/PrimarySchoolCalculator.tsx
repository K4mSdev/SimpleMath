"use client";

import { useState } from "react";
import { FractionsModule } from "./modules/FractionsModule";
import { GcdLcmModule } from "./modules/GcdLcmModule";
import { PercentagesModule } from "./modules/PercentagesModule";
import { RootsModule } from "./modules/RootsModule";
import { GeometrySpModule } from "./modules/GeometrySpModule";
import { SpeedModule } from "./modules/SpeedModule";
import { Car, Divide, Hash, Percent, Shapes, Sparkles } from "lucide-react";

export type PrimaryTab = "fractions" | "gcd_lcm" | "percentages" | "roots" | "geometry_sp" | "speed";

export function PrimarySchoolCalculator() {
  const [tab, setTab] = useState<PrimaryTab>("fractions");

  return (
    <div className="space-y-6">
      {/* Pasek modułów dla klas 4-8 */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
        <button
          type="button"
          onClick={() => setTab("fractions")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tab === "fractions"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Divide className="h-4 w-4" />
          <span>Ułamki Krok po Kroku</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("gcd_lcm")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tab === "gcd_lcm"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Hash className="h-4 w-4" />
          <span>NWD, NWW i Czynniki</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("percentages")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tab === "percentages"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Percent className="h-4 w-4" />
          <span>Procenty (E8)</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("roots")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tab === "roots"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Wyłączanie przed pierwiastek</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("geometry_sp")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tab === "geometry_sp"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Shapes className="h-4 w-4" />
          <span>Pola Figur (SP)</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("speed")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tab === "speed"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Car className="h-4 w-4" />
          <span>Prędkość, Droga, Czas</span>
        </button>
      </div>

      {/* Aktywny widok modułu */}
      {tab === "fractions" && <FractionsModule />}
      {tab === "gcd_lcm" && <GcdLcmModule />}
      {tab === "percentages" && <PercentagesModule />}
      {tab === "roots" && <RootsModule />}
      {tab === "geometry_sp" && <GeometrySpModule />}
      {tab === "speed" && <SpeedModule />}
    </div>
  );
}
