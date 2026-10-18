'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Badge } from '@/components/ui/Badge';
import {
  SchoolClassification,
  CreateOrganizationInput,
  InitialCampusInput,
} from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  Building2,
  User,
  CreditCard,
  Settings,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Eye,
  Layers,
  MapPin,
  Sparkles,
  Check,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Profile', subtitle: 'Identity & Code' },
  { id: 2, title: 'Contact & Admin', subtitle: 'Leadership Team' },
  { id: 3, title: 'Initial Campus', subtitle: 'Primary Facility' },
  { id: 4, title: 'Subscription', subtitle: 'Plan & Billing' },
  { id: 5, title: 'Entitlements', subtitle: 'Feature Access' },
  { id: 6, title: 'Technical', subtitle: 'Regional & Limits' },
  { id: 7, title: 'Review', subtitle: 'Confirm & Provision' },
];

export default function OrganizationOnboardingWizardPage() {
  const { plans, organizations, modules, createOrganization } = usePlatformStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateOrganizationInput>({
    name: '',
    code: '',
    classification: 'k12',
    subdomain: '',
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
      street: '',
      city: '',
      stateOrProvince: '',
      country: 'United States',
      postalCode: '',
      studentCapacity: 500,
    },
    planId: 'plan_growth',
    billingCycle: 'annual',
    technicalConfig: {
      subdomain: '',
      timezone: 'UTC',
      academicYearStartMonth: 9,
      currency: 'USD',
      locale: 'en-US',
      maxCampuses: 2,
    },
    notes: '',
  });

  // Handle Input Changes
  const updateGeneral = <K extends keyof CreateOrganizationInput>(
    field: K,
    value: CreateOrganizationInput[K]
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'subdomain') {
        next.technicalConfig = { ...next.technicalConfig, subdomain: String(value) };
      }
      // Auto-suggest campus name and code if untouched
      if (field === 'name' && (!prev.initialCampus?.name || prev.initialCampus.name === `${prev.name} Main Campus`)) {
        next.initialCampus = {
          ...next.initialCampus!,
          name: value ? `${value} Main Campus` : '',
          code: next.initialCampus?.code || (prev.code ? `${prev.code}-MAIN` : 'MAIN'),
        };
      }
      if (field === 'code' && (!prev.initialCampus?.code || prev.initialCampus.code === `${prev.code}-MAIN`)) {
        next.initialCampus = {
          ...next.initialCampus!,
          name: next.initialCampus?.name || (prev.name ? `${prev.name} Main Campus` : 'Main Campus'),
          code: value ? `${String(value).toUpperCase()}-MAIN` : 'MAIN',
        };
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateContact = (field: string, value: string) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        contact: { ...prev.contact, [field]: value },
      };
      if (field === 'city' && (!prev.initialCampus?.city || prev.initialCampus.city === prev.contact.city)) {
        next.initialCampus = {
          ...next.initialCampus!,
          city: value,
        };
      }
      if (field === 'country' && (!prev.initialCampus?.country || prev.initialCampus.country === prev.contact.country)) {
        next.initialCampus = {
          ...next.initialCampus!,
          country: value,
        };
      }
      if (field === 'address' && (!prev.initialCampus?.street || prev.initialCampus.street === prev.contact.address)) {
        next.initialCampus = {
          ...next.initialCampus!,
          street: value,
        };
      }
      return next;
    });
    if (errors[`contact.${field}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`contact.${field}`];
        return next;
      });
    }
  };

  const updateAdmin = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      administrator: { ...prev.administrator, [field]: value },
    }));
    if (errors[`admin.${field}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`admin.${field}`];
        return next;
      });
    }
  };

  const updateInitialCampus = (
    field: keyof InitialCampusInput,
    value: InitialCampusInput[keyof InitialCampusInput]
  ) => {
    setFormData((prev) => ({
      ...prev,
      initialCampus: {
        ...prev.initialCampus!,
        [field]: value,
      },
    }));
    if (errors[`campus.${field}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`campus.${field}`];
        return next;
      });
    }
  };

  const updateTechnical = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      technicalConfig: { ...prev.technicalConfig, [field]: value },
    }));
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        errs.name = 'School organization name must be at least 2 characters.';
      }
      const code = formData.code.trim().toUpperCase();
      if (!code || code.length < 2 || code.length > 12) {
        errs.code = 'Organization code must be 2-12 characters (e.g. OAKHILL).';
      } else if (organizations.some((o) => o.code.toUpperCase() === code)) {
        errs.code = `Code "${code}" is already taken by another organization.`;
      }

      const sub = formData.subdomain.trim().toLowerCase();
      if (!sub || !/^[a-z0-9-]+$/.test(sub)) {
        errs.subdomain = 'Subdomain must contain only lowercase letters, numbers, and hyphens.';
      } else if (organizations.some((o) => o.subdomain.toLowerCase() === sub)) {
        errs.subdomain = `Subdomain "${sub}" is already registered.`;
      }
    } else if (step === 2) {
      if (!formData.contact.email || !formData.contact.email.includes('@')) {
        errs['contact.email'] = 'A valid institutional contact email is required.';
      }
      if (!formData.contact.city.trim()) {
        errs['contact.city'] = 'City is required.';
      }
      if (!formData.contact.country.trim()) {
        errs['contact.country'] = 'Country is required.';
      }
      if (!formData.administrator.name.trim() || formData.administrator.name.trim().length < 2) {
        errs['admin.name'] = 'Administrator name is required.';
      }
      if (!formData.administrator.email || !formData.administrator.email.includes('@')) {
        errs['admin.email'] = 'A valid administrator email is required.';
      }
      if (!formData.administrator.phone.trim()) {
        errs['admin.phone'] = 'Administrator direct phone number is required.';
      }
    } else if (step === 3) {
      if (!formData.initialCampus?.name?.trim() || formData.initialCampus.name.trim().length < 2) {
        errs['campus.name'] = 'Main campus name must be at least 2 characters.';
      }
      if (!formData.initialCampus?.code?.trim() || formData.initialCampus.code.trim().length < 2) {
        errs['campus.code'] = 'Campus code is required (e.g. MAIN or OAK-MAIN).';
      }
      if (!formData.initialCampus?.city?.trim()) {
        errs['campus.city'] = 'Campus city location is required.';
      }
    } else if (step === 4) {
      if (!formData.planId || !plans.some((p) => p.id === formData.planId)) {
        errs.planId = 'Please select a valid subscription plan.';
      }
    } else if (step === 6) {
      if (!formData.technicalConfig?.maxCampuses || formData.technicalConfig.maxCampuses < 1) {
        errs['technical.maxCampuses'] = 'Maximum campuses must be at least 1.';
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

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = () => {
    if (isSubmitting) return;

    for (let s = 1; s <= 6; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = createOrganization(formData);
      setIsSubmitting(false);
      if (res.success && res.organization) {
        setCreatedOrgId(res.organization.id);
      } else if (res.error) {
        setErrors({ submit: res.error });
      }
    }, 400);
  };

  const selectedPlan = plans.find((p) => p.id === formData.planId) || plans[0];
  const includedModulesCount = modules.filter(
    (m) => selectedPlan && m.includedInPlans.includes(selectedPlan.tier)
  ).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Guided Organization Onboarding Wizard"
        description="Register a new school organization, establish its primary main campus, configure subscription tier and module entitlements, and initialize development tenant state."
        backUrl="/organizations"
      />

      {/* Success State */}
      {createdOrgId ? (
        <div className="bg-card text-card-foreground p-8 rounded-2xl border border-border shadow-md text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              Organization Successfully Provisioned
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Development record for <strong className="text-foreground">{formData.name}</strong> ({formData.code}) has been created in local mock storage with initial plan <strong className="text-foreground">{selectedPlan.name}</strong> and primary campus <strong className="text-foreground">{formData.initialCampus?.name || 'Main Campus'}</strong>.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-xl border border-border text-xs text-left max-w-lg mx-auto space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tenant Subdomain:</span>
              <span className="font-semibold text-foreground">{formData.subdomain}.schoolsaas.internal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primary Admin:</span>
              <span className="font-semibold text-foreground">{formData.administrator.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Main Campus:</span>
              <span className="font-semibold text-foreground">{formData.initialCampus?.name} ({formData.initialCampus?.code})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned Plan:</span>
              <span className="font-semibold text-foreground">{selectedPlan.name} ({includedModulesCount} modules)</span>
            </div>
          </div>

          <AlertBanner variant="info" className="text-left text-xs max-w-lg mx-auto">
            Future backend integration notice: Production database schemas, isolated tenant containers, DNS routing, and automated onboarding emails will be dispatched via the upcoming backend orchestration service.
          </AlertBanner>

          <div className="flex justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setCreatedOrgId(null);
                setCurrentStep(1);
                setFormData({
                  name: '',
                  code: '',
                  classification: 'k12',
                  subdomain: '',
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
                    street: '',
                    city: '',
                    stateOrProvince: '',
                    country: 'United States',
                    postalCode: '',
                    studentCapacity: 500,
                  },
                  planId: 'plan_growth',
                  billingCycle: 'annual',
                  technicalConfig: {
                    subdomain: '',
                    timezone: 'UTC',
                    academicYearStartMonth: 9,
                    currency: 'USD',
                    locale: 'en-US',
                    maxCampuses: 2,
                  },
                  notes: '',
                });
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted cursor-pointer"
            >
              Onboard Another School
            </button>
            <Link
              href={`/organizations/${createdOrgId}`}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              View Organization Workspace
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stepper Progress Bar */}
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
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      Step {step.id} {isPassed && '✓'}
                    </span>
                    <span className="text-xs font-bold truncate">{step.title}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{step.subtitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Step Body */}
          <div className="bg-card text-card-foreground p-6 sm:p-8 rounded-2xl border border-border shadow-xs space-y-6">
            {/* Step 1: Profile */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Step 1: School Organization Profile
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the legal or operating identity of the educational institution.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-foreground">
                      School Organization Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateGeneral('name', e.target.value)}
                      placeholder="e.g. St. Augustine College of Science"
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                    {errors.name && <p className="text-[11px] text-rose-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Organization Code (Ticker/Slug) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => updateGeneral('code', e.target.value.toUpperCase())}
                      placeholder="e.g. STAUGC"
                      maxLength={12}
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none font-mono uppercase"
                    />
                    <p className="text-[10px] text-muted-foreground">Unique identifier used in student IDs & receipts.</p>
                    {errors.code && <p className="text-[11px] text-rose-500">{errors.code}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Tenant Subdomain <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex rounded-lg border border-border overflow-hidden bg-muted/30">
                      <input
                        type="text"
                        value={formData.subdomain}
                        onChange={(e) => updateGeneral('subdomain', e.target.value.toLowerCase())}
                        placeholder="staugustine"
                        className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none"
                      />
                      <span className="px-3 py-2 text-xs text-muted-foreground bg-muted border-l border-border select-none">
                        .schoolsaas.internal
                      </span>
                    </div>
                    {errors.subdomain && <p className="text-[11px] text-rose-500">{errors.subdomain}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">School Classification</label>
                    <select
                      value={formData.classification}
                      onChange={(e) => updateGeneral('classification', e.target.value as SchoolClassification)}
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    >
                      <option value="k12">K-12 Comprehensive</option>
                      <option value="primary">Primary / Elementary</option>
                      <option value="secondary">Secondary / High School</option>
                      <option value="international">International School (IB/Cambridge)</option>
                      <option value="higher_education">Higher Education / College</option>
                      <option value="vocational">Vocational & Technical Training</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-foreground">
                      Administrative Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes || ''}
                      onChange={(e) => updateGeneral('notes', e.target.value)}
                      placeholder="Internal remarks regarding onboarding terms, campus affiliations, or special requests..."
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Admin */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Step 2: Leadership & Official Contact Details
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Designated executive leadership and official school coordinates.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Primary Executive Administrator
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Administrator Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.administrator.name}
                        onChange={(e) => updateAdmin('name', e.target.value)}
                        placeholder="Dr. Gregory House"
                        className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                      />
                      {errors['admin.name'] && <p className="text-[11px] text-rose-500">{errors['admin.name']}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Role Title</label>
                      <input
                        type="text"
                        value={formData.administrator.roleTitle}
                        onChange={(e) => updateAdmin('roleTitle', e.target.value)}
                        placeholder="Head of School / Executive Principal"
                        className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Direct Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.administrator.email}
                        onChange={(e) => updateAdmin('email', e.target.value)}
                        placeholder="g.house@staugustine.edu"
                        className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                      />
                      {errors['admin.email'] && <p className="text-[11px] text-rose-500">{errors['admin.email']}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Direct Phone <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.administrator.phone}
                        onChange={(e) => updateAdmin('phone', e.target.value)}
                        placeholder="+1 (555) 998-1234"
                        className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                      />
                      {errors['admin.phone'] && <p className="text-[11px] text-rose-500">{errors['admin.phone']}</p>}
                    </div>
                  </div>

                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-4 border-t border-border">
                    Institutional Location Coordinates
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Official Contact Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.contact.email}
                        onChange={(e) => updateContact('email', e.target.value)}
                        placeholder="admin@staugustine.edu"
                        className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                      />
                      {errors['contact.email'] && <p className="text-[11px] text-rose-500">{errors['contact.email']}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Official Phone Number</label>
                      <input
                        type="tel"
                        value={formData.contact.phone}
                        onChange={(e) => updateContact('phone', e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-foreground">Street Address</label>
                      <input
                        type="text"
                        value={formData.contact.address}
                        onChange={(e) => updateContact('address', e.target.value)}
                        placeholder="123 Academic Way"
                        className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.contact.city}
                        onChange={(e) => updateContact('city', e.target.value)}
                        placeholder="Chicago"
                        className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                      />
                      {errors['contact.city'] && <p className="text-[11px] text-rose-500">{errors['contact.city']}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Country <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.contact.country}
                        onChange={(e) => updateContact('country', e.target.value)}
                        placeholder="United States"
                        className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                      />
                      {errors['contact.country'] && <p className="text-[11px] text-rose-500">{errors['contact.country']}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Initial Campus */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Step 3: Initial Main Campus Facility
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Establish the primary operational branch or campus where faculty and student records will anchor.
                  </p>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg border border-border text-xs text-muted-foreground flex gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    Every school organization requires at least one designated <strong>Main Campus</strong>. Additional branches can be registered anytime in the organization workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-foreground">
                      Main Campus Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.initialCampus?.name || ''}
                      onChange={(e) => updateInitialCampus('name', e.target.value)}
                      placeholder="e.g. St. Augustine Main Campus"
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                    {errors['campus.name'] && <p className="text-[11px] text-rose-500">{errors['campus.name']}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Campus Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.initialCampus?.code || ''}
                      onChange={(e) => updateInitialCampus('code', e.target.value.toUpperCase())}
                      placeholder="e.g. STAUGC-MAIN"
                      maxLength={16}
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none font-mono uppercase"
                    />
                    <p className="text-[10px] text-muted-foreground">Unique campus code within this organization.</p>
                    {errors['campus.code'] && <p className="text-[11px] text-rose-500">{errors['campus.code']}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Initial Capacity</label>
                    <input
                      type="number"
                      min={50}
                      max={10000}
                      step={50}
                      value={formData.initialCampus?.studentCapacity || 500}
                      onChange={(e) => updateInitialCampus('studentCapacity', parseInt(e.target.value, 10) || 500)}
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                    <p className="text-[10px] text-muted-foreground">Initial student seating allocation.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      City / Locality <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.initialCampus?.city || ''}
                      onChange={(e) => updateInitialCampus('city', e.target.value)}
                      placeholder="e.g. Chicago"
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                    {errors['campus.city'] && <p className="text-[11px] text-rose-500">{errors['campus.city']}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">State / Province</label>
                    <input
                      type="text"
                      value={formData.initialCampus?.stateOrProvince || ''}
                      onChange={(e) => updateInitialCampus('stateOrProvince', e.target.value)}
                      placeholder="e.g. Illinois"
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Subscription */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Step 4: Subscription Tier & Billing Cycle
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose the SaaS plan and billing cadence for this school organization.
                    </p>
                  </div>

                  {/* Billing cycle toggle */}
                  <div className="flex items-center gap-2 p-1 bg-muted rounded-lg text-xs font-medium border border-border">
                    <button
                      type="button"
                      onClick={() => updateGeneral('billingCycle', 'monthly')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        formData.billingCycle === 'monthly'
                          ? 'bg-card text-foreground shadow-2xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => updateGeneral('billingCycle', 'annual')}
                      className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                        formData.billingCycle === 'annual'
                          ? 'bg-card text-foreground shadow-2xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Annual
                      <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-1 rounded">Save 15%</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => {
                    const isSelected = formData.planId === plan.id;
                    const price = formData.billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
                    const planModulesCount = modules.filter((m) => m.includedInPlans.includes(plan.tier)).length;

                    return (
                      <div
                        key={plan.id}
                        onClick={() => updateGeneral('planId', plan.id)}
                        className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-xs'
                            : 'border-border bg-card hover:border-muted-foreground/40'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-foreground">{plan.name}</span>
                            {plan.isPopular && (
                              <span className="text-[10px] bg-primary text-primary-foreground font-extrabold px-1.5 py-0.2 rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                          <div className="pt-2">
                            <span className="text-2xl font-black text-foreground">{formatCurrency(price)}</span>
                            <span className="text-xs text-muted-foreground">
                              /{formData.billingCycle === 'annual' ? 'year' : 'month'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border/60 mt-4 space-y-1.5 text-xs text-muted-foreground">
                          <p>• Max Students: <strong>{plan.maxStudents.toLocaleString()}</strong></p>
                          <p>• Max Staff: <strong>{plan.maxStaff.toLocaleString()}</strong></p>
                          <p>• Max Campuses: <strong>{plan.maxCampuses}</strong></p>
                          <p>• Cloud Storage: <strong>{plan.storageGb} GB</strong></p>
                          <p>• Included Modules: <strong>{planModulesCount} Modules</strong></p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Module Entitlements Preview */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Step 5: Included Module Capabilities Preview
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Modules unlocked by the <strong className="text-foreground">{selectedPlan.name}</strong> subscription plan from the canonical registry.
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Entitlement Coverage: {includedModulesCount} of {modules.length} Canonical Modules Unlocked
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Derived from Phase E-09.6 master tenant registry. All core functional domains are ready.
                    </span>
                  </div>
                  <Badge variant="success" size="sm">
                    {modules.length > 0 ? Math.round((includedModulesCount / modules.length) * 100) : 100}% Coverage
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Academic & Curriculum Governance
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Classes, terms, grading schemes, lesson timetables, and report card generation.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Admissions & Student Information
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Application pipelines, enrollment verification, student records, and health profiles.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Attendance & Classroom Operations
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Daily attendance logging, biometric clocking, absence notifications, and discipline logs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Financial Ledger & Fee Collections
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Tuition schedules, automated invoice generation, payment receipts, and balance summaries.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg border border-border text-xs text-muted-foreground">
                  💡 <strong>Administrative Note:</strong> Specific module overrides (force-enabling or force-disabling individual capabilities) can be fine-tuned after creation in the organization details workspace.
                </div>
              </div>
            )}

            {/* Step 6: Technical */}
            {currentStep === 6 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Step 6: Initial School Configuration
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Regional localization, academic calendar cycle, and branch limits.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Timezone</label>
                    <select
                      value={formData.technicalConfig?.timezone}
                      onChange={(e) => updateTechnical('timezone', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    >
                      <option value="UTC">UTC (Universal Coordinated Time)</option>
                      <option value="America/New_York">America/New York (Eastern)</option>
                      <option value="America/Chicago">America/Chicago (Central)</option>
                      <option value="America/Denver">America/Denver (Mountain)</option>
                      <option value="America/Los_Angeles">America/Los Angeles (Pacific)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="Europe/Paris">Europe/Paris (CET)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Academic Year Start Month</label>
                    <select
                      value={formData.technicalConfig?.academicYearStartMonth}
                      onChange={(e) => updateTechnical('academicYearStartMonth', parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    >
                      <option value={1}>January (Term 1 Cycle)</option>
                      <option value={8}>August (Fall US Cycle)</option>
                      <option value={9}>September (Autumn European Cycle)</option>
                      <option value={2}>February (Southern Hemisphere)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Base Operational Currency</label>
                    <select
                      value={formData.technicalConfig?.currency}
                      onChange={(e) => updateTechnical('currency', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    >
                      <option value="USD">USD ($) — US Dollar</option>
                      <option value="GBP">GBP (£) — British Pound</option>
                      <option value="EUR">EUR (€) — Euro</option>
                      <option value="CAD">CAD ($) — Canadian Dollar</option>
                      <option value="AUD">AUD ($) — Australian Dollar</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Max Campuses / Branches</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.technicalConfig?.maxCampuses}
                      onChange={(e) => updateTechnical('maxCampuses', parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Review & Confirmation */}
            {currentStep === 7 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Step 7: Review & Provision Development Record
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please inspect all parameters before creating the development tenant record.
                  </p>
                </div>

                {errors.submit && (
                  <AlertBanner variant="error" title="Submission Error">
                    {errors.submit}
                  </AlertBanner>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Org Profile Summary */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                      Organization Identity
                    </h4>
                    <p><span className="text-muted-foreground">Name:</span> <strong>{formData.name}</strong></p>
                    <p><span className="text-muted-foreground">Code:</span> <strong className="font-mono">{formData.code}</strong></p>
                    <p><span className="text-muted-foreground">Subdomain:</span> <strong className="font-mono">{formData.subdomain}.schoolsaas.internal</strong></p>
                    <p><span className="text-muted-foreground">Classification:</span> <strong className="capitalize">{formData.classification.replace('_', ' ')}</strong></p>
                  </div>

                  {/* Main Campus Summary */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                      Initial Main Campus
                    </h4>
                    <p><span className="text-muted-foreground">Campus Name:</span> <strong>{formData.initialCampus?.name}</strong></p>
                    <p><span className="text-muted-foreground">Campus Code:</span> <strong className="font-mono">{formData.initialCampus?.code}</strong></p>
                    <p><span className="text-muted-foreground">Location:</span> {formData.initialCampus?.city}, {formData.initialCampus?.country || formData.contact.country}</p>
                    <p><span className="text-muted-foreground">Capacity:</span> {formData.initialCampus?.studentCapacity || 500} students</p>
                  </div>

                  {/* Admin Summary */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                      Primary Administrator
                    </h4>
                    <p><span className="text-muted-foreground">Name:</span> <strong>{formData.administrator.name}</strong></p>
                    <p><span className="text-muted-foreground">Role:</span> <strong>{formData.administrator.roleTitle}</strong></p>
                    <p><span className="text-muted-foreground">Email:</span> <strong className="font-mono">{formData.administrator.email}</strong></p>
                    <p><span className="text-muted-foreground">Phone:</span> <strong>{formData.administrator.phone}</strong></p>
                  </div>

                  {/* Subscription Summary */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                      Assigned Subscription
                    </h4>
                    <p><span className="text-muted-foreground">Plan:</span> <strong>{selectedPlan.name}</strong></p>
                    <p><span className="text-muted-foreground">Billing Cycle:</span> <strong className="capitalize">{formData.billingCycle}</strong></p>
                    <p><span className="text-muted-foreground">Initial Rate:</span> <strong>{formatCurrency(formData.billingCycle === 'annual' ? selectedPlan.priceAnnual : selectedPlan.priceMonthly)}</strong></p>
                    <p><span className="text-muted-foreground">Included Modules:</span> <strong>{includedModulesCount} Modules</strong></p>
                  </div>
                </div>

                <AlertBanner variant="warning" className="text-xs">
                  <strong>Verification Note:</strong> This form will append a simulated school tenant record and main campus to your browser-persisted mock store. No payment cards will be charged and no live tenant cluster will be modified until backend provisioning endpoints are integrated.
                </AlertBanner>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  Next Step
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isSubmitting ? 'Provisioning...' : 'Provision Organization (Demo)'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
