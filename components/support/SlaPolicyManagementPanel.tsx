'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  SlaPolicy,
  SupportTicketPriority,
  SupportCategoryKey,
  CreateSlaPolicyInput,
  SupportTicket,
} from '@/lib/types/support-desk';
import { SUPPORT_CATEGORIES } from '@/lib/support/fixtures';
import { evaluateTicketSla, formatMinutesDuration } from '@/lib/support/evaluator';
import {
  Timer,
  Clock,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Plus,
  ShieldAlert,
  Calendar,
  Globe,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info,
} from 'lucide-react';

const SIMULATION_BASE_ISO = '2026-10-20T12:00:00.000Z';
const SIMULATION_BASE_TIME = new Date(SIMULATION_BASE_ISO).getTime();

export function SlaPolicyManagementPanel() {
  const {
    slaPolicies,
    supportTickets,
    organizations,
    createSlaPolicy,
    updateSlaPolicy,
    toggleSlaPolicy,
  } = usePlatformStore();

  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(slaPolicies[0]?.id || '');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New policy form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priorityLevels, setPriorityLevels] = useState<SupportTicketPriority[]>(['urgent', 'high']);
  const [categories, setCategories] = useState<SupportCategoryKey[]>(['account_access', 'security_compliance']);
  const [firstResponseMinutes, setFirstResponseMinutes] = useState(60);
  const [resolutionMinutes, setResolutionMinutes] = useState(240);
  const [businessHoursOnly, setBusinessHoursOnly] = useState(false);
  const [timeZone, setTimeZone] = useState('Africa/Lagos');
  const [escalationThresholdPercent, setEscalationThresholdPercent] = useState(75);
  const [formError, setFormError] = useState<string | null>(null);

  // Interactive Sandbox state
  const [sandboxPolicyId, setSandboxPolicyId] = useState<string>(slaPolicies[0]?.id || '');
  const [sandboxPriority, setSandboxPriority] = useState<SupportTicketPriority>('high');
  const [sandboxElapsedMinutes, setSandboxElapsedMinutes] = useState<number>(100);
  const [sandboxHadResponse, setSandboxHadResponse] = useState<boolean>(false);
  const [sandboxResponseMinutes, setSandboxResponseMinutes] = useState<number>(30);
  const [sandboxStatus, setSandboxStatus] = useState<string>('open');

  const selectedPolicy = slaPolicies.find((p) => p.id === selectedPolicyId) || slaPolicies[0];

  // Toggle Policy Active
  const handleToggleActive = (policy: SlaPolicy) => {
    toggleSlaPolicy(policy.id, !policy.isEnabled);
  };

  // Create Policy Submission
  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Policy name is required.');
      return;
    }
    if (firstResponseMinutes <= 0 || resolutionMinutes <= 0) {
      setFormError('Response and resolution targets must be greater than zero.');
      return;
    }
    if (resolutionMinutes < firstResponseMinutes) {
      setFormError('Resolution target cannot be shorter than first response target.');
      return;
    }

    const input: CreateSlaPolicyInput = {
      name: name.trim(),
      description: description.trim(),
      planTier: 'all',
      applicableCategories: categories,
      applicablePriorities: priorityLevels,
      firstResponseTargetMinutes: {
        urgent: Math.max(15, Math.round(firstResponseMinutes / 2)),
        high: firstResponseMinutes,
        normal: firstResponseMinutes * 2,
        low: firstResponseMinutes * 4,
      },
      resolutionTargetMinutes: {
        urgent: Math.max(60, Math.round(resolutionMinutes / 2)),
        high: resolutionMinutes,
        normal: resolutionMinutes * 2,
        low: resolutionMinutes * 4,
      },
      businessHours: {
        enabled: businessHoursOnly,
        startTime: '08:00',
        endTime: '17:00',
        timeZone: timeZone,
        workDays: [1, 2, 3, 4, 5],
      },
      escalationThresholdPercent,
      isDefault: false,
    };

    const res = createSlaPolicy(input);
    if (!res.success) {
      setFormError(res.error || 'Failed to create SLA policy');
      return;
    }

    setIsCreateOpen(false);
    setName('');
    setDescription('');
  };

  // Run Sandbox calculation
  const sandboxPolicy = slaPolicies.find((p) => p.id === sandboxPolicyId) || slaPolicies[0];
  const simulatedCreation = new Date(SIMULATION_BASE_TIME - sandboxElapsedMinutes * 60 * 1000).toISOString();
  const simulatedFirstResponse = sandboxHadResponse
    ? new Date(SIMULATION_BASE_TIME - (sandboxElapsedMinutes - sandboxResponseMinutes) * 60 * 1000).toISOString()
    : undefined;

  const sandboxTicketMock: SupportTicket = {
    id: 'sim_ticket_test',
    ticketNumber: 'TICK-SIM-01',
    subject: 'Sandbox Simulated Ticket',
    description: 'Demonstration simulation for SLA threshold testing',
    organizationId: organizations[0]?.id || 'org_001',
    category: 'general_assistance',
    priority: sandboxPriority,
    status: sandboxStatus as any,
    assignedOperatorId: 'usr_001',
    assignedTeamId: 'team_tier1',
    slaPolicyId: sandboxPolicy?.id || 'sla_growth_silver',
    slaState: 'unknown',
    escalation: { isEscalated: false },
    createdAt: simulatedCreation,
    updatedAt: SIMULATION_BASE_ISO,
    firstResponseAt: simulatedFirstResponse,
    messages: [],
    tags: ['sandbox'],
    source: 'portal',
    requester: {
      name: 'Sandbox Tester',
      email: 'test@school.edu',
      roleTitle: 'School Administrator',
    },
  };

  const sandboxResult = sandboxPolicy
    ? evaluateTicketSla(sandboxTicketMock, sandboxPolicy, SIMULATION_BASE_ISO)
    : null;

  return (
    <div className="space-y-6">
      {/* Informative Header / Notice */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Info className="w-4 h-4" />
          <span>SLA Governance & Demonstration Policy Engine</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Platform SLAs define service-level commitments for educational institutions across response and resolution
          benchmarks. In this frontend demonstration, target evaluations calculate elapsed wall-clock minutes against active policy
          thresholds with pause support for <code className="px-1 py-0.5 rounded bg-muted font-mono text-[11px]">awaiting_tenant</code> states.
        </p>
      </div>

      {/* Grid: Policy Cards and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Policy List / Selector */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configured Policies</h3>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Policy
            </button>
          </div>

          <div className="space-y-2">
            {slaPolicies.map((policy) => {
              const isSelected = policy.id === selectedPolicyId;
              const highResponse = policy.firstResponseTargetMinutes.high || 60;
              const highResolution = policy.resolutionTargetMinutes.high || 240;

              return (
                <div
                  key={policy.id}
                  onClick={() => setSelectedPolicyId(policy.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">{policy.name}</span>
                        {policy.isDefault && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/20 text-primary">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{policy.description}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(policy);
                      }}
                      className="text-muted-foreground hover:text-foreground p-0.5"
                      title={policy.isEnabled ? 'Deactivate Policy' : 'Activate Policy'}
                    >
                      {policy.isEnabled ? (
                        <ToggleRight className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Resp: {formatMinutesDuration(highResponse)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      Res: {formatMinutesDuration(highResolution)}
                    </span>
                    <span className="text-[10px] px-1 rounded bg-muted">
                      {policy.businessHours.enabled ? 'Biz Hours' : '24/7'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Policy Detail Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPolicy ? (
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{selectedPolicy.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        selectedPolicy.isEnabled
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                      }`}
                    >
                      {selectedPolicy.isEnabled ? 'Active Demonstration Policy' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedPolicy.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(selectedPolicy)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-border bg-card hover:bg-muted font-medium transition-colors"
                  >
                    {selectedPolicy.isEnabled ? 'Disable Policy' : 'Enable Policy'}
                  </button>
                </div>
              </div>

              {/* Targets Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                    First Response (High)
                  </span>
                  <span className="text-base font-bold text-primary">
                    {formatMinutesDuration(selectedPolicy.firstResponseTargetMinutes.high || 60)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    ({selectedPolicy.firstResponseTargetMinutes.high || 60} minutes)
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                    Resolution (High)
                  </span>
                  <span className="text-base font-bold text-primary">
                    {formatMinutesDuration(selectedPolicy.resolutionTargetMinutes.high || 240)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    ({selectedPolicy.resolutionTargetMinutes.high || 240} minutes)
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                    Escalation Warning
                  </span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                    {selectedPolicy.escalationThresholdPercent}%
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    Elapsed Target Threshold
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                    Calendar & Time Zone
                  </span>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    {selectedPolicy.businessHours.timeZone}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    {selectedPolicy.businessHours.enabled
                      ? `Business Hours (${selectedPolicy.businessHours.startTime} - ${selectedPolicy.businessHours.endTime})`
                      : '24/7 Full Coverage'}
                  </span>
                </div>
              </div>

              {/* Priority & Category Scopes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Applicable Priority Levels
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPolicy.applicablePriorities.map((p) => (
                      <span
                        key={p}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted border border-border capitalize text-foreground"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Applicable Service Categories
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(selectedPolicy.applicableCategories) ? (
                      selectedPolicy.applicableCategories.map((c) => {
                        const catObj = SUPPORT_CATEGORIES.find((sc) => sc.key === c);
                        return (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-foreground border border-border"
                          >
                            {catObj ? catObj.label : c}
                          </span>
                        );
                      })
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-foreground border border-border">
                        All Support Categories
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tickets currently governed by this policy */}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground">
                    Active Tickets Assigned to this Policy (
                    {supportTickets.filter((t) => t.slaPolicyId === selectedPolicy.id).length})
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {supportTickets
                    .filter((t) => t.slaPolicyId === selectedPolicy.id)
                    .map((t) => {
                      const sla = evaluateTicketSla(t, selectedPolicy);
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-primary">{t.ticketNumber}</span>
                            <span className="font-medium text-foreground line-clamp-1 max-w-[220px]">
                              {t.subject}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                sla.state === 'breached'
                                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                  : sla.state === 'approaching_target'
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {sla.state.toUpperCase()}
                            </span>
                            <span className="text-[11px] text-muted-foreground">{sla.explanation}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground border rounded-xl">
              Select a policy to view configuration details.
            </div>
          )}
        </div>
      </div>

      {/* Interactive SLA Evaluation Simulator / Sandbox */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Interactive SLA Evaluation Sandbox
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Test policy behavior against synthetic tickets and elapsed intervals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3.5 rounded-lg border border-border/60 bg-muted/20 text-xs">
          {/* Policy Selector */}
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Target Policy</label>
            <select
              value={sandboxPolicyId}
              onChange={(e) => setSandboxPolicyId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-border bg-background"
            >
              {slaPolicies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Ticket Priority</label>
            <select
              value={sandboxPriority}
              onChange={(e) => setSandboxPriority(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded border border-border bg-background"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Ticket Lifecycle Status */}
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Lifecycle Status</label>
            <select
              value={sandboxStatus}
              onChange={(e) => setSandboxStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-border bg-background"
            >
              <option value="open">Open (Active)</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_tenant">Awaiting Tenant (Paused)</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Elapsed Wall-clock minutes */}
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">
              Elapsed Time: {sandboxElapsedMinutes} mins ({formatMinutesDuration(sandboxElapsedMinutes)})
            </label>
            <input
              type="range"
              min={5}
              max={720}
              step={5}
              value={sandboxElapsedMinutes}
              onChange={(e) => setSandboxElapsedMinutes(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        {/* Sandbox Output Banner */}
        {sandboxResult && (
          <div
            className={`p-3.5 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-3 ${
              sandboxResult.state === 'breached'
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                : sandboxResult.state === 'approaching_target'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : sandboxResult.state === 'paused'
                ? 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {sandboxResult.state === 'breached' && <AlertOctagon className="w-5 h-5 shrink-0" />}
              {sandboxResult.state === 'approaching_target' && <Clock className="w-5 h-5 shrink-0 animate-pulse" />}
              {sandboxResult.state === 'paused' && <Info className="w-5 h-5 shrink-0" />}
              {sandboxResult.state === 'within_target' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <div>
                <span className="font-bold uppercase tracking-wider block text-[11px]">
                  Evaluated Result: {sandboxResult.state.replace('_', ' ')}
                </span>
                <span className="text-xs">{sandboxResult.explanation}</span>
              </div>
            </div>

            <div className="text-right text-[11px] font-mono space-y-0.5">
              <div>
                First Resp Target: <strong>{sandboxResult.firstResponseMinutesTarget}m</strong>
              </div>
              <div>
                Resolution Target: <strong>{sandboxResult.resolutionMinutesTarget}m</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Policy Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Create Support SLA Policy</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Close
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePolicy} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Policy Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. VIP Enterprise Academic Standard"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Target commitments and coverage hours"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">
                    First Response Target (minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={firstResponseMinutes}
                    onChange={(e) => setFirstResponseMinutes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">
                    Resolution Target (minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    value={resolutionMinutes}
                    onChange={(e) => setResolutionMinutes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">
                    Escalation Warning (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={95}
                    value={escalationThresholdPercent}
                    onChange={(e) => setEscalationThresholdPercent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Time Zone</label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                    <option value="UTC">UTC (Universal)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bizHoursOnly"
                  checked={businessHoursOnly}
                  onChange={(e) => setBusinessHoursOnly(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="bizHoursOnly" className="text-xs text-foreground cursor-pointer">
                  Business Hours Only (Weekdays 08:00 - 17:00 WAT)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Save SLA Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
