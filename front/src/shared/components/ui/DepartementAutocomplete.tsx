import React, { useState, useEffect, useRef } from 'react';
import { InfoCircleSolid, Check } from '@mynaui/icons-react';
import Tooltip from './Tooltip';
import { Label, Text } from './Typography';
import { searchDepartements, type Departement } from '@/shared/data/departements';

interface DepartementAutocompleteProps {
  label: string;
  selectedDepartements: string[];
  onChange: (departements: string[]) => void;
  info?: string;
  placeholder?: string;
  maxSelections?: number;
}

export const DepartementAutocomplete: React.FC<DepartementAutocompleteProps> = ({
  label,
  selectedDepartements,
  onChange,
  info,
  placeholder = 'Rechercher un département...',
  maxSelections,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Departement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length >= 1) {
      const results = searchDepartements(value);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const toggleDepartement = (code: string) => {
    if (selectedDepartements.includes(code)) {
      onChange(selectedDepartements.filter(d => d !== code));
    } else {
      if (maxSelections && selectedDepartements.length >= maxSelections) {
        return; // Ne pas ajouter si limite atteinte
      }
      onChange([...selectedDepartements, code]);
    }
  };

  const handleSelectSuggestion = (dept: Departement) => {
    toggleDepartement(dept.code);
    setQuery('');
    setIsOpen(false);
    setSuggestions([]);
  };

  const removeDepartement = (code: string) => {
    onChange(selectedDepartements.filter(d => d !== code));
  };

  return (
    <div className="flex flex-col gap-3" ref={wrapperRef}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-bold text-text-primary">
          {label}
        </Label>
        {info && (
          <Tooltip content={info}>
            <InfoCircleSolid size={14} className="text-text-secondary" />
          </Tooltip>
        )}
      </div>

      {/* Selected departments */}
      {selectedDepartements.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedDepartements.map((code) => {
            const dept = searchDepartements(code)[0];
            return (
              <div
                key={code}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20"
              >
                <span className="text-xs font-bold">{code}</span>
                <span className="text-sm">{dept?.nom || code}</span>
                <button
                  type="button"
                  onClick={() => removeDepartement(code)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.length >= 1 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full px-3 py-2 border-[1.5px] border-border rounded-md focus-within:border-primary focus-within:outline-[1px] outline-border placeholder-placeholder text-text-primary bg-bg-primary"
        />

        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-bg-secondary rounded-md shadow-lg border border-border max-h-60 overflow-y-auto">
            {suggestions.map((dept) => {
              const isSelected = selectedDepartements.includes(dept.code);
              return (
                <button
                  key={dept.code}
                  type="button"
                  onClick={() => handleSelectSuggestion(dept)}
                  className="w-full text-left px-3 py-2 hover:bg-primary/5 focus:bg-primary/5 focus:outline-none transition-colors border-b border-border last:border-b-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-primary text-white' : 'bg-bg-primary text-text-secondary'
                    }`}>
                      {dept.code}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-text-primary">
                        {dept.nom}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {dept.region}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="text-primary" size={16} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Text variant="small" className="text-text-secondary">
        {selectedDepartements.length} département{selectedDepartements.length > 1 ? 's' : ''} sélectionné{selectedDepartements.length > 1 ? 's' : ''}
        {maxSelections && ` (max: ${maxSelections})`}
      </Text>
    </div>
  );
};
