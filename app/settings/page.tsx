'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertBanner } from '@/components/ui/AlertBanner';
import {
  Building,
  Globe,
  UserCheck,
  AlertTriangle,
  Save,
  Power,
  RotateCcw,
} from 'lucide-react';

export default function PlatformSettingsPage() {
  const { settings, updateSettings, resetToDefaults } = usePlatformStore();

  const [activeTab, setActiveTab] = useState('branding');

  // Form states
  const [prevSettings, setPrevSettings] = useState(settings);
  const [branding, setBranding] = useState(settings.branding);
  const [regional, setRegional] = useState(settings.regional);
  const [onboardingPolicy, setOnboardingPolicy] = useState(settings.onboardingPolicy);
  const [maintenance, setMaintenance] = useState(settings.maintenance);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state whenever settings change (e.g. on resetToDefaults)
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setBranding(settings.branding);
    setRegional(settings.regional);
    setOnboardingPolicy(settings.onboardingPolicy);
    setMaintenance(settings.maintenance);
  }

  // Confirmation dialog state for maintenance mode toggle
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);
  const [pendingMaintenanceState, setPendingMaintenanceState] = useState(false);

  // Confirmation dialog for Reset Defaults
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      branding,
      regional,
      onboardingPolicy,
      maintenance,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleToggleMaintenanceClick = () => {
    setPendingMaintenanceState(!maintenance.isMaintenanceMode);
    setShowMaintenanceConfirm(true);
  };

  const handleConfirmMaintenance = () => {
    const updated = {
      ...maintenance,
      isMaintenanceMode: pendingMaintenanceState,
    };
    setMaintenance(updated);
    updateSettings({ maintenance: updated });
    setShowMaintenanceConfirm(false);
  };

  const handleConfirmReset = () => {
    resetToDefaults();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Global Platform Settings & Policies"
        description="Configure default tenant regional policies, automated onboarding rules, identity branding, and platform maintenance mode."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Configuration
            </button>
          </div>
        }
      />

      {saveSuccess && (
        <AlertBanner variant="info" title="Configuration Saved">
          Platform branding, regional settings, and onboarding policies have been updated and persisted to your local development storage.
        </AlertBanner>
      )}

      <AlertBanner variant="info" title="Configuration Boundary Notice">
        Settings modified here are stored in your browser&apos;s development storage. No global server-side environment variables or live tenant database settings are modified. In production, changes to these settings trigger a synchronized configuration propagation across all edge gateways and tenant pods.
      </AlertBanner>

      {/* Settings Navigation Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'branding', label: 'Platform Branding', icon: <Building className="w-3.5 h-3.5" /> },
          { id: 'regional', label: 'Regional & Currencies', icon: <Globe className="w-3.5 h-3.5" /> },
          { id: 'onboarding', label: 'Onboarding Policies', icon: <UserCheck className="w-3.5 h-3.5" /> },
          { id: 'maintenance', label: 'Maintenance Mode', icon: <Power className="w-3.5 h-3.5" /> },
        ]}
      />

      {/* Tab 1: Branding */}
      {activeTab === 'branding' && (
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-5">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground">Platform Identity & Contact Coordinates</h3>
            <p className="text-xs text-muted-foreground">Global branding displayed across student/parent login portals and billing statements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Platform Name</label>
              <input
                type="text"
                value={branding.platformName}
                onChange={(e) => setBranding({ ...branding, platformName: e.target.value })}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Platform Tagline</label>
              <input
                type="text"
                value={branding.tagline}
                onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Global Support Email</label>
              <input
                type="email"
                value={branding.supportEmail}
                onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Global Support Phone</label>
              <input
                type="tel"
                value={branding.supportPhone}
                onChange={(e) => setBranding({ ...branding, supportPhone: e.target.value })}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-foreground">Documentation & Knowledge Base URL</label>
              <input
                type="url"
                value={branding.documentationUrl}
                onChange={(e) => setBranding({ ...branding, documentationUrl: e.target.value })}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Regional */}
      {activeTab === 'regional' && (
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-5">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground">Regional Defaults & Currency Settings</h3>
            <p className="text-xs text-muted-foreground">Default localization presets applied to newly created school organizations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Locale</label>
              <select
                value={regional.defaultLocale}
                onChange={(e) => setRegional({ ...regional, defaultLocale: e.target.value })}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none"
              >
                <option value="en-US">English (United States) — en-US</option>
                <option value="en-GB">English (United Kingdom) — en-GB</option>
                <option value="en-CA">English (Canada) — en-CA</option>
                <option value="en-AU">English (Australia) — en-AU</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Timezone</label>
              <select
                value={regional.defaultTimezone}
                onChange={(e) => setRegional({ ...regional, defaultTimezone: e.target.value })}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none"
              >
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="America/New_York">America/New_York (Eastern)</option>
                <option value="America/Chicago">America/Chicago (Central)</option>
                <option value="America/Denver">America/Denver (Mountain)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Default Currency</label>
              <select
                value={regional.defaultCurrency}
                onChange={(e) => setRegional({ ...regional, defaultCurrency: e.target.value })}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Date Format Display</label>
              <input
                type="text"
                value={regional.dateFormat}
                onChange={(e) => setRegional({ ...regional, dateFormat: e.target.value })}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Onboarding Policy */}
      {activeTab === 'onboarding' && (
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-5">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground">Self-Serve Onboarding Policies</h3>
            <p className="text-xs text-muted-foreground">Controls for trial provisioning and administrator accreditation verification.</p>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border hover:bg-muted/30 cursor-pointer">
              <input
                type="checkbox"
                checked={onboardingPolicy.autoApproveFreeTrials}
                onChange={(e) =>
                  setOnboardingPolicy({ ...onboardingPolicy, autoApproveFreeTrials: e.target.checked })
                }
                className="mt-0.5 rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground text-sm block">Auto-Approve Free Evaluation Trials</span>
                <span className="text-muted-foreground block">
                  Instantly provision tenant subdomains for new self-serve signups without manual super-admin review.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border hover:bg-muted/30 cursor-pointer">
              <input
                type="checkbox"
                checked={onboardingPolicy.requireAdministratorVerification}
                onChange={(e) =>
                  setOnboardingPolicy({
                    ...onboardingPolicy,
                    requireAdministratorVerification: e.target.checked,
                  })
                }
                className="mt-0.5 rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground text-sm block">Require Administrator Identity Verification</span>
                <span className="text-muted-foreground block">
                  Require official school domain email validation before enabling production SIS data export.
                </span>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Trial Duration (Days)</label>
                <input
                  type="number"
                  min={7}
                  max={90}
                  value={onboardingPolicy.trialDurationDays}
                  onChange={(e) =>
                    setOnboardingPolicy({
                      ...onboardingPolicy,
                      trialDurationDays: parseInt(e.target.value, 10) || 30,
                    })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Max Organizations per Subdomain</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={onboardingPolicy.maxOrganizationsPerDomain}
                  onChange={(e) =>
                    setOnboardingPolicy({
                      ...onboardingPolicy,
                      maxOrganizationsPerDomain: parseInt(e.target.value, 10) || 5,
                    })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Maintenance Mode */}
      {activeTab === 'maintenance' && (
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs space-y-6">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              SaaS Maintenance Mode Administration
            </h3>
            <p className="text-xs text-muted-foreground">Restricts tenant dashboard access during database migrations or infrastructure maintenance windows.</p>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            maintenance.isMaintenanceMode
              ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900'
              : 'bg-muted/40 border-border'
          }`}>
            <div className="space-y-1">
              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                Status: {maintenance.isMaintenanceMode ? (
                  <span className="text-rose-600 dark:text-rose-400 font-extrabold">Active (Access Restricted)</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Normal Operations (Disabled)</span>
                )}
              </span>
              <p className="text-xs text-muted-foreground">
                {maintenance.isMaintenanceMode
                  ? 'All school tenant portals are currently displaying the maintenance message.'
                  : 'All tenant dashboards and student portals are operating normally.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleMaintenanceClick}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs ${
                maintenance.isMaintenanceMode
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
            >
              {maintenance.isMaintenanceMode ? 'Deactivate Maintenance' : 'Activate Maintenance'}
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Maintenance Banner Message</label>
              <textarea
                rows={3}
                value={maintenance.bannerMessage}
                onChange={(e) => setMaintenance({ ...maintenance, bannerMessage: e.target.value })}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Bypass IP Whitelist (Comma-separated)</label>
              <input
                type="text"
                value={maintenance.bypassIps.join(', ')}
                onChange={(e) =>
                  setMaintenance({
                    ...maintenance,
                    bypassIps: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none font-mono"
              />
              <p className="text-[10px] text-muted-foreground">Platform operator IP addresses allowed to bypass the maintenance wall.</p>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showMaintenanceConfirm}
        onClose={() => setShowMaintenanceConfirm(false)}
        onConfirm={handleConfirmMaintenance}
        title={pendingMaintenanceState ? 'Activate Platform Maintenance Mode' : 'Deactivate Platform Maintenance Mode'}
        variant={pendingMaintenanceState ? 'danger' : 'primary'}
        confirmLabel={pendingMaintenanceState ? 'Activate Maintenance' : 'Restore Access'}
        description={
          pendingMaintenanceState ? (
            <p>
              Are you sure you want to activate <strong className="text-rose-600">Maintenance Mode</strong>? In production, this immediately displays a maintenance splash page to all teachers, students, and parents across all school subdomains.
            </p>
          ) : (
            <p>
              Are you sure you want to deactivate Maintenance Mode and restore full tenant portal access?
            </p>
          )
        }
      />

      {/* Reset Defaults Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleConfirmReset}
        title="Reset Configuration to Factory Defaults"
        variant="warning"
        confirmLabel="Reset to Defaults"
        description={
          <p>
            Are you sure you want to reset all platform branding, regional defaults, and onboarding policies to factory initial values? Any local modifications will be overwritten.
          </p>
        }
      />
    </div>
  );
}
