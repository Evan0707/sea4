import React from 'react';
import { Card, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Text } from '@/shared/components/ui/Typography';
import { MiniSparkline } from '@/components/ui/mini-sparkline';
import { cn } from '@/shared/lib/utils';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  trendColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trendColor = 'text-primary',
  className,
}) => {
  return (
    <Card 
      className={cn("h-full hover:-translate-y-0.5 hover:shadow-md transition-all duration-200", className)} 
      padding="none"
    >
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="flex-1 min-w-0" aria-label={`${title}: ${value}`}>
          <CardTitle className="text-sm text-placeholder truncate">
            {title}
          </CardTitle>
          <Text className="text-2xl font-bold mt-1 truncate">
            {value}
          </Text>
          {subtitle && (
            <Text className="text-xs text-placeholder mt-1 truncate">
              {subtitle}
            </Text>
          )}
        </div>
        
        <div className="hidden sm:flex justify-end items-center px-1 h-10 mt-1 shrink-0">
          <MiniSparkline value={value} className={trendColor} />
        </div>

        <Icon className="w-5 h-5 text-text shrink-0 mt-1 opacity-80" />
      </CardContent>
    </Card>
  );
};

export default StatCard;
