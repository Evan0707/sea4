import React, { useState, useEffect, useRef } from 'react';
import { InfoCircleSolid } from '@mynaui/icons-react';
import Tooltip from './Tooltip';
import { Label, Text } from './Typography';

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: AddressResult) => void;
  error?: string;
  info?: boolean;
  message?: string;
  placeholder?: string;
  required?: boolean;
}

interface AddressResult {
  label: string;
  city: string;
  postcode: string;
  street: string;
  coordinates: [number, number];
}

interface ApiFeature {
  properties: {
    label: string;
    city: string;
    postcode: string;
    name: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label,
  value,
  onChange,
  onAddressSelect,
  error,
  info = false,
  message = '',
  placeholder = "Rechercher une adresse...",
  required = false,
}) => {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<number | null>(null);

  const inputId = value || label

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();

      const results: AddressResult[] = data.features.map((feature: ApiFeature) => ({
        label: feature.properties.label,
        city: feature.properties.city,
        postcode: feature.properties.postcode,
        street: feature.properties.name,
        coordinates: feature.geometry.coordinates,
      }));

      setSuggestions(results);
      setIsOpen(results.length > 0);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceTimer.current !== null) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(() => {
      searchAddress(newValue);
    }, 300);
  };

  const handleSelectSuggestion = (address: AddressResult) => {
    onChange(address.label);
    setIsOpen(false);
    setSuggestions([]);

    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };

  return (
    <div className="flex flex-col gap-1 relative" ref={wrapperRef}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-bold text-text-primary" htmlFor={inputId}>
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
          id={inputId}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border-[1px] border-border rounded-md focus-within:border-primary focus-within:outline-[1px] outline-border  placeholder-placeholder text-text-primary ${error
              ? 'border-red focus:ring-red'
              : 'border-border focus:ring-blue-500'
            }`}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-bg-secondary/80 backdrop-blur-lg border border-border/50 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-bg-primary/50 focus:bg-primary/10 focus:outline-none transition-colors border-b border-border/50 last:border-b-0"
              >
                <div className="font-medium text-sm text-text-primary">
                  {suggestion.street}
                </div>
                <div className="text-xs text-placeholder">
                  {suggestion.postcode} {suggestion.city}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <Text className='text-[13px] text-red absolute ml-1 mt-1 bottom-[-23px]' weight='semibold' color='text-red'>{error}</Text>}
    </div>
  );
};
