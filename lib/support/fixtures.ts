/**
 * E-09.17: Support Desk, Customer Success and Tenant Assistance Fixtures
 * Deterministic fixtures linked to existing platform organizations and users.
 * ZERO student PII, credentials, or actual server tokens.
 */

import {
  SupportCategoryDefinition,
  SupportTeamQueue,
  SlaPolicy,
  SupportTicket,
  KnowledgeBaseArticle,
  CustomerSatisfactionRecord,
  CustomerSuccessTask,
} from '@/lib/types/support-desk';

export const SUPPORT_CATEGORIES: SupportCategoryDefinition[] = [
  {
    key: 'account_access',
    label: 'Account & Access Security',
    description: 'School administrator credentials, MFA resets, permission disputes, and portal access issues.',
    iconName: 'Key',
    defaultPriority: 'high',
    defaultTeamId: 'team_tier1',
  },
  {
    key: 'org_onboarding',
    label: 'Organization Onboarding & DNS',
    description: 'Initial school registration, subdomain DNS delegation, campus provisioning, and onboarding blockers.',
    iconName: 'Building2',
    defaultPriority: 'normal',
    defaultTeamId: 'team_customer_success',
  },
  {
    key: 'student_information',
    label: 'Student Information System (SIS)',
    description: 'Student enrollments, roster batch imports, guardian links, and student profile management.',
    iconName: 'GraduationCap',
    defaultPriority: 'normal',
    defaultTeamId: 'team_tier1',
  },
  {
    key: 'academic_management',
    label: 'Academics & Curricula',
    description: 'Course catalog, class allocation, timetable scheduling, and academic year progression.',
    iconName: 'BookOpen',
    defaultPriority: 'normal',
    defaultTeamId: 'team_tier2',
  },
  {
    key: 'examinations_cbt',
    label: 'Examinations & CBT Testing',
    description: 'Online test proctoring, session lockouts, candidate resume codes, and gradebook publication.',
    iconName: 'FileCheck',
    defaultPriority: 'urgent',
    defaultTeamId: 'team_tier2',
  },
  {
    key: 'billing_subscriptions',
    label: 'Billing, Plans & Invoicing',
    description: 'Subscription renewals, tiered plan upgrades, invoice discrepancies, and wire settlements.',
    iconName: 'CreditCard',
    defaultPriority: 'normal',
    defaultTeamId: 'team_billing',
  },
  {
    key: 'communications',
    label: 'Communications & Delivery Gateways',
    description: 'SMS notification delivery, email parent broadcasts, sender ID approvals, and quiet hours.',
    iconName: 'Bell',
    defaultPriority: 'normal',
    defaultTeamId: 'team_tier1',
  },
  {
    key: 'integrations_api',
    label: 'Integrations & External APIs',
    description: 'Webhooks, REST API keys, SIS third-party integrations, and automated sync connectors.',
    iconName: 'Share2',
    defaultPriority: 'normal',
    defaultTeamId: 'team_infrastructure',
  },
  {
    key: 'performance_latency',
    label: 'System Performance & Latency',
    description: 'Report generation slowdowns, mass attendance submission delays, and UI responsiveness.',
    iconName: 'Zap',
    defaultPriority: 'high',
    defaultTeamId: 'team_infrastructure',
  },
  {
    key: 'security_compliance',
    label: 'Security & Compliance Audits',
    description: 'Data retention queries, unusual login location alerts, audit export requests, and compliance holds.',
    iconName: 'ShieldAlert',
    defaultPriority: 'urgent',
    defaultTeamId: 'team_tier2',
  },
  {
    key: 'data_reporting',
    label: 'Data Quality & Analytics Reports',
    description: 'Report card PDF generation, statutory government census exports, and data hygiene audits.',
    iconName: 'BarChart2',
    defaultPriority: 'normal',
    defaultTeamId: 'team_tier2',
  },
  {
    key: 'general_assistance',
    label: 'General Technical Guidance',
    description: 'Staff training guidance, feature inquiries, product best practices, and portal navigation.',
    iconName: 'HelpCircle',
    defaultPriority: 'low',
    defaultTeamId: 'team_tier1',
  },
];

export const INITIAL_SUPPORT_TEAMS: SupportTeamQueue[] = [
  {
    id: 'team_tier1',
    name: 'Tier-1 General Support',
    code: 'QUEUE-T1',
    description: 'Frontline assistance for credentials, portal navigation, parent messaging, and student rosters.',
    leadOperatorId: 'usr_support_03', // Marcus Brody
    memberOperatorIds: ['usr_support_03', 'usr_ops_02'],
    specialties: ['account_access', 'student_information', 'communications', 'general_assistance'],
    isActive: true,
  },
  {
    id: 'team_tier2',
    name: 'Tier-2 Academic & CBT Support',
    code: 'QUEUE-T2',
    description: 'Deep technical support for computer-based testing, grading formulas, timetable algorithms, and SIS data hygiene.',
    leadOperatorId: 'usr_ops_02', // Sarah Connor
    memberOperatorIds: ['usr_ops_02', 'usr_super_01'],
    specialties: ['examinations_cbt', 'academic_management', 'data_reporting', 'security_compliance'],
    isActive: true,
  },
  {
    id: 'team_billing',
    name: 'Monetization & Billing Queue',
    code: 'QUEUE-FIN',
    description: 'Specialists in institutional subscription tiers, offline ACH wire verification, and dunning cycles.',
    leadOperatorId: 'usr_billing_04', // David Chen
    memberOperatorIds: ['usr_billing_04', 'usr_super_01'],
    specialties: ['billing_subscriptions'],
    isActive: true,
  },
  {
    id: 'team_infrastructure',
    name: 'Cloud Infrastructure & Reliability',
    code: 'QUEUE-OPS',
    description: 'Platform engineers handling API webhooks, edge CDN caching, multi-campus DNS, and performance bottlenecks.',
    leadOperatorId: 'usr_ops_02', // Sarah Connor
    memberOperatorIds: ['usr_ops_02'],
    specialties: ['integrations_api', 'performance_latency'],
    isActive: true,
  },
  {
    id: 'team_customer_success',
    name: 'Customer Success & Onboarding',
    code: 'QUEUE-CS',
    description: 'Strategic tenant partner managers overseeing onboarding milestones, campus expansions, and school health.',
    leadOperatorId: 'usr_support_03', // Marcus Brody
    memberOperatorIds: ['usr_support_03', 'usr_super_01'],
    specialties: ['org_onboarding', 'general_assistance'],
    isActive: true,
  },
];

