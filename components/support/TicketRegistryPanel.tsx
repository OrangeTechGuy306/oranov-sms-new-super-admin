'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  SupportTicket,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportCategoryKey,
  SlaEvaluationResult,
} from '@/lib/types/support-desk';
import { SUPPORT_CATEGORIES } from '@/lib/support/fixtures';
import { evaluateTicketSla, formatMinutesDuration } from '@/lib/support/evaluator';
import { exportTicketsToCsv } from '@/lib/support/exporter';
import { CreateTicketModal } from './CreateTicketModal';
import { TicketDetailDrawer } from './TicketDetailDrawer';
import { StatusTransitionModal } from './StatusTransitionModal';
import { AssignTicketModal } from './AssignTicketModal';
import { EscalateTicketModal } from './EscalateTicketModal';
import {
  Search,
  Filter,
  Plus,
  Download,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  UserX,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
  ArrowUpRight,
  Building2,
  Tag,
  User,
  MoreVertical,
  Check,
  Eye,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface TicketRegistryPanelProps {
  currentActorId: string;
  initialFilters?: {
    status?: string;
    priority?: string;
    category?: string;
    assignedOperatorId?: string;
    assignedTeamId?: string;
    isEscalated?: boolean;
    slaState?: string;
    organizationId?: string;
  };
}

export function TicketRegistryPanel({ currentActorId, initialFilters }: TicketRegistryPanelProps) {
  const {
    supportTickets,
    organizations,
    platformUsers,
    supportTeams,
    slaPolicies,
  } = usePlatformStore();

  // Active quick-view tab
  const [quickView, setQuickView] = useState<string>('all');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters?.status || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>(initialFilters?.priority || 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialFilters?.category || 'all');
  const [orgFilter, setOrgFilter] = useState<string>(initialFilters?.organizationId || 'all');
  const [teamFilter, setTeamFilter] = useState<string>(initialFilters?.assignedTeamId || 'all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>(initialFilters?.assignedOperatorId || 'all');
  const [slaFilter, setSlaFilter] = useState<string>(initialFilters?.slaState || 'all');
  const [escalatedFilter, setEscalatedFilter] = useState<string>(
    initialFilters?.isEscalated !== undefined ? (initialFilters.isEscalated ? 'yes' : 'no') : 'all'
  );

  // Sorting and Pagination
  const [sortField, setSortField] = useState<'updatedAt' | 'createdAt' | 'priority'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [statusModalTicket, setStatusModalTicket] = useState<SupportTicket | null>(null);
  const [assignModalTicket, setAssignModalTicket] = useState<SupportTicket | null>(null);
  const [escalateModalTicket, setEscalateModalTicket] = useState<SupportTicket | null>(null);

  // Reset all filters
  const resetFilters = () => {
    setQuickView('all');
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setOrgFilter('all');
    setTeamFilter('all');
    setAssigneeFilter('all');
    setSlaFilter('all');
    setEscalatedFilter('all');
    setCurrentPage(1);
  };

  // Evaluate SLA lookup map
  const slaEvaluations = useMemo(() => {
    const map = new Map<string, SlaEvaluationResult>();
    supportTickets.forEach((ticket) => {
      const policy = slaPolicies.find((p) => p.id === ticket.slaPolicyId) || slaPolicies[0];
      if (policy) {
        map.set(ticket.id, evaluateTicketSla(ticket, policy));
      }
    });
    return map;
  }, [supportTickets, slaPolicies]);

  // Quick view switcher helper
  const handleSelectQuickView = (view: string) => {
    setQuickView(view);
    setCurrentPage(1);
    if (view === 'all') {
      setStatusFilter('all');
      setPriorityFilter('all');
      setAssigneeFilter('all');
      setSlaFilter('all');
      setEscalatedFilter('all');
    } else if (view === 'my_assigned') {
      setStatusFilter('all');
      setAssigneeFilter(currentActorId);
      setSlaFilter('all');
      setEscalatedFilter('all');
    } else if (view === 'unassigned') {
      setStatusFilter('all');
      setAssigneeFilter('unassigned');
      setSlaFilter('all');
      setEscalatedFilter('all');
    } else if (view === 'high_urgent') {
      setPriorityFilter('high_or_urgent');
      setAssigneeFilter('all');
      setSlaFilter('all');
      setEscalatedFilter('all');
    } else if (view === 'awaiting_tenant') {
      setStatusFilter('awaiting_tenant');
      setAssigneeFilter('all');
      setSlaFilter('all');
      setEscalatedFilter('all');
    } else if (view === 'sla_risk') {
      setStatusFilter('all');
      setAssigneeFilter('all');
      setSlaFilter('risk_or_breached');
      setEscalatedFilter('all');
    } else if (view === 'escalated') {
      setStatusFilter('all');
      setAssigneeFilter('all');
      setSlaFilter('all');
      setEscalatedFilter('yes');
    } else if (view === 'resolved') {
      setStatusFilter('resolved_or_closed');
      setAssigneeFilter('all');
      setSlaFilter('all');
      setEscalatedFilter('all');
    }
  };

  // Filter and Sort tickets
  const filteredTickets = useMemo(() => {
    return supportTickets.filter((ticket) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const org = organizations.find((o) => o.id === ticket.organizationId);
        const matchId = ticket.id.toLowerCase().includes(query) || ticket.ticketNumber.toLowerCase().includes(query);
        const matchSubject = ticket.subject.toLowerCase().includes(query);
        const matchDesc = ticket.description.toLowerCase().includes(query);
        const matchRequester = ticket.requester.name.toLowerCase().includes(query) || ticket.requester.email.toLowerCase().includes(query);
        const matchOrg = org ? (org.name.toLowerCase().includes(query) || org.code.toLowerCase().includes(query)) : false;

        if (!matchId && !matchSubject && !matchDesc && !matchRequester && !matchOrg) {
          return false;
        }
      }

      // Organization filter
      if (orgFilter !== 'all' && ticket.organizationId !== orgFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'resolved_or_closed') {
        if (ticket.status !== 'resolved' && ticket.status !== 'closed') return false;
      } else if (statusFilter !== 'all' && ticket.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter === 'high_or_urgent') {
        if (ticket.priority !== 'high' && ticket.priority !== 'urgent') return false;
      } else if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && ticket.category !== categoryFilter) {
        return false;
      }

      // Team filter
      if (teamFilter !== 'all' && ticket.assignedTeamId !== teamFilter) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter === 'unassigned') {
        if (ticket.assignedOperatorId) return false;
      } else if (assigneeFilter !== 'all' && ticket.assignedOperatorId !== assigneeFilter) {
        return false;
      }

      // SLA filter
      const slaResult = slaEvaluations.get(ticket.id);
      if (slaFilter === 'risk_or_breached') {
        if (!slaResult || (slaResult.state !== 'approaching_target' && slaResult.state !== 'breached')) return false;
      } else if (slaFilter !== 'all') {
        if (!slaResult || slaResult.state !== slaFilter) return false;
      }

      // Escalation filter
      const isEscalated = ticket.escalation.isEscalated || ticket.status === 'escalated';
      if (escalatedFilter === 'yes' && !isEscalated) return false;
      if (escalatedFilter === 'no' && isEscalated) return false;

      return true;
    }).sort((a, b) => {
      if (sortField === 'updatedAt') {
        const timeA = new Date(a.updatedAt).getTime();
        const timeB = new Date(b.updatedAt).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      if (sortField === 'createdAt') {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      if (sortField === 'priority') {
        const priorityWeight: Record<SupportTicketPriority, number> = {
          urgent: 4,
          high: 3,
          normal: 2,
          low: 1,
        };
        const weightA = priorityWeight[a.priority];
        const weightB = priorityWeight[b.priority];
        return sortOrder === 'asc' ? weightA - weightB : weightB - weightA;
      }
      return 0;
    });
  }, [
    supportTickets,
    searchTerm,
    orgFilter,
    statusFilter,
    priorityFilter,
    categoryFilter,
    teamFilter,
    assigneeFilter,
    slaFilter,
    escalatedFilter,
    sortField,
    sortOrder,
    slaEvaluations,
    organizations,
  ]);

  // Pagination calculation
  const totalRecords = filteredTickets.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  // Handle Export CSV
  const handleExportCsv = () => {
    const csv = exportTicketsToCsv(filteredTickets, organizations);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `support-tickets-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper for priority badge
  const renderPriorityBadge = (priority: SupportTicketPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-3 h-3" /> Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> High
          </span>
        );
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Clock className="w-3 h-3" /> Normal
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <CheckCircle2 className="w-3 h-3" /> Low
          </span>
        );
    }
  };

  // Helper for status badge
  const renderStatusBadge = (status: SupportTicketStatus, isEscalated: boolean) => {
    if (isEscalated && status !== 'resolved' && status !== 'closed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
          <ShieldAlert className="w-3 h-3 animate-pulse" /> Escalated
        </span>
      );
    }

    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            New
          </span>
        );
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            In Progress
          </span>
        );
      case 'awaiting_tenant':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Awaiting Tenant
          </span>
        );
      case 'awaiting_internal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            Awaiting Internal
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Escalated
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Resolved
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            Closed
          </span>
        );
    }
  };

  // Helper for SLA state badge
  const renderSlaBadge = (slaResult?: SlaEvaluationResult) => {
    if (!slaResult) {
      return <span className="text-xs text-muted-foreground">--</span>;
    }

    if (slaResult.state === 'breached') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30" title={slaResult.explanation}>
          <AlertOctagon className="w-3 h-3" /> Breached
        </span>
      );
    }

    if (slaResult.state === 'approaching_target') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" title={slaResult.explanation}>
          <Clock className="w-3 h-3 animate-pulse" /> At Risk
        </span>
      );
    }

    if (slaResult.state === 'paused') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20" title={slaResult.explanation}>
          Paused
        </span>
      );
    }

    if (slaResult.state === 'within_target') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" title={slaResult.explanation}>
          <CheckCircle2 className="w-3 h-3" /> On Track
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-muted-foreground border border-border">
        {slaResult.state}
      </span>
    );
  };

  // Helper for Category label
  const getCategoryLabel = (catKey: SupportCategoryKey) => {
    const found = SUPPORT_CATEGORIES.find((c) => c.key === catKey);
    return found ? found.label : catKey;
  };

  return (
    <div className="space-y-4">
      {/* Top Action & View Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Quick View Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-medium">
          <button
            onClick={() => handleSelectQuickView('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              quickView === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            All ({supportTickets.length})
          </button>
          <button
            onClick={() => handleSelectQuickView('my_assigned')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              quickView === 'my_assigned'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            My Queue
          </button>
          <button
            onClick={() => handleSelectQuickView('unassigned')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              quickView === 'unassigned'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            Unassigned
          </button>
          <button
            onClick={() => handleSelectQuickView('high_urgent')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              quickView === 'high_urgent'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            High & Urgent
          </button>
          <button
            onClick={() => handleSelectQuickView('sla_risk')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              quickView === 'sla_risk'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            SLA at Risk / Breached
          </button>
          <button
            onClick={() => handleSelectQuickView('escalated')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              quickView === 'escalated'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            Escalated
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
            title="Export filtered records to safe CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Filter and Search Card */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search ID, subject, school, requester..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Org Filter */}
          <div>
            <select
              value={orgFilter}
              onChange={(e) => {
                setOrgFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_tenant">Awaiting Tenant</option>
              <option value="awaiting_internal">Awaiting Internal</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {SUPPORT_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row of Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1 border-t border-border/40 text-xs">
          {/* Team Filter */}
          <div>
            <label className="text-[10px] text-muted-foreground block mb-0.5">Team Queue</label>
            <select
              value={teamFilter}
              onChange={(e) => {
                setTeamFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Queues</option>
              {supportTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="text-[10px] text-muted-foreground block mb-0.5">Assigned Operator</label>
            <select
              value={assigneeFilter}
              onChange={(e) => {
                setAssigneeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Operators</option>
              <option value="unassigned">Unassigned Only</option>
              {platformUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          {/* SLA Filter */}
          <div>
            <label className="text-[10px] text-muted-foreground block mb-0.5">SLA Target State</label>
            <select
              value={slaFilter}
              onChange={(e) => {
                setSlaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All SLA States</option>
              <option value="within_target">Within Target</option>
              <option value="approaching_target">Approaching (At Risk)</option>
              <option value="breached">Breached</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* Escalation Filter */}
          <div>
            <label className="text-[10px] text-muted-foreground block mb-0.5">Escalation State</label>
            <select
              value={escalatedFilter}
              onChange={(e) => {
                setEscalatedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Tickets</option>
              <option value="yes">Escalated Only</option>
              <option value="no">Non-Escalated</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] text-muted-foreground block mb-0.5">Sort Order</label>
            <div className="flex gap-1">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="w-full px-2 py-1 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="updatedAt">Updated</option>
                <option value="createdAt">Created</option>
                <option value="priority">Priority</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 border border-border rounded bg-muted/50 hover:bg-muted text-[11px] font-semibold"
                title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                {sortOrder.toUpperCase()}
              </button>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full py-1 text-xs rounded border border-dashed border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table Card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Ticket</th>
                <th className="py-2.5 px-3">School / Organization</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Assigned Queue & Operator</th>
                <th className="py-2.5 px-3">SLA Status</th>
                <th className="py-2.5 px-3">Updated</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <HelpCircle className="w-8 h-8 mx-auto text-muted-foreground/60" />
                      <p className="font-medium text-foreground">No support tickets found</p>
                      <p className="text-xs">No tickets match your active filter criteria or search query.</p>
                      <button
                        onClick={resetFilters}
                        className="mt-2 text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket) => {
                  const org = organizations.find((o) => o.id === ticket.organizationId);
                  const operator = platformUsers.find((u) => u.id === ticket.assignedOperatorId);
                  const team = supportTeams.find((t) => t.id === ticket.assignedTeamId);
                  const sla = slaEvaluations.get(ticket.id);
                  const isEscalated = ticket.escalation.isEscalated || ticket.status === 'escalated';

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedTicketId(ticket.id);
                        setIsDetailDrawerOpen(true);
                      }}
                    >
                      {/* Ticket # & Subject */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-primary group-hover:underline">
                            {ticket.ticketNumber}
                            {isEscalated && (
                              <span className="p-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400" title="Escalated">
                                <ShieldAlert className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-foreground line-clamp-1 max-w-[240px]">
                            {ticket.subject}
                          </p>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <span>by {ticket.requester.name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="py-3 px-3">
                        {org ? (
                          <div className="space-y-0.5">
                            <span className="font-medium text-foreground block line-clamp-1">
                              {org.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                              {org.code}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown Org</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] text-foreground font-medium">
                          <Tag className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[130px]">{getCategoryLabel(ticket.category)}</span>
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">{renderPriorityBadge(ticket.priority)}</td>

                      {/* Status */}
                      <td className="py-3 px-3">{renderStatusBadge(ticket.status, isEscalated)}</td>

                      {/* Assigned Queue & Operator */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <div className="text-[11px] font-medium text-foreground flex items-center gap-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {operator ? operator.name : <span className="text-amber-600 dark:text-amber-400 font-semibold">Unassigned</span>}
                          </div>
                          {team && (
                            <span className="text-[10px] text-muted-foreground block truncate max-w-[140px]">
                              {team.name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* SLA Status */}
                      <td className="py-3 px-3">{renderSlaBadge(sla)}</td>

                      {/* Updated Date */}
                      <td className="py-3 px-3 text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(ticket.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Quick Action Buttons */}
                      <td
                        className="py-3 px-3 text-right"
                        onClick={(e) => e.stopPropagation()} // Prevent row click opening drawer
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedTicketId(ticket.id);
                              setIsDetailDrawerOpen(true);
                            }}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="View Full Detail Workspace"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setStatusModalTicket(ticket)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                            title="Update Lifecycle Status"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setAssignModalTicket(ticket)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                            title="Reassign Operator or Queue"
                          >
                            <User className="w-3.5 h-3.5" />
                          </button>
                          {!isEscalated && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                            <button
                              onClick={() => setEscalateModalTicket(ticket)}
                              className="p-1 rounded hover:bg-muted text-rose-500 hover:text-rose-600 transition-colors"
                              title="Escalate Ticket"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Status Footer */}
        <div className="p-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-foreground">{totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
              <strong className="text-foreground">{Math.min(currentPage * pageSize, totalRecords)}</strong> of{' '}
              <strong className="text-foreground">{totalRecords}</strong> tickets
            </span>
            {filteredTickets.length !== supportTickets.length && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-foreground">
                (filtered from {supportTickets.length} total)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Ticket Detail Drawer */}
      <TicketDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setSelectedTicketId(null);
        }}
        ticketId={selectedTicketId}
      />

      {/* Ticket Intake Modal */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Quick Action Modals */}
      {statusModalTicket && (
        <StatusTransitionModal
          isOpen={!!statusModalTicket}
          onClose={() => setStatusModalTicket(null)}
          ticket={statusModalTicket}
        />
      )}

      {assignModalTicket && (
        <AssignTicketModal
          isOpen={!!assignModalTicket}
          onClose={() => setAssignModalTicket(null)}
          ticket={assignModalTicket}
        />
      )}

      {escalateModalTicket && (
        <EscalateTicketModal
          isOpen={!!escalateModalTicket}
          onClose={() => setEscalateModalTicket(null)}
          ticket={escalateModalTicket}
        />
      )}
    </div>
  );
}
