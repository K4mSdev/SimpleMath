interface SpeedTriangleDiagramProps {
  active: "v" | "s" | "t";
  s?: number | string;
  v?: number | string;
  t?: number | string;
  className?: string;
}

export function SpeedTriangleDiagram({
  active,
  s,
  v,
  t,
  className = "",
}: SpeedTriangleDiagramProps) {
  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl bg-zinc-50/80 p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-950/60 dark:ring-zinc-800 ${className}`}>
      <svg
        viewBox="0 0 260 175"
        className="h-44 w-full max-w-[280px] drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Główny trójkąt obrys */}
        <polygon
          points="25,150 235,150 130,20"
          className="stroke-zinc-300 dark:stroke-zinc-700"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Pozioma linia dzieląca (oznacza kreskę ułamkową / dzielenie) */}
        <line
          x1="67"
          y1="95"
          x2="193"
          y2="95"
          className="stroke-zinc-400 dark:stroke-zinc-600"
          strokeWidth="2.5"
        />

        {/* Pionowa linia dzieląca na dole (oznacza mnożenie) */}
        <line
          x1="130"
          y1="95"
          x2="130"
          y2="150"
          className="stroke-zinc-400 dark:stroke-zinc-600"
          strokeWidth="2.5"
        />

        {/* Symbol dzielenia na linii poziomej */}
        <rect x="180" y="87" width="28" height="16" rx="4" className="fill-zinc-200/80 dark:fill-zinc-800/80" />
        <text x="194" y="99" textAnchor="middle" className="fill-zinc-600 text-[10px] font-bold dark:fill-zinc-400">÷</text>

        {/* Symbol mnożenia na linii pionowej */}
        <rect x="117" y="115" width="26" height="16" rx="4" className="fill-zinc-200/80 dark:fill-zinc-800/80" />
        <text x="130" y="127" textAnchor="middle" className="fill-zinc-600 text-[10px] font-bold dark:fill-zinc-400">·</text>

        {/* Sekcja GÓRA: Droga s */}
        <polygon
          points="67,95 193,95 130,20"
          className={`cursor-pointer transition-colors ${
            active === "s"
              ? "fill-emerald-500/25 stroke-emerald-600 dark:stroke-emerald-400"
              : "fill-zinc-100/50 hover:fill-zinc-200/40 dark:fill-zinc-900/40"
          }`}
          strokeWidth={active === "s" ? 2.5 : 0}
        />
        <text
          x="130"
          y="68"
          textAnchor="middle"
          className={`text-lg font-black ${
            active === "s"
              ? "fill-emerald-700 dark:fill-emerald-300"
              : "fill-zinc-600 dark:fill-zinc-400"
          }`}
        >
          s
        </text>
        <text
          x="130"
          y="82"
          textAnchor="middle"
          className="fill-zinc-400 text-[9px] font-semibold dark:fill-zinc-500"
        >
          {s ? `(${s} km)` : "droga"}
        </text>

        {/* Sekcja DÓŁ-LEWO: Prędkość v */}
        <polygon
          points="25,150 130,150 130,95 67,95"
          className={`cursor-pointer transition-colors ${
            active === "v"
              ? "fill-emerald-500/25 stroke-emerald-600 dark:stroke-emerald-400"
              : "fill-zinc-100/50 hover:fill-zinc-200/40 dark:fill-zinc-900/40"
          }`}
          strokeWidth={active === "v" ? 2.5 : 0}
        />
        <text
          x="80"
          y="126"
          textAnchor="middle"
          className={`text-lg font-black ${
            active === "v"
              ? "fill-emerald-700 dark:fill-emerald-300"
              : "fill-zinc-600 dark:fill-zinc-400"
          }`}
        >
          v
        </text>
        <text
          x="80"
          y="140"
          textAnchor="middle"
          className="fill-zinc-400 text-[9px] font-semibold dark:fill-zinc-500"
        >
          {v ? `(${v} km/h)` : "prędkość"}
        </text>

        {/* Sekcja DÓŁ-PRAWO: Czas t */}
        <polygon
          points="130,150 235,150 193,95 130,95"
          className={`cursor-pointer transition-colors ${
            active === "t"
              ? "fill-emerald-500/25 stroke-emerald-600 dark:stroke-emerald-400"
              : "fill-zinc-100/50 hover:fill-zinc-200/40 dark:fill-zinc-900/40"
          }`}
          strokeWidth={active === "t" ? 2.5 : 0}
        />
        <text
          x="180"
          y="126"
          textAnchor="middle"
          className={`text-lg font-black ${
            active === "t"
              ? "fill-emerald-700 dark:fill-emerald-300"
              : "fill-zinc-600 dark:fill-zinc-400"
          }`}
        >
          t
        </text>
        <text
          x="180"
          y="140"
          textAnchor="middle"
          className="fill-zinc-400 text-[9px] font-semibold dark:fill-zinc-500"
        >
          {t ? `(${t} h)` : "czas"}
        </text>
      </svg>

      <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
        <span>Aktywny wzór:</span>
        <code className="font-mono text-emerald-700 dark:text-emerald-200">
          {active === "v" && "v = s / t"}
          {active === "s" && "s = v · t"}
          {active === "t" && "t = s / v"}
        </code>
      </div>
    </div>
  );
}
