'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
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
} from 'lucide-react';
import { OrganizationEntitlementsPanel } from '@/components/modules/OrganizationEntitlementsPanel';
import { ModuleDetailModal } from '@/components/modules/ModuleDetailModal';
import { TenantModuleDefinition } from '@/lib/modules/types';
import { CampusManagementPanel } from '@/components/campuses/CampusManagementPanel';
import { ReadinessAndProvisioningPanel } from '@/components/readiness/ReadinessAndProvisioningPanel';
import { getAvailableTransitions } from '@/lib/lifecycle/evaluator';

interface ClientProps {
  organizationId: string;
}

export function OrganizationDetailsClient({ organizationId }: ClientProps) {
  const {
    getOrganizationById,
    getSubscriptionByOrgId,
    getInvoicesByOrgId,
    getAuditEvents,
    getCampusesByOrgId,
    evaluateOrganizationReadiness,
    plans,
    updateOrganization,
    setOrganizationStatus,
    recordPayment,
  } = usePlatformStore();

  const org = getOrganizationById(organizationId);
  const subscription = getSubscriptionByOrgId(organizationId);
  const invoices = getInvoicesByOrgId(organizationId);
  const orgAuditEvents = getAuditEvents().filter((e) => e.targetId === organizationId);
  const orgCampuses = getCampusesByOrgId(organizationId);
  const mainCampus = orgCampuses.find((c) => c.isMainCampus);
  const readiness = org ? evaluateOrganizationReadiness(organizationId) : null;
  const availableTransitions = org ? getAvailableTransitions(org.status) : [];

  const [activeTab, setActiveTab] = useState('overview');
  const [inspectedModule, setInspectedModule] = useState<TenantModuleDefinition | null>(null);

  // Lifecycle confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    newStatus: OrganizationLifecycleStatus;
    title: string;
    variant: 'danger' | 'warning' | 'primary';
    requiresReason?: boolean;
    minReasonLength?: number;
    description?: string;
    confirmLabel?: string;
  } | null>(null);
  const [lifecycleReason, setLifecycleReason] = useState('');

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
    setOrganizationStatus(org.id, confirmModal.newStatus, reason);
    setConfirmModal(null);
    setLifecycleReason('');
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
        if (inv.status === 'paid' || bal <= 0 || inv.status === 'void') return null;
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
            <Badge status={org.onboardingStatus} size="sm" />
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted font-medium text-muted-foreground border border-border">
              {orgCampuses.length} {orgCampuses.length === 1 ? 'Campus' : 'Campuses'}
            </span>
            {org.provisioningStatus && (
              <Badge
                variant={
                  org.provisioningStatus === 'simulated_complete'
                    ? 'success'
                    : org.provisioningStatus === 'simulated_failed'
                    ? 'error'
                    : 'warning'
                }
              >
                {org.provisioningStatus.replace(/_/g, ' ')}
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

            {availableTransitions.map((rule) => (
              <button
                key={rule.to}
                type="button"
                onClick={() =>
                  setConfirmModal({
                    newStatus: rule.to,
                    title: `${rule.actionLabel}: ${org.name}`,
                    variant: rule.variant === 'neutral' ? 'primary' : rule.variant,
                    requiresReason: rule.requiresReason,
                    minReasonLength: rule.minReasonLength || 5,
                    description: rule.description,
                    confirmLabel: rule.actionLabel,
                  })
                }
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
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
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

      {/* Tab 4: Onboarding Progress */}
      {activeTab === 'onboarding' && (
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-6">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground">Onboarding Milestones & Verification</h3>
            <p className="text-xs text-muted-foreground">Status of institutional verification and technical setup.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">Organization Identity & Profile</p>
                <p className="text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">School legal credentials and registration documents reviewed.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">Tenant Subdomain Reservation</p>
                <p className="text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                  Subdomain <span className="font-mono">{org.subdomain}.schoolsaas.internal</span> reserved in Edge routing table.
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-3.5 rounded-lg border text-xs ${
              org.onboardingStatus === 'completed'
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
            }`}>
              {org.onboardingStatus === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-foreground">Root Administrator Verification</p>
                <p className="text-muted-foreground mt-0.5">
                  {org.onboardingStatus === 'completed'
                    ? 'Root administrator verified.'
                    : 'Awaiting primary executive identity confirmation.'}
                </p>
              </div>
            </div>
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
          }}
          onConfirm={handleConfirmStatusChange}
          title={confirmModal.title}
          variant={confirmModal.variant}
          confirmLabel={confirmModal.confirmLabel || 'Confirm Action'}
          isConfirmDisabled={
            Boolean(confirmModal.requiresReason &&
            lifecycleReason.trim().length < (confirmModal.minReasonLength || 5))
          }
          description={
            <div className="space-y-3">
              <p>
                {confirmModal.description || (
                  <>
                    Confirming this action will update the lifecycle status of{' '}
                    <strong className="text-foreground">{org.name}</strong> to{' '}
                    <strong className="text-foreground capitalize">{confirmModal.newStatus}</strong>.
                  </>
                )}
              </p>

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