export const INITIAL_SLA_POLICIES: SlaPolicy[] = [
  {
    id: 'sla_enterprise_gold',
    name: 'Enterprise Gold 24/7 SLA',
    description: 'Mission-critical contractual SLA for multi-campus enterprise academy networks with 24/7 priority routing.',
    planTier: 'enterprise',
    applicableCategories: 'all',
    applicablePriorities: ['urgent', 'high', 'normal', 'low'],
    firstResponseTargetMinutes: {
      urgent: 15,    // 15 mins
      high: 60,      // 1 hour
      normal: 240,   // 4 hours
      low: 720,      // 12 hours
    },
    resolutionTargetMinutes: {
      urgent: 120,   // 2 hours
      high: 480,     // 8 hours
      normal: 1440,  // 24 hours
      low: 2880,     // 48 hours
    },
    businessHours: {
      enabled: false, // 24/7 coverage
      startTime: '00:00',
      endTime: '23:59',
      timeZone: 'UTC',
      workDays: [1, 2, 3, 4, 5, 6, 7],
    },
    escalationThresholdPercent: 75,
    isDefault: false,
    isEnabled: true,
  },
  {
    id: 'sla_growth_silver',
    name: 'Growth Silver Business-Hours SLA',
    description: 'Standard institutional SLA covering school business hours (08:00 - 18:00 local time).',
    planTier: 'growth',
    applicableCategories: 'all',
    applicablePriorities: ['urgent', 'high', 'normal', 'low'],
    firstResponseTargetMinutes: {
      urgent: 30,    // 30 mins
      high: 120,     // 2 hours
      normal: 480,   // 8 hours
      low: 1440,     // 24 hours
    },
    resolutionTargetMinutes: {
      urgent: 240,   // 4 hours
      high: 720,     // 12 hours
      normal: 2880,  // 48 hours
      low: 4320,     // 72 hours
    },
    businessHours: {
      enabled: true,
      startTime: '08:00',
      endTime: '18:00',
      timeZone: 'UTC',
      workDays: [1, 2, 3, 4, 5],
    },
    escalationThresholdPercent: 80,
    isDefault: true,
    isEnabled: true,
  },
  {
    id: 'sla_starter_bronze',
    name: 'Starter Bronze Standard SLA',
    description: 'Baseline operational assistance for single-campus schools and trial academies.',
    planTier: 'starter',
    applicableCategories: 'all',
    applicablePriorities: ['urgent', 'high', 'normal', 'low'],
    firstResponseTargetMinutes: {
      urgent: 60,    // 1 hour
      high: 240,     // 4 hours
      normal: 1440,  // 24 hours
      low: 2880,     // 48 hours
    },
    resolutionTargetMinutes: {
      urgent: 480,   // 8 hours
      high: 1440,    // 24 hours
      normal: 4320,  // 72 hours
      low: 7200,     // 120 hours
    },
    businessHours: {
      enabled: true,
      startTime: '09:00',
      endTime: '17:00',
      timeZone: 'UTC',
      workDays: [1, 2, 3, 4, 5],
    },
    escalationThresholdPercent: 80,
    isDefault: false,
    isEnabled: true,
  },
  {
    id: 'sla_mission_critical_exam',
    name: 'CBT Examination Mission-Critical SLA',
    description: 'High-urgency dedicated policy during active mid-term and semester examination windows.',
    planTier: 'all',
    applicableCategories: ['examinations_cbt'],
    applicablePriorities: ['urgent', 'high'],
    firstResponseTargetMinutes: {
      urgent: 10,    // 10 mins
      high: 30,      // 30 mins
      normal: 120,   // 2 hours
      low: 360,      // 6 hours
    },
    resolutionTargetMinutes: {
      urgent: 60,    // 1 hour
      high: 180,     // 3 hours
      normal: 720,   // 12 hours
      low: 1440,     // 24 hours
    },
    businessHours: {
      enabled: false,
      startTime: '00:00',
      endTime: '23:59',
      timeZone: 'UTC',
      workDays: [1, 2, 3, 4, 5, 6, 7],
    },
    escalationThresholdPercent: 70,
    isDefault: false,
    isEnabled: true,
  },
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tck_1001',
    ticketNumber: 'TCK-1001',
    subject: 'CBT Test Session Lockouts in Hall B for Grade 11 Midterms',
    description: 'During the Physics Paper II examination session in Hall B (Main Campus), 14 student terminals reported unexpected browser disconnects and locked screen tokens. We need immediate proctor resume override codes.',
    organizationId: 'org_001', // Oak Hill International Academy
    requester: {
      name: 'Dr. Eleanor Vance',
      email: 'eleanor.vance@oakhill-academy.edu',
      roleTitle: 'Head of School & Chief Examiner',
      phone: '+1 (555) 234-8902',
    },
    category: 'examinations_cbt',
    subcategory: 'cbt_session_lockout',
    priority: 'urgent',
    status: 'in_progress',
    assignedOperatorId: 'usr_ops_02', // Sarah Connor
    assignedTeamId: 'team_tier2',
    createdAt: '2026-03-17T08:15:00Z',
    updatedAt: '2026-03-17T08:35:00Z',
    firstResponseAt: '2026-03-17T08:24:00Z', // 9 mins elapsed (within 10m target)
    resolvedAt: null,
    closedAt: null,
    slaPolicyId: 'sla_mission_critical_exam',
    slaState: 'within_target',
    escalation: {
      isEscalated: false,
    },
    tags: ['cbt-exam', 'hall-b', 'lockout', 'grade-11'],
    source: 'portal',
    relatedIncidentId: 'inc_002',
    messages: [
      {
        id: 'msg_1001_1',
        ticketId: 'tck_1001',
        authorId: 'system',
        authorName: 'Platform Dispatcher',
        authorRole: 'system',
        type: 'system_event',
        content: 'Ticket created via School Portal. Applied policy "CBT Examination Mission-Critical SLA" with Urgent priority.',
        createdAt: '2026-03-17T08:15:00Z',
      },
      {
        id: 'msg_1001_2',
        ticketId: 'tck_1001',
        authorId: 'eleanor.vance@oakhill-academy.edu',
        authorName: 'Dr. Eleanor Vance',
        authorRole: 'tenant_admin',
        type: 'tenant_reply',
        content: '14 candidates in Hall B have been locked out after a temporary local WiFi flicker. The exam timer is continuing to tick on the proctor dashboard. Please advise on emergency candidate session reactivation.',
        createdAt: '2026-03-17T08:15:00Z',
      },
      {
        id: 'msg_1001_3',
        ticketId: 'tck_1001',
        authorId: 'usr_ops_02',
        authorName: 'Sarah Connor',
        authorRole: 'platform_operator',
        type: 'internal_note',
        content: 'Reviewed Hall B network telemetry. The issue stems from the local campus router DNS flapping, not the central CBT engine. Dispatching proctor batch resume token override.',
        createdAt: '2026-03-17T08:22:00Z',
      },
      {
        id: 'msg_1001_4',
        ticketId: 'tck_1001',
        authorId: 'usr_ops_02',
        authorName: 'Sarah Connor',
        authorRole: 'platform_operator',
        type: 'tenant_reply',
        content: 'Hello Dr. Vance, We have generated an emergency supervisor unlock key. Your chief proctor can navigate to Exam Operations > Session Monitor > Hall B, enter token RESUME-OAK-9812, and resume all 14 workstations with a 15-minute time extension.',
        createdAt: '2026-03-17T08:24:00Z',
      },
    ],
  },
  {
    id: 'tck_1002',
    ticketNumber: 'TCK-1002',
    subject: 'Parent Broadcast SMS Delivery Failures on Telco Network',
    description: 'Our emergency weather closure notification sent to 850 parents failed to deliver for approximately 120 numbers on the local regional network. We need delivery status breakdown.',
    organizationId: 'org_002', // St. Jude Catholic Grammar School
    requester: {
      name: 'Sister Mary Catherine',
      email: 'm.catherine@stjude-grammar.edu',
      roleTitle: 'Principal & Headmistress',
      phone: '+1 (555) 345-6789',
    },
    category: 'communications',
    subcategory: 'sms_gateway_delivery',
    priority: 'high',
    status: 'open',
    assignedOperatorId: 'usr_support_03', // Marcus Brody
    assignedTeamId: 'team_tier1',
    createdAt: '2026-03-17T07:10:00Z',
    updatedAt: '2026-03-17T07:55:00Z',
    firstResponseAt: null, // Approaching first-response deadline (120 mins)
    resolvedAt: null,
    closedAt: null,
    slaPolicyId: 'sla_growth_silver',
    slaState: 'approaching_target',
    escalation: {
      isEscalated: false,
    },
    tags: ['sms', 'parent-broadcast', 'telecom-bounce'],
    source: 'email',
    relatedIncidentId: null,
    messages: [
      {
        id: 'msg_1002_1',
        ticketId: 'tck_1002',
        authorId: 'system',
        authorName: 'Platform Dispatcher',
        authorRole: 'system',
        type: 'system_event',
        content: 'Inbound email converted to ticket. Queued in Tier-1 General Support.',
        createdAt: '2026-03-17T07:10:00Z',
      },
      {
        id: 'msg_1002_2',
        ticketId: 'tck_1002',
        authorId: 'm.catherine@stjude-grammar.edu',
        authorName: 'Sister Mary Catherine',
        authorRole: 'tenant_admin',
        type: 'tenant_reply',
        content: 'Good morning, our storm closure SMS was sent at 6:45 AM. Many parents contacted the school office saying they received nothing. Please check if our SMS credits or gateway is stuck.',
        createdAt: '2026-03-17T07:10:00Z',
      },
    ],
  },
  {
    id: 'tck_1003',
    ticketNumber: 'TCK-1003',
    subject: 'Wire Transfer Settlement Confirmation for Annual Growth Plan',
    description: 'We submitted wire settlement reference WT-2026-003 for invoice INV-2026-029 ($4,890.00). Our portal banner still displays "Awaiting Payment". Please apply manual ledger settlement.',
    organizationId: 'org_003', // Greenfield Science Academy
    requester: {
      name: 'Tariq Al-Mansoor',
      email: 'tariq.m@greenfield-science.ac.ae',
      roleTitle: 'Director of Operations & Finance',
      phone: '+971 4 398 7654',
    },
    category: 'billing_subscriptions',
    subcategory: 'wire_settlement',
    priority: 'normal',
    status: 'awaiting_tenant',
    assignedOperatorId: 'usr_billing_04', // David Chen
    assignedTeamId: 'team_billing',
    createdAt: '2026-03-16T11:00:00Z',
    updatedAt: '2026-03-16T14:30:00Z',
    firstResponseAt: '2026-03-16T12:15:00Z',
    resolvedAt: null,
    closedAt: null,
    slaPolicyId: 'sla_growth_silver',
    slaState: 'paused', // Paused while awaiting tenant bank swift confirmation
    escalation: {
      isEscalated: false,
    },
    tags: ['wire-transfer', 'invoice', 'ledger'],
    source: 'portal',
    relatedIncidentId: null,
    messages: [
      {
        id: 'msg_1003_1',
        ticketId: 'tck_1003',
        authorId: 'tariq.m@greenfield-science.ac.ae',
        authorName: 'Tariq Al-Mansoor',
        authorRole: 'tenant_admin',
        type: 'tenant_reply',
        content: 'Wire transfer was processed by Dubai Islamic Bank yesterday. Wire confirmation attached in finance portal.',
        createdAt: '2026-03-16T11:00:00Z',
      },
      {
        id: 'msg_1003_2',
        ticketId: 'tck_1003',
        authorId: 'usr_billing_04',
        authorName: 'David Chen',
        authorRole: 'platform_operator',
        type: 'tenant_reply',
        content: 'Hello Tariq, our treasury team has received the incoming batch notification. Please confirm whether the bank transfer was sent under the legal entity name "Greenfield Education LLC" so we can match the settlement in the ledger.',
        createdAt: '2026-03-16T12:15:00Z',
      },
      {
        id: 'msg_1003_3',
        ticketId: 'tck_1003',
        authorId: 'usr_billing_04',
        authorName: 'David Chen',
        authorRole: 'platform_operator',
        type: 'internal_note',
        content: 'Status placed into Awaiting Tenant. Wire batch matched amount $4,890.00; waiting for sender entity clarification before settling invoice in platform store.',
        createdAt: '2026-03-16T12:16:00Z',
      },
    ],
  },
  {
    id: 'tck_1004',
    ticketNumber: 'TCK-1004',
    subject: 'Emergency Suspension Appeal and Roster Archive Retrieval',
    description: 'School board governance requires immediate access to export final graduation audit reports following institution suspension. Board counsel requests temporary 48-hour compliance read-only window.',
    organizationId: 'org_004', // Apex Charter Academy
    requester: {
      name: 'Marcus Vance',
      email: 'm.vance@apexcharter.org',
      roleTitle: 'Former Chief Academic Officer',
      phone: '+1 (555) 456-7890',
    },
    category: 'account_access',
    subcategory: 'compliance_unblock',
    priority: 'urgent',
    status: 'escalated',
    assignedOperatorId: 'usr_super_01', // Alexander Sterling
    assignedTeamId: 'team_tier2',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T16:00:00Z',
    firstResponseAt: '2026-03-16T09:45:00Z',
    resolvedAt: null,
    closedAt: null,
    slaPolicyId: 'sla_starter_bronze',
    slaState: 'breached', // Resolution breached beyond 480 mins for urgent
    escalation: {
      isEscalated: true,
      escalatedAt: '2026-03-16T15:30:00Z',
      escalatedBy: 'Sarah Connor',
      reason: 'School board compliance deadline requiring executive super-admin approval for temporary read-only access grant.',
      targetTeamId: 'team_tier2',
      targetTier: 'executive_management',
      urgencyLevel: 'critical',
      status: 'active',
      reviewedBy: 'Alexander Sterling',
      reviewedAt: '2026-03-16T16:00:00Z',
      resolutionNote: 'Under legal review with compliance governance counsel.',
    },
    tags: ['suspension', 'legal-hold', 'roster-export', 'escalation'],
    source: 'portal',
    relatedIncidentId: null,
    messages: [
      {
        id: 'msg_1004_1',
        ticketId: 'tck_1004',
        authorId: 'm.vance@apexcharter.org',
        authorName: 'Marcus Vance',
        authorRole: 'tenant_admin',
        type: 'tenant_reply',
        content: 'We need emergency temporary access to run state compliance reports for Grade 12 students. We understand the billing suspension is active, but state audit requires records by Wednesday.',
        createdAt: '2026-03-16T09:00:00Z',
      },
      {
        id: 'msg_1004_2',
        ticketId: 'tck_1004',
        authorId: 'usr_ops_02',
        authorName: 'Sarah Connor',
        authorRole: 'platform_operator',
        type: 'internal_note',
        content: 'Per E-09.7 and E-09.13 governance, operators cannot unilaterally un-suspend tenants without Super-Admin signoff. Escalating to Executive Operations.',
        createdAt: '2026-03-16T15:25:00Z',
      },
      {
        id: 'msg_1004_3',
        ticketId: 'tck_1004',
        authorId: 'system',
        authorName: 'Platform Dispatcher',
        authorRole: 'system',
        type: 'system_event',
        content: 'Ticket escalated to Executive Management. Urgency: Critical. Reason: Legal/compliance roster export request on suspended account.',
        createdAt: '2026-03-16T15:30:00Z',
      },
    ],
  },
  {
    id: 'tck_1005',
    ticketNumber: 'TCK-1005',
    subject: 'Vocational Trade Curriculum Timetable Room Overlap Warning',
    description: 'When publishing the Term 2 timetable for Electrical Trade Apprentices in Workshop 3, the engine flags a soft collision with Automotive Mechanics. Requesting clarification on room sharing constraint.',
    organizationId: 'org_006', // Horizon Polytechnic & Vocational College
    requester: {
      name: 'Eng. Samuel Ochieng',
      email: 's.ochieng@horizonpoly.ac.ke',
      roleTitle: 'Principal & Director of Studies',
      phone: '+254 20 690 2001',
    },
    category: 'academic_management',
    subcategory: 'timetable_constraint',
    priority: 'normal',
    status: 'resolved',
    assignedOperatorId: 'usr_ops_02', // Sarah Connor
    assignedTeamId: 'team_tier2',
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-15T15:30:00Z',
    firstResponseAt: '2026-03-15T11:20:00Z',
    resolvedAt: '2026-03-15T15:30:00Z',
    closedAt: null,
    slaPolicyId: 'sla_growth_silver',
    slaState: 'within_target',
    escalation: {
      isEscalated: false,
    },
    tags: ['timetable', 'workshop-3', 'vocational'],
    source: 'portal',
    relatedIncidentId: null,
    messages: [
      {
        id: 'msg_1005_1',
        ticketId: 'tck_1005',
        authorId: 's.ochieng@horizonpoly.ac.ke',
        authorName: 'Eng. Samuel Ochieng',
        authorRole: 'tenant_admin',
        type: 'tenant_reply',
        content: 'Workshop 3 has dual bays (Electrical and Mechanical). The algorithm prevents scheduling both concurrently. Can we configure partition capacity?',
        createdAt: '2026-03-15T10:00:00Z',
      },
      {
        id: 'msg_1005_2',
        ticketId: 'tck_1005',
        authorId: 'usr_ops_02',
        authorName: 'Sarah Connor',
        authorRole: 'platform_operator',
        type: 'tenant_reply',
        content: 'Hello Eng. Ochieng, Under Campus Facilities > Room Management, you can define Sub-Zones (e.g., Workshop 3-A and Workshop 3-B). Once segmented, the timetable engine allows concurrent class allocations.',
        createdAt: '2026-03-15T11:20:00Z',
      },
      {
        id: 'msg_1005_3',
        ticketId: 'tck_1005',
        authorId: 's.ochieng@horizonpoly.ac.ke',
        authorName: 'Eng. Samuel Ochieng',
        authorRole: 'tenant_admin',
        type: 'tenant_reply',
        content: 'That resolved the issue perfectly! We partitioned the workshop into two sub-zones and the timetable published cleanly. Thank you.',
        createdAt: '2026-03-15T15:20:00Z',
      },
      {
        id: 'msg_1005_4',
        ticketId: 'tck_1005',
        authorId: 'usr_ops_02',
        authorName: 'Sarah Connor',
        authorRole: 'platform_operator',
        type: 'system_event',
        content: 'Ticket marked as Resolved following confirmation from tenant administrator.',
        createdAt: '2026-03-15T15:30:00Z',
      },
    ],
  },
  {
    id: 'tck_1006',
    ticketNumber: 'TCK-1006',
    subject: 'Multi-Campus Custom Domain CNAME Verification Assistance',
    description: 'We configured DNS CNAME records for prep.beaconhillprep.edu pointing to ingress.saas-platform.internal 48 hours ago. The onboarding wizard still flags DNS verification as pending.',
    organizationId: 'org_007', // Beacon Hill Preparatory School
    requester: {
      name: 'Arthur Pendelton',
      email: 'arthur.p@beaconhillprep.edu',
      roleTitle: 'Director of Technology',
      phone: '+1 (555) 987-6544',
    },
    category: 'org_onboarding',
    subcategory: 'custom_domain_dns',
    priority: 'high',
    status: 'open',
    assignedOperatorId: null, // Unassigned
    assignedTeamId: 'team_infrastructure',
    createdAt: '2026-03-17T06:30:00Z',
    updatedAt: '2026-03-17T06:30:00Z',
    firstResponseAt: null,
    resolvedAt: null,
    closedAt: null,
    slaPolicyId: 'sla_growth_silver',
    slaState: 'within_target',
    escalation: {
      isEscalated: false,
    },
    tags: ['dns', 'cname', 'custom-domain', 'unassigned'],
    source: 'portal',
    relatedIncidentId: null,
    messages: [
      {
        id: 'msg_1006_1',
        ticketId: 'tck_1006',
        authorId: 'arthur.p@beaconhillprep.edu',
        authorName: 'Arthur Pendelton',
        authorRole: 'tenant_admin',
        type: 'tenant_reply',
        content: 'Please verify if our nameserver TTL is causing the onboarding wizard to delay SSL certificate issuance.',
        createdAt: '2026-03-17T06:30:00Z',
      },
    ],
  },
  {
    id: 'tck_1007',
    ticketNumber: 'TCK-1007',
    subject: 'Roster Batch Import Duplicate Identification Reconciliation',
    description: 'During Term 1 student import of 420 learners, 6 records threw duplicate matriculation code warnings. Needed guidance on merge versus override rules.',
    organizationId: 'org_009', // Cedar Valley Comprehensive High School
    requester: {
      name: 'Marcus Brody',
      email: 'm.brody@cedarvalley.org',
      roleTitle: 'Registrar & Admissions Officer',
    },
    category: 'student_information',
    subcategory: 'roster_import',
    priority: 'normal',
    status: 'closed',
    assignedOperatorId: 'usr_support_03',
    assignedTeamId: 'team_tier1',
    createdAt: '2026-03-12T09:00:00Z',
    updatedAt: '2026-03-13T16:00:00Z',
    firstResponseAt: '2026-03-12T10:15:00Z',
    resolvedAt: '2026-03-13T11:00:00Z',
    closedAt: '2026-03-13T16:00:00Z', // Distinct from resolvedAt
    slaPolicyId: 'sla_growth_silver',
    slaState: 'within_target',
    escalation: {
      isEscalated: false,
    },
    tags: ['admissions', 'roster', 'duplicates'],
    source: 'portal',
    relatedIncidentId: null,
    messages: [
      {
        id: 'msg_1007_1',
        ticketId: 'tck_1007',
        authorId: 'usr_support_03',
        authorName: 'Marcus Brody',
        authorRole: 'platform_operator',
        type: 'system_event',
        content: 'Ticket created, resolved, and formally closed. Customer satisfaction survey completed.',
        createdAt: '2026-03-12T09:00:00Z',
      },
    ],
  },
  {
    id: 'tck_1008',
    ticketNumber: 'TCK-1008',
    subject: 'Webhook Signing Key Rotation Instructions for SIS Sync',
    description: 'Our district IT department will rotate our TLS certificates and API secret credentials on Friday. We need step-by-step guidance on zero-downtime webhook key rotation.',
    organizationId: 'org_010', // Riverdale Community School
    requester: {
      name: 'Chloe Bennett',
      email: 'chloe.b@riverdale-schools.org',
      roleTitle: 'District IT Specialist',
    },
    category: 'integrations_api',
    subcategory: 'api_keys',
    priority: 'low',
    status: 'new',
    assignedOperatorId: null,
    assignedTeamId: null,
    createdAt: '2026-03-17T09:40:00Z',
    updatedAt: '2026-03-17T09:40:00Z',
    firstResponseAt: null,
    resolvedAt: null,
    closedAt: null,
    slaPolicyId: 'sla_starter_bronze',
    slaState: 'within_target',
    escalation: {
      isEscalated: false,
    },
    tags: ['webhooks', 'api-keys', 'security-rotation'],
    source: 'in_app',
    relatedIncidentId: null,
    messages: [
      {
        id: 'msg_1008_1',
        ticketId: 'tck_1008',
        authorId: 'chloe.b@riverdale-schools.org',
        authorName: 'Chloe Bennett',
        authorRole: 'tenant_admin',
        type: 'tenant_reply',
        content: 'Hello team, what is the best practice for dual-secret verification during our scheduled key rotation window this Friday?',
        createdAt: '2026-03-17T09:40:00Z',
      },
    ],
  },
  {
    id: 'tck_1009',
    ticketNumber: 'TCK-1009',
    subject: 'Data Retention Policy Archival Verification for GDPR Compliance',
    description: 'Our legal oversight board requested verification evidence showing automated anonymization of graduated student records past the 7-year statutory retention limit.',
    organizationId: 'org_001', // Oak Hill International Academy
    requester: {
      name: 'Dr. Eleanor Vance',
      email: 'eleanor.vance@oakhill-academy.edu',
      roleTitle: 'Head of School & Chief Examiner',
    },
    category: 'security_compliance',
    subcategory: 'retention_audit',
    priority: 'normal',
    status: 'awaiting_internal',
    assignedOperatorId: 'usr_support_03', // Marcus Brody
    assignedTeamId: 'team_tier2',
    createdAt: '2026-03-16T14:00:00Z',
    updatedAt: '2026-03-17T08:00:00Z',
    firstResponseAt: '2026-03-16T15:10:00Z',
    resolvedAt: null,
    closedAt: null,
    slaPolicyId: 'sla_enterprise_gold',
    slaState: 'within_target',
    escalation: {
      isEscalated: false,
    },
    tags: ['gdpr', 'data-retention', 'compliance', 'oak-hill'],
    source: 'portal',
    relatedIncidentId: null,
    messages: [
      {
        id: 'msg_1009_1',
        ticketId: 'tck_1009',
        authorId: 'eleanor.vance@oakhill-academy.edu',
        authorName: 'Dr. Eleanor Vance',
        authorRole: 'tenant_admin',
        type: 'tenant_reply',
        content: 'We need the platform cryptographic proof of archival for graduating classes prior to 2019.',
        createdAt: '2026-03-16T14:00:00Z',
      },
      {
        id: 'msg_1009_2',
        ticketId: 'tck_1009',
        authorId: 'usr_support_03',
        authorName: 'Marcus Brody',
        authorRole: 'platform_operator',
        type: 'internal_note',
        content: 'Awaiting Compliance Officer confirmation from E-09.13 Retention Policy registry before generating cryptographic verification certificate.',
        createdAt: '2026-03-17T08:00:00Z',
      },
    ],
  },
  {
    id: 'tck_1010',
    ticketNumber: 'TCK-1010',
    subject: 'Report Card Bulk PDF Generation Timeout on 500+ Student Batch',
    description: 'When generating term summary reports for the Senior Campus, the background worker throws a timeout error after 90 seconds. Teachers are waiting to issue report cards ahead of parent-teacher conference.',
    organizationId: 'org_002', // St. Jude
    requester: {
      name: 'Sister Mary Catherine',
      email: 'm.catherine@stjude-grammar.edu',
      roleTitle: 'Principal & Headmistress',
    },
    category: 'data_reporting',
    subcategory: 'pdf_export_timeout',
    priority: 'high',
    status: 'in_progress',
    assignedOperatorId: 'usr_ops_02', // Sarah Connor
    assignedTeamId: 'team_tier2',
    createdAt: '2026-03-17T05:00:00Z',
    updatedAt: '2026-03-17T08:20:00Z',
    firstResponseAt: '2026-03-17T05:40:00Z',
    resolvedAt: null,
    closedAt: null,
    slaPolicyId: 'sla_growth_silver',
    slaState: 'approaching_target',
    escalation: {
      isEscalated: false,
    },
    tags: ['pdf-generation', 'timeout', 'report-cards'],
    source: 'portal',
    relatedIncidentId: null,
    messages: [
      {
        id: 'msg_1010_1',
        ticketId: 'tck_1010',
        authorId: 'm.catherine@stjude-grammar.edu',
        authorName: 'Sister Mary Catherine',
        authorRole: 'tenant_admin',
        type: 'tenant_reply',
        content: 'The bulk export hangs at 45% and fails with "Batch task timeout". Can this be segmented into 100-student chunks?',
        createdAt: '2026-03-17T05:00:00Z',
      },
      {
        id: 'msg_1010_2',
        ticketId: 'tck_1010',
        authorId: 'usr_ops_02',
        authorName: 'Sarah Connor',
        authorRole: 'platform_operator',
        type: 'internal_note',
        content: 'Investigated worker queue. High memory allocation caused by uncompressed student avatars in PDF header. Adjusting worker memory limits and enabling pagination.',
        createdAt: '2026-03-17T08:15:00Z',
      },
    ],
  },
];

