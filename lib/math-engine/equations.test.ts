import { describe, expect, it } from "vitest";
import { solveEquation, type LinearSolution, type QuadraticSolution } from "./equations";

describe("Równania liniowe", () => {
  it("2x + 4 = 10 => x = 3", () => {
    const res = solveEquation("2x + 4 = 10");
    expect(res.status).toBe("ok");
    if (res.status === "ok") {
      expect(res.data.type).toBe("linear");
      const d = res.data as LinearSolution;
      expect(d.x).toBe(3);
      expect(d.xFormatted.text).toBe("3");
    }
  });

  it("3x - 5 = 2x + 1 => x = 6", () => {
    const res = solveEquation("3x - 5 = 2x + 1");
    expect(res.status).toBe("ok");
    if (res.status === "ok") {
      const d = res.data as LinearSolution;
      expect(d.x).toBe(6);
    }
  });

  it("tożsamość: 2x = 2x", () => {
    const res = solveEquation("2x = 2x");
    expect(res.status).toBe("ok");
    if (res.status === "ok") {
      expect(res.data.type).toBe("identity");
    }
  });

  it("sprzeczność: 2x + 1 = 2x + 5", () => {
    const res = solveEquation("2x + 1 = 2x + 5");
    expect(res.status).toBe("ok");
    if (res.status === "ok") {
      expect(res.data.type).toBe("contradiction");
    }
  });
});

describe("Równania kwadratowe z Deltą", () => {
  it("x^2 - 5x + 6 = 0 => Delta = 1, x1 = 2, x2 = 3", () => {
    const res = solveEquation("x^2 - 5x + 6 = 0");
    expect(res.status).toBe("ok");
    if (res.status === "ok") {
      expect(res.data.type).toBe("quadratic");
      const d = res.data as QuadraticSolution;
      expect(d.delta).toBe(1);
      expect(d.x1).toBe(2);
      expect(d.x2).toBe(3);
      expect(d.vertex.p).toBe(2.5);
      expect(d.vertex.q).toBe(-0.25);
    }
  });

  it("x^2 - 4x + 4 = 0 => Delta = 0, x0 = 2", () => {
    const res = solveEquation("x^2 - 4x + 4 = 0");
    expect(res.status).toBe("ok");
    if (res.status === "ok") {
      const d = res.data as QuadraticSolution;
      expect(d.delta).toBe(0);
      expect(d.x0).toBe(2);
    }
  });

  it("x^2 + x + 5 = 0 => Delta = -19 (brak rozwiązań)", () => {
    const res = solveEquation("x^2 + x + 5 = 0");
    expect(res.status).toBe("ok");
    if (res.status === "ok") {
      const d = res.data as QuadraticSolution;
      expect(d.delta).toBe(-19);
      expect(d.x1).toBeUndefined();
    }
  });
});
