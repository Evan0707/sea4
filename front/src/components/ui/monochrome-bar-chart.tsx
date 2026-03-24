import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  value: { label: "Données", color: "var(--color-primary)" },
} satisfies ChartConfig;

export function MonochromeBarChart({
  data,
  labels,
  title = "Données par mois",
  dataName = "données",
  classNameFill = "fill-primary",
  emptyMessage = "Aucune donnée"
}: {
  data: number[];
  labels: string[];
  title?: string;
  dataName?: string;
  classNameFill?: string;
  emptyMessage?: string;
}) {
  const chartData = React.useMemo(() => data.map((d, i) => ({ month: labels[i], value: d })), [data, labels]);
  const total = React.useMemo(() => data.reduce((a, b) => a + b, 0), [data]);

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="flex flex-col space-y-2 pb-6">
        <CardTitle className="text-base font-medium text-text-primary">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold tracking-tight text-text-primary">
            {total.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-text-secondary">au total</span>
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-placeholder">{emptyMessage}</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full mt-2">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                className="text-xs text-text-secondary"
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                className="text-xs text-text-secondary"
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                cursor={{ fill: 'var(--color-bg-secondary)', opacity: 0.5 }}
                content={<ChartTooltipContent hideLabel={false} />}
              />
              <Bar
                dataKey="value"
                fill="currentColor"
                className={classNameFill}
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
