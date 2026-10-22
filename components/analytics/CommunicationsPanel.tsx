'use client';

import React from 'react';
import {
  CommunicationsAnalyticsSummary,
  AnalyticsGlobalFilters,
} from '@/lib/types/analytics';
import { NotificationRecord } from '@/lib/types/communications';
import { StatCard } from '@/components/ui/StatCard';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import { AnalyticsDonutChart } from './AnalyticsDonutChart';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  ShieldAlert,
} from 'lucide-react';

interface CommunicationsPanelProps {
  metrics: CommunicationsAnalyticsSummary;
  notifications: NotificationRecord[];
  filters: AnalyticsGlobalFilters;
}

export function CommunicationsPanel({
  metrics,
  notifications,
  filters,
}: CommunicationsPanelProps) {
  // Status breakdown items for Donut
  const statusItems = [
    { key: 'delivered', label: 'Delivered (Verified DLR)', count: metrics.deliveredCount, percentage: Math.round((metrics.deliveredCount / Math.max(1, metrics.totalNotificationsRecorded)) * 100), colorHex: '#10b981' },
    { key: 'sent', label: 'Sent (Carrier In-Flight)', count: metrics.sentCount, percentage: Math.round((metrics.sentCount / Math.max(1, metrics.totalNotificationsRecorded)) * 100), colorHex: '#3b82f6' },
    { key: 'queued', label: 'Queued (Pending Dispatch)', count: metrics.queuedCount, percentage: Math.round((metrics.queuedCount / Math.max(1, metrics.totalNotificationsRecorded)) * 100), colorHex: '#f59e0b' },
    { key: 'failed', label: 'Failed (Bounce / Rejection)', count: metrics.failedCount, percentage: Math.round((metrics.failedCount / Math.max(1, metrics.totalNotificationsRecorded)) * 100), colorHex: '#ef4444' },
    { key: 'suppressed', label: 'Suppressed (Quiet Hours Policy)', count: metrics.suppressedCount, percentage: Math.round((metrics.suppressedCount / Math.max(1, metrics.totalNotificationsRecorded)) * 100), colorHex: '#64748b' },
  ].filter((it) => it.count > 0);

  // Failed notifications list
  const failedRecords = notifications.filter((n) => n.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Policy and Delivery Integrity Notice */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-1 text-xs shadow-2xs">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Transactional Communications & Delivery Governance (Phase E-09.16 Integration)
        </h4>
        <p className="text-muted-foreground">
          Delivery rate is evaluated strictly from attempted transmissions: <code className="text-foreground">Delivered ÷ (Delivered + Failed + Sent) × 100</code>.
          <span className="block mt-1 font-medium text-foreground">
            Queued messages are pending dispatch simulation and are strictly excluded from the delivered numerator. Suppressed notifications matched quiet-hours policy rules.
          </span>
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Recorded Dispatches"
          value={metrics.totalNotificationsRecorded}
          subtitle={`Evaluated in scope: ${filters.dateRange.label}`}
          icon={<Bell className="w-5 h-5 text-primary" />}
        />

        <StatCard
          title="Delivery Success Rate"
          value={`${metrics.deliverySuccessRatePercent}%`}
          subtitle={`${metrics.deliveredCount} confirmed carrier handoffs`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          badge={{
            label: metrics.deliverySuccessRatePercent >= 95 ? 'Excellent' : 'Needs Review',
            variant: metrics.deliverySuccessRatePercent >= 95 ? 'success' : 'warning',
          }}
        />

        <StatCard
          title="Carrier Bounces & Failures"
          value={metrics.failedCount}
          subtitle="SMTP hard bounces or provider timeouts"
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
          badge={{
            label: metrics.failedCount > 0 ? `${metrics.failedCount} Bounced` : 'Zero Bounces',
            variant: metrics.failedCount > 0 ? 'error' : 'success',
          }}
        />

        <StatCard
          title="In-Flight & Queued Queue"
          value={metrics.sentCount + metrics.queuedCount}
          subtitle={`${metrics.queuedCount} queued • ${metrics.suppressedCount} quiet-hours`}
          icon={<Clock className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsDonutChart
          title="Dispatch Delivery State Distribution"
          description="Verification states across gateway relays and recipient mailboxes."
          items={statusItems}
          centerLabel="Dispatches"
          centerValue={metrics.totalNotificationsRecorded}
        />

        <AnalyticsBarChart
          title="Dispatch Volume by Channel"
          description="Distribution between Email (SES), SMS (Twilio), Push, and In-App."
          items={metrics.channelDistribution}
          unit="Dispatches"
        />
      </div>

      {/* Failed Delivery Audit Log */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Failed Dispatch Diagnostic Log ({failedRecords.length})
            </h4>
            <p className="text-xs text-muted-foreground">
              Diagnosing delivery rejections to prevent silent communication drops.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
            Bounce Rate: {metrics.totalNotificationsRecorded > 0 ? Math.round((metrics.failedCount / metrics.totalNotificationsRecorded) * 100) : 0}%
          </span>
        </div>

        {failedRecords.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg">
            No failed dispatch records recorded for current filters.
          </div>
        ) : (
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-2.5">Notification ID</th>
                  <th className="p-2.5">Channel</th>
                  <th className="p-2.5">Recipient (Masked)</th>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Diagnostic Failure Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {failedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-muted/20">
                    <td className="p-2.5 font-mono text-[11px] font-bold text-foreground">
                      {rec.id}
                    </td>
                    <td className="p-2.5 text-muted-foreground uppercase text-[11px] font-semibold">
                      {rec.channel}
                    </td>
                    <td className="p-2.5 font-mono text-muted-foreground">
                      {rec.recipientDisplay}
                    </td>
                    <td className="p-2.5 font-mono text-muted-foreground">
                      {rec.createdAt?.split('T')[0] || 'N/A'}
                    </td>
                    <td className="p-2.5 text-rose-600 dark:text-rose-400 font-medium">
                      {rec.failureReason || 'Unknown transmission timeout'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
