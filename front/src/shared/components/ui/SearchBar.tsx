import React from 'react';
import { Search, X } from '@mynaui/icons-react';

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
  <div className={`relative ${width} ${className}`}>
   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <Search className="h-4 w-4 text-placeholder" />
   </div>
   <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="block w-full pl-10 pr-8 py-2 border border-border rounded-lg leading-5 bg-bg-primary text-text-primary placeholder-placeholder focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all hover:border-gray-400"
    placeholder={placeholder}
    {...props}
   />
   {value && (
    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
     <button
      onClick={() => onChange('')}
      className="p-1 rounded-full text-placeholder hover:text-text-primary hover:bg-bg-secondary transition-colors"
     >
      <X className="h-3 w-3" />
     </button>
    </div>
   )}
  </div>
 );
};

export default SearchBar;
