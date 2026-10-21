'use client';

import React, { useMemo, useState } from 'react';
import { AuditEvent, AuditEventCategory } from '@/lib/types/audit-logs';
import { Badge } from '@/components/ui/Badge';
import { formatDate, getInitials } from '@/lib/utils/formatters';
import {
  Building2,
  CreditCard,
  Users2,
  Sliders,
  Sparkles,
  ShieldAlert,
  Layers,
  BookOpen,
  FileCheck,
  Archive,
  CheckCircle,
  Download,
  Eye,
  Filter,
} from 'lucide-react';

interface AdminActivityTimelineProps {
  events: AuditEvent[];
  onInspectEvent: (event: AuditEvent) => void;
}

export function AdminActivityTimeline({
  events,
  onInspectEvent,
}: AdminActivityTimelineProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timelineSearch, setTimelineSearch] = useState('');

  const filteredTimelineEvents = useMemo(() => {
    return events.filter((e) => {
      if (selectedCategory !== 'all' && e.category !== selectedCategory) {
        return false;
      }
      if (timelineSearch.trim()) {
        const q = timelineSearch.toLowerCase().trim();
        const matches =
          e.action.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q) ||
          e.actor.name.toLowerCase().includes(q) ||
          e.targetEntity.toLowerCase().includes(q) ||
          (e.targetName && e.targetName.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [events, selectedCategory, timelineSearch]);

  // Group events by day
  const groupedEvents = useMemo(() => {
    const groups: Record<string, AuditEvent[]> = {};
    for (const evt of filteredTimelineEvents) {
      const dateKey = evt.timestamp.slice(0, 10);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(evt);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTimelineEvents]);

  const getCategoryIcon = (category: AuditEventCategory) => {
    switch (category) {
      case 'organization_lifecycle':
        return <Building2 className="w-3.5 h-3.5 text-blue-500" />;
      case 'subscription_billing':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-500" />;
      case 'platform_access':
        return <Users2 className="w-3.5 h-3.5 text-purple-500" />;
      case 'system_configuration':
        return <Sliders className="w-3.5 h-3.5 text-indigo-500" />;
      case 'feature_toggles':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'security':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
      case 'module_entitlements':
        return <Layers className="w-3.5 h-3.5 text-teal-500" />;
      case 'academic_governance':
        return <BookOpen className="w-3.5 h-3.5 text-sky-500" />;
      case 'examination_governance':
        return <FileCheck className="w-3.5 h-3.5 text-cyan-500" />;
      case 'data_retention':
        return <Archive className="w-3.5 h-3.5 text-orange-500" />;
      case 'compliance_governance':
        return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      case 'data_export':
        return <Download className="w-3.5 h-3.5 text-violet-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card rounded-xl border border-border shadow-2xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold text-foreground">Timeline Filters</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-lg border border-border bg-muted px-2.5 py-1 text-foreground focus:outline-none"
          >
            <option value="all">All Domain Categories</option>
            <option value="organization_lifecycle">Organization Lifecycle</option>
            <option value="subscription_billing">Subscription & Billing</option>
            <option value="platform_access">Platform IAM & Access</option>
            <option value="module_entitlements">Module Entitlements</option>
            <option value="system_configuration">System Configuration</option>
            <option value="security">Security Events</option>
            <option value="examination_governance">Examination Governance</option>
            <option value="academic_governance">Academic Governance</option>
            <option value="data_retention">Data Retention & Holds</option>
            <option value="compliance_governance">Compliance Governance</option>
            <option value="data_export">Data Export Activity</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search timeline..."
            value={timelineSearch}
            onChange={(e) => setTimelineSearch(e.target.value)}
            className="text-xs rounded-lg border border-border bg-muted px-3 py-1 text-foreground placeholder:text-muted-foreground focus:outline-none w-48 sm:w-64"
          />
          <span className="text-[11px] text-muted-foreground font-mono">
            {filteredTimelineEvents.length} events
          </span>
        </div>
      </div>

      {/* Timeline Content */}
      {groupedEvents.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-xl border border-border text-muted-foreground text-xs">
          No administrative activity events match the selected timeline filters.
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map(([dateKey, dayEvents]) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider bg-muted px-3 py-1 rounded-full border border-border">
                  {new Date(dateKey).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div className="flex-1 border-t border-border" />
                <span className="text-[11px] text-muted-foreground font-mono">
                  {dayEvents.length} {dayEvents.length === 1 ? 'action' : 'actions'}
                </span>
              </div>

              {/* Day Events Roster */}
              <div className="space-y-2.5 pl-2 sm:pl-4 border-l-2 border-border/80 ml-4">
                {dayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="group relative bg-card p-3 rounded-xl border border-border hover:border-primary/40 hover:shadow-2xs transition-all space-y-2 text-xs"
                  >
                    {/* Event Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-muted border border-border shrink-0">
                          {getCategoryIcon(evt.category)}
                        </div>
                        <span className="font-mono font-bold text-foreground text-xs">
                          {evt.action}
                        </span>
                        <Badge
                          variant={
                            evt.severity === 'critical'
                              ? 'error'
                              : evt.severity === 'warning'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {evt.severity}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {formatDate(evt.timestamp, true)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onInspectEvent(evt)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-[11px]"
                          title="Inspect Audit Record"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </div>

                    {/* Narrative Description */}
                    <p className="text-foreground/90 text-xs leading-relaxed">
                      {evt.details}
                    </p>

                    {/* Metadata Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-border/60 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                          {getInitials(evt.actor.name)}
                        </div>
                        <span className="text-foreground font-medium">{evt.actor.name}</span>
                        <span className="font-mono text-[10px]">({evt.actor.role})</span>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-[10px]">
                        <span>
                          Target: <strong className="text-foreground">{evt.targetEntity}</strong> ({evt.targetName || evt.targetId})
                        </span>
                        {evt.organizationId && (
                          <span className="px-1.5 py-0.2 rounded bg-muted text-foreground">
                            Org: {evt.organizationId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
