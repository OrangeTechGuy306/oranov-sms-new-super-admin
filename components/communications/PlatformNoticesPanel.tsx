'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PlatformNotice } from '@/lib/operations/canonical-operations';
import { formatDate } from '@/lib/utils/formatters';
import {
  Megaphone,
  Plus,
  Send,
  Archive,
  Ban,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function PlatformNoticesPanel() {
  const { can } = usePlatformAuth();
  const canManageNotices = can('communications.notices.manage');
  const {
    platformNotices,
    organizations,
    plans,
    createPlatformNotice,
    transitionPlatformNoticeStatus,
  } = usePlatformStore();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<PlatformNotice['category']>('general_announcement');
  const [severity, setSeverity] = useState<PlatformNotice['severity']>('info');
  const [audience, setAudience] = useState<PlatformNotice['audience']>('all_tenants');
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const filtered = platformNotices.filter((n) =>
    statusFilter === 'all' ? true : n.status === statusFilter
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createPlatformNotice({
      title,
      summary,
      body,
      category,
      severity,
      audience,
      targetOrganizationIds: selectedOrgIds,
      targetPlanIds: selectedPlanIds,
      channelSimulations: ['in_app'],
      requiresApproval,
    });
    if (res.success) {
      setIsCreateOpen(false);
      setTitle('');
      setSummary('');
      setBody('');
      setSelectedOrgIds([]);
      setSelectedPlanIds([]);
      setRequiresApproval(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 max-w-3xl">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-foreground">
              Tenant-Targeted Platform Notices (Simulated In-App Only — Zero Live Email / SMS / Push Dispatch)
            </p>
            <p className="text-muted-foreground mt-0.5">
              Only notices in <code className="font-mono px-1 rounded bg-muted">published_simulated</code> status matching a tenant&apos;s organization ID, subscription tier, or campus scope become visible in the Tenant Dashboard. Drafts and pending-approval notices are strictly withheld.
            </p>
          </div>
        </div>
        {canManageNotices && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shrink-0"
          >
            <Plus className="w-4 h-4" /> New Platform Notice
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 bg-card p-3.5 rounded-xl border border-border text-xs">
        <span className="font-semibold text-foreground flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" />
          Platform Notice Registry ({filtered.length})
        </span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter notices by status"
          className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="all">All Notice States</option>
          <option value="draft">Draft</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="scheduled_simulated">Scheduled (Simulated)</option>
          <option value="published_simulated">Published (Simulated In-App)</option>
          <option value="cancelled">Cancelled</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((notice) => (
          <div
            key={notice.id}
            className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-2xs space-y-2.5 text-xs"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                    {notice.referenceCode}
                  </span>
                  <Badge status={notice.status} size="sm" />
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    Audience: {notice.audience.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Approval: {notice.approvalStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground">{notice.title}</h4>
                <p className="text-muted-foreground">{notice.body}</p>
                <p className="text-[11px] text-muted-foreground pt-1">
                  Author: {notice.createdBy.name} • Created {formatDate(notice.createdAt, true)}
                  {notice.publishedAt && ` • Published (sim): ${formatDate(notice.publishedAt, true)}`}
                </p>
              </div>

              {canManageNotices && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {(notice.status === 'draft' || notice.status === 'scheduled_simulated') && (
                    <button
                      type="button"
                      onClick={() => transitionPlatformNoticeStatus(notice.id, 'published_simulated')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <Send className="w-3.5 h-3.5" /> Publish (Simulated)
                    </button>
                  )}
                  {notice.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => transitionPlatformNoticeStatus(notice.id, 'scheduled_simulated')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Scheduled
                    </button>
                  )}
                  {(notice.status === 'published_simulated' || notice.status === 'scheduled_simulated') && (
                    <button
                      type="button"
                      onClick={() => transitionPlatformNoticeStatus(notice.id, 'archived')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted"
                    >
                      <Archive className="w-3.5 h-3.5" /> Archive
                    </button>
                  )}
                  {notice.status !== 'cancelled' && notice.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => transitionPlatformNoticeStatus(notice.id, 'cancelled')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                    >
                      <Ban className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isCreateOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateOpen(false)}
          title="Author Simulated Platform-to-Tenant Notice"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background"
                >
                  <option value="general_announcement">General Announcement</option>
                  <option value="maintenance_advisory">Maintenance Advisory</option>
                  <option value="onboarding_guidance">Onboarding Guidance</option>
                  <option value="billing_reminder">Billing Reminder</option>
                  <option value="release_update">Release Update</option>
                  <option value="policy_notice">Policy Notice</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Audience Scope</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background"
              >
                <option value="all_tenants">All Active Tenants</option>
                <option value="plan_tiers">Targeted Subscription Plans</option>
                <option value="selected_tenants">Specific School Organizations</option>
              </select>
            </div>

            {audience === 'selected_tenants' && (
              <div>
                <label className="font-semibold block mb-1">Target Organizations</label>
                <select
                  multiple
                  value={selectedOrgIds}
                  onChange={(e) =>
                    setSelectedOrgIds(Array.from(e.target.selectedOptions).map((o) => o.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background h-24"
                >
                  {organizations.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {audience === 'plan_tiers' && (
              <div>
                <label className="font-semibold block mb-1">Target Plan Tiers</label>
                <select
                  multiple
                  value={selectedPlanIds}
                  onChange={(e) =>
                    setSelectedPlanIds(Array.from(e.target.selectedOptions).map((o) => o.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background h-24"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="font-semibold block mb-1">Title *</label>
              <input
                type="text"
                required
                minLength={4}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Summary</label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Notice Body *</label>
              <textarea
                rows={3}
                required
                minLength={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border bg-background"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
              />
              <span>Require dual-operator governance approval before publishing</span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold"
              >
                Save Notice
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
