'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { TenantCommunicationConfig, ChannelType } from '@/lib/types/communications';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { formatDate } from '@/lib/utils/formatters';
import {
  Building2,
  Mail,
  Smartphone,
  Bell,
  MessageSquare,
  Moon,
  Clock,
  ShieldAlert,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export function TenantCommunicationConfigPanel() {
  const { tenantCommunicationConfigs, updateTenantCommunicationConfig } = usePlatformStore();

  const [editingConfig, setEditingConfig] = useState<TenantCommunicationConfig | null>(null);
  const [senderName, setSenderName] = useState('');
  const [quietStart, setQuietStart] = useState('21:30');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [quietEnabled, setQuietEnabled] = useState(true);
  const [channelToggles, setChannelToggles] = useState<Record<ChannelType, boolean>>({
    email: true,
    sms: true,
    in_app: true,
    push: false,
    whatsapp: false,
  });

  const handleOpenEdit = (config: TenantCommunicationConfig) => {
    setEditingConfig(config);
    setSenderName(config.customSenderName || '');
    setQuietStart(config.quietHours.startLocalTime);
    setQuietEnd(config.quietHours.endLocalTime);
    setQuietEnabled(config.quietHours.enabled);
    setChannelToggles({ ...config.enabledChannels });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig) return;

    updateTenantCommunicationConfig(editingConfig.tenantId, {
      customSenderName: senderName || undefined,
      enabledChannels: channelToggles,
      quietHours: {
        ...editingConfig.quietHours,
        enabled: quietEnabled,
        startLocalTime: quietStart,
        endLocalTime: quietEnd,
      },
    });

    setEditingConfig(null);
  };

  const renderReadinessBadge = (status: 'ready' | 'incomplete_config' | 'policy_restricted') => {
    switch (status) {
      case 'ready':
        return <Badge variant="success">Ready</Badge>;
      case 'incomplete_config':
        return <Badge variant="warning">Incomplete Setup</Badge>;
      case 'policy_restricted':
        return <Badge variant="error">Restricted</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Tenant Communication Configuration Visibility
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Inspect and govern institutional delivery channels, sender overrides, and school-specific quiet hours.
        </p>
      </div>

      {/* Honest Boundary Notice */}
      <Card className="p-4 bg-muted/20 border-border/80 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Info className="w-4 h-4 text-blue-500" />
          <span>Tenant Boundary & Consent Registry Notice</span>
        </div>
        <p className="text-muted-foreground leading-relaxed text-[11.5px]">
          Platform governance enforces a strict separation between <strong>Platform Policies</strong>, <strong>Tenant Settings</strong>, and <strong>Individual User Consent</strong>. Notice that all tenants currently report <code>Consent Registry: Unconfigured (Backend Required)</code> because end-user GDPR/opt-out consent tracking requires dedicated backend storage and verified double-opt-in pipelines.
        </p>
      </Card>

      {/* Tenant Settings Table */}
      <Card className="overflow-hidden border border-border shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">School Organization</th>
                <th className="py-3 px-3">Subscription Tier</th>
                <th className="py-3 px-3">Enabled Channels</th>
                <th className="py-3 px-3">Sender From-Name</th>
                <th className="py-3 px-3">Tenant Quiet Hours</th>
                <th className="py-3 px-3">Readiness</th>
                <th className="py-3 px-3">Consent Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tenantCommunicationConfigs.map((cfg) => (
                <tr key={cfg.tenantId} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground block">{cfg.tenantName}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{cfg.tenantId}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-medium text-foreground">{cfg.planTier}</span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span title="Email" className={cfg.enabledChannels.email ? 'text-blue-500' : 'text-muted-foreground/30'}>
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <span title="SMS" className={cfg.enabledChannels.sms ? 'text-amber-500' : 'text-muted-foreground/30'}>
                        <Smartphone className="w-3.5 h-3.5" />
                      </span>
                      <span title="In-App" className={cfg.enabledChannels.in_app ? 'text-purple-500' : 'text-muted-foreground/30'}>
                        <Bell className="w-3.5 h-3.5" />
                      </span>
                      <span title="WhatsApp" className={cfg.enabledChannels.whatsapp ? 'text-emerald-500' : 'text-muted-foreground/30'}>
                        <MessageSquare className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-foreground">
                    {cfg.customSenderName || <span className="text-muted-foreground italic">Default</span>}
                  </td>

                  <td className="py-3 px-3">
                    {cfg.quietHours.enabled ? (
                      <div className="space-y-0.5">
                        <span className="font-mono text-[11px] text-foreground flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-400" />
                          {cfg.quietHours.startLocalTime} - {cfg.quietHours.endLocalTime}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono block">
                          {cfg.quietHours.timezone}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">Disabled</span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    {renderReadinessBadge(cfg.readinessStatus)}
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      Backend Required
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cfg)}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit Tenant Settings"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Tenant Settings Modal */}
      {editingConfig && (
        <Modal
          isOpen={Boolean(editingConfig)}
          onClose={() => setEditingConfig(null)}
          title={`Edit Tenant Settings: ${editingConfig.tenantName}`}
          description="Adjust institutional communication channels, from-name branding, and quiet hours."
          size="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Custom Sender Display Name (From-Name)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Oak Hill Academy Alerts"
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Channel Toggles */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">
                Enabled Delivery Channels for Institutional Communications
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['email', 'sms', 'in_app', 'push', 'whatsapp'] as ChannelType[]).map((ch) => (
                  <label key={ch} className="flex items-center gap-2 cursor-pointer p-2 rounded border border-border bg-muted/20 text-xs">
                    <input
                      type="checkbox"
                      checked={channelToggles[ch]}
                      onChange={(e) =>
                        setChannelToggles((prev) => ({ ...prev, [ch]: e.target.checked }))
                      }
                      className="rounded border-border"
                    />
                    <span className="capitalize">{ch.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  Tenant Local Quiet Hours
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={quietEnabled}
                    onChange={(e) => setQuietEnabled(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span>Active</span>
                </label>
              </div>

              {quietEnabled && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Start (Local)</label>
                    <input
                      type="text"
                      value={quietStart}
                      onChange={(e) => setQuietStart(e.target.value)}
                      className="w-full text-xs font-mono px-2.5 py-1.5 rounded border border-border bg-background focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">End (Local)</label>
                    <input
                      type="text"
                      value={quietEnd}
                      onChange={(e) => setQuietEnd(e.target.value)}
                      className="w-full text-xs font-mono px-2.5 py-1.5 rounded border border-border bg-background focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingConfig(null)}
                className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Save Settings
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
