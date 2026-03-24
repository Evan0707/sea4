import React from 'react';
import { Search, X } from '@mynaui/icons-react';
import { cn } from '@/shared/lib/utils';

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
 value: string;
 onChange: (value: string) => void;
 width?: string;
 className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
 value,
 onChange,
 placeholder = 'Rechercher...',
 width = 'w-[320px]',
 className = '',
 ...props
}) => {
 return (
  <div className={cn('relative', width, className)}>
   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-placeholder pointer-events-none" />

   <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={cn(
     'h-9 w-full rounded-[var(--radius)] border border-border bg-bg-primary pl-9 pr-8 text-sm text-text-primary placeholder:text-placeholder',
     'transition-[border-color,box-shadow] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary',
     'hover:border-border/80'
    )}
    {...props}
   />

   {value && (
    <button
     type="button"
     onClick={() => onChange('')}
     aria-label="Effacer la recherche"
     className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-placeholder hover:text-text-primary hover:bg-bg-secondary transition-colors"
    >
     <X className="h-3.5 w-3.5" />
    </button>
   )}
  </div>
 );
};

export default SearchBar;
