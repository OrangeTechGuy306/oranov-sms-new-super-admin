'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CampaignDraft, AudienceScope, ChannelType, CampaignStatus } from '@/lib/types/communications';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { estimateCampaignAudience, renderTemplatePreview } from '@/lib/communications/evaluator';
import { validateCampaignDraft } from '@/lib/communications/validator';
import { formatDate } from '@/lib/utils/formatters';
import {
  Sparkles,
  Plus,
  Users,
  Calendar,
  Building2,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Send,
  Layers,
} from 'lucide-react';

export function CampaignPlannerPanel() {
  const {
    campaignDrafts,
    communicationTemplates,
    organizations,
    createCampaignDraft,
    updateCampaignDraft,
    transitionCampaignStatus,
  } = usePlatformStore();

  // Create Campaign Modal State
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [audienceScope, setAudienceScope] = useState<AudienceScope>('all_schools');
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [channel, setChannel] = useState<ChannelType>('email');
  const [templateKey, setTemplateKey] = useState<string>(
    communicationTemplates[0]?.key || ''
  );
  const [scheduledAt, setScheduledAt] = useState<string>('2026-10-25T18:00:00Z');
  const [timezone, setTimezone] = useState('UTC');
  const [notes, setNotes] = useState('');

  // Preview Campaign Modal State
  const [previewCampaign, setPreviewCampaign] = useState<CampaignDraft | null>(null);

  // Live audience calculation
  const audienceEstimate = estimateCampaignAudience(
    audienceScope,
    selectedTenantIds,
    organizations
  );

  const candidateCampaign: Partial<CampaignDraft> = {
    name,
    audienceScope,
    targetTenantIds: selectedTenantIds,
    channel,
    templateKey,
    scheduledAt,
  };

  const validation = validateCampaignDraft(candidateCampaign, communicationTemplates);

  const handleToggleTenant = (tenantId: string) => {
    setSelectedTenantIds((prev) =>
      prev.includes(tenantId)
        ? prev.filter((id) => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;

    createCampaignDraft({
      name,
      description,
      audienceScope,
      targetTenantIds: audienceScope === 'selected_tenants' ? selectedTenantIds : undefined,
      channel,
      templateKey,
      scheduledAt,
      timezone,
      status: 'pending_approval',
      notes,
    });

    setIsDraftModalOpen(false);
    setName('');
    setDescription('');
  };

  const renderStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending_approval':
        return <Badge variant="warning">In Review</Badge>;
      case 'draft':
        return <Badge variant="neutral">Draft</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Platform Campaign & Broadcast Planning
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Plan multi-tenant platform announcements, feature releases, and scheduled institutional advisories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDraftModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5 self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          Draft Announcement Campaign
        </button>
      </div>

      {/* Safety Notice */}
      <Card className="p-4 bg-muted/20 border-border/80 space-y-1.5 text-xs">
        <span className="font-semibold text-foreground flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-primary" />
          Planning & Cohort Simulation Environment
        </span>
        <p className="text-muted-foreground leading-relaxed text-[11.5px]">
          Campaigns in this workspace are strictly for <strong>scheduling, template association, and recipient estimation</strong> based on the local organization directory. No real broadcasts or bulk deliveries will be dispatched.
        </p>
      </Card>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaignDrafts.map((camp) => {
          const boundTemplate = communicationTemplates.find(
            (t) => t.key === camp.templateKey
          );

          return (
            <Card key={camp.id} className="p-5 space-y-4 border border-border shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10.5px] text-muted-foreground font-semibold block">
                      {camp.id}
                    </span>
                    <h4 className="text-xs font-bold text-foreground">{camp.name}</h4>
                  </div>
                  {renderStatusBadge(camp.status)}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {camp.description}
                </p>

                {/* Audience & Scope Breakdown */}
                <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-semibold text-[11px] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      Audience Scope:
                    </span>
                    <span className="font-mono uppercase text-[11px] bg-background px-2 py-0.5 rounded border border-border">
                      {camp.audienceScope.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/50">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Estimated Schools</span>
                      <span className="font-bold text-foreground text-xs font-mono">
                        {camp.estimatedAudience.totalTenants} Tenants
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Estimated Recipients</span>
                      <span className="font-bold text-foreground text-xs font-mono">
                        ~{camp.estimatedAudience.estimatedRecipients} Contacts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bound Template & Channel */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-semibold">Channel & Template:</span>
                    <span className="font-mono uppercase font-bold text-primary">{camp.channel}</span>
                  </div>
                  <code className="text-[11px] bg-muted px-2 py-1 rounded block truncate text-foreground font-mono">
                    {camp.templateKey}
                  </code>
                </div>

                {/* Schedule & Timezone */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    Scheduled Dispatch:
                  </span>
                  <span className="font-mono text-foreground font-medium">
                    {formatDate(camp.scheduledAt)} ({camp.timezone})
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewCampaign(camp)}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted font-medium text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  Preview Message
                </button>

                <div className="flex items-center gap-1.5">
                  {camp.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => transitionCampaignStatus(camp.id, 'pending_approval')}
                      className="px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-[11px]"
                    >
                      Submit for Review
                    </button>
                  )}
                  {camp.status === 'pending_approval' && (
                    <button
                      type="button"
                      onClick={() => transitionCampaignStatus(camp.id, 'approved')}
                      className="px-2.5 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-[11px]"
                    >
                      Approve Campaign
                    </button>
                  )}
                  {camp.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => transitionCampaignStatus(camp.id, 'cancelled')}
                      className="px-2.5 py-1 rounded-md hover:bg-red-50 text-red-600 dark:hover:bg-red-950/40 text-[11px] font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Draft Campaign Modal */}
      {isDraftModalOpen && (
        <Modal
          isOpen={isDraftModalOpen}
          onClose={() => setIsDraftModalOpen(false)}
          title="Draft Platform Announcement Campaign"
          description="Select institutional cohorts, link an approved communication template, and schedule dispatch window."
          size="lg"
        >
          <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q4 2026 Core Infrastructure Maintenance Notice"
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Campaign Description / Purpose
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. System-wide maintenance broadcast to all registered school principals"
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Audience Scope <span className="text-red-500">*</span>
                </label>
                <select
                  value={audienceScope}
                  onChange={(e) => setAudienceScope(e.target.value as AudienceScope)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-background focus:outline-none"
                >
                  <option value="all_schools">All Registered Schools</option>
                  <option value="tier_enterprise">Enterprise Plan Tier Only</option>
                  <option value="tier_growth">Growth Campus Tier Only</option>
                  <option value="selected_tenants">Custom Selected Cohort</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Delivery Channel <span className="text-red-500">*</span>
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as ChannelType)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-background focus:outline-none"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="in_app">In-App Banner</option>
                  <option value="push">Mobile Push</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>

            {/* Custom Tenant Selector if selected_tenants */}
            {audienceScope === 'selected_tenants' && (
              <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-2">
                <span className="font-semibold text-foreground block text-xs">
                  Select Institutional Cohort ({selectedTenantIds.length} selected):
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                  {organizations.map((org) => (
                    <label key={org.id} className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={selectedTenantIds.includes(org.id)}
                        onChange={() => handleToggleTenant(org.id)}
                        className="rounded border-border"
                      />
                      <span className="truncate">{org.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Live Audience Calculation Badge */}
            <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground block text-xs">
                  Audience Estimation: {audienceEstimate.totalTenants} School(s) (~{audienceEstimate.estimatedRecipients} Contacts)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {audienceEstimate.calculationBasis}
                </span>
              </div>
              <Badge variant="neutral">Fixture Directory</Badge>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Bound Template Key <span className="text-red-500">*</span>
              </label>
              <select
                value={templateKey}
                onChange={(e) => setTemplateKey(e.target.value)}
                className="w-full text-xs font-mono px-2.5 py-2 rounded-lg border border-border bg-background focus:outline-none"
                required
              >
                {communicationTemplates
                  .filter((t) => t.channel === channel)
                  .map((t) => (
                    <option key={t.id} value={t.key}>
                      {t.key} — {t.name} ({t.status})
                    </option>
                  ))}
              </select>
            </div>

            {/* Schedule & Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Scheduled Dispatch Timestamp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  placeholder="2026-10-25T18:00:00Z"
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full text-xs font-mono px-2.5 py-2 rounded-lg border border-border bg-background focus:outline-none"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Chicago">America/Chicago (CST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
            </div>

            {/* Validation errors */}
            {validation.errors.length > 0 && (
              <div className="p-2.5 rounded border border-red-200 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs">
                {validation.errors.join(' ')}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsDraftModalOpen(false)}
                className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!validation.isValid}
                className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                Submit Campaign Draft
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Preview Campaign Rendered Message Modal */}
      {previewCampaign && (
        <Modal
          isOpen={Boolean(previewCampaign)}
          onClose={() => setPreviewCampaign(null)}
          title={`Rendered Campaign Preview: ${previewCampaign.name}`}
          description="Inspect message content rendered with safe sample values for this broadcast."
          size="md"
        >
          {(() => {
            const tpl = communicationTemplates.find((t) => t.key === previewCampaign.templateKey);
            const rendered = tpl
              ? renderTemplatePreview(tpl)
              : { renderedSubject: undefined, renderedBody: 'Template content unavailable.' };

            return (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                  <span className="font-semibold text-foreground">Campaign Target:</span>
                  <p className="text-muted-foreground">
                    Scope: <strong>{previewCampaign.audienceScope.replace(/_/g, ' ')}</strong> (~{previewCampaign.estimatedAudience.totalTenants} institutions)
                  </p>
                </div>

                {rendered.renderedSubject && (
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground block text-[11px]">Subject:</span>
                    <div className="p-2.5 rounded-lg border border-border bg-background font-medium">
                      {rendered.renderedSubject}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground block text-[11px]">Rendered Message:</span>
                  <div className="p-3.5 rounded-lg border border-border bg-background font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
                    {rendered.renderedBody}
                  </div>
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setPreviewCampaign(null)}
                    className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
