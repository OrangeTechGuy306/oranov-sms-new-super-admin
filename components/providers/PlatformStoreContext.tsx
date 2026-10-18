'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { platformStore, PlatformMetrics } from '@/lib/data/platform-store';
import {
  Organization,
  SubscriptionPlan,
  OrganizationSubscription,
  Invoice,
  PaymentRecord,
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
  PaymentMethodType,
  Campus,
  CreateCampusInput,
  UpdateCampusInput,
  CampusStatus,
  ProvisioningStatus,
  SubscriptionStatus,
} from '@/lib/types';
import {
  DiscountPolicy,
  SubscriptionLifecycleEvent,
  CreatePlanInput,
  UpdatePlanInput,
  CreateDiscountInput,
  MonetizationAnalyticsSummary,
} from '@/lib/monetization/types';
import { OrganizationReadinessReport } from '@/lib/readiness/evaluator';
import { SimulatedProvisioningEvent } from '@/lib/provisioning/simulator';

import {
  TenantModuleDefinition,
  OrganizationModuleOverride,
  OrganizationOverrideAction,
  EffectiveEntitlementResult,
  RegistryValidationReport,
} from '@/lib/modules/types';
import { ModuleRegistryMetrics } from '@/lib/data/platform-store';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface PlatformStoreContextType {
  metrics: PlatformMetrics;
  moduleMetrics: ModuleRegistryMetrics;
  organizations: Organization[];
  plans: SubscriptionPlan[];
  subscriptions: OrganizationSubscription[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  platformUsers: PlatformUser[];
  auditEvents: AuditEvent[];
  systemServices: PlatformServiceHealth[];
  incidents: PlatformIncidentNotice[];
  features: PlatformFeatureItem[];
  settings: PlatformSettings;
  modules: TenantModuleDefinition[];
  organizationModuleOverrides: OrganizationModuleOverride[];
  campuses: Campus[];
  discounts: DiscountPolicy[];
  subscriptionEvents: SubscriptionLifecycleEvent[];
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  getOrganizationById: (id: string) => Organization | undefined;
  getSubscriptionById: (id: string) => OrganizationSubscription | undefined;
  getSubscriptionByOrgId: (orgId: string) => OrganizationSubscription | undefined;
  getInvoicesByOrgId: (orgId: string) => Invoice[];
  getInvoiceById: (id: string) => Invoice | undefined;
  getPaymentsByOrgId: (orgId: string) => PaymentRecord[];
  getPaymentsByInvoiceId: (invoiceId: string) => PaymentRecord[];
  getPaymentById: (id: string) => PaymentRecord | undefined;
  getDiscounts: () => DiscountPolicy[];
  getDiscountByCode: (code: string) => DiscountPolicy | undefined;
  getSubscriptionEvents: (subId?: string) => SubscriptionLifecycleEvent[];
  getMonetizationAnalytics: (refDate?: string) => MonetizationAnalyticsSummary;
  getAuditEvents: (filter?: AuditLogFilter) => AuditEvent[];
  getCampuses: () => Campus[];
  getCampusesByOrgId: (orgId: string) => Campus[];
  getCampusById: (id: string) => Campus | undefined;
  getSimulatedEvents: (orgId?: string) => SimulatedProvisioningEvent[];
  createOrganization: (input: CreateOrganizationInput) => { success: boolean; organization?: Organization; error?: string };
  updateOrganization: (id: string, input: UpdateOrganizationInput) => { success: boolean; organization?: Organization; error?: string };
  setOrganizationStatus: (id: string, status: OrganizationLifecycleStatus, reason?: string) => { success: boolean; error?: string };
  updateOrganizationPlan: (id: string, planId: string, billingCycle?: 'monthly' | 'annual') => { success: boolean; error?: string };
  createPlan: (input: CreatePlanInput) => { success: boolean; plan?: SubscriptionPlan; error?: string };
  updatePlan: (id: string, input: UpdatePlanInput) => { success: boolean; plan?: SubscriptionPlan; error?: string };
  transitionSubscriptionStatus: (subId: string, status: SubscriptionStatus, reason: string) => { success: boolean; subscription?: OrganizationSubscription; error?: string };
  voidInvoice: (invoiceId: string, reason: string) => { success: boolean; invoice?: Invoice; error?: string };
  retryPayment: (paymentId: string) => { success: boolean; payment?: PaymentRecord; invoice?: Invoice; error?: string };
  createDiscount: (input: CreateDiscountInput) => { success: boolean; discount?: DiscountPolicy; error?: string };
  toggleDiscount: (id: string) => { success: boolean; discount?: DiscountPolicy; error?: string };
  createCampus: (input: CreateCampusInput) => { success: boolean; campus?: Campus; error?: string };
  updateCampus: (id: string, input: UpdateCampusInput) => { success: boolean; campus?: Campus; error?: string };
  setMainCampus: (orgId: string, campusId: string) => { success: boolean; error?: string };
  setCampusStatus: (campusId: string, status: CampusStatus, reason?: string) => { success: boolean; error?: string };
  deleteCampus: (campusId: string) => { success: boolean; error?: string };
  evaluateOrganizationReadiness: (orgId: string) => OrganizationReadinessReport;
  runSimulatedProvisioning: (orgId: string, forceFail?: boolean) => { success: boolean; status: ProvisioningStatus; error?: string };
  resetSimulatedProvisioning: (orgId: string) => { success: boolean };
  recordPayment: (input: { invoiceId: string; amount: number; method: PaymentMethodType; referenceNumber: string; notes?: string }) => { success: boolean; payment?: PaymentRecord; error?: string };
  createPlatformUser: (input: { name: string; email: string; role: PlatformRoleKey; department?: string; notes?: string }) => { success: boolean; user?: PlatformUser; error?: string };
  updatePlatformUserRole: (id: string, role: PlatformRoleKey) => { success: boolean; error?: string };
  updatePlatformUserStatus: (id: string, status: 'active' | 'suspended') => { success: boolean; error?: string };
  toggleFeature: (id: string) => { success: boolean; error?: string };
  updateSettings: (settings: Partial<PlatformSettings>) => { success: boolean };
  resetToDefaults: () => void;
  getModules: () => TenantModuleDefinition[];
  getModuleById: (id: string) => TenantModuleDefinition | undefined;
  getTopLevelModules: () => TenantModuleDefinition[];
  getSubmodulesByParentId: (parentId: string) => TenantModuleDefinition[];
  getOrganizationModuleOverrides: (organizationId?: string) => OrganizationModuleOverride[];
  setOrganizationModuleOverride: (input: { organizationId: string; moduleId: string; action: OrganizationOverrideAction; reason: string; actorName?: string }) => { success: boolean; error?: string };
  resetOrganizationModuleOverride: (organizationId: string, moduleId: string, actorName?: string) => { success: boolean; error?: string };
  setModuleGlobalAvailability: (moduleId: string, isGloballyEnabled: boolean, actorName?: string) => { success: boolean; error?: string };
  evaluateEntitlement: (moduleId: string, organizationId?: string, planId?: string) => EffectiveEntitlementResult;
  validateRegistry: () => RegistryValidationReport;
}

const PlatformStoreContext = createContext<PlatformStoreContextType | undefined>(undefined);



let toastCounter = 0;

export function PlatformStoreProvider({ children }: { children: React.ReactNode }) {
  // Subscribe to changes in platformStore
  const [, setVersion] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = platformStore.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    toastCounter += 1;
    const id = `toast_${toastCounter}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const createOrganization = (input: CreateOrganizationInput) => {
    const res = platformStore.createOrganization(input);
    if (res.success && res.organization) {
      addToast({
        type: 'success',
        title: 'Organization Created',
        message: `Registered ${res.organization.name} (${res.organization.code}) in development store.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updateOrganization = (id: string, input: UpdateOrganizationInput) => {
    const res = platformStore.updateOrganization(id, input);
    if (res.success && res.organization) {
      addToast({
        type: 'success',
        title: 'Organization Updated',
        message: `Profile updated for ${res.organization.name}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const setOrganizationStatus = (id: string, status: OrganizationLifecycleStatus, reason?: string) => {
    const res = platformStore.setOrganizationStatus(id, status, reason);
    if (res.success) {
      addToast({
        type: status === 'suspended' ? 'warning' : 'success',
        title: 'Lifecycle Status Changed',
        message: `Organization status set to ${status}. Local mock state updated.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updateOrganizationPlan = (id: string, planId: string, billingCycle?: 'monthly' | 'annual') => {
    const res = platformStore.updateOrganizationPlan(id, planId, billingCycle);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Plan Updated',
        message: 'Subscription plan updated in development store.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Plan Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const recordPayment = (input: { invoiceId: string; amount: number; method: PaymentMethodType; referenceNumber: string; notes?: string }) => {
    const res = platformStore.recordPayment(input);
    if (res.success && res.payment) {
      addToast({
        type: 'success',
        title: 'Payment Recorded (Demo)',
        message: `Settlement of $${res.payment.amount.toLocaleString()} ${res.payment.currency} recorded in development ledger. No live card charged.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Payment Rejected',
        message: res.error,
      });
    }
    return res;
  };

  const createPlatformUser = (input: { name: string; email: string; role: PlatformRoleKey; department?: string; notes?: string }) => {
    const res = platformStore.createPlatformUser(input);
    if (res.success && res.user) {
      addToast({
        type: 'success',
        title: 'Platform Administrator Added',
        message: `Created ${res.user.name} (${res.user.role}). Development record only.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'User Creation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updatePlatformUserRole = (id: string, role: PlatformRoleKey) => {
    const res = platformStore.updatePlatformUserRole(id, role);
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Role Reassigned',
        message: `Platform role updated to ${role}.`,
      });
    }
    return res;
  };

  const updatePlatformUserStatus = (id: string, status: 'active' | 'suspended') => {
    const res = platformStore.updatePlatformUserStatus(id, status);
    if (res.success) {
      addToast({
        type: status === 'suspended' ? 'warning' : 'success',
        title: 'User Status Updated',
        message: `Platform user is now ${status}.`,
      });
    }
    return res;
  };

  const toggleFeature = (id: string) => {
    const res = platformStore.toggleFeature(id);
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Feature Availability Toggled',
        message: 'Updated mock feature catalogue status. Backend enforcement required in production.',
      });
    }
    return res;
  };

  const updateSettings = (settings: Partial<PlatformSettings>) => {
    const res = platformStore.updateSettings(settings);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Global platform settings updated in local mock store.',
      });
    }
    return res;
  };

  const resetToDefaults = () => {
    platformStore.resetToDefaults();
    addToast({
      type: 'info',
      title: 'Store Reset',
      message: 'All development fixtures have been reset to factory defaults.',
    });
  };

  const setOrganizationModuleOverride = (input: {
    organizationId: string;
    moduleId: string;
    action: OrganizationOverrideAction;
    reason: string;
    actorName?: string;
  }) => {
    const res = platformStore.setOrganizationModuleOverride(input);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Entitlement Override Saved',
        message: `Override "${input.action}" applied in development store.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Override Failed',
        message: res.error,
      });
    }
    return res;
  };

  const resetOrganizationModuleOverride = (organizationId: string, moduleId: string, actorName?: string) => {
    const res = platformStore.resetOrganizationModuleOverride(organizationId, moduleId, actorName);
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Override Reset',
        message: 'Reverted module entitlement to plan default.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: res.error,
      });
    }
    return res;
  };

  const setModuleGlobalAvailability = (moduleId: string, isGloballyEnabled: boolean, actorName?: string) => {
    const res = platformStore.setModuleGlobalAvailability(moduleId, isGloballyEnabled, actorName);
    if (res.success) {
      addToast({
        type: isGloballyEnabled ? 'success' : 'warning',
        title: 'Platform Availability Updated',
        message: `Module global availability set to ${isGloballyEnabled ? 'enabled' : 'disabled'}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const createCampus = (input: CreateCampusInput) => {
    const res = platformStore.createCampus(input);
    if (res.success && res.campus) {
      addToast({
        type: 'success',
        title: 'Campus Created',
        message: `Registered campus "${res.campus.name}" (${res.campus.code}) in local development state.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Campus Creation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updateCampus = (id: string, input: UpdateCampusInput) => {
    const res = platformStore.updateCampus(id, input);
    if (res.success && res.campus) {
      addToast({
        type: 'success',
        title: 'Campus Updated',
        message: `Updated profile details for "${res.campus.name}".`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const setMainCampus = (orgId: string, campusId: string) => {
    const res = platformStore.setMainCampus(orgId, campusId);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Main Campus Designated',
        message: 'Primary institutional campus updated.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Designation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const setCampusStatus = (campusId: string, status: CampusStatus, reason?: string) => {
    const res = platformStore.setCampusStatus(campusId, status, reason);
    if (res.success) {
      addToast({
        type: status === 'active' ? 'success' : 'warning',
        title: 'Campus Status Changed',
        message: `Campus is now ${status}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Status Change Failed',
        message: res.error,
      });
    }
    return res;
  };

  const deleteCampus = (campusId: string) => {
    const res = platformStore.deleteCampus(campusId);
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Campus Removed',
        message: 'Campus record removed from development store.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Deletion Blocked',
        message: res.error,
      });
    }
    return res;
  };

  const runSimulatedProvisioning = (orgId: string, forceFail?: boolean) => {
    const res = platformStore.runSimulatedProvisioning(orgId, forceFail);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Simulated Provisioning Succeeded',
        message: 'All 5 local demonstration steps completed successfully.',
      });
    } else {
      addToast({
        type: 'error',
        title: 'Simulation Notice',
        message: res.error || 'Provisioning simulation reported blockers or failure.',
      });
    }
    return res;
  };

  const resetSimulatedProvisioning = (orgId: string) => {
    const res = platformStore.resetSimulatedProvisioning(orgId);
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Simulation Reset',
        message: 'Provisioning status reset to Not Started.',
      });
    }
    return res;
  };

  const createPlan = (input: CreatePlanInput) => {
    const res = platformStore.createPlan(input);
    if (res.success && res.plan) {
      addToast({
        type: 'success',
        title: 'Subscription Plan Created',
        message: `Plan "${res.plan.name}" added to platform catalogue.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Plan Creation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updatePlan = (id: string, input: UpdatePlanInput) => {
    const res = platformStore.updatePlan(id, input);
    if (res.success && res.plan) {
      addToast({
        type: 'success',
        title: 'Subscription Plan Updated',
        message: `Saved configuration changes for "${res.plan.name}".`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Plan Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const transitionSubscriptionStatus = (subId: string, status: SubscriptionStatus, reason: string) => {
    const res = platformStore.transitionSubscriptionStatus(subId, status, reason);
    if (res.success) {
      addToast({
        type: status === 'canceled' || status === 'suspended' ? 'warning' : 'success',
        title: 'Subscription Status Updated',
        message: `Subscription transitioned to ${status}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Transition Blocked',
        message: res.error,
      });
    }
    return res;
  };

  const voidInvoice = (invoiceId: string, reason: string) => {
    const res = platformStore.voidInvoice(invoiceId, reason);
    if (res.success && res.invoice) {
      addToast({
        type: 'warning',
        title: 'Invoice Voided',
        message: `Invoice ${res.invoice.invoiceNumber} has been voided.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Void Action Failed',
        message: res.error,
      });
    }
    return res;
  };

  const retryPayment = (paymentId: string) => {
    const res = platformStore.retryPayment(paymentId);
    if (res.success && res.payment) {
      addToast({
        type: 'success',
        title: 'Payment Settlement Simulated',
        message: `Payment ${res.payment.referenceNumber} processed successfully in simulation.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Payment Retry Failed',
        message: res.error,
      });
    }
    return res;
  };

  const createDiscount = (input: CreateDiscountInput) => {
    const res = platformStore.createDiscount(input);
    if (res.success && res.discount) {
      addToast({
        type: 'success',
        title: 'Discount Policy Created',
        message: `Promotional code "${res.discount.code}" activated.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Discount Creation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const toggleDiscount = (id: string) => {
    const res = platformStore.toggleDiscount(id);
    if (res.success && res.discount) {
      addToast({
        type: res.discount.isActive ? 'success' : 'info',
        title: 'Discount Status Changed',
        message: `Promotional code "${res.discount.code}" is now ${res.discount.isActive ? 'active' : 'inactive'}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: res.error,
      });
    }
    return res;
  };

  const value: PlatformStoreContextType = {
    metrics: platformStore.getMetrics(),
    moduleMetrics: platformStore.getModuleMetrics(),
    organizations: platformStore.getOrganizations(),
    plans: platformStore.getPlans(),
    subscriptions: platformStore.getSubscriptions(),
    invoices: platformStore.getInvoices(),
    payments: platformStore.getPayments(),
    platformUsers: platformStore.getPlatformUsers(),
    auditEvents: platformStore.getAuditEvents(),
    systemServices: platformStore.getSystemServices(),
    incidents: platformStore.getIncidents(),
    features: platformStore.getFeatures(),
    settings: platformStore.getSettings(),
    modules: platformStore.getModules(),
    organizationModuleOverrides: platformStore.getOrganizationModuleOverrides(),
    campuses: platformStore.getCampuses(),
    discounts: platformStore.getDiscounts(),
    subscriptionEvents: platformStore.getSubscriptionEvents(),
    toasts,
    addToast,
    removeToast,
    getOrganizationById: (id: string) => platformStore.getOrganizationById(id),
    getSubscriptionById: (id: string) => platformStore.getSubscriptionById(id),
    getSubscriptionByOrgId: (orgId: string) => platformStore.getSubscriptionByOrgId(orgId),
    getInvoicesByOrgId: (orgId: string) => platformStore.getInvoicesByOrgId(orgId),
    getInvoiceById: (id: string) => platformStore.getInvoiceById(id),
    getPaymentsByOrgId: (orgId: string) => platformStore.getPaymentsByOrgId(orgId),
    getPaymentsByInvoiceId: (invoiceId: string) => platformStore.getPaymentsByInvoiceId(invoiceId),
    getPaymentById: (id: string) => platformStore.getPaymentById(id),
    getDiscounts: () => platformStore.getDiscounts(),
    getDiscountByCode: (code: string) => platformStore.getDiscountByCode(code),
    getSubscriptionEvents: (subId?: string) => platformStore.getSubscriptionEvents(subId),
    getMonetizationAnalytics: (refDate?: string) => platformStore.getMonetizationAnalytics(refDate),
    getAuditEvents: (filter?: AuditLogFilter) => platformStore.getAuditEvents(filter),
    getCampuses: () => platformStore.getCampuses(),
    getCampusesByOrgId: (orgId: string) => platformStore.getCampusesByOrgId(orgId),
    getCampusById: (id: string) => platformStore.getCampusById(id),
    getSimulatedEvents: (orgId?: string) => platformStore.getSimulatedEvents(orgId),
    createOrganization,
    updateOrganization,
    setOrganizationStatus,
    updateOrganizationPlan,
    createPlan,
    updatePlan,
    transitionSubscriptionStatus,
    voidInvoice,
    retryPayment,
    createDiscount,
    toggleDiscount,
    createCampus,
    updateCampus,
    setMainCampus,
    setCampusStatus,
    deleteCampus,
    evaluateOrganizationReadiness: (orgId: string) => platformStore.evaluateOrganizationReadiness(orgId),
    runSimulatedProvisioning,
    resetSimulatedProvisioning,
    recordPayment,
    createPlatformUser,
    updatePlatformUserRole,
    updatePlatformUserStatus,
    toggleFeature,
    updateSettings,
    resetToDefaults,
    getModules: () => platformStore.getModules(),
    getModuleById: (id: string) => platformStore.getModuleById(id),
    getTopLevelModules: () => platformStore.getTopLevelModules(),
    getSubmodulesByParentId: (parentId: string) => platformStore.getSubmodulesByParentId(parentId),
    getOrganizationModuleOverrides: (orgId?: string) => platformStore.getOrganizationModuleOverrides(orgId),
    setOrganizationModuleOverride,
    resetOrganizationModuleOverride,
    setModuleGlobalAvailability,
    evaluateEntitlement: (moduleId: string, orgId?: string, planId?: string) =>
      platformStore.evaluateEntitlement(moduleId, orgId, planId),
    validateRegistry: () => platformStore.validateRegistry(),
  };


  return (
    <PlatformStoreContext.Provider value={value}>
      {children}
      {/* Toast notifications container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-lg shadow-lg border text-sm flex items-start justify-between gap-3 transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-100'
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100'
                : 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100'
            }`}
          >
            <div>
              <p className="font-semibold text-xs tracking-wider uppercase opacity-90">{toast.title}</p>
              {toast.message && <p className="mt-0.5 text-xs opacity-90">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs opacity-60 hover:opacity-100 font-bold px-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </PlatformStoreContext.Provider>
  );
}

export function usePlatformStore() {
  const context = useContext(PlatformStoreContext);
  if (!context) {
    throw new Error('usePlatformStore must be used within a PlatformStoreProvider');
  }
  return context;
}
