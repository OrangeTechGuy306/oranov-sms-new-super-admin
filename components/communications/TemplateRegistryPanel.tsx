'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CommunicationTemplate, ChannelType, TemplateStatus } from '@/lib/types/communications';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { TemplateEditorModal } from './TemplateEditorModal';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { TemplateVersionHistoryModal } from './TemplateVersionHistoryModal';
import { formatDate } from '@/lib/utils/formatters';
import {
  Mail,
  Smartphone,
  Bell,
  MessageSquare,
  Plus,
  Eye,
  Edit2,
  Copy,
  Archive,
  RotateCcw,
  History,
} from 'lucide-react';

export function TemplateRegistryPanel() {
  const {
    communicationTemplates,
    createCommunicationTemplate,
    updateCommunicationTemplate,
    duplicateCommunicationTemplate,
    archiveCommunicationTemplate,
    restoreCommunicationTemplate,
    getTemplateVersionHistory,
    restoreTemplateVersion,
    simulateTestNotification,
  } = usePlatformStore();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [localeFilter, setLocaleFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'key'>('updated');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CommunicationTemplate | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<CommunicationTemplate | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyTemplate, setHistoryTemplate] = useState<CommunicationTemplate | null>(null);

  // Confirm dialogs
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  // Filtered & sorted templates
  const filteredTemplates = useMemo(() => {
    const result = communicationTemplates.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          t.name.toLowerCase().includes(q) ||
          t.key.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.subject && t.subject.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (channelFilter !== 'all' && t.channel !== channelFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (localeFilter !== 'all' && t.locale !== localeFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'key') return a.key.localeCompare(b.key);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [communicationTemplates, searchQuery, categoryFilter, channelFilter, statusFilter, localeFilter, sortBy]);

  // Channel Icon Resolver
  const renderChannelIcon = (ch: ChannelType) => {
    switch (ch) {
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-blue-500" />;
      case 'sms':
        return <Smartphone className="w-3.5 h-3.5 text-amber-500" />;
      case 'in_app':
        return <Bell className="w-3.5 h-3.5 text-purple-500" />;
      case 'push':
        return <Smartphone className="w-3.5 h-3.5 text-indigo-500" />;
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Mail className="w-3.5 h-3.5" />;
    }
  };

  // Status Badge Resolver
  const renderStatusBadge = (st: TemplateStatus) => {
    switch (st) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'approved':
        return <Badge variant="info">Approved</Badge>;
      case 'in_review':
        return <Badge variant="warning">In Review</Badge>;
      case 'draft':
        return <Badge variant="neutral">Draft</Badge>;
      case 'archived':
        return <Badge variant="error">Archived</Badge>;
      default:
        return <Badge variant="neutral">{st}</Badge>;
    }
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (template: CommunicationTemplate) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleOpenPreview = (template: CommunicationTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleOpenHistory = (template: CommunicationTemplate) => {
    setHistoryTemplate(template);
    setIsHistoryOpen(true);
  };

  const handleDuplicate = (template: CommunicationTemplate) => {
    const newKey = `${template.key}_copy_${Math.random().toString(36).substring(2, 5)}`;
    const newName = `${template.name} (Copy)`;
    duplicateCommunicationTemplate(template.id, newKey, newName);
  };

  return (
    <div className="space-y-5">
      {/* Workspace Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Communication Template Registry
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Centralized repository of notification messages, localized templates, and channel variables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Template
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-lg border border-border bg-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search */}
          <div className="sm:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, key, subject, or content..."
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-background focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="account_verification">Account Verification</option>
              <option value="password_reset">Password Reset</option>
              <option value="welcome_onboarding">Welcome & Onboarding</option>
              <option value="org_provisioning">Org Provisioning</option>
              <option value="subscription_billing">Subscription & Billing</option>
              <option value="platform_maintenance">Platform Maintenance</option>
              <option value="security_alerts">Security Alerts</option>
              <option value="administrative_alerts">Administrative Alerts</option>
              <option value="school_onboarding">School Onboarding</option>
              <option value="platform_announcements">Announcements</option>
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

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-background focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="approved">Approved</option>
              <option value="in_review">In Review</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Locale Filter */}
          <div>
            <select
              value={localeFilter}
              onChange={(e) => setLocaleFilter(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-background focus:outline-none"
            >
              <option value="all">All Locales</option>
              <option value="en-US">en-US</option>
              <option value="en-GB">en-GB</option>
              <option value="fr-FR">fr-FR</option>
            </select>
          </div>
        </div>

        {/* Secondary sorting & count strip */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
          <span>
            Showing <strong>{filteredTemplates.length}</strong> of {communicationTemplates.length} templates
          </span>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-[11px] bg-background border border-border rounded px-1.5 py-0.5 focus:outline-none"
            >
              <option value="updated">Recently Updated</option>
              <option value="name">Template Name</option>
              <option value="key">Template Key</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <Card className="overflow-hidden border border-border shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Template Name & Stable Key</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Version</th>
                <th className="py-3 px-3">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                    No communication templates matched the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{tpl.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                            {tpl.locale}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground block truncate max-w-md">
                          {tpl.key}
                        </span>
                        {tpl.subject && (
                          <span className="text-[11px] text-muted-foreground/80 line-clamp-1 italic">
                            Subj: {tpl.subject}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium capitalize">
                        {renderChannelIcon(tpl.channel)}
                        <span>{tpl.channel.replace(/_/g, ' ')}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] text-muted-foreground capitalize">
                        {tpl.category.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {renderStatusBadge(tpl.status)}
                    </td>

                    <td className="py-3 px-3 font-mono text-xs">
                      {tpl.version}
                    </td>

                    <td className="py-3 px-3 text-muted-foreground whitespace-nowrap text-[11px]">
                      {formatDate(tpl.updatedAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(tpl)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Live Preview & Simulation"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(tpl)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Template"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenHistory(tpl)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Version History & Diffs"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(tpl)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Duplicate Template"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {tpl.status !== 'archived' ? (
                          <button
                            type="button"
                            onClick={() => setConfirmArchiveId(tpl.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 text-muted-foreground transition-colors"
                            title="Archive Template"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmRestoreId(tpl.id)}
                            className="p-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 text-muted-foreground transition-colors"
                            title="Restore from Archive"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Editor Modal */}
      {isEditorOpen && (
        <TemplateEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          templateToEdit={editingTemplate}
          existingTemplates={communicationTemplates}
          onSave={(data, changeSummary) => {
            if (editingTemplate) {
              updateCommunicationTemplate(editingTemplate.id, data, changeSummary);
            } else {
              createCommunicationTemplate(data as any);
            }
          }}
        />
      )}

      {/* Preview Modal */}
      {isPreviewOpen && (
        <TemplatePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          template={previewTemplate}
          onSendSimulation={(id, recipient, vars) => {
            simulateTestNotification(id, recipient, vars);
          }}
        />
      )}

      {/* Version History Modal */}
      {isHistoryOpen && historyTemplate && (
        <TemplateVersionHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          template={historyTemplate}
          versionHistory={getTemplateVersionHistory(historyTemplate.id)}
          onRestoreVersion={(versionId) => {
            restoreTemplateVersion(versionId);
          }}
        />
      )}

      {/* Archive Confirmation Dialog */}
      {confirmArchiveId && (
        <ConfirmDialog
          isOpen={Boolean(confirmArchiveId)}
          onClose={() => setConfirmArchiveId(null)}
          onConfirm={() => {
            if (confirmArchiveId) {
              archiveCommunicationTemplate(confirmArchiveId);
              setConfirmArchiveId(null);
            }
          }}
          title="Archive Communication Template?"
          description="Archiving will remove this template from active campaign selection and policy evaluation. It can be restored to draft status at any time."
          confirmLabel="Archive Template"
          variant="danger"
        />
      )}

      {/* Restore Confirmation Dialog */}
      {confirmRestoreId && (
        <ConfirmDialog
          isOpen={Boolean(confirmRestoreId)}
          onClose={() => setConfirmRestoreId(null)}
          onConfirm={() => {
            if (confirmRestoreId) {
              restoreCommunicationTemplate(confirmRestoreId);
              setConfirmRestoreId(null);
            }
          }}
          title="Restore Template from Archive?"
          description="Restoring will return this template to Draft status, allowing you to review content before reactivating it."
          confirmLabel="Restore to Draft"
          variant="primary"
        />
      )}
    </div>
  );
}
