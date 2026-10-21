/**
 * E-09.17: Platform Support Desk, Customer Success and Tenant Assistance Governance
 * Typed domain models for support tickets, SLA policies, customer success,
 * feedback (CSAT), knowledge base articles, and team queues.
 */

export type SupportTicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type SupportTicketStatus =
  | 'new'
  | 'open'
  | 'in_progress'
  | 'awaiting_tenant'
  | 'awaiting_internal'
  | 'escalated'
  | 'resolved'
  | 'closed';

export type SupportCategoryKey =
  | 'account_access'
  | 'org_onboarding'
  | 'student_information'
  | 'academic_management'
  | 'examinations_cbt'
  | 'billing_subscriptions'
  | 'communications'
  | 'integrations_api'
  | 'performance_latency'
  | 'security_compliance'
  | 'data_reporting'
  | 'general_assistance';

export interface SupportCategoryDefinition {
  key: SupportCategoryKey;
  label: string;
  description: string;
  iconName: string;
  defaultPriority: SupportTicketPriority;
  defaultTeamId: string;
}

export interface SupportTeamQueue {
  id: string;
  name: string;
  code: string;
  description: string;
  leadOperatorId: string;
  memberOperatorIds: string[];
  specialties: SupportCategoryKey[];
  isActive: boolean;
}

export interface TicketRequester {
  name: string;
  email: string;
  roleTitle: string;
  phone?: string;
}

export type TicketMessageType = 'internal_note' | 'tenant_reply' | 'system_event';

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: 'platform_operator' | 'tenant_admin' | 'system';
  type: TicketMessageType;
  content: string;
  createdAt: string;
  isDraft?: boolean;
  metadata?: Record<string, string | number | boolean>;
}

export type EscalationTargetTier = 'tier_2_specialist' | 'tier_3_engineering' | 'executive_management';

export type EscalationUrgency = 'standard' | 'high' | 'critical';

export type EscalationStatus = 'active' | 'under_review' | 'resolved' | 'deescalated';

export interface TicketEscalationDetails {
  isEscalated: boolean;
  escalatedAt?: string;
  escalatedBy?: string;
  reason?: string;
  targetTeamId?: string;
  targetTier?: EscalationTargetTier;
  urgencyLevel?: EscalationUrgency;
  status?: EscalationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  resolutionNote?: string;
}

export interface SlaBusinessHours {
  enabled: boolean;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "18:00"
  timeZone: string;  // e.g. "UTC"
  workDays: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
}

export interface SlaPolicy {
  id: string;
  name: string;
  description: string;
  planTier: 'starter' | 'growth' | 'enterprise' | 'all';
  applicableCategories: SupportCategoryKey[] | 'all';
  applicablePriorities: SupportTicketPriority[];
  firstResponseTargetMinutes: Record<SupportTicketPriority, number>;
  resolutionTargetMinutes: Record<SupportTicketPriority, number>;
  businessHours: SlaBusinessHours;
  escalationThresholdPercent: number; // e.g. 75 or 80% triggers approaching target
  isDefault: boolean;
  isEnabled: boolean;
}

export type SlaState =
  | 'within_target'
  | 'approaching_target'
  | 'breached'
  | 'paused'
  | 'unknown';

export interface SlaEvaluationResult {
  state: SlaState;
  policyId: string;
  policyName: string;
  firstResponseMinutesTarget: number;
  firstResponseMinutesElapsed: number | null;
  firstResponseMet: boolean | null;
  firstResponseState: SlaState;
  resolutionMinutesTarget: number;
  resolutionMinutesElapsed: number | null;
  resolutionMet: boolean | null;
  resolutionState: SlaState;
  timeRemainingMinutes: number | null;
  isPaused: boolean;
  isBreached: boolean;
  explanation: string;
}

export type TicketSource = 'portal' | 'email' | 'in_app' | 'phone' | 'system';

export interface SupportTicket {
  id: string;
  ticketNumber: string; // e.g. "TCK-1001"
  subject: string;
  description: string;
  organizationId: string; // references Organization.id
  requester: TicketRequester;
  category: SupportCategoryKey;
  subcategory?: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assignedOperatorId?: string | null; // references PlatformUser.id
  assignedTeamId?: string | null;     // references SupportTeamQueue.id
  createdAt: string;
  updatedAt: string;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  slaPolicyId: string;
  slaState: SlaState;
  escalation: TicketEscalationDetails;
  tags: string[];
  source: TicketSource;
  relatedIncidentId?: string | null;
  messages: TicketMessage[];
}

