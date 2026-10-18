'use client';

import React from 'react';
import {
  AcademicOversightFilterState,
  OrganizationAcademicOversight,
} from '@/lib/types/academic-oversight';
import { getSelectableCampuses } from '@/lib/academic-oversight/evaluator';
import { downloadAcademicOversightReport } from '@/lib/utils/academic-oversight-export';
import {
  Search,
  RotateCcw,
  Download,
  Building2,
  Calendar,
  MapPin,
  ShieldAlert,
  Layers,
} from 'lucide-react';

interface AcademicOversightFiltersProps {
  filter: AcademicOversightFilterState;
  onFilterChange: (newFilter: AcademicOversightFilterState) => void;
  allRecords: OrganizationAcademicOversight[];
  filteredRecords: OrganizationAcademicOversight[];
}

export function AcademicOversightFilters({
  filter,
  onFilterChange,
  allRecords,
  filteredRecords,
}: AcademicOversightFiltersProps) {
  const availableCampuses = getSelectableCampuses(allRecords, filter.organizationId);

  // Derive unique academic sessions from data
  const availableSessions = Array.from(
    new Set(allRecords.map((r) => r.academicSession).filter(Boolean))
  ).sort();

  const handleReset = () => {
    onFilterChange({
      organizationId: 'ALL',
      campusId: 'ALL',
      academicSession: 'ALL',
      activePeriod: 'ALL',
      readinessLevel: 'ALL',
      capabilityCategory: 'ALL',
      searchQuery: '',
    });
  };

  const handleExport = () => {
    downloadAcademicOversightReport(filteredRecords, filter);
  };

  return (
    <div className="bg-card text-card-foreground p-4 rounded-xl border border-border shadow-xs space-y-3">
      {/* Top Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* 1. Search Box */}
        <div className="lg:col-span-4 relative">
          <label htmlFor="academic-search-input" className="sr-only">
            Search organizations
          </label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            id="academic-search-input"
            type="text"
            placeholder="Search school name, code, session, or framework..."
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* 2. Organization Selector */}
        <div className="lg:col-span-3">
          <label htmlFor="academic-org-select" className="sr-only">
            Filter by organization
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              id="academic-org-select"
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
          <label htmlFor="academic-campus-select" className="sr-only">
            Filter by campus
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              id="academic-campus-select"
              value={filter.campusId}
              onChange={(e) => onFilterChange({ ...filter, campusId: e.target.value })}
              className="w-full pl-9 pr-8 py-2 bg-background border border-input rounded-lg text-xs appearance-none focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer truncate"
            >
              <option value="ALL">All Campuses ({availableCampuses.length})</option>
              {availableCampuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name} ({campus.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Academic Session Selector */}
        <div className="lg:col-span-2">
          <label htmlFor="academic-session-select" className="sr-only">
            Filter by academic session
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              id="academic-session-select"
              value={filter.academicSession}
              onChange={(e) => onFilterChange({ ...filter, academicSession: e.target.value })}
              className="w-full pl-9 pr-8 py-2 bg-background border border-input rounded-lg text-xs appearance-none focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer truncate"
            >
              <option value="ALL">All Sessions</option>
              {availableSessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Filter Controls & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Readiness Level Scope */}
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-[11px] font-medium">Readiness:</span>
            <select
              value={filter.readinessLevel}
              onChange={(e) => onFilterChange({ ...filter, readinessLevel: e.target.value })}
              className="px-2 py-1 bg-background border border-input rounded-md text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="ALL">All Readiness Levels</option>
              <option value="complete">Complete Readiness</option>
              <option value="attention_required">Attention Required</option>
              <option value="critical_blocker">Critical Blockers</option>
              <option value="unprovisioned">Unprovisioned / Dormant</option>
            </select>
          </div>

          {/* Capability Category Scope */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-[11px] font-medium">Category:</span>
            <select
              value={filter.capabilityCategory}
              onChange={(e) => onFilterChange({ ...filter, capabilityCategory: e.target.value })}
              className="px-2 py-1 bg-background border border-input rounded-md text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="calendar_structure">Calendar & Structure</option>
              <option value="curriculum_syllabus">Curriculum & Syllabi</option>
              <option value="timetables_scheduling">Timetables & Scheduling</option>
              <option value="teaching_pedagogy">Teaching & Pedagogy</option>
              <option value="assessment_grading">Assessment & Grading</option>
              <option value="reporting_continuity">Reporting & Transcripts</option>
            </select>
          </div>

          {/* Active Results Badge */}
          <span className="text-muted-foreground text-[11px] pl-2">
            Showing <strong className="text-foreground">{filteredRecords.length}</strong> of{' '}
            {allRecords.length} schools
          </span>
        </div>

        {/* Action Buttons: Reset & Export */}
        <div className="flex items-center gap-2">
          {(filter.organizationId !== 'ALL' ||
            filter.campusId !== 'ALL' ||
            filter.academicSession !== 'ALL' ||
            filter.activePeriod !== 'ALL' ||
            filter.readinessLevel !== 'ALL' ||
            filter.capabilityCategory !== 'ALL' ||
            filter.searchQuery.trim() !== '') && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-muted-foreground hover:text-foreground text-xs rounded-md hover:bg-muted transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-medium text-xs rounded-lg hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