export const INITIAL_KB_ARTICLES: KnowledgeBaseArticle[] = [
  {
    id: 'kb_001',
    slug: 'configuring-academic-terms-and-calendars',
    title: 'Configuring Academic Terms, Semesters & Holidays',
    summary: 'A step-by-step guide for school administrators on defining academic year date boundaries, terms, and institutional holidays.',
    category: 'academic_management',
    content: `
# Configuring Academic Terms & Calendars

Accurate term configurations ensure that timetable scheduling, attendance rolls, and grading periods calculate without discrepancies.

## Key Steps
1. Navigate to **Academic Governance > Term Calendar**.
2. Select **Create Academic Year** and define your start and end dates.
3. Add academic subdivisions (Terms, Semesters, or Trimesters).
4. Mark statutory school holidays and non-instructional teacher development days.

> **Important Note:** Once grades have been entered for a term, term date boundaries cannot be shortened without administrator signoff.
`,
    tags: ['academics', 'terms', 'calendar', 'holidays'],
    status: 'published',
    targetAudience: 'school_admins',
    locale: 'en',
    helpfulCount: 42,
    unhelpfulCount: 1,
    viewCount: 380,
    updatedAt: '2026-02-20T10:00:00Z',
    createdAt: '2025-09-01T08:00:00Z',
  },
  {
    id: 'kb_002',
    slug: 'troubleshooting-cbt-session-lockouts',
    title: 'Troubleshooting Computer-Based Testing (CBT) Session Lockouts',
    summary: 'Best practices for exam proctors and chief examiners when candidates encounter network disconnects during active assessments.',
    category: 'examinations_cbt',
    content: `
# Troubleshooting CBT Session Lockouts

The platform features an automated anti-tampering lock that engages if a candidate browser loses focus, disconnects from local WiFi, or switches applications.

## How to Resume a Candidate Session
1. Open the **CBT Proctor Dashboard** on the supervisor workstation.
2. Locate the candidate in the active roster. Their status will show **Locked (Interrupted)**.
3. Click **Issue Resume Code**.
4. Read the 6-character code to the candidate or input it directly on their terminal.
5. Provide time compensation if local network latency was substantiated.

> **Security Advisory:** All resume events are permanently logged in the Examination Audit Trail (E-09.10).
`,
    tags: ['cbt', 'exams', 'lockout', 'proctor', 'troubleshooting'],
    status: 'published',
    targetAudience: 'teachers',
    locale: 'en',
    helpfulCount: 88,
    unhelpfulCount: 3,
    viewCount: 720,
    updatedAt: '2026-03-05T14:30:00Z',
    createdAt: '2025-10-10T12:00:00Z',
  },
  {
    id: 'kb_003',
    slug: 'multi-campus-dns-and-custom-domains',
    title: 'Setting Up Multi-Campus DNS and Custom Subdomains',
    summary: 'Technical instructions for configuring CNAME records, SSL certificates, and custom portal domains across primary and satellite campuses.',
    category: 'org_onboarding',
    content: `
# Multi-Campus DNS & Custom Domains

Each institution is assigned a default platform subdomain (e.g. \`oakhill.saas-platform.internal\`). Organizations on the Enterprise plan can delegate custom vanity domains (e.g. \`portal.oakhill-academy.edu\`).

## DNS Record Configuration
- **Type**: \`CNAME\`
- **Host**: \`portal\` (or desired subdomain)
- **Points To**: \`ingress.saas-platform.internal\`
- **TTL**: \`300\` seconds (recommended for initial setup)

Automated Let's Encrypt TLS certificates are provisioned once DNS propagation is verified by our platform health monitors.
`,
    tags: ['dns', 'cname', 'multi-campus', 'ssl'],
    status: 'published',
    targetAudience: 'it_staff',
    locale: 'en',
    helpfulCount: 35,
    unhelpfulCount: 2,
    viewCount: 290,
    updatedAt: '2026-01-18T16:00:00Z',
    createdAt: '2025-11-05T09:00:00Z',
  },
  {
    id: 'kb_004',
    slug: 'importing-student-admissions-csv-safely',
    title: 'Importing Student Admissions CSV Rosters Safely',
    summary: 'Data schema guidelines and validation safeguards when uploading bulk learner records to prevent duplicate identities.',
    category: 'student_information',
    content: `
# Importing Student Admissions CSV Rosters

To ensure student privacy and data integrity, our SIS ingestion engine validates every CSV upload against strict constraints.

## Mandatory Header Fields
- \`studentId\` (Unique Institutional Matriculation Code)
- \`firstName\`
- \`lastName\`
- \`gradeLevel\`
- \`enrollmentDate\` (Format: YYYY-MM-DD)
- \`primaryGuardianEmail\`

> **Privacy Guard:** Do not include student medical histories, credit card numbers, or plain-text passwords in generic admission imports. Use dedicated Health & Bursary modules for regulated information.
`,
    tags: ['sis', 'csv-import', 'students', 'admissions'],
    status: 'published',
    targetAudience: 'school_admins',
    locale: 'en',
    helpfulCount: 54,
    unhelpfulCount: 0,
    viewCount: 410,
    updatedAt: '2026-02-12T11:00:00Z',
    createdAt: '2025-08-15T10:00:00Z',
  },
  {
    id: 'kb_005',
    slug: 'subscription-invoicing-and-wire-settlements',
    title: 'Subscription Invoicing, Payment Retries & Wire Settlements',
    summary: 'How subscription billing cycles operate, managing dunning reminders, and submitting offline ACH or wire transfer receipts.',
    category: 'billing_subscriptions',
    content: `
# Subscription Invoicing & Wire Settlements

Educational institutions can settle platform subscription invoices via Credit Card, Automated Direct Debit (ACH), or Corporate Wire Transfer.

## Submitting Wire Transfer Proofs
1. Go to **Settings > Billing & Subscriptions > Invoices**.
2. Select the unpaid invoice and click **Submit Wire Confirmation**.
3. Input the banking Swift reference number and upload the remittance receipt.
4. Our finance team verifies the transaction within 24 business hours.
`,
    tags: ['billing', 'invoices', 'wire-transfer', 'subscriptions'],
    status: 'published',
    targetAudience: 'school_admins',
    locale: 'en',
    helpfulCount: 29,
    unhelpfulCount: 1,
    viewCount: 220,
    updatedAt: '2026-03-01T09:00:00Z',
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'kb_006',
    slug: 'parent-email-and-sms-gateway-delivery-rules',
    title: 'Configuring Parent Email and SMS Gateway Delivery Rules',
    summary: 'Guidelines for managing carrier opt-in compliance, quiet-hours delivery windows, and emergency broadcast overrides.',
    category: 'communications',
    content: `
# Parent Email & SMS Gateway Delivery Rules

Ensure school announcements reach parents without violating quiet-hours regulations or spam carrier filters.

## Delivery Policies
- **Standard Broadcasts**: Automatically queued between 08:00 and 20:00 local school time.
- **Emergency Alerts**: Marked as Critical Priority and bypass nighttime suppression windows.
- **SMS Segment Sizing**: Keep messages under 160 GSM-7 characters to avoid multi-part segment carrier charges.
`,
    tags: ['communications', 'sms', 'email', 'parent-broadcast'],
    status: 'draft',
    targetAudience: 'school_admins',
    locale: 'en',
    helpfulCount: 12,
    unhelpfulCount: 0,
    viewCount: 95,
    updatedAt: '2026-03-14T15:00:00Z',
    createdAt: '2026-03-10T12:00:00Z',
  },
];

