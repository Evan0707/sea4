import { BarChart } from '@mui/x-charts/BarChart';

interface AppBarChartProps {
 data: number[];
 labels: string[];
 color?: string;
 maxHeight?: number;
}

export const AppBarChart = ({
 data,
 labels,
 color = '#4040F2',
 maxHeight = 240,
}: AppBarChartProps) => {
 return (
  <BarChart
   height={maxHeight}
   series={[
    {
     data,
     color,
     label: 'Chantiers',
    },
   ]}
   xAxis={[
    {
     data: labels,
     scaleType: 'band',
     tickLabelStyle: {
      fontSize: 11,
      fontFamily: 'Manrope, sans-serif',
      fill: 'var(--color-placeholder)',
     },
    },
   ]}
   yAxis={[
    {
     tickLabelStyle: {
      fontSize: 11,
      fontFamily: 'Manrope, sans-serif',
      fill: 'var(--color-placeholder)',
     },
    },
   ]}
   borderRadius={6}
   margin={{ top: 8, right: 8, bottom: 32, left: 36 }}
   sx={{
    width: '100%',
    '& .MuiBarElement-root': {
     rx: 6,
    },
    '& .MuiChartsAxis-line': {
     stroke: 'transparent',
    },
    '& .MuiChartsAxis-tick': {
     stroke: 'transparent',
    },
    '& .MuiChartsGrid-line': {
     stroke: 'var(--color-border)',
     strokeDasharray: '4 4',
     strokeOpacity: 0.7,
    },
    '& .MuiChartsTooltip-paper': {
     background: 'var(--color-bg-primary)',
     border: '1px solid var(--color-border)',
     borderRadius: '8px',
     color: 'var(--color-text-primary)',
     fontFamily: 'Manrope, sans-serif',
     boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    '& .MuiChartsLegend-root': {
     display: 'none',
    },
   }}
   slotProps={{
    bar: { rx: 6, ry: 6 },
   }}
  />
 );
};
