import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { useMemo, useId } from 'react';

function generateDeterministicTrend(value: string | number) {
  const num = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^\d.-]/g, '')) || 0;
  
  if (num === 0) {
    return Array.from({ length: 7 }).map(() => ({ value: 0 }));
  }

  const result = [];
  let current = num * 0.5; // Start roughly at 50% of the final value
  
  for (let i = 0; i < 6; i++) {
    result.push({ value: current });
    // Deterministic pseudo-random sine wave based on value + index
    const randomFactor = Math.sin(num * 1.23 + i * 4.56);
    // Step is somewhat biased upwards so it generally trends to num
    const step = ((randomFactor * 0.4) + 0.2) * num;
    current += step;
  }
  
  // Ensure the last point matches exactly our target metric
  result.push({ value: Math.max(0, num) }); 
  return result;
}

interface MiniSparklineProps {
  value: string | number;
  className?: string;
}

export function MiniSparkline({ value, className = 'text-primary' }: MiniSparklineProps) {
  const data = useMemo(() => generateDeterministicTrend(value), [value]);
  const gradientId = 'gradient-' + useId().replace(/:/g, '');

  return (
    <div className={`w-20 h-10 opacity-70 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.4} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          {/* Add a tiny bit of padding to YAxis so the line isn't clipped */}
          <YAxis domain={['dataMin - (dataMax * 0.1)', 'dataMax + (dataMax * 0.1)']} hide />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="currentColor" 
            fill={`url(#${gradientId})`}
            strokeWidth={2.5} 
            dot={false} 
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
