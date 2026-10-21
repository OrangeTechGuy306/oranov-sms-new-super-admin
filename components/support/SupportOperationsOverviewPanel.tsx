'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  Inbox,
  UserX,
  AlertOctagon,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Timer,
  Star,
  Users,
  Building2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Filter,
} from 'lucide-react';
import { formatMinutesDuration, formatHoursDuration } from '@/lib/support/evaluator';

interface SupportOperationsOverviewPanelProps {
  onNavigateTab: (tabId: string, filter?: Record<string, string | boolean>) => void;
  currentActorId: string;
  onChangeActor: (actorId: string) => void;
}

export function SupportOperationsOverviewPanel({
  onNavigateTab,
  currentActorId,
  onChangeActor,
}: SupportOperationsOverviewPanelProps) {
  const {
    getSupportMetrics,
    supportTickets,
    supportTeams,
    platformUsers,
    csatRecords,
  } = usePlatformStore();

  const metrics = getSupportMetrics();
  const currentActor = platformUsers.find((u) => u.id === currentActorId) || platformUsers[0];

  const myAssignedTickets = supportTickets.filter(
    (t) =>
      t.assignedOperatorId === currentActorId &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
  );

  return (
    <div className="space-y-6">
      {/* Operator Context Switcher Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-primary/20 text-primary shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-foreground">Current Operator Perspective: </span>
            <span className="font-bold text-primary">{currentActor?.name}</span>
            <span className="text-muted-foreground ml-1.5">
              ({currentActor?.role} • {currentActor?.department})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="actorSelect" className="text-muted-foreground font-medium">
            Switch View Actor:
          </label>
          <select
            id="actorSelect"
            value={currentActorId}
            onChange={(e) => onChangeActor(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
          >
            {platformUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onNavigateTab('tickets', { assignedOperatorId: currentActorId })}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-2xs"
          >
            My Work ({myAssignedTickets.length})
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (10 Core Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Open Tickets */}
        <div
          onClick={() => onNavigateTab('tickets', { status: 'open' })}
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Total Open</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">{metrics.openTickets}</div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>of {metrics.totalTickets} total tickets</span>
            <span className="text-primary group-hover:underline">View →</span>
          </p>
        </div>

        {/* Unassigned Work */}
        <div
          onClick={() => onNavigateTab('tickets', { assignedOperatorId: 'unassigned' })}
          className="p-4 rounded-xl border border-border bg-card hover:border-amber-500/50 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Unassigned</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
            {metrics.unassignedTickets}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>Requires triage</span>
            <span className="text-amber-600 dark:text-amber-400 group-hover:underline">Assign →</span>
          </p>
        </div>

        {/* Urgent & High Priority */}
        <div
          onClick={() => onNavigateTab('tickets', { priority: 'urgent' })}
          className="p-4 rounded-xl border border-border bg-card hover:border-red-500/50 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Urgent Priority</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 group-hover:scale-105 transition-transform">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 tracking-tight">
            {metrics.urgentTickets}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>{metrics.highPriorityTickets} high priority</span>
            <span className="text-red-600 dark:text-red-400 group-hover:underline">Filter →</span>
          </p>
        </div>

        {/* SLA at Risk */}
        <div
          onClick={() => onNavigateTab('tickets', { slaState: 'approaching_target' })}
          className="p-4 rounded-xl border border-border bg-card hover:border-amber-500/50 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">SLA At Risk</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
            {metrics.slaAtRiskTickets}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>&gt;75% time elapsed</span>
            <span className="text-amber-600 dark:text-amber-400 group-hover:underline">Inspect →</span>
          </p>
        </div>

        {/* SLA Breached */}
        <div
          onClick={() => onNavigateTab('tickets', { slaState: 'breached' })}
          className="p-4 rounded-xl border border-border bg-card hover:border-red-500/50 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">SLA Breached</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 tracking-tight">
            {metrics.slaBreachedTickets}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>Target exceeded</span>
            <span className="text-red-600 dark:text-red-400 group-hover:underline">Review →</span>
          </p>
        </div>

        {/* Escalated Cases */}
        <div
          onClick={() => onNavigateTab('tickets', { isEscalated: true })}
          className="p-4 rounded-xl border border-border bg-card hover:border-purple-500/50 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Escalated Cases</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 tracking-tight">
            {metrics.escalatedTickets}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>Tier-2 / Engineering</span>
            <span className="text-purple-600 dark:text-purple-400 group-hover:underline">Track →</span>
          </p>
        </div>

        {/* Awaiting Responses */}
        <div
          onClick={() => onNavigateTab('tickets', { status: 'awaiting_tenant' })}
          className="p-4 rounded-xl border border-border bg-card hover:border-blue-500/50 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Awaiting Reply</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {metrics.awaitingTenantTickets + metrics.awaitingInternalTickets}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {metrics.awaitingTenantTickets} school • {metrics.awaitingInternalTickets} internal
          </p>
        </div>

        {/* Recently Resolved */}
        <div
          onClick={() => onNavigateTab('tickets', { status: 'resolved' })}
          className="p-4 rounded-xl border border-border bg-card hover:border-emerald-500/50 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Resolved / Closed</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {metrics.recentlyResolvedTickets}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>Completed issues</span>
            <span className="text-emerald-600 dark:text-emerald-400 group-hover:underline">View →</span>
          </p>
        </div>

        {/* Average First Response Time */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Avg First Response</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {metrics.avgFirstResponseMinutes !== null
              ? formatMinutesDuration(metrics.avgFirstResponseMinutes)
              : 'N/A'}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Across responded tickets
          </p>
        </div>

        {/* Customer Satisfaction (CSAT) */}
        <div
          onClick={() => onNavigateTab('csat')}
          className="p-4 rounded-xl border border-border bg-card hover:border-amber-500/50 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Satisfaction (CSAT)</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
              <Star className="w-4 h-4 fill-amber-500/30" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground tracking-tight flex items-baseline gap-1">
            <span>{metrics.averageCsat !== null ? metrics.averageCsat.toFixed(1) : 'N/A'}</span>
            <span className="text-xs text-muted-foreground font-normal">/ 5.0</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>{metrics.totalCsatResponses} responses ({metrics.satisfactionRatePercent ?? 0}% pos.)</span>
            <span className="text-amber-600 dark:text-amber-400 group-hover:underline">Feed →</span>
          </p>
        </div>
      </div>

      {/* Team Queues & Routing Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Support Team Queues & Workload Distribution
            </h4>
            <p className="text-xs text-muted-foreground">
              Functional support queues routing incoming tickets across technical and operational specialties.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('tickets')}
            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
          >
            View All Queues in Registry <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {supportTeams.map((team) => {
            const teamTickets = supportTickets.filter(
              (t) =>
                t.assignedTeamId === team.id &&
                t.status !== 'resolved' &&
                t.status !== 'closed'
            );
            const urgentCount = teamTickets.filter((t) => t.priority === 'urgent').length;
            const leadUser = platformUsers.find((u) => u.id === team.leadOperatorId);

            return (
              <div
                key={team.id}
                onClick={() => onNavigateTab('tickets', { assignedTeamId: team.id })}
                className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                      {team.code}
                    </span>
                    <h5 className="font-semibold text-sm text-foreground mt-1 group-hover:text-primary transition-colors">
                      {team.name}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground">
                      {teamTickets.length}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">active tickets</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {team.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-[11px]">
                  <span className="text-muted-foreground">
                    Lead: <strong className="text-foreground">{leadUser?.name || 'Assigned Lead'}</strong>
                  </span>
                  {urgentCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      {urgentCount} Urgent
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Normal triage
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
