import { CLASS_ENUM, idFromEnum, type ComplexityId } from "./complexity";

export const DEFAULT_MODEL = "gemini-2.5-flash";

export interface Metric {
  notation: string;
  classId: ComplexityId;
  why: string;
}
export interface Optimal {
  notation: string;
  classId: ComplexityId;
}
export interface AnalysisResult {
  time: Metric;
  space: Metric;
  optimalTime: Optimal;
  optimalSpace: Optimal;
  approach: string;
  advice: string;
}

const classSchema = { type: "STRING", enum: Object.values(CLASS_ENUM) };

const metricSchema = {
  type: "OBJECT",
  properties: {
    notation: { type: "STRING", description: "Exact Big-O, e.g. O(n log n) or O(m*n)" },
    class: { ...classSchema, description: "Closest dominant growth class" },
    why: { type: "STRING", description: "At most 3 short sentences" }
  },
  required: ["notation", "class", "why"]
};

const optimalMetricSchema = {
  type: "OBJECT",
  properties: {
    notation: { type: "STRING", description: "Exact Big-O of the best known approach" },
    class: { ...classSchema, description: "Closest dominant growth class" }
  },
  required: ["notation", "class"]
};

export async function analyzeWithGemini(opts: {
  apiKey: string;
  model: string;
  code: string;
  language: string;
  title: string;
}): Promise<AnalysisResult> {
  const prompt = `You are an expert in algorithm analysis. Analyze this ${opts.language || ""} solution${
    opts.title ? ` to the LeetCode problem "${opts.title}"` : ""
  }.

0) "implemented": false if the code is only the starter template, a stub, empty, or otherwise does not attempt to solve the problem (e.g. an empty function body or a hardcoded/placeholder return). Otherwise true. Judge this against the problem, not just the code's complexity.

1) "time" and "space": the worst-case time complexity and the auxiliary space complexity of THIS code (include recursion stack, exclude the input itself). "notation" is the exact Big-O (multiple variables allowed). "class" is the closest single-variable growth class for charting. "why" is at most 3 short sentences.

2) "optimal": the best known worst-case time complexity and the best known space complexity for this problem, each considered independently (they may come from different approaches), based on known approaches and lower bounds. If you are unsure whether anything better exists, say the current complexity is the best known.
   - "approach": short name of the approach that reaches the best time (e.g. "Hash map, one pass").
   - "advice": if this code is not already at the best known time AND space, 1-3 sentences describing the better approach and any time/space trade-off. If it is already optimal, use an empty string.

Be concise.

Code:
${opts.code}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model || DEFAULT_MODEL}:generateContent`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": opts.apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: 4096,
          thinkingConfig: { thinkingLevel: "low" },
          responseSchema: {
            type: "OBJECT",
            properties: {
              implemented: { type: "BOOLEAN" },
              time: metricSchema,
              space: metricSchema,
              optimal: {
                type: "OBJECT",
                properties: {
                  time: optimalMetricSchema,
                  space: optimalMetricSchema,
                  approach: { type: "STRING" },
                  advice: { type: "STRING" }
                },
                required: ["time", "space", "approach", "advice"]
              }
            },
            required: ["implemented", "time", "space", "optimal"]
          }
        }
      })
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("Gemini took longer than 30s. Try again, or switch to a faster model in Settings.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
  const text: string = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

  if (parsed.implemented === false) {
    throw new Error("No solution to analyze yet. Write some code in the editor first.");
  }

  const metric = (m: { notation: string; class: string; why: string }): Metric => ({
    notation: m.notation,
    classId: idFromEnum(m.class),
    why: m.why
  });
  const optimal = (m: { notation: string; class: string }): Optimal => ({
    notation: m.notation,
    classId: idFromEnum(m.class)
  });

  return {
    time: metric(parsed.time),
    space: metric(parsed.space),
    optimalTime: optimal(parsed.optimal.time),
    optimalSpace: optimal(parsed.optimal.space),
    approach: parsed.optimal.approach ?? "",
    advice: parsed.optimal.advice ?? ""
  };
}
