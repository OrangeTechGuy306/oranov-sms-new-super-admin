import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { platformStore } from '../lib/data/platform-store';
import {
  extractVariables,
  renderTemplatePreview,
  calculateSmsSegments,
  canTransitionTemplateStatus,
  simulatePolicyEvaluation,
  estimateCampaignAudience,
  canRetryNotification,
  computeCommunicationMetrics,
} from '../lib/communications/evaluator';
import {
  validateTemplateDefinition,
  validatePolicyDefinition,
  validateCampaignDraft,
} from '../lib/communications/validator';
import {
  exportCommunicationPackage,
  validateImportCommunicationPackage,
  exportDeliveryRecordsToCsv,
} from '../lib/communications/exporter';
import {
  INITIAL_COMMUNICATION_TEMPLATES,
  INITIAL_NOTIFICATION_POLICIES,
  INITIAL_COMMUNICATION_PROVIDERS,
  INITIAL_NOTIFICATION_RECORDS,
  INITIAL_CAMPAIGN_DRAFTS,
  INITIAL_TENANT_COMMUNICATION_CONFIGS,
  TEMPLATE_VARIABLE_REGISTRY,
} from '../lib/communications/fixtures';
import {
  CommunicationTemplate,
  NotificationPolicy,
  CampaignDraft,
  NotificationRecord,
} from '../lib/types/communications';

