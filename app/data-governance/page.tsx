'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { GovernanceNotice } from '@/components/data-governance/GovernanceNotice';
import { GovernanceOverviewTab } from '@/components/data-governance/GovernanceOverviewTab';
import { DataInventoryTab } from '@/components/data-governance/DataInventoryTab';
import { RetentionPoliciesTab } from '@/components/data-governance/RetentionPoliciesTab';
import { PrivacyRequestsTab } from '@/components/data-governance/PrivacyRequestsTab';
import { LifecycleRulesTab } from '@/components/data-governance/LifecycleRulesTab';
import { TenantGovernanceTab } from '@/components/data-governance/TenantGovernanceTab';
import { PolicyExceptionsTab } from '@/components/data-governance/PolicyExceptionsTab';
import { GovernanceAuditTab } from '@/components/data-governance/GovernanceAuditTab';
import { GovernanceDocsTab } from '@/components/data-governance/GovernanceDocsTab';
import { exportGovernancePackage } from '@/lib/data-governance/exporter';

import {
  Database,
  Layers,
  Clock,
  UserCheck,
  FileText,
  Building2,
  AlertTriangle,
  ShieldCheck,
  BookOpen,
  Download,
  RotateCcw,
} from 'lucide-react';
import {
  PolicyApprovalStatus,
  RetentionPolicyStatus,
  PrivacyWorkflowStatus,
  PrivacyResolutionCategory,
} from '@/lib/types/data-governance';

function DataGovernanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const {
    dataCategories,
    governanceRetentionPolicies,
    privacyRequests,
    lifecycleRules,
    governanceExceptions,
    getTenantGovernanceSummaries,
    getGovernanceMetrics,
    getGovernanceAuditLogs,
    updateDataCategory,
    createGovernanceRetentionPolicy,
    reviewGovernanceRetentionPolicy,
    updatePrivacyRequestStatus,
    simulatePrivacyRequestProcessing,
    createDataLifecycleRule,
    toggleDataLifecycleRule,
    createGovernanceException,
    reviewGovernanceException,
    resetToDefaults,
    addToast,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [, startTransition] = useTransition();

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    startTransition(() => {
      router.push(`/data-governance?tab=${newTab}`, { scroll: false });
    });
  };

  const metrics = getGovernanceMetrics();
  const tenantSummaries = getTenantGovernanceSummaries();
  const auditLogs = getGovernanceAuditLogs();

  const tabs = [
    { id: 'overview', label: 'Governance Overview', icon: <Layers className="h-3.5 w-3.5" /> },
    { id: 'inventory', label: 'Data Inventory', icon: <Database className="h-3.5 w-3.5" />, count: dataCategories.length },
    { id: 'retention', label: 'Retention Policies', icon: <Clock className="h-3.5 w-3.5" />, count: governanceRetentionPolicies.length },
    {
      id: 'requests',
      label: 'Privacy Requests',
      icon: <UserCheck className="h-3.5 w-3.5" />,
      count: metrics.openPrivacyRequestsCount > 0 ? metrics.openPrivacyRequestsCount : undefined,
    },
    { id: 'lifecycle', label: 'Lifecycle Rules', icon: <FileText className="h-3.5 w-3.5" />, count: lifecycleRules.length },
    { id: 'tenants', label: 'Tenant Governance', icon: <Building2 className="h-3.5 w-3.5" />, count: tenantSummaries.length },
    {
      id: 'exceptions',
      label: 'Policy Exceptions',
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      count: metrics.exceptionsAwaitingReviewCount > 0 ? metrics.exceptionsAwaitingReviewCount : undefined,
    },
    { id: 'audit', label: 'Governance Audit', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    { id: 'docs', label: 'Readiness & Docs', icon: <BookOpen className="h-3.5 w-3.5" /> },
  ];

  const handleQuickExport = () => {
    try {
      exportGovernancePackage({
        categories: dataCategories,
        policies: governanceRetentionPolicies,
        requests: privacyRequests,
        lifecycleRules,
        tenants: tenantSummaries,
        exceptions: governanceExceptions,
        auditLogs,
        format: 'json',
      });
      addToast({
        title: 'Governance Package Exported',
        message: 'Complete data inventory and policy metadata downloaded as sanitized JSON.',
        type: 'success',
      });
    } catch (err: unknown) {
      addToast({
        title: 'Export Failed',
        message: err instanceof Error ? err.message : 'Failed to export governance package.',
        type: 'error',
      });
    }
  };

  const handleReviewPolicy = (
    id: string,
    outcome: RetentionPolicyStatus,
    _notes: string,
    nextReviewDate: string
  ) => {
    const approvalOutcome: PolicyApprovalStatus =
      outcome === 'approved_demo' || outcome === 'active_config'
        ? 'approved_demo'
        : outcome === 'awaiting_review'
        ? 'unreviewed'
        : 'internally_reviewed';
    const res = reviewGovernanceRetentionPolicy(id, approvalOutcome, nextReviewDate);
    if (res.success) {
      addToast({
        title: 'Retention Policy Reviewed',
        message: `Policy status updated to ${outcome} with next review scheduled for ${nextReviewDate}.`,
        type: 'success',
      });
    } else {
      addToast({
        title: 'Review Failed',
        message: res.error || 'Failed to update retention policy review status.',
        type: 'error',
      });
    }
  };

  const handleUpdatePrivacyStatus = (
    id: string,
    status: PrivacyWorkflowStatus,
    resolutionCategory?: PrivacyResolutionCategory,
    reviewNotes?: string
  ) => {
    const res = updatePrivacyRequestStatus(id, status, reviewNotes || '', resolutionCategory);
    if (res.success) {
      addToast({
        title: 'Privacy Request Updated',
        message: `Request status transitioned to ${status.replace(/_/g, ' ')}.`,
        type: 'success',
      });
    } else {
      addToast({
        title: 'Update Rejected',
        message: res.error || 'Invalid state transition for privacy request.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Governance & Privacy"
        description="Review educational data categories, configure statutory retention schedules, manage simulated privacy requests, and audit multi-tenant compliance posture."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleQuickExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Export Package
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset data governance records to deterministic baseline?')) {
                  resetToDefaults();
                  addToast({
                    title: 'Store Reset',
                    message: 'All governance fixtures and configurations restored to initial seed state.',
                    type: 'info',
                  });
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        }
      />

      {/* Scope Disclaimer Banner */}
      <GovernanceNotice />

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <GovernanceOverviewTab metrics={metrics} onNavigateTab={handleTabChange} />
        )}

        {activeTab === 'inventory' && (
          <DataInventoryTab
            categories={dataCategories}
            retentionPolicies={governanceRetentionPolicies}
            onUpdateCategory={updateDataCategory}
          />
        )}

        {activeTab === 'retention' && (
          <RetentionPoliciesTab
            policies={governanceRetentionPolicies}
            categories={dataCategories}
            onCreatePolicy={createGovernanceRetentionPolicy}
            onReviewPolicy={handleReviewPolicy}
          />
        )}

        {activeTab === 'requests' && (
          <PrivacyRequestsTab
            requests={privacyRequests}
            onUpdateStatus={handleUpdatePrivacyStatus}
            onSimulateProcessing={simulatePrivacyRequestProcessing}
          />
        )}

        {activeTab === 'lifecycle' && (
          <LifecycleRulesTab
            rules={lifecycleRules}
            categories={dataCategories}
            onToggleRule={toggleDataLifecycleRule}
            onCreateRule={createDataLifecycleRule}
          />
        )}

        {activeTab === 'tenants' && (
          <TenantGovernanceTab tenants={tenantSummaries} onNavigateTab={handleTabChange} />
        )}

        {activeTab === 'exceptions' && (
          <PolicyExceptionsTab
            exceptions={governanceExceptions}
            policies={governanceRetentionPolicies}
            categories={dataCategories}
            onCreateException={createGovernanceException}
            onReviewException={reviewGovernanceException}
          />
        )}

        {activeTab === 'audit' && <GovernanceAuditTab auditLogs={auditLogs} />}

        {activeTab === 'docs' && (
          <GovernanceDocsTab
            categories={dataCategories}
            policies={governanceRetentionPolicies}
            requests={privacyRequests}
            rules={lifecycleRules}
            tenants={tenantSummaries}
            exceptions={governanceExceptions}
            auditLogs={auditLogs}
            onResetDefaults={() => {
              resetToDefaults();
              addToast({
                title: 'Reset Completed',
                message: 'Governance demonstration baseline reloaded.',
                type: 'info',
              });
            }}
            addToast={addToast}
          />
        )}
      </div>
    </div>
  );
}

export default function DataGovernancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
          Loading Data Governance Workspace...
        </div>
      }
    >
      <DataGovernanceContent />
    </Suspense>
  );
}
