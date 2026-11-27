'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { platformService } from '@/lib/api/platformService';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import { getUserFriendlyPlatformError } from '@/lib/api/dataSource';
import {
  filterAcademicOversightData,
  computeAggregatedAcademicMetrics,
} from '@/lib/academic-oversight/evaluator';
import {
  AcademicOversightFilterState,
  OrganizationAcademicOversight,
} from '@/lib/types/academic-oversight';
import { AcademicOversightSummaryCards } from '@/components/academic-oversight/AcademicOversightSummaryCards';
import { AcademicOversightFilters } from '@/components/academic-oversight/AcademicOversightFilters';
import { PrivacyAcademicGovernanceNotice } from '@/components/academic-oversight/PrivacyAcademicGovernanceNotice';
import { AcademicReadinessChecklistCard } from '@/components/academic-oversight/AcademicReadinessChecklistCard';
import { CurriculumStructureDistributionCard } from '@/components/academic-oversight/CurriculumStructureDistributionCard';
import { TimetableOperationsCard } from '@/components/academic-oversight/TimetableOperationsCard';
import { TeachingWorkflowCard } from '@/components/academic-oversight/TeachingWorkflowCard';
import { AssessmentReportingCard } from '@/components/academic-oversight/AssessmentReportingCard';
import { DataQualityAcademicBanner } from '@/components/academic-oversight/DataQualityAcademicBanner';
import { OrganizationAcademicTable } from '@/components/academic-oversight/OrganizationAcademicTable';
import { OrganizationAcademicDetailModal } from '@/components/academic-oversight/OrganizationAcademicDetailModal';
import { AcademicCapabilityRegistryTable } from '@/components/academic-oversight/AcademicCapabilityRegistryTable';
import { downloadAcademicOversightReport } from '@/lib/utils/academic-oversight-export';
import {
  Download,
  Layers,
  CalendarDays,
  BookOpen,
  Clock,
  Award,
  ListTree,
} from 'lucide-react';

export default function AcademicOversightPage() {
  const { can } = usePlatformAuth();
  const canExport = can('oversight.academics.export');
  // Active filter state
  const [filter, setFilter] = useState<AcademicOversightFilterState>({
    organizationId: 'ALL',
    campusId: 'ALL',
    academicSession: 'ALL',
    activePeriod: 'ALL',
    readinessLevel: 'ALL',
    capabilityCategory: 'ALL',
    searchQuery: '',
  });

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Selected organization for drill-down inspection modal
  const [selectedOrg, setSelectedOrg] = useState<OrganizationAcademicOversight | null>(null);

  // Compute filtered dataset
  const [records, setRecords] = React.useState<OrganizationAcademicOversight[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await platformService.getAcademicOversight();
      setRecords(res.data || []);
    } catch (err) {
      setLoadError(getUserFriendlyPlatformError(err).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    void platformService
      .getAcademicOversight()
      .then((res) => {
        if (!active) return;
        setRecords(res.data || []);
        setLoadError(null);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(getUserFriendlyPlatformError(err).message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredData = useMemo(() => {
    return filterAcademicOversightData(records, filter);
  }, [records, filter]);

  // Derived aggregate metrics
  const aggregatedMetrics = useMemo(() => {
    return computeAggregatedAcademicMetrics(filteredData);
  }, [filteredData]);

  const tabs = [
    { id: 'overview', label: 'Overview & Readiness', icon: <Layers className="w-4 h-4" /> },
    { id: 'calendars_structure', label: 'Calendars & Structure', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'curriculum_pedagogy', label: 'Curriculum & Pedagogy', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'timetables_conflicts', label: 'Timetables & Conflicts', icon: <Clock className="w-4 h-4" /> },
    { id: 'assessment_reporting', label: 'Assessment & Reporting', icon: <Award className="w-4 h-4" /> },
    { id: 'capability_registry', label: 'Capability Registry', icon: <ListTree className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Academics, Curriculum & Teaching Oversight"
        description="Cross-tenant aggregated monitoring of academic sessions, curriculum blueprints, timetables, pedagogical workflows, grading scales, and report-card publication readiness."
        actions={
          canExport ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadAcademicOversightReport(filteredData, filter)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export Aggregate CSV
              </button>
            </div>
          ) : undefined
        }
      />

      {/* Privacy by Design & Data Minimization Notice */}
      <PrivacyAcademicGovernanceNotice />

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 p-4 flex items-center justify-between gap-4">
          <p className="text-xs text-red-700 dark:text-red-300">{loadError}</p>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
          Loading academic oversight telemetry...
        </div>
      )}

      {/* Filter Bar */}
      <AcademicOversightFilters
        filter={filter}
        onFilterChange={setFilter}
        allRecords={records}
        filteredRecords={filteredData}
      />

      {/* Top Summary Cards */}
      <AcademicOversightSummaryCards metrics={aggregatedMetrics} />

      {/* Workspace Tabs */}
      <div className="space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Overview & Readiness */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* 8-point Readiness Checklist */}
            <AcademicReadinessChecklistCard records={filteredData} />

            {/* Organizations Summary Table */}
            <OrganizationAcademicTable
              records={filteredData}
              onSelectOrg={setSelectedOrg}
            />

            {/* Data Quality & Configuration Audit Banner */}
            <DataQualityAcademicBanner records={filteredData} />
          </div>
        )}

        {/* Tab 2: Calendars & Structure */}
        {activeTab === 'calendars_structure' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <CurriculumStructureDistributionCard records={filteredData} />

            <OrganizationAcademicTable
              records={filteredData}
              onSelectOrg={setSelectedOrg}
            />
          </div>
        )}

        {/* Tab 3: Curriculum & Pedagogy */}
        {activeTab === 'curriculum_pedagogy' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <CurriculumStructureDistributionCard records={filteredData} />
            <TeachingWorkflowCard records={filteredData} />

            <OrganizationAcademicTable
              records={filteredData}
              onSelectOrg={setSelectedOrg}
            />
          </div>
        )}

        {/* Tab 4: Timetables & Conflicts */}
        {activeTab === 'timetables_conflicts' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <TimetableOperationsCard records={filteredData} />

            <OrganizationAcademicTable
              records={filteredData}
              onSelectOrg={setSelectedOrg}
            />
          </div>
        )}

        {/* Tab 5: Assessment & Reporting */}
        {activeTab === 'assessment_reporting' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <AssessmentReportingCard records={filteredData} />

            <OrganizationAcademicTable
              records={filteredData}
              onSelectOrg={setSelectedOrg}
            />
          </div>
        )}

        {/* Tab 6: Capability Registry */}
        {activeTab === 'capability_registry' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <AcademicCapabilityRegistryTable />
          </div>
        )}
      </div>

      {/* Organization Drill-Down Modal */}
      <OrganizationAcademicDetailModal
        org={selectedOrg}
        onClose={() => setSelectedOrg(null)}
      />
    </div>
  );
}
