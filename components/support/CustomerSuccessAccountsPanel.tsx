'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  CustomerSuccessAccountSummary,
  CustomerSuccessTask,
} from '@/lib/types/support-desk';
import {
  computeCustomerSuccessAccountSummaries,
  calculateAccountHealthScore,
} from '@/lib/support/evaluator';
import { exportCustomerSuccessSummariesToCsv } from '@/lib/support/exporter';
import { CreateTicketModal } from './CreateTicketModal';
import {
  Building2,
  Search,
  Filter,
  Download,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Star,
  Users,
  Calendar,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  Plus,
  HelpCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CustomerSuccessAccountsPanelProps {
  onNavigateTab: (tabId: string, filter?: Record<string, string | boolean>) => void;
  currentActorId: string;
}

export function CustomerSuccessAccountsPanel({
  onNavigateTab,
  currentActorId,
}: CustomerSuccessAccountsPanelProps) {
  const {
    organizations,
    subscriptions,
    plans,
    supportTickets,
    csatRecords,
    csTasks,
    createCsTask,
  } = usePlatformStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<CustomerSuccessAccountSummary | null>(null);

  // New CS Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [taskDueDate, setTaskDueDate] = useState('2026-10-30');

  // Create Ticket Modal state
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [ticketOrgId, setTicketOrgId] = useState<string>('');

  // Compute all account summaries
  const accountSummaries = useMemo(() => {
    return computeCustomerSuccessAccountSummaries(
      organizations,
      subscriptions,
      plans,
      supportTickets,
      csatRecords,
      csTasks
    );
  }, [organizations, subscriptions, plans, supportTickets, csatRecords, csTasks]);

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accountSummaries.filter((acc) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = acc.organizationName.toLowerCase().includes(query);
        const matchCode = acc.organizationCode.toLowerCase().includes(query);
        const matchSubdomain = acc.subdomain.toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchSubdomain) return false;
      }

      if (tierFilter !== 'all' && acc.healthTier !== tierFilter) {
        return false;
      }

      if (planFilter !== 'all' && acc.planId !== planFilter) {
        return false;
      }

      return true;
    });
  }, [accountSummaries, searchTerm, tierFilter, planFilter]);

  // Export CSV
  const handleExportCsv = () => {
    const csv = exportCustomerSuccessSummariesToCsv(filteredAccounts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customer-success-accounts-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Create CS Task handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !taskTitle.trim()) return;

    createCsTask({
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      organizationId: selectedAccount.organizationId,
      assignedOwnerId: currentActorId,
      priority: taskPriority,
      dueDate: taskDueDate,
    });

    setIsTaskModalOpen(false);
    setTaskTitle('');
    setTaskDescription('');
  };

  // Helper for Health Badge
  const renderHealthBadge = (score: number, tier: 'healthy' | 'attention_needed' | 'at_risk') => {
    if (tier === 'healthy') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" /> {score}/100 Healthy
        </span>
      );
    }
    if (tier === 'attention_needed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5" /> {score}/100 Attention
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <AlertOctagon className="w-3.5 h-3.5" /> {score}/100 At Risk
      </span>
    );
  };

  // Get selected account detailed deductions
  const selectedOrg = organizations.find((o) => o.id === selectedAccount?.organizationId);
  const selectedSub = subscriptions.find((s) => s.organizationId === selectedAccount?.organizationId);
  const healthDetails = selectedOrg
    ? calculateAccountHealthScore(selectedOrg, selectedSub, supportTickets, csatRecords, csTasks)
    : null;

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Customer Success Governance & Account Health</h3>
            <p className="text-muted-foreground">
              Synthesizes onboarding readiness, support load friction, subscription status, and follow-up tasks.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-medium shrink-0 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export CS Accounts CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search school name, code, subdomain..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Health Tiers</option>
            <option value="healthy">Healthy (80-100)</option>
            <option value="attention_needed">Attention Needed (50-79)</option>
            <option value="at_risk">At Risk (0-49)</option>
          </select>
        </div>

        <div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Subscription Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">School / Organization</th>
                <th className="py-2.5 px-3">Plan & Tier</th>
                <th className="py-2.5 px-3">Health Score</th>
                <th className="py-2.5 px-3">Open Tickets</th>
                <th className="py-2.5 px-3">CSAT</th>
                <th className="py-2.5 px-3">Follow-up Tasks</th>
                <th className="py-2.5 px-3">Last Engagement</th>
                <th className="py-2.5 px-3">CS Lead</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No school accounts match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr
                    key={acc.organizationId}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedAccount(acc)}
                  >
                    {/* School Name */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors block line-clamp-1">
                          {acc.organizationName}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span className="font-mono px-1 rounded bg-muted">{acc.organizationCode}</span>
                          <span>•</span>
                          <span>{acc.subdomain}.edusms.cloud</span>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground block">{acc.planName}</span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                            acc.subscriptionStatus === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {acc.subscriptionStatus.toUpperCase()}
                        </span>
                      </div>
                    </td>

                    {/* Health Score */}
                    <td className="py-3 px-3">
                      {renderHealthBadge(acc.healthScore, acc.healthTier)}
                    </td>

                    {/* Open Tickets */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground">{acc.openTicketsCount} open</span>
                        {(acc.urgentTicketsCount > 0 || acc.escalatedTicketsCount > 0) && (
                          <div className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            {acc.urgentTicketsCount > 0 && <span>{acc.urgentTicketsCount} urgent</span>}
                            {acc.escalatedTicketsCount > 0 && <span>{acc.escalatedTicketsCount} esc</span>}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* CSAT */}
                    <td className="py-3 px-3">
                      {acc.averageCsatScore !== null ? (
                        <div className="flex items-center gap-1 font-semibold text-foreground">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{acc.averageCsatScore.toFixed(1)} / 5.0</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">No feedback</span>
                      )}
                    </td>

                    {/* Tasks */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground">{acc.pendingTasksCount} pending</span>
                        {acc.overdueTasksCount > 0 && (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block">
                            {acc.overdueTasksCount} overdue
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Last Engagement */}
                    <td className="py-3 px-3 text-[11px] text-muted-foreground whitespace-nowrap">
                      {acc.lastEngagementDate ? (
                        new Date(acc.lastEngagementDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      ) : (
                        <span className="text-muted-foreground">None recorded</span>
                      )}
                    </td>

                    {/* CS Lead */}
                    <td className="py-3 px-3 text-[11px] text-muted-foreground">
                      <span className="truncate max-w-[130px] block font-medium text-foreground">
                        {acc.assignedCsOwnerName.split(' ')[0]} {acc.assignedCsOwnerName.split(' ')[1]}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAccount(acc);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted text-[11px] font-medium"
                      >
                        Inspect <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Detail & Health Score Breakdown Drawer */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl h-full border-l border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-border flex items-start justify-between gap-3 bg-muted/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">{selectedAccount.organizationName}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">
                    {selectedAccount.organizationCode}
                  </span>
                  <span>•</span>
                  <span>{selectedAccount.planName}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedAccount(null)}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* Health Score Overview */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Customer Success Health Index
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-black text-foreground">
                        {selectedAccount.healthScore} / 100
                      </span>
                      {renderHealthBadge(selectedAccount.healthScore, selectedAccount.healthTier)}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-muted-foreground">
                    <div>Lead: {selectedAccount.assignedCsOwnerName}</div>
                    <div>Status: {selectedAccount.subscriptionStatus.toUpperCase()}</div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
                  Calculated deterministically from baseline 100 points, penalizing active urgent tickets, past-due
                  invoices, low CSAT responses, and overdue follow-up tasks.
                </p>
              </div>

              {/* Explainable Deductions Breakdown */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Point Deductions & Health Factors
                </h4>

                {healthDetails && healthDetails.deductions.length > 0 ? (
                  <div className="space-y-1.5">
                    {healthDetails.deductions.map((d, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 flex items-center justify-between gap-2"
                      >
                        <span className="text-foreground">{d.reason}</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400 font-mono shrink-0">
                          -{d.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Zero deductions recorded. Account is operating at optimum baseline health.</span>
                  </div>
                )}
              </div>

              {/* Readiness Gaps */}
              {selectedAccount.readinessGaps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Configuration Readiness Gaps
                  </h4>
                  <ul className="space-y-1 pl-4 list-disc text-muted-foreground">
                    {selectedAccount.readinessGaps.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Actions for this Account */}
              <div className="pt-3 border-t border-border flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setTicketOrgId(selectedAccount.organizationId);
                    setIsCreateTicketOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Ticket for School
                </button>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted font-semibold text-foreground"
                >
                  <Calendar className="w-3.5 h-3.5" /> Schedule Follow-up Task
                </button>
                <button
                  onClick={() => {
                    setSelectedAccount(null);
                    onNavigateTab('tickets', { organizationId: selectedAccount.organizationId });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  View School Tickets ({selectedAccount.openTicketsCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Task Modal */}
      {isTaskModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Schedule Customer Success Task</h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Target School</label>
                <input
                  type="text"
                  disabled
                  value={selectedAccount.organizationName}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-muted text-muted-foreground"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Term 1 CBT Readiness Review Call"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Description / Agenda</label>
                <textarea
                  rows={2}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Review question bank uploads and student sync status"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background"
                  >
                  </input>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Intake Modal */}
      {isCreateTicketOpen && (
        <CreateTicketModal
          isOpen={isCreateTicketOpen}
          onClose={() => setIsCreateTicketOpen(false)}
          initialOrgId={ticketOrgId}
        />
      )}
    </div>
  );
}
