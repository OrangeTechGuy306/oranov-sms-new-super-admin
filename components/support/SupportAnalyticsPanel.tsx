'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  SupportTicket,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportCategoryKey,
} from '@/lib/types/support-desk';
import { SUPPORT_CATEGORIES } from '@/lib/support/fixtures';
import {
  evaluateTicketSla,
  formatMinutesDuration,
  formatHoursDuration,
} from '@/lib/support/evaluator';
import {
  exportTicketsToCsv,
  exportCsatToCsv,
  exportCustomerSuccessSummariesToCsv,
} from '@/lib/support/exporter';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Timer,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Download,
  Building2,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';

export function SupportAnalyticsPanel() {
  const {
    supportTickets,
    organizations,
    supportTeams,
    platformUsers,
    slaPolicies,
    csatRecords,
    csTasks,
    subscriptions,
    plans,
  } = usePlatformStore();

  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');

  // Filtered tickets based on org
  const relevantTickets = useMemo(() => {
    if (selectedOrgId === 'all') return supportTickets;
    return supportTickets.filter((t) => t.organizationId === selectedOrgId);
  }, [supportTickets, selectedOrgId]);

  // Derived calculations
  const totalVolume = relevantTickets.length;
  const openTickets = relevantTickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed');
  const resolvedTickets = relevantTickets.filter((t) => t.status === 'resolved' || t.status === 'closed');
  const escalatedTickets = relevantTickets.filter((t) => t.status === 'escalated' || t.escalation.isEscalated);

  const escalationRate = totalVolume > 0 ? Math.round((escalatedTickets.length / totalVolume) * 100) : 0;

  // First response time calculation
  const responded = relevantTickets.filter((t) => t.firstResponseAt && t.createdAt);
  const avgFirstResponseMinutes =
    responded.length > 0
      ? Math.round(
          responded.reduce((acc, t) => {
            const diff = new Date(t.firstResponseAt!).getTime() - new Date(t.createdAt).getTime();
            return acc + Math.max(0, diff / 60000);
          }, 0) / responded.length
        )
      : null;

  // Resolution time calculation
  const completed = relevantTickets.filter((t) => (t.resolvedAt || t.closedAt) && t.createdAt);
  const avgResolutionHours =
    completed.length > 0
      ? Math.round(
          (completed.reduce((acc, t) => {
            const finish = new Date(t.resolvedAt || t.closedAt!).getTime();
            const diff = finish - new Date(t.createdAt).getTime();
            return acc + Math.max(0, diff / 3600000);
          }, 0) /
            completed.length) *
            10
        ) / 10
      : null;

  // SLA Performance
  let slaMetCount = 0;
  let slaEvaluatedCount = 0;
  relevantTickets.forEach((t) => {
    const policy = slaPolicies.find((p) => p.id === t.slaPolicyId) || slaPolicies[0];
    if (policy) {
      const evalRes = evaluateTicketSla(t, policy);
      if (evalRes.state !== 'unknown') {
        slaEvaluatedCount += 1;
        if (evalRes.state !== 'breached') {
          slaMetCount += 1;
        }
      }
    }
  });
  const slaComplianceRate = slaEvaluatedCount > 0 ? Math.round((slaMetCount / slaEvaluatedCount) * 100) : 100;

  // Status Breakdown
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      new: 0,
      open: 0,
      in_progress: 0,
      awaiting_tenant: 0,
      awaiting_internal: 0,
      escalated: 0,
      resolved: 0,
      closed: 0,
    };
    relevantTickets.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status] += 1;
    });
    return counts;
  }, [relevantTickets]);

  // Priority Breakdown
  const priorityCounts = useMemo(() => {
    const counts: Record<SupportTicketPriority, number> = {
      urgent: 0,
      high: 0,
      normal: 0,
      low: 0,
    };
    relevantTickets.forEach((t) => {
      if (counts[t.priority] !== undefined) counts[t.priority] += 1;
    });
    return counts;
  }, [relevantTickets]);

  // Category Breakdown
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    relevantTickets.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [relevantTickets]);

  // Team Workload Breakdown
  const teamWorkload = useMemo(() => {
    const counts: Record<string, number> = {};
    relevantTickets.forEach((t) => {
      if (t.assignedTeamId) {
        counts[t.assignedTeamId] = (counts[t.assignedTeamId] || 0) + 1;
      }
    });
    return supportTeams.map((team) => ({
      name: team.name,
      count: counts[team.id] || 0,
    }));
  }, [relevantTickets, supportTeams]);

  // Repeated Issues by School
  const schoolIssueRankings = useMemo(() => {
    const counts: Record<string, { total: number; urgent: number; escalated: number }> = {};
    supportTickets.forEach((t) => {
      if (!counts[t.organizationId]) {
        counts[t.organizationId] = { total: 0, urgent: 0, escalated: 0 };
      }
      counts[t.organizationId].total += 1;
      if (t.priority === 'urgent') counts[t.organizationId].urgent += 1;
      if (t.escalation.isEscalated) counts[t.organizationId].escalated += 1;
    });

    return Object.entries(counts)
      .map(([orgId, stats]) => {
        const org = organizations.find((o) => o.id === orgId);
        return {
          orgId,
          name: org?.name || 'Unknown School',
          code: org?.code || orgId,
          ...stats,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [supportTickets, organizations]);

  // Export handlers
  const handleExportTickets = () => {
    const csv = exportTicketsToCsv(relevantTickets, organizations);
    downloadFile(csv, `support-tickets-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportCsat = () => {
    const csv = exportCsatToCsv(csatRecords, organizations);
    downloadFile(csv, `csat-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Org Filter Bar */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Support Operations & Escalation Analytics</h3>
            <p className="text-muted-foreground">
              Dynamic operational reporting synthesized from the current platform demonstration dataset.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
          >
            <option value="all">All School Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.code})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportTickets}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-medium"
          >
            <Download className="w-3.5 h-3.5" /> Export Data
          </button>
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
            Total Tickets
          </span>
          <span className="text-2xl font-black text-foreground">{totalVolume}</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
            Active Open
          </span>
          <span className="text-2xl font-black text-primary">{openTickets.length}</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
            Avg First Response
          </span>
          <span className="text-2xl font-black text-foreground">
            {avgFirstResponseMinutes !== null ? formatMinutesDuration(avgFirstResponseMinutes) : '--'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
            Avg Resolution
          </span>
          <span className="text-2xl font-black text-foreground">
            {avgResolutionHours !== null ? formatHoursDuration(avgResolutionHours) : '--'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
            SLA Compliance
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {slaComplianceRate}%
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
            Escalation Rate
          </span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {escalationRate}%
          </span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Ticket Volume by Priority */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-primary" /> Tickets by Priority
          </h4>
          <div className="space-y-2">
            {[
              { label: 'Urgent', count: priorityCounts.urgent, color: 'bg-rose-500' },
              { label: 'High', count: priorityCounts.high, color: 'bg-amber-500' },
              { label: 'Normal', count: priorityCounts.normal, color: 'bg-blue-500' },
              { label: 'Low', count: priorityCounts.low, color: 'bg-slate-400' },
            ].map((p) => {
              const pct = totalVolume > 0 ? Math.round((p.count / totalVolume) * 100) : 0;
              return (
                <div key={p.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-foreground">{p.label}</span>
                    <span className="text-muted-foreground">
                      {p.count} tickets ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ticket Volume by Status */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" /> Tickets by Lifecycle Status
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {Object.entries(statusCounts).map(([statusKey, count]) => (
              <div
                key={statusKey}
                className="p-2.5 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between"
              >
                <span className="capitalize text-muted-foreground">{statusKey.replace('_', ' ')}</span>
                <span className="font-bold text-foreground font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Problem Categories */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-primary" /> Top Support Categories
          </h4>
          <div className="space-y-2">
            {categoryCounts.slice(0, 5).map(([catKey, count]) => {
              const catObj = SUPPORT_CATEGORIES.find((c) => c.key === catKey);
              const pct = totalVolume > 0 ? Math.round((count / totalVolume) * 100) : 0;
              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-foreground truncate max-w-[200px]">
                      {catObj ? catObj.label : catKey}
                    </span>
                    <span className="text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workload by Support Team Queue */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" /> Workload by Team Queue
          </h4>
          <div className="space-y-2">
            {teamWorkload.map((team) => {
              const pct = totalVolume > 0 ? Math.round((team.count / totalVolume) * 100) : 0;
              return (
                <div key={team.name} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-foreground">{team.name}</span>
                    <span className="text-muted-foreground">
                      {team.count} tickets ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Repeated Issues by School / Organization */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-primary" /> Repeated Support Issues by School Organization
          </h4>
          <span className="text-[11px] text-muted-foreground">Identifies potential systemic onboarding friction</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-2 px-3">School Name</th>
                <th className="py-2 px-3">Code</th>
                <th className="py-2 px-3">Total Tickets</th>
                <th className="py-2 px-3">Urgent Issues</th>
                <th className="py-2 px-3">Escalated Cases</th>
                <th className="py-2 px-3 text-right">Support Intensity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {schoolIssueRankings.slice(0, 6).map((item) => (
                <tr key={item.orgId} className="hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-medium text-foreground">{item.name}</td>
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">{item.code}</td>
                  <td className="py-2.5 px-3 font-bold text-foreground">{item.total}</td>
                  <td className="py-2.5 px-3">
                    {item.urgent > 0 ? (
                      <span className="font-bold text-rose-600 dark:text-rose-400">{item.urgent} urgent</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {item.escalated > 0 ? (
                      <span className="font-bold text-amber-600 dark:text-amber-400">{item.escalated} esc</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.total >= 3
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : item.total >= 2
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {item.total >= 3 ? 'HIGH LOAD' : item.total >= 2 ? 'MODERATE' : 'NORMAL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
