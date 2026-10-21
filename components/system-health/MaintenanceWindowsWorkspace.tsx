'use client';

import React, { useState, useMemo } from 'react';
import {
  MaintenanceWindow,
  MaintenanceStatus,
  OperationalComponent,
  CreateMaintenanceInput,
} from '@/lib/system-health/types';
import {
  validateMaintenanceWindow,
  deriveMaintenanceWindowStatus,
} from '@/lib/system-health/evaluator';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { formatDate } from '@/lib/utils/formatters';
import {
  Wrench,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Edit2,
  Trash2,
  RotateCcw,
  Search,
  Layers,
} from 'lucide-react';

interface MaintenanceWindowsWorkspaceProps {
  maintenanceWindows: MaintenanceWindow[];
  components: OperationalComponent[];
  onCreateWindow: (input: CreateMaintenanceInput) => void;
  onUpdateWindow: (id: string, input: Partial<CreateMaintenanceInput>) => void;
  onCancelWindow: (id: string, reason: string) => void;
}

export function MaintenanceWindowsWorkspace({
  maintenanceWindows,
  components,
  onCreateWindow,
  onUpdateWindow,
  onCancelWindow,
}: MaintenanceWindowsWorkspaceProps) {
  // Tabs & filters
  const [statusFilter, setStatusFilter] = useState<'all' | MaintenanceStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWindow, setEditingWindow] = useState<MaintenanceWindow | null>(null);
  const [cancellingWindow, setCancellingWindow] = useState<MaintenanceWindow | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('2026-10-25T02:00');
  const [endTime, setEndTime] = useState('2026-10-25T04:30');
  const [timeZone, setTimeZone] = useState('UTC');
  const [impactDescription, setImpactDescription] = useState('');
  const [responsibleOperator, setResponsibleOperator] = useState('Alexander Sterling');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Filtered maintenance windows
  const filteredWindows = useMemo(() => {
    return maintenanceWindows.filter((win) => {
      const derivedStatus = deriveMaintenanceWindowStatus(win);
      const matchesStatus =
        statusFilter === 'all' ||
        win.status === statusFilter ||
        (statusFilter === 'in_progress' && derivedStatus === 'in_progress');

      const matchesSearch =
        searchQuery.trim() === '' ||
        win.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        win.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        win.affectedComponents.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [maintenanceWindows, statusFilter, searchQuery]);

  // Aggregate stats
  const scheduledCount = maintenanceWindows.filter((w) => w.status === 'scheduled').length;
  const inProgressCount = maintenanceWindows.filter((w) => w.status === 'in_progress').length;
  const completedCount = maintenanceWindows.filter((w) => w.status === 'completed').length;
  const cancelledCount = maintenanceWindows.filter((w) => w.status === 'cancelled').length;

  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    setSelectedComponents([]);
    setStartTime('2026-10-25T02:00');
    setEndTime('2026-10-25T04:30');
    setTimeZone('UTC');
    setImpactDescription('');
    setResponsibleOperator('Alexander Sterling');
    setFormErrors([]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (win: MaintenanceWindow) => {
    setEditingWindow(win);
    setTitle(win.title);
    setDescription(win.description);
    setSelectedComponents([...win.affectedComponents]);
    setStartTime(win.startTime.slice(0, 16));
    setEndTime(win.endTime.slice(0, 16));
    setTimeZone(win.timeZone);
    setImpactDescription(win.impactDescription);
    setResponsibleOperator(win.responsibleOperator);
    setFormErrors([]);
  };

  const handleSubmitCreate = () => {
    const input: CreateMaintenanceInput = {
      title,
      description,
      affectedComponents: selectedComponents,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      timeZone,
      impactDescription,
      responsibleOperator,
    };

    const validation = validateMaintenanceWindow(input, maintenanceWindows);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    onCreateWindow(input);
    setIsCreateModalOpen(false);
  };

  const handleSubmitEdit = () => {
    if (!editingWindow) return;
    const input: CreateMaintenanceInput = {
      title,
      description,
      affectedComponents: selectedComponents,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      timeZone,
      impactDescription,
      responsibleOperator,
    };

    const validation = validateMaintenanceWindow(input, maintenanceWindows, editingWindow.id);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    onUpdateWindow(editingWindow.id, input);
    setEditingWindow(null);
  };

  const handleConfirmCancel = () => {
    if (!cancellingWindow) return;
    if (!cancellationReason || cancellationReason.trim().length < 5) {
      setFormErrors(['A mandatory cancellation reason (minimum 5 characters) is required.']);
      return;
    }

    onCancelWindow(cancellingWindow.id, cancellationReason.trim());
    setCancellingWindow(null);
    setCancellationReason('');
  };

  const toggleComponentSelection = (compId: string) => {
    if (selectedComponents.includes(compId)) {
      setSelectedComponents(selectedComponents.filter((c) => c !== compId));
    } else {
      setSelectedComponents([...selectedComponents, compId]);
    }
  };

  const getStatusBadge = (win: MaintenanceWindow) => {
    const derived = deriveMaintenanceWindowStatus(win);
    switch (win.status) {
      case 'cancelled':
        return <Badge variant="neutral" size="sm">CANCELLED</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm">COMPLETED</Badge>;
      default:
        if (derived === 'in_progress') {
          return <Badge variant="warning" size="sm" dot>IN PROGRESS</Badge>;
        }
        return <Badge variant="info" size="sm">SCHEDULED</Badge>;
    }
  };

  const columns: Column<MaintenanceWindow>[] = [
    {
      key: 'title',
      header: 'Window & Objectives',
      render: (win) => (
        <div className="space-y-1">
          <span className="font-bold text-xs text-foreground block">{win.title}</span>
          <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-sm">
            {win.description}
          </p>
          <span className="text-[10px] font-mono text-muted-foreground block">
            Operator: {win.responsibleOperator} • Created: {formatDate(win.createdAt, false)}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (win) => getStatusBadge(win),
    },
    {
      key: 'schedule',
      header: 'Window Timeline (UTC)',
      render: (win) => (
        <div className="space-y-0.5 text-xs font-mono">
          <span className="text-foreground block">
            {formatDate(win.startTime, true)}
          </span>
          <span className="text-muted-foreground block text-[11px]">
            &rarr; {formatDate(win.endTime, true)} ({win.timeZone})
          </span>
        </div>
      ),
    },
    {
      key: 'affectedComponents',
      header: 'Affected Components',
      render: (win) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {win.affectedComponents.map((compId) => {
            const comp = components.find((c) => c.id === compId);
            return (
              <span
                key={compId}
                className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50"
              >
                {comp?.name || compId}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      key: 'impact',
      header: 'Operational Impact',
      render: (win) => (
        <p className="text-[11px] text-muted-foreground max-w-xs line-clamp-2">
          {win.impactDescription}
        </p>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (win) => (
        <div className="flex items-center gap-1.5">
          {win.status === 'scheduled' && (
            <button
              type="button"
              onClick={() => handleOpenEdit(win)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              title="Edit scheduled window"
            >
              <Edit2 className="w-3.5 h-3.5 text-primary" />
            </button>
          )}

          {(win.status === 'scheduled' || win.status === 'in_progress') && (
            <button
              type="button"
              onClick={() => {
                setCancellingWindow(win);
                setCancellationReason('');
                setFormErrors([]);
              }}
              className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 cursor-pointer"
              title="Cancel maintenance window"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Scheduled Upcoming"
          value={scheduledCount}
          subtitle="Planned future windows"
          icon={<Calendar className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Currently In Progress"
          value={inProgressCount}
          subtitle="Active execution"
          icon={<Clock className="w-4 h-4 text-amber-500" />}
        />
        <StatCard
          title="Completed Records"
          value={completedCount}
          subtitle="Successfully executed"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Cancelled Windows"
          value={cancelledCount}
          subtitle="Aborted before execution"
          icon={<XCircle className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Filter and Action Bar */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            All Windows ({maintenanceWindows.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              statusFilter === 'scheduled'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Scheduled ({scheduledCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              statusFilter === 'cancelled'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold text-xs cursor-pointer shadow-2xs hover:opacity-95 transition-opacity"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Schedule Maintenance Window
        </button>
      </div>

      {/* Windows Table */}
      <DataTable
        data={filteredWindows}
        columns={columns}
        keyExtractor={(win) => win.id}
        emptyMessage="No maintenance windows found matching your filters."
      />

      {/* Create / Edit Maintenance Modal */}
      {(isCreateModalOpen || editingWindow) && (
        <Modal
          isOpen={isCreateModalOpen || !!editingWindow}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingWindow(null);
          }}
          title={editingWindow ? `Edit Maintenance: ${editingWindow.title}` : 'Schedule Maintenance Window'}
          size="lg"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingWindow(null);
                }}
                className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={editingWindow ? handleSubmitEdit : handleSubmitCreate}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold text-xs cursor-pointer shadow-2xs"
              >
                {editingWindow ? 'Save Changes' : 'Schedule Window'}
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-muted-foreground">
              Planned maintenance periods validate date/time continuity, detect conflicting overlaps on shared components, and notify multi-tenant dashboards in simulation mode.
            </p>

            {formErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 space-y-1">
                <span className="font-bold block">Validation Errors:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {formErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-foreground block">
                Maintenance Window Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. PostgreSQL 17 Minor Kernel Update"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground block">
                Technical Description & Objective <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Describe kernel patches, index rebuilds, or network re-routing..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground block">
                  Window Start Time (UTC) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground block">
                  Window End Time (UTC) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground"
                />
              </div>
            </div>

            {/* Affected Components Checklist */}
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Affected Components ({selectedComponents.length} selected) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 rounded-lg border border-border bg-muted/20">
                {components.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedComponents.includes(c.id)}
                      onChange={() => toggleComponentSelection(c.id)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-[11px] text-foreground font-medium truncate">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground block">
                Operational Impact Description <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Read-only gradebook queries for 30 minutes; write buffer active"
                value={impactDescription}
                onChange={(e) => setImpactDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground block">
                Responsible Platform Operator
              </label>
              <input
                type="text"
                value={responsibleOperator}
                onChange={(e) => setResponsibleOperator(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Maintenance Window Modal */}
      {cancellingWindow && (
        <Modal
          isOpen={!!cancellingWindow}
          onClose={() => setCancellingWindow(null)}
          title={`Cancel Maintenance: ${cancellingWindow.title}`}
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setCancellingWindow(null)}
                className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg font-semibold text-xs cursor-pointer"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-2xs"
              >
                Confirm Cancellation
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-muted-foreground">
              Cancelling a maintenance window removes it from active schedule, releases overlap locks on affected components, and logs an administrative audit event.
            </p>

            {formErrors.length > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                {formErrors[0]}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-foreground block">
                Mandatory Cancellation Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Reason window is being aborted or postponed..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
