import {
  Organization,
  SubscriptionPlan,
  OrganizationSubscription,
  Invoice,
  PaymentRecord,
  PaymentMethodType,
  PlatformUser,
  AuditEvent,
  PlatformServiceHealth,
  PlatformIncidentNotice,
  PlatformSettings,
  PlatformFeatureItem,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  AuditLogFilter,
  OrganizationLifecycleStatus,
  PlatformRoleKey,
  Campus,
  CreateCampusInput,
  UpdateCampusInput,
  CampusStatus,
  ProvisioningStatus,
  SubscriptionStatus,
} from '../types';

import {
  INITIAL_PLANS,
  INITIAL_ORGANIZATIONS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_PLATFORM_USERS,
  INITIAL_AUDIT_EVENTS,
  INITIAL_SYSTEM_SERVICES,
  INITIAL_INCIDENTS,
  INITIAL_FEATURES,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_CAMPUSES,
  INITIAL_DISCOUNT_POLICIES,
  INITIAL_LIFECYCLE_EVENTS,
} from './initial-data';

import {
  DiscountPolicy,
  SubscriptionLifecycleEvent,
  CreatePlanInput,
  UpdatePlanInput,
  CreateDiscountInput,
  MonetizationAnalyticsSummary,
} from '../monetization/types';
import {
  validatePlanDefinition,
  validateDiscountPolicy,
  validateSubscriptionTransition,
  computeMonetizationAnalytics,
  round2,
} from '../monetization/evaluator';

import {
  TenantModuleDefinition,
  OrganizationModuleOverride,
  OrganizationOverrideAction,
  EffectiveEntitlementResult,
  RegistryValidationReport,
} from '../modules/types';
import { MASTER_MODULE_REGISTRY } from '../modules/registry-data';
import { INITIAL_ORGANIZATION_OVERRIDES } from '../modules/initial-overrides';
import { evaluateModuleEntitlement } from '../modules/evaluator';
import { validateModuleRegistry } from '../modules/validator';
import { evaluateLifecycleTransition } from '../lifecycle/evaluator';
import { evaluateOrganizationReadiness, OrganizationReadinessReport } from '../readiness/evaluator';
import { executeSimulatedProvisioning, SimulatedProvisioningEvent } from '../provisioning/simulator';

const STORAGE_KEY = 'sms_superadmin_dev_store_v1';

export interface ModuleRegistryMetrics {
  totalModules: number;
  topLevelModules: number;
  submodules: number;
  totalMappedRoutes: number;
  implementedCount: number;
  partialCount: number;
  plannedCount: number;
  missingCount: number;
  platformEnabledCount: number;
  platformDisabledCount: number;
  planStarterCount: number;
  planGrowthCount: number;
  planEnterpriseCount: number;
  activeOverridesCount: number;
}

export interface PlatformMetrics {
  totalOrganizations: number;
  activeOrganizations: number;
  pendingOrganizations: number;
  suspendedOrganizations: number;
  inactiveOrganizations: number;
  trialOrganizations: number;
  onboardingInProgress: number;
  onboardingCompleted: number;
  totalCampuses: number;
  activeCampuses: number;
  subscriptionsByPlan: {
    planId: string;
    planName: string;
    count: number;
    color: string;
  }[];
  expiringSoonCount: number;
  recentAuditCount: number;
  activePlatformUsersCount: number;
  systemServicesOperational: number;
  systemServicesTotal: number;
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
}

