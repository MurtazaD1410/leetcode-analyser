import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplexityChart } from "@/components/complexity-chart";
import { CLASSES, gap, verdict } from "@/lib/complexity";
import type { Metric, Optimal } from "@/lib/gemini";

export function MetricCard({
  title,
  metric,
  optimal,
  color
}: {
  title: string;
  metric: Metric;
  optimal: Optimal;
  color: string;
}) {
  const v = verdict(metric.classId, optimal.classId);
  const isOptimal = gap(metric.classId, optimal.classId) <= 0;
  const cls = CLASSES.find((c) => c.id === metric.classId)!;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge variant={v.variant}>{v.label}</Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold" style={{ color }}>
            {metric.notation}
          </span>
          {metric.notation.replace(/\s/g, "") !== cls.label.replace(/\s/g, "") && (
            <span className="text-xs text-muted-foreground">charted as {cls.label}</span>
          )}
        </div>
        <div className="text-xs">
          {isOptimal ? (
            <span className="text-success">Matches the best known complexity for this problem</span>
          ) : (
            <span className="text-muted-foreground">
              Best known: <span className="font-semibold text-foreground">{optimal.notation}</span>
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ComplexityChart selected={metric.classId} optimal={optimal.classId} color={color} />
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">{metric.why}</p>
      </CardContent>
    </Card>
  );
}
