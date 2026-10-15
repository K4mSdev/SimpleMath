interface RhombusDiagramProps {
  e?: number;
  f?: number;
  className?: string;
}

export function RhombusDiagram({ e, f, className = "" }: RhombusDiagramProps) {
  const displayE = e !== undefined && !isNaN(e) && e > 0 ? e : "e";
  const displayF = f !== undefined && !isNaN(f) && f > 0 ? f : "f";

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl bg-zinc-50/80 p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-950/60 dark:ring-zinc-800 ${className}`}>
      <svg
        viewBox="0 0 260 170"
        className="h-44 w-full max-w-[280px] drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="rhombusGrad" x1="130" y1="20" x2="130" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" stopOpacity="0.25" />
            <stop stopColor="#6d28d9" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Romb obrys i wypełnienie */}
        <polygon
          points="130,15 225,85 130,155 35,85"
          className="stroke-purple-600 dark:stroke-purple-400"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="url(#rhombusGrad)"
        />

        {/* Przekątna pozioma e */}
        <line
          x1="35"
          y1="85"
          x2="225"
          y2="85"
          className="stroke-indigo-500 dark:stroke-indigo-400"
          strokeWidth="1.75"
          strokeDasharray="4 3"
        />

        {/* Przekątna pionowa f */}
        <line
          x1="130"
          y1="15"
          x2="130"
          y2="155"
          className="stroke-pink-500 dark:stroke-pink-400"
          strokeWidth="1.75"
          strokeDasharray="4 3"
        />

        {/* Kąt prosty na przecięciu przekątnych (130, 85) */}
        <path
          d="M 130 75 L 140 75 L 140 85"
          className="stroke-purple-600 dark:stroke-purple-400"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="135" cy="80" r="1.5" className="fill-purple-600 dark:fill-purple-400" />

        {/* Wierzchołki */}
        <circle cx="130" cy="15" r="3" className="fill-purple-600 dark:fill-purple-400" />
        <circle cx="225" cy="85" r="3" className="fill-purple-600 dark:fill-purple-400" />
        <circle cx="130" cy="155" r="3" className="fill-purple-600 dark:fill-purple-400" />
        <circle cx="35" cy="85" r="3" className="fill-purple-600 dark:fill-purple-400" />

        {/* Etykieta przekątnej poziomej e */}
        <rect x="165" y="65" width="46" height="22" rx="6" className="fill-indigo-100/95 dark:fill-indigo-950/85 stroke-indigo-300 dark:stroke-indigo-700" strokeWidth="1" />
        <text
          x="188"
          y="80"
          textAnchor="middle"
          className="fill-indigo-800 text-[11px] font-bold dark:fill-indigo-300"
        >
          e = {displayE}
        </text>

        {/* Etykieta przekątnej pionowej f */}
        <rect x="75" y="105" width="46" height="22" rx="6" className="fill-pink-100/95 dark:fill-pink-950/85 stroke-pink-300 dark:stroke-pink-700" strokeWidth="1" />
        <text
          x="98"
          y="120"
          textAnchor="middle"
          className="fill-pink-800 text-[11px] font-bold dark:fill-pink-300"
        >
          f = {displayF}
        </text>
      </svg>

      <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-800 dark:text-purple-300">
        <span>Wzór:</span>
        <code className="font-mono text-purple-700 dark:text-purple-200">P = (e · f) / 2</code>
      </div>
    </div>
  );
}
