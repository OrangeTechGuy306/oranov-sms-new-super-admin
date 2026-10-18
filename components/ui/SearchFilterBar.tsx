'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSelect {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterSelect[];
  onReset?: () => void;
  resultCount?: number;
  className?: string;
  actions?: React.ReactNode;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  onReset,
  resultCount,
  className,
  actions,
}: SearchFilterBarProps) {
  const hasActiveFilters = searchQuery.trim() !== '' || filters.some((f) => f.value !== '' && f.value !== 'all');

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 bg-card text-foreground text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/70"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <select
              key={filter.key}
              id={`filter-${filter.key}`}
              aria-label={filter.label}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-3 py-2 bg-card text-foreground text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {hasActiveFilters && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-lg transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          {actions}
        </div>
      </div>

      {resultCount !== undefined && (
        <div className="text-xs text-muted-foreground flex items-center justify-between">
          <span>
            Found <strong className="text-foreground">{resultCount}</strong> record{resultCount === 1 ? '' : 's'}
          </span>
        </div>
      )}
    </div>
  );
}
