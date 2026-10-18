'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { INITIAL_STUDENT_OVERSIGHT_DATA } from '@/lib/data/student-oversight-fixtures';
import {
  filterStudentOversightData,
  computeAggregatedStudentMetrics,
  aggregateAdmissionsFunnel,
  aggregatePopulationLifecycle,
} from '@/lib/student-oversight/evaluator';
import {
  StudentOversightFilterState,
  OrganizationStudentOversight,
} from '@/lib/types/student-oversight';
import { StudentOversightSummaryCards } from '@/components/student-oversight/StudentOversightSummaryCards';
import { StudentOversightFilters } from '@/components/student-oversight/StudentOversightFilters';
import { PrivacyGovernanceNotice } from '@/components/student-oversight/PrivacyGovernanceNotice';
import { AdmissionsFunnelCard } from '@/components/student-oversight/AdmissionsFunnelCard';
import { StudentPopulationDistributionCard } from '@/components/student-oversight/StudentPopulationDistributionCard';
import { CampusCapacityTable } from '@/components/student-oversight/CampusCapacityTable';
import { TransfersClearanceCard } from '@/components/student-oversight/TransfersClearanceCard';
import { DataQualityAuditBanner } from '@/components/student-oversight/DataQualityAuditBanner';
import { OrganizationStudentTable } from '@/components/student-oversight/OrganizationStudentTable';
import { OrganizationStudentDetailModal } from '@/components/student-oversight/OrganizationStudentDetailModal';
import {
  Download,
  Layers,
  MapPin,
  ArrowRightLeft,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { downloadStudentOversightReport } from '@/lib/utils/student-oversight-export';

export default function StudentOversightPage() {

  // Active filter state
  const [filter, setFilter] = useState<StudentOversightFilterState>({
    organizationId: 'ALL',
    campusId: 'ALL',
    academicSession: '2025/2026',
    searchQuery: '',
    reportingStatus: 'ALL',
  });

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Selected organization for drill-down modal
  const [selectedOrg, setSelectedOrg] = useState<OrganizationStudentOversight | null>(null);

  // Compute filtered dataset
  const filteredData = useMemo(() => {
    return filterStudentOversightData(INITIAL_STUDENT_OVERSIGHT_DATA, filter);
  }, [filter]);

  // Derived aggregate metrics
  const aggregatedMetrics = useMemo(() => {
    return computeAggregatedStudentMetrics(filteredData);
  }, [filteredData]);

  // Derived admissions funnel
  const funnel = useMemo(() => {
    return aggregateAdmissionsFunnel(filteredData);
  }, [filteredData]);

  // Derived population lifecycle
  const population = useMemo(() => {
    return aggregatePopulationLifecycle(filteredData);
  }, [filteredData]);

  const tabs = [
    { id: 'overview', label: 'Platform Overview', icon: <Layers className="w-4 h-4" /> },
    { id: 'admissions', label: 'Admissions & Intake Funnel', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'campuses', label: 'Campuses & Facility Capacity', icon: <MapPin className="w-4 h-4" /> },
    { id: 'transfers_promotions', label: 'Transfers & Academic Continuity', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { id: 'data_governance', label: 'Data Quality & Governance', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Student Information & Admissions Oversight"
        description="Cross-tenant aggregated monitoring of student enrollments, admissions pipelines, campus capacities, mobility transfers, and data governance."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadStudentOversightReport(filteredData, filter)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              Export Aggregate CSV
            </button>
          </div>
        }
      />

      {/* Privacy by Design Notice */}
      <PrivacyGovernanceNotice />

      {/* Filter Bar */}
      <StudentOversightFilters
        filter={filter}
        onFilterChange={setFilter}
        allRecords={INITIAL_STUDENT_OVERSIGHT_DATA}
        filteredRecords={filteredData}
      />

      {/* Top Summary Cards */}
      <StudentOversightSummaryCards metrics={aggregatedMetrics} />

      {/* Workspace Tabs */}
      <div className="space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Admissions Funnel & Student Lifecycle Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdmissionsFunnelCard funnel={funnel} />
              <StudentPopulationDistributionCard population={population} />
            </div>

            {/* Organizations Summary Table */}
            <OrganizationStudentTable
              records={filteredData}
              onSelectOrganization={setSelectedOrg}
            />

            {/* Data Quality Notice */}
            <DataQualityAuditBanner records={filteredData} />
          </div>
        )}

        {/* Tab 2: Admissions & Intake Funnel */}
        {activeTab === 'admissions' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <AdmissionsFunnelCard
              funnel={funnel}
              title="Full-Spectrum Admissions Intake & Pipeline Analysis"
              subtitle="Breakdown of inquiry conversion, document review queues, offer acceptances, and enrollment drop-offs."
            />

            <OrganizationStudentTable
              records={filteredData}
              onSelectOrganization={setSelectedOrg}
            />
          </div>
        )}

        {/* Tab 3: Campuses & Capacity */}
        {activeTab === 'campuses' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <CampusCapacityTable records={filteredData} />
          </div>
        )}

        {/* Tab 4: Transfers & Academic Continuity */}
        {activeTab === 'transfers_promotions' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <TransfersClearanceCard records={filteredData} />
          </div>
        )}

        {/* Tab 5: Data Quality & Governance */}
        {activeTab === 'data_governance' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <DataQualityAuditBanner records={filteredData} />

            <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4 text-xs">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Referential Integrity & Privacy Model Verification
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                The Student Oversight data engine continuously cross-references tenant reporting packets against canonical PlatformStore records:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>
                  <strong>Organization Identity Verification:</strong> All student statistics are verified against active tenant identifiers (<code>org_001</code> to <code>org_010</code>). Zero orphaned records are permitted.
                </li>
                <li>
                  <strong>Campus Ownership Constraints:</strong> Multi-branch student counts strictly resolve to registered campus IDs in <code>INITIAL_CAMPUSES</code>.
                </li>
                <li>
                  <strong>Status Disaggregation:</strong> Applicant inquiries, submitted admissions, enrolled students, transferred pupils, and graduated cohorts are segregated to prevent duplicate population double-counting.
                </li>
                <li>
                  <strong>No Fabricated Runtime Signals:</strong> Unprovisioned or draft schools (e.g. <code>CEDAR</code>, <code>ROYAL</code>) are clearly marked as unprovisioned rather than falsifying zero-traffic telemetry.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Drill-down Modal */}
      <OrganizationStudentDetailModal
        organization={selectedOrg}
        onClose={() => setSelectedOrg(null)}
      />
    </div>
  );
}
