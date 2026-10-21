'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertRule,
  AlertComparisonOperator,
  AlertSeverity,
  CreateAlertRuleInput,
  OperationalComponent,
  MetricUnit,
} from '@/lib/system-health/types';
import { METRIC_DEFINITIONS } from '@/lib/system-health/fixtures';
import { validateAlertRule } from '@/lib/system-health/evaluator';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatCard } from '@/components/ui/StatCard';
import { formatDate } from '@/lib/utils/formatters';
import {
  Bell,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  Filter,
  RotateCcw,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Radio,
} from 'lucide-react';

interface AlertRulesWorkspaceProps {
  alertRules: AlertRule[];
  components: OperationalComponent[];
  onCreateRule: (input: CreateAlertRuleInput) => void;
  onUpdateRule: (id: string, input: Partial<CreateAlertRuleInput>) => void;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
}

export function AlertRulesWorkspace({
  alertRules,
  components,
  onCreateRule,
  onUpdateRule,
  onToggleRule,
  onDeleteRule,
}: AlertRulesWorkspaceProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [componentFilter, setComponentFilter] = useState('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<AlertRule | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetComponentId, setTargetComponentId] = useState(components[0]?.id || 'comp_core_api_gateway');
  const [metricId, setMetricId] = useState(METRIC_DEFINITIONS[0]?.id || 'metric_request_volume');
  const [operator, setOperator] = useState<AlertComparisonOperator>('>');
  const [thresholdValue, setThresholdValue] = useState<number>(500);
  const [unit, setUnit] = useState<MetricUnit>(METRIC_DEFINITIONS[0]?.unit || 'req/s');
  const [evaluationWindow, setEvaluationWindow] = useState('5m');
  const [severity, setSeverity] = useState<AlertSeverity>('warning');
  const [notificationPolicyRef, setNotificationPolicyRef] = useState('Slack #platform-ops (Planned)');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Auto-sync unit when metric changes
  const handleMetricChange = (newMetricId: string) => {
    setMetricId(newMetricId);
    const m = METRIC_DEFINITIONS.find((def) => def.id === newMetricId);
    if (m) {
      setUnit(m.unit);
    }
  };

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setTargetComponentId(components[0]?.id || 'comp_core_api_gateway');
    setMetricId(METRIC_DEFINITIONS[0]?.id || 'metric_request_volume');
    setOperator('>');
    setThresholdValue(500);
    setUnit(METRIC_DEFINITIONS[0]?.unit || 'req/s');
    setEvaluationWindow('5m');
    setSeverity('warning');
    setNotificationPolicyRef('Slack #platform-ops (Planned)');
    setFormErrors([]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setDescription(rule.description);
    setTargetComponentId(rule.targetComponentId);
    setMetricId(rule.metricId);
    setOperator(rule.operator);
    setThresholdValue(rule.thresholdValue);
    setUnit(rule.unit);
    setEvaluationWindow(rule.evaluationWindow);
    setSeverity(rule.severity);
    setNotificationPolicyRef(rule.notificationPolicyRef);
    setFormErrors([]);
  };

  const handleSubmitCreate = () => {
    const input: CreateAlertRuleInput = {
      name,
      description,
      targetComponentId,
      metricId,
      operator,
      thresholdValue: Number(thresholdValue),
      unit,
      evaluationWindow,
      severity,
      notificationPolicyRef,
    };

    const validation = validateAlertRule(input, METRIC_DEFINITIONS);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    onCreateRule(input);
    setIsCreateModalOpen(false);
  };

  const handleSubmitEdit = () => {
    if (!editingRule) return;
    const input: CreateAlertRuleInput = {
      name,
      description,
      targetComponentId,
      metricId,
      operator,
      thresholdValue: Number(thresholdValue),
      unit,
      evaluationWindow,
      severity,
      notificationPolicyRef,
    };

    const validation = validateAlertRule(input, METRIC_DEFINITIONS);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    onUpdateRule(editingRule.id, input);
    setEditingRule(null);
  };

  // Filtered alert rules
  const filteredRules = useMemo(() => {
    return alertRules.filter((r) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.targetComponentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.metricName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'enabled' && r.isEnabled) ||
        (statusFilter === 'disabled' && !r.isEnabled);
      const matchesComp = componentFilter === 'all' || r.targetComponentId === componentFilter;

      return matchesSearch && matchesSeverity && matchesStatus && matchesComp;
    });
  }, [alertRules, searchQuery, severityFilter, statusFilter, componentFilter]);

  const enabledCount = alertRules.filter((r) => r.isEnabled).length;
  const criticalCount = alertRules.filter((r) => r.severity === 'critical').length;
  const warningCount = alertRules.filter((r) => r.severity === 'warning').length;

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'critical':
        return <Badge variant="error" size="sm" dot>CRITICAL</Badge>;
      case 'warning':
        return <Badge variant="warning" size="sm" dot>WARNING</Badge>;
      case 'info':
        return <Badge variant="info" size="sm">INFO</Badge>;
    }
  };

  const columns: Column<AlertRule>[] = [
    {
      key: 'name',
      header: 'Rule Name & Condition',
      render: (rule) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-foreground">{rule.name}</span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-sm">
            {rule.description}
          </p>
          <div className="text-[10px] font-mono text-primary font-semibold flex items-center gap-1.5">
            <code className="bg-muted px-1.5 py-0.5 rounded">
              {rule.metricName} {rule.operator} {rule.thresholdValue} {rule.unit}
            </code>
            <span>over {rule.evaluationWindow} window</span>
          </div>
        </div>
      ),
    },
    {
      key: 'targetComponent',
      header: 'Target Component',
      render: (rule) => (
        <div className="text-xs space-y-0.5">
          <span className="font-semibold text-foreground block">{rule.targetComponentName}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{rule.targetComponentId}</span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (rule) => getSeverityBadge(rule.severity),
    },
    {
      key: 'policy',
      header: 'Notification Route (Planned)',
      render: (rule) => (
        <div className="text-xs space-y-0.5 max-w-xs">
          <span className="font-mono text-[11px] text-foreground block">
            {rule.notificationPolicyRef}
          </span>
          <span className="text-[10px] text-muted-foreground italic">
            Non-production mock route
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Evaluation State',
      render: (rule) => (
        <button
          type="button"
          onClick={() => onToggleRule(rule.id)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
            rule.isEnabled
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {rule.isEnabled ? 'ENABLED (ACTIVE)' : 'DISABLED'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (rule) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenEdit(rule)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            title="Edit rule threshold"
          >
            <Edit2 className="w-3.5 h-3.5 text-primary" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingRule(rule)}
            className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 cursor-pointer"
            title="Delete rule"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Badge variant="purple" size="md">Demonstration Alert Evaluator</Badge>
          <p className="text-muted-foreground">
            Rule configurations demonstrate platform threshold logic and validation invariants. No real SMS, email, PagerDuty, or webhook dispatches occur in this frontend-first prototype.
          </p>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground shrink-0">
          Source: Local Configuration
        </span>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Total Alert Rules"
          value={alertRules.length}
          subtitle="Defined catalogue"
          icon={<Bell className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Active (Enabled)"
          value={enabledCount}
          subtitle="Currently evaluating"
          icon={<Radio className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Critical Severity"
          value={criticalCount}
          subtitle="Priority tier alerts"
          icon={<AlertOctagon className="w-4 h-4 text-rose-500" />}
        />
        <StatCard
          title="Warning Severity"
          value={warningCount}
          subtitle="Proactive capacity warnings"
          icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        />
      </div>

      {/* Filter and Action Bar */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rule name, metric, component..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'enabled' | 'disabled')}
            className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">All States</option>
            <option value="enabled">Enabled Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold text-xs cursor-pointer shadow-2xs hover:opacity-95 transition-opacity shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Create Alert Rule
        </button>
      </div>

      {/* Alert Rules Table */}
      <DataTable
        data={filteredRules}
        columns={columns}
        keyExtractor={(rule) => rule.id}
        emptyMessage="No alert rules found matching your filters."
      />

      {/* Create / Edit Rule Modal */}
      {(isCreateModalOpen || editingRule) && (
        <Modal
          isOpen={isCreateModalOpen || !!editingRule}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingRule(null);
          }}
          title={editingRule ? `Edit Alert Rule: ${editingRule.name}` : 'Create Platform Alert Rule'}
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingRule(null);
                }}
                className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={editingRule ? handleSubmitEdit : handleSubmitCreate}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold text-xs cursor-pointer shadow-2xs"
              >
                {editingRule ? 'Save Changes' : 'Create Rule'}
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-muted-foreground">
              Define operational thresholds, units, evaluation windows, and notification routing targets. Units are strictly validated against metric definitions.
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
                Rule Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. High API Latency P95"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground block">
                Rule Description
              </label>
              <textarea
                rows={2}
                placeholder="Describe threshold conditions and operational context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground block">
                  Target Component <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetComponentId}
                  onChange={(e) => setTargetComponentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground"
                >
                  {components.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground block">
                  Target Metric <span className="text-rose-500">*</span>
                </label>
                <select
                  value={metricId}
                  onChange={(e) => handleMetricChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground"
                >
                  {METRIC_DEFINITIONS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Threshold Condition Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/30 border border-border/60">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground block text-[10px] uppercase">
                  Operator
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value as AlertComparisonOperator)}
                  className="w-full px-2 py-1 text-xs bg-background border border-border rounded-lg font-mono font-bold"
                >
                  <option value=">">&gt; (Greater than)</option>
                  <option value=">=">&gt;= (Greater or equal)</option>
                  <option value="<">&lt; (Less than)</option>
                  <option value="<=">&lt;= (Less or equal)</option>
                  <option value="==">== (Exact match)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground block text-[10px] uppercase">
                  Threshold Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs bg-background border border-border rounded-lg font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground block text-[10px] uppercase">
                  Metric Unit
                </label>
                <input
                  type="text"
                  disabled
                  value={unit}
                  className="w-full px-2 py-1 text-xs bg-muted border border-border rounded-lg font-mono font-bold text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground block">
                  Evaluation Window (e.g. 5m, 15m, 1h) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={evaluationWindow}
                  onChange={(e) => setEvaluationWindow(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground block">
                  Alert Severity <span className="text-rose-500">*</span>
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground"
                >
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="info">Info</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground block">
                Notification Policy Route (Planned)
              </label>
              <input
                type="text"
                value={notificationPolicyRef}
                onChange={(e) => setNotificationPolicyRef(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground font-mono"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Rule Confirmation Dialog */}
      {deletingRule && (
        <ConfirmDialog
          isOpen={!!deletingRule}
          onClose={() => setDeletingRule(null)}
          onConfirm={() => {
            onDeleteRule(deletingRule.id);
            setDeletingRule(null);
          }}
          title="Delete Alert Rule"
          variant="danger"
          confirmLabel="Delete Rule"
          description={
            <p>
              Are you sure you want to delete alert rule &quot;<strong>{deletingRule.name}</strong>&quot;? This removes the threshold configuration from local storage and logs an administrative audit event.
            </p>
          }
        />
      )}
    </div>
  );
}
