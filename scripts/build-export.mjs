import { execSync } from "node:child_process";

// Ustawienie flagi eksportu statycznego dla Next.js (generuje katalog /out)
process.env.NEXT_EXPORT = "true";

console.log("==> Rozpoczynanie budowania wersji statycznej dla aplikacji mobilnej (Capacitor/Mobile)...");

try {
  execSync("npx next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_EXPORT: "true",
    },
  });
  console.log("==> Budowanie zakończone pomyślnie. Katalog 'out' gotowy do synchronizacji Capacitor.");
} catch (error) {
  console.error("==> Błąd podczas budowania eksportu:", error);
  process.exit(1);
}
