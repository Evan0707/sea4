import React, { useState, useCallback, useId } from 'react';
import { cn } from '@/shared/lib/utils';
import Skeleton from './Skeleton';
import { ArrowDown, ArrowUp, ArrowUpDown, Trash, Refresh } from '@mynaui/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void; icon?: React.ElementType };
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
  // ── Error ──────────────────────────────────────────────────
  isError?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  errorAction?: { label: string; onClick: () => void; icon?: React.ElementType };
  onRefresh?: () => void;
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
  emptyDescription,
  emptyAction,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  keyExtractor,
  className,
  selectable = false,
  onDeleteSelected,
  deleteLabel = 'Supprimer la sélection',
  isError = false,
  errorTitle = 'Erreur de chargement',
  errorDescription = 'Une erreur est survenue lors de la récupération des données.',
  errorAction,
  onRefresh,
}: DataListProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

  const allKeys = data.map(keyExtractor);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k));
  const someSelected = allKeys.some((k) => selectedKeys.has(k));
  const selectedCount = selectedKeys.size;

  const toggleAll = useCallback((checked: boolean) => {
    setSelectedKeys(checked ? new Set(allKeys) : new Set());
  }, [allKeys]);

  const toggleOne = useCallback((key: string | number, checked: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }, []);

  const handleDelete = () => {
    onDeleteSelected?.([...selectedKeys]);
    setSelectedKeys(new Set());
  };

  const containerVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 350, damping: 25 } }
  };

  return (
    <div className={cn('flex flex-col flex-1 h-full overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg-primary', className)}>

      {/* ── Bulk action bar ──────────────────────────────────────── */}
      <AnimatePresence>
        {selectable && selectedCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-between px-4 py-2 bg-primary/5 border-b border-primary/20 shrink-0 overflow-hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

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
      <div className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {isError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex flex-col items-center justify-center gap-4 h-full min-h-[260px] px-4 absolute inset-0 w-full"
            >
              <div className="w-16 h-16 rounded-2xl bg-red/5 border border-red/20 flex items-center justify-center text-red">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-text-primary">{errorTitle}</p>
                <p className="text-sm text-placeholder mt-1 max-w-sm mx-auto">{errorDescription}</p>
              </div>
              {errorAction && (
                <button
                  onClick={errorAction.onClick}
                  className="inline-flex items-center gap-2 mx-auto mt-2 px-4 py-2 text-sm font-semibold rounded-[var(--radius)] bg-red text-white hover:bg-red/90 transition-transform active:scale-95 shadow-sm"
                >
                  {errorAction.icon && <errorAction.icon className="w-4 h-4" />}
                  {errorAction.label}
                </button>
              )}
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="divide-y divide-border/60 absolute inset-0 w-full"
            >
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex items-center px-4 py-3 gap-4 animate-pulse">
                  {selectable && <div className="w-10 shrink-0"><Skeleton className="h-4 w-4 rounded-[4px]" /></div>}
                  {columns.map((col, cIdx) => (
                    <div key={cIdx} className={cn('flex', col.width || 'flex-1', alignClass(col.align))}>
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          ) : data.length > 0 ? (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-border/60 flex flex-col"
            >
              {data.map((item) => {
                const key = keyExtractor(item);
                const isSelected = selectedKeys.has(key);
                return (
                  <motion.div
                    key={key}
                    variants={itemVariants}
                    layout="position"
                    onClick={() => !selectable && onRowClick?.(item)}
                    className={cn(
                      'flex items-center cursor-pointer px-4 py-3 text-sm text-text-primary transition-colors bg-bg-primary',
                      isSelected && 'bg-primary/5',
                      onRowClick && !selectable && 'cursor-pointer hover:bg-bg-secondary hover:z-10 relative',
                      selectable && 'hover:bg-bg-secondary/40 relative'
                    )}
                    whileHover={onRowClick && !selectable ? { boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' } : undefined}
                    whileTap={onRowClick && !selectable ? { scale: 0.995 } : undefined}
                  >
                    {selectable && (
                      <CheckboxCell
                        checked={isSelected}
                        onChange={(checked) => toggleOne(key, checked)}
                        label={`Sélectionner la ligne ${key}`}
                      />
                    )}
                    <div
                      className="flex flex-1 items-center gap-0 w-full"
                    >
                      {columns.map((col) => (
                        <div
                          key={col.key}
                          className={cn('flex items-center min-w-0', col.width || 'flex-1', alignClass(col.align))}
                          onClick={selectable ? () => onRowClick?.(item) : undefined}
                        >
                          {col.render ? col.render(item) : (item as Record<string, React.ReactNode>)[col.key]}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex flex-col items-center justify-center gap-4 h-full min-h-[260px] text-placeholder px-4 absolute inset-0 w-full"
            >
              <div className="w-56 h-56 flex items-center justify-center">
                <img
                  src="/DATA_NOT_FOUND.svg"
                  alt="No data"
                  className="w-full h-full object-contain drop-shadow-lg opacity-60 transition-all hover:opacity-100"
                />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-text-primary">{emptyMessage}</p>
                {emptyDescription && (
                  <p className="text-sm text-placeholder mt-1 max-w-sm mx-auto">{emptyDescription}</p>
                )}
              </div>
              {emptyAction && (
                <button
                  onClick={emptyAction.onClick}
                  className="inline-flex items-center gap-2 mx-auto mt-2 px-4 py-2 text-sm font-semibold rounded-[var(--radius)] bg-primary text-white hover:bg-primary-dark transition-transform active:scale-95 shadow-sm"
                >
                  {emptyAction.icon && <emptyAction.icon className="w-4 h-4" />}
                  {emptyAction.label}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-bg-secondary/60 shrink-0 z-10">
        <div className="flex items-center gap-4">
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

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className={cn(
              "flex items-center gap-1.5 px-2 bg-bg-primary border-[1px] border-b-[1.5px] border-text-secondary/30 py-1 rounded-md text-xs font-medium transition-all",
              "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Rafraîchir les données"
          >
            <Refresh className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            <span>Rafraîchir</span>
          </button>
        )}
      </div>
    </div>
  );
}
