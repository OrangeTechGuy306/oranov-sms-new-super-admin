/**
 * Domain contracts for Platform Compliance, Security Events,
 * Evidence Tracking, and Data Retention Governance (Phase E-09.13).
 *
 * NOTE: These models represent governance specifications, control inventories,
 * and sandbox demonstrations for the Super-Admin platform.
 * Client-side records do not constitute legal compliance certifications,
 * cryptographic audits, or immutable evidence logs.
 */

import { AuditActor } from './audit-logs';

export type SecurityEventCategory =
  | 'privilege_escalation'
  | 'suspicious_configuration'
  | 'failed_operation'
  | 'integration_degradation'
  | 'unauthorized_attempt'
  | 'credential_policy';

export type SecurityEventSeverity = 'informational' | 'low' | 'medium' | 'high' | 'critical';

export type SecurityTriageStatus =
  | 'unreviewed'
  | 'under_review'
  | 'acknowledged'
  | 'remediated'
  | 'dismissed';

export interface SecurityEvent {
  id: string;
  title: string;
  category: SecurityEventCategory;
  severity: SecurityEventSeverity;
  timestamp: string;
  relatedEntityType: string;
  relatedEntityId: string;
  actor: AuditActor;
  outcome: 'detected' | 'blocked' | 'succeeded' | 'flagged';
  triageStatus: SecurityTriageStatus;
  triageNotes?: string;
  triagedBy?: string;
  triagedAt?: string;
  sanitizedExplanation: string;
  suggestedRemediation: string;
  isSyntheticFixture: boolean;
  missingTelemetryNotice: boolean;
}

export type ComplianceDomain =
  | 'access_governance'
  | 'audit_logging'
  | 'data_privacy'
  | 'data_retention'
  | 'tenant_isolation'
  | 'financial_traceability'
  | 'incident_response'
  | 'backup_recovery'
  | 'change_management'
  | 'operational_monitoring';

export type ComplianceImplementationStatus =
  | 'implemented_verified'
  | 'partially_implemented'
  | 'planned'
  | 'not_implemented'
  | 'evidence_required'
  | 'not_assessed';

export type ComplianceEvidenceStatus = 'verified' | 'partial' | 'missing' | 'not_assessed';

export interface FrameworkMapping {
  framework: 'SOC 2' | 'ISO 27001' | 'GDPR' | 'FERPA' | 'COPPA';
  controlRef: string;
  description: string;
}

export interface ComplianceControl {
  id: string; // e.g. "CTL-ACC-01"
  name: string;
  domain: ComplianceDomain;
  description: string;
  controlOwnerRole: string; // e.g. "super_admin", "compliance_auditor"
  implementationStatus: ComplianceImplementationStatus;
  evidenceStatus: ComplianceEvidenceStatus;
  frameworkMappings: FrameworkMapping[];
  evidenceIds: string[];
  remediationNotes?: string;
  remediationTargetDate?: string;
  lastReviewedAt: string;
  sourceClassification: 'verified_in_code' | 'simulated_governance' | 'planned_specification';
}

export type GovernanceEvidenceType =
  | 'code_inspection'
  | 'test_suite_verification'
  | 'configuration_manifest'
  | 'architectural_specification'
  | 'audit_trail_sample';

export interface GovernanceEvidence {
  id: string; // e.g. "EVD-ACC-01"
  controlId: string;
  title: string;
  evidenceType: GovernanceEvidenceType;
  sourceReference: string; // e.g. "dashboard/tests/iam-governance.test.ts"
  collectionDate: string;
  reviewStatus: 'verified' | 'pending_inspection' | 'unavailable';
  reviewerLabel: string;
  isSynthetic: boolean;
  notes: string;
}

export type DataRetentionCategory =
  | 'admin_audit_logs'
  | 'security_events'
  | 'system_telemetry'
  | 'billing_financial'
  | 'tenant_documents'
  | 'student_academics';

export interface DataRetentionPolicy {
  id: string; // e.g. "RET-AUDIT-01"
  name: string;
  dataCategory: DataRetentionCategory;
  retentionDurationDays: number; // e.g. 365, 2555, -1 for indefinite
  retentionDisplay: string; // e.g. "365 Days (1 Year)", "7 Years (Statutory)"
  description: string;
  isEnabled: boolean;
  activeLegalHoldsCount: number;
  lastReviewedDate: string;
  requiredApprovals: string;
  complianceBasis: string;
  isDemonstrationOnly: true;
}

export interface AuditComplianceMetrics {
  totalAuditEvents: number;
  criticalAuditEvents: number;
  securityEventsCount: number;
  unreviewedSecurityEvents: number;
  totalControls: number;
  verifiedControls: number;
  partialControls: number;
  plannedControls: number;
  evidenceRequiredControls: number;
  totalEvidenceRecords: number;
  verifiedEvidenceRecords: number;
  activePolicies: number;
  activeLegalHolds: number;
}
