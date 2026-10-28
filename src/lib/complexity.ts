export type ComplexityId = "o1" | "ologn" | "on" | "onlogn" | "on2" | "on3" | "o2n" | "ofact";

export interface ComplexityClass {
  id: ComplexityId;
  label: string;
  f: (n: number) => number;
}

export const CLASSES: ComplexityClass[] = [
  { id: "o1", label: "O(1)", f: () => 1 },
  { id: "ologn", label: "O(log n)", f: (n) => Math.log2(n) },
  { id: "on", label: "O(n)", f: (n) => n },
  { id: "onlogn", label: "O(n log n)", f: (n) => n * Math.log2(n) },
  { id: "on2", label: "O(n²)", f: (n) => n ** 2 },
  { id: "on3", label: "O(n³)", f: (n) => n ** 3 },
  { id: "o2n", label: "O(2ⁿ)", f: (n) => 2 ** n },
  { id: "ofact", label: "O(n!)", f: (n) => Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1) }
];

// Labels the model must choose from (kept ASCII so the schema enum is simple)
export const CLASS_ENUM: Record<ComplexityId, string> = {
  o1: "O(1)",
  ologn: "O(log n)",
  on: "O(n)",
  onlogn: "O(n log n)",
  on2: "O(n^2)",
  on3: "O(n^3)",
  o2n: "O(2^n)",
  ofact: "O(n!)"
};

export function idFromEnum(value: string): ComplexityId {
  const hit = (Object.entries(CLASS_ENUM) as [ComplexityId, string][]).find(([, v]) => v === value);
  return hit ? hit[0] : "on";
}

export type Rating = "success" | "warning" | "destructive";
export function rate(id: ComplexityId): Rating {
  if (id === "o1" || id === "ologn" || id === "on" || id === "onlogn") return "success";
  if (id === "on2") return "warning";
  return "destructive";
}

export const MAX_N = 10;
export const Y_CAP = 100;

export function rank(id: ComplexityId): number {
  return CLASSES.findIndex((c) => c.id === id);
}

// How many growth classes your solution is above the best known one (<= 0 means optimal)
export function gap(solution: ComplexityId, optimal: ComplexityId): number {
  return rank(solution) - rank(optimal);
}

export type Verdict = { label: string; variant: Rating };
export function verdict(solution: ComplexityId, optimal: ComplexityId): Verdict {
  const g = gap(solution, optimal);
  if (g <= 0) return { label: "Optimal", variant: "success" };
  if (g <= 2) return { label: "Can improve", variant: "warning" };
  return { label: "Far from optimal", variant: "destructive" };
}
