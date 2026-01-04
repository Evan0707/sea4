import React from 'react';
import { H1, Text } from './Typography';

interface PageHeaderProps {
 title: string;
 description?: string;
 action?: React.ReactNode;
 className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
 title,
 description,
 action,
 className = ''
}) => {
 return (
  <div className={`flex flex-col gap-1 mb-6 ${className}`}>
   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-wrap">
    <H1>{title}</H1>
    {action && <div className="shrink-0">{action}</div>}
   </div>
   {description && (
    <Text variant="body" className="text-sm">
     {description}
    </Text>
   )}
  </div>
 );
};
