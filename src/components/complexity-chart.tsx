import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { CLASSES, MAX_N, Y_CAP, type ComplexityId } from "@/lib/complexity";

const BEST_COLOR = "#4ea1ff";

const data = Array.from({ length: MAX_N }, (_, i) => {
  const n = i + 1;
  const row: Record<string, number> = { n };
  for (const c of CLASSES) row[c.id] = c.f(n);
  return row;
});

export function ComplexityChart({
  selected,
  optimal,
  color
}: {
  selected: ComplexityId;
  optimal: ComplexityId;
  color: string;
}) {
  const showBest = optimal !== selected;
  const others = CLASSES.filter((c) => c.id !== selected && c.id !== optimal);
  const picked = CLASSES.find((c) => c.id === selected)!;
  const best = CLASSES.find((c) => c.id === optimal)!;

  return (
    <div>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -16 }}>
            <CartesianGrid stroke="#3e3e3e" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="n" tick={{ fill: "#9a9a9a", fontSize: 10 }} stroke="#3e3e3e" />
            <YAxis
              type="number"
              domain={[0, Y_CAP]}
              allowDataOverflow
              tick={{ fill: "#9a9a9a", fontSize: 10 }}
              stroke="#3e3e3e"
            />
            {others.map((c) => (
              <Line
                key={c.id}
                dataKey={c.id}
                type="monotone"
                stroke="#6b6b6b"
                strokeOpacity={0.45}
                strokeWidth={1}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            {showBest && (
              <Line
                dataKey={best.id}
                type="monotone"
                stroke={BEST_COLOR}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                isAnimationActive={false}
              />
            )}
            <Line
              dataKey={picked.id}
              type="monotone"
              stroke={color}
              strokeWidth={3}
              dot={{ r: 2.5, fill: color, stroke: color }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[10px]">
        <span className="font-semibold" style={{ color }}>
          ━ Your solution {picked.label}
        </span>
        {showBest && (
          <span className="font-semibold" style={{ color: BEST_COLOR }}>
            ┅ Best possible {best.label}
          </span>
        )}
        {!showBest && <span className="text-muted-foreground">Already at the best known class</span>}
      </div>
      <div className="mt-1 px-1 text-[10px] text-muted-foreground">
        x: input size n · y: operations (clipped at {Y_CAP})
      </div>
    </div>
  );
}
