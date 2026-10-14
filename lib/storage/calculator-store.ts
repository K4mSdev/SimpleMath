"use client";

import type { AngleMode } from "@/lib/math-engine";
import { createLocalStore } from "./local-store";

export interface HistoryEntry {
  id: string;
  input: string;
  inputTex: string;
  resultTex: string;
  resultText: string;
  createdAt: number;
}

export const HISTORY_LIMIT = 50;

const isHistory = (v: unknown): v is HistoryEntry[] =>
  Array.isArray(v) &&
  v.every((e) => typeof e === "object" && e !== null && "input" in e && "resultTex" in e);

const isAngleMode = (v: unknown): v is AngleMode => v === "deg" || v === "rad";

export const historyStore = createLocalStore<HistoryEntry[]>(
  "simplemath:history",
  [],
  isHistory,
);

export const angleModeStore = createLocalStore<AngleMode>(
  "simplemath:angle-mode",
  "deg",
  isAngleMode,
);
