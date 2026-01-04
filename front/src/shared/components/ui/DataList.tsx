import React from 'react';
import { Text } from './Typography';
import Skeleton from './Skeleton';
import { ArrowDown, ArrowUp } from '@mynaui/icons-react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface DataListProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  keyExtractor: (item: T) => string | number;
}

export function DataList<T>({
  data,
  columns,
  loading = false,
  emptyMessage = "Aucun résultat trouvé",
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  keyExtractor
}: DataListProps<T>) {

  const handleSort = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey);
    }
  };

  return (
    <div className="bg-bg-secondary rounded-lg border border-border overflow-hidden flex flex-col flex-1 h-full">
      {/* Header */}
      <div className="flex items-center py-3 px-5 border-b border-border shrink-0 bg-bg-secondary">
        {columns.map((col) => (
          <div
            key={col.key}
            className={`flex flex-row items-center gap-1.5 min-w-0 ${col.sortable ? 'cursor-pointer hover:text-primary transition-colors' : ''} ${col.width || 'flex-1'} ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}
            onClick={() => col.sortable && handleSort(col.key)}
          >
            <Text as="span" className="font-semibold text-sm select-none truncate block">{col.header}</Text>
            {col.sortable && sortColumn === col.key && (
              <div className="shrink-0 flex items-center">
                {sortDirection === 'asc' ?
                  <ArrowUp strokeWidth={2} className="w-4 h-4 text-text-primary" /> :
                  <ArrowDown strokeWidth={2} className="w-4 h-4 text-text-primary" />
                }
              </div>
            )}
            {col.sortable && sortColumn !== col.key && (
              <div className="w-4 h-4 shrink-0" /> // Spacer for alignment
            )}
          </div>
        ))}
      </div>

      {/* List Body */}
      <div className="divide-y relative divide-border bg-bg-primary overflow-y-auto flex-1">
        {loading ? (
          // Skeleton Loading
          Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center py-4 px-5 animate-pulse">
              {columns.map((col, cIdx) => (
                <div key={cIdx} className={`${col.width || 'flex-1'} ${col.align === 'right' ? 'flex justify-end' : col.align === 'center' ? 'flex justify-center' : ''}`}>
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((item) => (
            <div
              key={keyExtractor(item)}
              onClick={() => onRowClick && onRowClick(item)}
              className={`flex items-center py-3 px-5 hover:bg-bg-secondary/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <div key={col.key} className={`flex items-center ${col.width || 'flex-1'} ${col.align === 'right' ? 'justify-end text-right' : col.align === 'center' ? 'justify-center text-center' : 'justify-start text-left'}`}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </div>
              ))}
            </div>
          ))
        ) : (
          // Empty State
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <Text variant='body' color='text-placeholder'>{emptyMessage}</Text>
          </div>
        )}
      </div>

      {/* Footer / Count */}
      <div className="py-2 px-5 border-t border-border bg-bg-secondary shrink-0">
        {!loading ? (
          <Text className="text-sm text-placeholder">
            {data.length} résultat{data.length > 1 ? 's' : ''}
          </Text>
        ) : (
          <Skeleton className='w-24 h-4' />
        )}
      </div>
    </div>
  );
}
