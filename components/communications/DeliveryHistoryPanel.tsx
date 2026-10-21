'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { NotificationRecord, DeliveryStatus, ChannelType, FailureClassification } from '@/lib/types/communications';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { exportDeliveryRecordsToCsv } from '@/lib/communications/exporter';
import { canRetryNotification } from '@/lib/communications/evaluator';
import { formatDate } from '@/lib/utils/formatters';
import {
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Download,
  Filter,
  Eye,
  MessageSquare,
  ShieldAlert,
  Search,
  User,
  Building2,
  Calendar,
} from 'lucide-react';

export function DeliveryHistoryPanel() {
  const {
    notificationRecords,
    notificationPolicies,
    organizations,
    simulateNotificationRetry,
    addNotificationReviewNote,
  } = usePlatformStore();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [failureFilter, setFailureFilter] = useState('all');

  // Detail Modal State
  const [inspectRecord, setInspectRecord] = useState<NotificationRecord | null>(null);

  // Review Note Modal State
  const [noteRecordId, setNoteRecordId] = useState<string | null>(null);
  const [reviewNoteText, setReviewNoteText] = useState('');

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return notificationRecords.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          r.id.toLowerCase().includes(q) ||
          r.recipientDisplay.toLowerCase().includes(q) ||
          r.templateKey.toLowerCase().includes(q) ||
          (r.tenantName && r.tenantName.toLowerCase().includes(q)) ||
          (r.subject && r.subject.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (channelFilter !== 'all' && r.channel !== channelFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (tenantFilter !== 'all' && r.tenantId !== tenantFilter) return false;
      if (failureFilter !== 'all' && r.failureClassification !== failureFilter) return false;
      return true;
    });
  }, [notificationRecords, searchQuery, channelFilter, statusFilter, categoryFilter, tenantFilter, failureFilter]);

  // Export CSV Handler
  const handleExportCsv = () => {
    const csvData = exportDeliveryRecordsToCsv(filteredRecords);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `delivery_records_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNoteModal = (record: NotificationRecord) => {
    setNoteRecordId(record.id);
    setReviewNoteText(record.reviewNote || '');
  };

  const handleSaveReviewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteRecordId) {
      addNotificationReviewNote(noteRecordId, reviewNoteText);
      setNoteRecordId(null);
      setReviewNoteText('');
      if (inspectRecord?.id === noteRecordId) {
        setInspectRecord((prev) => prev ? { ...prev, reviewNote: reviewNoteText } : null);
      }
    }
  };

  const renderStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="success">Delivered (Receipt Verified)</Badge>;
      case 'sent':
        return <Badge variant="info">Sent (In Transit)</Badge>;
      case 'queued':
      case 'processing':
        return <Badge variant="warning">Queued</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      case 'suppressed':
        return <Badge variant="neutral">Suppressed</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            Demonstration Delivery History & Status Lifecycle
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deterministic audit record of notification lifecycle transitions, delivery receipts, and failure analysis.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-3.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors flex items-center gap-1.5 self-start shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-primary" />
          Export CSV (Protected)
        </button>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="p-3.5 rounded-lg border border-border bg-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5">
          {/* Search Input */}
          <div className="sm:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, recipient, template, or school..."
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-background focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="sent">Sent</option>
              <option value="queued">Queued / Processing</option>
              <option value="failed">Failed</option>
              <option value="suppressed">Suppressed</option>
            </select>
          </div>

          {/* Channel Filter */}
          <div>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-background focus:outline-none"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="in_app">In-App</option>
              <option value="push">Mobile Push</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-background focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="password_reset">Password Reset</option>
              <option value="security_alerts">Security Alerts</option>
              <option value="subscription_billing">Subscription Billing</option>
              <option value="platform_maintenance">Platform Maintenance</option>
              <option value="school_onboarding">School Onboarding</option>
              <option value="administrative_alerts">Administrative Alerts</option>
            </select>
          </div>

          {/* Failure Classification Filter */}
          <div>
            <select
              value={failureFilter}
              onChange={(e) => setFailureFilter(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-background focus:outline-none"
            >
              <option value="all">All Failures</option>
              <option value="invalid_destination">Invalid Destination</option>
              <option value="missing_configuration">Missing Config</option>
              <option value="suppressed_by_policy">Suppressed by Policy</option>
              <option value="provider_unavailable">Provider Unavailable</option>
              <option value="rate_limited">Rate Limited</option>
            </select>
          </div>
        </div>

        {/* Secondary Info Strip */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
          <span>
            Displaying <strong>{filteredRecords.length}</strong> matching demonstration delivery records
          </span>
          <span className="font-mono text-[10.5px]">
            Delivery Receipts: Synthetic Handset / MTA Confirmation
          </span>
        </div>
      </div>

      {/* Records Table */}
      <Card className="overflow-hidden border border-border shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Notification ID & Template</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3">School / Tenant</th>
                <th className="py-3 px-3">Recipient (Synthetic)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Dispatched</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                    No delivery records matched the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const retryCheck = canRetryNotification(rec, notificationPolicies);

                  return (
                    <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-foreground">{rec.id}</span>
                          <span className="font-mono text-[11px] text-muted-foreground block truncate max-w-xs">
                            {rec.templateKey} ({rec.templateVersion})
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] uppercase bg-muted px-1.5 py-0.2 rounded font-medium">
                          {rec.channel}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-foreground block truncate max-w-xs">
                          {rec.tenantName || 'Platform Global'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {rec.recipientDisplay}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          {renderStatusBadge(rec.status)}
                          {rec.failureClassification && (
                            <span className="text-[10px] text-red-600 dark:text-red-400 block font-mono">
                              Err: {rec.failureClassification}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap text-[11px]">
                        {formatDate(rec.createdAt)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectRecord(rec)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Inspect Timeline & Payload"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenNoteModal(rec)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Add Review Note"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {rec.status === 'failed' && (
                            <button
                              type="button"
                              onClick={() => simulateNotificationRetry(rec.id)}
                              disabled={!retryCheck.canRetry}
                              className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors disabled:opacity-40"
                              title={retryCheck.canRetry ? 'Simulate Retry' : retryCheck.reason}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
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
      </Card>

      {/* Notification Inspection Drawer / Modal */}
      {inspectRecord && (
        <Modal
          isOpen={Boolean(inspectRecord)}
          onClose={() => setInspectRecord(null)}
          title={`Delivery Lifecycle Audit: ${inspectRecord.id}`}
          description="Detailed status transition timeline, synthetic recipient coordinates, and failure diagnosis."
          size="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Metadata Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg border border-border bg-muted/20">
              <div>
                <span className="text-[10.5px] text-muted-foreground font-semibold block">Channel</span>
                <span className="font-mono uppercase font-bold text-foreground">{inspectRecord.channel}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-muted-foreground font-semibold block">Priority Tier</span>
                <span className="font-medium capitalize text-foreground">{inspectRecord.priority}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-muted-foreground font-semibold block">Retry Counter</span>
                <span className="font-mono text-foreground">
                  {inspectRecord.retryCount} / {inspectRecord.maxRetries} max
                </span>
              </div>
              <div>
                <span className="text-[10.5px] text-muted-foreground font-semibold block">Current Status</span>
                {renderStatusBadge(inspectRecord.status)}
              </div>
            </div>

            {/* Recipient & Subject */}
            <div className="p-3.5 rounded-lg border border-border space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-20 text-muted-foreground font-semibold">Recipient:</span>
                <span className="font-mono text-foreground">{inspectRecord.recipientDisplay}</span>
              </div>
              {inspectRecord.subject && (
                <div className="flex items-center gap-2">
                  <span className="w-20 text-muted-foreground font-semibold">Subject:</span>
                  <span className="font-semibold text-foreground">{inspectRecord.subject}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="w-20 text-muted-foreground font-semibold">Tenant:</span>
                <span className="text-foreground">{inspectRecord.tenantName || 'Platform Global'}</span>
              </div>
            </div>

            {/* Failure diagnostics if failed */}
            {inspectRecord.failureReason && (
              <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Failure Diagnostic: {inspectRecord.failureClassification}
                </span>
                <p className="text-[11.5px] font-mono leading-relaxed">
                  {inspectRecord.failureReason}
                </p>
              </div>
            )}

            {/* Review Note */}
            {inspectRecord.reviewNote && (
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs space-y-1">
                <span className="font-semibold text-primary block">Super-Admin Internal Note:</span>
                <p className="text-muted-foreground">{inspectRecord.reviewNote}</p>
              </div>
            )}

            {/* Transition Timeline */}
            <div className="space-y-2">
              <span className="font-semibold text-foreground block text-xs">
                Status Transition Timeline (Local Simulation)
              </span>
              <div className="space-y-2 pl-2 border-l-2 border-primary/40">
                {inspectRecord.timeline.map((step, idx) => (
                  <div key={idx} className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono uppercase text-primary text-[11px]">
                        [{step.status}]
                      </span>
                      <span className="text-[10.5px] text-muted-foreground font-mono">
                        {formatDate(step.timestamp)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11.5px] pl-1">
                      {step.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rendered Payload Preview */}
            <div className="space-y-1">
              <span className="font-semibold text-foreground block text-xs">
                Rendered Content Payload (Sanitized Demo Body):
              </span>
              <div className="p-3 rounded-lg border border-border bg-muted/20 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto">
                {inspectRecord.renderedPreview}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              {inspectRecord.status === 'failed' ? (
                <button
                  type="button"
                  onClick={() => {
                    simulateNotificationRetry(inspectRecord.id);
                    setInspectRecord(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Simulate Retry Now
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setInspectRecord(null)}
                className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Review Note Modal */}
      {noteRecordId && (
        <Modal
          isOpen={Boolean(noteRecordId)}
          onClose={() => setNoteRecordId(null)}
          title={`Add Review Note: ${noteRecordId}`}
          description="Attach an internal administrative note or investigation remark to this delivery record."
          size="md"
        >
          <form onSubmit={handleSaveReviewNote} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Investigation / Review Note
              </label>
              <textarea
                rows={4}
                value={reviewNoteText}
                onChange={(e) => setReviewNoteText(e.target.value)}
                placeholder="e.g. Verified recipient email address with school principal..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setNoteRecordId(null)}
                className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Save Review Note
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
