'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { NotificationPolicy, TemplateCategory, ChannelType, NotificationPriority } from '@/lib/types/communications';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { simulatePolicyEvaluation } from '@/lib/communications/evaluator';
import { validatePolicyDefinition } from '@/lib/communications/validator';
import { formatDate } from '@/lib/utils/formatters';
import {
  Sliders,
  Plus,
  Play,
  Moon,
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Check,
  Building2,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

export function NotificationPoliciesPanel() {
  const {
    notificationPolicies,
    communicationTemplates,
    organizations,
    createNotificationPolicy,
    updateNotificationPolicy,
    toggleNotificationPolicy,
  } = usePlatformStore();

  // Create Policy Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('security_alerts');
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>(['email']);
  const [scope, setScope] = useState<'platform_wide' | 'tenant_specific'>('platform_wide');
  const [targetTenantId, setTargetTenantId] = useState('');
  const [priority, setPriority] = useState<NotificationPriority>('normal');
  const [requiredTemplateKey, setRequiredTemplateKey] = useState(
    communicationTemplates[0]?.key || ''
  );
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietStartTime, setQuietStartTime] = useState('22:00');
  const [quietEndTime, setQuietEndTime] = useState('07:00');
  const [allowCriticalBypass, setAllowCriticalBypass] = useState(true);

  // Policy Simulator State
  const [simCategory, setSimCategory] = useState<TemplateCategory>('platform_maintenance');
  const [simChannel, setSimChannel] = useState<ChannelType>('email');
  const [simTenantId, setSimTenantId] = useState<string>('org_001');
  const [simTime, setSimTime] = useState<string>('23:30');
  const [hasRunSimulation, setHasRunSimulation] = useState(false);

  // Run validation on modal form
  const candidatePolicy: Partial<NotificationPolicy> = {
    name,
    category,
    applicableChannels: selectedChannels,
    scope,
    targetTenantId: scope === 'tenant_specific' ? targetTenantId : undefined,
    priority,
    requiredTemplateKey,
    quietHours: {
      enabled: quietHoursEnabled,
      startTimeUtc: quietStartTime,
      endTimeUtc: quietEndTime,
      allowCriticalBypass,
      timezone: 'UTC',
    },
  };

  const validation = validatePolicyDefinition(candidatePolicy, notificationPolicies);

  const handleToggleChannel = (ch: ChannelType) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;

    createNotificationPolicy({
      name,
      description,
      category,
      applicableChannels: selectedChannels,
      scope,
      targetTenantId: scope === 'tenant_specific' ? targetTenantId : undefined,
      priority,
      enabled: true,
      quietHours: {
        enabled: quietHoursEnabled,
        startTimeUtc: quietStartTime,
        endTimeUtc: quietEndTime,
        allowCriticalBypass,
        timezone: 'UTC',
      },
      requiredTemplateKey,
      suppressionConditions: ['quiet_hours_active', 'rate_limit_exceeded'],
    });

    setIsCreateOpen(false);
    setName('');
    setDescription('');
  };

  // Run Policy Evaluation Simulation
  const simulationResult = simulatePolicyEvaluation(
    notificationPolicies,
    communicationTemplates,
    {
      category: simCategory,
      channel: simChannel,
      tenantId: simTenantId || undefined,
      currentTimeUtc: simTime,
    }
  );

  return (
    <div className="space-y-6">
      {/* Workspace Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            Notification Policy Management
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define dispatch precedence, quiet-hours suppression rules, channel gating, and required templates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5 self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Policy
        </button>
      </div>

      {/* Precedence Hierarchy Architecture Banner */}
      <Card className="p-4 bg-muted/20 border-border/80 text-xs space-y-2">
        <span className="font-semibold text-foreground flex items-center gap-2 text-xs">
          <Layers className="w-4 h-4 text-primary" />
          Four-Layer Precedence Hierarchy
        </span>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[11px] pt-1">
          <div className="p-2.5 rounded bg-background border border-border/70 space-y-1">
            <span className="font-bold text-red-600 dark:text-red-400 block">1. Security Critical</span>
            <p className="text-muted-foreground text-[10.5px]">
              2FA, lockouts & incident advisories bypass quiet hours and recipient opt-outs.
            </p>
          </div>
          <div className="p-2.5 rounded bg-background border border-border/70 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block">2. Tenant Override</span>
            <p className="text-muted-foreground text-[10.5px]">
              School-specific custom channels and quiet-hours take precedence over platform defaults.
            </p>
          </div>
          <div className="p-2.5 rounded bg-background border border-border/70 space-y-1">
            <span className="font-bold text-blue-600 dark:text-blue-400 block">3. Standard Category</span>
            <p className="text-muted-foreground text-[10.5px]">
              Billing, onboarding & academic notices respect standard quiet hours (22:00-07:00 UTC).
            </p>
          </div>
          <div className="p-2.5 rounded bg-background border border-border/70 space-y-1">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">4. Platform Default</span>
            <p className="text-muted-foreground text-[10.5px]">
              Global fallback rules apply when no specific tenant policy matches.
            </p>
          </div>
        </div>
      </Card>

      {/* Policy Table */}
      <Card className="overflow-hidden border border-border shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Policy Name & Scope</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Channels</th>
                <th className="py-3 px-3">Quiet Hours (UTC)</th>
                <th className="py-3 px-3">Required Template</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {notificationPolicies.map((pol) => (
                <tr key={pol.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{pol.name}</span>
                        {pol.scope === 'tenant_specific' ? (
                          <Badge variant="warning">Tenant Override</Badge>
                        ) : (
                          <Badge variant="neutral">Platform Global</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground max-w-sm line-clamp-1">
                        {pol.description}
                      </p>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] text-muted-foreground capitalize">
                      {pol.category.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {pol.priority === 'critical' ? (
                      <Badge variant="error">Critical</Badge>
                    ) : pol.priority === 'high' ? (
                      <Badge variant="warning">High</Badge>
                    ) : (
                      <Badge variant="neutral">{pol.priority}</Badge>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {pol.applicableChannels.map((c) => (
                        <span key={c} className="font-mono text-[10px] bg-muted px-1.5 py-0.2 rounded uppercase">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {pol.quietHours.enabled ? (
                      <div className="space-y-0.5">
                        <span className="font-mono text-[11px] text-foreground flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-400" />
                          {pol.quietHours.startTimeUtc} - {pol.quietHours.endTimeUtc}
                        </span>
                        {pol.quietHours.allowCriticalBypass && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                            Critical bypass allowed
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">24/7 Delivery</span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground">
                      {pol.requiredTemplateKey}
                    </code>
                  </td>

                  <td className="py-3 px-3">
                    {pol.enabled ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="neutral">Disabled</Badge>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleNotificationPolicy(pol.id, !pol.enabled)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded transition-colors ${
                        pol.enabled
                          ? 'bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40'
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {pol.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Interactive Policy Simulation Sandbox */}
      <Card className="p-5 space-y-4 border border-border shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" />
              Interactive Policy Evaluation Sandbox
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simulate how platform policies resolve for candidate notification events across channels and time windows.
            </p>
          </div>
          <Badge variant="neutral">Client Evaluation</Badge>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Event Category
            </label>
            <select
              value={simCategory}
              onChange={(e) => {
                setSimCategory(e.target.value as TemplateCategory);
                setHasRunSimulation(true);
              }}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background focus:outline-none"
            >
              <option value="security_alerts">Security Alerts</option>
              <option value="platform_maintenance">Platform Maintenance</option>
              <option value="password_reset">Password Reset</option>
              <option value="subscription_billing">Subscription Billing</option>
              <option value="school_onboarding">School Onboarding</option>
              <option value="administrative_alerts">Administrative Alerts</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Target Channel
            </label>
            <select
              value={simChannel}
              onChange={(e) => {
                setSimChannel(e.target.value as ChannelType);
                setHasRunSimulation(true);
              }}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background focus:outline-none"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="in_app">In-App</option>
              <option value="push">Mobile Push</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Target Organization (Tenant Scope)
            </label>
            <select
              value={simTenantId}
              onChange={(e) => {
                setSimTenantId(e.target.value);
                setHasRunSimulation(true);
              }}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background focus:outline-none"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Simulated Dispatch Time (UTC)
            </label>
            <input
              type="text"
              value={simTime}
              onChange={(e) => {
                setSimTime(e.target.value);
                setHasRunSimulation(true);
              }}
              placeholder="e.g. 23:30 or 14:00"
              className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none"
            />
          </div>
        </div>

        {/* Live Simulation Evaluation Output */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-2">
              <span>Evaluation Outcome:</span>
              {simulationResult.decision === 'allowed' ? (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  PERMITTED (Dispatch Allowed)
                </span>
              ) : simulationResult.decision === 'suppressed' ? (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  SUPPRESSED (Quiet Hours or Policy Cap)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                  NO MATCH (Policy Undefined)
                </span>
              )}
            </span>

            {simulationResult.isCriticalBypass && (
              <Badge variant="warning">Critical Priority Quiet-Hours Bypass</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                Matched Policy Definition:
              </span>
              <p className="text-foreground">
                {simulationResult.matchedPolicy
                  ? `${simulationResult.matchedPolicy.name} (${simulationResult.matchedPolicy.priority} priority, ${simulationResult.matchedPolicy.scope})`
                  : 'No active policy matches category and channel.'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                Bound Template Key:
              </span>
              <code className="text-xs bg-background px-2 py-0.5 rounded border border-border">
                {simulationResult.selectedTemplate?.key || 'None Resolved'}
              </code>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 space-y-1 text-xs">
            <span className="font-semibold text-muted-foreground block text-[11px]">Evaluation Log:</span>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside text-[11.5px]">
              {simulationResult.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
              {simulationResult.warnings.map((w, i) => (
                <li key={`w-${i}`} className="text-amber-600 dark:text-amber-400 font-medium">
                  Warning: {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Create Policy Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create Notification Policy"
          description="Establish dispatch routing, priority tier, and quiet-hours rules for notification categories."
          size="lg"
        >
          <form onSubmit={handleCreatePolicy} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Policy Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Critical Security Incident & Lockout Dispatch"
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Internal Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Multi-channel escalation policy for account lockouts"
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-background focus:outline-none"
                >
                  <option value="security_alerts">Security Alerts</option>
                  <option value="platform_maintenance">Platform Maintenance</option>
                  <option value="password_reset">Password Reset</option>
                  <option value="subscription_billing">Subscription Billing</option>
                  <option value="account_verification">Account Verification</option>
                  <option value="school_onboarding">School Onboarding</option>
                  <option value="org_provisioning">Org Provisioning</option>
                  <option value="administrative_alerts">Administrative Alerts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Priority Tier
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as NotificationPriority)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-background focus:outline-none"
                >
                  <option value="critical">Critical (Bypasses Quiet Hours)</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Channels Multi-Select */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Applicable Channels <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {(['email', 'sms', 'in_app', 'push', 'whatsapp'] as ChannelType[]).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => handleToggleChannel(ch)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all ${
                      selectedChannels.includes(ch)
                        ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'border-border bg-background hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {ch.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope & Target Tenant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Policy Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-background focus:outline-none"
                >
                  <option value="platform_wide">Platform Global</option>
                  <option value="tenant_specific">Tenant Specific</option>
                </select>
              </div>

              {scope === 'tenant_specific' && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Target Tenant <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={targetTenantId}
                    onChange={(e) => setTargetTenantId(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-background focus:outline-none"
                    required
                  >
                    <option value="">Select Tenant</option>
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Required Template Reference */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Required Template Reference <span className="text-red-500">*</span>
              </label>
              <select
                value={requiredTemplateKey}
                onChange={(e) => setRequiredTemplateKey(e.target.value)}
                className="w-full text-xs font-mono px-2.5 py-2 rounded-lg border border-border bg-background focus:outline-none"
                required
              >
                {communicationTemplates.map((t) => (
                  <option key={t.id} value={t.key}>
                    {t.key} — {t.name} ({t.channel})
                  </option>
                ))}
              </select>
            </div>

            {/* Quiet Hours Configuration */}
            <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  Quiet Hours Configuration (UTC)
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={quietHoursEnabled}
                    onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span>Enable Quiet Hours</span>
                </label>
              </div>

              {quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">
                      Start Time (HH:MM UTC)
                    </label>
                    <input
                      type="text"
                      value={quietStartTime}
                      onChange={(e) => setQuietStartTime(e.target.value)}
                      placeholder="22:00"
                      className="w-full text-xs font-mono px-2.5 py-1.5 rounded border border-border bg-background focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">
                      End Time (HH:MM UTC)
                    </label>
                    <input
                      type="text"
                      value={quietEndTime}
                      onChange={(e) => setQuietEndTime(e.target.value)}
                      placeholder="07:00"
                      className="w-full text-xs font-mono px-2.5 py-1.5 rounded border border-border bg-background focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground pt-1">
                <input
                  type="checkbox"
                  checked={allowCriticalBypass}
                  onChange={(e) => setAllowCriticalBypass(e.target.checked)}
                  className="rounded border-border"
                />
                <span>Allow Critical Priority Alerts to Bypass Quiet Hours</span>
              </label>
            </div>

            {/* Validation errors */}
            {validation.errors.length > 0 && (
              <div className="p-2.5 rounded border border-red-200 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs">
                {validation.errors.join(' ')}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!validation.isValid}
                className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                Create Policy
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