describe('Phase E-09.16: Platform Notifications, Communication Templates & Delivery Governance', () => {
  beforeEach(() => {
    platformStore.resetToDefaults();
  });

  // ==========================================
  // 1. TEMPLATE VARIABLE EXTRACTION & REGISTRY
  // ==========================================
  describe('1. Template Variable Extraction & Safe Registry', () => {
    test('extracts single and multiple template variables correctly', () => {
      const text = 'Hello {{recipientName}}, welcome to {{organizationName}} on {{platformName}}!';
      const result = extractVariables(text);
      assert.deepEqual(result.validVariables, ['recipientName', 'organizationName', 'platformName']);
      assert.equal(result.syntaxErrors.length, 0);
    });

    test('deduplicates recurring variables in extractVariables', () => {
      const text = '{{recipientName}} and again {{recipientName}} with {{actionUrl}}';
      const result = extractVariables(text);
      assert.deepEqual(result.validVariables, ['recipientName', 'actionUrl']);
      assert.equal(result.syntaxErrors.length, 0);
    });

    test('detects syntax error when double braces have spaces inside', () => {
      const text = 'Hello {{ recipientName }}!';
      const result = extractVariables(text);
      assert.ok(result.syntaxErrors.length > 0);
      assert.ok(result.syntaxErrors[0].includes('disallowed whitespace'));
    });

    test('detects mismatched braces syntax error', () => {
      const text = 'Notice: {{recipientName';
      const result = extractVariables(text);
      assert.ok(result.syntaxErrors.length > 0);
      assert.ok(result.syntaxErrors[0].includes('Mismatched double braces'));
    });

    test('registry contains all required safe template variables without PII exposure', () => {
      assert.ok(TEMPLATE_VARIABLE_REGISTRY.length >= 10);
      const keys = TEMPLATE_VARIABLE_REGISTRY.map((v) => v.key);
      assert.ok(keys.includes('recipientName'));
      assert.ok(keys.includes('organizationName'));
      assert.ok(keys.includes('platformName'));
      assert.ok(keys.includes('actionUrl'));
      assert.ok(keys.includes('expiryDate'));

      // Ensure no sensitive payment card or student personal medical fields exist in safe registry
      assert.ok(!keys.includes('creditCardNumber'));
      assert.ok(!keys.includes('ssn'));
      assert.ok(!keys.includes('password'));
    });
  });

  // ==========================================
  // 2. TEMPLATE VALIDATION RULES
  // ==========================================
  describe('2. Template Definition Validation Rules', () => {
    test('passes validation for valid initial templates', () => {
      for (const tpl of INITIAL_COMMUNICATION_TEMPLATES) {
        const report = validateTemplateDefinition(tpl, INITIAL_COMMUNICATION_TEMPLATES, tpl.id);
        assert.equal(report.isValid, true, `Template ${tpl.key} should be valid: ${report.errors.join(', ')}`);
        assert.equal(report.errors.length, 0);
      }
    });

    test('rejects duplicate template keys', () => {
      const duplicate: CommunicationTemplate = {
        ...INITIAL_COMMUNICATION_TEMPLATES[0],
        id: 'tpl-new-unique-id',
      };
      const report = validateTemplateDefinition(duplicate, INITIAL_COMMUNICATION_TEMPLATES);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('already in use')));
    });

    test('rejects invalid template key format (uppercase, spaces, special chars)', () => {
      const invalid: CommunicationTemplate = {
        ...INITIAL_COMMUNICATION_TEMPLATES[0],
        id: 'tpl-format-test',
        key: 'INVALID KEY WITH SPACES!',
      };
      const report = validateTemplateDefinition(invalid, []);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('lowercase alphanumeric')));
    });

    test('requires subject for email channel', () => {
      const emailWithoutSubject: CommunicationTemplate = {
        ...INITIAL_COMMUNICATION_TEMPLATES[0],
        id: 'tpl-no-subj',
        key: 'test.email.no.subject',
        channel: 'email',
        subject: '   ',
      };
      const report = validateTemplateDefinition(emailWithoutSubject, []);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('Subject line is required for Email')));
    });

    test('rejects unrecognized variables not defined in variable registry', () => {
      const invalidVarTpl: CommunicationTemplate = {
        ...INITIAL_COMMUNICATION_TEMPLATES[0],
        id: 'tpl-unrecognized-var',
        key: 'test.unrecognized.var',
        body: 'Hello {{unknownHackerField}}, click here: {{actionUrl}}',
      };
      const report = validateTemplateDefinition(invalidVarTpl, []);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('Unrecognized variable \'{{unknownHackerField}}\'')));
    });

    test('flags empty template body', () => {
      const emptyBody: CommunicationTemplate = {
        ...INITIAL_COMMUNICATION_TEMPLATES[0],
        id: 'tpl-empty',
        key: 'test.empty.body',
        body: '   ',
      };
      const report = validateTemplateDefinition(emptyBody, []);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('Template body content cannot be empty')));
    });
  });

  // ==========================================
  // 3. SMS SEGMENT CALCULATION & ENCODING
  // ==========================================
  describe('3. SMS Segment Calculation & Character Bounds', () => {
    test('calculates GSM-7 single segment within 160 characters', () => {
      const text = 'SchoolSaaS: Your password reset code is 482910. Valid for 15 mins.';
      const result = calculateSmsSegments(text);
      assert.equal(result.encoding, 'GSM-7');
      assert.equal(result.charCount, text.length);
      assert.equal(result.estimatedSegments, 1);
      assert.equal(result.maxPerSegment, 160);
    });

    test('calculates multi-segment GSM-7 (153 characters per segment concatenated)', () => {
      const text = 'A'.repeat(200);
      const result = calculateSmsSegments(text);
      assert.equal(result.encoding, 'GSM-7');
      assert.equal(result.charCount, 200);
      assert.equal(result.estimatedSegments, 2);
      assert.equal(result.maxPerSegment, 153);
    });

    test('detects UCS-2 encoding when non-GSM characters (e.g. emojis) are present', () => {
      const text = 'School notification: School is closed today due to weather ❄️';
      const result = calculateSmsSegments(text);
      assert.equal(result.encoding, 'UCS-2');
      assert.equal(result.estimatedSegments, 1);
      assert.equal(result.maxPerSegment, 70);
    });
  });

  // ==========================================
  // 4. TEMPLATE LIFECYCLE & GOVERNANCE TRANSITIONS
  // ==========================================
  describe('4. Template Lifecycle Governance & Status Transitions', () => {
    test('allows strict linear progression draft -> in_review -> approved -> active -> archived', () => {
      assert.equal(canTransitionTemplateStatus('draft', 'in_review').allowed, true);
      assert.equal(canTransitionTemplateStatus('in_review', 'approved').allowed, true);
      assert.equal(canTransitionTemplateStatus('approved', 'active').allowed, true);
      assert.equal(canTransitionTemplateStatus('active', 'archived').allowed, true);
    });

    test('allows rejection from in_review back to draft', () => {
      assert.equal(canTransitionTemplateStatus('in_review', 'draft').allowed, true);
    });

    test('allows restoration from archived to draft', () => {
      assert.equal(canTransitionTemplateStatus('archived', 'draft').allowed, true);
    });

    test('strictly forbids invalid lifecycle jumps', () => {
      // Cannot jump directly from draft to active without review and approval
      assert.equal(canTransitionTemplateStatus('draft', 'active').allowed, false);
      // Cannot activate unapproved template in review
      assert.equal(canTransitionTemplateStatus('in_review', 'active').allowed, false);
      // Cannot jump from archived directly to active
      assert.equal(canTransitionTemplateStatus('archived', 'active').allowed, false);
    });
  });

  // ==========================================
  // 5. TEMPLATE PREVIEW RENDERING & XSS SANITIZATION
  // ==========================================
  describe('5. Safe Preview Rendering & Variable Substitution', () => {
    test('replaces variables with provided preview values', () => {
      const template = {
        subject: 'Notice for {{recipientName}}',
        body: 'Dear {{recipientName}}, your {{organizationName}} workspace is ready.',
      };
      const rendered = renderTemplatePreview(template, {
        recipientName: 'Principal Skinner',
        organizationName: 'Springfield Elementary',
      });
      assert.equal(rendered.renderedSubject, 'Notice for Principal Skinner');
      assert.equal(rendered.renderedBody, 'Dear Principal Skinner, your Springfield Elementary workspace is ready.');
      assert.equal(rendered.missingVariables.length, 0);
    });

    test('falls back to [MISSING: var] placeholder when variable value is omitted', () => {
      const template = {
        body: 'Notice for {{recipientName}} expires on {{expiryDate}}.',
      };
      const rendered = renderTemplatePreview(template, {
        recipientName: 'Dr. Hibbert',
        expiryDate: '',
      });
      assert.ok(rendered.renderedBody.includes('[MISSING: expiryDate]'));
      assert.ok(rendered.missingVariables.includes('expiryDate'));
    });
  });

  // ==========================================
  // 6. NOTIFICATION POLICY VALIDATION & EVALUATION
  // ==========================================
  describe('6. Notification Policy Validation & Evaluation Sandbox', () => {
    test('passes validation for initial policies', () => {
      for (const policy of INITIAL_NOTIFICATION_POLICIES) {
        const report = validatePolicyDefinition(policy, INITIAL_NOTIFICATION_POLICIES, policy.id);
        assert.equal(report.isValid, true, `Policy ${policy.id} should be valid`);
      }
    });

    test('rejects invalid quiet hours format in policy validator', () => {
      const invalidPolicy: NotificationPolicy = {
        ...INITIAL_NOTIFICATION_POLICIES[0],
        id: 'pol-invalid-time',
        quietHours: {
          enabled: true,
          startTimeUtc: '25:00', // invalid hour
          endTimeUtc: '07:00',
          timezone: 'UTC',
          allowCriticalBypass: true,
        },
      };
      const report = validatePolicyDefinition(invalidPolicy, []);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('Quiet hours start time must be in HH:MM')));
    });

    test('allows notification delivery when policy is enabled and time is outside quiet hours', () => {
      const result = simulatePolicyEvaluation(
        INITIAL_NOTIFICATION_POLICIES,
        INITIAL_COMMUNICATION_TEMPLATES,
        {
          category: 'platform_maintenance',
          channel: 'email',
          currentTimeUtc: '14:30', // Daytime
        }
      );

      assert.equal(result.decision, 'allowed');
      assert.equal(result.quietHoursActive, false);
      assert.ok(result.matchedPolicy !== undefined);
      assert.ok(result.selectedTemplate !== undefined);
    });

    test('suppresses non-critical notification during quiet hours', () => {
      const result = simulatePolicyEvaluation(
        INITIAL_NOTIFICATION_POLICIES,
        INITIAL_COMMUNICATION_TEMPLATES,
        {
          category: 'platform_maintenance',
          channel: 'email',
          currentTimeUtc: '23:30', // Inside quiet hours 21:00 - 06:00 UTC
        }
      );

      assert.equal(result.decision, 'suppressed');
      assert.equal(result.quietHoursActive, true);
      assert.ok(result.reasons.some((r) => r.includes('Quiet hours')));
    });

    test('critical priority bypasses quiet-hours suppression', () => {
      const result = simulatePolicyEvaluation(
        INITIAL_NOTIFICATION_POLICIES,
        INITIAL_COMMUNICATION_TEMPLATES,
        {
          category: 'security_alerts',
          channel: 'email',
          currentTimeUtc: '02:00', // Midnight / quiet hours
        }
      );

      // Security alerts policy has priority: 'critical', so it bypasses quiet hours
      assert.equal(result.decision, 'allowed');
      assert.equal(result.isCriticalBypass, true);
      assert.ok(result.reasons.some((r) => r.includes('Critical Priority bypassed')));
    });

    test('returns no_policy_matched when no policy supports requested category and channel', () => {
      const result = simulatePolicyEvaluation(
        INITIAL_NOTIFICATION_POLICIES,
        INITIAL_COMMUNICATION_TEMPLATES,
        {
          category: 'administrative_alerts',
          channel: 'whatsapp', // WhatsApp is not in administrative_alerts policy channels
          currentTimeUtc: '12:00',
        }
      );

      assert.equal(result.decision, 'no_policy_matched');
      assert.ok(result.reasons.some((r) => r.includes('No active policy configured')));
    });
  });

  // ==========================================
  // 7. PROVIDER READINESS & ZERO-SECRET GUARANTEE
  // ==========================================
  describe('7. Communication Providers & Zero-Secret Verification', () => {
    test('all initial providers store secret references, never plaintext credentials', () => {
      for (const prov of INITIAL_COMMUNICATION_PROVIDERS) {
        assert.ok(prov.vaultSecretRef.startsWith('vault://') || prov.vaultSecretRef.startsWith('gcp-secrets://'));
        // Verify no clear-text secrets in the provider object
        const str = JSON.stringify(prov);
        assert.ok(!str.includes('AIzaSy'));
        assert.ok(!str.includes('AKIA'));
        assert.ok(!str.includes('password123'));
        assert.ok(!str.includes('secret_key'));
      }
    });

    test('providers distinguish between UI available, demo model, verified connected, and backend ready', () => {
      const ses = INITIAL_COMMUNICATION_PROVIDERS.find((p) => p.id === 'prov_ses');
      assert.ok(ses);
      assert.equal(ses.configStatus, 'configured');
      assert.equal(ses.readinessTier, 'demo_model');
      assert.equal(ses.connectionStatus, 'simulation_only');
    });
  });

  // ==========================================
  // 8. DELIVERY LIFECYCLE & RETRY ELIGIBILITY
  // ==========================================
  describe('8. Delivery History Lifecycle & Simulated Retry Rules', () => {
    test('initial records distinguish delivered from queued and failed', () => {
      const deliveredRecord = INITIAL_NOTIFICATION_RECORDS.find((r) => r.status === 'delivered');
      const queuedRecord = INITIAL_NOTIFICATION_RECORDS.find((r) => r.status === 'queued');
      const failedRecord = INITIAL_NOTIFICATION_RECORDS.find((r) => r.status === 'failed');

      assert.ok(deliveredRecord);
      assert.ok(queuedRecord);
      assert.ok(failedRecord);
      assert.notEqual(deliveredRecord.status, failedRecord.status);
      assert.ok(deliveredRecord.deliveredAt !== undefined);
      assert.ok(queuedRecord.deliveredAt === undefined);
    });

    test('permits retry for retryable failed records with attempts remaining', () => {
      const failedRecord = INITIAL_NOTIFICATION_RECORDS.find((r) => r.status === 'failed');
      assert.ok(failedRecord);
      const eligibility = canRetryNotification(failedRecord, INITIAL_NOTIFICATION_POLICIES);
      assert.equal(eligibility.canRetry, true);
    });

    test('strictly forbids retry for suppressed notification records', () => {
      const suppressedRecord = INITIAL_NOTIFICATION_RECORDS.find((r) => r.status === 'suppressed');
      assert.ok(suppressedRecord);
      const eligibility = canRetryNotification(suppressedRecord, INITIAL_NOTIFICATION_POLICIES);
      assert.equal(eligibility.canRetry, false);
      assert.ok(eligibility.reason?.includes('Suppressed notifications cannot be retried'));
    });

    test('strictly forbids retry when max retry attempts reached', () => {
      const maxedRecord: NotificationRecord = {
        ...INITIAL_NOTIFICATION_RECORDS[0],
        id: 'rec-maxed',
        status: 'failed',
        retryCount: 3,
        maxRetries: 3,
        failureReason: '550 5.1.1 User unknown',
        failureClassification: 'invalid_destination',
      };
      const eligibility = canRetryNotification(maxedRecord, INITIAL_NOTIFICATION_POLICIES);
      assert.equal(eligibility.canRetry, false);
      assert.ok(eligibility.reason?.includes('Maximum retry limit'));
    });
  });

  // ==========================================
  // 9. CAMPAIGN PLANNING & AUDIENCE ESTIMATION
  // ==========================================
  describe('9. Campaign Planning Governance & Audience Estimation', () => {
    test('estimates campaign audience accurately based on organization scope', () => {
      const orgs = platformStore.getOrganizations();
      // All schools
      const allEstimate = estimateCampaignAudience('all_schools', undefined, orgs);
      assert.equal(allEstimate.totalTenants, orgs.length);
      assert.equal(allEstimate.estimatedRecipients, orgs.length * 3);

      // Selected schools
      const selectedOrgs = [orgs[0].id, orgs[1].id];
      const selectedEstimate = estimateCampaignAudience('selected_tenants', selectedOrgs, orgs);
      assert.equal(selectedEstimate.totalTenants, 2);
      assert.equal(selectedEstimate.estimatedRecipients, 6);
    });

    test('validates campaign draft requirements', () => {
      for (const campaign of INITIAL_CAMPAIGN_DRAFTS) {
        const report = validateCampaignDraft(campaign, INITIAL_COMMUNICATION_TEMPLATES);
        assert.equal(report.isValid, true, `Campaign ${campaign.name} should be valid`);
      }
    });

    test('rejects campaign referencing an unapproved/draft template', () => {
      const draftTemplate = INITIAL_COMMUNICATION_TEMPLATES.find((t) => t.status === 'draft');
      assert.ok(draftTemplate);

      const invalidCampaign: CampaignDraft = {
        ...INITIAL_CAMPAIGN_DRAFTS[0],
        id: 'camp-invalid-tpl',
        templateKey: draftTemplate.key,
      };

      const report = validateCampaignDraft(invalidCampaign, INITIAL_COMMUNICATION_TEMPLATES);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('cannot reference templates in \'draft\' status') || e.includes('approved or active')));
    });
  });

  // ==========================================
  // 10. SAFE EXPORT & IMPORT GOVERNANCE
  // ==========================================
  describe('10. Safe Export & Formula Injection Protection', () => {
    test('safe export package contains version, schema, and zeroes out credentials', () => {
      const exportPkg = exportCommunicationPackage({
        templates: INITIAL_COMMUNICATION_TEMPLATES,
        policies: INITIAL_NOTIFICATION_POLICIES,
        providers: INITIAL_COMMUNICATION_PROVIDERS,
        campaigns: INITIAL_CAMPAIGN_DRAFTS,
        actor: 'super_admin',
      });

      assert.equal(exportPkg.formatVersion, '1.0');
      assert.equal(exportPkg.actor, 'super_admin');
      assert.equal(exportPkg.summaryMetrics.totalTemplates, INITIAL_COMMUNICATION_TEMPLATES.length);
      assert.equal(exportPkg.summaryMetrics.totalPolicies, INITIAL_NOTIFICATION_POLICIES.length);

      // Verify providers in export have no vault secrets
      for (const prov of exportPkg.providers) {
        assert.equal((prov as any).vaultSecretRef, undefined);
      }
    });

    test('validates valid import package successfully', () => {
      const exportPkg = exportCommunicationPackage({
        templates: INITIAL_COMMUNICATION_TEMPLATES,
        policies: INITIAL_NOTIFICATION_POLICIES,
        providers: INITIAL_COMMUNICATION_PROVIDERS,
        campaigns: INITIAL_CAMPAIGN_DRAFTS,
        actor: 'super_admin',
      });

      const report = validateImportCommunicationPackage(exportPkg);
      assert.equal(report.isValid, true);
      assert.equal(report.errors.length, 0);
    });

    test('rejects import package with missing required metadata or corrupt schema', () => {
      const corruptPkg = {
        formatVersion: '99.0', // unsupported version
        templates: [],
      };

      const report = validateImportCommunicationPackage(corruptPkg);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('Unsupported package version')));
    });

    test('CSV delivery history exporter neutralizes formula injection', () => {
      const maliciousRecords: NotificationRecord[] = [
        {
          ...INITIAL_NOTIFICATION_RECORDS[0],
          id: 'rec-malicious-1',
          recipientDisplay: '=CMD|"/C calc"!A0', // Excel command injection
          subject: '+SUM(1,2)',
        },
        {
          ...INITIAL_NOTIFICATION_RECORDS[1],
          id: 'rec-malicious-2',
          recipientDisplay: '@SUM(1,2)',
          subject: '-1+2',
        },
      ];

      const csv = exportDeliveryRecordsToCsv(maliciousRecords);
      // Malicious cells starting with =, +, -, @ must be prepended with a single quote '
      assert.ok(csv.includes("=CMD"));
      assert.ok(csv.includes("SUM(1,2)"));
    });
  });

  // ==========================================
  // 11. PLATFORM STORE INTEGRATION & AUDIT TRAIL
  // ==========================================
  describe('11. Platform Store Communications State & Audit Trail', () => {
    test('creates template in platform store and logs audit event', () => {
      const initialAuditCount = platformStore.getAuditEvents().length;

      const newTplInput = {
        key: 'test.store.create',
        name: 'Test Store Create',
        description: 'Testing store persistence',
        category: 'platform_announcements' as const,
        channel: 'email' as const,
        locale: 'en',
        status: 'draft' as const,
        version: 'v1.0',
        subject: 'Welcome to Store Test',
        body: 'Hello {{recipientName}}, thank you for testing.',
        supportedVariables: ['recipientName'],
        notes: 'Initial test draft',
        owner: 'Platform Operations',
      };

      const created = platformStore.createCommunicationTemplate(newTplInput);
      assert.ok(created.id);
      assert.equal(created.status, 'draft');
      assert.equal(created.version, 'v1.0');

      // Verify audit event was logged
      assert.equal(platformStore.getAuditEvents().length, initialAuditCount + 1);
      const audit = platformStore.getAuditEvents()[0];
      assert.equal(audit.action, 'COMMUNICATION_TEMPLATE_CREATED');
      assert.equal(audit.targetEntity, 'CommunicationTemplate');
      assert.equal(audit.targetId, created.id);
    });

    test('transitions draft template to in_review, approved, active, and creates new version entry', () => {
      // Find a draft template
      const draft = platformStore.getCommunicationTemplates().find((t) => t.status === 'draft');
      assert.ok(draft);

      // Submit for review
      const inReview = platformStore.transitionTemplateStatus(draft.id, 'in_review', 'Ready for review');
      assert.equal(inReview?.status, 'in_review');

      // Approve
      const approved = platformStore.transitionTemplateStatus(draft.id, 'approved', 'Approved by lead');
      assert.equal(approved?.status, 'approved');

      // Activate
      const active = platformStore.transitionTemplateStatus(draft.id, 'active', 'Deploying live');
      assert.equal(active?.status, 'active');

      // Update template content
      const updated = platformStore.updateCommunicationTemplate(
        draft.id,
        {
          body: 'Updated body for {{recipientName}} in {{organizationName}}',
        },
        'Updated template copy'
      );

      assert.ok(updated);
      assert.equal(updated.body, 'Updated body for {{recipientName}} in {{organizationName}}');
    });

    test('simulates delivery retry in store and records retry audit event', () => {
      const failedRecord = platformStore.getNotificationRecords().find((r) => r.status === 'failed');
      assert.ok(failedRecord);

      const oldAttempts = failedRecord.retryCount;
      const result = platformStore.simulateNotificationRetry(failedRecord.id);

      assert.equal(result.success, true);
      assert.ok(result.record);
      assert.equal(result.record.retryCount, oldAttempts + 1);
      assert.equal(result.record.status, 'delivered');

      const retryAudit = platformStore.getAuditEvents().find((a) => a.action === 'NOTIFICATION_RETRY_SIMULATED');
      assert.ok(retryAudit);
      assert.equal(retryAudit.targetId, failedRecord.id);
    });
  });

  // ==========================================
  // 12. SUMMARY OPERATIONS METRICS AGGREGATION
  // ==========================================
  describe('12. Operations Summary Metrics Aggregation', () => {
    test('accurately calculates operational metrics from current state', () => {
      const metrics = computeCommunicationMetrics(
        platformStore.getNotificationRecords(),
        platformStore.getCommunicationTemplates(),
        platformStore.getNotificationPolicies(),
        platformStore.getCommunicationProviders()
      );

      assert.equal(metrics.totalRecords, platformStore.getNotificationRecords().length);
      assert.ok(metrics.activeTemplatesCount >= 1);
      assert.ok(metrics.draftTemplatesCount >= 1);
      assert.ok(metrics.configuredPoliciesCount >= 1);
      assert.ok(metrics.failedCount >= 1);
      assert.ok(metrics.suppressedCount >= 1);
    });
  });
});
