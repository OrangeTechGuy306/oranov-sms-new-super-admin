'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Badge } from '@/components/ui/Badge';
import type {
  CreateOrganizationInput,
  OrganizationOwnershipType,
  SchoolClassification,
} from '@/lib/types';
import {
  CANONICAL_SCHOOL_TYPES,
  type CanonicalSchoolType,
  isSchoolTypeCompatible,
} from '@/lib/modules/canonical-contract';
import {
  extractZodFieldErrors,
  ORGANIZATION_OWNERSHIP_TYPES,
  registrationAdminSchema,
  registrationCampusSchema,
  registrationClassificationSchema,
  registrationContactSchema,
  registrationIdentitySchema,
  registrationSubscriptionSchema,
} from '@/lib/validations/organizationRegistration';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  Building2,
  User,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Eye,
  MapPin,
  Save,
  RotateCcw,
  Layers,
  Phone,
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'sms_superadmin_org_registration_draft_v1';

const STEPS = [
  { id: 1, title: 'Organization', subtitle: 'Identity & Legal' },
  { id: 2, title: 'Classification', subtitle: 'School Categories' },
  { id: 3, title: 'Contact', subtitle: 'Official Address' },
  { id: 4, title: 'Administrator', subtitle: 'Initial Executive' },
  { id: 5, title: 'Initial Campus', subtitle: 'Main Facility' },
  { id: 6, title: 'Subscription', subtitle: 'Plan & Quotas' },
  { id: 7, title: 'Review & Submit', subtitle: 'Simulated Launch' },
];

const SCHOOL_CATEGORY_LABELS: Record<CanonicalSchoolType, string> = {
  nursery: 'Nursery / Early Years',
  primary: 'Primary / Elementary',
  secondary: 'Secondary / High School',
  combined: 'Combined (All-Through)',
  college: 'College / Tertiary',
  vocational: 'Vocational & Trade',
  international: 'International Curriculum',
};

const INITIAL_FORM_STATE: CreateOrganizationInput = {
  name: '',
  legalName: '',
  code: '',
  organizationType: 'private',
  classification: 'combined',
  institutionCategories: ['primary', 'secondary'],
  subdomain: '',
  initialLifecycleStatus: 'registration_pending',
  contact: {
    email: '',
    phone: '',
    address: '',
    city: '',
    stateOrProvince: '',
    country: 'United States',
    postalCode: '',
    website: '',
  },
  administrator: {
    name: '',
    email: '',
    phone: '',
    roleTitle: 'Principal / Head of School',
  },
  initialCampus: {
    name: '',
    code: '',
    type: 'main',
    street: '',
    city: '',
    stateOrProvince: '',
    country: 'United States',
    postalCode: '',
    studentCapacity: 500,
  },
  planId: 'plan_growth',
  billingCycle: 'annual',
  startTrial: true,
  technicalConfig: {
    subdomain: '',
    timezone: 'America/New_York',
    academicYearStartMonth: 9,
    currency: 'USD',
    locale: 'en-US',
    maxCampuses: 2,
  },
  notes: '',
};

function derivePrimaryClassification(categories: CanonicalSchoolType[]): SchoolClassification {
  if (categories.length === 1) return categories[0];
  if (categories.includes('international')) return 'international';
  if (categories.includes('combined')) return 'combined';
  if (categories.includes('primary') && categories.includes('secondary')) return 'combined';
  return categories[0] || 'combined';
}