export const INITIAL_CSAT_RECORDS: CustomerSatisfactionRecord[] = [
  {
    id: 'csat_001',
    ticketId: 'tck_1005',
    ticketNumber: 'TCK-1005',
    organizationId: 'org_006', // Horizon Poly
    rating: 5,
    category: 'academic_management',
    comment: 'The sub-zone recommendation resolved our workshop scheduling block within hours. Very clear instructions.',
    submittedAt: '2026-03-15T16:00:00Z',
    reviewed: true,
    reviewerNotes: 'Exemplary tier-2 academic resolution.',
  },
  {
    id: 'csat_002',
    ticketId: 'tck_1007',
    ticketNumber: 'TCK-1007',
    organizationId: 'org_009', // Cedar Valley
    rating: 5,
    category: 'student_information',
    comment: 'Marcus Brody guided our admissions team on handling duplicate matriculation codes without data loss.',
    submittedAt: '2026-03-13T17:00:00Z',
    reviewed: true,
  },
  {
    id: 'csat_003',
    ticketId: 'tck_1001',
    ticketNumber: 'TCK-1001',
    organizationId: 'org_001', // Oak Hill
    rating: 4,
    category: 'examinations_cbt',
    comment: 'Fast response during active exam. Appreciated the emergency override key.',
    submittedAt: '2026-03-17T09:00:00Z',
    reviewed: false,
  },
  {
    id: 'csat_004',
    ticketId: 'tck_historical_01',
    ticketNumber: 'TCK-0982',
    organizationId: 'org_002', // St. Jude
    rating: 4,
    category: 'billing_subscriptions',
    comment: 'Invoice currency converted to USD cleanly.',
    submittedAt: '2026-02-18T10:00:00Z',
    reviewed: true,
  },
  {
    id: 'csat_005',
    ticketId: 'tck_historical_02',
    ticketNumber: 'TCK-0965',
    organizationId: 'org_003', // Greenfield
    rating: 5,
    category: 'org_onboarding',
    comment: 'Seamless multi-branch campus migration.',
    submittedAt: '2026-02-10T14:30:00Z',
    reviewed: true,
  },
  {
    id: 'csat_006',
    ticketId: 'tck_historical_03',
    ticketNumber: 'TCK-0940',
    organizationId: 'org_010', // Riverdale
    rating: 3,
    category: 'performance_latency',
    comment: 'Took a few days to optimize the attendance report generation, but it works smoothly now.',
    submittedAt: '2026-01-28T11:00:00Z',
    reviewed: true,
    reviewerNotes: 'Followed up with engineering on background worker memory.',
  },
  {
    id: 'csat_007',
    ticketId: 'tck_historical_04',
    ticketNumber: 'TCK-0925',
    organizationId: 'org_001', // Oak Hill
    rating: 5,
    category: 'security_compliance',
    comment: 'Audit log exports provided full compliance reassurance for our governing board.',
    submittedAt: '2026-01-15T15:00:00Z',
    reviewed: true,
  },
];

