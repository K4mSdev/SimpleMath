"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Smartphone,
  Apple,
  Share,
  PlusSquare,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
  ShieldCheck,
  Camera,
  Layers,
  ArrowRight,
} from "lucide-react";

interface MobileDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDownloadModal({ isOpen, onClose }: MobileDownloadModalProps) {
  const [activeTab, setActiveTab] = useState<"android" | "ios">("android");

  // Wykryj system operacyjny użytkownika, by automatycznie otworzyć właściwą zakładkę
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || "";
      if (/iPad|iPhone|iPod/.test(ua)) {
        setActiveTab("ios");
      } else if (/Android/.test(ua)) {
        setActiveTab("android");
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const githubReleasesUrl = "https://github.com/K4mSdev/SimpleMath/releases";
  const apkDownloadUrl = "https://github.com/K4mSdev/SimpleMath/releases/latest/download/SimpleMath.apk";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900"
      >
        {/* NAGŁÓWEK MODALA */}
        <div className="relative border-b border-zinc-100 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-6 py-5 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h2 id="mobile-modal-title" className="text-xl font-bold text-zinc-900 dark:text-white">
                  Pobierz SimpleMath na telefon
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Darmowa aplikacja na Androida i iPhone&apos;a z obsługą aparatu
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zamknij okno"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* PRZEŁĄCZNIK ZAKŁADEK (ANDROID vs IPHONE) */}
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-zinc-200/70 p-1 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab("android")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                activeTab === "android"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-zinc-900 dark:text-emerald-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <span className="text-base leading-none">🤖</span>
              <span>Android (.APK)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ios")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                activeTab === "ios"
                  ? "bg-white text-indigo-700 shadow-sm dark:bg-zinc-900 dark:text-indigo-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <Apple className="h-4 w-4" />
              <span>iPhone / iOS</span>
            </button>
          </div>
        </div>

        {/* ZAWARTOŚĆ ZAKŁADEK */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "android" ? (
            <div className="space-y-5">
              {/* Baner pobierania APK */}
              <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/60 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-950/20">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">
                  Instalator Android (.APK)
                </h3>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                  Pobierz plik instalacyjny skompilowany bezpośrednio z kodu na GitHubie. Bezpośrednia instalacja (sideloading) bez sklepu Play.
                </p>

                <div className="mt-4 flex flex-col sm:flex-row gap-2.5 justify-center">
                  <a
                    href={apkDownloadUrl}
                    download="SimpleMath.apk"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-98"
                  >
                    <Download className="h-4 w-4" />
                    <span>Pobierz SimpleMath.apk</span>
                  </a>
                  <a
                    href={githubReleasesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <span>Wydania GitHub</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Instrukcja krok po kroku */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Jak zainstalować na telefonie Android:
                </h4>
                <ol className="mt-3 space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
                      1
                    </span>
                    <div>
                      <strong className="text-zinc-900 dark:text-white">Pobierz plik APK:</strong> Kliknij zielony przycisk powyżej lub przejdź do GitHub Releases. Przeglądarka zapyta o potwierdzenie pobierania.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
                      2
                    </span>
                    <div>
                      <strong className="text-zinc-900 dark:text-white">Otwórz pobrany plik:</strong> Po pobraniu kliknij powiadomienie lub znajdź plik <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">SimpleMath.apk</code> w katalogu Pobrane.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
                      3
                    </span>
                    <div>
                      <strong className="text-zinc-900 dark:text-white">Zezwól na instalację:</strong> Jeśli telefon wyświetli komunikat o nieznanych źródłach, wybierz <em>„Ustawienia”</em> $\to$ <em>„Zezwalaj z tego źródła”</em> i kliknij <em>„Zainstaluj”</em>.
                    </div>
                  </li>
                </ol>
              </div>

              {/* Zalety */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="rounded-xl border border-zinc-100 p-2.5 dark:border-zinc-800">
                  <ShieldCheck className="mx-auto h-4 w-4 text-emerald-500" />
                  <div className="mt-1 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">100% Bezpieczna</div>
                  <div className="text-[10px] text-zinc-500">Open source na GitHub</div>
                </div>
                <div className="rounded-xl border border-zinc-100 p-2.5 dark:border-zinc-800">
                  <Camera className="mx-auto h-4 w-4 text-emerald-500" />
                  <div className="mt-1 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">Dostęp do aparatu</div>
                  <div className="text-[10px] text-zinc-500">Szybkie skanowanie zadań</div>
                </div>
                <div className="rounded-xl border border-zinc-100 p-2.5 dark:border-zinc-800">
                  <Layers className="mx-auto h-4 w-4 text-emerald-500" />
                  <div className="mt-1 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">Tryb offline</div>
                  <div className="text-[10px] text-zinc-500">Wbudowany silnik CKE</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Opcja 1: Błyskawiczna instalacja PWA na iPhone */}
              <div className="rounded-2xl border-2 border-indigo-500/30 bg-indigo-50/60 p-5 dark:border-indigo-500/20 dark:bg-indigo-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                    <Apple className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      Instalacja na iPhone (Safari PWA)
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      Zainstaluj jako aplikację natywną na pełnym ekranie w 10 sekund – bez kabli i bez App Store!
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 rounded-xl bg-white/90 p-3 shadow-sm dark:bg-zinc-800/80">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs dark:bg-indigo-900/60 dark:text-indigo-300">
                      1
                    </div>
                    <div className="text-xs text-zinc-700 dark:text-zinc-300">
                      Otwórz tę stronę w przeglądarce <strong>Safari</strong> na swoim iPhone lub iPadzie.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-white/90 p-3 shadow-sm dark:bg-zinc-800/80">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs dark:bg-indigo-900/60 dark:text-indigo-300">
                      <Share className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xs text-zinc-700 dark:text-zinc-300">
                      Dotknij przycisku <strong>Udostępnij</strong> (ikona kwadratu ze strzałką w górę na dolnym pasku Safari).
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-white/90 p-3 shadow-sm dark:bg-zinc-800/80">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs dark:bg-indigo-900/60 dark:text-indigo-300">
                      <PlusSquare className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xs text-zinc-700 dark:text-zinc-300">
                      Przewiń w dół i wybierz opcję <strong>„Do ekranu początkowego”</strong> (<em>Add to Home Screen</em>).
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-white/90 p-3 shadow-sm dark:bg-zinc-800/80">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs dark:bg-indigo-900/60 dark:text-indigo-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <div className="text-xs text-zinc-700 dark:text-zinc-300">
                      Kliknij <strong>„Dodaj”</strong>. Aplikacja SimpleMath pojawi się obok Twoich innych aplikacji, działa w trybie pełnoekranowym i ma pełny dostęp do aparatu!
                    </div>
                  </div>
                </div>
              </div>

              {/* Opcja 2: Projekt Xcode iOS na GitHub */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                        Projekt natywny Xcode (katalog ios/)
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Dla użytkowników Mac z programem Xcode
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://github.com/K4mSdev/SimpleMath/tree/main/ios"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <span>Zobacz w GitHub</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Repozytorium zawiera kompletny projekt Xcode Capacitor w katalogu <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">ios/</code>. Uruchom <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">npx cap open ios</code>, aby otworzyć projekt w Xcode i wgrać na telefon przez USB.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* STOPKA MODALA */}
        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <a
            href="https://github.com/K4mSdev/SimpleMath"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>K4mSdev/SimpleMath na GitHubie</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
