'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useOptionalPlatformAuth } from '@/components/providers/PlatformAuthContext';
import {
  OperationalQueueId,
  OperationalQueueItem,
  queryOperationalQueue,
} from '@/lib/operations/queues';
import { SubscriptionPlan } from '@/lib/types/subscriptions';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/formatters';
import {
  Search,
  Filter,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertOctagon,
  UserPlus,
  PauseCircle,
  Ban,
  LifeBuoy,
  CheckSquare,
  SlidersHorizontal,
} from 'lucide-react';

interface PlatformOperationsQueuesProps {
  queues: Record<OperationalQueueId, OperationalQueueItem[]>;
  plans: SubscriptionPlan[];
}

const QUEUE_META: Array<{
  id: OperationalQueueId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'new_registrations',
    label: 'New Registrations',
    description: 'Draft and newly registered organizations awaiting intake review.',
    icon: UserPlus,
  },
  {
    id: 'pending_reviews',
    label: 'Pending Reviews',
    description: 'Organizations in registration_pending or awaiting_configuration hold.',
    icon: Clock,
  },
  {
    id: 'incomplete_onboarding',
    label: 'Incomplete Onboarding',
    description: 'Schools actively working through mandatory onboarding readiness items.',
    icon: SlidersHorizontal,
  },
  {
    id: 'awaiting_activation',
    label: 'Awaiting Activation',
    description: 'Readiness complete — queued for formal launch approval & activation.',
    icon: CheckCircle2,
  },
  {
    id: 'provisioning_exceptions',
    label: 'Provisioning Exceptions',
    description: 'Failed, review-held, or blocked simulated provisioning preparations.',
    icon: AlertOctagon,
  },
  {
    id: 'subscription_exceptions',
    label: 'Subscription Exceptions',
    description: 'Past-due, expired, overdue, or failed billing/payment discrepancies.',
    icon: ShieldAlert,
  },
  {
    id: 'suspended_organizations',
    label: 'Suspended Orgs',
    description: 'Institutions locked pending administrative or billing compliance.',
    icon: PauseCircle,
  },
  {
    id: 'cancellation_requests',
    label: 'Cancellation Requests',
    description: 'Organizations in cancellation_pending offboarding wind-down period.',
    icon: Ban,
  },
  {
    id: 'unresolved_support_cases',
    label: 'Unresolved Support',
    description: 'Open, assigned, escalated, awaiting, or reopened tenant support cases.',
    icon: LifeBuoy,
  },
  {
    id: 'administrative_approvals',
    label: 'Admin Approvals',
    description: 'Pending governance sign-offs requiring non-requester review.',
    icon: CheckSquare,
  },
];

export function PlatformOperationsQueues({ queues, plans }: PlatformOperationsQueuesProps) {
  const auth = useOptionalPlatformAuth();
  const visibleQueues = useMemo(() => {
    if (!auth) return QUEUE_META;
    return QUEUE_META.filter((q) => {
      switch (q.id) {
        case 'unresolved_support_cases':
          return auth.can('support.tickets.read');
        case 'administrative_approvals':
          return auth.can('operations.approvals.read');
        case 'subscription_exceptions':
          return auth.can('billing.subscriptions.read') || auth.can('operations.exceptions.read');
        case 'provisioning_exceptions':
          return auth.can('operations.exceptions.read') || auth.can('tenants.readiness.evaluate');
        default:
          return auth.can('organizations.read');
      }
    });
  }, [auth]);

  const [selectedQueue, setSelectedQueue] = useState<OperationalQueueId>('awaiting_activation');
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [planId, setPlanId] = useState('all');
  const [sortBy, setSortBy] = useState<'priority_desc' | 'date_desc' | 'date_asc' | 'name_asc'>('priority_desc');
  const [page, setPage] = useState(1);

  const effectiveQueue = visibleQueues.some((q) => q.id === selectedQueue)
    ? selectedQueue
    : visibleQueues[0]?.id || 'awaiting_activation';
  const activeMeta = visibleQueues.find((q) => q.id === effectiveQueue) || visibleQueues[0] || QUEUE_META[0];
  const rawItems = visibleQueues.length > 0 ? queues[effectiveQueue] || [] : [];

  const result = useMemo(
    () =>
      queryOperationalQueue(rawItems, {
        search,
        severity,
        planId,
        sortBy,
        page,
        pageSize: 6,
      }),
    [rawItems, search, severity, planId, sortBy, page]
  );

  const selectQueue = (id: OperationalQueueId) => {
    setSelectedQueue(id);
    setPage(1);
  };

  const severityStyles: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
    high: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    medium: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
    low: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border shadow-xs p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Platform Operational Action Queues (10 Specialized Workflows)
          </h3>
          <p className="text-xs text-muted-foreground">
            Independent queues separated cleanly across lifecycle, provisioning, subscription, support, and governance approval states.
          </p>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          Frontend Mock Workbench
        </span>
      </div>

      {/* Queue Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {visibleQueues.map((q) => {
          const Icon = q.icon;
          const count = (queues[q.id] || []).length;
          const isSelected = q.id === effectiveQueue;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => selectQueue(q.id)}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left text-xs transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary font-semibold shadow-2xs'
                  : 'border-border bg-background hover:bg-muted/60 text-foreground'
              }`}
            >
              <span className="flex items-center gap-1.5 min-w-0 truncate">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{q.label}</span>
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  count > 0
                    ? isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                    : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Filter ${activeMeta.label.toLowerCase()} by org, code, status, or reference...`}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value as any);
              setPage(1);
            }}
            aria-label="Filter queue by severity"
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={planId}
            onChange={(e) => {
              setPlanId(e.target.value);
              setPage(1);
            }}
            aria-label="Filter queue by plan tier"
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
          >
            <option value="all">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort operational queue"
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
          >
            <option value="priority_desc">Sort: Highest Severity</option>
            <option value="date_desc">Sort: Most Recent</option>
            <option value="date_asc">Sort: Oldest First</option>
            <option value="name_asc">Sort: Organization Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Queue Header Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/50">
        <span>{activeMeta.description}</span>
        <span className="font-mono font-medium text-foreground">
          Showing {result.items.length} of {result.totalItems} item(s)
        </span>
      </div>

      {/* Queue List */}
      {result.items.length === 0 ? (
        <div className="py-10 text-center text-xs text-muted-foreground space-y-1.5 border border-dashed border-border rounded-lg">
          <Inbox className="w-6 h-6 mx-auto text-muted-foreground/60" />
          <p className="font-medium text-foreground">No items match this queue view</p>
          <p>Adjust search/severity filters or switch operational queues above.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/50 border border-border rounded-lg overflow-hidden">
          {result.items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-background hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      severityStyles[item.severity] || severityStyles.medium
                    }`}
                  >
                    {item.severity}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                    {item.organizationCode}
                  </span>
                  <Badge status={item.statusBadge} size="sm" />
                  {item.planName && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      {item.planName}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-muted-foreground font-mono hidden md:inline">
                  {formatDate(item.updatedAt)}
                </span>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors"
                >
                  {item.actionLabel}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
          <span>
            Page {result.page} of {result.totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={result.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <button
              type="button"
              disabled={result.page >= result.totalPages}
              onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
