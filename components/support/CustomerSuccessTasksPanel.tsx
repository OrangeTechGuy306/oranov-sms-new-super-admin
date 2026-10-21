'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  CustomerSuccessTask,
  SupportTicketPriority,
  CreateCsTaskInput,
} from '@/lib/types/support-desk';
import { isOverdueTask } from '@/lib/support/evaluator';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Search,
  Filter,
  Plus,
  Building2,
  User,
  Check,
  X,
  RotateCcw,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface CustomerSuccessTasksPanelProps {
  currentActorId: string;
}

export function CustomerSuccessTasksPanel({ currentActorId }: CustomerSuccessTasksPanelProps) {
  const {
    csTasks,
    organizations,
    platformUsers,
    createCsTask,
    updateCsTask,
    setCsTaskStatus,
    deleteCsTask,
  } = usePlatformStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState<boolean>(false);

  // Create Task Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id || '');
  const [assignedOwnerId, setAssignedOwnerId] = useState(currentActorId);
  const [priority, setPriority] = useState<SupportTicketPriority>('normal');
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [relatedTicketId, setRelatedTicketId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Complete Task Modal state
  const [completeModalTask, setCompleteModalTask] = useState<CustomerSuccessTask | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Metrics
  const totalTasks = csTasks.length;
  const pendingTasks = csTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const overdueTasks = pendingTasks.filter((t) => isOverdueTask(t.dueDate));
  const completedTasks = csTasks.filter((t) => t.status === 'completed');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return csTasks.filter((task) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const org = organizations.find((o) => o.id === task.organizationId);
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = task.description.toLowerCase().includes(query);
        const matchOrg = org ? org.name.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchDesc && !matchOrg) return false;
      }

      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (orgFilter !== 'all' && task.organizationId !== orgFilter) return false;
      if (ownerFilter !== 'all' && task.assignedOwnerId !== ownerFilter) return false;

      if (showOverdueOnly) {
        if (task.status === 'completed' || task.status === 'cancelled') return false;
        if (!isOverdueTask(task.dueDate)) return false;
      }

      return true;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [csTasks, searchTerm, statusFilter, priorityFilter, orgFilter, ownerFilter, showOverdueOnly, organizations]);

  // Create Task Submission
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Task title is required.');
      return;
    }
    if (!dueDate) {
      setFormError('Target due date is required.');
      return;
    }

    const input: CreateCsTaskInput = {
      title: title.trim(),
      description: description.trim(),
      organizationId,
      assignedOwnerId,
      priority,
      dueDate,
      relatedTicketId: relatedTicketId ? relatedTicketId : undefined,
    };

    const res = createCsTask(input);
    if (!res.success) {
      setFormError(res.error || 'Failed to create task');
      return;
    }

    setIsCreateOpen(false);
    setTitle('');
    setDescription('');
  };

  // Complete Task Submission
  const handleConfirmCompletion = () => {
    if (!completeModalTask) return;
    setCsTaskStatus(completeModalTask.id, 'completed', completionNotes.trim() || undefined);
    setCompleteModalTask(null);
    setCompletionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
            Total CS Tasks
          </span>
          <span className="text-xl font-bold text-foreground">{totalTasks}</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
            Active / Pending
          </span>
          <span className="text-xl font-bold text-primary">{pendingTasks.length}</span>
        </div>

        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-1">
            Overdue Targets
          </span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4" />
            {overdueTasks.length}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
            Completed Tasks
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {completedTasks.length}
          </span>
        </div>
      </div>

      {/* Top Filter and Action Bar */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search task title, description, school..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                showOverdueOnly
                  ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" /> Overdue Only ({overdueTasks.length})
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> New Task
            </button>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border/50 text-xs">
          <div>
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded border border-border bg-background"
            >
              <option value="all">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded border border-border bg-background"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded border border-border bg-background"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded border border-border bg-background"
            >
              <option value="all">All Owners</option>
              {platformUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List / Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Task Details</th>
                <th className="py-2.5 px-3">School / Organization</th>
                <th className="py-2.5 px-3">Owner</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Target Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No follow-up tasks match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const org = organizations.find((o) => o.id === task.organizationId);
                  const owner = platformUsers.find((u) => u.id === task.assignedOwnerId);
                  const isOverdue =
                    task.status !== 'completed' && task.status !== 'cancelled' && isOverdueTask(task.dueDate);

                  return (
                    <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                      {/* Task Title & Description */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5 max-w-sm">
                          <span
                            className={`font-semibold text-foreground block ${
                              task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{task.description}</p>
                          {task.completionNotes && (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              Resolution: {task.completionNotes}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="py-3 px-3">
                        {org ? (
                          <div className="space-y-0.5">
                            <span className="font-medium text-foreground block">{org.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground px-1 rounded bg-muted">
                              {org.code}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-3 text-foreground font-medium">
                        {owner ? owner.name : 'Unassigned'}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            task.priority === 'urgent'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : task.priority === 'high'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5 whitespace-nowrap">
                          <span className="font-medium text-foreground">
                            {new Date(task.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {isOverdue && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 block">
                              <AlertOctagon className="w-3 h-3" /> Overdue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                            task.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : task.status === 'in_progress'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : task.status === 'cancelled'
                              ? 'bg-slate-500/10 text-slate-500'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {task.status !== 'completed' && task.status !== 'cancelled' && (
                            <button
                              onClick={() => setCompleteModalTask(task)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 font-semibold text-[11px] transition-colors"
                              title="Mark as Completed"
                            >
                              <Check className="w-3 h-3" /> Complete
                            </button>
                          )}
                          <button
                            onClick={() => deleteCsTask(task.id)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-rose-500 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Create Customer Success Task</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Close
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Target School / Organization</label>
                <select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule CBT Exam Readiness Onboarding Review"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Description / Follow-up Details</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on what needs to be reviewed or completed"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Target Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Assigned CS Owner</label>
                <select
                  value={assignedOwnerId}
                  onChange={(e) => setAssignedOwnerId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background"
                >
                  {platformUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Task Modal */}
      {completeModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Record Task Completion</h3>
              <button
                onClick={() => setCompleteModalTask(null)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-foreground block">{completeModalTask.title}</span>
              <p className="text-muted-foreground">{completeModalTask.description}</p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-medium text-foreground block">
                Resolution Notes / Engagement Outcome
              </label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="e.g. Completed consultation call with school principal; configured question bank CBT permissions."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border text-xs">
              <button
                type="button"
                onClick={() => setCompleteModalTask(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletion}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