export class PlatformStore {
  private organizations: Organization[];
  private plans: SubscriptionPlan[];
  private subscriptions: OrganizationSubscription[];
  private invoices: Invoice[];
  private payments: PaymentRecord[];
  private platformUsers: PlatformUser[];
  private auditEvents: AuditEvent[];
  private systemServices: PlatformServiceHealth[];
  private incidents: PlatformIncidentNotice[];
  private features: PlatformFeatureItem[];
  private settings: PlatformSettings;
  private modules: TenantModuleDefinition[];
  private organizationOverrides: OrganizationModuleOverride[];
  private campuses: Campus[];
  private discounts: DiscountPolicy[];
  private lifecycleEvents: SubscriptionLifecycleEvent[];
  private simulatedEvents: SimulatedProvisioningEvent[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.organizations = structuredClone(INITIAL_ORGANIZATIONS);
    this.plans = structuredClone(INITIAL_PLANS);
    this.subscriptions = structuredClone(INITIAL_SUBSCRIPTIONS);
    this.invoices = structuredClone(INITIAL_INVOICES);
    this.payments = structuredClone(INITIAL_PAYMENTS);
    this.platformUsers = structuredClone(INITIAL_PLATFORM_USERS);
    this.auditEvents = structuredClone(INITIAL_AUDIT_EVENTS);
    this.systemServices = structuredClone(INITIAL_SYSTEM_SERVICES);
    this.incidents = structuredClone(INITIAL_INCIDENTS);
    this.features = structuredClone(INITIAL_FEATURES);
    this.settings = structuredClone(INITIAL_PLATFORM_SETTINGS);
    this.modules = structuredClone(MASTER_MODULE_REGISTRY);
    this.organizationOverrides = structuredClone(INITIAL_ORGANIZATION_OVERRIDES);
    this.campuses = structuredClone(INITIAL_CAMPUSES);
    this.discounts = structuredClone(INITIAL_DISCOUNT_POLICIES);
    this.lifecycleEvents = structuredClone(INITIAL_LIFECYCLE_EVENTS);
    this.simulatedEvents = [];

    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed.organizations)) this.organizations = parsed.organizations;
        if (Array.isArray(parsed.plans)) this.plans = parsed.plans;
        if (Array.isArray(parsed.subscriptions)) this.subscriptions = parsed.subscriptions;
        if (Array.isArray(parsed.invoices)) this.invoices = parsed.invoices;
        if (Array.isArray(parsed.payments)) this.payments = parsed.payments;
        if (Array.isArray(parsed.platformUsers)) this.platformUsers = parsed.platformUsers;
        if (Array.isArray(parsed.auditEvents)) this.auditEvents = parsed.auditEvents;
        if (Array.isArray(parsed.features)) this.features = parsed.features;
        if (Array.isArray(parsed.modules)) this.modules = parsed.modules;
        if (Array.isArray(parsed.organizationOverrides)) this.organizationOverrides = parsed.organizationOverrides;
        if (Array.isArray(parsed.campuses)) this.campuses = parsed.campuses;
        if (Array.isArray(parsed.discounts)) this.discounts = parsed.discounts;
        if (Array.isArray(parsed.lifecycleEvents)) this.lifecycleEvents = parsed.lifecycleEvents;
        if (Array.isArray(parsed.simulatedEvents)) this.simulatedEvents = parsed.simulatedEvents;
        if (parsed.settings && typeof parsed.settings === 'object') {
          this.settings = { ...INITIAL_PLATFORM_SETTINGS, ...parsed.settings };
        }
      }
    } catch {
      // In case of corrupt or invalid storage, reseed with clean initial fixtures safely
      this.organizations = [...INITIAL_ORGANIZATIONS];
      this.plans = [...INITIAL_PLANS];
      this.subscriptions = [...INITIAL_SUBSCRIPTIONS];
      this.invoices = [...INITIAL_INVOICES];
      this.payments = [...INITIAL_PAYMENTS];
      this.platformUsers = [...INITIAL_PLATFORM_USERS];
      this.auditEvents = [...INITIAL_AUDIT_EVENTS];
      this.features = [...INITIAL_FEATURES];
      this.settings = { ...INITIAL_PLATFORM_SETTINGS };
      this.modules = [...MASTER_MODULE_REGISTRY];
      this.organizationOverrides = [...INITIAL_ORGANIZATION_OVERRIDES];
      this.campuses = [...INITIAL_CAMPUSES];
      this.discounts = [...INITIAL_DISCOUNT_POLICIES];
      this.lifecycleEvents = [...INITIAL_LIFECYCLE_EVENTS];
      this.simulatedEvents = [];
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          organizations: this.organizations,
          plans: this.plans,
          subscriptions: this.subscriptions,
          invoices: this.invoices,
          payments: this.payments,
          platformUsers: this.platformUsers,
          auditEvents: this.auditEvents,
          features: this.features,
          settings: this.settings,
          modules: this.modules,
          organizationOverrides: this.organizationOverrides,
          campuses: this.campuses,
          discounts: this.discounts,
          lifecycleEvents: this.lifecycleEvents,
          simulatedEvents: this.simulatedEvents,
        })
      );
    } catch {
      // Ignore quota errors in storage
    }
    this.notify();
  }



  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  // --- Read Operations ---

  public getOrganizations(): Organization[] {
    return [...this.organizations];
  }

  public getOrganizationById(id: string): Organization | undefined {
    return this.organizations.find((org) => org.id === id);
  }

  public getCampuses(): Campus[] {
    return [...this.campuses];
  }

  public getCampusesByOrgId(orgId: string): Campus[] {
    return this.campuses.filter((c) => c.organizationId === orgId);
  }

  public getCampusById(id: string): Campus | undefined {
    return this.campuses.find((c) => c.id === id);
  }

  public getSimulatedEvents(orgId?: string): SimulatedProvisioningEvent[] {
    if (orgId) {
      return this.simulatedEvents.filter((e) => e.organizationId === orgId);
    }
    return [...this.simulatedEvents];
  }

  public getPlans(): SubscriptionPlan[] {
    return [...this.plans];
  }

  public getPlanById(id: string): SubscriptionPlan | undefined {
    return this.plans.find((p) => p.id === id);
  }

  public getSubscriptions(): OrganizationSubscription[] {
    return [...this.subscriptions];
  }

  public getSubscriptionById(id: string): OrganizationSubscription | undefined {
    return this.subscriptions.find((sub) => sub.id === id);
  }

  public getSubscriptionByOrgId(orgId: string): OrganizationSubscription | undefined {
    return this.subscriptions.find((sub) => sub.organizationId === orgId);
  }

  public getInvoices(): Invoice[] {
    return [...this.invoices];
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.find((inv) => inv.id === id);
  }

  public getInvoicesByOrgId(orgId: string): Invoice[] {
    return this.invoices.filter((inv) => inv.organizationId === orgId);
  }

  public getPayments(): PaymentRecord[] {
    return [...this.payments];
  }

  public getPaymentById(id: string): PaymentRecord | undefined {
    return this.payments.find((p) => p.id === id);
  }

  public getPaymentsByOrgId(orgId: string): PaymentRecord[] {
    return this.payments.filter((p) => p.organizationId === orgId);
  }

  public getPaymentsByInvoiceId(invoiceId: string): PaymentRecord[] {
    return this.payments.filter((p) => p.invoiceId === invoiceId);
  }

  public getDiscounts(): DiscountPolicy[] {
    return [...this.discounts];
  }

  public getDiscountByCode(code: string): DiscountPolicy | undefined {
    return this.discounts.find((d) => d.code.toUpperCase() === code.trim().toUpperCase());
  }

  public getSubscriptionEvents(subscriptionId?: string): SubscriptionLifecycleEvent[] {
    if (subscriptionId) {
      return this.lifecycleEvents.filter((e) => e.subscriptionId === subscriptionId);
    }
    return [...this.lifecycleEvents];
  }

  public getMonetizationAnalytics(referenceDate?: string): MonetizationAnalyticsSummary {
    return computeMonetizationAnalytics(
      this.subscriptions,
      this.plans,
      this.invoices,
      this.payments,
      referenceDate
    );
  }


  public getPlatformUsers(): PlatformUser[] {
    return [...this.platformUsers];
  }

  public getSystemServices(): PlatformServiceHealth[] {
    return [...this.systemServices];
  }

  public getIncidents(): PlatformIncidentNotice[] {
    return [...this.incidents];
  }

  public getFeatures(): PlatformFeatureItem[] {
    return [...this.features];
  }

  public getSettings(): PlatformSettings {
    return { ...this.settings };
  }

  public getAuditEvents(filter?: AuditLogFilter): AuditEvent[] {
    let list = [...this.auditEvents];

    if (!filter) return list;

    if (filter.category && filter.category !== 'all') {
      list = list.filter((e) => e.category === filter.category);
    }

    if (filter.severity && filter.severity !== 'all') {
      list = list.filter((e) => e.severity === filter.severity);
    }

    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.action.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q) ||
          e.actor.name.toLowerCase().includes(q) ||
          (e.targetName && e.targetName.toLowerCase().includes(q))
      );
    }

    if (filter.startDate) {
      const start = new Date(filter.startDate).getTime();
      list = list.filter((e) => new Date(e.timestamp).getTime() >= start);
    }

    if (filter.endDate) {
      const end = new Date(filter.endDate).getTime();
      list = list.filter((e) => new Date(e.timestamp).getTime() <= end);
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getMetrics(): PlatformMetrics {
    const total = this.organizations.length;
    const active = this.organizations.filter((o) => o.status === 'active').length;
    const pending = this.organizations.filter((o) => o.status === 'pending').length;
    const suspended = this.organizations.filter((o) => o.status === 'suspended').length;
    const inactive = this.organizations.filter((o) => o.status === 'inactive').length;
    const trial = this.subscriptions.filter((s) => s.status === 'trialing').length;

    const inProgress = this.organizations.filter((o) => o.onboardingStatus === 'in_progress' || o.onboardingStatus === 'verification_pending').length;
    const completed = this.organizations.filter((o) => o.onboardingStatus === 'completed').length;

    const colors: Record<string, string> = {
      plan_starter: '#3b82f6',
      plan_growth: '#10b981',
      plan_enterprise: '#8b5cf6',
    };

    const subscriptionsByPlan = this.plans.map((p) => {
      const count = this.organizations.filter((o) => o.planId === p.id).length;
      return {
        planId: p.id,
        planName: p.name,
        count,
        color: colors[p.id] || '#64748b',
      };
    });

    // Deterministic timestamp for static prerendering and reproducible mock metrics
    const now = Date.parse('2026-03-17T00:00:00Z');
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;
    const expiringSoon = this.subscriptions.filter((s) => {
      const end = new Date(s.currentPeriodEnd).getTime();
      return end > now && end <= thirtyDaysFromNow;
    }).length;

    const operationalServices = this.systemServices.filter((s) => s.status === 'operational').length;

    const totalInvoiced = this.invoices.reduce((acc, inv) => acc + (typeof inv.amountDue === 'number' ? inv.amountDue : 0), 0);
    const totalCollected = this.invoices.reduce((acc, inv) => acc + (typeof inv.amountPaid === 'number' ? inv.amountPaid : 0), 0);
    const totalOutstanding = this.invoices.reduce((acc, inv) => acc + Math.max(0, (inv.amountDue || 0) - (inv.amountPaid || 0)), 0);

    const totalCampuses = this.campuses.length;
    const activeCampuses = this.campuses.filter((c) => c.status === 'active').length;

    return {
      totalOrganizations: total,
      activeOrganizations: active,
      pendingOrganizations: pending,
      suspendedOrganizations: suspended,
      inactiveOrganizations: inactive,
      trialOrganizations: trial,
      onboardingInProgress: inProgress,
      onboardingCompleted: completed,
      totalCampuses,
      activeCampuses,
      subscriptionsByPlan,
      expiringSoonCount: expiringSoon,
      recentAuditCount: this.auditEvents.length,
      activePlatformUsersCount: this.platformUsers.filter((u) => u.status === 'active').length,
      systemServicesOperational: operationalServices,
      systemServicesTotal: this.systemServices.length,
      totalInvoiced,
      totalCollected,
      totalOutstanding,
    };
  }

  // --- Mutations (Development State with Validation & Audit Events) ---

  public createOrganization(input: CreateOrganizationInput): { success: boolean; organization?: Organization; error?: string } {
    // 1. Validation
    if (!input.name || input.name.trim().length < 2) {
      return { success: false, error: 'Organization name must be at least 2 characters.' };
    }

    const cleanCode = input.code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 2) {
      return { success: false, error: 'Organization code is required (min 2 uppercase characters).' };
    }

    if (this.organizations.some((o) => o.code.toUpperCase() === cleanCode)) {
      return { success: false, error: `Organization code "${cleanCode}" is already in use by another tenant.` };
    }

    const cleanSubdomain = input.subdomain.trim().toLowerCase();
    if (!cleanSubdomain || !/^[a-z0-9-]+$/.test(cleanSubdomain)) {
      return { success: false, error: 'Subdomain must contain only lowercase letters, numbers, and hyphens.' };
    }

    if (this.organizations.some((o) => o.subdomain.toLowerCase() === cleanSubdomain)) {
      return { success: false, error: `Subdomain "${cleanSubdomain}" is already registered.` };
    }

    if (!input.administrator.email || !input.administrator.email.includes('@')) {
      return { success: false, error: 'A valid primary administrator email is required.' };
    }

    const newId = `org_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newOrg: Organization = {
      id: newId,
      code: cleanCode,
      name: input.name.trim(),
      classification: input.classification,
      status: 'pending',
      onboardingStatus: 'completed',
      planId: input.planId,
      subdomain: cleanSubdomain,
      createdAt: nowIso,
      updatedAt: nowIso,
      contact: input.contact,
      administrator: input.administrator,
      technicalConfig: input.technicalConfig,
      notes: input.notes,
    };

    // Create matching subscription
    const selectedPlan = this.plans.find((p) => p.id === input.planId) || this.plans[0];
    const subId = `sub_${Date.now()}`;
    const isTrial = this.settings.onboardingPolicy.autoApproveFreeTrials;
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newSub: OrganizationSubscription = {
      id: subId,
      organizationId: newId,
      planId: selectedPlan.id,
      billingCycle: input.billingCycle,
      status: isTrial ? 'trialing' : 'active',
      currentPeriodStart: nowIso,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      trialStartDate: isTrial ? nowIso : undefined,
      trialEndDate: isTrial ? periodEnd : undefined,
      updatedAt: nowIso,
    };

    // Create initial invoice
    const invId = `inv_${Date.now()}`;
    const amount = input.billingCycle === 'annual' ? selectedPlan.priceAnnual : selectedPlan.priceMonthly;
    const newInvoice: Invoice = {
      id: invId,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      organizationId: newId,
      subscriptionId: subId,
      amountDue: amount,
      amountPaid: 0,
      currency: selectedPlan.currency,
      status: 'issued',
      issueDate: nowIso,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      lineItems: [
        {
          id: `li_${Date.now()}`,
          description: `${selectedPlan.name} Subscription (${input.billingCycle === 'annual' ? 'Annual' : 'Monthly'})`,
          quantity: 1,
          unitAmount: amount,
          totalAmount: amount,
        },
      ],
      notes: 'Initial registration onboarding invoice',
    };

    // Record audit event
    const auditEvent: AuditEvent = {
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'organization_lifecycle',
      action: 'ORGANIZATION_REGISTERED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Organization',
      targetId: newId,
      targetName: newOrg.name,
      status: 'succeeded',
      details: `Registered organization "${newOrg.name}" with code ${newOrg.code} on plan "${selectedPlan.name}".`,
      metadata: {
        code: newOrg.code,
        subdomain: newOrg.subdomain,
        planId: selectedPlan.id,
        classification: newOrg.classification,
      },
    };

    const initialCampusName = input.initialCampus?.name || `${newOrg.name} Main Campus`;
    const initialCampusCode = (input.initialCampus?.code || 'MAIN').toUpperCase();
    const initialCampus: Campus = {
      id: `camp_${Date.now()}_main`,
      organizationId: newId,
      name: initialCampusName,
      code: initialCampusCode,
      isMainCampus: true,
      type: 'main',
      status: 'active',
      address: {
        street: input.initialCampus?.street || input.contact.address || '',
        city: input.initialCampus?.city || input.contact.city || '',
        stateOrProvince: input.initialCampus?.stateOrProvince || input.contact.stateOrProvince || '',
        country: input.initialCampus?.country || input.contact.country || 'United States',
        postalCode: input.initialCampus?.postalCode || input.contact.postalCode || '',
      },
      contactEmail: input.contact.email,
      contactPhone: input.contact.phone,
      principalName: input.administrator.name,
      studentCapacity: input.initialCampus?.studentCapacity || 500,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    newOrg.provisioningStatus = 'ready_for_review';

    this.organizations.unshift(newOrg);
    this.campuses.unshift(initialCampus);
    this.subscriptions.unshift(newSub);
    this.invoices.unshift(newInvoice);
    this.auditEvents.unshift(auditEvent);

    this.persist();
    return { success: true, organization: newOrg };
  }

  public updateOrganization(id: string, input: UpdateOrganizationInput): { success: boolean; organization?: Organization; error?: string } {
    const orgIndex = this.organizations.findIndex((o) => o.id === id);
    if (orgIndex === -1) {
      return { success: false, error: 'Organization not found.' };
    }

    const current = this.organizations[orgIndex];
    const nowIso = new Date().toISOString();

    const updated: Organization = {
      ...current,
      name: input.name !== undefined ? input.name.trim() : current.name,
      classification: input.classification || current.classification,
      status: input.status || current.status,
      onboardingStatus: input.onboardingStatus || current.onboardingStatus,
      planId: input.planId || current.planId,
      notes: input.notes !== undefined ? input.notes : current.notes,
      contact: {
        ...current.contact,
        ...(input.contact || {}),
      },
      administrator: {
        ...current.administrator,
        ...(input.administrator || {}),
      },
      technicalConfig: {
        ...current.technicalConfig,
        ...(input.technicalConfig || {}),
      },
      updatedAt: nowIso,
    };

    this.organizations[orgIndex] = updated;

    // Record audit event
    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'organization_lifecycle',
      action: 'ORGANIZATION_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Organization',
      targetId: updated.id,
      targetName: updated.name,
      status: 'succeeded',
      details: `Updated profile details for "${updated.name}".`,
    });

    this.persist();
    return { success: true, organization: updated };
  }

  public setOrganizationStatus(id: string, status: OrganizationLifecycleStatus, reason?: string): { success: boolean; error?: string } {
    const org = this.organizations.find((o) => o.id === id);
    if (!org) return { success: false, error: 'Organization not found.' };

    const oldStatus = org.status;
    const evalResult = evaluateLifecycleTransition(oldStatus, status, reason);
    if (!evalResult.permitted) {
      return { success: false, error: evalResult.error };
    }

    const nowIso = new Date().toISOString();
    org.status = status;
    org.updatedAt = nowIso;
    if (status === 'suspended') {
      org.suspendedReason = reason;
    }
    if (status === 'archived') {
      org.archivedAt = nowIso;
      org.archivedReason = reason;
    }

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'organization_lifecycle',
      action: 'ORGANIZATION_STATUS_CHANGED',
      severity: status === 'suspended' || status === 'archived' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Organization',
      targetId: org.id,
      targetName: org.name,
      status: 'succeeded',
      details: `Lifecycle status transitioned from "${oldStatus}" to "${status}". Reason: ${reason || 'Administrative action'}`,
      metadata: { previousStatus: oldStatus, newStatus: status, reason },
    });

    this.persist();
    return { success: true };
  }


  public updateOrganizationPlan(id: string, planId: string, billingCycle?: 'monthly' | 'annual'): { success: boolean; error?: string } {
    const org = this.organizations.find((o) => o.id === id);
    if (!org) return { success: false, error: 'Organization not found.' };

    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) return { success: false, error: 'Selected subscription plan does not exist.' };

    const oldPlanId = org.planId;
    org.planId = planId;
    org.updatedAt = new Date().toISOString();

    const sub = this.subscriptions.find((s) => s.organizationId === id);
    if (sub) {
      sub.planId = planId;
      if (billingCycle) sub.billingCycle = billingCycle;
      sub.updatedAt = new Date().toISOString();
    }

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'subscription_billing',
      action: 'PLAN_ASSIGNMENT_CHANGED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Organization',
      targetId: org.id,
      targetName: org.name,
      status: 'succeeded',
      details: `Subscription plan changed to "${plan.name}".`,
      metadata: { previousPlanId: oldPlanId, newPlanId: planId, billingCycle },
    });

    this.persist();
    return { success: true };
  }

  public recordPayment(input: {
    invoiceId: string;
    amount: number;
    method: PaymentMethodType;
    referenceNumber: string;
    notes?: string;
  }): { success: boolean; payment?: PaymentRecord; error?: string } {
    const invoice = this.invoices.find((i) => i.id === input.invoiceId);
    if (!invoice) {
      return { success: false, error: 'Target invoice not found.' };
    }

    if (invoice.status === 'paid') {
      return { success: false, error: `Invoice ${invoice.invoiceNumber} is already settled in full.` };
    }

    if (invoice.status === 'void' || invoice.status === 'uncollectible') {
      return { success: false, error: `Cannot record payment against an invoice with status "${invoice.status}".` };
    }

    if (typeof input.amount !== 'number' || isNaN(input.amount) || input.amount <= 0) {
      return { success: false, error: 'Payment amount must be a positive number greater than 0.' };
    }

    const cleanRef = input.referenceNumber ? input.referenceNumber.trim() : '';
    if (!cleanRef || cleanRef.length < 3) {
      return { success: false, error: 'Valid payment reference number is required (min 3 characters).' };
    }

    // Duplicate payment reference check
    if (this.payments.some((p) => p.referenceNumber.toLowerCase() === cleanRef.toLowerCase())) {
      return { success: false, error: `Payment reference "${cleanRef}" has already been recorded in the platform ledger.` };
    }

    const outstandingBalance = Math.max(0, invoice.amountDue - invoice.amountPaid);
    if (input.amount > outstandingBalance) {
      return {
        success: false,
        error: `Payment amount ($${input.amount.toLocaleString()}) exceeds the remaining unpaid invoice balance ($${outstandingBalance.toLocaleString()}). Overpayments are not permitted in standard settlement.`,
      };
    }

    const nowIso = new Date().toISOString();
    const newPaidAmount = invoice.amountPaid + input.amount;
    invoice.amountPaid = newPaidAmount;

    if (invoice.amountPaid >= invoice.amountDue) {
      invoice.status = 'paid';
      invoice.paidAt = nowIso;
    }

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      invoiceId: invoice.id,
      organizationId: invoice.organizationId,
      amount: input.amount,
      currency: invoice.currency,
      method: input.method,
      referenceNumber: cleanRef,
      processedAt: nowIso,
      status: 'succeeded',
      notes: input.notes?.trim() || 'Simulated development payment entry',
    };

    this.payments.unshift(newPayment);

    // Record audit event
    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'subscription_billing',
      action: 'PAYMENT_RECORDED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PaymentRecord',
      targetId: newPayment.id,
      targetName: `Payment on ${invoice.invoiceNumber}`,
      status: 'succeeded',
      details: `Recorded simulated ${newPayment.method.replace('_', ' ')} payment of $${newPayment.amount.toLocaleString()} ${newPayment.currency} for invoice ${invoice.invoiceNumber}. Ref: ${newPayment.referenceNumber}.`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        organizationId: invoice.organizationId,
        paymentAmount: newPayment.amount,
        remainingBalance: Math.max(0, invoice.amountDue - invoice.amountPaid),
        newInvoiceStatus: invoice.status,
      },
    });

    this.persist();
    return { success: true, payment: newPayment };
  }

  public createPlan(input: CreatePlanInput): { success: boolean; plan?: SubscriptionPlan; error?: string } {
    const planId = input.id
      ? input.id.trim().toLowerCase()
      : `plan_${input.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;

    const candidate: SubscriptionPlan = {
      id: planId,
      name: input.name.trim(),
      tier: input.tier,
      status: input.status || 'published',
      description: input.description.trim(),
      priceMonthly: input.priceMonthly,
      priceAnnual: input.priceAnnual,
      priceQuarterly: input.priceQuarterly,
      currency: input.currency.toUpperCase(),
      trialDays: typeof input.trialDays === 'number' ? input.trialDays : 14,
      maxStudents: input.maxStudents,
      maxStaff: input.maxStaff,
      maxCampuses: input.maxCampuses,
      storageGb: input.storageGb,
      features: input.features || [],
      includedModuleIds: input.includedModuleIds || [],
      isPopular: Boolean(input.isPopular),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validation = validatePlanDefinition(candidate, this.plans);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    this.plans.push(candidate);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: candidate.createdAt!,
      category: 'subscription_billing',
      action: 'PLAN_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'SubscriptionPlan',
      targetId: candidate.id,
      targetName: candidate.name,
      status: 'succeeded',
      details: `Created new subscription plan "${candidate.name}" (${candidate.id}) in tier ${candidate.tier}.`,
      metadata: { planId: candidate.id, tier: candidate.tier, priceMonthly: candidate.priceMonthly, priceAnnual: candidate.priceAnnual },
    });

    this.persist();
    return { success: true, plan: candidate };
  }

  public updatePlan(id: string, input: UpdatePlanInput): { success: boolean; plan?: SubscriptionPlan; error?: string } {
    const plan = this.plans.find((p) => p.id === id);
    if (!plan) return { success: false, error: 'Subscription plan not found.' };

    const merged: SubscriptionPlan = {
      ...plan,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    const validation = validatePlanDefinition(merged, this.plans.filter((p) => p.id !== id));
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    Object.assign(plan, merged);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: plan.updatedAt!,
      category: 'subscription_billing',
      action: 'PLAN_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'SubscriptionPlan',
      targetId: plan.id,
      targetName: plan.name,
      status: 'succeeded',
      details: `Updated subscription plan "${plan.name}".`,
      metadata: { planId: plan.id, updates: JSON.stringify(input) },
    });

    this.persist();
    return { success: true, plan };
  }

  public transitionSubscriptionStatus(
    subscriptionId: string,
    targetStatus: SubscriptionStatus,
    reason: string
  ): { success: boolean; subscription?: OrganizationSubscription; error?: string } {
    const sub = this.subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) return { success: false, error: 'Subscription not found.' };

    const validation = validateSubscriptionTransition(sub.status, targetStatus, reason);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const previousStatus = sub.status;
    sub.status = targetStatus;
    const nowIso = new Date().toISOString();
    sub.updatedAt = nowIso;

    if (targetStatus === 'canceled') {
      sub.canceledAt = nowIso;
      sub.cancellationReason = reason.trim();
      sub.cancelAtPeriodEnd = true;
    }

    const lifecycleEvent: SubscriptionLifecycleEvent = {
      id: `evt_${Date.now()}`,
      subscriptionId: sub.id,
      organizationId: sub.organizationId,
      fromStatus: previousStatus,
      toStatus: targetStatus,
      reason: reason.trim(),
      actor: 'Alexander Sterling (Super Admin)',
      timestamp: nowIso,
    };
    this.lifecycleEvents.unshift(lifecycleEvent);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'subscription_billing',
      action: 'SUBSCRIPTION_STATUS_CHANGED',
      severity: targetStatus === 'canceled' || targetStatus === 'suspended' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'OrganizationSubscription',
      targetId: sub.id,
      targetName: `Subscription ${sub.id}`,
      status: 'succeeded',
      details: `Subscription status transitioned from "${previousStatus}" to "${targetStatus}". Reason: "${reason.trim()}".`,
      metadata: {
        subscriptionId: sub.id,
        organizationId: sub.organizationId,
        previousStatus,
        newStatus: targetStatus,
        reason: reason.trim(),
      },
    });

    this.persist();
    return { success: true, subscription: sub };
  }

  public voidInvoice(invoiceId: string, reason: string): { success: boolean; invoice?: Invoice; error?: string } {
    const invoice = this.invoices.find((i) => i.id === invoiceId);
    if (!invoice) return { success: false, error: 'Target invoice not found.' };
    if (invoice.status === 'paid') {
      return { success: false, error: `Invoice ${invoice.invoiceNumber} is already settled in full and cannot be voided.` };
    }
    if (invoice.status === 'void') {
      return { success: false, error: `Invoice ${invoice.invoiceNumber} is already void.` };
    }
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: 'A mandatory justification reason (min 5 characters) is required to void an invoice.' };
    }

    invoice.status = 'void';
    invoice.voidReason = reason.trim();
    const nowIso = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'subscription_billing',
      action: 'INVOICE_VOIDED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Invoice',
      targetId: invoice.id,
      targetName: invoice.invoiceNumber,
      status: 'succeeded',
      details: `Voided invoice ${invoice.invoiceNumber}. Justification: "${invoice.voidReason}".`,
      metadata: { invoiceId: invoice.id, voidReason: invoice.voidReason },
    });

    this.persist();
    return { success: true, invoice };
  }

  public retryPayment(paymentId: string): { success: boolean; payment?: PaymentRecord; invoice?: Invoice; error?: string } {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment) return { success: false, error: 'Payment attempt record not found.' };
    if (payment.status !== 'failed') {
      return { success: false, error: `Payment is in status "${payment.status}" and cannot be retried.` };
    }

    const invoice = this.invoices.find((i) => i.id === payment.invoiceId);
    if (!invoice) return { success: false, error: 'Associated invoice for payment retry not found.' };

    payment.retryCount = (payment.retryCount || 0) + 1;
    const nowIso = new Date().toISOString();

    payment.status = 'succeeded';
    payment.processedAt = nowIso;
    payment.notes = (payment.notes ? payment.notes + ' | ' : '') + `Simulated retry #${payment.retryCount} succeeded at ${nowIso}.`;

    const remainingBal = Math.max(0, invoice.amountDue - invoice.amountPaid);
    const amountToApply = Math.min(remainingBal, payment.amount);
    invoice.amountPaid = round2(invoice.amountPaid + amountToApply);
    if (invoice.amountPaid >= invoice.amountDue) {
      invoice.status = 'paid';
      invoice.paidAt = nowIso;
    }

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'subscription_billing',
      action: 'PAYMENT_RETRY_SUCCEEDED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PaymentRecord',
      targetId: payment.id,
      targetName: `Payment Retry on ${invoice.invoiceNumber}`,
      status: 'succeeded',
      details: `Simulated retry #${payment.retryCount} succeeded for payment ${payment.referenceNumber} on invoice ${invoice.invoiceNumber}. Applied ${payment.currency} ${amountToApply}.`,
      metadata: {
        paymentId: payment.id,
        invoiceId: invoice.id,
        newInvoiceStatus: invoice.status,
        retryCount: payment.retryCount,
      },
    });

    this.persist();
    return { success: true, payment, invoice };
  }

  public createDiscount(input: CreateDiscountInput): { success: boolean; discount?: DiscountPolicy; error?: string } {
    const candidate: DiscountPolicy = {
      id: `disc_${Date.now()}`,
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      discountType: input.discountType,
      value: input.value,
      currency: input.currency ? input.currency.toUpperCase() : undefined,
      applicablePlans: input.applicablePlans || ['all'],
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      maxRedemptions: input.maxRedemptions,
      currentRedemptions: 0,
      isActive: true,
      description: input.description?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validation = validateDiscountPolicy(candidate, this.discounts);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    this.discounts.unshift(candidate);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: candidate.createdAt,
      category: 'subscription_billing',
      action: 'DISCOUNT_POLICY_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'DiscountPolicy',
      targetId: candidate.id,
      targetName: candidate.code,
      status: 'succeeded',
      details: `Created discount promotional policy "${candidate.code}" (${candidate.value}${candidate.discountType === 'percentage' ? '%' : ' ' + (candidate.currency || '')}).`,
      metadata: { discountId: candidate.id, code: candidate.code, discountType: candidate.discountType, value: candidate.value },
    });

    this.persist();
    return { success: true, discount: candidate };
  }

  public toggleDiscount(id: string): { success: boolean; discount?: DiscountPolicy; error?: string } {
    const discount = this.discounts.find((d) => d.id === id);
    if (!discount) return { success: false, error: 'Discount policy not found.' };

    discount.isActive = !discount.isActive;
    discount.updatedAt = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: discount.updatedAt,
      category: 'subscription_billing',
      action: 'DISCOUNT_STATUS_TOGGLED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'DiscountPolicy',
      targetId: discount.id,
      targetName: discount.code,
      status: 'succeeded',
      details: `Discount "${discount.code}" toggled to ${discount.isActive ? 'ACTIVE' : 'INACTIVE'}.`,
      metadata: { discountId: discount.id, isActive: discount.isActive },
    });

    this.persist();
    return { success: true, discount };
  }


  public createPlatformUser(input: { name: string; email: string; role: PlatformRoleKey; department?: string; notes?: string }): { success: boolean; user?: PlatformUser; error?: string } {
    if (!input.name || input.name.trim().length < 2) {
      return { success: false, error: 'User name is required.' };
    }
    if (!input.email || !input.email.includes('@')) {
      return { success: false, error: 'Valid corporate email address required.' };
    }
    if (this.platformUsers.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
      return { success: false, error: `Platform user with email ${input.email} already exists.` };
    }

    const newUser: PlatformUser = {
      id: `usr_${Date.now()}`,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      status: 'active',
      department: input.department || 'Platform Operations',
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false,
      notes: input.notes,
    };

    this.platformUsers.unshift(newUser);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'platform_access',
      action: 'PLATFORM_USER_CREATED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformUser',
      targetId: newUser.id,
      targetName: newUser.name,
      status: 'succeeded',
      details: `Created new platform administrator with role "${input.role}".`,
    });

    this.persist();
    return { success: true, user: newUser };
  }

  public updatePlatformUserRole(id: string, role: PlatformRoleKey): { success: boolean; error?: string } {
    const user = this.platformUsers.find((u) => u.id === id);
    if (!user) return { success: false, error: 'Platform user not found.' };

    const oldRole = user.role;
    user.role = role;

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'platform_access',
      action: 'PLATFORM_USER_ROLE_CHANGED',
      severity: 'critical',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformUser',
      targetId: user.id,
      targetName: user.name,
      status: 'succeeded',
      details: `Reassigned role from "${oldRole}" to "${role}".`,
    });

    this.persist();
    return { success: true };
  }

  public updatePlatformUserStatus(id: string, status: 'active' | 'suspended'): { success: boolean; error?: string } {
    const user = this.platformUsers.find((u) => u.id === id);
    if (!user) return { success: false, error: 'Platform user not found.' };

    user.status = status;
    this.persist();
    return { success: true };
  }

  public toggleFeature(id: string): { success: boolean; error?: string } {
    const feat = this.features.find((f) => f.id === id);
    if (!feat) return { success: false, error: 'Feature not found in platform catalogue.' };

    feat.isGloballyEnabled = !feat.isGloballyEnabled;

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'feature_toggles',
      action: 'FEATURE_TOGGLED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformFeature',
      targetId: feat.id,
      targetName: feat.name,
      status: 'succeeded',
      details: `Feature "${feat.name}" is now ${feat.isGloballyEnabled ? 'enabled' : 'disabled'} globally.`,
    });

    this.persist();
    return { success: true };
  }

  public updateSettings(settings: Partial<PlatformSettings>): { success: boolean } {
    this.settings = {
      ...this.settings,
      ...settings,
      branding: { ...this.settings.branding, ...(settings.branding || {}) },
      regional: { ...this.settings.regional, ...(settings.regional || {}) },
      onboardingPolicy: { ...this.settings.onboardingPolicy, ...(settings.onboardingPolicy || {}) },
      maintenance: { ...this.settings.maintenance, ...(settings.maintenance || {}) },
    };

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'PLATFORM_SETTINGS_UPDATED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformSettings',
      targetId: 'global_settings',
      status: 'succeeded',
      details: 'Updated global platform configuration and operational policy.',
    });

    this.persist();
    return { success: true };
  }

  // ==========================================
  // CAMPUSES & MULTI-BRANCH MANAGEMENT (Phase E-09.7)
  // ==========================================

  public createCampus(input: CreateCampusInput): { success: boolean; campus?: Campus; error?: string } {
    const org = this.organizations.find((o) => o.id === input.organizationId);
    if (!org) {
      return { success: false, error: 'Owning organization does not exist.' };
    }

    if (!input.name || input.name.trim().length < 2) {
      return { success: false, error: 'Campus name must be at least 2 characters.' };
    }

    const cleanCode = input.code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 2) {
      return { success: false, error: 'Campus code is required (min 2 uppercase characters).' };
    }

    // Check code uniqueness within the organization
    const orgCampuses = this.campuses.filter((c) => c.organizationId === input.organizationId);
    if (orgCampuses.some((c) => c.code.toUpperCase() === cleanCode)) {
      return { success: false, error: `Campus code "${cleanCode}" is already in use within this school organization.` };
    }

    // Determine if this should be the main campus
    const shouldBeMain = orgCampuses.length === 0 || Boolean(input.isMainCampus);

    if (shouldBeMain) {
      // Unset previous main campus for this org
      for (const c of this.campuses) {
        if (c.organizationId === input.organizationId) {
          c.isMainCampus = false;
        }
      }
    }

    const newId = `camp_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newCampus: Campus = {
      id: newId,
      organizationId: input.organizationId,
      name: input.name.trim(),
      code: cleanCode,
      isMainCampus: shouldBeMain,
      type: input.type || (shouldBeMain ? 'main' : 'branch'),
      status: input.status || 'active',
      address: {
        street: input.address?.street || '',
        city: input.address?.city || org.contact.city,
        stateOrProvince: input.address?.stateOrProvince || org.contact.stateOrProvince,
        country: input.address?.country || org.contact.country,
        postalCode: input.address?.postalCode || org.contact.postalCode || '',
      },
      contactEmail: input.contactEmail || org.contact.email,
      contactPhone: input.contactPhone || org.contact.phone,
      principalName: input.principalName,
      studentCapacity: input.studentCapacity,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.campuses.unshift(newCampus);

    // Record audit event
    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'organization_lifecycle',
      action: 'CAMPUS_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Campus',
      targetId: newId,
      targetName: `${newCampus.name} (${newCampus.code})`,
      status: 'succeeded',
      details: `Created new campus "${newCampus.name}" (${newCampus.code}) for "${org.name}". Main campus: ${shouldBeMain ? 'Yes' : 'No'}.`,
      metadata: {
        organizationId: org.id,
        campusCode: newCampus.code,
        isMainCampus: shouldBeMain,
      },
    });

    this.persist();
    return { success: true, campus: newCampus };
  }

  public updateCampus(id: string, input: UpdateCampusInput): { success: boolean; campus?: Campus; error?: string } {
    const campus = this.campuses.find((c) => c.id === id);
    if (!campus) {
      return { success: false, error: 'Campus not found.' };
    }

    const org = this.organizations.find((o) => o.id === campus.organizationId);

    if (input.code !== undefined) {
      const cleanCode = input.code.trim().toUpperCase();
      if (!cleanCode || cleanCode.length < 2) {
        return { success: false, error: 'Campus code must be at least 2 characters.' };
      }
      const duplicate = this.campuses.some(
        (c) => c.organizationId === campus.organizationId && c.id !== id && c.code.toUpperCase() === cleanCode
      );
      if (duplicate) {
        return { success: false, error: `Campus code "${cleanCode}" is already in use by another campus in this organization.` };
      }
      campus.code = cleanCode;
    }

    if (input.name !== undefined) {
      const cleanName = input.name.trim();
      if (!cleanName || cleanName.length < 2) {
        return { success: false, error: 'Campus name must be at least 2 characters.' };
      }
      campus.name = cleanName;
    }

    if (input.isMainCampus === true) {
      // Unset other main campuses
      for (const c of this.campuses) {
        if (c.organizationId === campus.organizationId) {
          c.isMainCampus = false;
        }
      }
      campus.isMainCampus = true;
    }

    if (input.type !== undefined) campus.type = input.type;
    if (input.status !== undefined) campus.status = input.status;
    if (input.contactEmail !== undefined) campus.contactEmail = input.contactEmail;
    if (input.contactPhone !== undefined) campus.contactPhone = input.contactPhone;
    if (input.principalName !== undefined) campus.principalName = input.principalName;
    if (input.studentCapacity !== undefined) campus.studentCapacity = input.studentCapacity;

    if (input.address) {
      campus.address = {
        ...campus.address,
        ...input.address,
      };
    }

    const nowIso = new Date().toISOString();
    campus.updatedAt = nowIso;

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'organization_lifecycle',
      action: 'CAMPUS_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Campus',
      targetId: campus.id,
      targetName: `${campus.name} (${campus.code})`,
      status: 'succeeded',
      details: `Updated campus profile "${campus.name}" for organization "${org?.name || campus.organizationId}".`,
      metadata: {
        organizationId: campus.organizationId,
        campusCode: campus.code,
        isMainCampus: campus.isMainCampus,
      },
    });

    this.persist();
    return { success: true, campus };
  }

  public setMainCampus(orgId: string, campusId: string): { success: boolean; error?: string } {
    const campus = this.campuses.find((c) => c.id === campusId && c.organizationId === orgId);
    if (!campus) {
      return { success: false, error: 'Campus does not exist or does not belong to this organization.' };
    }

    for (const c of this.campuses) {
      if (c.organizationId === orgId) {
        c.isMainCampus = c.id === campusId;
      }
    }

    campus.updatedAt = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'organization_lifecycle',
      action: 'MAIN_CAMPUS_DESIGNATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Campus',
      targetId: campus.id,
      targetName: campus.name,
      status: 'succeeded',
      details: `Designated "${campus.name}" (${campus.code}) as the primary/main campus for organization.`,
    });

    this.persist();
    return { success: true };
  }

  public setCampusStatus(campusId: string, status: CampusStatus, reason?: string): { success: boolean; error?: string } {
    const campus = this.campuses.find((c) => c.id === campusId);
    if (!campus) return { success: false, error: 'Campus not found.' };

    const oldStatus = campus.status;
    campus.status = status;
    campus.updatedAt = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'organization_lifecycle',
      action: 'CAMPUS_STATUS_CHANGED',
      severity: status === 'inactive' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Campus',
      targetId: campus.id,
      targetName: campus.name,
      status: 'succeeded',
      details: `Campus status transitioned from "${oldStatus}" to "${status}". Reason: ${reason || 'Administrative action'}`,
    });

    this.persist();
    return { success: true };
  }

  public deleteCampus(campusId: string): { success: boolean; error?: string } {
    const index = this.campuses.findIndex((c) => c.id === campusId);
    if (index === -1) return { success: false, error: 'Campus not found.' };

    const campus = this.campuses[index];
    const orgCampuses = this.campuses.filter((c) => c.organizationId === campus.organizationId);

    if (campus.isMainCampus && orgCampuses.length > 1) {
      return {
        success: false,
        error: 'Cannot delete the designated main campus while other campuses exist. Designate another campus as main first.',
      };
    }

    this.campuses.splice(index, 1);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'organization_lifecycle',
      action: 'CAMPUS_DELETED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Campus',
      targetId: campus.id,
      targetName: campus.name,
      status: 'succeeded',
      details: `Removed campus record "${campus.name}" (${campus.code}) from organization.`,
    });

    this.persist();
    return { success: true };
  }

  // ==========================================
  // CONFIGURATION READINESS & PROVISIONING SIMULATION (Phase E-09.7)
  // ==========================================

  public evaluateOrganizationReadiness(orgId: string): OrganizationReadinessReport {
    const org = this.organizations.find((o) => o.id === orgId);
    if (!org) {
      throw new Error(`Organization with ID "${orgId}" not found.`);
    }

    const orgCampuses = this.campuses.filter((c) => c.organizationId === orgId);
    const plan = this.plans.find((p) => p.id === org.planId);
    const subscription = this.subscriptions.find((s) => s.organizationId === orgId);
    const overrides = this.organizationOverrides.filter((o) => o.organizationId === orgId);

    return evaluateOrganizationReadiness({
      organization: org,
      campuses: orgCampuses,
      plan,
      subscription,
      overrides,
      modules: this.modules,
    });
  }

  public runSimulatedProvisioning(orgId: string, forceFail?: boolean): { success: boolean; status: ProvisioningStatus; error?: string } {
    const org = this.organizations.find((o) => o.id === orgId);
    if (!org) return { success: false, status: 'simulated_failed', error: 'Organization not found.' };

    const readiness = this.evaluateOrganizationReadiness(orgId);
    const orgCampuses = this.campuses.filter((c) => c.organizationId === orgId);

    const result = executeSimulatedProvisioning({
      organization: org,
      readiness,
      campuses: orgCampuses,
      forceFail,
    });

    org.provisioningStatus = result.status;
    org.updatedAt = new Date().toISOString();

    // Store simulated events
    this.simulatedEvents = [
      ...result.events,
      ...this.simulatedEvents.filter((e) => e.organizationId !== orgId),
    ];

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'organization_lifecycle',
      action: 'SIMULATED_PROVISIONING_RUN',
      severity: result.success ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Organization',
      targetId: org.id,
      targetName: org.name,
      status: result.success ? 'succeeded' : 'failed',
      details: `Executed local provisioning simulation. Status: ${result.status}. Summary: ${result.summary}`,
      metadata: {
        simulatedStatus: result.status,
        eventCount: result.events.length,
        forceFail: Boolean(forceFail),
      },
    });

    this.persist();
    return { success: result.success, status: result.status, error: result.error };
  }

  public resetSimulatedProvisioning(orgId: string): { success: boolean } {
    const org = this.organizations.find((o) => o.id === orgId);
    if (!org) return { success: false };

    org.provisioningStatus = 'not_started';
    org.updatedAt = new Date().toISOString();
    this.simulatedEvents = this.simulatedEvents.filter((e) => e.organizationId !== orgId);

    this.persist();
    return { success: true };
  }

  public resetToDefaults() {
    this.organizations = structuredClone(INITIAL_ORGANIZATIONS);
    this.plans = structuredClone(INITIAL_PLANS);
    this.subscriptions = structuredClone(INITIAL_SUBSCRIPTIONS);
    this.invoices = structuredClone(INITIAL_INVOICES);
    this.payments = structuredClone(INITIAL_PAYMENTS);
    this.platformUsers = structuredClone(INITIAL_PLATFORM_USERS);
    this.auditEvents = structuredClone(INITIAL_AUDIT_EVENTS);
    this.systemServices = structuredClone(INITIAL_SYSTEM_SERVICES);
    this.incidents = structuredClone(INITIAL_INCIDENTS);
    this.features = structuredClone(INITIAL_FEATURES);
    this.settings = structuredClone(INITIAL_PLATFORM_SETTINGS);
    this.modules = structuredClone(MASTER_MODULE_REGISTRY);
    this.organizationOverrides = structuredClone(INITIAL_ORGANIZATION_OVERRIDES);
    this.campuses = structuredClone(INITIAL_CAMPUSES);
    this.discounts = structuredClone(INITIAL_DISCOUNT_POLICIES);
    this.lifecycleEvents = structuredClone(INITIAL_LIFECYCLE_EVENTS);
    this.simulatedEvents = [];


    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
    this.notify();
  }


  // ==========================================
  // MASTER TENANT MODULE REGISTRY & ENTITLEMENTS
  // ==========================================

  public getModules(): TenantModuleDefinition[] {
    return [...this.modules];
  }

  public getModuleById(id: string): TenantModuleDefinition | undefined {
    return this.modules.find((m) => m.id === id || m.navId === id);
  }

  public getTopLevelModules(): TenantModuleDefinition[] {
    return this.modules.filter((m) => !m.parentId);
  }

  public getSubmodulesByParentId(parentId: string): TenantModuleDefinition[] {
    return this.modules.filter((m) => m.parentId === parentId);
  }

  public getOrganizationModuleOverrides(organizationId?: string): OrganizationModuleOverride[] {
    if (organizationId) {
      return this.organizationOverrides.filter((o) => o.organizationId === organizationId);
    }
    return [...this.organizationOverrides];
  }

  public setOrganizationModuleOverride(input: {
    organizationId: string;
    moduleId: string;
    action: OrganizationOverrideAction;
    reason: string;
    actorName?: string;
  }): { success: boolean; error?: string } {
    const org = this.organizations.find((o) => o.id === input.organizationId);
    if (!org) return { success: false, error: `Organization "${input.organizationId}" not found.` };

    const mod = this.modules.find((m) => m.id === input.moduleId || m.navId === input.moduleId);
    if (!mod) return { success: false, error: `Module "${input.moduleId}" not registered in catalogue.` };

    if (!input.reason || input.reason.trim().length < 5) {
      return { success: false, error: 'A justification reason of at least 5 characters is required for entitlement overrides.' };
    }

    const existingIndex = this.organizationOverrides.findIndex(
      (o) => o.organizationId === input.organizationId && o.moduleId === mod.id
    );

    const now = new Date().toISOString();
    const actor = input.actorName || 'Super Admin';

    if (input.action === 'inherit') {
      if (existingIndex !== -1) {
        this.organizationOverrides.splice(existingIndex, 1);
      }
    } else {
      const overrideRecord: OrganizationModuleOverride = {
        organizationId: input.organizationId,
        moduleId: mod.id,
        action: input.action,
        reason: input.reason.trim(),
        appliedBy: actor,
        appliedAt: existingIndex !== -1 ? this.organizationOverrides[existingIndex].appliedAt : now,
        updatedAt: now,
      };

      if (existingIndex !== -1) {
        this.organizationOverrides[existingIndex] = overrideRecord;
      } else {
        this.organizationOverrides.push(overrideRecord);
      }
    }

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: now,
      category: 'feature_toggles',
      action: 'MODULE_OVERRIDE_UPDATED',
      severity: input.action === 'force_disable' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: actor,
        email: 'ops-admin@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'TenantModuleEntitlement',
      targetId: `${input.organizationId}:${mod.id}`,
      targetName: `${org.name} - ${mod.name}`,
      status: 'succeeded',
      details: `Entitlement override set to "${input.action}" for module "${mod.name}". Justification: ${input.reason.trim()}`,
      metadata: {
        organizationId: input.organizationId,
        moduleId: mod.id,
        action: input.action,
        reason: input.reason.trim(),
      },
    });

    this.persist();
    return { success: true };
  }

  public resetOrganizationModuleOverride(
    organizationId: string,
    moduleId: string,
    actorName?: string
  ): { success: boolean; error?: string } {
    return this.setOrganizationModuleOverride({
      organizationId,
      moduleId,
      action: 'inherit',
      reason: 'Reverted to default subscription plan entitlement tier.',
      actorName,
    });
  }

  public setModuleGlobalAvailability(
    moduleId: string,
    isGloballyEnabled: boolean,
    actorName?: string
  ): { success: boolean; error?: string } {
    const mod = this.modules.find((m) => m.id === moduleId || m.navId === moduleId);
    if (!mod) return { success: false, error: `Module "${moduleId}" not found in catalogue.` };

    const oldState = mod.isGloballyEnabled;
    mod.isGloballyEnabled = isGloballyEnabled;

    const now = new Date().toISOString();
    const actor = actorName || 'Super Admin';

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: now,
      category: 'feature_toggles',
      action: 'MODULE_AVAILABILITY_TOGGLED',
      severity: isGloballyEnabled ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actor,
        email: 'ops-admin@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'TenantModule',
      targetId: mod.id,
      targetName: mod.name,
      status: 'succeeded',
      details: `Module "${mod.name}" global platform availability transitioned from ${oldState} to ${isGloballyEnabled}.`,
      metadata: {
        moduleId: mod.id,
        previousState: oldState,
        newState: isGloballyEnabled,
      },
    });

    this.persist();
    return { success: true };
  }

  public evaluateEntitlement(
    moduleId: string,
    organizationId?: string,
    planId?: string
  ): EffectiveEntitlementResult {
    let effectivePlanId = planId;
    if (organizationId && !effectivePlanId) {
      const org = this.organizations.find((o) => o.id === organizationId);
      if (org) effectivePlanId = org.planId;
    }

    return evaluateModuleEntitlement({
      moduleId,
      organizationId,
      planId: effectivePlanId,
      plans: this.plans,
      registry: this.modules,
      organizationOverrides: this.organizationOverrides,
    });
  }

  public validateRegistry(): RegistryValidationReport {
    return validateModuleRegistry({
      modules: this.modules,
      organizationOverrides: this.organizationOverrides,
      knownOrganizationIds: this.organizations.map((o) => o.id),
    });
  }

  public getModuleMetrics(): ModuleRegistryMetrics {
    const topModules = this.modules.filter((m) => !m.parentId);
    const submodules = this.modules.filter((m) => !!m.parentId);
    let totalMappedRoutes = 0;
    for (const m of this.modules) {
      totalMappedRoutes += m.routes.length;
    }

    const implementedCount = this.modules.filter((m) => m.status === 'implemented').length;
    const partialCount = this.modules.filter((m) => m.status === 'partial').length;
    const plannedCount = this.modules.filter((m) => m.status === 'planned').length;
    const missingCount = this.modules.filter((m) => m.status === 'missing').length;

    const platformEnabledCount = this.modules.filter((m) => m.isGloballyEnabled).length;
    const platformDisabledCount = this.modules.filter((m) => !m.isGloballyEnabled).length;

    const planStarterCount = this.modules.filter((m) => m.includedInPlans.includes('starter')).length;
    const planGrowthCount = this.modules.filter((m) => m.includedInPlans.includes('growth')).length;
    const planEnterpriseCount = this.modules.filter((m) => m.includedInPlans.includes('enterprise')).length;

    return {
      totalModules: this.modules.length,
      topLevelModules: topModules.length,
      submodules: submodules.length,
      totalMappedRoutes,
      implementedCount,
      partialCount,
      plannedCount,
      missingCount,
      platformEnabledCount,
      platformDisabledCount,
      planStarterCount,
      planGrowthCount,
      planEnterpriseCount,
      activeOverridesCount: this.organizationOverrides.length,
    };
  }
}

// Global Singleton Instance
export const platformStore = new PlatformStore();
