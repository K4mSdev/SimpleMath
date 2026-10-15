"use client";

import { useState } from "react";
import { Check, Clock, Copy, Trash2 } from "lucide-react";
import { MathTex } from "@/components/math/MathTex";
import type { HistoryEntry } from "@/lib/storage/calculator-store";

interface HistoryProps {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function History({ entries, onSelect, onDelete, onClear }: HistoryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <aside className="flex max-h-[640px] flex-col rounded-2xl bg-white p-4 ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
          <Clock className="h-4 w-4" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Historia</h2>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
          >
            <Trash2 className="h-3 w-3" />
            Wyczyść
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center text-sm text-zinc-400">
          <Clock className="mb-2 h-8 w-8 stroke-1 text-zinc-300 dark:text-zinc-600" />
          <p>Brak wcześniejszych obliczeń.</p>
          <p className="mt-1 text-xs text-zinc-400">Wykonaj działanie, aby zapisać je na liście.</p>
        </div>
      ) : (
        <ul className="-mx-2 flex-1 space-y-1.5 overflow-y-auto px-1">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="group relative flex items-center justify-between rounded-xl p-2 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <button
                type="button"
                onClick={() => onSelect(entry)}
                title="Wstaw to działanie ponownie"
                className="w-full text-left"
              >
                <div className="text-xs font-mono text-zinc-500">
                  <MathTex tex={entry.inputTex} />
                </div>
                <div className="mt-0.5 text-base font-medium text-zinc-900 dark:text-zinc-100">
                  <MathTex tex={entry.resultTex} />
                </div>
              </button>

              <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => copyToClipboard(entry.resultText, entry.id, e)}
                  title="Kopiuj wynik"
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                >
                  {copiedId === entry.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry.id);
                  }}
                  title="Usuń z historii"
                  className="rounded p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
