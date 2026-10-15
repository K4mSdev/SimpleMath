interface RightTriangleDiagramProps {
  a?: number | string;
  b?: number | string;
  c?: number | string;
  showTrig?: boolean;
  className?: string;
}

export function RightTriangleDiagram({
  a,
  b,
  c,
  showTrig = false,
  className = "",
}: RightTriangleDiagramProps) {
  const displayA = a !== undefined && a !== "" ? a : "a";
  const displayB = b !== undefined && b !== "" ? b : "b";
  const displayC = c !== undefined && c !== "" ? c : "c";

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl bg-zinc-50/80 p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-950/60 dark:ring-zinc-800 ${className}`}>
      <svg
        viewBox="0 0 270 175"
        className="h-44 w-full max-w-[290px] drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="rightTriangleGrad" x1="45" y1="25" x2="225" y2="145" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" stopOpacity="0.25" />
            <stop stopColor="#4f46e5" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Trójkąt prostokątny */}
        <polygon
          points="45,145 235,145 45,25"
          className="stroke-indigo-600 dark:stroke-indigo-400"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="url(#rightTriangleGrad)"
        />

        {/* Kąt prosty przy wierzchołku (45, 145) */}
        <path
          d="M 45 131 L 59 131 L 59 145"
          className="stroke-indigo-700 dark:stroke-indigo-300"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="52" cy="138" r="1.5" className="fill-indigo-700 dark:fill-indigo-300" />

        {/* Łuk kąta alfa przy (235, 145) */}
        {showTrig && (
          <>
            <path
              d="M 205 145 A 30 30 0 0 0 213 131"
              className="stroke-amber-500 dark:stroke-amber-400"
              strokeWidth="1.75"
              fill="none"
            />
            <text
              x="193"
              y="138"
              className="fill-amber-600 text-[11px] font-bold dark:fill-amber-400"
            >
              α
            </text>
          </>
        )}

        {/* Wierzchołki */}
        <circle cx="45" cy="145" r="3" className="fill-indigo-600 dark:fill-indigo-400" />
        <circle cx="235" cy="145" r="3" className="fill-indigo-600 dark:fill-indigo-400" />
        <circle cx="45" cy="25" r="3" className="fill-indigo-600 dark:fill-indigo-400" />

        {/* Przyprostokątna pionowa a */}
        <rect x="2" y="75" width="40" height="22" rx="6" className="fill-indigo-100/95 dark:fill-indigo-950/85 stroke-indigo-300 dark:stroke-indigo-700" strokeWidth="1" />
        <text
          x="22"
          y="90"
          textAnchor="middle"
          className="fill-indigo-800 text-[11px] font-bold dark:fill-indigo-300"
        >
          {displayA}
        </text>

        {/* Przyprostokątna pozioma b */}
        <rect x="120" y="148" width="40" height="22" rx="6" className="fill-indigo-100/95 dark:fill-indigo-950/85 stroke-indigo-300 dark:stroke-indigo-700" strokeWidth="1" />
        <text
          x="140"
          y="163"
          textAnchor="middle"
          className="fill-indigo-800 text-[11px] font-bold dark:fill-indigo-300"
        >
          {displayB}
        </text>

        {/* Przeciwprostokątna c */}
        <rect x="135" y="65" width="46" height="22" rx="6" className="fill-amber-100/95 dark:fill-amber-950/85 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1" />
        <text
          x="158"
          y="80"
          textAnchor="middle"
          className="fill-amber-800 text-[11px] font-bold dark:fill-amber-300"
        >
          c = {displayC}
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <div className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-800 dark:text-indigo-300">
          <span>Pitagoras:</span>{" "}
          <code className="font-mono text-indigo-700 dark:text-indigo-200">a² + b² = c²</code>
        </div>
        {showTrig && (
          <div className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <code className="font-mono">sin α = a/c, tg α = a/b</code>
          </div>
        )}
      </div>
    </div>
  );
}
