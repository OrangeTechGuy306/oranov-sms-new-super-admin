'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { INITIAL_EXAM_GOVERNANCE_DATA } from '@/lib/data/examination-governance-fixtures';
import {
  filterExamGovernanceData,
  computeAggregatedExamMetrics,
} from '@/lib/examination-governance/evaluator';
import {
  ExamGovernanceFilterState,
  OrganizationExamGovernance,
} from '@/lib/types/examination-governance';
import { ExamGovernanceSummaryCards } from '@/components/examination-governance/ExamGovernanceSummaryCards';
import { ExamGovernanceFilters } from '@/components/examination-governance/ExamGovernanceFilters';
import { PrivacyExamGovernanceNotice } from '@/components/examination-governance/PrivacyExamGovernanceNotice';
import { ExamReadinessChecklistCard } from '@/components/examination-governance/ExamReadinessChecklistCard';
import { ExamLifecycleDistributionCard } from '@/components/examination-governance/ExamLifecycleDistributionCard';
import { CbtOperationsCard } from '@/components/examination-governance/CbtOperationsCard';
import { QuestionBankGovernanceCard } from '@/components/examination-governance/QuestionBankGovernanceCard';
import { TimetableSchedulingCard } from '@/components/examination-governance/TimetableSchedulingCard';
import { ResultsPublicationPipelineCard } from '@/components/examination-governance/ResultsPublicationPipelineCard';
import { DataQualityExamBanner } from '@/components/examination-governance/DataQualityExamBanner';
import { OrganizationExamTable } from '@/components/examination-governance/OrganizationExamTable';
import { OrganizationExamGovernanceDetailModal } from '@/components/examination-governance/OrganizationExamGovernanceDetailModal';
import { ExamCapabilityRegistryTable } from '@/components/examination-governance/ExamCapabilityRegistryTable';
import { downloadExamGovernanceReport } from '@/lib/utils/examination-governance-export';
import {
  Download,
  Layers,
  FileCheck2,
  MonitorCheck,
  Clock,
  Award,
  ListTree,
} from 'lucide-react';

export default function ExaminationGovernancePage() {
  // Active filter state
  const [filter, setFilter] = useState<ExamGovernanceFilterState>({
    organizationId: 'ALL',
    campusId: 'ALL',
    academicPeriod: 'ALL',
    assessmentType: 'ALL',
    lifecycleStatus: 'ALL',
    deliveryMode: 'ALL',
    readinessStatus: 'ALL',
    searchQuery: '',
  });

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Selected organization for drill-down inspection modal
  const [selectedOrg, setSelectedOrg] = useState<OrganizationExamGovernance | null>(null);

  // Compute filtered dataset
  const filteredData = useMemo(() => {
    return filterExamGovernanceData(INITIAL_EXAM_GOVERNANCE_DATA, filter);
  }, [filter]);

  // Derived aggregate metrics
  const aggregatedMetrics = useMemo(() => {
    return computeAggregatedExamMetrics(filteredData);
  }, [filteredData]);

  const tabs = [
    { id: 'overview', label: 'Overview & Readiness', icon: <Layers className="w-4 h-4" /> },
    { id: 'series_assessments', label: 'Series & Assessments', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'cbt_question_bank', label: 'CBT & Question Bank', icon: <MonitorCheck className="w-4 h-4" /> },
    { id: 'timetables_clashes', label: 'Timetables & Clashes', icon: <Clock className="w-4 h-4" /> },
    { id: 'grading_results', label: 'Grading & Publication', icon: <Award className="w-4 h-4" /> },
    { id: 'capability_registry', label: 'Capability Registry', icon: <ListTree className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Examinations, CBT & Assessment Governance"
        description="Cross-tenant oversight of examination series, assessment weighting, CBT exam delivery, question bank taxonomies, timetable scheduling conflicts, and report-card publication readiness."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadExamGovernanceReport(filteredData, filter)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Aggregate CSV
            </button>
          </div>
        }
      />

      {/* Privacy by Design & Governance Notice */}
      <PrivacyExamGovernanceNotice />

      {/* Dynamic Filter Bar */}
      <ExamGovernanceFilters
        filter={filter}
        onFilterChange={setFilter}
        allRecords={INITIAL_EXAM_GOVERNANCE_DATA}
        filteredRecords={filteredData}
      />

      {/* Top Summary Metrics */}
      <ExamGovernanceSummaryCards metrics={aggregatedMetrics} />

      {/* Workspace Tabs */}
      <div className="space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Overview & Readiness */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* 8-Point Canonical Readiness Checklist */}
            <ExamReadinessChecklistCard records={filteredData} />

            {/* Organizations Table */}
            <OrganizationExamTable
              records={filteredData}
              onSelectOrg={setSelectedOrg}
              onResetFilters={() =>
                setFilter({
                  organizationId: 'ALL',
                  campusId: 'ALL',
                  academicPeriod: 'ALL',
                  assessmentType: 'ALL',
                  lifecycleStatus: 'ALL',
                  deliveryMode: 'ALL',
                  readinessStatus: 'ALL',
                  searchQuery: '',
                })
              }
            />

            {/* Data Quality & Governance Audit Banner */}
            <DataQualityExamBanner records={filteredData} />
          </div>
        )}

        {/* Tab 2: Series & Assessments */}
        {activeTab === 'series_assessments' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <ExamLifecycleDistributionCard records={filteredData} />

            <OrganizationExamTable
              records={filteredData}
              onSelectOrg={setSelectedOrg}
            />
          </div>
        )}

        {/* Tab 3: CBT & Question Bank */}
        {activeTab === 'cbt_question_bank' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <CbtOperationsCard records={filteredData} />
            <QuestionBankGovernanceCard records={filteredData} />

            <OrganizationExamTable
              records={filteredData}
              onSelectOrg={setSelectedOrg}
            />
          </div>
        )}

        {/* Tab 4: Timetables & Clashes */}
        {activeTab === 'timetables_clashes' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <TimetableSchedulingCard records={filteredData} />

            <OrganizationExamTable
              records={filteredData}
              onSelectOrg={setSelectedOrg}
            />
          </div>
        )}

        {/* Tab 5: Grading & Publication */}
        {activeTab === 'grading_results' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <ResultsPublicationPipelineCard records={filteredData} />

            <OrganizationExamTable
              records={filteredData}
              onSelectOrg={setSelectedOrg}
            />
          </div>
        )}

        {/* Tab 6: Capability Registry */}
        {activeTab === 'capability_registry' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <ExamCapabilityRegistryTable />
          </div>
        )}
      </div>

      {/* Organization Drill-Down Inspection Modal */}
      <OrganizationExamGovernanceDetailModal
        org={selectedOrg}
        onClose={() => setSelectedOrg(null)}
      />
    </div>
  );
}
