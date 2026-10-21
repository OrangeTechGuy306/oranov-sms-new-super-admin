'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  SupportCategoryKey,
  SupportTicketPriority,
  TicketSource,
  CreateSupportTicketInput,
} from '@/lib/types/support-desk';
import { SUPPORT_CATEGORIES } from '@/lib/support/fixtures';
import { X, Plus, AlertCircle, LifeBuoy, Building2 } from 'lucide-react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrgId?: string;
}

export function CreateTicketModal({ isOpen, onClose, initialOrgId }: CreateTicketModalProps) {
  const { organizations, platformUsers, supportTeams, slaPolicies, createSupportTicket } = usePlatformStore();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [organizationId, setOrganizationId] = useState(initialOrgId || (organizations[0]?.id || ''));
  const [category, setCategory] = useState<SupportCategoryKey>('general_assistance');
  const [priority, setPriority] = useState<SupportTicketPriority>('normal');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterRole, setRequesterRole] = useState('School Administrator');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [assignedOperatorId, setAssignedOperatorId] = useState('');
  const [assignedTeamId, setAssignedTeamId] = useState('team_tier1');
  const [slaPolicyId, setSlaPolicyId] = useState(slaPolicies[0]?.id || 'sla_growth_silver');
  const [source, setSource] = useState<TicketSource>('portal');
  const [tagsInput, setTagsInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-populate requester when organization changes
  const handleOrgChange = (orgId: string) => {
    setOrganizationId(orgId);
    const org = organizations.find((o) => o.id === orgId);
    if (org?.administrator) {
      setRequesterName(org.administrator.name);
      setRequesterEmail(org.administrator.email);
      setRequesterRole(org.administrator.roleTitle || 'School Administrator');
      setRequesterPhone(org.administrator.phone || '');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const input: CreateSupportTicketInput = {
      subject,
      description,
      organizationId,
      category,
      priority,
      requester: {
        name: requesterName,
        email: requesterEmail,
        roleTitle: requesterRole,
        phone: requesterPhone || undefined,
      },
      assignedOperatorId: assignedOperatorId || null,
      assignedTeamId: assignedTeamId || null,
      slaPolicyId,
      source,
      tags,
    };

    const res = createSupportTicket(input);
    if (res.success) {
      onClose();
    } else {
      setFormError(res.error || 'Failed to create support ticket.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-2xl p-6 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Create Support Ticket</h3>
              <p className="text-xs text-muted-foreground">
                Register a new assistance case for a school organization in local development state.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Notice */}
        <div className="p-2.5 rounded-lg bg-muted/60 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary shrink-0" />
          <span>
            Demonstration mode: Ticket will be added to the local mock store and audited in the platform log. No external email or webhook is sent.
          </span>
        </div>

        {formError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Organization Selection */}
          <div className="space-y-1">
            <label className="font-medium text-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              School Organization <span className="text-red-500">*</span>
            </label>
            <select
              value={organizationId}
              onChange={(e) => handleOrgChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              required
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.code}) • {org.classification}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Line */}
          <div className="space-y-1">
            <label className="font-medium text-foreground">
              Subject Line <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. CBT test session lockout during Grade 10 midterm examination"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              required
              minLength={5}
            />
          </div>

          {/* Category, Priority & SLA Policy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-foreground">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportCategoryKey)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              >
                {SUPPORT_CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground">
                Priority Tier <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SupportTicketPriority)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="low">Low (Standard backlog)</option>
                <option value="normal">Normal (Routine operations)</option>
                <option value="high">High (Time-sensitive milestone)</option>
                <option value="urgent">Urgent (Active disruption)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground">
                Applicable SLA Policy
              </label>
              <select
                value={slaPolicyId}
                onChange={(e) => setSlaPolicyId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              >
                {slaPolicies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-medium text-foreground">
              Description & Context <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the tenant's assistance inquiry..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              required
              minLength={10}
            />
          </div>

          {/* Requester Contact Coordinates */}
          <div className="p-3.5 rounded-lg border border-border bg-muted/30 space-y-3">
            <h4 className="text-xs font-semibold text-foreground">
              School Requester Information (Zero Student PII)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">
                  Requester Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="e.g. Dr. Eleanor Vance"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  placeholder="e.g. admin@school.edu"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">
                  Role Title
                </label>
                <input
                  type="text"
                  value={requesterRole}
                  onChange={(e) => setRequesterRole(e.target.value)}
                  placeholder="e.g. Principal, IT Administrator, Head of Exams"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={requesterPhone}
                  onChange={(e) => setRequesterPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Assignment & Intake Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-foreground">
                Assign Operator
              </label>
              <select
                value={assignedOperatorId}
                onChange={(e) => setAssignedOperatorId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="">Leave Unassigned</option>
                {platformUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground">
                Target Team Queue
              </label>
              <select
                value={assignedTeamId}
                onChange={(e) => setAssignedTeamId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              >
                {supportTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground">
                Intake Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as TicketSource)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="portal">School Portal</option>
                <option value="email">Inbound Email</option>
                <option value="in_app">In-App Chat / Widget</option>
                <option value="phone">Phone Support</option>
                <option value="system">Automated Health Trigger</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="font-medium text-foreground">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. cbt-exam, hall-b, midterms"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Support Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
