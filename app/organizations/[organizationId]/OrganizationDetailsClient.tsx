'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Invoice, OrganizationLifecycleStatus, PaymentMethodType } from '@/lib/types';
import {
  Building2,
  CreditCard,
  FileText,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Save,
  Activity,
  Sliders,
  Sparkles,
  Building,
  Server,
  LifeBuoy,
  CheckSquare,
  ShieldAlert,
  Lock,
  Eye,
} from 'lucide-react';
import { OrganizationEntitlementsPanel } from '@/components/modules/OrganizationEntitlementsPanel';
import { ModuleDetailModal } from '@/components/modules/ModuleDetailModal';
import { TenantModuleDefinition } from '@/lib/modules/types';
import { CampusManagementPanel } from '@/components/campuses/CampusManagementPanel';
import { ReadinessAndProvisioningPanel } from '@/components/readiness/ReadinessAndProvisioningPanel';
import {
  getAvailableTransitions,
  getTenantLifecycleStateMeta,
} from '@/lib/lifecycle/evaluator';
import { evaluateOnboardingChecklist } from '@/lib/lifecycle/canonical-onboarding';
import { normalizeSchoolCategories } from '@/lib/api/tenantContractAdapter';

interface ClientProps {
  organizationId: string;
}

export function OrganizationDetailsClient({ organizationId }: ClientProps) {
  const { can } = usePlatformAuth();
  const canManageLifecycle = can('organizations.lifecycle.manage');
  const canUpdateOrg = can('organizations.update');
  const canRecordPayment = can('billing.payments.manage');
  const {
    getOrganizationById,
    getSubscriptionByOrgId,
    getInvoicesByOrgId,
    getAuditEvents,
    getCampusesByOrgId,
    evaluateOrganizationReadiness,
    getSupportTickets,
    csTasks,
    platformApprovals,
    operationalExceptions,
    plans,
    updateOrganization,
    setOrganizationStatus,
    recordPayment,
  } = usePlatformStore();

  const org = getOrganizationById(organizationId);
  const subscription = getSubscriptionByOrgId(organizationId);
  const invoices = getInvoicesByOrgId(organizationId);
  const orgAuditEvents = getAuditEvents().filter(
    (e) => e.organizationId === organizationId || e.targetId === organizationId
  );
  const orgSupportTickets = getSupportTickets({ organizationId });
  const orgTasks = csTasks.filter((t) => t.organizationId === organizationId);
  const orgApprovals = platformApprovals.filter((a) => a.organizationId === organizationId);
  const orgExceptions = operationalExceptions.filter(
    (ex) => ex.organizationId === organizationId && ex.status !== 'resolved' && ex.status !== 'dismissed'
  );
  const orgCampuses = getCampusesByOrgId(organizationId);
  const mainCampus = orgCampuses.find((c) => c.isMainCampus);
  const readiness = org ? evaluateOrganizationReadiness(organizationId) : null;
  const availableTransitions = org ? getAvailableTransitions(org.status) : [];
  const lifecycleMeta = org ? getTenantLifecycleStateMeta(org.status) : null;
  const orgCategories = org
    ? normalizeSchoolCategories(org.classification, org.institutionCategories)
    : [];
  const onboardingSummary = org
    ? evaluateOnboardingChecklist({
        institutionCategories: orgCategories,
        organizationName: org.name,
        organizationCode: org.code,
        organizationEmail: org.contact.email,
        organizationPhone: org.contact.phone,
        organizationCountry: org.contact.country,
        hasClassification: Boolean(org.classification),
        hasBranding: org.academicSetup?.hasBranding,
        campusCount: orgCampuses.length,
        hasMainCampus: Boolean(mainCampus),
        mainCampusHasLocation: Boolean(mainCampus?.address?.city && mainCampus?.address?.country),
        sessionsCount: org.academicSetup?.sessionsCount ?? (org.onboardingStatus === 'completed' ? 1 : 0),
        termsCount: org.academicSetup?.termsCount ?? (org.onboardingStatus === 'completed' ? 3 : 0),
        classesOrProgrammesCount:
          org.academicSetup?.classesOrProgrammesCount ?? (org.onboardingStatus === 'completed' ? 1 : 0),
        subjectsOrModulesCount:
          org.academicSetup?.subjectsOrModulesCount ?? (org.onboardingStatus === 'completed' ? 1 : 0),
        primaryAdminName: org.administrator.name,
        primaryAdminEmail: org.administrator.email,
        staffSetupCount: org.academicSetup?.staffSetupCount ?? 0,
        hasPlanAssigned: Boolean(org.planId),
        subscriptionStatus: subscription?.status || org.subscriptionStatus,
        settingsReviewed: org.academicSetup?.settingsReviewed ?? org.onboardingStatus === 'completed',
        skippedItemIds: org.academicSetup?.skippedItemIds,
      })
    : null;

  const [activeTab, setActiveTab] = useState('overview');
  const [inspectedModule, setInspectedModule] = useState<TenantModuleDefinition | null>(null);

  // Lifecycle confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    newStatus: OrganizationLifecycleStatus;
    title: string;
    variant: 'danger' | 'warning' | 'primary';
    requiresReason?: boolean;
    minReasonLength?: number;
    requiresConfirmationCode?: boolean;
    restrictions?: string[];
    associatedSubscriptionGuidance?: string;
    description?: string;
    confirmLabel?: string;
  } | null>(null);
  const [lifecycleReason, setLifecycleReason] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  // Payment Recording Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethodType>('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');


  // Editable Profile State
  const [prevOrg, setPrevOrg] = useState(org);
  const [editName, setEditName] = useState(org?.name || '');
  const [editNotes, setEditNotes] = useState(org?.notes || '');
  const [editPhone, setEditPhone] = useState(org?.contact.phone || '');
  const [editAddress, setEditAddress] = useState(org?.contact.address || '');

  if (org && org !== prevOrg) {
    setPrevOrg(org);
    setEditName(org.name);
    setEditNotes(org.notes || '');
    setEditPhone(org.contact.phone);
    setEditAddress(org.contact.address);
  }

  if (!org) {
    return (
      <div className="space-y-6">
        <PageHeader title="Organization Not Found" backUrl="/organizations" />
        <EmptyState
          icon={<Building2 className="w-12 h-12 text-muted-foreground" />}
          title="Organization Record Not Found"
          description={`No school organization exists with identifier "${organizationId}" in the development store.`}
          action={
            <Link
              href="/organizations"
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg"
            >
              Back to Organizations Directory
            </Link>
          }
        />
      </div>
    );
  }

  const assignedPlan = plans.find((p) => p.id === org.planId) || plans[0];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization(org.id, {
      name: editName,
      notes: editNotes,
      contact: {
        phone: editPhone,
        address: editAddress,
      },
    });
  };

  const handleConfirmStatusChange = () => {
    if (!confirmModal || !org) return;
    const reason = confirmModal.requiresReason ? lifecycleReason : 'Super-admin manual lifecycle transition';
    setOrganizationStatus(org.id, confirmModal.newStatus, reason, {
      confirmationCode: confirmModal.requiresConfirmationCode ? confirmationCode : undefined,
    });
    setConfirmModal(null);
    setLifecycleReason('');
    setConfirmationCode('');
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    setPayError('');

    const res = recordPayment({
      invoiceId: paymentModalInvoice.id,
      amount: Number(payAmount),
      method: payMethod,
      referenceNumber: payRef,
      notes: payNotes,
    });

    if (res.success) {
      setPaymentModalInvoice(null);
    } else if (res.error) {
      setPayError(res.error);
    }
  };

  const invoiceColumns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv) => <span className="font-semibold text-foreground font-mono text-xs">{inv.invoiceNumber}</span>,
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      render: (inv) => <span className="text-muted-foreground font-mono text-xs">{formatDate(inv.issueDate)}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv) => <span className="text-muted-foreground font-mono text-xs">{formatDate(inv.dueDate)}</span>,
    },
    {
      key: 'amount',
      header: 'Amount Due',
      render: (inv) => <span className="font-bold text-foreground text-xs">{formatCurrency(inv.amountDue, inv.currency)}</span>,
    },
    {
      key: 'amountPaid',
      header: 'Amount Paid',
      render: (inv) => <span className="text-foreground text-xs font-mono">{formatCurrency(inv.amountPaid || 0, inv.currency)}</span>,
    },
    {
      key: 'balance',
      header: 'Outstanding Balance',
      render: (inv) => {
        const bal = Math.max(0, (inv.amountDue || 0) - (inv.amountPaid || 0));
        return (
          <span className={`text-xs font-bold font-mono ${bal > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
            {formatCurrency(bal, inv.currency)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv) => <Badge status={inv.status} size="sm" />,
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      render: (inv) => {
        const bal = Math.max(0, (inv.amountDue || 0) - (inv.amountPaid || 0));
        if (inv.status === 'paid' || bal <= 0 || inv.status === 'void' || !canRecordPayment) return null;
        return (
          <button
            type="button"
            onClick={() => {
              setPaymentModalInvoice(inv);
              setPayAmount(bal);
              setPayRef(`PAY-MOCK-${Math.floor(100000 + Math.random() * 900000)}`);
              setPayError('');
              setPayNotes('');
            }}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors shadow-2xs"
          >
            Record Payment
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={org.name}
        description={`Organization Code: ${org.code} • Subdomain: ${org.subdomain}.schoolsaas.internal`}
        backUrl="/organizations"
        badge={
          <div className="flex items-center gap-1.5 ml-2 flex-wrap">
            <Badge status={org.status} dot size="md" />
            <Badge status={subscription?.status || org.subscriptionStatus || 'active'} size="sm">
              Sub: {(subscription?.status || org.subscriptionStatus || 'active').replace(/_/g, ' ')}
            </Badge>
            <Badge status={org.paymentStatus || 'paid'} size="sm">
              Pay: {(org.paymentStatus || 'paid').replace(/_/g, ' ')}
            </Badge>
            <Badge status={org.onboardingStatus} size="sm">
              Onboarding: {onboardingSummary?.overallPercentage ?? 0}%
            </Badge>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted font-medium text-muted-foreground border border-border">
              {orgCampuses.length} {orgCampuses.length === 1 ? 'Campus' : 'Campuses'}
            </span>
            {org.provisioningStatus && (
              <Badge status={org.provisioningStatus} size="sm">
                Prep: {org.provisioningStatus.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/organizations/${org.id}/subscription`}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted flex items-center gap-1.5 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Manage Subscription
            </Link>

            {canManageLifecycle && availableTransitions.map((rule) => (
              <button
                key={rule.to}
                type="button"
                onClick={() => {
                  setLifecycleReason('');
                  setConfirmationCode('');
                  setConfirmModal({
                    newStatus: rule.to,
                    title: `${rule.actionLabel}: ${org.name}`,
                    variant: rule.variant === 'neutral' ? 'primary' : rule.variant,
                    requiresReason: rule.requiresReason,
                    minReasonLength: rule.minReasonLength || 5,
                    requiresConfirmationCode: rule.requiresConfirmationCode,
                    restrictions: rule.restrictions,
                    associatedSubscriptionGuidance: rule.associatedSubscriptionGuidance,
                    description: rule.description,
                    confirmLabel: rule.actionLabel,
                  });
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                  rule.variant === 'danger'
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : rule.variant === 'warning'
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {rule.variant === 'danger' ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                {rule.actionLabel}
              </button>
            ))}
          </div>
        }
      />

      {/* Tabs Bar */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'overview', label: 'Overview', icon: <Building2 className="w-3.5 h-3.5" /> },
          { id: 'campuses', label: 'Campuses & Branches', icon: <Building className="w-3.5 h-3.5" />, count: orgCampuses.length },
          { id: 'readiness', label: 'Readiness & Provisioning', icon: <Server className="w-3.5 h-3.5" /> },
          { id: 'profile', label: 'Organization Profile', icon: <FileText className="w-3.5 h-3.5" /> },
          { id: 'subscription', label: 'Subscription & Billing', icon: <CreditCard className="w-3.5 h-3.5" /> },
          { id: 'entitlements', label: 'Feature Entitlements', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'technical', label: 'Technical & Quotas', icon: <Sliders className="w-3.5 h-3.5" /> },
          { id: 'onboarding', label: 'Onboarding Checklist', icon: <CheckCircle className="w-3.5 h-3.5" /> },
          {
            id: 'support_ops',
            label: 'Support & Issues',
            icon: <LifeBuoy className="w-3.5 h-3.5" />,
            count: orgSupportTickets.length + orgExceptions.length,
          },
          {
            id: 'tasks_approvals',
            label: 'Tasks & Approvals',
            icon: <CheckSquare className="w-3.5 h-3.5" />,
            count: orgTasks.length + orgApprovals.length,
          },
          { id: 'activity', label: 'Activity History', icon: <Activity className="w-3.5 h-3.5" />, count: orgAuditEvents.length },
        ]}
      />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* School Profile Card */}
            <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
              <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground border-b border-border/50 pb-2">
                Identity & Classification
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Classification:</span>
                  <p className="font-semibold text-foreground capitalize mt-0.5">
                    {org.classification.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Portal Address:</span>
                  <p className="font-mono text-primary mt-0.5 flex items-center gap-1">
                    https://{org.subdomain}.schoolsaas.internal
                    <ExternalLink className="w-3 h-3" />
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Registered Since:</span>
                  <p className="text-foreground font-mono mt-0.5">{formatDate(org.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Administrator Card */}
            <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
              <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground border-b border-border/50 pb-2">
                Primary Administrator
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Full Name:</span>
                  <p className="font-semibold text-foreground mt-0.5">{org.administrator.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Role:</span>
                  <p className="text-foreground mt-0.5">{org.administrator.roleTitle}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Direct Email:</span>
                  <p className="font-mono text-foreground mt-0.5">{org.administrator.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-mono text-foreground mt-0.5">{org.administrator.phone}</p>
                </div>
              </div>
            </div>

            {/* Subscription Summary Card */}
            <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                  Current Subscription
                </h3>
                <Link
                  href={`/organizations/${org.id}/subscription`}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Change
                </Link>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Plan Tier:</span>
                  <p className="font-bold text-base text-foreground mt-0.5">{assignedPlan.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Billing Cycle:</span>
                  <p className="font-semibold capitalize text-foreground mt-0.5">
                    {subscription?.billingCycle || 'annual'} (
                    {formatCurrency(
                      subscription?.billingCycle === 'monthly'
                        ? assignedPlan.priceMonthly
                        : assignedPlan.priceAnnual,
                      assignedPlan.currency
                    )}
                    )
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Subscription Status:</span>
                  <div className="mt-1">
                    <Badge status={subscription?.status || 'active'} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Campuses, Readiness, and Provisioning Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Campuses Topology Card */}
            <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                  Campuses & Branches
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('campuses')}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  Manage
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Registered Sites:</span>
                  <p className="font-bold text-base text-foreground mt-0.5">
                    {orgCampuses.length} {orgCampuses.length === 1 ? 'Campus' : 'Campuses'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Main Campus Site:</span>
                  <p className="text-foreground font-medium mt-0.5 truncate">
                    {mainCampus ? `${mainCampus.name} (${mainCampus.code})` : 'None designated'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Allocated Quota:</span>
                  <p className="text-muted-foreground mt-0.5">
                    {orgCampuses.length} of {assignedPlan.maxCampuses || org.technicalConfig.maxCampuses || 1} allowed
                  </p>
                </div>
              </div>
            </div>

            {/* Configuration Readiness Card */}
            <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                  Configuration Readiness
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('readiness')}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  Audit
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Completeness Score:</span>
                  <p className="font-bold text-base text-foreground mt-0.5">
                    {readiness ? `${readiness.score}%` : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Checklist Status:</span>
                  <div className="mt-1">
                    {readiness?.hasBlockers ? (
                      <Badge variant="warning">Prerequisites Incomplete</Badge>
                    ) : (
                      <Badge variant="success">All Checks Cleared</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Completed Checks:</span>
                  <p className="text-muted-foreground mt-0.5">
                    {readiness ? `${readiness.completedCount} of ${readiness.totalCount} items passed` : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Provisioning Simulation Card */}
            <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
                  Simulated Provisioning
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('readiness')}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  Console
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Simulation State:</span>
                  <div className="mt-1">
                    <Badge
                      variant={
                        org.provisioningStatus === 'simulated_complete'
                          ? 'success'
                          : org.provisioningStatus === 'simulated_failed'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {(org.provisioningStatus || 'not_started').replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Environment Tier:</span>
                  <p className="font-mono text-muted-foreground mt-0.5">Local Development Mock</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Next Action:</span>
                  <p className="text-muted-foreground mt-0.5">
                    {org.provisioningStatus === 'simulated_complete'
                      ? 'Ready for tenant portal simulation'
                      : 'Run simulation from readiness tab'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Administrative Notes Banner */}
          {org.notes && (
            <div className="p-4 bg-muted/40 rounded-xl border border-border text-xs space-y-1">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                Platform Internal Notes:
              </span>
              <p className="text-foreground/90 leading-relaxed">{org.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Campuses & Branches (Phase E-09.7) */}
      {activeTab === 'campuses' && (
        <CampusManagementPanel organization={org} />
      )}

      {/* Tab: Readiness & Provisioning (Phase E-09.7) */}
      {activeTab === 'readiness' && (
        <ReadinessAndProvisioningPanel
          organization={org}
          onNavigateTab={(tabId) => setActiveTab(tabId)}
        />
      )}

      {/* Tab 2: Profile (Editable) */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-6">
          <div className="border-b border-border/50 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Organization Profile Details</h3>
              <p className="text-xs text-muted-foreground">Update legal entity information and contact coordinates.</p>
            </div>
            {canUpdateOrg && (
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Organization Display Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Institutional Phone</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">Campus Street Address</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">Internal Administrative Notes</label>
              <textarea
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Subscription & Billing */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Assigned Subscription Plan</h3>
                <p className="text-xs text-muted-foreground">Current tier, billing period, and allocated resource ceilings.</p>
              </div>
              <Link
                href={`/organizations/${org.id}/subscription`}
                className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Change Plan / Cadence
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[11px]">Current Plan</span>
                <p className="font-bold text-sm text-foreground mt-0.5">{assignedPlan.name}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[11px]">Billing Cycle</span>
                <p className="font-bold text-sm text-foreground capitalize mt-0.5">{subscription?.billingCycle || 'annual'}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[11px]">Period Ends</span>
                <p className="font-mono text-foreground mt-0.5">{formatDate(subscription?.currentPeriodEnd)}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground text-[11px]">Storage Allocated</span>
                <p className="font-bold text-sm text-foreground mt-0.5">{assignedPlan.storageGb} GB</p>
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Invoice History</h3>
            <DataTable
              columns={invoiceColumns}
              data={invoices}
              keyExtractor={(inv) => inv.id}
              emptyMessage="No billing invoices have been issued for this organization."
            />
          </div>
        </div>
      )}

      {/* Tab 4: Onboarding Progress (Live Adaptable Evaluator) */}
      {activeTab === 'onboarding' && onboardingSummary && (
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                Adaptable Onboarding Progress & Setup Checklist
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Derived deterministically for category profile [{onboardingSummary.adaptedForCategories.join(', ')}] —
                never calculated from hardcoded percentages.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge status={onboardingSummary.derivedStatus} size="md" />
              <span className="text-xl font-extrabold text-foreground">
                {onboardingSummary.overallPercentage}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-muted-foreground">Completed Items</span>
              <p className="text-base font-bold text-foreground mt-0.5">
                {onboardingSummary.completedCount} / {onboardingSummary.applicableCount}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-muted-foreground">Mandatory Done</span>
              <p className="text-base font-bold text-foreground mt-0.5">
                {onboardingSummary.mandatoryCompleted} / {onboardingSummary.mandatoryTotal} ({onboardingSummary.mandatoryPercentage}%)
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-muted-foreground">Skipped Optional</span>
              <p className="text-base font-bold text-foreground mt-0.5">{onboardingSummary.skippedCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-muted-foreground">Attention / Blocked</span>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {onboardingSummary.requiresAttentionCount + onboardingSummary.blockedCount}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {onboardingSummary.items
              .filter((item) => item.applicable)
              .map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-lg border text-xs ${
                    item.status === 'completed'
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                      : item.status === 'blocked' || item.status === 'requires_attention'
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                      : 'bg-muted/25 border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {item.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase">
                          {item.mandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5">{item.description}</p>
                      {item.detailMessage && (
                        <p className="text-amber-700 dark:text-amber-300 mt-0.5 font-medium">
                          {item.detailMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge status={item.status} size="sm" />
                </div>
              ))}
          </div>

          {lifecycleMeta && (
            <div className="p-3.5 rounded-lg bg-muted/35 border border-border/60 text-xs space-y-1">
              <p className="font-semibold text-foreground">
                Tenant Access Policy in Current Lifecycle ({lifecycleMeta.label})
              </p>
              <p className="text-muted-foreground">{lifecycleMeta.accessSummary}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Support Cases, Operational Issues & Platform-vs-Tenant Boundary */}
      {activeTab === 'support_ops' && (
        <div className="space-y-5">
          {/* Platform-Only vs Tenant-Visible Separation Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card text-card-foreground p-4 rounded-xl border border-emerald-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                <Eye className="w-4 h-4" />
                Tenant-Visible Summary Scope
              </div>
              <p className="text-muted-foreground leading-relaxed">
                School admins can inspect public profile details, campus structure, plan entitlement matrix,
                subscription/payment status, published notices, and non-internal replies on their support tickets.
              </p>
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 font-mono text-[11px] space-y-1">
                <div>Lifecycle Access: {lifecycleMeta?.label || org.status}</div>
                <div>Payment Status: {org.paymentStatus || 'paid'}</div>
                <div>Open Support Threads (Redacted): {orgSupportTickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length}</div>
              </div>
            </div>

            <div className="bg-card text-card-foreground p-4 rounded-xl border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
                <Lock className="w-4 h-4" />
                Platform-Only Governance Scope (Restricted)
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Strictly invisible to the school tenant: internal operator support notes, engineering escalation tiers,
                internal risk notes, provisioning exception internals, and pending platform approvals.
              </p>
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-[11px] space-y-1">
                <div className="font-semibold text-foreground">
                  Internal Operator Notes: {org.notes || 'No internal risk remarks recorded.'}
                </div>
                <div>Open Platform Exceptions: {orgExceptions.length}</div>
                <div>Pending Governance Approvals: {orgApprovals.filter((a) => a.status === 'pending_review').length}</div>
              </div>
            </div>
          </div>

          {/* Open Exceptions for Organization */}
          <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Outstanding Operational Issues & Exceptions
              </h3>
              <Link href="/exceptions" className="text-xs text-primary hover:underline font-semibold">
                Triage in Exceptions Center →
              </Link>
            </div>
            {orgExceptions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">No open operational exceptions detected for this institution.</p>
            ) : (
              <div className="space-y-2">
                {orgExceptions.map((exc) => (
                  <div key={exc.id} className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground">{exc.referenceCode}: {exc.title}</span>
                      <Badge status={exc.status} size="sm">{exc.severity}</Badge>
                    </div>
                    <p className="text-muted-foreground">{exc.description}</p>
                    <p className="text-[11px] font-medium text-foreground">Next Action: {exc.recommendedAction}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Support Cases List */}
          <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-primary" />
                Recent Support Cases
              </h3>
              <Link href={`/support`} className="text-xs text-primary hover:underline font-semibold">
                Open Support Desk →
              </Link>
            </div>
            {orgSupportTickets.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">No support cases recorded for this institution.</p>
            ) : (
              <div className="space-y-2">
                {orgSupportTickets.map((tck) => (
                  <div key={tck.id} className="p-3 rounded-lg border border-border bg-muted/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-foreground">{tck.ticketNumber}</span>
                        <Badge status={tck.status} size="sm" />
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tck.priority}</span>
                        {tck.campusName && <span className="text-[10px] text-primary font-medium">{tck.campusName}</span>}
                      </div>
                      <p className="font-semibold text-foreground truncate">{tck.subject}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Requester: {tck.requester.name} • Updated {formatDate(tck.updatedAt, true)}
                      </p>
                    </div>
                    <Link
                      href={`/support?ticket=${tck.id}`}
                      className="px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold shrink-0"
                    >
                      Inspect Case
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Administrative Tasks & Controlled Approvals */}
      {activeTab === 'tasks_approvals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
              <h3 className="font-semibold text-sm text-foreground">Administrative & Follow-Up Tasks</h3>
              <Link href="/approvals" className="text-xs text-primary hover:underline font-semibold">Manage Tasks →</Link>
            </div>
            {orgTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">No administrative tasks assigned to this institution.</p>
            ) : (
              <div className="space-y-2.5">
                {orgTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{task.title}</span>
                      <Badge status={task.status} size="sm" />
                    </div>
                    <p className="text-muted-foreground">{task.description}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">Due: {task.dueDate} • Priority: {task.priority}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
              <h3 className="font-semibold text-sm text-foreground">Controlled Approval History</h3>
              <Link href="/approvals" className="text-xs text-primary hover:underline font-semibold">Review Approvals →</Link>
            </div>
            {orgApprovals.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">No approval requests linked to this institution.</p>
            ) : (
              <div className="space-y-2.5">
                {orgApprovals.map((apr) => (
                  <div key={apr.id} className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-foreground">{apr.referenceCode}</span>
                      <Badge status={apr.status} size="sm" />
                    </div>
                    <p className="font-semibold text-foreground">{apr.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Requested by {apr.requestedBy.name} ({apr.requestedBy.role})
                      {apr.reviewedBy ? ` • Reviewed by ${apr.reviewedBy.name}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Activity History */}
      {activeTab === 'activity' && (
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-4">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground">Organization Administrative Activity Trail</h3>
            <p className="text-xs text-muted-foreground">Historical records of super-admin actions affecting this school.</p>
          </div>

          <div className="space-y-3">
            {orgAuditEvents.length > 0 ? (
              orgAuditEvents.map((evt) => (
                <div key={evt.id} className="p-3 rounded-lg border border-border/60 bg-muted/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{evt.action.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{formatDate(evt.timestamp, true)}</span>
                  </div>
                  <p className="text-muted-foreground">{evt.details}</p>
                  <p className="text-[10px] text-muted-foreground/80 font-mono">Actor: {evt.actor.name} ({evt.actor.role})</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-6 text-center">No specific audit records logged for this organization.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Technical Config */}
      {activeTab === 'technical' && (
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-4">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground">Tenant Technical Configuration</h3>
            <p className="text-xs text-muted-foreground">Low-level routing, regional localization, and tenancy bounds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Primary Subdomain</span>
              <p className="font-mono font-bold text-foreground mt-0.5">{org.technicalConfig.subdomain}.schoolsaas.internal</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Custom Domain Mapping</span>
              <p className="font-mono text-foreground mt-0.5">{org.technicalConfig.customDomain || 'None configured'}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">System Timezone</span>
              <p className="font-mono text-foreground mt-0.5">{org.technicalConfig.timezone}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Base Ledger Currency</span>
              <p className="font-bold text-foreground mt-0.5">{org.technicalConfig.currency}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Max Campuses Allocated</span>
              <p className="font-bold text-foreground mt-0.5">{org.technicalConfig.maxCampuses}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Academic Cycle Start</span>
              <p className="text-foreground mt-0.5">Month {org.technicalConfig.academicYearStartMonth}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Feature Entitlements */}
      {activeTab === 'entitlements' && (
        <div className="space-y-4">
          <OrganizationEntitlementsPanel
            organizationId={organizationId}
            onInspectModule={(mod) => setInspectedModule(mod)}
          />
        </div>
      )}

      {/* Consequential Action Dialog */}
      {confirmModal && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => {
            setConfirmModal(null);
            setLifecycleReason('');
            setConfirmationCode('');
          }}
          onConfirm={handleConfirmStatusChange}
          title={confirmModal.title}
          variant={confirmModal.variant}
          confirmLabel={confirmModal.confirmLabel || 'Confirm Action'}
          isConfirmDisabled={
            Boolean(
              confirmModal.requiresReason &&
                lifecycleReason.trim().length < (confirmModal.minReasonLength || 5)
            ) ||
            Boolean(
              confirmModal.requiresConfirmationCode &&
                confirmationCode.trim().toUpperCase() !== org.code.toUpperCase()
            )
          }
          description={
            <div className="space-y-3">
              <p>
                {confirmModal.description || (
                  <>
                    Confirming this action will update the lifecycle status of{' '}
                    <strong className="text-foreground">{org.name}</strong> to{' '}
                    <strong className="text-foreground capitalize">
                      {confirmModal.newStatus.replace(/_/g, ' ')}
                    </strong>.
                  </>
                )}
              </p>

              {confirmModal.associatedSubscriptionGuidance && (
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border text-[11px] text-muted-foreground text-left">
                  <strong className="text-foreground">Subscription Separation Note: </strong>
                  {confirmModal.associatedSubscriptionGuidance}
                </div>
              )}

              {confirmModal.requiresConfirmationCode && (
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-foreground block">
                    Confirm Organization Code ({org.code}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    placeholder={`Type ${org.code} to confirm`}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono uppercase text-foreground"
                  />
                </div>
              )}

              {confirmModal.requiresReason && (
                <div className="space-y-1.5 text-left pt-1">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>
                      Mandatory Justification / Reason <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Min {confirmModal.minReasonLength || 5} characters
                    </span>
                  </label>
                  <textarea
                    value={lifecycleReason}
                    onChange={(e) => setLifecycleReason(e.target.value)}
                    placeholder={`Provide audit reason for transitioning ${org.name} to ${confirmModal.newStatus}...`}
                    rows={3}
                    className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {lifecycleReason.trim().length > 0 &&
                    lifecycleReason.trim().length < (confirmModal.minReasonLength || 5) && (
                      <p className="text-[11px] text-rose-500">
                        Reason must be at least {confirmModal.minReasonLength || 5} characters (currently {lifecycleReason.trim().length}).
                      </p>
                    )}
                </div>
              )}
            </div>
          }
        />
      )}

      {/* Record Payment Simulation Modal */}
      {paymentModalInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPaymentModalInvoice(null)}
          title={`Record Payment for Invoice ${paymentModalInvoice.invoiceNumber}`}
          size="md"
        >
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1 border border-border/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Total:</span>
                <span className="font-semibold text-foreground">{formatCurrency(paymentModalInvoice.amountDue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(paymentModalInvoice.amountPaid || 0)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border/50 font-bold">
                <span className="text-foreground">Unpaid Balance:</span>
                <span className="text-foreground font-mono">
                  {formatCurrency(Math.max(0, paymentModalInvoice.amountDue - (paymentModalInvoice.amountPaid || 0)))}
                </span>
              </div>
            </div>

            {payError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {payError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Payment Amount (USD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={paymentModalInvoice.amountDue - (paymentModalInvoice.amountPaid || 0)}
                value={payAmount}
                onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethodType)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="bank_transfer">Bank Wire / Electronic Transfer</option>
                <option value="card">Corporate Credit Card</option>
                <option value="cheque">Institutional Cheque</option>
                <option value="manual_invoice">Manual Ledger Settlement</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Reference / Transaction Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. WIRE-884920 or CHQ-4491"
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Reconciliation Notes (Optional)</label>
              <textarea
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="e.g. Verified by financial accounting desk, annual subscription renewal."
                rows={2}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
              ⚡ <strong>Simulation Notice:</strong> This action updates client-side mock invoice ledger records in local development storage. No real banking or payment gateways are contacted.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Payment Record
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Module Capabilities & Evidence Inspection Modal */}
      <ModuleDetailModal
        module={inspectedModule}
        isOpen={!!inspectedModule}
        onClose={() => setInspectedModule(null)}
      />
    </div>
  );
}