export const INITIAL_CS_TASKS: CustomerSuccessTask[] = [
  {
    id: 'cst_001',
    title: 'Grade 11 CBT Midterm Exam Readiness Review',
    description: 'Verify Oak Hill Hall B network stabilization and run pre-exam diagnostic dry-run with Dr. Vance.',
    organizationId: 'org_001', // Oak Hill
    assignedOwnerId: 'usr_support_03', // Marcus Brody
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2026-03-18',
    relatedTicketId: 'tck_1001',
    createdAt: '2026-03-17T08:30:00Z',
  },
  {
    id: 'cst_002',
    title: 'Assist Beacon Hill with Multi-Campus DNS Propagation',
    description: 'Schedule a screen-share session with Arthur Pendelton to verify CNAME configuration and SSL issuance.',
    organizationId: 'org_007', // Beacon Hill
    assignedOwnerId: 'usr_support_03',
    priority: 'high',
    status: 'pending',
    dueDate: '2026-03-19',
    relatedTicketId: 'tck_1006',
    createdAt: '2026-03-17T07:00:00Z',
  },
  {
    id: 'cst_003',
    title: 'Quarterly Executive Account Review (St. Jude)',
    description: 'Review parent portal adoption metrics, report card generation speeds, and upcoming renewal plans.',
    organizationId: 'org_002', // St. Jude
    assignedOwnerId: 'usr_support_03',
    priority: 'normal',
    status: 'pending',
    dueDate: '2026-03-25',
    createdAt: '2026-03-10T10:00:00Z',
  },
  {
    id: 'cst_004',
    title: 'Resolve Greenfield Annual Plan Wire Remittance',
    description: 'Verify Dubai Islamic Bank wire settlement reference WT-2026-003 and remove pending payment portal banner.',
    organizationId: 'org_003', // Greenfield
    assignedOwnerId: 'usr_billing_04', // David Chen
    priority: 'normal',
    status: 'in_progress',
    dueDate: '2026-03-20',
    relatedTicketId: 'tck_1003',
    createdAt: '2026-03-16T12:00:00Z',
  },
  {
    id: 'cst_005',
    title: 'Suspension Appeal Follow-Up with Compliance Counsel',
    description: 'Review board counsel roster export request for Apex Charter and prepare executive approval package.',
    organizationId: 'org_004', // Apex Charter
    assignedOwnerId: 'usr_super_01', // Alexander Sterling
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2026-03-18',
    relatedTicketId: 'tck_1004',
    createdAt: '2026-03-16T16:00:00Z',
  },
  {
    id: 'cst_006',
    title: 'Campus Expansion Discovery Call (Horizon Poly)',
    description: 'Discuss proposed third vocational campus and recommend upgrade from Growth to Enterprise tier.',
    organizationId: 'org_006', // Horizon Poly
    assignedOwnerId: 'usr_support_03',
    priority: 'normal',
    status: 'pending',
    dueDate: '2026-03-28',
    createdAt: '2026-03-15T16:00:00Z',
  },
  {
    id: 'cst_007',
    title: 'Term 1 Admissions Onboarding Follow-Up (Cedar Valley)',
    description: 'Ensure student import reconciliation is complete and bursary fee templates are successfully configured.',
    organizationId: 'org_009', // Cedar Valley
    assignedOwnerId: 'usr_support_03',
    priority: 'low',
    status: 'completed',
    dueDate: '2026-03-14',
    completedAt: '2026-03-14T11:00:00Z',
    completionNotes: 'Confirmed 420 students enrolled with zero duplicate matriculation codes remaining.',
    createdAt: '2026-03-12T10:00:00Z',
  },
  {
    id: 'cst_008',
    title: 'Webhook Key Rotation Assistance (Riverdale)',
    description: 'Provide dual-secret verification documentation to Chloe Bennett for Friday rotation window.',
    organizationId: 'org_010', // Riverdale
    assignedOwnerId: 'usr_ops_02',
    priority: 'low',
    status: 'pending',
    dueDate: '2026-03-20',
    relatedTicketId: 'tck_1008',
    createdAt: '2026-03-17T09:45:00Z',
  },
];
