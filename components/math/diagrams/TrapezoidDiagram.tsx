interface TrapezoidDiagramProps {
  a?: number;
  b?: number;
  h?: number;
  className?: string;
}

export function TrapezoidDiagram({ a, b, h, className = "" }: TrapezoidDiagramProps) {
  const displayA = a !== undefined && !isNaN(a) && a > 0 ? a : "a";
  const displayB = b !== undefined && !isNaN(b) && b > 0 ? b : "b";
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
          <linearGradient id="trapezoidGrad" x1="130" y1="35" x2="130" y2="145" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284c7" stopOpacity="0.25" />
            <stop stopColor="#0369a1" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Trapez obrys i wypełnienie */}
        <polygon
          points="30,145 230,145 175,40 75,40"
          className="stroke-sky-600 dark:stroke-sky-400"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="url(#trapezoidGrad)"
        />

        {/* Wysokość h z lewego górnego wierzchołka */}
        <line
          x1="75"
          y1="40"
          x2="75"
          y2="145"
          className="stroke-amber-500 dark:stroke-amber-400"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Kąt prosty */}
        <path
          d="M 75 133 L 87 133 L 87 145"
          className="stroke-amber-600 dark:stroke-amber-400"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="81" cy="139" r="1.5" className="fill-amber-600 dark:fill-amber-400" />

        {/* Wierzchołki */}
        <circle cx="30" cy="145" r="3" className="fill-sky-600 dark:fill-sky-400" />
        <circle cx="230" cy="145" r="3" className="fill-sky-600 dark:fill-sky-400" />
        <circle cx="175" cy="40" r="3" className="fill-sky-600 dark:fill-sky-400" />
        <circle cx="75" cy="40" r="3" className="fill-sky-600 dark:fill-sky-400" />

        {/* Etykieta górnej podstawy b */}
        <rect x="102" y="18" width="46" height="22" rx="6" className="fill-sky-100/90 dark:fill-sky-950/80 stroke-sky-300 dark:stroke-sky-700" strokeWidth="1" />
        <text
          x="125"
          y="33"
          textAnchor="middle"
          className="fill-sky-800 text-[11px] font-bold dark:fill-sky-300"
        >
          b = {displayB}
        </text>

        {/* Etykieta wysokości h */}
        <rect x="80" y="80" width="46" height="22" rx="6" className="fill-amber-100/90 dark:fill-amber-950/80 stroke-amber-300 dark:stroke-amber-700" strokeWidth="1" />
        <text
          x="103"
          y="95"
          textAnchor="middle"
          className="fill-amber-800 text-[11px] font-bold dark:fill-amber-300"
        >
          h = {displayH}
        </text>

        {/* Etykieta dolnej podstawy a */}
        <rect x="107" y="148" width="46" height="22" rx="6" className="fill-sky-100/90 dark:fill-sky-950/80 stroke-sky-300 dark:stroke-sky-700" strokeWidth="1" />
        <text
          x="130"
          y="163"
          textAnchor="middle"
          className="fill-sky-800 text-[11px] font-bold dark:fill-sky-300"
        >
          a = {displayA}
        </text>
      </svg>

      <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-800 dark:text-sky-300">
        <span>Wzór:</span>
        <code className="font-mono text-sky-700 dark:text-sky-200">P = [(a + b) · h] / 2</code>
      </div>
    </div>
  );
}
