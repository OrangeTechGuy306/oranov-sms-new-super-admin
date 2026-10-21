'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CommunicationTemplate, TemplateCategory, ChannelType, TemplateStatus } from '@/lib/types/communications';
import { TEMPLATE_VARIABLE_REGISTRY } from '@/lib/communications/fixtures';
import { validateTemplateDefinition } from '@/lib/communications/validator';
import { extractVariables, calculateSmsSegments } from '@/lib/communications/evaluator';
import { AlertCircle, Info, Sparkles, Check } from 'lucide-react';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit?: CommunicationTemplate | null;
  existingTemplates: CommunicationTemplate[];
  onSave: (templateData: Partial<CommunicationTemplate>, changeSummary?: string) => void;
}

interface TemplateEditorFormProps {
  templateToEdit?: CommunicationTemplate | null;
  existingTemplates: CommunicationTemplate[];
  onSave: (templateData: Partial<CommunicationTemplate>, changeSummary?: string) => void;
  onClose: () => void;
}

function TemplateEditorForm({
  templateToEdit,
  existingTemplates,
  onSave,
  onClose,
}: TemplateEditorFormProps) {
  const isEditing = Boolean(templateToEdit);

  // Form State initialized directly from props without useEffect
  const [name, setName] = useState(templateToEdit?.name || '');
  const [key, setKey] = useState(templateToEdit?.key || 'tpl.');
  const [description, setDescription] = useState(templateToEdit?.description || '');
  const [category, setCategory] = useState<TemplateCategory>(
    templateToEdit?.category || 'account_verification'
  );
  const [channel, setChannel] = useState<ChannelType>(templateToEdit?.channel || 'email');
  const [locale, setLocale] = useState(templateToEdit?.locale || 'en-US');
  const [subject, setSubject] = useState(templateToEdit?.subject || '');
  const [body, setBody] = useState(templateToEdit?.body || '');
  const [status, setStatus] = useState<TemplateStatus>(templateToEdit?.status || 'draft');
  const [reviewNotes, setReviewNotes] = useState(templateToEdit?.reviewNotes || '');
  const [owner, setOwner] = useState(templateToEdit?.owner || 'Super-Admin Team');
  const [changeSummary, setChangeSummary] = useState(
    isEditing ? '' : 'Initial template creation.'
  );

  // Run validation
  const currentPayload: Partial<CommunicationTemplate> = {
    name,
    key,
    description,
    category,
    channel,
    locale,
    subject: channel === 'email' ? subject : subject || undefined,
    body,
    status,
    supportedVariables: extractVariables(`${subject} ${body}`).validVariables,
    reviewNotes,
    owner,
  };

  const validation = validateTemplateDefinition(
    currentPayload,
    existingTemplates,
    templateToEdit?.id
  );

  const smsCalc = channel === 'sms' ? calculateSmsSegments(body) : null;

  const handleInsertVariable = (varKey: string) => {
    setBody((prev) => `${prev} {{${varKey}}}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;

    onSave(
      currentPayload,
      changeSummary || (isEditing ? 'Updated template fields.' : 'Created template.')
    );
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Template Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Password Reset Verification"
            className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Stable Template Key <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            placeholder="e.g. tpl.auth.password_reset"
            className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
            required
          />
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            Alphanumeric with dots/underscores. Must be globally unique.
          </span>
        </div>
      </div>

      {/* Category, Channel, Locale & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TemplateCategory)}
            className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="account_verification">Account Verification</option>
            <option value="password_reset">Password Reset</option>
            <option value="welcome_onboarding">Welcome & Onboarding</option>
            <option value="org_provisioning">Org Provisioning</option>
            <option value="subscription_billing">Subscription & Billing</option>
            <option value="platform_maintenance">Platform Maintenance</option>
            <option value="security_alerts">Security Alerts</option>
            <option value="administrative_alerts">Administrative Alerts</option>
            <option value="school_onboarding">School Onboarding</option>
            <option value="platform_announcements">Platform Announcements</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Channel <span className="text-red-500">*</span>
          </label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as ChannelType)}
            className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="email">Email</option>
            <option value="sms">SMS (Cellular)</option>
            <option value="in_app">In-App Notification</option>
            <option value="push">Mobile Push (FCM)</option>
            <option value="whatsapp">WhatsApp (Cloud API)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Locale <span className="text-red-500">*</span>
          </label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="fr-FR">Français (FR)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Lifecycle Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TemplateStatus)}
            className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Subject (Mandatory for email, optional for push/in_app) */}
      {(channel === 'email' || channel === 'push' || channel === 'in_app') && (
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Subject Line {channel === 'email' && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Reset your {{platformName}} password for {{organizationName}}"
            className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none font-mono"
          />
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            Variables such as <code>{`{{organizationName}}`}</code> can be inserted in subject lines.
          </span>
        </div>
      )}

      {/* Variable Helper Palette */}
      <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Registered Template Variables
          </span>
          <span className="text-[11px] text-muted-foreground">Click variable to append to message body</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_VARIABLE_REGISTRY.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => handleInsertVariable(v.key)}
              className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-border/70 bg-background hover:bg-primary/10 hover:border-primary/40 text-foreground transition-colors"
              title={`${v.label} (${v.description}) - Ex: ${v.exampleValue}`}
            >
              + {`{{${v.key}}}`}
            </button>
          ))}
        </div>
      </div>

      {/* Body Content Area */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-foreground">
            Template Body Content <span className="text-red-500">*</span>
          </label>
          {smsCalc && (
            <span className="text-[11px] text-muted-foreground font-mono">
              {smsCalc.charCount} chars • {smsCalc.estimatedSegments} segment(s) ({smsCalc.encoding})
            </span>
          )}
        </div>
        <textarea
          rows={7}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type your template content here with {{variables}}..."
          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none font-mono leading-relaxed"
          required
        />
      </div>

      {/* Description & Change Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Internal Description & Purpose
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Standard account recovery link for administrators"
            className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Change Summary (Version History Note)
          </label>
          <input
            type="text"
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="e.g. Added expiration note to meet security guidelines"
            className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Live Validation Feedback */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="p-3 rounded-lg border border-border text-xs space-y-1.5 bg-muted/10">
          {validation.errors.map((err, i) => (
            <div key={i} className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
          {validation.warnings.map((warn, i) => (
            <div key={i} className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11.5px]">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Dialog Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!validation.isValid}
          className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          {isEditing ? 'Save Template Changes' : 'Create Template'}
        </button>
      </div>
    </form>
  );
}

export function TemplateEditorModal({
  isOpen,
  onClose,
  templateToEdit,
  existingTemplates,
  onSave,
}: TemplateEditorModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={templateToEdit ? `Edit Template: ${templateToEdit.name}` : 'Create Communication Template'}
      description="Define notification content, interpolate registered variables, and set channel requirements."
      size="xl"
    >
      <TemplateEditorForm
        key={templateToEdit?.id || 'new'}
        templateToEdit={templateToEdit}
        existingTemplates={existingTemplates}
        onSave={onSave}
        onClose={onClose}
      />
    </Modal>
  );
}