export default function OrganizationRegistrationWizardPage() {
  const { plans, organizations, modules, createOrganization } = usePlatformStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [createdResult, setCreatedResult] = useState<{
    id: string;
    isDraft: boolean;
    name: string;
    code: string;
    subdomain: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSavedLocalDraft, setHasSavedLocalDraft] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return Boolean(localStorage.getItem(DRAFT_STORAGE_KEY));
    } catch {
      return false;
    }
  });
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateOrganizationInput>(INITIAL_FORM_STATE);

  const clearErrorKeys = (keys: string[]) => {
    setErrors((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const k of keys) {
        if (next[k]) {
          delete next[k];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  };

  const handleSaveBrowserDraft = () => {
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          step: currentStep,
          formData,
          savedAt: new Date().toISOString(),
        })
      );
      setHasSavedLocalDraft(true);
      setDraftNotice('Draft progress saved locally in this browser.');
    } catch {
      setDraftNotice('Unable to write local draft storage.');
    }
  };

  const handleLoadBrowserDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { step?: number; formData?: CreateOrganizationInput };
      if (parsed.formData) {
        setFormData({ ...INITIAL_FORM_STATE, ...parsed.formData });
        setCurrentStep(Math.min(Math.max(parsed.step || 1, 1), STEPS.length));
        setDraftNotice('Resumed saved local registration draft.');
      }
    } catch {
      setDraftNotice('Could not parse saved registration draft.');
    }
  };

  const handleDiscardBrowserDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setHasSavedLocalDraft(false);
    setDraftNotice('Discarded saved local draft.');
  };

  const toggleCategory = (cat: CanonicalSchoolType) => {
    setFormData((prev) => {
      const current = prev.institutionCategories ?? [];
      const exists = current.includes(cat);
      const nextCategories = exists
        ? current.filter((c) => c !== cat)
        : [...current, cat];
      return {
        ...prev,
        institutionCategories: nextCategories,
        classification: derivePrimaryClassification(nextCategories),
      };
    });
    clearErrorKeys(['institutionCategories', 'classification']);
  };

  const validateStep = (step: number): boolean => {
    let errs: Record<string, string> = {};

    if (step === 1) {
      const parsed = registrationIdentitySchema.safeParse({
        name: formData.name,
        legalName: formData.legalName,
        code: formData.code,
        organizationType: formData.organizationType || 'private',
        subdomain: formData.subdomain,
      });
      if (!parsed.success) {
        errs = extractZodFieldErrors(parsed.error);
      } else {
        const upperCode = parsed.data.code.toUpperCase();
        if (organizations.some((o) => o.code.toUpperCase() === upperCode)) {
          errs.code = `Organization code "${upperCode}" is already registered.`;
        }
        const cleanSub = parsed.data.subdomain.toLowerCase();
        if (organizations.some((o) => o.subdomain.toLowerCase() === cleanSub)) {
          errs.subdomain = `Slug/subdomain "${cleanSub}" is already taken.`;
        }
      }
    } else if (step === 2) {
      const parsed = registrationClassificationSchema.safeParse({
        classification: formData.classification,
        institutionCategories: formData.institutionCategories ?? [],
      });
      if (!parsed.success) {
        errs = extractZodFieldErrors(parsed.error);
      }
    } else if (step === 3) {
      const parsed = registrationContactSchema.safeParse(formData.contact);
      if (!parsed.success) {
        errs = extractZodFieldErrors(parsed.error, 'contact');
      }
    } else if (step === 4) {
      const parsed = registrationAdminSchema.safeParse(formData.administrator);
      if (!parsed.success) {
        errs = extractZodFieldErrors(parsed.error, 'admin');
      }
    } else if (step === 5) {
      const parsed = registrationCampusSchema.safeParse(formData.initialCampus);
      if (!parsed.success) {
        errs = extractZodFieldErrors(parsed.error, 'campus');
      }
    } else if (step === 6) {
      const parsed = registrationSubscriptionSchema.safeParse({
        planId: formData.planId,
        billingCycle: formData.billingCycle,
        startTrial: Boolean(formData.startTrial),
        maxCampuses: formData.technicalConfig.maxCampuses,
        timezone: formData.technicalConfig.timezone,
        currency: formData.technicalConfig.currency,
        locale: formData.technicalConfig.locale,
        academicYearStartMonth: formData.technicalConfig.academicYearStartMonth,
      });
      if (!parsed.success) {
        errs = extractZodFieldErrors(parsed.error);
      } else if (!plans.some((p) => p.id === parsed.data.planId)) {
        errs.planId = 'Selected plan does not exist in canonical catalogue.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
    }
  };

  const handleSubmit = (asDraftInStore = false) => {
    if (isSubmitting) return;
    if (!asDraftInStore) {
      for (let s = 1; s <= 6; s++) {
        if (!validateStep(s)) {
          setCurrentStep(s);
          return;
        }
      }
    } else if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const payload: CreateOrganizationInput = {
        ...formData,
        initialLifecycleStatus: asDraftInStore ? 'draft' : 'registration_pending',
        code: formData.code.trim().toUpperCase(),
        subdomain: formData.subdomain.trim().toLowerCase(),
        technicalConfig: {
          ...formData.technicalConfig,
          subdomain: formData.subdomain.trim().toLowerCase(),
        },
      };
      const res = createOrganization(payload);
      setIsSubmitting(false);
      if (res.success && res.organization) {
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
          setHasSavedLocalDraft(false);
        } catch {
          // ignore
        }
        setCreatedResult({
          id: res.organization.id,
          isDraft: asDraftInStore,
          name: res.organization.name,
          code: res.organization.code,
          subdomain: res.organization.subdomain,
        });
      } else if (res.error) {
        setErrors({ submit: res.error });
      }
    }, 250);
  };

  const selectedPlan = plans.find((p) => p.id === formData.planId) || plans[0];
  const categories = formData.institutionCategories ?? ['combined'];
  const compatibleModulesCount = modules.filter((m) =>
    (selectedPlan?.includedModuleIds?.includes(m.id) ?? m.includedInPlans.includes(selectedPlan.tier)) &&
    categories.some((cat) => isSchoolTypeCompatible(cat, m.supportedSchoolTypes))
  ).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Register New School Organization"
        description="Zod-validated multi-step institutional intake supporting combined school categories, draft staging, and simulated registration submission."
        backUrl="/organizations"
        actions={
          !createdResult ? (
            <div className="flex items-center gap-2 flex-wrap">
              {hasSavedLocalDraft && (
                <>
                  <button
                    type="button"
                    onClick={handleLoadBrowserDraft}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-primary/40 text-primary hover:bg-primary/10 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Resume Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardBrowserDraft}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted cursor-pointer"
                  >
                    Discard Draft
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={handleSaveBrowserDraft}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Browser Draft
              </button>
            </div>
          ) : null
        }
      />

      {draftNotice && (
        <AlertBanner variant="info" className="text-xs">
          {draftNotice}
        </AlertBanner>
      )}

      {createdResult ? (
        <div className="bg-card text-card-foreground p-8 rounded-2xl border border-border shadow-md text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              {createdResult.isDraft
                ? 'Organization Registration Draft Saved (Simulated)'
                : 'Simulated Registration Submitted for Review'}
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Client-side simulation recorded <strong className="text-foreground">{createdResult.name}</strong> ({createdResult.code}) in{' '}
              <strong className="text-foreground">
                {createdResult.isDraft ? 'Draft' : 'Registration Pending'}
              </strong>{' '}
              lifecycle status with initial campus <strong className="text-foreground">{formData.initialCampus?.name}</strong> and staged plan{' '}
              <strong className="text-foreground">{selectedPlan.name}</strong>.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-xl border border-border text-xs text-left max-w-lg mx-auto space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lifecycle State:</span>
              <span className="font-semibold text-foreground">
                {createdResult.isDraft ? 'draft' : 'registration_pending'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Institution Categories:</span>
              <span className="font-semibold text-foreground">{categories.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Compatible Plan Modules:</span>
              <span className="font-semibold text-foreground">{compatibleModulesCount} modules (P0-4)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provisioning Prep Status:</span>
              <span className="font-semibold text-foreground">
                {createdResult.isDraft ? 'not_started' : 'ready_for_review'}
              </span>
            </div>
          </div>

          <AlertBanner variant="warning" className="text-left text-xs max-w-lg mx-auto">
            <strong>Frontend Simulation Notice:</strong> No live server cluster, relational database tenant partition, DNS record, or administrator onboarding email was provisioned or dispatched. Future backend workers must execute real tenant provisioning.
          </AlertBanner>

          <div className="flex justify-center gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setCreatedResult(null);
                setCurrentStep(1);
                setFormData(INITIAL_FORM_STATE);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted cursor-pointer"
            >
              Register Another Organization
            </button>
            <Link
              href={`/organizations/${createdResult.id}`}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Inspect Readiness, Onboarding & Provisioning
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stepper Bar */}
          <div className="bg-card text-card-foreground p-4 rounded-xl border border-border shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {STEPS.map((step) => {
                const isActive = step.id === currentStep;
                const isPassed = step.id < currentStep;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (step.id < currentStep) setCurrentStep(step.id);
                    }}
                    disabled={step.id > currentStep}
                    className={`flex flex-col text-left p-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary/10 border-l-3 border-primary text-primary'
                        : isPassed
                        ? 'text-foreground/80 hover:bg-muted cursor-pointer'
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Step {step.id} {isPassed ? '✓' : ''}
                    </span>
                    <span className="text-xs font-semibold truncate">{step.title}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{step.subtitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-6">
            {/* Step 1: Organization Identity */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Step 1: Organization & Legal Identity
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Provide institutional naming, ownership model, unique code, and portal identifier.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      School Display Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name: val,
                          initialCampus: {
                            ...prev.initialCampus!,
                            name:
                              !prev.initialCampus?.name ||
                              prev.initialCampus.name === `${prev.name} Main Campus`
                                ? val
                                  ? `${val} Main Campus`
                                  : ''
                                : prev.initialCampus.name,
                          },
                        }));
                        clearErrorKeys(['name']);
                      }}
                      placeholder="e.g. Oakridge Combined College"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors.name && <p className="text-rose-500 text-[11px]">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Registered / Legal Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.legalName || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, legalName: e.target.value }))}
                      placeholder="e.g. Oakridge Educational Foundation Ltd."
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors.legalName && <p className="text-rose-500 text-[11px]">{errors.legalName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Unique Institution Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setFormData((prev) => ({
                          ...prev,
                          code: val,
                          initialCampus: {
                            ...prev.initialCampus!,
                            code:
                              !prev.initialCampus?.code ||
                              prev.initialCampus.code === `${prev.code}-MAIN`
                                ? val
                                  ? `${val}-MAIN`
                                  : ''
                                : prev.initialCampus.code,
                          },
                        }));
                        clearErrorKeys(['code']);
                      }}
                      placeholder="e.g. OAKRIDGE"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono uppercase text-foreground"
                    />
                    {errors.code && <p className="text-rose-500 text-[11px]">{errors.code}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Workspace Slug / Subdomain <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={formData.subdomain}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase();
                          setFormData((prev) => ({
                            ...prev,
                            subdomain: val,
                            technicalConfig: { ...prev.technicalConfig, subdomain: val },
                          }));
                          clearErrorKeys(['subdomain']);
                        }}
                        placeholder="e.g. oakridge"
                        className="w-full px-3 py-2 rounded-l-lg border border-border bg-background font-mono text-foreground"
                      />
                      <span className="px-2.5 py-2 bg-muted border border-l-0 border-border rounded-r-lg text-muted-foreground font-mono">
                        .schoolsaas.internal
                      </span>
                    </div>
                    {errors.subdomain && <p className="text-rose-500 text-[11px]">{errors.subdomain}</p>}
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-semibold text-foreground">Ownership / Organization Type</label>
                    <select
                      value={formData.organizationType || 'private'}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          organizationType: e.target.value as OrganizationOwnershipType,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground capitalize"
                    >
                      {ORGANIZATION_OWNERSHIP_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Institution Classification (Multi-Category Support) */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Step 2: Institution Classification & Academic Scope
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select one or multiple institutional categories (e.g., Nursery + Primary + Secondary). This configures P0-4 module compatibility and adaptable onboarding steps.
                  </p>
                </div>

                {errors.institutionCategories && (
                  <AlertBanner variant="error" className="text-xs">
                    {errors.institutionCategories}
                  </AlertBanner>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {CANONICAL_SCHOOL_TYPES.map((cat) => {
                    const selected = (formData.institutionCategories ?? []).includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          selected
                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                            : 'border-border bg-background hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">
                            {SCHOOL_CATEGORY_LABELS[cat]}
                          </span>
                          <Badge variant={selected ? 'info' : 'neutral'} size="sm">
                            {selected ? 'Selected' : 'Optional'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                          type id: {cat}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Derived Primary Classification:{' '}
                    <strong className="uppercase">{formData.classification}</strong>
                  </span>
                  <span className="text-muted-foreground font-mono">
                    Active categories: [{categories.join(', ')}]
                  </span>
                </div>
              </div>
            )}

            {/* Step 3: Official Contact */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Step 3: Institutional Contact & Location
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Primary headquarters address, telephone, email, and public website.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      School Official Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          contact: { ...p.contact, email: e.target.value },
                        }));
                        clearErrorKeys(['contact.email']);
                      }}
                      placeholder="admin@oakridge.edu"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['contact.email'] && (
                      <p className="text-rose-500 text-[11px]">{errors['contact.email']}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Telephone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.contact.phone}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          contact: { ...p.contact, phone: e.target.value },
                        }));
                        clearErrorKeys(['contact.phone']);
                      }}
                      placeholder="+1 (555) 200-3400"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['contact.phone'] && (
                      <p className="text-rose-500 text-[11px]">{errors['contact.phone']}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contact.country}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({
                          ...p,
                          contact: { ...p.contact, country: val },
                          initialCampus: { ...p.initialCampus!, country: val },
                        }));
                        clearErrorKeys(['contact.country']);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['contact.country'] && (
                      <p className="text-rose-500 text-[11px]">{errors['contact.country']}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      State / Region <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contact.stateOrProvince}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({
                          ...p,
                          contact: { ...p.contact, stateOrProvince: val },
                          initialCampus: { ...p.initialCampus!, stateOrProvince: val },
                        }));
                        clearErrorKeys(['contact.stateOrProvince']);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['contact.stateOrProvince'] && (
                      <p className="text-rose-500 text-[11px]">{errors['contact.stateOrProvince']}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contact.city}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({
                          ...p,
                          contact: { ...p.contact, city: val },
                          initialCampus: {
                            ...p.initialCampus!,
                            city: p.initialCampus?.city || val,
                          },
                        }));
                        clearErrorKeys(['contact.city']);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['contact.city'] && (
                      <p className="text-rose-500 text-[11px]">{errors['contact.city']}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Website (Optional)</label>
                    <input
                      type="url"
                      value={formData.contact.website || ''}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          contact: { ...p.contact, website: e.target.value },
                        }));
                        clearErrorKeys(['contact.website']);
                      }}
                      placeholder="https://school.edu"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['contact.website'] && (
                      <p className="text-rose-500 text-[11px]">{errors['contact.website']}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-semibold text-foreground">
                      Street Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contact.address}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({
                          ...p,
                          contact: { ...p.contact, address: val },
                          initialCampus: {
                            ...p.initialCampus!,
                            street: p.initialCampus?.street || val,
                          },
                        }));
                        clearErrorKeys(['contact.address']);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['contact.address'] && (
                      <p className="text-rose-500 text-[11px]">{errors['contact.address']}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Initial Administrator */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Step 4: Initial Executive / Primary Administrator
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Designate the primary account holder responsible for completing guided school onboarding.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.administrator.name}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          administrator: { ...p.administrator, name: e.target.value },
                        }));
                        clearErrorKeys(['admin.name']);
                      }}
                      placeholder="e.g. Dr. Evelyn Vance"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['admin.name'] && <p className="text-rose-500 text-[11px]">{errors['admin.name']}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Role Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.administrator.roleTitle}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          administrator: { ...p.administrator, roleTitle: e.target.value },
                        }));
                        clearErrorKeys(['admin.roleTitle']);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['admin.roleTitle'] && (
                      <p className="text-rose-500 text-[11px]">{errors['admin.roleTitle']}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Administrator Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.administrator.email}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          administrator: { ...p.administrator, email: e.target.value },
                        }));
                        clearErrorKeys(['admin.email']);
                      }}
                      placeholder="principal@oakridge.edu"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['admin.email'] && (
                      <p className="text-rose-500 text-[11px]">{errors['admin.email']}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Direct Telephone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.administrator.phone}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          administrator: { ...p.administrator, phone: e.target.value },
                        }));
                        clearErrorKeys(['admin.phone']);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['admin.phone'] && (
                      <p className="text-rose-500 text-[11px]">{errors['admin.phone']}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Initial Campus Configuration */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Step 5: Initial Main Campus Configuration
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Every tenant requires one designated Main Campus anchor record.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Main Campus Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.initialCampus?.name || ''}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          initialCampus: { ...p.initialCampus!, name: e.target.value },
                        }));
                        clearErrorKeys(['campus.name']);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['campus.name'] && (
                      <p className="text-rose-500 text-[11px]">{errors['campus.name']}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Main Campus Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.initialCampus?.code || ''}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          initialCampus: { ...p.initialCampus!, code: e.target.value.toUpperCase() },
                        }));
                        clearErrorKeys(['campus.code']);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono uppercase text-foreground"
                    />
                    {errors['campus.code'] && (
                      <p className="text-rose-500 text-[11px]">{errors['campus.code']}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.initialCampus?.city || ''}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          initialCampus: { ...p.initialCampus!, city: e.target.value },
                        }));
                        clearErrorKeys(['campus.city']);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['campus.city'] && (
                      <p className="text-rose-500 text-[11px]">{errors['campus.city']}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Estimated Student Capacity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={50000}
                      value={formData.initialCampus?.studentCapacity ?? 500}
                      onChange={(e) => {
                        setFormData((p) => ({
                          ...p,
                          initialCampus: {
                            ...p.initialCampus!,
                            studentCapacity: Number(e.target.value) || 0,
                          },
                        }));
                        clearErrorKeys(['campus.studentCapacity']);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors['campus.studentCapacity'] && (
                      <p className="text-rose-500 text-[11px]">{errors['campus.studentCapacity']}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Subscription Plan & Regional Quotas */}
            {currentStep === 6 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Step 6: Subscription Plan, Quotas & Regional Defaults
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assign a canonical P0-4 commercial tier independently of tenant onboarding status.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {plans
                    .filter((p) => p.status === 'published')
                    .map((plan) => {
                      const isSelected = formData.planId === plan.id;
                      const compatCount = modules.filter((m) =>
                        plan.includedModuleIds?.includes(m.id) &&
                        categories.some((cat) => isSchoolTypeCompatible(cat, m.supportedSchoolTypes))
                      ).length;

                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              planId: plan.id,
                              technicalConfig: {
                                ...p.technicalConfig,
                                maxCampuses: Math.max(1, plan.maxCampuses),
                              },
                            }));
                            clearErrorKeys(['planId']);
                          }}
                          className={`p-4 rounded-xl border text-left space-y-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/10 ring-1 ring-primary'
                              : 'border-border bg-background hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-foreground">{plan.name}</span>
                            <Badge variant={isSelected ? 'info' : 'neutral'} size="sm">
                              {plan.tier}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            {formatCurrency(
                              formData.billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly,
                              plan.currency
                            )}{' '}
                            / {formData.billingCycle}
                          </p>
                          <p className="text-[11px] font-mono text-foreground">
                            {compatCount} compatible modules • Up to {plan.maxCampuses} campus(es)
                          </p>
                        </button>
                      );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2 border-t border-border/50">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Billing Cycle</label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          billingCycle: e.target.value as 'monthly' | 'annual',
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="annual">Annual Billing</option>
                      <option value="monthly">Monthly Billing</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Timezone</label>
                    <input
                      type="text"
                      value={formData.technicalConfig.timezone}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          technicalConfig: { ...p.technicalConfig, timezone: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Trial Activation Mode</label>
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.startTrial)}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, startTrial: e.target.checked }))
                        }
                      />
                      <span>Stage 30-day evaluation trial (`trialing`)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Review & Simulated Submission */}
            {currentStep === 7 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Step 7: Review & Submit Simulated Registration
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inspect identity, combined school categories, initial campus, administrator, and separated subscription parameters before saving.
                  </p>
                </div>

                {errors.submit && (
                  <AlertBanner variant="error" title="Submission Error">
                    {errors.submit}
                  </AlertBanner>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1.5">
                    <h4 className="font-bold uppercase tracking-wider text-foreground">Organization & Categories</h4>
                    <p><span className="text-muted-foreground">Display Name:</span> <strong>{formData.name}</strong></p>
                    {formData.legalName && (
                      <p><span className="text-muted-foreground">Legal Name:</span> <strong>{formData.legalName}</strong></p>
                    )}
                    <p><span className="text-muted-foreground">Code / Slug:</span> <strong className="font-mono">{formData.code} / {formData.subdomain}</strong></p>
                    <p><span className="text-muted-foreground">Categories:</span> <strong>{categories.join(', ')}</strong></p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1.5">
                    <h4 className="font-bold uppercase tracking-wider text-foreground">Initial Campus</h4>
                    <p><span className="text-muted-foreground">Name:</span> <strong>{formData.initialCampus?.name}</strong></p>
                    <p><span className="text-muted-foreground">Code:</span> <strong className="font-mono">{formData.initialCampus?.code}</strong></p>
                    <p><span className="text-muted-foreground">Location:</span> {formData.initialCampus?.city}, {formData.initialCampus?.country}</p>
                    <p><span className="text-muted-foreground">Capacity:</span> {formData.initialCampus?.studentCapacity} students</p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1.5">
                    <h4 className="font-bold uppercase tracking-wider text-foreground">Primary Administrator</h4>
                    <p><span className="text-muted-foreground">Name:</span> <strong>{formData.administrator.name}</strong> ({formData.administrator.roleTitle})</p>
                    <p><span className="text-muted-foreground">Email:</span> <strong className="font-mono">{formData.administrator.email}</strong></p>
                    <p><span className="text-muted-foreground">Phone:</span> {formData.administrator.phone}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1.5">
                    <h4 className="font-bold uppercase tracking-wider text-foreground">Subscription & Entitlements</h4>
                    <p><span className="text-muted-foreground">Plan:</span> <strong>{selectedPlan.name}</strong> ({formData.billingCycle})</p>
                    <p><span className="text-muted-foreground">Initial Billing Status:</span> <strong>{formData.startTrial ? 'trialing' : 'active'}</strong></p>
                    <p><span className="text-muted-foreground">Compatible Modules:</span> <strong>{compatibleModulesCount} (from P0-4 registry)</strong></p>
                  </div>
                </div>

                <AlertBanner variant="warning" className="text-xs">
                  <strong>Simulation Disclosure:</strong> Submitting records this organization into client-side mock state only (`registration_pending` or `draft`). No live cluster provisioning or real welcome emails occur.
                </AlertBanner>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1 || isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted cursor-pointer"
                >
                  Save as Draft Organization
                </button>

                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    Next Step
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {isSubmitting ? 'Submitting...' : 'Submit Simulated Registration'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
