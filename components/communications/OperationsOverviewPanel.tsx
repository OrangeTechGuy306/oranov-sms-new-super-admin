'use client';

import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/formatters';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { computeCommunicationMetrics } from '@/lib/communications/evaluator';
import {
  Bell,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Sliders,
  ServerOff,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface OperationsOverviewPanelProps {
  onNavigateTab: (tabId: string) => void;
}

export function OperationsOverviewPanel({ onNavigateTab }: OperationsOverviewPanelProps) {
  const {
    communicationTemplates,
    notificationPolicies,
    communicationProviders,
    notificationRecords,
    auditEvents,
  } = usePlatformStore();

  const metrics = computeCommunicationMetrics(
    notificationRecords,
    communicationTemplates,
    notificationPolicies,
    communicationProviders
  );

  // Filter recent communication-related audit events
  const recentCommsEvents = auditEvents
    .filter(
      (e) =>
        e.action.includes('COMMUNICATION') ||
        e.action.includes('NOTIFICATION') ||
        e.action.includes('CAMPAIGN') ||
        e.targetEntity === 'CommunicationTemplate' ||
        e.targetEntity === 'NotificationPolicy' ||
        e.targetEntity === 'NotificationRecord'
    )
    .slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Scope Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border/70 bg-card text-xs text-muted-foreground gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>
            <strong>Scope & Source:</strong> All metrics below reflect the deterministic client-side demonstration store (<code>sms_superadmin_dev_store_v1</code>).
          </span>
        </div>
        <span className="text-[11px] font-mono bg-muted px-2 py-0.5 rounded">
          Sync: Client-Side Simulation
        </span>
      </div>

      {/* Primary Metrics Grid (10 Summary Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Demo Delivery Records"
          value={metrics.totalRecords}
          subtitle="Total in local store"
          icon={<FileText className="w-4 h-4 text-primary" />}
          badge={{ label: 'Demo Fixture', variant: 'neutral' }}
          onClick={() => onNavigateTab('delivery')}
        />
        <StatCard
          title="Simulated Queued"
          value={metrics.queuedCount}
          subtitle="Pending scheduled slot"
          icon={<Clock className="w-4 h-4 text-amber-500" />}
          badge={{ label: 'Queued / Processing', variant: metrics.queuedCount > 0 ? 'warning' : 'neutral' }}
          onClick={() => onNavigateTab('delivery')}
        />
        <StatCard
          title="Simulated Sent"
          value={metrics.sentCount}
          subtitle="Gateway relay accepted"
          icon={<Send className="w-4 h-4 text-blue-500" />}
          badge={{ label: 'Sent (In Transit)', variant: 'info' }}
          onClick={() => onNavigateTab('delivery')}
        />
        <StatCard
          title="Simulated Delivered"
          value={metrics.deliveredCount}
          subtitle="Confirmed receipt"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          badge={{ label: 'DLR Confirmed', variant: 'success' }}
          onClick={() => onNavigateTab('delivery')}
        />
        <StatCard
          title="Simulated Failed"
          value={metrics.failedCount}
          subtitle="Bounce or gateway error"
          icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
          badge={{ label: `${metrics.failedCount} Action Required`, variant: metrics.failedCount > 0 ? 'error' : 'neutral' }}
          onClick={() => onNavigateTab('delivery')}
        />

        <StatCard
          title="Suppressed Messages"
          value={metrics.suppressedCount}
          subtitle="Quiet hours / policy caps"
          icon={<ShieldAlert className="w-4 h-4 text-purple-500" />}
          badge={{ label: 'Policy Enforced', variant: 'neutral' }}
          onClick={() => onNavigateTab('delivery')}
        />
        <StatCard
          title="Draft Templates"
          value={metrics.draftTemplatesCount}
          subtitle="Under author review"
          icon={<MessageSquare className="w-4 h-4 text-orange-500" />}
          badge={{ label: 'Needs Approval', variant: 'warning' }}
          onClick={() => onNavigateTab('templates')}
        />
        <StatCard
          title="Active Templates"
          value={metrics.activeTemplatesCount}
          subtitle="Approved for dispatch"
          icon={<Sparkles className="w-4 h-4 text-emerald-500" />}
          badge={{ label: 'Active Registry', variant: 'success' }}
          onClick={() => onNavigateTab('templates')}
        />
        <StatCard
          title="Notification Policies"
          value={metrics.configuredPoliciesCount}
          subtitle="Active routing rules"
          icon={<Sliders className="w-4 h-4 text-indigo-500" />}
          badge={{ label: 'Enforced Locally', variant: 'info' }}
          onClick={() => onNavigateTab('policies')}
        />
        <StatCard
          title="Unconnected Providers"
          value={metrics.disconnectedProvidersCount}
          subtitle={`${metrics.totalProvidersCount - metrics.disconnectedProvidersCount} simulated active`}
          icon={<ServerOff className="w-4 h-4 text-red-500" />}
          badge={{
            label: metrics.disconnectedProvidersCount > 0 ? 'Missing Vault Keys' : 'All Ready',
            variant: metrics.disconnectedProvidersCount > 0 ? 'error' : 'success',
          }}
          onClick={() => onNavigateTab('providers')}
        />
      </div>

      {/* Operational Sections: Recent Activity & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit / Operational Activity Stream */}
        <Card className="lg:col-span-2 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Recent Communication Governance Events
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Audit trail of template updates, delivery status changes, policy modifications, and test simulations.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('delivery')}
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              View Delivery Log
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentCommsEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No recent communication events logged in store.
              </div>
            ) : (
              recentCommsEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs"
                >
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground truncate">
                        {evt.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
                        {formatDate(evt.timestamp)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5 line-clamp-2 text-[11.5px]">
                      {evt.details}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10.5px] text-muted-foreground">
                      <span>Actor: <strong>{evt.actor.name}</strong></span>
                      <span>•</span>
                      <span>Target: <code className="bg-muted px-1 rounded">{evt.targetEntity}</code></span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-muted-foreground/80">{evt.sourceClassification}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Launch & Governance Checklist */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Workspace Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('templates')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-all text-left text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-primary/10 text-primary">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Communication Templates</span>
                    <span className="text-[11px] text-muted-foreground">Manage subjects, variables & locales</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab('policies')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-all text-left text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-500">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Notification Policies</span>
                    <span className="text-[11px] text-muted-foreground">Quiet hours, rate caps & priorities</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab('providers')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-all text-left text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-500">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Channel Readiness</span>
                    <span className="text-[11px] text-muted-foreground">SES, Twilio, FCM & WhatsApp status</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab('campaigns')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-all text-left text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-purple-500/10 text-purple-500">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">Campaign Broadcasts</span>
                    <span className="text-[11px] text-muted-foreground">Plan releases & audience estimates</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </Card>

          {/* Architecture Disclaimers */}
          <Card className="p-4 bg-muted/20 border-border/70 space-y-2.5 text-xs">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Governance & Safety Guarantees
            </span>
            <ul className="space-y-1.5 text-[11.5px] text-muted-foreground list-disc list-inside">
              <li><strong>Zero Real Deliveries:</strong> Actions mutate demonstration fixtures only.</li>
              <li><strong>No Credentials in Browser:</strong> Production SMTP keys, Twilio tokens, and FCM keys stay in HashiCorp/AWS KMS vaults.</li>
              <li><strong>Tenant Boundaries:</strong> Tenant overrides never bypass legal compliance rules.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
