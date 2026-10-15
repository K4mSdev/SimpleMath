interface ParallelogramDiagramProps {
  a?: number;
  h?: number;
  className?: string;
}

export function ParallelogramDiagram({ a, h, className = "" }: ParallelogramDiagramProps) {
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
          <linearGradient id="parallelogramGrad" x1="130" y1="35" x2="130" y2="145" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14b8a6" stopOpacity="0.25" />
            <stop stopColor="#0f766e" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Równoległobok obrys i wypełnienie */}
        <polygon
          points="30,145 190,145 230,40 70,40"
          className="stroke-teal-600 dark:stroke-teal-400"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="url(#parallelogramGrad)"
        />

        {/* Wysokość h opuszczona z wierzchołka (70, 40) na podstawę */}
        <line
          x1="70"
          y1="40"
          x2="70"
          y2="145"
          className="stroke-amber-500 dark:stroke-amber-400"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Kąt prosty przy wysokości */}
        <path
          d="M 70 133 L 82 133 L 82 145"
          className="stroke-amber-600 dark:stroke-amber-400"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="76" cy="139" r="1.5" className="fill-amber-600 dark:fill-amber-400" />

        {/* Wierzchołki */}
        <circle cx="30" cy="145" r="3" className="fill-teal-600 dark:fill-teal-400" />
        <circle cx="190" cy="145" r="3" className="fill-teal-600 dark:fill-teal-400" />
        <circle cx="230" cy="40" r="3" className="fill-teal-600 dark:fill-teal-400" />
        <circle cx="70" cy="40" r="3" className="fill-teal-600 dark:fill-teal-400" />

        {/* Etykieta wysokości h */}
        <rect x="76" y="80" width="46" height="22" rx="6" className="fill-amber-100/90 dark:fill-amber-950/80 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1" />
        <text
          x="99"
          y="95"
          textAnchor="middle"
          className="fill-amber-800 text-[11px] font-bold dark:fill-amber-300"
        >
          h = {displayH}
        </text>

        {/* Etykieta podstawy a */}
        <rect x="95" y="148" width="46" height="22" rx="6" className="fill-teal-100/90 dark:fill-teal-950/80 stroke-teal-300 dark:stroke-teal-700" strokeWidth="1" />
        <text
          x="118"
          y="163"
          textAnchor="middle"
          className="fill-teal-800 text-[11px] font-bold dark:fill-teal-300"
        >
          a = {displayA}
        </text>
      </svg>

      <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
        <span>Wzór:</span>
        <code className="font-mono text-teal-700 dark:text-teal-200">P = a · h</code>
      </div>
    </div>
  );
}
