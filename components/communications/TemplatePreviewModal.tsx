'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { CommunicationTemplate } from '@/lib/types/communications';
import { TEMPLATE_VARIABLE_REGISTRY } from '@/lib/communications/fixtures';
import { renderTemplatePreview, calculateSmsSegments } from '@/lib/communications/evaluator';
import {
  Smartphone,
  Bell,
  Send,
  Globe,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: CommunicationTemplate | null;
  onSendSimulation?: (templateId: string, testRecipient: string, variables: Record<string, string>) => void;
}

interface TemplatePreviewContentProps {
  template: CommunicationTemplate;
  onSendSimulation?: (templateId: string, testRecipient: string, variables: Record<string, string>) => void;
  onClose: () => void;
}

function TemplatePreviewContent({
  template,
  onSendSimulation,
  onClose,
}: TemplatePreviewContentProps) {
  // Selected locale for preview
  const [activeLocale, setActiveLocale] = useState(template.locale || 'en-US');

  // Custom preview variables state
  const initialVars: Record<string, string> = {};
  for (const def of TEMPLATE_VARIABLE_REGISTRY) {
    initialVars[def.key] = def.exampleValue;
  }
  const [customVars, setCustomVars] = useState<Record<string, string>>(initialVars);
  const [showVariableEditor, setShowVariableEditor] = useState(false);

  // Simulation Dispatch State
  const [testRecipient, setTestRecipient] = useState(
    template.channel === 'email'
      ? 'principal.demo@oakhill.internal'
      : template.channel === 'sms'
      ? '+1 (555) 019-2834'
      : template.channel === 'whatsapp'
      ? '+1 (555) 234-8902'
      : 'device_token_demo_safari_macos'
  );
  const [simulationSent, setSimulationSent] = useState(false);

  // Render preview
  const preview = renderTemplatePreview(
    { subject: template.subject, body: template.body },
    customVars
  );

  const smsCalc = template.channel === 'sms' ? calculateSmsSegments(preview.renderedBody) : null;

  const handleDispatchSimulation = () => {
    if (onSendSimulation) {
      onSendSimulation(template.id, testRecipient, customVars);
      setSimulationSent(true);
      setTimeout(() => setSimulationSent(false), 4000);
    }
  };

  return (
    <div className="space-y-5">
        {/* Top Controls: Channel Badge, Locale Switcher, Variable Tweaker Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/20 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Channel Mode:</span>
            <span className="font-mono uppercase text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
              {template.channel}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="font-mono text-muted-foreground">{template.key}</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-mono text-[11px] bg-muted px-1.5 py-0.2 rounded">{template.version}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={activeLocale}
                onChange={(e) => setActiveLocale(e.target.value)}
                className="text-xs bg-background border border-border rounded px-2 py-1 font-mono focus:outline-none"
              >
                <option value="en-US">en-US</option>
                <option value="en-GB">en-GB</option>
                <option value="fr-FR">fr-FR</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowVariableEditor(!showVariableEditor)}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              {showVariableEditor ? 'Hide Test Variables' : 'Edit Test Variables'}
            </button>
          </div>
        </div>

        {/* Missing Variable Warnings */}
        {preview.missingVariables.length > 0 && (
          <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              Missing values for variables: <strong>{preview.missingVariables.join(', ')}</strong>. Placeholder tokens are shown in preview.
            </span>
          </div>
        )}

        {/* Collapsible Variable Tweaker */}
        {showVariableEditor && (
          <div className="p-3.5 rounded-lg border border-border bg-background space-y-3">
            <span className="text-xs font-semibold text-foreground block">
              Customize Preview Sample Values (Safe Demo Values Only)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              {TEMPLATE_VARIABLE_REGISTRY.map((v) => (
                <div key={v.key}>
                  <label className="text-[10.5px] font-mono text-muted-foreground block truncate">
                    {`{{${v.key}}}`}
                  </label>
                  <input
                    type="text"
                    value={customVars[v.key] || ''}
                    onChange={(e) =>
                      setCustomVars((prev) => ({ ...prev, [v.key]: e.target.value }))
                    }
                    className="w-full text-xs px-2 py-1 rounded border border-border bg-muted/20 focus:bg-background focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHANNEL SPECIFIC VISUAL MOCKUPS */}

        {/* 1. EMAIL PREVIEW FRAME */}
        {template.channel === 'email' && (
          <div className="rounded-xl border border-border shadow-xs overflow-hidden bg-card">
            {/* Email Header Chrome */}
            <div className="bg-muted/40 p-3.5 border-b border-border space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-16 text-muted-foreground font-semibold">From:</span>
                <span className="font-mono text-foreground">
                  School Management Platform Notifications &lt;notifications@schoolsaas.internal&gt;
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 text-muted-foreground font-semibold">To:</span>
                <span className="font-mono text-foreground">{testRecipient}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 text-muted-foreground font-semibold">Subject:</span>
                <span className="font-semibold text-foreground">{preview.renderedSubject || '(No Subject)'}</span>
              </div>
            </div>

            {/* Email Body */}
            <div className="p-6 bg-background min-h-[180px] text-xs font-sans whitespace-pre-wrap leading-relaxed text-foreground">
              {preview.renderedBody}
            </div>

            {/* Email Footer Disclaimer */}
            <div className="p-3 bg-muted/20 border-t border-border text-[11px] text-muted-foreground text-center">
              Sent automatically by SchoolSaaS Multi-Tenant Notification Service • Simulated Preview
            </div>
          </div>
        )}

        {/* 2. SMS (CELLULAR PHONE FRAME) */}
        {template.channel === 'sms' && (
          <div className="max-w-md mx-auto rounded-3xl border-2 border-border shadow-md overflow-hidden bg-background">
            <div className="bg-muted p-2.5 text-center text-[11px] font-mono border-b border-border text-muted-foreground">
              Mobile Handset Simulation • {testRecipient}
            </div>
            <div className="p-4 bg-muted/10 min-h-[220px] flex flex-col justify-end space-y-2">
              <div className="self-start max-w-[85%] p-3 rounded-2xl rounded-bl-xs bg-primary text-primary-foreground text-xs leading-relaxed shadow-xs whitespace-pre-wrap font-sans">
                {preview.renderedBody}
              </div>
              <span className="text-[10px] text-muted-foreground self-start pl-1">Delivered via Cellular Gateway</span>
            </div>
            {smsCalc && (
              <div className="bg-muted/30 p-2 text-center text-[11px] text-muted-foreground border-t border-border font-mono">
                {smsCalc.charCount} Characters • {smsCalc.estimatedSegments} SMS Segment(s) • {smsCalc.encoding}
              </div>
            )}
          </div>
        )}

        {/* 3. IN-APP BANNER TOAST */}
        {template.channel === 'in_app' && (
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Bell className="w-4 h-4" />
              <span>In-App Console Toast & Notification Banner</span>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-background shadow-xs text-xs space-y-1">
              <span className="font-semibold text-foreground block">
                {preview.renderedSubject || 'System Alert'}
              </span>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {preview.renderedBody}
              </p>
            </div>
            <span className="text-[10.5px] text-muted-foreground block">
              Rendered in Super-Admin and Tenant School dashboards via Platform WebSocket Broker.
            </span>
          </div>
        )}

        {/* 4. MOBILE PUSH NOTIFICATION */}
        {template.channel === 'push' && (
          <div className="max-w-md mx-auto p-4 rounded-2xl border border-border bg-gradient-to-b from-muted/30 to-background shadow-md space-y-3">
            <div className="text-center text-[11px] text-muted-foreground font-mono">
              Lock Screen Push Notification (FCM / APNs)
            </div>
            <div className="p-3.5 rounded-xl border border-border/80 bg-background/90 backdrop-blur shadow-sm space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-primary" />
                  SchoolSaaS
                </span>
                <span>now</span>
              </div>
              <span className="font-bold text-foreground block">
                {preview.renderedSubject || 'Security Alert'}
              </span>
              <p className="text-muted-foreground text-[11.5px] line-clamp-3">
                {preview.renderedBody}
              </p>
            </div>
          </div>
        )}

        {/* 5. WHATSAPP CHAT BUBBLE */}
        {template.channel === 'whatsapp' && (
          <div className="max-w-md mx-auto rounded-2xl border border-border overflow-hidden shadow-sm bg-muted/15">
            <div className="bg-emerald-600 dark:bg-emerald-800 text-white p-2.5 text-xs font-semibold flex items-center justify-between">
              <span>WhatsApp Cloud API Simulation</span>
              <span className="text-[10px] font-mono opacity-80">{testRecipient}</span>
            </div>
            <div className="p-4 min-h-[180px] flex flex-col justify-end space-y-2">
              <div className="self-start max-w-[85%] p-3 rounded-xl rounded-tl-xs bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {preview.renderedBody}
                <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground mt-1">
                  <span>14:32</span>
                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOCAL TEST DISPATCH SIMULATION PANEL */}
        <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Dispatch Local Demonstration Test
              </span>
            </div>
            <Badge variant="neutral">Simulation Only</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Enqueue a simulated delivery event to the local delivery history log. Demonstrates status transitions and timeline event creation without making external API requests.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="Synthetic recipient address / phone"
              className="flex-1 w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={handleDispatchSimulation}
              disabled={simulationSent || !testRecipient.trim()}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {simulationSent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  Simulated Dispatch Recorded
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Test Simulation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dialog Close */}
        <div className="flex items-center justify-end pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
  );
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  onSendSimulation,
}: TemplatePreviewModalProps) {
  if (!isOpen || !template) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Channel Preview: ${template.name}`}
      description="Inspect cross-channel presentation, test variable interpolation, and trigger simulated dispatches."
      size="xl"
    >
      <TemplatePreviewContent
        key={template.id}
        template={template}
        onSendSimulation={onSendSimulation}
        onClose={onClose}
      />
    </Modal>
  );
}
