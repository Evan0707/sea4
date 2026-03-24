import { PieChart } from '@mui/x-charts/PieChart';
import { Text } from '@/shared/components/ui/Typography';

interface PieDataItem {
 label: string;
 value: number;
 color: string;
}

interface AppPieChartProps {
 data: PieDataItem[];
}

export const AppPieChart = ({ data }: AppPieChartProps) => {
 const total = data.reduce((acc, d) => acc + d.value, 0);

 if (total === 0) {
  return (
   <div className="h-44 flex items-center justify-center">
    <Text className="text-placeholder text-center text-sm">Aucune donnée</Text>
   </div>
  );
 }

 const series = data.map((d, i) => ({
  id: i,
  value: d.value,
  label: d.label,
  color: d.color,
 }));

 return (
  <div className="flex items-center gap-4 w-full">
   {/* Donut avec total centré */}
   <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
    <PieChart
     series={[
      {
       data: series,
       innerRadius: 48,
       outerRadius: 72,
       paddingAngle: 2,
       cornerRadius: 4,
       startAngle: 90,
       endAngle: -270,
       cx: 72,
       cy: 72,
      },
     ]}
     width={160}
     height={160}
     margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
     sx={{
      '& .MuiChartsLegend-root': { display: 'none' },
      '& .MuiChartsTooltip-paper': {
       background: 'var(--color-bg-primary)',
       border: '1px solid var(--color-border)',
       borderRadius: '8px',
       color: 'var(--color-text-primary)',
       fontFamily: 'Manrope, sans-serif',
       boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
       fontSize: '12px',
      },
     }}
    //slotProps={{ legend: { hidden: true } }}
    />
    {/* Total centré en overlay CSS — évite les svg text children non supportés */}
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
     <span
      className="text-xl font-bold text-text-primary leading-none"
      style={{ fontFamily: 'Manrope, sans-serif' }}
     >
      {total}
     </span>
     <span
      className="text-[10px] text-placeholder mt-0.5"
      style={{ fontFamily: 'Manrope, sans-serif' }}
     >
      total
     </span>
    </div>
   </div>

   {/* Légende custom */}
   <div className="flex flex-col gap-2 min-w-0">
    {data.map((d, i) => (
     <div key={i} className="flex items-center gap-2 min-w-0">
      <div
       className="w-2.5 h-2.5 rounded-full shrink-0"
       style={{ backgroundColor: d.color }}
      />
      <span className="text-sm text-text-secondary truncate">
       <span className="font-semibold text-text-primary">{d.value}</span>{' '}
       {d.label}
      </span>
     </div>
    ))}
   </div>
  </div>
 );
};
