import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  value: { label: "Données" }
} satisfies ChartConfig;

export function RoundedPieChart({
  data,
  title = "Répartition",
  emptyMessage = "Aucune donnée"
}: {
  data: { label: string; value: number; color: string }[];
  title?: string;
  emptyMessage?: string;
}) {
  const chartData = data.map(d => ({ name: d.label, value: d.value, fill: d.color }));
  
  return (
    <Card className="flex flex-col h-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-text-primary">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        {data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-placeholder">{emptyMessage}</div>
        ) : (
          <div className="flex flex-col items-center">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square min-h-[200px] max-h-[250px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={{ fill: 'transparent' }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  innerRadius="65%"
                  outerRadius="90%"
                  dataKey="value"
                  nameKey="name"
                  stroke="var(--color-bg-primary)"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 w-full mt-6">
              {data.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-text-secondary">
                    {d.label}
                  </span>
                  <span className="text-sm font-medium text-text-primary ml-1">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
