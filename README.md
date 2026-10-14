# SimpleMath 📐

Kalkulator matematyczny i naukowy stworzony z myślą o uczniach szkół podstawowych i ponadpodstawowych (przygotowany pod polski program nauczania i egzaminy CKE).

Repozytorium GitHub: [https://github.com/K4mSdev/SimpleMath](https://github.com/K4mSdev/SimpleMath)

---

## ✨ Funkcjonalności

- **Polska notacja szkolna:**
  - Przecinek dziesiętny (`2,5` lub `2.5`).
  - Dzielenie dwukropkiem lub ukośnikiem (`8:2` lub `8/2`).
  - Mnożenie kropką lub gwiazdką (`2·3` lub `2*3`).
  - Polskie nazwy funkcji trygonometrycznych: `tg`, `ctg` (oraz `sin`, `cos`).
- **Dokładne ułamki i rozwinięcia okresowe:**
  - Ułamki zwykłe i nieskracalne: `1/2 + 1/3 = 5/6`.
  - Liczby mieszane: `7/3 = 2 1/3`.
  - Dokładne rozwinięcia dziesiętne z okresem w nawiasie: `1/3 = 0,(3)`, `1/6 = 0,1(6)`.
- **Zaawansowane działania:**
  - Potęgowanie (`2^10`, `x²`) i pierwiastkowanie (`√16`).
  - Logarytmy dziesiętne (`log(100) = 2`) i o dowolnej podstawie (`log(8; 2) = 3`).
  - Logarytm naturalny (`ln(e) = 1`).
  - Trygonometria w stopniach (`DEG`) i radianach (`RAD`), z wymuszeniem stopni (`sin(30°)`).
- **Wygoda i produktywność:**
  - Podgląd wzoru na żywo w $\LaTeX$ (KaTeX).
  - Szybkie kopiowanie wyniku jako czysty tekst lub kod $\LaTeX$.
  - Historia obliczeń zapisywana lokalnie w pamięci przeglądarki (`localStorage`).
  - Możliwość ponownego wstawienia lub usunięcia dowolnego wpisu z historii.
  - Skróty klawiaturowe: `Enter` = oblicz, `Esc` = wyczyść, `Backspace` = inteligentne usuwanie funkcji.

---

## 🚀 Uruchomienie lokalne

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev
```

Aplikacja będzie dostępna pod adresem: [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testy

Projekt posiada zestaw testów jednostkowych weryfikujących poprawność matematyczną, zaokrąglenia, trygonometrię i polskie komunikaty błędów:

```bash
npm test
```

---

## 💻 Praca na Windowsie i MacBooku

1. **Na Windowsie:** Zapisujesz zmiany, robisz commit i wysyłasz do GitHuba (`git push`).
2. **Na MacBooku:**
   ```bash
   git pull
   npm install
   npm run dev
   ```
3. Materiały dodatkowe (arkusze CKE w PDF, notatki, grafiki) znajdują się w folderze **Google Drive**: `Mój dysk/MathPulse-materialy`.
