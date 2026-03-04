import React, { useState, useCallback, useId } from 'react';
import { cn } from '@/shared/lib/utils';
import Skeleton from './Skeleton';
import { ArrowDown, ArrowUp, ArrowUpDown, RowsSolid, Trash } from '@mynaui/icons-react';

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
  className?: string;
  // ── Selection ──────────────────────────────────────────────
  selectable?: boolean;
  onDeleteSelected?: (keys: (string | number)[]) => void;
  deleteLabel?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const alignClass = (align?: 'left' | 'center' | 'right') =>
  align === 'right'
    ? 'justify-end text-right'
    : align === 'center'
      ? 'justify-center text-center'
      : 'justify-start text-left';

// ── Checkbox atom ──────────────────────────────────────────────────────────
interface CheckboxCellProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const CheckboxCell = ({ checked, indeterminate = false, onChange, label }: CheckboxCellProps) => {
  const id = useId();
  return (
    <div className="relative flex items-center justify-center shrink-0 w-10">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        ref={(el) => { if (el) el.indeterminate = indeterminate; }}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          'w-4 h-4 rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-1',
          checked || indeterminate
            ? 'border-primary bg-primary'
            : 'border-border bg-bg-primary hover:border-primary/60'
        )}
      >
        {indeterminate && !checked ? (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 2" fill="currentColor">
            <rect x="1" y="0.5" width="8" height="1" rx="0.5" />
          </svg>
        ) : checked ? (
          <svg className="w-2.5 h-2.5 text-white stroke-current" viewBox="0 0 10 10" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1.5,5 4,7.5 8.5,2" />
          </svg>
        ) : null}
      </label>
    </div>
  );
};

// ── DataList ───────────────────────────────────────────────────────────────

export function DataList<T>({
  data,
  columns,
  loading = false,
  emptyMessage = 'Aucun résultat trouvé',
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  keyExtractor,
  className,
  selectable = false,
  onDeleteSelected,
  deleteLabel = 'Supprimer la sélection',
}: DataListProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

  const allKeys = data.map(keyExtractor);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k));
  const someSelected = allKeys.some((k) => selectedKeys.has(k));
  const selectedCount = selectedKeys.size;

  const toggleAll = useCallback((checked: boolean) => {
    setSelectedKeys(checked ? new Set(allKeys) : new Set());
  }, [data]);

  const toggleOne = useCallback((key: string | number, checked: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      checked ? next.add(key) : next.delete(key);
      return next;
    });
  }, []);

  const handleDelete = () => {
    onDeleteSelected?.([...selectedKeys]);
    setSelectedKeys(new Set());
  };

  return (
    <div className={cn('flex flex-col flex-1 h-full overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg-primary', className)}>

      {/* ── Bulk action bar ──────────────────────────────────────── */}
      {selectable && selectedCount > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-primary/5 border-b border-primary/20 shrink-0 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          <span className="text-xs font-semibold text-primary">
            {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
          </span>
          {onDeleteSelected && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-xs font-semibold text-red hover:bg-red/8 px-2.5 py-1.5 rounded-[var(--radius)] transition-colors"
            >
              <Trash className="w-3.5 h-3.5" />
              {deleteLabel}
            </button>
          )}
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center px-4 py-2.5 border-b border-border bg-bg-secondary/60 shrink-0">
        {selectable && (
          <CheckboxCell
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={toggleAll}
            label="Tout sélectionner"
          />
        )}
        {columns.map((col) => {
          const isActive = sortColumn === col.key;
          return (
            <div
              key={col.key}
              className={cn(
                'flex items-center gap-1 min-w-0 select-none',
                col.width || 'flex-1',
                alignClass(col.align),
                col.sortable && 'cursor-pointer hover:text-primary transition-colors group'
              )}
              onClick={() => col.sortable && onSort?.(col.key)}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary truncate group-hover:text-primary transition-colors">
                {col.header}
              </span>
              {col.sortable && (
                <span className="shrink-0">
                  {isActive ? (
                    sortDirection === 'asc'
                      ? <ArrowUp strokeWidth={2} className="w-3.5 h-3.5 text-text-secondary" />
                      : <ArrowDown strokeWidth={2} className="w-3.5 h-3.5 text-text-secondary" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-text-secondary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex items-center px-4 py-3 gap-4 animate-pulse">
              {selectable && <div className="w-10 shrink-0"><Skeleton className="h-4 w-4 rounded-[4px]" /></div>}
              {columns.map((col, cIdx) => (
                <div key={cIdx} className={cn('flex', col.width || 'flex-1', alignClass(col.align))}>
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((item) => {
            const key = keyExtractor(item);
            const isSelected = selectedKeys.has(key);
            return (
              <div
                key={key}
                className={cn(
                  'flex items-center px-4 py-3 text-sm text-text-primary transition-colors',
                  isSelected && 'bg-primary/5',
                  onRowClick && !selectable && 'cursor-pointer hover:bg-bg-secondary/50',
                  selectable && 'hover:bg-bg-secondary/40'
                )}
              >
                {selectable && (
                  <CheckboxCell
                    checked={isSelected}
                    onChange={(checked) => toggleOne(key, checked)}
                    label={`Sélectionner la ligne ${key}`}
                  />
                )}
                <div
                  className="flex flex-1 items-center gap-0"
                  onClick={() => !selectable && onRowClick?.(item)}
                  style={!selectable && onRowClick ? { cursor: 'pointer' } : {}}
                >
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className={cn('flex items-center min-w-0', col.width || 'flex-1', alignClass(col.align))}
                      onClick={selectable ? () => onRowClick?.(item) : undefined}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 h-full min-h-[200px] text-placeholder">
            <RowsSolid className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">{emptyMessage}</p>
          </div>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="flex items-center px-4 py-2 border-t border-border bg-bg-secondary/60 shrink-0">
        {loading ? (
          <Skeleton className="w-24 h-3.5" />
        ) : (
          <span className="text-xs font-semibold text-placeholder tabular-nums">
            {selectable && selectedCount > 0
              ? `${selectedCount} / ${data.length} sélectionné${selectedCount > 1 ? 's' : ''}`
              : `${data.length} résultat${data.length !== 1 ? 's' : ''}`
            }
          </span>
        )}
      </div>
    </div>
  );
}
