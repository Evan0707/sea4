import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface Column<T> {
 header: string;
 key?: string;
 render?: (item: T, index: number) => ReactNode;
 align?: 'left' | 'center' | 'right';
 width?: string;
}

interface TableProps<T> {
 data: T[];
 columns: Column<T>[];
 keyExtractor: (item: T) => string | number;
 emptyMessage?: string;
 className?: string;
 onRowClick?: (item: T) => void;
}

export const Table = <T,>({
 data,
 columns,
 keyExtractor,
 emptyMessage = 'Aucune donnée',
 className = '',
 onRowClick,
}: TableProps<T>) => {
 return (
  <div className={cn('w-full overflow-x-auto rounded-[var(--radius-lg)] border border-border', className)}>
   <table className="w-full text-sm">
    <thead>
     <tr className="border-b border-border bg-bg-secondary/60">
      {columns.map((col, index) => (
       <th
        key={index}
        className={cn(
         'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary',
         `text-${col.align || 'left'}`,
         col.width
        )}
       >
        {col.header}
       </th>
      ))}
     </tr>
    </thead>
    <tbody className="divide-y divide-border/60">
     {data.length > 0 ? (
      data.map((item, rowIndex) => (
       <tr
        key={keyExtractor(item)}
        className={cn(
         'bg-bg-primary transition-colors',
         onRowClick && 'cursor-pointer hover:bg-bg-secondary/50'
        )}
        onClick={() => onRowClick && onRowClick(item)}
       >
        {columns.map((col, colIndex) => (
         <td
          key={colIndex}
          className={cn(
           'px-4 py-3 text-text-primary',
           `text-${col.align || 'left'}`
          )}
         >
          {col.render ? col.render(item, rowIndex) : (item as any)[col.key as string]}
         </td>
        ))}
       </tr>
      ))
     ) : (
      <tr>
       <td
        colSpan={columns.length}
        className="py-12 text-center text-sm text-placeholder"
       >
        {emptyMessage}
       </td>
      </tr>
     )}
    </tbody>
   </table>
  </div>
 );
};
