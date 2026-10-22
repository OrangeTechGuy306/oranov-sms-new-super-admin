'use client';

import React, { useState } from 'react';
import {
  ReportingDateRange,
  DatePresetKey,
  AnalyticsGlobalFilters,
} from '@/lib/types/analytics';
import { resolveDateRange } from '@/lib/analytics/evaluator';
import { Organization, SubscriptionPlan } from '@/lib/types';
import {
  Calendar,
  Filter,
  RotateCcw,
  Building2,
  Layers,
  Activity,
  Sparkles,
  Info,
  Clock,
  X,
  Check,
} from 'lucide-react';

interface AnalyticsReportingToolbarProps {
  filters: AnalyticsGlobalFilters;
  onFilterChange: (filters: AnalyticsGlobalFilters) => void;
  organizations: Organization[];
  plans: SubscriptionPlan[];
  onResetFilters: () => void;
}

export function AnalyticsReportingToolbar({
  filters,
  onFilterChange,
  organizations,
  plans,
  onResetFilters,
}: AnalyticsReportingToolbarProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState(filters.dateRange.startDate);
  const [customEnd, setCustomEnd] = useState(filters.dateRange.endDate);
  const [dateError, setDateError] = useState<string | null>(null);

  // Calculate count of active filters (excluding defaults)
  let activeFilterCount = 0;
  if (filters.dateRange.preset !== 'last_30_days') activeFilterCount++;
  if (filters.organizationId !== 'all') activeFilterCount++;
  if (filters.planId !== 'all') activeFilterCount++;
  if (filters.status !== 'all') activeFilterCount++;
  if (filters.moduleId !== 'all') activeFilterCount++;

  const handlePresetSelect = (preset: DatePresetKey) => {
    if (preset === 'custom') {
      setShowCustomModal(true);
      return;
    }
    const newRange = resolveDateRange(preset);
    onFilterChange({ ...filters, dateRange: newRange });
  };

  const handleApplyCustomDates = () => {
    if (!customStart || !customEnd) {
      setDateError('Please enter both start and end dates.');
      return;
    }
    if (customStart > customEnd) {
      setDateError('Start date cannot be after end date.');
      return;
    }
    setDateError(null);
    const newRange = resolveDateRange('custom', customStart, customEnd);
    onFilterChange({ ...filters, dateRange: newRange });
    setShowCustomModal(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Date Presets Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mr-1">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Period:
          </span>

          {(
            [
              { key: 'last_7_days', label: '7D' },
              { key: 'last_30_days', label: '30D' },
              { key: 'last_90_days', label: '90D' },
              { key: 'year_to_date', label: 'YTD' },
              { key: 'all_time', label: 'All Time' },
              { key: 'custom', label: 'Custom' },
            ] as const
          ).map((item) => {
            const isSelected = filters.dateRange.preset === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handlePresetSelect(item.key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="hidden sm:flex items-center gap-1 ml-2 text-[11px] font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/50">
            <Clock className="w-3 h-3 text-primary shrink-0" />
            <span>
              {filters.dateRange.startDate} → {filters.dateRange.endDate}
            </span>
          </div>
        </div>

        {/* Freshness & Demo Badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <Sparkles className="w-3 h-3" />
            Demo Telemetry
          </span>
          <span className="text-[11px] text-muted-foreground hidden md:inline">
            UTC Boundaries: Inclusive [00:00 - 23:59]
          </span>
        </div>
      </div>

      {/* Secondary Dimensional Filters */}
      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-2 text-xs">
        {/* Organization Filter */}
        <div className="flex items-center gap-1 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/60">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <select
            value={filters.organizationId}
            onChange={(e) => onFilterChange({ ...filters, organizationId: e.target.value })}
            className="bg-transparent border-none text-foreground font-medium text-xs focus:ring-0 focus:outline-hidden cursor-pointer"
            aria-label="Filter by Organization"
          >
            <option value="all">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.code})
              </option>
            ))}
          </select>
        </div>

        {/* Plan Filter */}
        <div className="flex items-center gap-1 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/60">
          <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <select
            value={filters.planId}
            onChange={(e) => onFilterChange({ ...filters, planId: e.target.value })}
            className="bg-transparent border-none text-foreground font-medium text-xs focus:ring-0 focus:outline-hidden cursor-pointer"
            aria-label="Filter by Plan"
          >
            <option value="all">All Plan Tiers</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/60">
          <Activity className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="bg-transparent border-none text-foreground font-medium text-xs focus:ring-0 focus:outline-hidden cursor-pointer"
            aria-label="Filter by Lifecycle Status"
          >
            <option value="all">All Lifecycle States</option>
            <option value="active">Active Only</option>
            <option value="pending">Pending Onboarding</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Reset / Active filter counter */}
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset ({activeFilterCount} active)
          </button>
        ) : (
          <span className="text-[11px] text-muted-foreground ml-auto hidden sm:inline">
            All filters at default
          </span>
        )}
      </div>

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                Select Custom Date Range
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  Start Date (Inclusive UTC)
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-1.5 bg-muted/40 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">
                  End Date (Inclusive UTC)
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-1.5 bg-muted/40 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              {dateError && (
                <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-rose-600 dark:text-rose-400 font-medium text-[11px]">
                  {dateError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustomDates}
                className="px-4 py-1.5 text-xs bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
