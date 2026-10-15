interface CircleDiagramProps {
  r?: number;
  className?: string;
}

export function CircleDiagram({ r, className = "" }: CircleDiagramProps) {
  const displayR = r !== undefined && !isNaN(r) && r > 0 ? r : "r";

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl bg-zinc-50/80 p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-950/60 dark:ring-zinc-800 ${className}`}>
      <svg
        viewBox="0 0 260 175"
        className="h-44 w-full max-w-[280px] drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="circleGrad" cx="130" cy="85" r="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" stopOpacity="0.25" />
            <stop stopColor="#4338ca" stopOpacity="0.06" />
          </radialGradient>
        </defs>

        {/* Koło */}
        <circle
          cx="130"
          cy="85"
          r="62"
          className="stroke-indigo-600 dark:stroke-indigo-400"
          strokeWidth="2.5"
          fill="url(#circleGrad)"
        />

        {/* Średnica d (lewa część przerywana) */}
        <line
          x1="68"
          y1="85"
          x2="130"
          y2="85"
          className="stroke-indigo-400/50 dark:stroke-indigo-500/50"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Promień r (prawa część ciągła ze strzałką/podkreśleniem) */}
        <line
          x1="130"
          y1="85"
          x2="192"
          y2="85"
          className="stroke-amber-500 dark:stroke-amber-400"
          strokeWidth="2.5"
        />

        {/* Środek O */}
        <circle cx="130" cy="85" r="3.5" className="fill-indigo-700 dark:fill-indigo-300" />
        <text
          x="125"
          y="77"
          className="fill-indigo-800 text-[11px] font-bold dark:fill-indigo-300"
        >
          O
        </text>

        {/* Punkt na okręgu */}
        <circle cx="192" cy="85" r="3" className="fill-amber-500 dark:fill-amber-400" />

        {/* Etykieta promienia r */}
        <rect x="145" y="60" width="44" height="20" rx="6" className="fill-amber-100/95 dark:fill-amber-950/85 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1" />
        <text
          x="167"
          y="74"
          textAnchor="middle"
          className="fill-amber-800 text-[11px] font-bold dark:fill-amber-300"
        >
          r = {displayR}
        </text>

        {/* Etykieta średnicy d */}
        <text
          x="90"
          y="102"
          textAnchor="middle"
          className="fill-indigo-500 text-[10px] font-semibold dark:fill-indigo-400"
        >
          d = 2r
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <div className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-800 dark:text-indigo-300">
          <span>Pole:</span>{" "}
          <code className="font-mono text-indigo-700 dark:text-indigo-200">P = π · r²</code>
        </div>
        <div className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <span>Obwód:</span>{" "}
          <code className="font-mono text-emerald-700 dark:text-emerald-200">L = 2πr</code>
        </div>
      </div>
    </div>
  );
}
