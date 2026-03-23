import React, { useState, useEffect, useRef } from 'react';
import { InfoCircleSolid } from '@mynaui/icons-react';
import Tooltip from './Tooltip';
import { Label, Text } from './Typography';
import apiClient from '@/shared/api/client';

interface Etape {
  noEtape: number;
  nomEtape: string;
}

interface Props {
  label?: string;
  value: Etape[];
  onChange: (items: Etape[]) => void;
  placeholder?: string;
  info?: boolean;
  message?: string;
  minChars?: number;
  disabled?: boolean;
  required?: boolean;
}

const EtapeMultiSelect: React.FC<Props> = ({
  label = 'Étapes',
  value,
  onChange,
  placeholder = 'Rechercher une étape...',
  info = false,
  message = '',
  minChars = 2,
  disabled = false,
  required = false,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Etape[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchEtapes = async (q: string) => {
    if (q.length < minChars) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      // Try a backend endpoint first; fallback to an in-memory filter if missing
      const res = await apiClient.get<Etape[]>('/etapes', { params: { q, limit: 10 } });
      // Expect array of { noEtape, nomEtape }
      setSuggestions(res.data || []);
      setIsOpen((res.data || []).length > 0);
    } catch (e) {
      // If backend endpoint is not available, fall back to empty suggestions
      console.error('Erreur recherche étapes', e);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);

    if (debounceTimer.current !== null) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = window.setTimeout(() => {
      searchEtapes(newValue);
    }, 250);
  };

  const handleSelect = (etape: Etape) => {
    // add if not exists
    if (!value.find(v => v.noEtape === etape.noEtape)) {
      onChange([...value, etape]);
    }
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleRemove = (noEtape: number) => {
    onChange(value.filter(v => v.noEtape !== noEtape));
  };

  return (
    <div className="flex flex-col gap-1 relative" ref={wrapperRef}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-bold text-text-primary m-1">
          {label}
          {required && <span className="text-red ml-1">*</span>}
        </Label>
        {info && (
          <Tooltip content={message}>
            <InfoCircleSolid size={14} className="text-text-secondary cursor-help" />
          </Tooltip>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border-[1.5px] border-border rounded-md focus-within:border-primary focus-within:outline-[1px] outline-border placeholder-placeholder text-text-primary ${disabled ? 'bg-bg-secondary opacity-50 cursor-not-allowed' : ''}`}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-bg-secondary/80 backdrop-blur-lg border border-border/50 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s.noEtape}
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-3 py-2 hover:bg-bg-primary/50 focus:bg-primary/10 focus:outline-none transition-colors border-b border-border/50 last:border-b-0"
              >
                <div className="font-medium text-sm text-text-primary">{s.nomEtape}</div>
                <div className="text-xs text-placeholder">ID: {s.noEtape}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {value.map(v => (
          <div key={v.noEtape} className="inline-flex items-center gap-2 bg-primary/8 text-primary border border-primary/20 rounded-full px-3 py-1">
            <Text className="text-sm">{v.nomEtape}</Text>
            {!disabled && <button type="button" onClick={() => handleRemove(v.noEtape)} className="text-sm text-red-500">×</button>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EtapeMultiSelect;
