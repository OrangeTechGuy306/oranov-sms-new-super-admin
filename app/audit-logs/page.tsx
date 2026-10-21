'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import {
  AuditEvent,
  AuditEventCategory,
  AuditEventSeverity,
  AuditEventOutcome,
} from '@/lib/types/audit-logs';
import {
  filterAuditEvents,
  computeAuditComplianceMetrics,
} from '@/lib/compliance/evaluator';
import { AuditGovernanceNotice } from '@/components/audit/AuditGovernanceNotice';
import { AuditLogSummaryCards } from '@/components/audit/AuditLogSummaryCards';
import { AuditExplorerTable } from '@/components/audit/AuditExplorerTable';
import { AuditEventDetailModal } from '@/components/audit/AuditEventDetailModal';
import { AdminActivityTimeline } from '@/components/audit/AdminActivityTimeline';
import { SecurityEventsWorkspace } from '@/components/audit/SecurityEventsWorkspace';
import { ComplianceControlInventory } from '@/components/audit/ComplianceControlInventory';
import { EvidenceRemediationWorkspace } from '@/components/audit/EvidenceRemediationWorkspace';
import { DataRetentionPolicyWorkspace } from '@/components/audit/DataRetentionPolicyWorkspace';
import { AuditExportModal } from '@/components/audit/AuditExportModal';
import {
  FileText,
  History,
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  Archive,
  Download,
} from 'lucide-react';

export default function AuditLogsPage() {
  const {
    auditEvents,
    securityEvents,
    complianceControls,
    governanceEvidence,
    retentionPolicies,
    organizations,
    updateSecurityEventTriage,
    updateComplianceControlRemediation,
    updateGovernanceEvidenceStatus,
    updateRetentionPolicy,
    logAuditEvent,
  } = usePlatformStore();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<string>('explorer');

  // Filter state for Tab 1 (Explorer)
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('timestamp_desc');

  // Modal states
  const [inspectEvent, setInspectEvent] = useState<AuditEvent | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filtered audit events for Explorer
  const filteredEvents = useMemo(() => {
    return filterAuditEvents(auditEvents, {
      searchQuery,
      category: categoryFilter as AuditEventCategory | 'all',
      severity: severityFilter as AuditEventSeverity | 'all',
      status: statusFilter as AuditEventOutcome | 'all',
      organizationId: orgFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy: sortBy as 'timestamp_desc' | 'timestamp_asc' | 'severity' | 'action',
    });
  }, [
    auditEvents,
    searchQuery,
    categoryFilter,
    severityFilter,
    statusFilter,
    orgFilter,
    startDate,
    endDate,
    sortBy,
  ]);

  // Overall compliance & governance metrics
  const governanceMetrics = useMemo(() => {
    return computeAuditComplianceMetrics(
      auditEvents,
      securityEvents,
      complianceControls,
      governanceEvidence,
      retentionPolicies
    );
  }, [
    auditEvents,
    securityEvents,
    complianceControls,
    governanceEvidence,
    retentionPolicies,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSeverityFilter('all');
    setStatusFilter('all');
    setOrgFilter('all');
    setStartDate('');
    setEndDate('');
    setSortBy('timestamp_desc');
  };

  const handleLogExportAction = (details: string, format: string, scopeCount: number) => {
    logAuditEvent({
      category: 'data_export',
      action: 'AUDIT_DATA_EXPORTED',
      severity: 'info',
      status: 'succeeded',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'AuditReport',
      targetId: `exp_${Date.now().toString(36)}`,
      targetName: `Platform Audit Export (${format.toUpperCase()})`,
      details,
      metadata: { format, recordCount: scopeCount },
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });
  };

  const tabs: TabItem[] = [
    {
      id: 'explorer',
      label: 'Audit Trail Explorer',
      icon: <FileText className="w-3.5 h-3.5" />,
      count: filteredEvents.length,
    },
    {
      id: 'activity',
      label: 'Administrative Activity Feed',
      icon: <History className="w-3.5 h-3.5" />,
    },
    {
      id: 'security',
      label: 'Security Events & Triage',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      count: governanceMetrics.unreviewedSecurityEvents > 0 ? governanceMetrics.unreviewedSecurityEvents : undefined,
    },
    {
      id: 'compliance',
      label: 'Compliance Controls',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      count: complianceControls.length,
    },
    {
      id: 'evidence',
      label: 'Evidence & Verification',
      icon: <FileCheck className="w-3.5 h-3.5" />,
      count: governanceEvidence.length,
    },
    {
      id: 'retention',
      label: 'Retention & Legal Holds',
      icon: <Archive className="w-3.5 h-3.5" />,
      count: retentionPolicies.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Platform Audit Logs, Compliance & Security Governance"
        description="Unified Super-Admin control plane for chronological audit trails, administrative activity feeds, security-event triage, framework-mapped controls, verifiable evidence, and statutory retention policies."
        actions={
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-card border border-border text-foreground font-semibold text-xs rounded-lg hover:bg-muted transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export Governance Data</span>
          </button>
        }
      />

      {/* Governance Sandbox Notice */}
      <AuditGovernanceNotice />

      {/* Summary StatCards */}
      <AuditLogSummaryCards
        metrics={governanceMetrics}
        filteredCount={activeTab === 'explorer' ? filteredEvents.length : undefined}
      />

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Audit Trail Explorer */}
      {activeTab === 'explorer' && (
        <AuditExplorerTable
          events={filteredEvents}
          totalEventsCount={auditEvents.length}
          organizations={organizations}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          severityFilter={severityFilter}
          onSeverityChange={setSeverityFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          orgFilter={orgFilter}
          onOrgChange={setOrgFilter}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onResetFilters={handleResetFilters}
          onInspectEvent={setInspectEvent}
        />
      )}

      {/* Tab 2: Administrative Activity Feed */}
      {activeTab === 'activity' && (
        <AdminActivityTimeline
          events={auditEvents}
          onInspectEvent={setInspectEvent}
        />
      )}

      {/* Tab 3: Security Events & Triage */}
      {activeTab === 'security' && (
        <SecurityEventsWorkspace
          events={securityEvents}
          onUpdateTriage={updateSecurityEventTriage}
        />
      )}

      {/* Tab 4: Compliance Controls */}
      {activeTab === 'compliance' && (
        <ComplianceControlInventory
          controls={complianceControls}
          evidenceList={governanceEvidence}
          onUpdateRemediation={updateComplianceControlRemediation}
        />
      )}

      {/* Tab 5: Evidence & Verification */}
      {activeTab === 'evidence' && (
        <EvidenceRemediationWorkspace
          evidenceList={governanceEvidence}
          onUpdateEvidenceStatus={updateGovernanceEvidenceStatus}
        />
      )}

      {/* Tab 6: Data Retention & Legal Holds */}
      {activeTab === 'retention' && (
        <DataRetentionPolicyWorkspace
          policies={retentionPolicies}
          onUpdatePolicy={updateRetentionPolicy}
        />
      )}

      {/* Audit Event Detail Inspection Modal */}
      {inspectEvent && (
        <AuditEventDetailModal
          event={inspectEvent}
          onClose={() => setInspectEvent(null)}
          organizationName={
            inspectEvent.organizationId
              ? organizations.find((o) => o.id === inspectEvent.organizationId)?.name
              : undefined
          }
        />
      )}

      {/* Unified Export Modal */}
      <AuditExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filteredEvents={filteredEvents}
        allEvents={auditEvents}
        controls={complianceControls}
        securityEvents={securityEvents}
        onLogExportAction={handleLogExportAction}
      />
    </div>
  );
}
