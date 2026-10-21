'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  FeatureFlag,
  FeatureFlagLifecycle,
  FeatureFlagCategory,
  FeatureFlagRisk,
  FeatureFlagScope,
  FeatureFlagEnvironment,
} from '@/lib/types/platform-config';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertBanner } from '@/components/ui/AlertBanner';
import {
  Sparkles,
  Search,
  Filter,
  Plus,
  ShieldAlert,
  AlertTriangle,
  GitBranch,
  Layers,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Trash2,
  Clock,
  Archive,
  RefreshCw,
} from 'lucide-react';

export function FeatureFlagsRegistry() {
  const {
    featureFlags,
    toggleFeatureFlag,
    createFeatureFlag,
    transitionFeatureFlagLifecycle,
    deleteFeatureFlag,
    modules,
    tenantOverrides,
  } = usePlatformStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLifecycle, setSelectedLifecycle] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedEnv, setSelectedEnv] = useState<string>('all');

  // Modals
  const [inspectedFlag, setInspectedFlag] = useState<FeatureFlag | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [flagToDelete, setFlagToDelete] = useState<FeatureFlag | null>(null);

  // New Flag Form
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<FeatureFlagCategory>('academics');
  const [newRisk, setNewRisk] = useState<FeatureFlagRisk>('standard');
  const [newScope, setNewScope] = useState<FeatureFlagScope>('global');
  const [newEnv, setNewEnv] = useState<FeatureFlagEnvironment>('all');
  const [newDefaultVal, setNewDefaultVal] = useState(false);
  const [newDependencies, setNewDependencies] = useState<string[]>([]);
  const [newRelatedModule, setNewRelatedModule] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter flags
  const filteredFlags = useMemo(() => {
    return featureFlags.filter((f) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !f.name.toLowerCase().includes(q) &&
          !f.key.toLowerCase().includes(q) &&
          !f.description.toLowerCase().includes(q) &&
          !f.owner.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
      if (selectedLifecycle !== 'all' && f.lifecycle !== selectedLifecycle) return false;
      if (selectedRisk !== 'all' && f.risk !== selectedRisk) return false;
      if (selectedEnv !== 'all' && f.environment !== selectedEnv && f.environment !== 'all') return false;
      return true;
    });
  }, [featureFlags, searchQuery, selectedCategory, selectedLifecycle, selectedRisk, selectedEnv]);

  // Summary Metrics
  const metrics = useMemo(() => {
    return {
      total: featureFlags.length,
      active: featureFlags.filter((f) => f.lifecycle === 'active' && f.enabled).length,
      disabled: featureFlags.filter((f) => f.lifecycle === 'disabled' || !f.enabled).length,
      scheduled: featureFlags.filter((f) => f.lifecycle === 'scheduled').length,
      archived: featureFlags.filter((f) => f.lifecycle === 'archived').length,
      critical: featureFlags.filter((f) => f.risk === 'critical').length,
    };
  }, [featureFlags]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const res = createFeatureFlag({
      key: newKey.trim(),
      name: newName.trim(),
      description: newDescription.trim(),
      category: newCategory,
      risk: newRisk,
      scope: newScope,
      environment: newEnv,
      defaultValue: newDefaultVal,
      enabled: newDefaultVal,
      dependsOnFlagKeys: newDependencies,
      relatedModuleId: newRelatedModule || undefined,
    });

    if (res.success) {
      setShowCreateModal(false);
      setNewKey('');
      setNewName('');
      setNewDescription('');
      setNewDependencies([]);
      setNewRelatedModule('');
    } else {
      setFormError(res.error || 'Failed to register feature flag.');
    }
  };

  const getRiskBadge = (risk: FeatureFlagRisk) => {
    switch (risk) {
      case 'critical':
        return <Badge variant="error" className="text-[10px]">Critical Risk</Badge>;
      case 'elevated':
        return <Badge variant="warning" className="text-[10px]">Elevated Risk</Badge>;
      default:
        return <Badge variant="neutral" className="text-[10px]">Standard Risk</Badge>;
    }
  };

  const getLifecycleBadge = (lifecycle: FeatureFlagLifecycle) => {
    switch (lifecycle) {
      case 'active':
        return <Badge variant="success" className="text-[10px]">Active</Badge>;
      case 'disabled':
        return <Badge variant="neutral" className="text-[10px]">Disabled</Badge>;
      case 'scheduled':
        return <Badge variant="info" className="text-[10px]">Scheduled</Badge>;
      case 'draft':
        return <Badge variant="warning" className="text-[10px]">Draft</Badge>;
      case 'archived':
        return <Badge variant="neutral" className="text-[10px] opacity-75">Archived</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl border border-border bg-card">
          <span className="text-[11px] text-muted-foreground block">Total Registered</span>
          <span className="text-xl font-bold text-foreground">{metrics.total}</span>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block">Active & Enabled</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.active}</span>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <span className="text-[11px] text-muted-foreground block">Disabled / Gated</span>
          <span className="text-xl font-bold text-muted-foreground">{metrics.disabled}</span>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 block">Scheduled Releases</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{metrics.scheduled}</span>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <span className="text-[11px] text-amber-600 dark:text-amber-400 block">Archived Flags</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{metrics.archived}</span>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <span className="text-[11px] text-rose-600 dark:text-rose-400 block">Critical Risk</span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400">{metrics.critical}</span>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by flag key, human name, description, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-muted/20 border border-border rounded-lg text-xs focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Feature Flag</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/50 text-xs">
          <div>
            <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Domain Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2 py-1.5 bg-muted/20 border border-border rounded-md text-xs"
            >
              <option value="all">All Categories</option>
              <option value="academics">Academics</option>
              <option value="examinations_cbt">Examinations & CBT</option>
              <option value="admissions">Admissions</option>
              <option value="finance">Finance & Fees</option>
              <option value="communications">Communications</option>
              <option value="reporting">Reporting</option>
              <option value="platform_operations">Platform Ops</option>
              <option value="experimental">Experimental</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Lifecycle State</label>
            <select
              value={selectedLifecycle}
              onChange={(e) => setSelectedLifecycle(e.target.value)}
              className="w-full px-2 py-1.5 bg-muted/20 border border-border rounded-md text-xs"
            >
              <option value="all">All Lifecycles</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Risk Classification</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-2 py-1.5 bg-muted/20 border border-border rounded-md text-xs"
            >
              <option value="all">All Risk Levels</option>
              <option value="standard">Standard</option>
              <option value="elevated">Elevated</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Target Environment</label>
            <select
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="w-full px-2 py-1.5 bg-muted/20 border border-border rounded-md text-xs"
            >
              <option value="all">All Environments</option>
              <option value="development">Development Sandbox</option>
              <option value="staging">Staging Canary</option>
              <option value="production">Production Cluster</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feature Flags Grid / List */}
      <div className="space-y-3">
        {filteredFlags.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-border bg-card text-muted-foreground text-xs space-y-2">
            <Filter className="w-8 h-8 mx-auto opacity-40" />
            <p className="font-semibold text-foreground">No feature flags match your active filters</p>
            <p>Try broadening your search query or resetting filters.</p>
          </div>
        ) : (
          filteredFlags.map((flag) => {
            const overridesForFlag = tenantOverrides.filter((o) => o.flagKey === flag.key);
            const isArchived = flag.lifecycle === 'archived';

            return (
              <div
                key={flag.id}
                className={`p-4 rounded-xl border transition-all text-xs bg-card ${
                  flag.enabled && !isArchived ? 'border-primary/40 shadow-xs' : 'border-border'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-foreground text-sm">{flag.name}</h4>
                      <code className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded border border-border/50">
                        {flag.key}
                      </code>
                      {getLifecycleBadge(flag.lifecycle)}
                      {getRiskBadge(flag.risk)}
                      <Badge variant="neutral" className="text-[10px] capitalize">
                        {flag.category.replace('_', ' ')}
                      </Badge>
                      {flag.environment !== 'all' && (
                        <Badge variant="info" className="text-[10px] uppercase">
                          {flag.environment}
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground text-xs leading-relaxed">{flag.description}</p>

                    {/* Metadata & Dependencies Pill Row */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold text-foreground">Owner:</span> {flag.owner}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-muted-foreground" />
                        <span>Prerequisites: {flag.dependsOnFlagKeys.length}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-muted-foreground" />
                        <span>Overrides: {overridesForFlag.length} schools</span>
                      </span>
                      <span>•</span>
                      <span className="capitalize">Strategy: {flag.rolloutStrategy.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Actions & Toggle */}
                  <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 pt-2 md:pt-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleFeatureFlag(flag.key)}
                        disabled={isArchived}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isArchived
                            ? 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground border border-border'
                            : flag.enabled
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                            : 'bg-muted text-foreground border border-border hover:bg-muted/80'
                        }`}
                      >
                        {flag.enabled ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active / Enabled</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setInspectedFlag(flag)}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Inspect Flag Dependencies & Governance"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setFlagToDelete(flag)}
                        className="p-1.5 rounded-lg border border-border hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                        title="Delete Flag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Lifecycle Transition selector */}
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span>State:</span>
                      <select
                        value={flag.lifecycle}
                        onChange={(e) => transitionFeatureFlagLifecycle(flag.key, e.target.value as FeatureFlagLifecycle, 'Admin transitioned lifecycle via Super-Admin.')}
                        className="bg-transparent border border-border rounded px-1.5 py-0.5 text-[11px] text-foreground"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: REGISTER NEW FEATURE FLAG */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Register New Feature Flag"
        description="Add a new release toggle, canary experiment, or capability flag to the Super-Admin registry."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateSubmit}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-xs"
            >
              Register Flag
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {formError && (
            <AlertBanner variant="error" title="Validation Error">
              {formError}
            </AlertBanner>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Flag Stable Key (Unique slug)</label>
              <input
                type="text"
                placeholder="e.g. feat.academics.cbt_instant_scoring"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs font-mono"
                required
              />
              <span className="text-[10px] text-muted-foreground">Lowercase alphanumeric separated by dots or hyphens.</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Human-Readable Name</label>
              <input
                type="text"
                placeholder="e.g. CBT Automated Instant Scoring"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-foreground">Description & Technical Scope</label>
              <textarea
                rows={2}
                placeholder="Explain the functional behavior, affected modules, and rollout safety..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Domain Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as FeatureFlagCategory)}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                <option value="academics">Academics</option>
                <option value="examinations_cbt">Examinations & CBT</option>
                <option value="admissions">Admissions</option>
                <option value="student_information">Student Information</option>
                <option value="finance">Finance & Fees</option>
                <option value="human_resources">Human Resources</option>
                <option value="communications">Communications</option>
                <option value="reporting">Reporting</option>
                <option value="platform_operations">Platform Operations</option>
                <option value="experimental">Experimental</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Risk Classification</label>
              <select
                value={newRisk}
                onChange={(e) => setNewRisk(e.target.value as FeatureFlagRisk)}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                <option value="standard">Standard Risk (Safe user-facing feature)</option>
                <option value="elevated">Elevated Risk (Alters financial or grading data)</option>
                <option value="critical">Critical Risk (Authentication, infrastructure, or exam lockdown)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Configuration Scope</label>
              <select
                value={newScope}
                onChange={(e) => setNewScope(e.target.value as FeatureFlagScope)}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                <option value="global">Global Platform Default</option>
                <option value="environment">Environment-Restricted</option>
                <option value="tenant_override">Tenant Override Capable</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Environment Applicability</label>
              <select
                value={newEnv}
                onChange={(e) => setNewEnv(e.target.value as FeatureFlagEnvironment)}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                <option value="all">All Environments</option>
                <option value="development">Development Sandbox Only</option>
                <option value="staging">Staging Canary Only</option>
                <option value="production">Production Cluster Only</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-foreground">Prerequisite Flag Dependencies</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded-lg border border-border bg-muted/10 max-h-36 overflow-y-auto">
                {featureFlags.map((f) => (
                  <label key={f.key} className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={newDependencies.includes(f.key)}
                      onChange={(e) => {
                        if (e.target.checked) setNewDependencies([...newDependencies, f.key]);
                        else setNewDependencies(newDependencies.filter((k) => k !== f.key));
                      }}
                      className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                    />
                    <span className="truncate">{f.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-foreground">Related Entitled Module (Optional)</label>
              <select
                value={newRelatedModule}
                onChange={(e) => setNewRelatedModule(e.target.value)}
                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs"
              >
                <option value="">None / Standalone Platform Flag</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: INSPECT FLAG DETAILS & DEPENDENCY GRAPH */}
      {inspectedFlag && (
        <Modal
          isOpen={!!inspectedFlag}
          onClose={() => setInspectedFlag(null)}
          title={
            <div className="flex items-center gap-2">
              <span>{inspectedFlag.name}</span>
              {getLifecycleBadge(inspectedFlag.lifecycle)}
            </div>
          }
          description={`Key: ${inspectedFlag.key} | Owner: ${inspectedFlag.owner}`}
          size="lg"
          footer={
            <button
              type="button"
              onClick={() => setInspectedFlag(null)}
              className="px-4 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
            >
              Close
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
              <h5 className="font-semibold text-foreground text-xs">Functional Scope</h5>
              <p className="text-muted-foreground text-xs leading-relaxed">{inspectedFlag.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/50 text-[11px]">
                <div>
                  <span className="text-muted-foreground block">Category:</span>
                  <span className="font-semibold text-foreground capitalize">{inspectedFlag.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Risk Level:</span>
                  <span className="font-semibold text-foreground capitalize">{inspectedFlag.risk}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Scope:</span>
                  <span className="font-semibold text-foreground capitalize">{inspectedFlag.scope}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Environment:</span>
                  <span className="font-semibold text-foreground uppercase">{inspectedFlag.environment}</span>
                </div>
              </div>
            </div>

            {/* Dependency Graph */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <h5 className="font-semibold text-foreground text-xs flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary" />
                <span>Dependency Verification Graph</span>
              </h5>
              {inspectedFlag.dependsOnFlagKeys.length === 0 ? (
                <p className="text-muted-foreground text-xs">This feature flag operates independently with zero required prerequisites.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-[11px]">The following prerequisite flags must be active and enabled:</p>
                  <div className="space-y-1.5">
                    {inspectedFlag.dependsOnFlagKeys.map((depKey) => {
                      const dep = featureFlags.find((f) => f.key === depKey);
                      const isSatisfied = dep && dep.enabled && dep.lifecycle === 'active';
                      return (
                        <div key={depKey} className="p-2.5 rounded-lg border border-border bg-muted/10 flex items-center justify-between">
                          <span className="font-mono text-xs">{depKey}</span>
                          <Badge variant={isSatisfied ? 'success' : 'error'} className="text-[10px]">
                            {isSatisfied ? 'Dependency Satisfied' : 'Missing / Disabled (Blocker)'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Tenant Overrides */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <h5 className="font-semibold text-foreground text-xs">Active Institutional Overrides</h5>
              {tenantOverrides.filter((o) => o.flagKey === inspectedFlag.key).length === 0 ? (
                <p className="text-muted-foreground text-xs">Zero institutional overrides configured. All tenant schools inherit the platform default state.</p>
              ) : (
                <div className="space-y-1.5">
                  {tenantOverrides.filter((o) => o.flagKey === inspectedFlag.key).map((ov) => (
                    <div key={ov.id} className="p-2.5 rounded-lg border border-border bg-muted/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-foreground">{ov.organizationId}</span>
                        <p className="text-[11px] text-muted-foreground">{ov.reason}</p>
                      </div>
                      <Badge variant={ov.overrideValue ? 'success' : 'error'} className="text-[10px]">
                        {ov.overrideValue ? 'Forced ON' : 'Forced OFF'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/10 text-muted-foreground text-[11px]">
              <span className="font-semibold text-foreground">Backend Gating Notice: </span>
              {inspectedFlag.backendEnforcementNotice || 'Flag state is managed in client development storage. Enforcement requires server-side policy evaluation.'}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!flagToDelete}
        onClose={() => setFlagToDelete(null)}
        onConfirm={() => {
          if (flagToDelete) {
            deleteFeatureFlag(flagToDelete.key);
            setFlagToDelete(null);
          }
        }}
        title={`Delete Flag "${flagToDelete?.name}"?`}
        description={`Are you sure you want to permanently delete flag "${flagToDelete?.key}" from the registry? Any tenant overrides targeting this flag will also be purged.`}
        confirmLabel="Delete Flag"
        variant="danger"
      />
    </div>
  );
}
