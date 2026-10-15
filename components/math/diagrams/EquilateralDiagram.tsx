interface EquilateralDiagramProps {
  a?: number;
  className?: string;
}

export function EquilateralDiagram({ a, className = "" }: EquilateralDiagramProps) {
  const displayA = a !== undefined && !isNaN(a) && a > 0 ? a : "a";

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl bg-zinc-50/80 p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-950/60 dark:ring-zinc-800 ${className}`}>
      <svg
        viewBox="0 0 260 175"
        className="h-44 w-full max-w-[280px] drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="eqGrad" x1="130" y1="20" x2="130" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" stopOpacity="0.25" />
            <stop stopColor="#4338ca" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Trójkąt równoboczny */}
        <polygon
          points="40,150 220,150 130,22"
          className="stroke-indigo-600 dark:stroke-indigo-400"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="url(#eqGrad)"
        />

        {/* Okrąg wpisany (promień r = h/3) */}
        <circle
          cx="130"
          cy="107"
          r="43"
          className="stroke-emerald-500/60 dark:stroke-emerald-400/60"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Wysokość h (linia przerywana) */}
        <line
          x1="130"
          y1="22"
          x2="130"
          y2="150"
          className="stroke-amber-500 dark:stroke-amber-400"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Kąt prosty przy podstawie */}
        <path
          d="M 130 138 L 142 138 L 142 150"
          className="stroke-amber-600 dark:stroke-amber-400"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Środek ciężkości / okręgów S (130, 107) */}
        <circle cx="130" cy="107" r="3" className="fill-emerald-600 dark:fill-emerald-400" />
        <line
          x1="130"
          y1="107"
          x2="130"
          y2="150"
          className="stroke-emerald-600 dark:stroke-emerald-400"
          strokeWidth="2.5"
        />
        <text
          x="138"
          y="132"
          className="fill-emerald-700 text-[10px] font-bold dark:fill-emerald-300"
        >
          r
        </text>

        {/* Wierzchołki */}
        <circle cx="40" cy="150" r="3" className="fill-indigo-600 dark:fill-indigo-400" />
        <circle cx="220" cy="150" r="3" className="fill-indigo-600 dark:fill-indigo-400" />
        <circle cx="130" cy="22" r="3" className="fill-indigo-600 dark:fill-indigo-400" />

        {/* Etykieta boku a lewy */}
        <text
          x="70"
          y="80"
          className="fill-indigo-700 text-[11px] font-bold dark:fill-indigo-300"
        >
          a = {displayA}
        </text>

        {/* Etykieta boku a dolny */}
        <rect x="107" y="152" width="46" height="20" rx="6" className="fill-indigo-100/95 dark:fill-indigo-950/85 stroke-indigo-300 dark:stroke-indigo-700" strokeWidth="1" />
        <text
          x="130"
          y="166"
          textAnchor="middle"
          className="fill-indigo-800 text-[11px] font-bold dark:fill-indigo-300"
        >
          a = {displayA}
        </text>

        {/* Etykieta wysokości h */}
        <text
          x="142"
          y="65"
          className="fill-amber-700 text-[11px] font-bold dark:fill-amber-400"
        >
          h = (a√3)/2
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <div className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-800 dark:text-indigo-300">
          <span>Pole:</span>{" "}
          <code className="font-mono text-indigo-700 dark:text-indigo-200">P = (a²√3) / 4</code>
        </div>
        <div className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <code className="font-mono">r = h/3, R = 2h/3</code>
        </div>
      </div>
    </div>
  );
}
