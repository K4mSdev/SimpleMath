interface ParabolaDiagramProps {
  a?: number;
  p?: number;
  q?: number;
  delta?: number;
  x1?: number;
  x2?: number;
  x0?: number;
  className?: string;
}

export function ParabolaDiagram({
  a = 1,
  p = 2,
  q = -1,
  delta = 4,
  x1,
  x2,
  x0,
  className = "",
}: ParabolaDiagramProps) {
  const isUp = a >= 0;

  // Render a clean canonical parabola SVG with coordinate axes
  // Center of SVG is at (130, 85)
  // Vertex visual position
  const vX = 130;
  const vY = isUp ? 105 : 65;

  // Parabola curve points
  const pathD = isUp
    ? `M 50 25 Q ${vX} 145 210 25`
    : `M 50 145 Q ${vX} 25 210 145`;

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl bg-zinc-50/80 p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-950/60 dark:ring-zinc-800 ${className}`}>
      <svg
        viewBox="0 0 260 170"
        className="h-44 w-full max-w-[280px] drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Oś X */}
        <line
          x1="20"
          y1="85"
          x2="240"
          y2="85"
          className="stroke-zinc-400 dark:stroke-zinc-600"
          strokeWidth="1.5"
        />
        {/* Strzałka osi X */}
        <polygon points="240,85 233,81 233,89" className="fill-zinc-400 dark:fill-zinc-600" />
        <text x="238" y="78" className="fill-zinc-500 text-[10px] font-semibold dark:fill-zinc-400">X</text>

        {/* Oś Y */}
        <line
          x1="100"
          y1="155"
          x2="100"
          y2="15"
          className="stroke-zinc-400 dark:stroke-zinc-600"
          strokeWidth="1.5"
        />
        {/* Strzałka osi Y */}
        <polygon points="100,15 96,22 104,22" className="fill-zinc-400 dark:fill-zinc-600" />
        <text x="108" y="22" className="fill-zinc-500 text-[10px] font-semibold dark:fill-zinc-400">Y</text>

        {/* Oś symetrii x = p (linia przerywana) */}
        <line
          x1={vX}
          y1="15"
          x2={vX}
          y2="155"
          className="stroke-indigo-400/50 dark:stroke-indigo-500/50"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Wykres Paraboli */}
        <path
          d={pathD}
          className="stroke-indigo-600 dark:stroke-indigo-400"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Wierzchołek W(p, q) */}
        <circle cx={vX} cy={vY} r="3.5" className="fill-rose-500" />
        <rect x={vX - 25} y={isUp ? vY + 7 : vY - 24} width="50" height="18" rx="5" className="fill-rose-100/95 dark:fill-rose-950/85 stroke-rose-300 dark:stroke-rose-700" strokeWidth="1" />
        <text
          x={vX}
          y={isUp ? vY + 20 : vY - 11}
          textAnchor="middle"
          className="fill-rose-800 text-[9px] font-bold dark:fill-rose-300"
        >
          W({p}, {q})
        </text>

        {/* Miejsca zerowe x1, x2 jeśli delta > 0 */}
        {delta > 0 && (
          <>
            <circle cx="85" cy="85" r="3" className="fill-emerald-600 dark:fill-emerald-400" />
            <text x="80" y="78" className="fill-emerald-700 text-[10px] font-bold dark:fill-emerald-300">
              x₁{x1 !== undefined ? `=${x1}` : ""}
            </text>

            <circle cx="175" cy="85" r="3" className="fill-emerald-600 dark:fill-emerald-400" />
            <text x="170" y="78" className="fill-emerald-700 text-[10px] font-bold dark:fill-emerald-300">
              x₂{x2 !== undefined ? `=${x2}` : ""}
            </text>
          </>
        )}

        {delta === 0 && (
          <>
            <circle cx={vX} cy="85" r="3" className="fill-emerald-600 dark:fill-emerald-400" />
            <text x={vX + 6} y="80" className="fill-emerald-700 text-[10px] font-bold dark:fill-emerald-300">
              x₀{x0 !== undefined ? `=${x0}` : ""}
            </text>
          </>
        )}
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs font-semibold">
        <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-indigo-800 dark:text-indigo-300">
          Wierzchołek: <code className="font-mono">W = (p, q)</code>
        </span>
        <span className="rounded-lg bg-rose-500/10 px-2 py-0.5 text-rose-800 dark:text-rose-300">
          <code className="font-mono">p = -b/(2a), q = -Δ/(4a)</code>
        </span>
      </div>
    </div>
  );
}
