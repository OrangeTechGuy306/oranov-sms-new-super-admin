'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { 
  RolloutStrategy, 
  RolloutPlanInput, 
  FeatureFlag, 
  RolloutPreviewSummary 
} from '@/lib/types/platform-config';
import { validateRolloutPlan } from '@/lib/platform-config/validator';
import { estimateRolloutScope } from '@/lib/platform-config/evaluator';
import {
  Sliders,
  Send,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Calendar,
  Percent,
  Layers,
  Sparkles,
  Info,
  Clock,
  ShieldAlert
} from 'lucide-react';

export function RolloutPlannerPanel() {
  const { 
    featureFlags, 
    organizations, 
    applyRolloutPlan, 
    addToast 
  } = usePlatformStore();

  // Active flags eligible for rollout (exclude archived)
  const availableFlags = useMemo(() => {
    return featureFlags.filter(f => f.lifecycle !== 'archived');
  }, [featureFlags]);

  const [selectedFlagKey, setSelectedFlagKey] = useState<string>(
    availableFlags[0]?.key || ''
  );

  const selectedFlag = featureFlags.find(f => f.key === selectedFlagKey);

  // Form state
  const [strategy, setStrategy] = useState<RolloutStrategy>(
    selectedFlag?.rolloutStrategy || 'percentage_rollout'
  );
  const [targetPercentage, setTargetPercentage] = useState<number>(
    selectedFlag?.rolloutPercentage ?? 25
  );
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>(
    selectedFlag?.rolloutTenantIds || []
  );
  const [scheduledStartDate, setScheduledStartDate] = useState<string>('');
  const [scheduledEndDate, setScheduledEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // When selected flag changes, reset form values to flag's current rollout configuration
  const handleSelectFlag = (key: string) => {
    setSelectedFlagKey(key);
    const flag = featureFlags.find(f => f.key === key);
    if (flag) {
      setStrategy(flag.rolloutStrategy || 'percentage_rollout');
      setTargetPercentage(flag.rolloutPercentage ?? 25);
      setSelectedOrgIds(flag.rolloutTenantIds || []);
      setNotes(`Rollout plan adjustment for ${flag.name}`);
    }
  };

  // Compile plan input
  const planInput: RolloutPlanInput = useMemo(() => {
    return {
      flagKey: selectedFlagKey,
      strategy,
      targetPercentage: strategy === 'percentage_rollout' ? targetPercentage : undefined,
      targetOrganizationIds: strategy === 'selective_tenants' ? selectedOrgIds : undefined,
      scheduledStartDate: strategy === 'allowlist_schedule' ? scheduledStartDate : undefined,
      scheduledEndDate: strategy === 'allowlist_schedule' ? scheduledEndDate : undefined,
      notes: notes.trim()
    };
  }, [selectedFlagKey, strategy, targetPercentage, selectedOrgIds, scheduledStartDate, scheduledEndDate, notes]);

  // Client-side validation
  const validationReport = useMemo(() => {
    return validateRolloutPlan(planInput, featureFlags, organizations);
  }, [planInput, featureFlags, organizations]);

  // Scope estimation
  const scopeEstimation: RolloutPreviewSummary = useMemo(() => {
    return estimateRolloutScope(planInput, featureFlags, organizations);
  }, [planInput, featureFlags, organizations]);

  const handleToggleOrg = (orgId: string) => {
    setSelectedOrgIds(prev => 
      prev.includes(orgId) ? prev.filter(id => id !== orgId) : [...prev, orgId]
    );
  };

  const handleSelectAllOrgs = () => {
    if (selectedOrgIds.length === organizations.length) {
      setSelectedOrgIds([]);
    } else {
      setSelectedOrgIds(organizations.map(o => o.id));
    }
  };

  const handleApply = () => {
    if (!validationReport.isValid) {
      addToast({
        type: 'error',
        title: 'Invalid Rollout Plan',
        message: validationReport.errors[0] || 'Please fix validation errors before applying.'
      });
      return;
    }

    const res = applyRolloutPlan(planInput, 'Super-Admin Lead (Current)');
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Rollout Plan Applied (Local Demo)',
        message: `Updated targeting strategy for flag "${selectedFlag?.name}" to ${strategy}.`
      });
    } else {
      addToast({
        type: 'error',
        title: 'Failed to Apply Plan',
        message: res.error
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Informative Disclaimer Banner */}
      <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-white">
            Demonstration-Only Rollout Simulator
          </p>
          <p>
            Canary percentage hashing, consistent user bucketing, and automated stage escalation require a dedicated backend evaluation engine or external feature flag service. The figures and percentages configured below update the local platform demonstration state and validate configuration governance rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Configure Staged Rollout Strategy
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify how this release toggle is exposed to organizations and school faculties.
            </p>
          </div>

          {/* Flag Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Feature Flag <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedFlagKey}
              onChange={(e) => handleSelectFlag(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {availableFlags.map(flag => (
                <option key={flag.key} value={flag.key}>
                  {flag.name} ({flag.key}) — [{flag.lifecycle.toUpperCase()}]
                </option>
              ))}
            </select>
            {selectedFlag && (
              <p className="text-[11px] text-slate-500">
                {selectedFlag.description}
              </p>
            )}
          </div>

          {/* Strategy Selection Radios */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Rollout Strategy Model <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'all_tenants',
                  label: 'All Eligible Tenants',
                  desc: '100% rollout to all entitled schools'
                },
                {
                  id: 'percentage_rollout',
                  label: 'Canary Percentage (%)',
                  desc: 'Gradual ramp up across tenant base'
                },
                {
                  id: 'selective_tenants',
                  label: 'Allowlisted Tenants',
                  desc: 'Specific pilot institutions only'
                },
                {
                  id: 'allowlist_schedule',
                  label: 'Scheduled Timeline',
                  desc: 'Time-gated release window'
                }
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                    strategy === opt.id
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="rolloutStrategy"
                      value={opt.id}
                      checked={strategy === opt.id}
                      onChange={() => setStrategy(opt.id as RolloutStrategy)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {opt.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
                    {opt.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Conditional Input: Percentage Slider */}
          {strategy === 'percentage_rollout' && (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-indigo-500" />
                  Target Percentage Allocation
                </label>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {targetPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>1% (Early Alpha)</span>
                <span>25% (Canary)</span>
                <span>50% (Cohort Beta)</span>
                <span>100% (General Availability)</span>
              </div>
            </div>
          )}

          {/* Conditional Input: Selective Organizations Multi-Select */}
          {strategy === 'selective_tenants' && (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  Select Pilot Organizations ({selectedOrgIds.length} of {organizations.length})
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllOrgs}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  {selectedOrgIds.length === organizations.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {organizations.map(org => {
                  const isChecked = selectedOrgIds.includes(org.id);
                  return (
                    <label
                      key={org.id}
                      className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition-colors ${
                        isChecked 
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200' 
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleOrg(org.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {org.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {org.id}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conditional Input: Scheduled Rollout Dates */}
          {strategy === 'allowlist_schedule' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Scheduled Start Date
                </label>
                <input
                  type="date"
                  value={scheduledStartDate}
                  onChange={(e) => setScheduledStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Scheduled End Date (Optional)
                </label>
                <input
                  type="date"
                  value={scheduledEndDate}
                  onChange={(e) => setScheduledEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Notes / Governance Justification */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Rollout Justification & Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Rolling out instant scoring feature to 25% cohort for load testing."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleSelectFlag(selectedFlagKey)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Reset Values
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!validationReport.isValid}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              Apply Rollout Strategy (Demo)
            </button>
          </div>
        </div>

        {/* Right Column: Live Impact Estimation & Validation (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Estimated Scope Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                Live Scope Demonstration
              </h3>
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Local Estimate
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 block">Eligible Tenants</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  {scopeEstimation.eligibleTenantCount}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Based on module licensing
                </span>
              </div>

              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-[11px] text-indigo-700 dark:text-indigo-300 block">Targeted Tenants</span>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {scopeEstimation.targetedTenantCount}
                </span>
                <span className="text-[10px] text-indigo-500/80 block mt-0.5">
                  Via strategy rule
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Estimated Impacted Users
                </span>
                <span className="text-[11px] text-slate-400">
                  Aggregated students & staff in targeted tenants
                </span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                ~{scopeEstimation.estimatedAffectedUsers.toLocaleString()}
              </span>
            </div>

            {/* Dependency Status */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Feature Dependency Verification
              </span>
              {scopeEstimation.dependenciesSatisfied ? (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All upstream prerequisites active and satisfied.</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Unsatisfied dependencies detected:</span>
                  </div>
                  <ul className="text-[11px] text-rose-500 pl-6 list-disc space-y-0.5">
                    {scopeEstimation.dependencyErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Validation Feedback */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Pre-Execution Validation
              </span>
              {validationReport.isValid ? (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Rollout configuration is valid and safe to apply.</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Configuration Blocked</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                    {validationReport.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationReport.warnings.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Advisory Warnings</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                    {validationReport.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
