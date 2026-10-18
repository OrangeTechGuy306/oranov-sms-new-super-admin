'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Organization, OrganizationLifecycleStatus } from '@/lib/types';
import { generateCsvContent, downloadCsvFile } from '@/lib/utils/csv-export';
import {
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Building2,
} from 'lucide-react';

export default function OrganizationsDirectoryPage() {
  const router = useRouter();
  const { organizations, plans, campuses, evaluateOrganizationReadiness, setOrganizationStatus } = usePlatformStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [provisioningFilter, setProvisioningFilter] = useState('all');
  const [campusFilter, setCampusFilter] = useState('all');
  const [suspensionReason, setSuspensionReason] = useState('');

  // Confirmation dialog state for lifecycle actions
  const [confirmTarget, setConfirmTarget] = useState<{
    org: Organization;
    newStatus: OrganizationLifecycleStatus;
    actionLabel: string;
    variant: 'danger' | 'warning' | 'primary';
  } | null>(null);

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          org.name.toLowerCase().includes(q) ||
          org.code.toLowerCase().includes(q) ||
          org.subdomain.toLowerCase().includes(q) ||
          org.contact.email.toLowerCase().includes(q) ||
          org.administrator.name.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== 'all' && org.status !== statusFilter) {
        return false;
      }

      // Plan
      if (planFilter !== 'all' && org.planId !== planFilter) {
        return false;
      }

      // Classification
      if (classificationFilter !== 'all' && org.classification !== classificationFilter) {
        return false;
      }

      // Provisioning Status
      if (provisioningFilter !== 'all' && (org.provisioningStatus || 'not_started') !== provisioningFilter) {
        return false;
      }

      // Campus Count Filter
      if (campusFilter !== 'all') {
        const count = campuses.filter((c) => c.organizationId === org.id).length;
        if (campusFilter === 'zero' && count !== 0) return false;
        if (campusFilter === 'single' && count !== 1) return false;
        if (campusFilter === 'multi' && count < 2) return false;
      }

      return true;
    });
  }, [organizations, campuses, searchQuery, statusFilter, planFilter, classificationFilter, provisioningFilter, campusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPlanFilter('all');
    setClassificationFilter('all');
    setProvisioningFilter('all');
    setCampusFilter('all');
  };

  const handleExportCsv = () => {
    const headers = [
      'Organization ID',
      'Code',
      'School Name',
      'Classification',
      'Lifecycle Status',
      'Onboarding Status',
      'Plan ID',
      'Subdomain',
      'Campuses Count',
      'Readiness Score (%)',
      'Readiness Blockers',
      'Provisioning Status',
      'Primary Admin Name',
      'Admin Email',
      'Admin Phone',
      'Contact Email',
      'Contact Phone',
      'City',
      'Country',
      'Estimated Students',
      'Estimated Staff',
      'Created At',
    ];

    const rows = filteredOrganizations.map((o) => {
      const orgCampuses = campuses.filter((c) => c.organizationId === o.id);
      const readiness = evaluateOrganizationReadiness(o.id);
      return [
        o.id,
        o.code,
        o.name,
        o.classification,
        o.status,
        o.onboardingStatus,
        o.planId,
        `${o.subdomain}.schoolsaas.internal`,
        orgCampuses.length,
        readiness ? `${readiness.score}%` : 'N/A',
        readiness?.hasBlockers ? 'Yes' : 'No',
        o.provisioningStatus || 'not_started',
        o.administrator.name,
        o.administrator.email,
        o.administrator.phone,
        o.contact.email,
        o.contact.phone,
        o.contact.city,
        o.contact.country,
        o.studentCountEstimate ?? '',
        o.staffCountEstimate ?? '',
        o.createdAt,
      ];
    });

    const csv = generateCsvContent(headers, rows);
    downloadCsvFile(`school-organizations-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleConfirmAction = () => {
    if (!confirmTarget) return;
    const reason = confirmTarget.newStatus === 'suspended' ? suspensionReason : 'Super-admin lifecycle transition';
    setOrganizationStatus(
      confirmTarget.org.id,
      confirmTarget.newStatus,
      reason
    );
    setConfirmTarget(null);
    setSuspensionReason('');
  };

  const columns: Column<Organization>[] = [
    {
      key: 'organization',
      header: 'School Organization',
      render: (org) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {org.code.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <Link
              href={`/organizations/${org.id}`}
              className="font-semibold text-foreground hover:text-primary hover:underline truncate block"
            >
              {org.name}
            </Link>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono">
              <span>Code: {org.code}</span>
              <span>•</span>
              <span>{org.subdomain}.schoolsaas.internal</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'classification',
      header: 'Type',
      render: (org) => (
        <span className="capitalize text-xs font-medium text-muted-foreground">
          {org.classification.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (org) => <Badge status={org.status} dot size="sm" />,
    },
    {
      key: 'campuses',
      header: 'Campuses',
      render: (org) => {
        const orgCampuses = campuses.filter((c) => c.organizationId === org.id);
        const mainCampus = orgCampuses.find((c) => c.isMainCampus);
        return (
          <div className="flex flex-col text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              {orgCampuses.length} {orgCampuses.length === 1 ? 'Campus' : 'Campuses'}
            </span>
            {mainCampus && (
              <span className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={`Main: ${mainCampus.name}`}>
                Main: {mainCampus.name}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'plan',
      header: 'Plan Tier',
      render: (org) => {
        const plan = plans.find((p) => p.id === org.planId);
        return (
          <span className="font-medium text-xs text-foreground">
            {plan ? plan.name : 'Unknown Plan'}
          </span>
        );
      },
    },
    {
      key: 'readiness',
      header: 'Readiness',
      render: (org) => {
        const readiness = evaluateOrganizationReadiness(org.id);
        if (!readiness) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="flex flex-col gap-0.5">
            <Badge variant={readiness.hasBlockers ? 'warning' : 'success'} size="sm">
              {readiness.completedCount}/{readiness.totalCount} ({readiness.score}%)
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'provisioning',
      header: 'Provisioning',
      render: (org) => {
        const status = org.provisioningStatus || 'not_started';
        const variant: 'success' | 'error' | 'info' | 'neutral' =
          status === 'simulated_complete'
            ? 'success'
            : status === 'simulated_failed'
            ? 'error'
            : status === 'simulated_in_progress'
            ? 'info'
            : 'neutral';
        return (
          <Badge variant={variant} size="sm">
            {status.replace(/_/g, ' ')}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (org) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/organizations/${org.id}`}
            title="Inspect Organization"
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          {org.status === 'pending' ? (
            <button
              type="button"
              onClick={() =>
                setConfirmTarget({
                  org,
                  newStatus: 'active',
                  actionLabel: 'Approve & Activate School',
                  variant: 'primary',
                })
              }
              title="Activate Pending School"
              className="p-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          ) : org.status === 'active' ? (
            <button
              type="button"
              onClick={() =>
                setConfirmTarget({
                  org,
                  newStatus: 'suspended',
                  actionLabel: 'Suspend School',
                  variant: 'danger',
                })
              }
              title="Suspend School"
              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
          ) : org.status === 'suspended' ? (
            <button
              type="button"
              onClick={() =>
                setConfirmTarget({
                  org,
                  newStatus: 'active',
                  actionLabel: 'Reactivate School',
                  variant: 'primary',
                })
              }
              title="Reactivate School"
              className="p-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Organization Management"
        description="Search, inspect, and administer multi-tenant school organizations across the SaaS platform."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-3 py-2 bg-card border border-border text-foreground hover:bg-muted font-semibold text-xs rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
              Export Directory CSV
            </button>
            <Link
              href="/organizations/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              Onboard New School
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter by name, code, domain, or administrator..."
        resultCount={filteredOrganizations.length}
        onReset={handleResetFilters}
        filters={[
          {
            key: 'status',
            label: 'Lifecycle Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Lifecycle Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Pending Approval', value: 'pending' },
              { label: 'Suspended', value: 'suspended' },
              { label: 'Inactive / Deactivated', value: 'inactive' },
              { label: 'Draft', value: 'draft' },
              { label: 'Archived', value: 'archived' },
            ],
          },
          {
            key: 'plan',
            label: 'Subscription Plan',
            value: planFilter,
            onChange: setPlanFilter,
            options: [
              { label: 'All Subscription Plans', value: 'all' },
              ...plans.map((p) => ({ label: p.name, value: p.id })),
            ],
          },
          {
            key: 'campus',
            label: 'Campus Count',
            value: campusFilter,
            onChange: setCampusFilter,
            options: [
              { label: 'All Campus Counts', value: 'all' },
              { label: 'Single Campus (1)', value: 'single' },
              { label: 'Multi-Campus (2+)', value: 'multi' },
              { label: 'No Campuses (0)', value: 'zero' },
            ],
          },
          {
            key: 'provisioning',
            label: 'Provisioning Status',
            value: provisioningFilter,
            onChange: setProvisioningFilter,
            options: [
              { label: 'All Provisioning States', value: 'all' },
              { label: 'Not Started', value: 'not_started' },
              { label: 'Ready For Review', value: 'ready_for_review' },
              { label: 'Simulated In Progress', value: 'simulated_in_progress' },
              { label: 'Simulated Complete', value: 'simulated_complete' },
              { label: 'Simulated Failed', value: 'simulated_failed' },
              { label: 'Needs Attention', value: 'needs_attention' },
            ],
          },
          {
            key: 'classification',
            label: 'Classification',
            value: classificationFilter,
            onChange: setClassificationFilter,
            options: [
              { label: 'All School Classifications', value: 'all' },
              { label: 'K-12', value: 'k12' },
              { label: 'Primary', value: 'primary' },
              { label: 'Secondary', value: 'secondary' },
              { label: 'International', value: 'international' },
              { label: 'Higher Education', value: 'higher_education' },
              { label: 'Vocational College', value: 'vocational' },
            ],
          },
        ]}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredOrganizations}
        keyExtractor={(org) => org.id}
        pageSize={8}
        onRowClick={(org) => router.push(`/organizations/${org.id}`)}
        emptyMessage="No school organizations matched your search criteria."
      />

      {/* Consequential Action Confirmation Dialog */}
      {confirmTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => {
            setConfirmTarget(null);
            setSuspensionReason('');
          }}
          onConfirm={handleConfirmAction}
          title={`${confirmTarget.actionLabel} — ${confirmTarget.org.name}`}
          variant={confirmTarget.variant}
          confirmLabel={confirmTarget.actionLabel}
          isConfirmDisabled={confirmTarget.newStatus === 'suspended' && suspensionReason.trim().length < 5}
          description={
            <div className="space-y-3">
              {confirmTarget.newStatus === 'suspended' ? (
                <>
                  <p>
                    Are you sure you want to transition{' '}
                    <strong className="text-foreground">{confirmTarget.org.name}</strong> to{' '}
                    <strong className="text-rose-600">Suspended</strong> status? In production, this
                    restricts portal login for teachers, students, and parents.
                  </p>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-foreground block">
                      Mandatory Justification / Suspension Reason <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      placeholder="e.g. Non-payment of renewal invoice after dunning period, pending trustee review..."
                      rows={3}
                      className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {suspensionReason.trim().length > 0 && suspensionReason.trim().length < 5 && (
                      <p className="text-[11px] text-rose-500">Reason must be at least 5 characters (currently {suspensionReason.trim().length}).</p>
                    )}
                  </div>
                </>
              ) : confirmTarget.org.status === 'pending' ? (
                <p>
                  Confirm activation for <strong className="text-foreground">{confirmTarget.org.name}</strong> ({confirmTarget.org.code}). This will transition the school to active status and authorize standard tenant operations.
                </p>
              ) : (
                <p>
                  Are you sure you want to restore active service for{' '}
                  <strong className="text-foreground">{confirmTarget.org.name}</strong>?
                </p>
              )}
            </div>
          }
          disclaimer="Development Mock State: Updating this status changes local development fixtures only. It does not block actual tenant login until backend authorization is fully implemented."
        />
      )}
    </div>
  );
}
