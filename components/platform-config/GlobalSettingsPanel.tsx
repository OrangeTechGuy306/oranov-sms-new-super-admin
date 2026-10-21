'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { ExtendedPlatformSettings } from '@/lib/types/platform-config';
import {
  SUPPORTED_LOCALES,
  SUPPORTED_TIMEZONES,
  SUPPORTED_CURRENCIES,
  validatePlatformSettings,
} from '@/lib/platform-config/validator';
import { ConfigChangePreviewModal, ConfigDiffItem } from './ConfigChangePreviewModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Badge } from '@/components/ui/Badge';
import {
  Building,
  Globe,
  UserCheck,
  GraduationCap,
  Shield,
  Bell,
  Power,
  Save,
  RotateCcw,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export function GlobalSettingsPanel() {
  const { extendedSettings, updateExtendedSettings, resetToDefaults, createChangeProposal } = usePlatformStore();

  const [formState, setFormState] = useState<ExtendedPlatformSettings>(extendedSettings);
  const [activeSection, setActiveSection] = useState<'branding' | 'regional' | 'onboarding' | 'academic' | 'security' | 'notifications' | 'maintenance'>('branding');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [diffItems, setDiffItems] = useState<ConfigDiffItem[]>([]);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalReason, setProposalReason] = useState('');
  const [proposalTitle, setProposalTitle] = useState('');

  // Keep state in sync if store resets
  const [lastStoreSettings, setLastStoreSettings] = useState(extendedSettings);
  if (extendedSettings !== lastStoreSettings) {
    setLastStoreSettings(extendedSettings);
    setFormState(extendedSettings);
  }

  const handleOpenPreview = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePlatformSettings(formState);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors([]);

    // Compute diff items
    const diffs: ConfigDiffItem[] = [];

    if (formState.branding.platformName !== extendedSettings.branding.platformName) {
      diffs.push({ label: 'Platform Name', current: extendedSettings.branding.platformName, proposed: formState.branding.platformName });
    }
    if (formState.branding.primaryColor !== extendedSettings.branding.primaryColor) {
      diffs.push({ label: 'Primary Brand Color', current: extendedSettings.branding.primaryColor, proposed: formState.branding.primaryColor });
    }
    if (formState.regional.defaultLocale !== extendedSettings.regional.defaultLocale) {
      diffs.push({ label: 'Default Locale', current: extendedSettings.regional.defaultLocale, proposed: formState.regional.defaultLocale });
    }
    if (formState.regional.defaultCurrency !== extendedSettings.regional.defaultCurrency) {
      diffs.push({ label: 'Default Currency', current: extendedSettings.regional.defaultCurrency, proposed: formState.regional.defaultCurrency });
    }
    if (formState.regional.defaultTimezone !== extendedSettings.regional.defaultTimezone) {
      diffs.push({ label: 'Default Timezone', current: extendedSettings.regional.defaultTimezone, proposed: formState.regional.defaultTimezone });
    }
    if (formState.regional.dateFormat !== extendedSettings.regional.dateFormat) {
      diffs.push({ label: 'Date Format', current: extendedSettings.regional.dateFormat, proposed: formState.regional.dateFormat });
    }
    if (formState.securityPolicy.sessionTimeoutMinutes !== extendedSettings.securityPolicy.sessionTimeoutMinutes) {
      diffs.push({ label: 'Session Idle Timeout', current: `${extendedSettings.securityPolicy.sessionTimeoutMinutes} min`, proposed: `${formState.securityPolicy.sessionTimeoutMinutes} min` });
    }
    if (formState.securityPolicy.requireMfaForSuperAdmins !== extendedSettings.securityPolicy.requireMfaForSuperAdmins) {
      diffs.push({ label: 'Super-Admin Mandatory MFA', current: extendedSettings.securityPolicy.requireMfaForSuperAdmins, proposed: formState.securityPolicy.requireMfaForSuperAdmins });
    }
    if (formState.academicDefaults.defaultTermSystem !== extendedSettings.academicDefaults.defaultTermSystem) {
      diffs.push({ label: 'Default Academic Term System', current: extendedSettings.academicDefaults.defaultTermSystem, proposed: formState.academicDefaults.defaultTermSystem });
    }
    if (formState.onboardingPolicy.trialDurationDays !== extendedSettings.onboardingPolicy.trialDurationDays) {
      diffs.push({ label: 'Trial Duration (Days)', current: extendedSettings.onboardingPolicy.trialDurationDays, proposed: formState.onboardingPolicy.trialDurationDays });
    }
    if (formState.maintenance.isMaintenanceMode !== extendedSettings.maintenance.isMaintenanceMode) {
      diffs.push({ label: 'Emergency Maintenance Mode', current: extendedSettings.maintenance.isMaintenanceMode, proposed: formState.maintenance.isMaintenanceMode });
    }

    if (diffs.length === 0) {
      diffs.push({ label: 'Platform Policy Parameters', current: 'No modified fields detected', proposed: 'Current values preserved' });
    }

    setDiffItems(diffs);
    setShowPreviewModal(true);
  };

  const handleConfirmSave = () => {
    updateExtendedSettings(formState, 'Applied platform settings update via Super-Admin console.');
    setShowPreviewModal(false);
  };

  const handleCreateProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitle.trim() || !proposalReason.trim()) return;

    createChangeProposal({
      title: proposalTitle.trim(),
      reason: proposalReason.trim(),
      scope: 'platform_settings',
      targetEntity: 'PlatformSettings',
      targetId: 'global_settings',
      diff: diffItems.map((d) => ({
        field: d.label,
        previousValue: String(d.current),
        proposedValue: String(d.proposed),
      })),
    });

    setShowProposalModal(false);
    setProposalTitle('');
    setProposalReason('');
  };

  const toggleModuleInOnboarding = (modCode: string) => {
    const current = formState.onboardingPolicy.defaultEnabledModules || [];
    const exists = current.includes(modCode);
    const updated = exists ? current.filter((m) => m !== modCode) : [...current, modCode];
    setFormState({
      ...formState,
      onboardingPolicy: { ...formState.onboardingPolicy, defaultEnabledModules: updated },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span>Global Platform Configuration & Policies</span>
            <Badge variant="info" className="text-[10px]">v1.0.0 Local Mock</Badge>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage defaults for regional localization, institutional onboarding, academic structures, session security, and emergency maintenance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleOpenPreview}
            className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Review & Save</span>
          </button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <AlertBanner variant="error" title="Configuration Validation Errors">
          <ul className="list-disc pl-4 space-y-1 text-xs mt-1">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </AlertBanner>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-muted/40 border border-border text-xs">
        <button
          type="button"
          onClick={() => setActiveSection('branding')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
            activeSection === 'branding' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Identity & Branding</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('regional')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
            activeSection === 'regional' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Regional & Localization</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('onboarding')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
            activeSection === 'onboarding' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>School Onboarding Defaults</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('academic')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
            activeSection === 'academic' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Academic Defaults</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('security')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
            activeSection === 'security' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security & Sessions</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('notifications')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
            activeSection === 'notifications' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notification Policies</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('maintenance')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
            activeSection === 'maintenance' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>Maintenance Mode</span>
        </button>
      </div>

      {/* SECTION 1: IDENTITY & BRANDING */}
      {activeSection === 'branding' && (
        <div className="p-6 rounded-xl border border-border bg-card space-y-5 text-xs">
          <div className="border-b border-border/50 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Platform Identity & Visual Design Tokens</h3>
              <p className="text-muted-foreground text-xs">Platform display name, theme accent color tokens, and public technical contact coordinates.</p>
            </div>
            {/* Live brand preview swatch */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Preview Swatch:</span>
              <div
                className="w-6 h-6 rounded-md shadow-xs border border-border"
                style={{ backgroundColor: formState.branding.primaryColor }}
                title={`Primary Color: ${formState.branding.primaryColor}`}
              />
              <div
                className="w-6 h-6 rounded-md shadow-xs border border-border"
                style={{ backgroundColor: formState.branding.secondaryColor }}
                title={`Secondary Color: ${formState.branding.secondaryColor}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Platform Display Name</label>
              <input
                type="text"
                value={formState.branding.platformName}
                onChange={(e) => setFormState({ ...formState, branding: { ...formState.branding, platformName: e.target.value } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Platform Tagline / Slogan</label>
              <input
                type="text"
                value={formState.branding.tagline}
                onChange={(e) => setFormState({ ...formState, branding: { ...formState.branding, tagline: e.target.value } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Primary Accent Color (Hex)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formState.branding.primaryColor}
                  onChange={(e) => setFormState({ ...formState, branding: { ...formState.branding, primaryColor: e.target.value } })}
                  className="w-8 h-8 rounded border border-border p-0.5 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={formState.branding.primaryColor}
                  onChange={(e) => setFormState({ ...formState, branding: { ...formState.branding, primaryColor: e.target.value } })}
                  className="flex-1 px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs font-mono uppercase"
                  placeholder="#2563EB"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Secondary Brand Color (Hex)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formState.branding.secondaryColor}
                  onChange={(e) => setFormState({ ...formState, branding: { ...formState.branding, secondaryColor: e.target.value } })}
                  className="w-8 h-8 rounded border border-border p-0.5 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={formState.branding.secondaryColor}
                  onChange={(e) => setFormState({ ...formState, branding: { ...formState.branding, secondaryColor: e.target.value } })}
                  className="flex-1 px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs font-mono uppercase"
                  placeholder="#4F46E5"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Technical Support Email</label>
              <input
                type="email"
                value={formState.branding.supportEmail}
                onChange={(e) => setFormState({ ...formState, branding: { ...formState.branding, supportEmail: e.target.value } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Support Hotline / Telephone</label>
              <input
                type="text"
                value={formState.branding.supportPhone}
                onChange={(e) => setFormState({ ...formState, branding: { ...formState.branding, supportPhone: e.target.value } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-foreground">Platform Documentation URL</label>
              <input
                type="url"
                value={formState.branding.documentationUrl}
                onChange={(e) => setFormState({ ...formState, branding: { ...formState.branding, documentationUrl: e.target.value } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: REGIONAL & LOCALIZATION */}
      {activeSection === 'regional' && (
        <div className="p-6 rounded-xl border border-border bg-card space-y-5 text-xs">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground">Regional Formatting & Internationalization Policies</h3>
            <p className="text-muted-foreground text-xs">Global defaults for dates, currencies, timezones, and number representation. Note: Display formatting does not imply financial conversion.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Platform Locale</label>
              <select
                value={formState.regional.defaultLocale}
                onChange={(e) => setFormState({ ...formState, regional: { ...formState.regional, defaultLocale: e.target.value } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                {SUPPORTED_LOCALES.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Platform Timezone</label>
              <select
                value={formState.regional.defaultTimezone}
                onChange={(e) => setFormState({ ...formState, regional: { ...formState.regional, defaultTimezone: e.target.value } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                {SUPPORTED_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Primary Ledger Currency</label>
              <select
                value={formState.regional.defaultCurrency}
                onChange={(e) => setFormState({ ...formState, regional: { ...formState.regional, defaultCurrency: e.target.value } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                {SUPPORTED_CURRENCIES.map((cur) => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Date Display Format</label>
              <select
                value={formState.regional.dateFormat}
                onChange={(e) => setFormState({ ...formState, regional: { ...formState.regional, dateFormat: e.target.value } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                <option value="MMM D, YYYY">Oct 19, 2026 (MMM D, YYYY)</option>
                <option value="YYYY-MM-DD">2026-10-19 (ISO YYYY-MM-DD)</option>
                <option value="DD/MM/YYYY">19/10/2026 (British DD/MM/YYYY)</option>
                <option value="MM/DD/YYYY">10/19/2026 (US MM/DD/YYYY)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Time Display Format</label>
              <select
                value={formState.regional.timeFormat}
                onChange={(e) => setFormState({ ...formState, regional: { ...formState.regional, timeFormat: e.target.value as '12h' | '24h' } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                <option value="12h">12-Hour (02:30 PM)</option>
                <option value="24h">24-Hour Military (14:30)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Week Calendar Starts On</label>
              <select
                value={formState.regional.weekStartsOn}
                onChange={(e) => setFormState({ ...formState, regional: { ...formState.regional, weekStartsOn: Number(e.target.value) as 0 | 1 } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                <option value={1}>Monday (ISO-8601 Standard)</option>
                <option value={0}>Sunday (Traditional)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: ONBOARDING & FUTURE SCHOOL DEFAULTS */}
      {activeSection === 'onboarding' && (
        <div className="p-6 rounded-xl border border-border bg-card space-y-5 text-xs">
          <div className="border-b border-border/50 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground">New School Provisioning & Onboarding Defaults</h3>
              <p className="text-muted-foreground text-xs">
                Baseline quotas and default capabilities automatically assigned to future institutions during registration.
              </p>
            </div>
            <Badge variant="warning" className="text-[10px]">Applies to Future Tenants Only</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Free Trial Duration (Days)</label>
              <input
                type="number"
                min={7}
                max={180}
                value={formState.onboardingPolicy.trialDurationDays}
                onChange={(e) => setFormState({ ...formState, onboardingPolicy: { ...formState.onboardingPolicy, trialDurationDays: Number(e.target.value) } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Student Capacity Quota</label>
              <input
                type="number"
                value={formState.onboardingPolicy.defaultStudentQuota}
                onChange={(e) => setFormState({ ...formState, onboardingPolicy: { ...formState.onboardingPolicy, defaultStudentQuota: Number(e.target.value) } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Staff / Faculty Quota</label>
              <input
                type="number"
                value={formState.onboardingPolicy.defaultStaffQuota}
                onChange={(e) => setFormState({ ...formState, onboardingPolicy: { ...formState.onboardingPolicy, defaultStaffQuota: Number(e.target.value) } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 space-y-3">
            <label className="font-semibold text-foreground block">
              Default Pre-Enabled Core Modules for New Schools
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { code: 'mod_students', label: 'Student Information' },
                { code: 'mod_academics', label: 'Academics & Classes' },
                { code: 'mod_attendance', label: 'Daily Attendance' },
                { code: 'mod_report_cards', label: 'Report Cards' },
                { code: 'mod_cbt', label: 'Examinations & CBT' },
                { code: 'mod_fees', label: 'Fee Management' },
                { code: 'mod_transport', label: 'Transport Fleet' },
                { code: 'mod_library', label: 'Library Catalog' },
              ].map((item) => {
                const checked = formState.onboardingPolicy.defaultEnabledModules?.includes(item.code);
                return (
                  <label
                    key={item.code}
                    className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                      checked ? 'bg-primary/10 border-primary text-foreground font-semibold' : 'bg-muted/20 border-border text-muted-foreground'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleModuleInOnboarding(item.code)}
                      className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                    />
                    <span className="text-xs">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: ACADEMIC ARCHITECTURE DEFAULTS */}
      {activeSection === 'academic' && (
        <div className="p-6 rounded-xl border border-border bg-card space-y-5 text-xs">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground">Academic Governance Architecture Defaults</h3>
            <p className="text-muted-foreground text-xs">Standardized academic session structure, default grading scale, and multi-campus cross-enrollment settings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Academic Term Division</label>
              <select
                value={formState.academicDefaults.defaultTermSystem}
                onChange={(e) => setFormState({ ...formState, academicDefaults: { ...formState.academicDefaults, defaultTermSystem: e.target.value as any } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                <option value="termly">Termly (3 Terms / Year - Commonwealth Standard)</option>
                <option value="semester">Semester (2 Semesters / Year - North American Standard)</option>
                <option value="quarterly">Quarterly (4 Quarters / Year)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Grading Scale Template</label>
              <select
                value={formState.academicDefaults.defaultGradingScale}
                onChange={(e) => setFormState({ ...formState, academicDefaults: { ...formState.academicDefaults, defaultGradingScale: e.target.value as any } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                <option value="standard_letter">Standard Letter (A, B, C, D, F)</option>
                <option value="percentage">Percentage (0 - 100%)</option>
                <option value="gpa_4">GPA 4.0 Point Scale</option>
                <option value="waec_standard">WAEC / WASSCE Grade Matrix (A1 - F9)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Attendance Tracking Mode</label>
              <select
                value={formState.academicDefaults.defaultAttendanceMode}
                onChange={(e) => setFormState({ ...formState, academicDefaults: { ...formState.academicDefaults, defaultAttendanceMode: e.target.value as any } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                <option value="daily">Daily Morning Roll Call</option>
                <option value="subject_wise">Per-Subject Timetable Attendance</option>
                <option value="biometric">Biometric Turnstile Ingestion</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formState.academicDefaults.allowCrossCampusEnrollment}
                onChange={(e) => setFormState({ ...formState, academicDefaults: { ...formState.academicDefaults, allowCrossCampusEnrollment: e.target.checked } })}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="font-semibold text-foreground">Allow Cross-Campus Student Enrollment in Multi-Branch Tenants</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formState.academicDefaults.autoArchiveCompletedSessions}
                onChange={(e) => setFormState({ ...formState, academicDefaults: { ...formState.academicDefaults, autoArchiveCompletedSessions: e.target.checked } })}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="font-semibold text-foreground">Auto-Archive Completed Academic Years after 90 Days</span>
            </label>
          </div>
        </div>
      )}

      {/* SECTION 5: SECURITY & SESSION POLICIES */}
      {activeSection === 'security' && (
        <div className="p-6 rounded-xl border border-border bg-card space-y-5 text-xs">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground">Platform Security Standards & Access Governance</h3>
            <p className="text-muted-foreground text-xs">Idle session timeout duration, multi-factor authentication mandates, and brute-force lockout thresholds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Idle Session Timeout (Minutes)</label>
              <input
                type="number"
                min={5}
                max={1440}
                value={formState.securityPolicy.sessionTimeoutMinutes}
                onChange={(e) => setFormState({ ...formState, securityPolicy: { ...formState.securityPolicy, sessionTimeoutMinutes: Number(e.target.value) } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              />
              <span className="text-[10px] text-muted-foreground">Sessions terminate automatically after inactivity.</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Minimum Password Length</label>
              <input
                type="number"
                min={8}
                max={64}
                value={formState.securityPolicy.passwordMinLength}
                onChange={(e) => setFormState({ ...formState, securityPolicy: { ...formState.securityPolicy, passwordMinLength: Number(e.target.value) } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Max Failed Login Attempts</label>
              <input
                type="number"
                min={3}
                max={15}
                value={formState.securityPolicy.maxFailedLoginAttempts}
                onChange={(e) => setFormState({ ...formState, securityPolicy: { ...formState.securityPolicy, maxFailedLoginAttempts: Number(e.target.value) } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formState.securityPolicy.requireMfaForSuperAdmins}
                onChange={(e) => setFormState({ ...formState, securityPolicy: { ...formState.securityPolicy, requireMfaForSuperAdmins: e.target.checked } })}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="font-semibold text-foreground">Mandatory Hardware WebAuthn / TOTP MFA for Super-Admins</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formState.securityPolicy.requireMfaForTenantAdmins}
                onChange={(e) => setFormState({ ...formState, securityPolicy: { ...formState.securityPolicy, requireMfaForTenantAdmins: e.target.checked } })}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="font-semibold text-foreground">Enforce Multi-Factor Authentication for School Principals & Head of Admin</span>
            </label>
          </div>
        </div>
      )}

      {/* SECTION 6: NOTIFICATIONS */}
      {activeSection === 'notifications' && (
        <div className="p-6 rounded-xl border border-border bg-card space-y-5 text-xs">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground">Global Platform Notification Channels & Dispatch</h3>
            <p className="text-muted-foreground text-xs">Default outbound dispatch settings for platform announcements, security alerts, and tenant invoices.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Sender Name</label>
              <input
                type="text"
                value={formState.notificationDefaults.defaultSenderName}
                onChange={(e) => setFormState({ ...formState, notificationDefaults: { ...formState.notificationDefaults, defaultSenderName: e.target.value } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Outbound Sender Email</label>
              <input
                type="email"
                value={formState.notificationDefaults.defaultSenderEmail}
                onChange={(e) => setFormState({ ...formState, notificationDefaults: { ...formState.notificationDefaults, defaultSenderEmail: e.target.value } })}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="p-3 rounded-lg border border-border bg-muted/20 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.notificationDefaults.enableEmailNotifications}
                onChange={(e) => setFormState({ ...formState, notificationDefaults: { ...formState.notificationDefaults, enableEmailNotifications: e.target.checked } })}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="font-semibold text-foreground">Enable Email Gateways</span>
            </label>

            <label className="p-3 rounded-lg border border-border bg-muted/20 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.notificationDefaults.enableSmsNotifications}
                onChange={(e) => setFormState({ ...formState, notificationDefaults: { ...formState.notificationDefaults, enableSmsNotifications: e.target.checked } })}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="font-semibold text-foreground">Enable Cellular SMS Dispatch</span>
            </label>

            <label className="p-3 rounded-lg border border-border bg-muted/20 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.notificationDefaults.enablePushNotifications}
                onChange={(e) => setFormState({ ...formState, notificationDefaults: { ...formState.notificationDefaults, enablePushNotifications: e.target.checked } })}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="font-semibold text-foreground">Enable Mobile Push WebSockets</span>
            </label>
          </div>
        </div>
      )}

      {/* SECTION 7: EMERGENCY MAINTENANCE MODE */}
      {activeSection === 'maintenance' && (
        <div className="p-6 rounded-xl border border-border bg-card space-y-5 text-xs">
          <div className="border-b border-border/50 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Power className="w-4 h-4 text-rose-500" />
                <span>Emergency Platform Maintenance Control</span>
              </h3>
              <p className="text-muted-foreground text-xs">Temporarily divert tenant traffic and display operational banner during infrastructure upgrades.</p>
            </div>
            <Badge variant={formState.maintenance.isMaintenanceMode ? 'error' : 'neutral'}>
              {formState.maintenance.isMaintenanceMode ? 'Maintenance Mode ACTIVE' : 'Operational Normal'}
            </Badge>
          </div>

          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-foreground">Platform Access Lock</h4>
                <p className="text-muted-foreground text-[11px]">When activated, school users are blocked with an advisory screen. Only bypass IPs can authenticate.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormState({ ...formState, maintenance: { ...formState.maintenance, isMaintenanceMode: !formState.maintenance.isMaintenanceMode } })}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${
                  formState.maintenance.isMaintenanceMode
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-muted border border-border text-foreground hover:bg-muted/80'
                }`}
              >
                {formState.maintenance.isMaintenanceMode ? 'Deactivate Maintenance' : 'Activate Maintenance Mode'}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Public Maintenance Banner Message</label>
            <textarea
              rows={2}
              value={formState.maintenance.bannerMessage}
              onChange={(e) => setFormState({ ...formState, maintenance: { ...formState.maintenance, bannerMessage: e.target.value } })}
              className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Bypass IP Whitelist (Comma-Separated)</label>
            <input
              type="text"
              value={formState.maintenance.bypassIps.join(', ')}
              onChange={(e) => {
                const ips = e.target.value.split(',').map((ip) => ip.trim()).filter(Boolean);
                setFormState({ ...formState, maintenance: { ...formState.maintenance, bypassIps: ips } });
              }}
              className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* Confirmation & Preview Dialogs */}
      <ConfigChangePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={handleConfirmSave}
        title="Review Global Platform Settings Update"
        scope="Global Settings"
        changes={diffItems}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          resetToDefaults();
          setShowResetConfirm(false);
        }}
        title="Reset Configuration to Factory Defaults"
        description="Are you sure you want to reset all platform branding, regional formats, and operational policies to initial factory defaults? Any unsaved local edits will be discarded."
        confirmLabel="Reset to Defaults"
        variant="danger"
      />
    </div>
  );
}
