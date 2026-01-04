import type { ReactNode } from 'react';

interface Column<T> {
 header: string;
 key?: string; // Optional if using render
 render?: (item: T) => ReactNode;
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
 onRowClick
}: TableProps<T>) => {
 return (
  <div className={`overflow-x-auto ${className}`}>
   <table className="w-full text-sm">
    <thead>
     <tr className="border-b border-border">
      {columns.map((col, index) => (
       <th
        key={index}
        className={`py-3 px-4 text-text-primary font-semibold text-${col.align || 'left'} ${col.width || ''}`}
       >
        {col.header}
       </th>
      ))}
     </tr>
    </thead>
    <tbody>
     {data.length > 0 ? (
      data.map((item) => (
       <tr
        key={keyExtractor(item)}
        className={`border-b border-border/50 last:border-0 hover:bg-bg-primary/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
        onClick={() => onRowClick && onRowClick(item)}
       >
        {columns.map((col, index) => (
         <td
          key={index}
          className={`py-3 px-4 text-text-primary text-${col.align || 'left'}`}
         >
          {col.render ? col.render(item) : (item as any)[col.key as string]}
         </td>
        ))}
       </tr>
      ))
     ) : (
      <tr>
       <td colSpan={columns.length} className="py-8 text-center text-placeholder">
        {emptyMessage}
       </td>
      </tr>
     )}
    </tbody>
   </table>
  </div>
 );
};
