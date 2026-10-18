'use client';

import React from 'react';
import {
  StudentOversightFilterState,
  OrganizationStudentOversight,
  AcademicCycleSession,
} from '@/lib/types/student-oversight';
import { getSelectableCampuses } from '@/lib/student-oversight/evaluator';
import { downloadStudentOversightReport } from '@/lib/utils/student-oversight-export';
import {
  Search,
  Filter,
  RotateCcw,
  Download,
  Building2,
  Calendar,
  MapPin,
} from 'lucide-react';

interface StudentOversightFiltersProps {
  filter: StudentOversightFilterState;
  onFilterChange: (newFilter: StudentOversightFilterState) => void;
  allRecords: OrganizationStudentOversight[];
  filteredRecords: OrganizationStudentOversight[];
}

export function StudentOversightFilters({
  filter,
  onFilterChange,
  allRecords,
  filteredRecords,
}: StudentOversightFiltersProps) {
  // Available campuses based on current organization selection
  const availableCampuses = getSelectableCampuses(allRecords, filter.organizationId);

  const handleReset = () => {
    onFilterChange({
      organizationId: 'ALL',
      campusId: 'ALL',
      academicSession: '2025/2026',
      searchQuery: '',
      reportingStatus: 'ALL',
    });
  };

  const handleExport = () => {
    downloadStudentOversightReport(filteredRecords, filter);
  };

  return (
    <div className="bg-card text-card-foreground p-4 rounded-xl border border-border shadow-xs space-y-3">
      {/* Top Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* 1. Search Box */}
        <div className="lg:col-span-4 relative">
          <label htmlFor="search-input" className="sr-only">Search organizations</label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            id="search-input"
            type="text"
            placeholder="Search by school name or code (e.g. OAKHILL)..."
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* 2. Organization Selector */}
        <div className="lg:col-span-3">
          <label htmlFor="org-select" className="sr-only">Filter by organization</label>
          <div className="relative">
            <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              id="org-select"
              value={filter.organizationId}
              onChange={(e) => {
                const nextOrg = e.target.value;
                // If switching org, reset campus filter if that campus does not belong to nextOrg
                onFilterChange({
                  ...filter,
                  organizationId: nextOrg,
                  campusId: 'ALL',
                });
              }}
              className="w-full pl-9 pr-8 py-2 bg-background border border-input rounded-lg text-xs appearance-none focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer truncate"
            >
              <option value="ALL">All School Organizations ({allRecords.length})</option>
              {allRecords.map((org) => (
                <option key={org.organizationId} value={org.organizationId}>
                  {org.organizationName} ({org.organizationCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Campus Selector */}
        <div className="lg:col-span-3">
          <label htmlFor="campus-select" className="sr-only">Filter by campus</label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              id="campus-select"
              value={filter.campusId}
              onChange={(e) => onFilterChange({ ...filter, campusId: e.target.value })}
              className="w-full pl-9 pr-8 py-2 bg-background border border-input rounded-lg text-xs appearance-none focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer truncate"
            >
              <option value="ALL">
                {filter.organizationId === 'ALL'
                  ? `All Campuses (${availableCampuses.length})`
                  : `All Campuses of School (${availableCampuses.length})`}
              </option>
              {availableCampuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Academic Cycle / Session */}
        <div className="lg:col-span-2">
          <label htmlFor="session-select" className="sr-only">Filter by academic cycle</label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              id="session-select"
              value={filter.academicSession}
              onChange={(e) => onFilterChange({ ...filter, academicSession: e.target.value as AcademicCycleSession | 'ALL' })}
              className="w-full pl-9 pr-8 py-2 bg-background border border-input rounded-lg text-xs appearance-none focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="2025/2026">2025/2026 (Current Cycle)</option>
              <option value="2024/2025">2024/2025 (Previous Cycle)</option>
              <option value="2023/2024">2023/2024 (Historical)</option>
              <option value="ALL">All Academic Sessions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Filter Controls: Scope & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
        {/* Reporting Status Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-muted-foreground mr-1 text-[11px] font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-primary" /> Scope:
          </span>

          <button
            type="button"
            onClick={() => onFilterChange({ ...filter, reportingStatus: 'ALL' })}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              filter.reportingStatus === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            All Tenants ({allRecords.length})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ ...filter, reportingStatus: 'ACTIVE_ONLY' })}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              filter.reportingStatus === 'ACTIVE_ONLY'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Active Reporting Only
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ ...filter, reportingStatus: 'WITH_ISSUES' })}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              filter.reportingStatus === 'WITH_ISSUES'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            With Quality Warnings
          </button>
        </div>

        {/* Actions: Export & Reset */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium text-xs rounded-lg border border-border shadow-xs transition-colors"
            title="Export filtered organization data to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg transition-colors"
            title="Reset all search and filtering criteria"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}