export interface KnowledgeBaseArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: SupportCategoryKey;
  content: string; // Markdown formatted
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  targetAudience: 'school_admins' | 'teachers' | 'it_staff' | 'all';
  locale: string;
  helpfulCount: number;
  unhelpfulCount: number;
  viewCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface CustomerSatisfactionRecord {
  id: string;
  ticketId: string;
  ticketNumber: string;
  organizationId: string;
  rating: number; // 1 to 5 stars
  category: SupportCategoryKey;
  comment?: string;
  submittedAt: string;
  reviewed: boolean;
  reviewerNotes?: string;
}

export interface CustomerSuccessTask {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  assignedOwnerId: string; // references PlatformUser.id
  priority: SupportTicketPriority;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: string; // YYYY-MM-DD
  relatedTicketId?: string;
  completedAt?: string;
  completionNotes?: string;
  createdAt: string;
}

export interface CustomerSuccessAccountSummary {
  organizationId: string;
  organizationName: string;
  organizationCode: string;
  subdomain: string;
  planId: string;
  planName: string;
  subscriptionStatus: string;
  onboardingStatus: string;
  openTicketsCount: number;
  urgentTicketsCount: number;
  escalatedTicketsCount: number;
  averageCsatScore: number | null;
  totalFeedbackCount: number;
  readinessGaps: string[];
  healthScore: number; // 0 - 100
  healthTier: 'healthy' | 'attention_needed' | 'at_risk';
  healthScoreBreakdown: {
    baseline: number;
    deductions: { reason: string; points: number }[];
    finalScore: number;
  };
  lastEngagementDate: string | null;
  assignedCsOwnerId: string;
  assignedCsOwnerName: string;
  pendingTasksCount: number;
  overdueTasksCount: number;
}

export interface SupportMetricsSummary {
  totalTickets: number;
  openTickets: number;
  unassignedTickets: number;
  urgentTickets: number;
  highPriorityTickets: number;
  awaitingTenantTickets: number;
  awaitingInternalTickets: number;
  slaAtRiskTickets: number;
  slaBreachedTickets: number;
  escalatedTickets: number;
  recentlyResolvedTickets: number;
  avgFirstResponseMinutes: number | null;
  avgResolutionHours: number | null;
  averageCsat: number | null;
  totalCsatResponses: number;
  satisfactionRatePercent: number | null;
  isDemonstrationData: boolean;
}

// Input Types for Store Operations
export interface CreateSupportTicketInput {
  subject: string;
  description: string;
  organizationId: string;
  requester: TicketRequester;
  category: SupportCategoryKey;
  priority: SupportTicketPriority;
  assignedOperatorId?: string | null;
  assignedTeamId?: string | null;
  slaPolicyId?: string;
  tags?: string[];
  source?: TicketSource;
  relatedIncidentId?: string | null;
}

export interface UpdateSupportTicketInput {
  subject?: string;
  description?: string;
  category?: SupportCategoryKey;
  priority?: SupportTicketPriority;
  assignedOperatorId?: string | null;
  assignedTeamId?: string | null;
  tags?: string[];
  relatedIncidentId?: string | null;
}

export interface TransitionTicketStatusInput {
  ticketId: string;
  targetStatus: SupportTicketStatus;
  reason?: string;
}

export interface AssignTicketInput {
  ticketId: string;
  operatorId?: string | null;
  teamId?: string | null;
  reason?: string;
}

export interface EscalateTicketInput {
  ticketId: string;
  reason: string;
  targetTeamId: string;
  targetTier?: EscalationTargetTier;
  urgencyLevel?: EscalationUrgency;
}

export interface AddTicketMessageInput {
  ticketId: string;
  type: TicketMessageType;
  content: string;
  isDraft?: boolean;
}

export interface CreateSlaPolicyInput {
  name: string;
  description: string;
  planTier: 'starter' | 'growth' | 'enterprise' | 'all';
  applicableCategories: SupportCategoryKey[] | 'all';
  applicablePriorities: SupportTicketPriority[];
  firstResponseTargetMinutes: Record<SupportTicketPriority, number>;
  resolutionTargetMinutes: Record<SupportTicketPriority, number>;
  businessHours: SlaBusinessHours;
  escalationThresholdPercent?: number;
  isDefault?: boolean;
}

export interface CreateKbArticleInput {
  title: string;
  slug?: string;
  summary: string;
  category: SupportCategoryKey;
  content: string;
  tags: string[];
  targetAudience?: 'school_admins' | 'teachers' | 'it_staff' | 'all';
  locale?: string;
  status?: 'draft' | 'published';
}

export interface CreateCsTaskInput {
  title: string;
  description: string;
  organizationId: string;
  assignedOwnerId: string;
  priority: SupportTicketPriority;
  dueDate: string;
  relatedTicketId?: string;
}

export interface SubmitCustomerFeedbackInput {
  ticketId: string;
  rating: number; // 1-5
  comment?: string;
}
