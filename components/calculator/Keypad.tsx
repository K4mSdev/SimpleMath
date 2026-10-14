"use client";

export type KeyAction =
  | { type: "insert"; text: string }
  | { type: "backspace" }
  | { type: "clear" }
  | { type: "evaluate" };

type Variant = "num" | "op" | "fn" | "danger" | "primary";

interface KeyDef {
  label: string;
  action: KeyAction;
  variant: Variant;
  title: string;
  wide?: boolean;
}

const insert = (text: string): KeyAction => ({ type: "insert", text });

const KEYS: KeyDef[] = [
  { label: "sin", action: insert("sin("), variant: "fn", title: "Sinus" },
  { label: "cos", action: insert("cos("), variant: "fn", title: "Cosinus" },
  { label: "tg", action: insert("tg("), variant: "fn", title: "Tangens" },
  { label: "ctg", action: insert("ctg("), variant: "fn", title: "Cotangens" },
  { label: "⌫", action: { type: "backspace" }, variant: "danger", title: "Usuń (Backspace)" },

  { label: "√", action: insert("√("), variant: "fn", title: "Pierwiastek kwadratowy" },
  { label: "x²", action: insert("^2"), variant: "fn", title: "Do kwadratu" },
  { label: "xʸ", action: insert("^"), variant: "fn", title: "Potęga" },
  { label: "(", action: insert("("), variant: "fn", title: "Nawias otwierający" },
  { label: ")", action: insert(")"), variant: "fn", title: "Nawias zamykający" },

  { label: "ln", action: insert("ln("), variant: "fn", title: "Logarytm naturalny" },
  { label: "log", action: insert("log("), variant: "fn", title: "Logarytm dziesiętny; log(x; a) – o podstawie a" },
  { label: "π", action: insert("π"), variant: "fn", title: "Liczba pi" },
  { label: "e", action: insert("e"), variant: "fn", title: "Liczba Eulera" },
  { label: "|x|", action: insert("abs("), variant: "fn", title: "Wartość bezwzględna" },

  { label: "7", action: insert("7"), variant: "num", title: "7" },
  { label: "8", action: insert("8"), variant: "num", title: "8" },
  { label: "9", action: insert("9"), variant: "num", title: "9" },
  { label: ":", action: insert(":"), variant: "op", title: "Dzielenie" },
  { label: "AC", action: { type: "clear" }, variant: "danger", title: "Wyczyść (Esc)" },

  { label: "4", action: insert("4"), variant: "num", title: "4" },
  { label: "5", action: insert("5"), variant: "num", title: "5" },
  { label: "6", action: insert("6"), variant: "num", title: "6" },
  { label: "·", action: insert("·"), variant: "op", title: "Mnożenie" },
  { label: "n!", action: insert("!"), variant: "fn", title: "Silnia" },

  { label: "1", action: insert("1"), variant: "num", title: "1" },
  { label: "2", action: insert("2"), variant: "num", title: "2" },
  { label: "3", action: insert("3"), variant: "num", title: "3" },
  { label: "−", action: insert("-"), variant: "op", title: "Odejmowanie" },
  { label: "ans", action: insert("ans"), variant: "fn", title: "Poprzedni wynik" },

  { label: "0", action: insert("0"), variant: "num", title: "0" },
  { label: ",", action: insert(","), variant: "num", title: "Przecinek dziesiętny" },
  { label: "+", action: insert("+"), variant: "op", title: "Dodawanie" },
  { label: "=", action: { type: "evaluate" }, variant: "primary", title: "Oblicz (Enter)", wide: true },
];

const VARIANT_CLASSES: Record<Variant, string> = {
  num: "bg-white text-zinc-900 text-xl font-medium hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
  op: "bg-indigo-50 text-indigo-700 text-2xl hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25",
  fn: "bg-zinc-100 text-zinc-700 text-base hover:bg-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-700",
  danger: "bg-rose-50 text-rose-600 text-base font-semibold hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25",
  primary: "bg-indigo-600 text-white text-2xl font-semibold hover:bg-indigo-500 shadow-sm shadow-indigo-600/30",
};

export function Keypad({ onAction }: { onAction: (action: KeyAction) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {KEYS.map((key) => (
        <button
          key={key.title + key.label}
          type="button"
          title={key.title}
          aria-label={key.title}
          // Nie zabieraj fokusu polu tekstowemu – kursor zostaje w miejscu.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onAction(key.action)}
          className={`h-14 rounded-xl ring-1 ring-black/5 transition active:scale-95 dark:ring-white/5 ${
            key.wide ? "col-span-2" : ""
          } ${VARIANT_CLASSES[key.variant]}`}
        >
          {key.label}
        </button>
      ))}
    </div>
  );
}
