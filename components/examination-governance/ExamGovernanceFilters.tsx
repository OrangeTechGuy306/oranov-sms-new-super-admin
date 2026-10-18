'use client';

import React from 'react';
import {
  ExamGovernanceFilterState,
  OrganizationExamGovernance,
} from '@/lib/types/examination-governance';
import { downloadExamGovernanceReport } from '@/lib/utils/examination-governance-export';
import {
  Search,
  RotateCcw,
  Download,
  Building2,
  Calendar,
  MapPin,
  ShieldCheck,
  MonitorCheck,
  Activity,
} from 'lucide-react';

interface ExamGovernanceFiltersProps {
  filter: ExamGovernanceFilterState;
  onFilterChange: (newFilter: ExamGovernanceFilterState) => void;
  allRecords: OrganizationExamGovernance[];
  filteredRecords: OrganizationExamGovernance[];
}

export function ExamGovernanceFilters({
  filter,
  onFilterChange,
  allRecords,
  filteredRecords,
}: ExamGovernanceFiltersProps) {
  // Dynamically derive selectable campuses based on selected organization
  const availableCampuses = React.useMemo(() => {
    if (filter.organizationId !== 'ALL') {
      const selectedOrg = allRecords.find((r) => r.organizationId === filter.organizationId);
      return selectedOrg ? selectedOrg.campuses : [];
    }
    // All unique campuses across all organizations
    const seen = new Set<string>();
    const list: Array<{ campusId: string; campusName: string; campusCode: string }> = [];
    for (const org of allRecords) {
      for (const campus of org.campuses) {
        if (!seen.has(campus.campusId)) {
          seen.add(campus.campusId);
          list.push({
            campusId: campus.campusId,
            campusName: `${org.organizationCode} - ${campus.campusName}`,
            campusCode: campus.campusCode,
          });
        }
      }
    }
    return list;
  }, [allRecords, filter.organizationId]);

  // Derive unique academic periods
  const availablePeriods = React.useMemo(() => {
    return Array.from(new Set(allRecords.map((r) => r.activePeriod).filter(Boolean))).sort();
  }, [allRecords]);

  const handleReset = () => {
    onFilterChange({
      organizationId: 'ALL',
      campusId: 'ALL',
      academicPeriod: 'ALL',
      assessmentType: 'ALL',
      lifecycleStatus: 'ALL',
      deliveryMode: 'ALL',
      readinessStatus: 'ALL',
      searchQuery: '',
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleExport = () => {
    downloadExamGovernanceReport(filteredRecords, filter);
  };

  const isFiltered =
    filter.organizationId !== 'ALL' ||
    filter.campusId !== 'ALL' ||
    filter.academicPeriod !== 'ALL' ||
    filter.assessmentType !== 'ALL' ||
    filter.lifecycleStatus !== 'ALL' ||
    filter.deliveryMode !== 'ALL' ||
    filter.readinessStatus !== 'ALL' ||
    filter.searchQuery.trim() !== '' ||
    Boolean(filter.startDate) ||
    Boolean(filter.endDate);

  return (
    <div className="bg-card text-card-foreground p-4 rounded-xl border border-border shadow-xs space-y-3">
      {/* Top Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* 1. Search Box */}
        <div className="lg:col-span-4 relative">
          <label htmlFor="exam-search-input" className="sr-only">
            Search organizations
          </label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            id="exam-search-input"
            type="text"
            placeholder="Search school, code, exam series, or campus..."
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* 2. Organization Selector */}
        <div className="lg:col-span-3">
          <label htmlFor="exam-org-select" className="sr-only">
            Filter by organization
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              id="exam-org-select"
              value={filter.organizationId}
              onChange={(e) => {
                const nextOrg = e.target.value;
                onFilterChange({
                  ...filter,
                  organizationId: nextOrg,
                  campusId: 'ALL',
                });
              }}
              className="w-full pl-9 pr-8 py-2 bg-background border border-input rounded-lg text-xs appearance-none focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer truncate"
            >
              <option value="ALL">All Organizations ({allRecords.length})</option>
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
          <label htmlFor="exam-campus-select" className="sr-only">
            Filter by campus
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              id="exam-campus-select"
              value={filter.campusId}
              onChange={(e) => onFilterChange({ ...filter, campusId: e.target.value })}
              className="w-full pl-9 pr-8 py-2 bg-background border border-input rounded-lg text-xs appearance-none focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer truncate"
            >
              <option value="ALL">
                {filter.organizationId === 'ALL'
                  ? `All Campuses (${availableCampuses.length})`
                  : `All Campuses in Organization (${availableCampuses.length})`}
              </option>
              {availableCampuses.map((c) => (
                <option key={c.campusId} value={c.campusId}>
                  {c.campusName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="lg:col-span-2 flex items-center justify-end gap-2">
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-2 border border-input text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Secondary Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-3 pt-1 border-t border-border/50 text-xs">
        {/* 5. Delivery Mode */}
        <div className="lg:col-span-3">
          <div className="relative">
            <MonitorCheck className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              id="exam-delivery-mode"
              aria-label="Filter by delivery mode"
              value={filter.deliveryMode}
              onChange={(e) => onFilterChange({ ...filter, deliveryMode: e.target.value })}
              className="w-full pl-8 pr-7 py-1.5 bg-background border border-input rounded-md text-[11px] appearance-none focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer truncate"
            >
              <option value="ALL">All Delivery Modes</option>
              <option value="CBT_FULL">CBT Full (Digital Only)</option>
              <option value="CBT_HYBRID">CBT Hybrid (Digital + Paper)</option>
              <option value="PAPER_BASED">Paper-Based Only</option>
            </select>
          </div>
        </div>

        {/* 6. Assessment Lifecycle Status */}
        <div className="lg:col-span-3">
          <div className="relative">
            <Activity className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              id="exam-lifecycle-status"
              aria-label="Filter by lifecycle status"
              value={filter.lifecycleStatus}
              onChange={(e) => onFilterChange({ ...filter, lifecycleStatus: e.target.value })}
              className="w-full pl-8 pr-7 py-1.5 bg-background border border-input rounded-md text-[11px] appearance-none focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer truncate"
            >
              <option value="ALL">All Lifecycle Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="MARKS_ENTRY">Marks Entry in Progress</option>
              <option value="SUBMITTED">Submitted for Review</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Results Approved</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        {/* 7. Readiness Level */}
        <div className="lg:col-span-3">
          <div className="relative">
            <ShieldCheck className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              id="exam-readiness-level"
              aria-label="Filter by readiness level"
              value={filter.readinessStatus}
              onChange={(e) => onFilterChange({ ...filter, readinessStatus: e.target.value })}
              className="w-full pl-8 pr-7 py-1.5 bg-background border border-input rounded-md text-[11px] appearance-none focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer truncate"
            >
              <option value="ALL">All Readiness Levels</option>
              <option value="ready">Ready (≥85%, 0 Blockers)</option>
              <option value="partially_ready">Partially Ready (Attention Req.)</option>
              <option value="not_ready">Not Ready (Critical Blockers)</option>
              <option value="not_applicable">Not Applicable (Inactive/Archived)</option>
            </select>
          </div>
        </div>

        {/* 8. Academic Period */}
        <div className="lg:col-span-3">
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              id="exam-academic-period"
              aria-label="Filter by academic period"
              value={filter.academicPeriod}
              onChange={(e) => onFilterChange({ ...filter, academicPeriod: e.target.value })}
              className="w-full pl-8 pr-7 py-1.5 bg-background border border-input rounded-md text-[11px] appearance-none focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer truncate"
            >
              <option value="ALL">All Academic Periods</option>
              {availablePeriods.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Result Summary */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
        <span>
          Showing <strong className="text-foreground">{filteredRecords.length}</strong> of{' '}
          <strong className="text-foreground">{allRecords.length}</strong> school organizations
        </span>
        {isFiltered && (
          <span className="text-primary font-medium">
            Active filters applied
          </span>
        )}
      </div>
    </div>
  );
}
