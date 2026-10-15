interface TriangleDiagramProps {
  a?: number;
  h?: number;
  className?: string;
}

export function TriangleDiagram({ a, h, className = "" }: TriangleDiagramProps) {
  const displayA = a !== undefined && !isNaN(a) && a > 0 ? a : "a";
  const displayH = h !== undefined && !isNaN(h) && h > 0 ? h : "h";

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl bg-zinc-50/80 p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-950/60 dark:ring-zinc-800 ${className}`}>
      <svg
        viewBox="0 0 260 170"
        className="h-44 w-full max-w-[280px] drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="triangleGrad" x1="130" y1="25" x2="130" y2="145" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10b981" stopOpacity="0.25" />
            <stop stopColor="#059669" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Trójkąt wypełnienie i obrys */}
        <polygon
          points="35,145 225,145 135,30"
          className="stroke-emerald-600 dark:stroke-emerald-400"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="url(#triangleGrad)"
        />

        {/* Wysokość h (linia przerywana) */}
        <line
          x1="135"
          y1="30"
          x2="135"
          y2="145"
          className="stroke-amber-500 dark:stroke-amber-400"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Kąt prosty przy wysokości */}
        <path
          d="M 135 133 L 147 133 L 147 145"
          className="stroke-amber-600 dark:stroke-amber-400"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="141" cy="139" r="1.5" className="fill-amber-600 dark:fill-amber-400" />

        {/* Wierzchołki */}
        <circle cx="35" cy="145" r="3" className="fill-emerald-600 dark:fill-emerald-400" />
        <circle cx="225" cy="145" r="3" className="fill-emerald-600 dark:fill-emerald-400" />
        <circle cx="135" cy="30" r="3" className="fill-emerald-600 dark:fill-emerald-400" />

        {/* Etykieta wysokości h */}
        <rect x="140" y="75" width="46" height="22" rx="6" className="fill-amber-100/90 dark:fill-amber-950/80 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1" />
        <text
          x="163"
          y="90"
          textAnchor="middle"
          className="fill-amber-800 text-[11px] font-bold dark:fill-amber-300"
        >
          h = {displayH}
        </text>

        {/* Etykieta podstawy a */}
        <rect x="107" y="148" width="46" height="22" rx="6" className="fill-emerald-100/90 dark:fill-emerald-950/80 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
        <text
          x="130"
          y="163"
          textAnchor="middle"
          className="fill-emerald-800 text-[11px] font-bold dark:fill-emerald-300"
        >
          a = {displayA}
        </text>
      </svg>

      <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
        <span>Wzór:</span>
        <code className="font-mono text-emerald-700 dark:text-emerald-200">P = (a · h) / 2</code>
      </div>
    </div>
  );
}
