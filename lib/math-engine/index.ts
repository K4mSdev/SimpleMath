// Główny silnik obliczeniowy SimpleMath

// 1. Kalkulator ogólny i naukowy (Liceum / Technikum)
export { evaluateExpression, translateError } from "./evaluate";
export type {
  CalcError,
  CalcEmpty,
  CalcResult,
  CalcSuccess,
  EvaluateOptions,
  PreviousAnswer,
} from "./evaluate";
export type { AngleMode } from "./instances";
export { normalizeExpression } from "./normalize";
export { formatNumber, fractionToFormatted, exactDecimal, mixedNumber, parseFraction } from "./format";

// 2. Równania liniowe i kwadratowe z Deltą CKE
export { solveEquation } from "./equations";
export type {
  EquationResult,
  EquationStep,
  EquationType,
  LinearSolution,
  QuadraticSolution,
  SpecialSolution,
} from "./equations";

// 3. Moduły szkoły podstawowej (Klasy 4–8)
export {
  gcd,
  lcm,
  primeFactors,
  computeGcdLcm,
  calculateFractionsStepByStep,
  extractRootFactor,
  computePercentage,
} from "./primary";
export type {
  GcdLcmResult,
  FractionStepResult,
  RootFactorResult,
  PercentResult,
  PercentCalcMode,
  StepItem,
} from "./primary";
