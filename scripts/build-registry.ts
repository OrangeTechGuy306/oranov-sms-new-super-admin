#!/usr/bin/env tsx
/**
 * Canonical SaaS Registry & Entitlement Artifact Generator (Phase P0-4)
 *
 * Reads live navigationConfig + TENANT_ROUTE_POLICIES + physical Next.js page routes
 * from `frontend/` and deterministically builds the single authoritative canonical
 * module, feature, and plan registry consumed identically by BOTH:
 *  - `dashboard/lib/modules/` (Super Admin Dashboard)
 *  - `frontend/lib/modules/` (Tenant Dashboard)
 */

import fs from "fs";
import path from "path";
import { navigationConfig } from "../../frontend/lib/navigation/navConfig";
import { TENANT_ROUTE_POLICIES } from "../../frontend/lib/permissions/routePolicies";
import {
  CANONICAL_REGISTRY_VERSION,
  validateCanonicalRegistryGraph,
  type CanonicalDependency,
  type CanonicalFeatureDefinition,
  type CanonicalGlobalAvailability,
  type CanonicalModuleDefinition,
  type CanonicalPlanDefinition,
  type CanonicalSchoolType,
  type ImplementationMaturity,
} from "../lib/modules/canonical-contract";
import type { CategoryMeta, MacroCategory } from "../lib/modules/types";

const DASHBOARD_ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.resolve(DASHBOARD_ROOT, "../frontend");
const SNAPSHOT_FILENAME = "canonical-registry-snapshot.ts";

const ALL_SCHOOL_TYPES: CanonicalSchoolType[] = [
  "nursery",
  "primary",
  "secondary",
  "combined",
  "college",
  "vocational",
  "international",
];

const POST_EARLY_YEARS_SCHOOL_TYPES: CanonicalSchoolType[] = [
  "primary",
  "secondary",
  "combined",
  "college",
  "vocational",
  "international",
];

const CATEGORY_METADATA: Record<string, CategoryMeta> = {
  core_dashboard: {
    key: "core_dashboard",
    label: "Core Dashboard & Workspaces",
    macroCategory: "communications",
    iconName: "LayoutDashboard",
    description: "Central overview, role-personalized workspaces, quick actions, and task queues.",
  },
  students_admissions: {
    key: "students_admissions",
    label: "Student Information & Admissions",
    macroCategory: "administration",
    iconName: "GraduationCap",
    description: "Student lifecycle directory, application inquiries, enrollments, and transfer tracking.",
  },
  parents_guardians: {
    key: "parents_guardians",
    label: "Parents & Guardians",
    macroCategory: "administration",
    iconName: "UserCheck",
    description: "Family units, guardian contact registers, relationship linkages, and communications.",
  },
  faculty_staff: {
    key: "faculty_staff",
    label: "Faculty & Staff Directory",
    macroCategory: "administration",
    iconName: "Users",
    description: "Unified teaching and non-teaching staff directory, postings, access, and assignments.",
  },
  academics_curriculum: {
    key: "academics_curriculum",
    label: "Academics & Curriculum",
    macroCategory: "academics",
    iconName: "BookOpen",
    description: "Academic sessions, terms, classes, departments, subjects, schemes, lesson plans, and progression.",
  },
  attendance_operations: {
    key: "attendance_operations",
    label: "Attendance & Daily Roll Calls",
    macroCategory: "academics",
    iconName: "CalendarCheck",
    description: "Period-by-period class attendance, late arrivals, staff clock-in, and absence tracking.",
  },
  timetables_scheduling: {
    key: "timetables_scheduling",
    label: "Timetables & Scheduling",
    macroCategory: "academics",
    iconName: "Clock",
    description: "Class schedule builder, room allocation, teacher workload conflict detection, and publishing.",
  },
  examinations_cbt: {
    key: "examinations_cbt",
    label: "Examinations & CBT Engine",
    macroCategory: "academics",
    iconName: "FileCheck",
    description: "Term exam timetabling, CBT question bank, candidate test delivery, labs, sync, and grading.",
  },
  results_grading: {
    key: "results_grading",
    label: "Results, Grading & Broadsheet",
    macroCategory: "academics",
    iconName: "Award",
    description: "Continuous assessment moderation, broadsheets, amendments, report cards, and cumulative transcripts.",
  },
  learning_lms: {
    key: "learning_lms",
    label: "Learning Management System (LMS)",
    macroCategory: "academics",
    iconName: "Layers",
    description: "Digital course units, learning materials, coursework assignments, rubrics, and virtual classrooms.",
  },
  communication_messaging: {
    key: "communication_messaging",
    label: "Communication & Notifications",
    macroCategory: "communications",
    iconName: "Mail",
    description: "Multi-channel inbox, reminders, alerts, announcements, payment requests, templates, and delivery logs.",
  },
  calendar_events: {
    key: "calendar_events",
    label: "School Calendar & Events",
    macroCategory: "communications",
    iconName: "Calendar",
    description: "Master institutional calendar, term dates, statutory holidays, and school community events.",
  },
  finance_bursary: {
    key: "finance_bursary",
    label: "Finance, Billing & Bursary",
    macroCategory: "finance",
    iconName: "CreditCard",
    description: "Fee schedules, student initialization, billing, cashier collections, ledger, debtors, and audit.",
  },
  hr_payroll: {
    key: "hr_payroll",
    label: "Human Resources & Payroll",
    macroCategory: "administration",
    iconName: "Briefcase",
    description: "Employee contracts, leave requests and policies, monthly payroll runs, payslips, and compensation.",
  },
  library_circulation: {
    key: "library_circulation",
    label: "Digital Library & Barcodes",
    macroCategory: "administration",
    iconName: "Library",
    description: "Book cataloguing, barcode issue/return scanning, digital resources, overdue fines, and patron accounts.",
  },
  inventory_assets: {
    key: "inventory_assets",
    label: "Inventory & Asset Management",
    macroCategory: "administration",
    iconName: "Package",
    description: "Central store inventory, stock movements, reconciliation counts, asset registers, and maintenance.",
  },
  procurement_orders: {
    key: "procurement_orders",
    label: "Procurement & Purchase Orders",
    macroCategory: "administration",
    iconName: "ShoppingCart",
    description: "Purchase requisitions, multi-level approvals, supplier management, purchase orders, and goods receipts.",
  },
  transport_fleet: {
    key: "transport_fleet",
    label: "Transport & Fleet Operations",
    macroCategory: "administration",
    iconName: "Bus",
    description: "Bus route optimization, vehicle maintenance logs, driver scheduling, and student route enrollments.",
  },
  hostel_residential: {
    key: "hostel_residential",
    label: "Hostel & Residential Boarding",
    macroCategory: "administration",
    iconName: "Home",
    description: "Dormitory buildings, room/bed allocation, residential roll call, leave exeat passes, and room inspections.",
  },
  cafeteria_dining: {
    key: "cafeteria_dining",
    label: "Cafeteria & Dining Operations",
    macroCategory: "administration",
    iconName: "Utensils",
    description: "Nutritional meal planning, weekly menus, meal schedules, student prepaid wallet debits, and allergens.",
  },
  health_infirmary: {
    key: "health_infirmary",
    label: "Health & Infirmary Services",
    macroCategory: "administration",
    iconName: "HeartPulse",
    description: "Student medical profiles, clinic visit logs, MAR medication tracking, critical alerts, and audits.",
  },
  behaviour_discipline: {
    key: "behaviour_discipline",
    label: "Behaviour, Discipline & Rewards",
    macroCategory: "administration",
    iconName: "ShieldAlert",
    description: "Incident logs, formal disciplinary cases, positive recognition, reward points, and counselling referrals.",
  },
  activities_clubs: {
    key: "activities_clubs",
    label: "Clubs, Sports & Extracurricular",
    macroCategory: "administration",
    iconName: "Trophy",
    description: "Clubs, sports teams, fixtures, competition schedules, activity sessions, and guardian consents.",
  },
  safeguarding_dsl: {
    key: "safeguarding_dsl",
    label: "Safeguarding & Child Protection (DSL)",
    macroCategory: "administration",
    iconName: "Lock",
    description: "Designated Safeguarding Lead (DSL) protective concerns, confidential case notes, and action tracking.",
  },
  engagement_community: {
    key: "engagement_community",
    label: "Parent & Community Engagement",
    macroCategory: "communications",
    iconName: "Users2",
    description: "Parent-teacher conferences, appointment bookings, parent enquiries, PTA dues, surveys, and polls.",
  },
  security_gate: {
    key: "security_gate",
    label: "Security, Gate Operations & Visitors",
    macroCategory: "platform_security",
    iconName: "Shield",
    description: "Campus visitor check-in, digital gate passes, authorized student pickup queues, and early departures.",
  },
  documents_records: {
    key: "documents_records",
    label: "Documents, Forms & Certificates",
    macroCategory: "communications",
    iconName: "FileText",
    description: "Institutional document repository, e-signatures, certificate generation studio, and custom forms.",
  },
  analytics_intelligence: {
    key: "analytics_intelligence",
    label: "Analytics, BI & Intelligence",
    macroCategory: "analytics",
    iconName: "LineChart",
    description: "Executive dashboards, cohort analytics, attendance retention metrics, and financial intelligence.",
  },
  reports_data_quality: {
    key: "reports_data_quality",
    label: "Custom Reports & Data Quality",
    macroCategory: "analytics",
    iconName: "FileSpreadsheet",
    description: "Custom report builder, automated schedules, export center, and data quality reconciliation checks.",
  },
  campuses_governance: {
    key: "campuses_governance",
    label: "Campuses & Multi-Branch Governance",
    macroCategory: "administration",
    iconName: "Building2",
    description: "Branch management, campus resource allocation, multi-branch switching, and institutional isolation.",
  },
  tenant_settings: {
    key: "tenant_settings",
    label: "School Settings & Configuration",
    macroCategory: "administration",
    iconName: "Settings",
    description: "School branding, academic year parameters, localization, subscription visibility, and security controls.",
  },
  system_platform: {
    key: "system_platform",
    label: "Platform Core & Infrastructure",
    macroCategory: "platform_security",
    iconName: "Server",
    description: "Core platform authentication, HTTP error boundaries, user session management, and routing.",
  },
};

const TOP_CATEGORY_MAP: Record<string, { category: string; macroCategory: MacroCategory }> = {
  mod_dashboard: { category: "core_dashboard", macroCategory: "communications" },
  mod_students: { category: "students_admissions", macroCategory: "administration" },
  mod_parents: { category: "parents_guardians", macroCategory: "administration" },
  mod_staff: { category: "faculty_staff", macroCategory: "administration" },
  mod_teachers: { category: "faculty_staff", macroCategory: "administration" },
  mod_academics: { category: "academics_curriculum", macroCategory: "academics" },
  mod_attendance: { category: "attendance_operations", macroCategory: "academics" },
  mod_timetables: { category: "timetables_scheduling", macroCategory: "academics" },
  mod_examinations: { category: "examinations_cbt", macroCategory: "academics" },
  mod_results: { category: "results_grading", macroCategory: "academics" },
  mod_learning_hub: { category: "learning_lms", macroCategory: "academics" },
  mod_classroom: { category: "learning_lms", macroCategory: "academics" },
  mod_materials: { category: "learning_lms", macroCategory: "academics" },
  mod_lessons: { category: "learning_lms", macroCategory: "academics" },
  mod_assignments: { category: "learning_lms", macroCategory: "academics" },
  mod_teacher_workspace: { category: "learning_lms", macroCategory: "academics" },
  mod_student_portal: { category: "learning_lms", macroCategory: "academics" },
  mod_communication: { category: "communication_messaging", macroCategory: "communications" },
  mod_notifications: { category: "communication_messaging", macroCategory: "communications" },
  mod_meetings: { category: "engagement_community", macroCategory: "communications" },
  mod_calendar: { category: "calendar_events", macroCategory: "communications" },
  mod_finance: { category: "finance_bursary", macroCategory: "finance" },
  mod_hr: { category: "hr_payroll", macroCategory: "administration" },
  mod_library: { category: "library_circulation", macroCategory: "administration" },
  mod_inventory: { category: "inventory_assets", macroCategory: "administration" },
  mod_assets: { category: "inventory_assets", macroCategory: "administration" },
  mod_procurement: { category: "procurement_orders", macroCategory: "administration" },
  mod_transport: { category: "transport_fleet", macroCategory: "administration" },
  mod_hostel: { category: "hostel_residential", macroCategory: "administration" },
  mod_cafeteria: { category: "cafeteria_dining", macroCategory: "administration" },
  mod_health: { category: "health_infirmary", macroCategory: "administration" },
  mod_behaviour: { category: "behaviour_discipline", macroCategory: "administration" },
  mod_safeguarding: { category: "safeguarding_dsl", macroCategory: "administration" },
  mod_activities: { category: "activities_clubs", macroCategory: "administration" },
  mod_engagement_hub: { category: "engagement_community", macroCategory: "communications" },
  mod_security_overview: { category: "security_gate", macroCategory: "platform_security" },
  mod_security_visitors: { category: "security_gate", macroCategory: "platform_security" },
  mod_security_pickup: { category: "security_gate", macroCategory: "platform_security" },
  mod_security_early_leave: { category: "security_gate", macroCategory: "platform_security" },
  mod_security_gate_passes: { category: "security_gate", macroCategory: "platform_security" },
  mod_security_incidents: { category: "security_gate", macroCategory: "platform_security" },
  mod_security_reports: { category: "security_gate", macroCategory: "platform_security" },
  mod_security_settings: { category: "security_gate", macroCategory: "platform_security" },
  mod_documents_repository: { category: "documents_records", macroCategory: "communications" },
  mod_documents_upload: { category: "documents_records", macroCategory: "communications" },
  mod_documents_approvals: { category: "documents_records", macroCategory: "communications" },
  mod_documents_requests: { category: "documents_records", macroCategory: "communications" },
  mod_documents_expiry: { category: "documents_records", macroCategory: "communications" },
  mod_forms: { category: "documents_records", macroCategory: "communications" },
  mod_certificates: { category: "documents_records", macroCategory: "communications" },
  mod_documents_signatures: { category: "documents_records", macroCategory: "communications" },
  mod_documents_retention: { category: "documents_records", macroCategory: "communications" },
  mod_documents_settings: { category: "documents_records", macroCategory: "communications" },
  mod_analytics: { category: "analytics_intelligence", macroCategory: "analytics" },
  mod_reports: { category: "reports_data_quality", macroCategory: "analytics" },
  mod_campuses: { category: "campuses_governance", macroCategory: "administration" },
  mod_settings: { category: "tenant_settings", macroCategory: "administration" },
};

const MODULE_DEPENDENCIES: Record<string, CanonicalDependency[]> = {
  mod_attendance: [
    { moduleId: "mod_students", type: "required", description: "Attendance roll calls record daily marks for enrolled students" },
    { moduleId: "mod_academics", type: "optional", description: "Roll calls group students by academic class and term" },
  ],
  mod_timetables: [
    { moduleId: "mod_academics", type: "required", description: "Timetables schedule classes, arms, and curriculum subjects" },
    { moduleId: "mod_staff", type: "optional", description: "Faculty assignment maps teachers to scheduled periods" },
  ],
  mod_examinations: [
    { moduleId: "mod_academics", type: "required", description: "Assessments evaluate curriculum subjects across active terms" },
    { moduleId: "mod_students", type: "required", description: "Candidates taking exams must be active registered students" },
  ],
  mod_results: [
    { moduleId: "mod_examinations", type: "required", description: "Broadsheets and transcripts aggregate assessment exam scores" },
    { moduleId: "mod_students", type: "required", description: "Official report cards and cumulative transcripts issue to students" },
  ],
  mod_learning_hub: [
    { moduleId: "mod_academics", type: "required", description: "LMS course units follow academic schemes of work and subjects" },
  ],
  mod_classroom: [
    { moduleId: "mod_learning_hub", type: "required", description: "Virtual classroom sessions deliver LMS course units" },
    { moduleId: "mod_students", type: "optional", description: "Student rosters join interactive classroom sessions" },
  ],
  mod_materials: [
    { moduleId: "mod_academics", type: "required", description: "Course materials align with academic curriculum subjects" },
  ],
  mod_lessons: [
    { moduleId: "mod_academics", type: "required", description: "Digital lessons align with academic curriculum subjects" },
  ],
  mod_assignments: [
    { moduleId: "mod_learning_hub", type: "required", description: "Assignments and tasks align with LMS course units" },
    { moduleId: "mod_students", type: "required", description: "Coursework tasks are submitted by enrolled students" },
  ],
  mod_teacher_workspace: [
    { moduleId: "mod_learning_hub", type: "required", description: "Teacher workspace plans lesson units, rubrics, and grading" },
    { moduleId: "mod_staff", type: "required", description: "Requires unified faculty staff profiles and teaching assignments" },
  ],
  mod_student_portal: [
    { moduleId: "mod_learning_hub", type: "required", description: "Student workspace accesses published lesson materials" },
    { moduleId: "mod_students", type: "required", description: "Requires active student enrollment records" },
  ],
  mod_finance: [
    { moduleId: "mod_students", type: "required", description: "Tuition and fees are invoiced against enrolled student accounts" },
  ],
  mod_library: [
    { moduleId: "mod_students", type: "required", description: "Circulation loans and barcode checkout issue to student/staff patrons" },
  ],
  mod_procurement: [
    { moduleId: "mod_inventory", type: "required", description: "Purchase orders replenish stock items registered in General Inventory" },
  ],
  mod_transport: [
    { moduleId: "mod_students", type: "required", description: "Bus route subscriptions and daily boarding manifests enroll students" },
  ],
  mod_hostel: [
    { moduleId: "mod_students", type: "required", description: "Hostel rooms, beds, and residential roll calls allocate students" },
  ],
  mod_cafeteria: [
    { moduleId: "mod_students", type: "required", description: "Meal plans and POS dining checkouts link to student wallets" },
  ],
  mod_health: [
    { moduleId: "mod_students", type: "required", description: "Infirmary visits, allergies, and MAR logs document student health" },
  ],
  mod_behaviour: [
    { moduleId: "mod_students", type: "required", description: "Disciplinary incidents, points, and support plans record on student files" },
  ],
  mod_safeguarding: [
    { moduleId: "mod_students", type: "required", description: "Protective welfare concerns and DSL case files monitor students" },
  ],
  mod_activities: [
    { moduleId: "mod_students", type: "required", description: "Sports teams, club memberships, and guardian consents register students" },
  ],
  mod_engagement_hub: [
    { moduleId: "mod_students", type: "required", description: "Parent-teacher conferences and enquiries relate to enrolled students" },
    { moduleId: "mod_parents", type: "required", description: "Requires registered parent/guardian profiles" },
  ],
  mod_security_pickup: [
    { moduleId: "mod_students", type: "required", description: "Pickup authorizations grant verified guardians gate collection rights" },
  ],
  mod_security_early_leave: [
    { moduleId: "mod_students", type: "required", description: "Early departure gate passes release enrolled students from campus" },
  ],
  mod_analytics: [
    { moduleId: "mod_academics", type: "optional", description: "Aggregates academic examination grades and term results" },
    { moduleId: "mod_attendance", type: "optional", description: "Calculates longitudinal school-wide attendance rates" },
    { moduleId: "mod_finance", type: "optional", description: "Visualizes fee collection and revenue realization metrics" },
  ],
  mod_reports: [
    { moduleId: "mod_students", type: "optional", description: "Custom query builder extracts student demographic fields" },
    { moduleId: "mod_finance", type: "optional", description: "Financial reconciliation reports export billing transactions" },
  ],
  // Cross-referenced submodules under Campuses depend on the primary domain module optionally
  sub_campuses_class_catalogue: [
    { moduleId: "mod_academics", type: "required", description: "Master class catalogue links directly into Academics & Curriculum" },
  ],
  sub_campuses_subject_catalogue: [
    { moduleId: "mod_academics", type: "required", description: "Master subject catalogue links directly into Academics & Curriculum" },
  ],
  sub_campuses_fee_structures: [
    { moduleId: "mod_finance", type: "required", description: "Campus fee structures synchronize with Finance & Fee Management" },
  ],
  sub_campuses_fee_categories: [
    { moduleId: "mod_finance", type: "required", description: "Fee categories synchronize with Finance & Fee Management" },
  ],
};

// Modules whose frontend screens work in mock/dev state while production gateway/hardware sync is partial
const PARTIAL_MATURITY_IDS: Record<string, string> = {
  sub_exam_cbt_sync: "Local IndexedDB/memory offline exam queue works in frontend; LAN edge sync daemon requires future backend worker.",
  sub_notifications_integrations: "Gateway provider configuration UI works locally; live SMS/WhatsApp webhook relay requires future backend service.",
  mod_analytics: "Dashboards compute deterministic cohort analytics over mock fixtures; warehouse streaming queries require future backend.",
  sub_reports_schedules: "Automated schedule cadence UI works locally; background cron email dispatch requires future backend scheduler.",
  mod_documents_signatures: "E-signature envelope preview & verification hash work locally; external PKI/webhook signing awaits backend.",
  mod_procurement: "Requisition, approval, and PO workflows operate in local state; ERP accounting webhooks await backend.",
};

const MODULE_SCHOOL_TYPES: Record<string, CanonicalSchoolType[]> = {
  mod_hostel: POST_EARLY_YEARS_SCHOOL_TYPES,
  sub_hostel_overview: POST_EARLY_YEARS_SCHOOL_TYPES,
  sub_hostel_dormitories: POST_EARLY_YEARS_SCHOOL_TYPES,
  sub_hostel_allocations: POST_EARLY_YEARS_SCHOOL_TYPES,
  sub_hostel_attendance: POST_EARLY_YEARS_SCHOOL_TYPES,
  sub_hostel_leave: POST_EARLY_YEARS_SCHOOL_TYPES,
  sub_hostel_maintenance: POST_EARLY_YEARS_SCHOOL_TYPES,
  sub_hostel_incidents: POST_EARLY_YEARS_SCHOOL_TYPES,
  sub_hostel_assets: POST_EARLY_YEARS_SCHOOL_TYPES,
  sub_hostel_reports: POST_EARLY_YEARS_SCHOOL_TYPES,
  sub_hostel_settings: POST_EARLY_YEARS_SCHOOL_TYPES,
};

function navIdToModuleId(navId: string, isTopLevel: boolean): string {
  const bare = navId.startsWith("nav-") ? navId.slice(4) : navId;
  return `${isTopLevel ? "mod" : "sub"}_${bare.replace(/-/g, "_")}`;
}

function collectDiskPages(dir: string, prefix = ""): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const seg =
        entry.name.startsWith("(") && entry.name.endsWith(")")
          ? ""
          : `/${entry.name}`;
      results.push(...collectDiskPages(full, `${prefix}${seg}`));
    } else if (entry.name === "page.tsx") {
      results.push(prefix || "/");
    }
  }
  return results.sort();
}

const EXPLICIT_ROUTE_TO_MODULE: Record<string, string> = {
  "/profile": "mod_dashboard",
  "/onboarding": "mod_settings",
  "/support": "mod_settings",
  "/settings/activity": "mod_settings",
  "/settings/account": "mod_settings",
  "/settings/profile": "mod_settings",
  "/settings/security": "mod_settings",
  "/settings/subscription": "mod_settings",
  "/subscription": "mod_settings",
  "/admissions": "sub_students_admissions",
  "/assignments": "mod_assignments",
  "/cbt": "sub_exam_cbt",
  "/meetings": "mod_meetings",
  "/results": "mod_results",
  "/teachers": "mod_teachers",
  "/teachers/new": "sub_teachers_new",
  "/teachers/[teacherId]": "sub_teachers_directory",
  "/print/student-id-cards": "sub_students_id_cards",
  "/print/staff-id-cards": "sub_staff_id_cards",
  "/academic/graduation": "sub_academics_graduation",
  "/academic/progression": "sub_academics_progression",
  "/academic/progression/[studentId]": "sub_academics_progression",
  "/academic/promotion": "sub_academics_promotion",
  "/academic/promotion/audit": "sub_academics_promotion_audit",
  "/academic/promotion/conditional": "sub_academics_promotion_conditional",
  "/academic/promotion/placement": "sub_academics_promotion_advancement",
  "/academic/promotion/policies": "sub_academics_promotion_policies",
  "/academic/promotion/resits": "sub_academics_promotion_resits",
  "/academic/promotion/review": "sub_academics_promotion_review",
  "/academics/promotion/conditional/carry-over": "sub_academics_promotion_conditional",
  "/academics/promotion/conditional/remediation": "sub_academics_promotion_conditional",
  "/academics/promotion/conditional/resits": "sub_academics_promotion_resits",
  "/academics/graduation/candidates": "sub_academics_graduation",
  "/academics/graduation/clearances": "sub_academics_graduation",
  "/academics/graduation/cohorts": "sub_academics_graduation",
  "/academics/graduation/records": "sub_academics_graduation",
  "/academics/graduation/reports": "sub_academics_graduation",
  "/academics/graduation/requirements": "sub_academics_graduation",
  "/attendance/staff/print": "sub_attendance_staff",
  "/attendance/students/absentees": "sub_attendance_daily",
  "/attendance/students/analytics": "sub_attendance_reports",
  "/attendance/students/print": "sub_attendance_registers",
  "/campuses/[campusId]": "sub_campuses_overview",
  "/campuses/[campusId]/edit": "sub_campuses_overview",
  "/examinations/academic-support": "sub_exam_analytics",
  "/examinations/cbt/[examId]/seating": "sub_exam_cbt",
  "/examinations/cbt/command-center": "sub_exam_cbt",
  "/examinations/ranking": "sub_results_broadsheet",
  "/examinations/reports": "sub_exam_analytics",
  "/examinations/student-history": "sub_results_transcripts",
  "/examinations/student-history/[studentId]": "sub_results_transcripts",
  "/finance/debtors/recovery": "sub_finance_debtors",
  "/finance/fee-structures/new": "sub_finance_fees",
  "/finance/fee-structures/[structureId]": "sub_finance_fees",
  "/finance/student-initialization": "sub_finance_initialization",
  "/notifications/birthdays/history": "sub_notifications_birthdays",
  "/notifications/birthdays/settings": "sub_notifications_birthdays",
  "/notifications/payment-requests/history": "sub_notifications_payment_requests",
  "/notifications/reminders/calendar": "sub_notifications_reminders",
  "/notifications/reminders/history": "sub_notifications_reminders",
  "/staff/[staffId]/exit": "sub_staff_former",
  "/staff/access/templates": "sub_staff_access",
  "/students/alumni/[alumniId]": "sub_students_alumni",
  "/students/alumni/groups": "sub_students_alumni",
  "/students/pickup/persons": "sub_students_pickup",
};

function buildModules(): CanonicalModuleDefinition[] {
  const modules: CanonicalModuleDefinition[] = [];
  let displayOrder = 1;

  for (const section of navigationConfig) {
    for (const item of section.items) {
      // P0-6 utility workspaces are mapped onto mod_settings via EXPLICIT_ROUTE_TO_MODULE
      // to keep canonical module cardinality stable (398 modules: 57 top-level, 341 submodules).
      if (item.id === "nav-support" || item.id === "nav-activity-history") {
        continue;
      }
      const topId = navIdToModuleId(item.id, true);
      const topCat = TOP_CATEGORY_MAP[topId] || {
        category: "tenant_settings",
        macroCategory: "administration" as MacroCategory,
      };
      const topMaturity: ImplementationMaturity = PARTIAL_MATURITY_IDS[topId] ? "partial" : "implemented";
      const topDeps = MODULE_DEPENDENCIES[topId] || [];

      modules.push({
        id: topId,
        navId: item.id,
        name: item.label,
        code: topId.slice(4).toUpperCase(),
        description:
          CATEGORY_METADATA[topCat.category]?.description ||
          `Institutional tenant module for ${item.label}.`,
        kind: "module",
        registryVersion: CANONICAL_REGISTRY_VERSION,
        category: topCat.category,
        macroCategory: topCat.macroCategory,
        href: item.href,
        routes: [item.href],
        status: topMaturity,
        availabilityStatus: "enabled",
        implementationMaturity: topMaturity,
        maturityNote: PARTIAL_MATURITY_IDS[topId],
        statusRationale:
          PARTIAL_MATURITY_IDS[topId] ||
          `Verified Next.js App Router UI workflows under ${item.href} with typed mock/API boundaries.`,
        isGloballyEnabled: true,
        includedInPlans: [], // Backfilled after deterministic plan calculation
        requiresAddonLicense: ["mod_procurement", "mod_analytics", "mod_safeguarding"].includes(topId),
        dependencies: topDeps,
        requiredPermissions: item.permissions || [],
        allowedRoles: ["super_admin", "school_principal", "academic_director", "teacher", "accountant", "librarian", "staff"],
        supportedSchoolTypes: MODULE_SCHOOL_TYPES[topId] || ALL_SCHOOL_TYPES,
        featureIds: [], // Backfilled from CANONICAL_FEATURES
        sourceEvidence: {
          routePath: `app/(tenant)${item.href}/page.tsx`,
          navGroupId: section.id,
        },
        supportedWorkflows: [
          `Access and manage ${item.label} operational records`,
          `Enforce tenant RBAC and active subscription entitlements`,
        ],
        knownLimitations: [
          "Frontend simulation store persists state client-side during development",
          ...(PARTIAL_MATURITY_IDS[topId] ? [PARTIAL_MATURITY_IDS[topId]] : []),
        ],
        futureBackendRequirements: [
          `Persistent multi-tenant API backing ${item.href}`,
          `Server-side RBAC + signed subscription entitlement claims`,
        ],
        dataSensitivity:
          ["finance_bursary", "hr_payroll"].includes(topCat.category)
            ? "financial"
            : ["safeguarding_dsl", "health_infirmary", "students_admissions", "faculty_staff", "parents_guardians"].includes(topCat.category)
            ? "restricted_pii"
            : "standard",
        displayOrder: displayOrder++,
      });

      for (const child of item.children ?? []) {
        const subId = navIdToModuleId(child.id, false);
        const subMaturity: ImplementationMaturity = PARTIAL_MATURITY_IDS[subId]
          ? "partial"
          : topMaturity;
        const baseDeps: CanonicalDependency[] = [
          {
            moduleId: topId,
            type: "required",
            description: `Submodule requires parent module ${item.label} to be active and entitled`,
          },
          ...(MODULE_DEPENDENCIES[subId] || []),
        ];

        modules.push({
          id: subId,
          navId: child.id,
          name: child.label,
          code: subId.slice(4).toUpperCase(),
          description: `Specialized submodule for ${child.label} within ${item.label}.`,
          kind: "submodule",
          registryVersion: CANONICAL_REGISTRY_VERSION,
          category: topCat.category,
          macroCategory: topCat.macroCategory,
          parentId: topId,
          href: child.href,
          routes: [child.href],
          status: subMaturity,
          availabilityStatus: "enabled",
          implementationMaturity: subMaturity,
          maturityNote: PARTIAL_MATURITY_IDS[subId],
          statusRationale:
            PARTIAL_MATURITY_IDS[subId] ||
            `Verified Next.js App Router submodule route at ${child.href}.`,
          isGloballyEnabled: true,
          includedInPlans: [],
          requiresAddonLicense:
            ["mod_procurement", "mod_analytics", "mod_safeguarding"].includes(topId) ||
            ["sub_exam_cbt"].includes(subId),
          dependencies: baseDeps,
          requiredPermissions: child.permissions || item.permissions || [],
          allowedRoles: ["super_admin", "school_principal", "academic_director", "teacher", "accountant", "librarian", "staff"],
          supportedSchoolTypes: MODULE_SCHOOL_TYPES[subId] || MODULE_SCHOOL_TYPES[topId] || ALL_SCHOOL_TYPES,
          featureIds: [],
          sourceEvidence: {
            routePath: `app/(tenant)${child.href}/page.tsx`,
            navGroupId: section.id,
          },
          supportedWorkflows: [`Execute ${child.label} workflows within ${item.label}`],
          knownLimitations: PARTIAL_MATURITY_IDS[subId] ? [PARTIAL_MATURITY_IDS[subId]] : ["Development mock API adapter boundary"],
          futureBackendRequirements: [
            `Server-side authorization matching permissions: ${(child.permissions || item.permissions || []).join(", ") || "tenant.view"}`,
          ],
          dataSensitivity:
            ["finance_bursary", "hr_payroll"].includes(topCat.category)
              ? "financial"
              : ["safeguarding_dsl", "health_infirmary", "students_admissions", "faculty_staff", "parents_guardians"].includes(topCat.category)
              ? "restricted_pii"
              : "standard",
          displayOrder: displayOrder++,
        });
      }
    }
  }

  // Legacy deprecated modules from SM-02 consolidation (routes redirect in next.config.ts)
  modules.push(
    {
      id: "mod_teachers",
      navId: "nav-teachers",
      name: "Faculty & Teachers (Legacy Redirect)",
      code: "TEACHERS",
      description: "Deprecated standalone teachers module consolidated into unified Faculty & Staff Management (mod_staff).",
      kind: "module",
      registryVersion: CANONICAL_REGISTRY_VERSION,
      category: "faculty_staff",
      macroCategory: "administration",
      href: "/teachers",
      routes: ["/teachers"],
      status: "deprecated",
      availabilityStatus: "deprecated",
      implementationMaturity: "implemented",
      maturityNote: "Consolidated in SM-02; requests redirect cleanly via next.config.ts to /staff/directory?type=academic.",
      statusRationale: "SM-02 unified teaching and non-teaching staff under /staff; kept as deprecated compatibility mapping.",
      isGloballyEnabled: false,
      includedInPlans: [],
      requiresAddonLicense: false,
      dependencies: [],
      requiredPermissions: ["staff.view"],
      allowedRoles: ["super_admin", "school_principal", "academic_director", "staff"],
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      featureIds: [],
      deprecatedReason: "Consolidated into unified Faculty & Staff Management (mod_staff) in SM-02.",
      replacedByModuleId: "mod_staff",
      sourceEvidence: { routePath: "next.config.ts redirect -> /staff/directory?type=academic" },
      supportedWorkflows: ["Redirects legacy /teachers bookmarks to /staff/directory?type=academic"],
      knownLimitations: ["Deprecated module — excluded from new plan allocations"],
      futureBackendRequirements: ["Retain redirect compatibility alias during migration"],
      dataSensitivity: "restricted_pii",
      displayOrder: displayOrder++,
    },
    {
      id: "sub_teachers_directory",
      navId: "nav-teachers-directory",
      name: "Faculty Directory (Legacy Redirect)",
      code: "TEACHERS_DIRECTORY",
      description: "Deprecated submodule consolidated into Unified Staff Directory (sub_staff_directory).",
      kind: "submodule",
      registryVersion: CANONICAL_REGISTRY_VERSION,
      category: "faculty_staff",
      macroCategory: "administration",
      parentId: "mod_teachers",
      href: "/teachers",
      routes: ["/teachers", "/teachers/[teacherId]"],
      status: "deprecated",
      availabilityStatus: "deprecated",
      implementationMaturity: "implemented",
      statusRationale: "Redirects to /staff/directory and /staff/[staffId] per SM-02/SM-10.",
      isGloballyEnabled: false,
      includedInPlans: [],
      requiresAddonLicense: false,
      dependencies: [{ moduleId: "mod_teachers", type: "required", description: "Legacy parent module" }],
      requiredPermissions: ["staff.view"],
      allowedRoles: ["super_admin", "school_principal", "academic_director", "staff"],
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      featureIds: [],
      deprecatedReason: "Replaced by sub_staff_directory.",
      replacedByModuleId: "sub_staff_directory",
      sourceEvidence: { routePath: "next.config.ts redirect -> /staff/[staffId]" },
      supportedWorkflows: ["Legacy redirect to unified staff profile"],
      knownLimitations: ["Deprecated compatibility route"],
      futureBackendRequirements: ["Retain legacy bookmark redirect"],
      dataSensitivity: "restricted_pii",
      displayOrder: displayOrder++,
    },
    {
      id: "sub_teachers_new",
      navId: "nav-teachers-new",
      name: "Onboard Faculty (Legacy Redirect)",
      code: "TEACHERS_NEW",
      description: "Deprecated submodule consolidated into Onboard Staff Member (sub_staff_new).",
      kind: "submodule",
      registryVersion: CANONICAL_REGISTRY_VERSION,
      category: "faculty_staff",
      macroCategory: "administration",
      parentId: "mod_teachers",
      href: "/teachers/new",
      routes: ["/teachers/new"],
      status: "deprecated",
      availabilityStatus: "deprecated",
      implementationMaturity: "implemented",
      statusRationale: "Redirects /teachers/new -> /staff/new per SM-02.",
      isGloballyEnabled: false,
      includedInPlans: [],
      requiresAddonLicense: false,
      dependencies: [{ moduleId: "mod_teachers", type: "required", description: "Legacy parent module" }],
      requiredPermissions: ["staff.create"],
      allowedRoles: ["super_admin", "school_principal", "staff"],
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      featureIds: [],
      deprecatedReason: "Replaced by sub_staff_new.",
      replacedByModuleId: "sub_staff_new",
      sourceEvidence: { routePath: "next.config.ts redirect -> /staff/new" },
      supportedWorkflows: ["Legacy redirect to /staff/new"],
      knownLimitations: ["Deprecated compatibility route"],
      futureBackendRequirements: ["Retain legacy bookmark redirect"],
      dataSensitivity: "restricted_pii",
      displayOrder: displayOrder++,
    }
  );

  // Assign every physical route under (tenant) & (print) deterministically so 0 routes are unmapped
  const modMap = new Map(modules.map((m) => [m.id, m]));
  const diskRoutes = [
    ...collectDiskPages(path.join(FRONTEND_ROOT, "app/(tenant)")),
    ...collectDiskPages(path.join(FRONTEND_ROOT, "app/(print)")),
  ];

  // Sort modules by href length desc (preferring submodules for exact sub-route attachment)
  const sortedByHrefDesc = [...modules].sort((a, b) => {
    const lenDiff = b.href.length - a.href.length;
    if (lenDiff !== 0) return lenDiff;
    return a.kind === "submodule" && b.kind === "module" ? -1 : 1;
  });

  for (const route of diskRoutes) {
    const explicitId = EXPLICIT_ROUTE_TO_MODULE[route];
    if (explicitId && modMap.has(explicitId)) {
      const target = modMap.get(explicitId)!;
      if (!target.routes.includes(route)) target.routes.push(route);
      continue;
    }

    const exact = sortedByHrefDesc.find((m) => m.href === route);
    if (exact) {
      if (!exact.routes.includes(route)) exact.routes.push(route);
      continue;
    }

    // Dynamic or detail route prefix match (skip cross-domain shortcuts in mod_campuses when matching real domain sub-paths)
    const matched = sortedByHrefDesc.find((m) => {
      if (m.parentId === "mod_campuses" && !m.href.startsWith("/campuses")) return false;
      return route === m.href || route.startsWith(`${m.href}/`);
    });

    if (matched) {
      if (!matched.routes.includes(route)) matched.routes.push(route);
    } else {
      throw new Error(`Unmapped physical route detected during registry generation: ${route}`);
    }
  }

  for (const mod of modules) {
    mod.routes = Array.from(new Set(mod.routes)).sort();
  }

  return modules;
}

function expandWithDependencies(
  seedIds: string[],
  modulesById: Map<string, CanonicalModuleDefinition>
): string[] {
  const result = new Set<string>();
  const visit = (id: string) => {
    if (result.has(id)) return;
    const mod = modulesById.get(id);
    if (!mod || mod.availabilityStatus === "deprecated") return;
    result.add(id);
    if (mod.parentId) visit(mod.parentId);
    for (const dep of mod.dependencies) {
      if (dep.type === "required") visit(dep.moduleId);
    }
  };
  for (const id of seedIds) visit(id);
  return Array.from(result).sort();
}

function buildPlansAndFeatures(modules: CanonicalModuleDefinition[]): {
  plans: CanonicalPlanDefinition[];
  features: CanonicalFeatureDefinition[];
} {
  const modulesById = new Map(modules.map((m) => [m.id, m]));
  const activeModules = modules.filter((m) => m.availabilityStatus !== "deprecated");

  // Starter: core SIS, parents, staff essentials, academics basics, attendance, timetables, exams/results basics, communication/notifications, calendar, finance essentials, basic gate security & documents, settings
  const starterSeedIds = [
    "mod_dashboard",
    "mod_students",
    "sub_students_overview",
    "sub_students_directory",
    "sub_students_admissions",
    "sub_students_new",
    "sub_students_transfer_in",
    "sub_students_population",
    "sub_students_promotion",
    "sub_students_reports",
    "mod_parents",
    "sub_parents_directory",
    "sub_parents_new",
    "mod_staff",
    "sub_staff_overview",
    "sub_staff_directory",
    "sub_staff_new",
    "sub_staff_class_assignments",
    "sub_staff_subject_assignments",
    "mod_academics",
    "sub_academics_overview",
    "sub_academics_sessions",
    "sub_academics_terms",
    "sub_academics_classes",
    "sub_academics_subjects",
    "sub_academics_curriculum",
    "sub_academics_departments",
    "sub_academics_assignments",
    "sub_academics_enrollments",
    "sub_academics_promotion",
    "mod_attendance",
    "sub_attendance_overview",
    "sub_attendance_daily",
    "sub_attendance_registers",
    "sub_attendance_history",
    "sub_attendance_reports",
    "sub_attendance_settings",
    "mod_timetables",
    "sub_timetables_overview",
    "sub_timetables_classes",
    "sub_timetables_teachers",
    "sub_timetables_publishing",
    "mod_examinations",
    "sub_exam_overview",
    "sub_exam_periods",
    "sub_exam_assessments",
    "sub_exam_timetable",
    "sub_exam_marks",
    "sub_exam_grading",
    "mod_results",
    "sub_results_moderation",
    "sub_results_report_cards",
    "sub_results_broadsheet",
    "sub_results_subject_broadsheet",
    "mod_communication",
    "sub_comm_overview",
    "sub_comm_messages",
    "sub_comm_announcements",
    "sub_comm_settings",
    "mod_notifications",
    "sub_notifications_overview",
    "sub_notifications_inbox",
    "sub_notifications_templates",
    "sub_notifications_settings",
    "mod_calendar",
    "sub_calendar_overview",
    "sub_calendar_events",
    "mod_finance",
    "sub_finance_overview",
    "sub_finance_fees",
    "sub_finance_fee_categories",
    "sub_finance_invoices",
    "sub_finance_payments",
    "sub_finance_cashier_record",
    "sub_finance_receipts",
    "sub_finance_debtors",
    "mod_security_overview",
    "mod_security_visitors",
    "mod_security_gate_passes",
    "mod_documents_repository",
    "mod_documents_upload",
    "mod_settings",
  ];

  // Growth excludes enterprise governance/procurement/safeguarding/BI & advanced document retention/approvals/signatures
  const enterpriseOnlyTopModules = new Set([
    "mod_procurement",
    "mod_safeguarding",
    "mod_analytics",
    "mod_documents_approvals",
    "mod_documents_requests",
    "mod_documents_expiry",
    "mod_documents_signatures",
    "mod_documents_retention",
    "mod_documents_settings",
  ]);

  const growthSeedIds = activeModules
    .filter((m) => !enterpriseOnlyTopModules.has(m.id) && (!m.parentId || !enterpriseOnlyTopModules.has(m.parentId)))
    .map((m) => m.id);

  // UK Growth emphasizes British Curriculum DSL Safeguarding & Assessment Governance + LMS + Multi-Campus + Engagement
  const ukGrowthExcluded = new Set(["mod_procurement", "mod_analytics", "mod_documents_retention"]);
  const ukGrowthSeedIds = activeModules
    .filter((m) => !ukGrowthExcluded.has(m.id) && (!m.parentId || !ukGrowthExcluded.has(m.parentId)))
    .map((m) => m.id);

  // STEM Sandbox Pilot targets secondary/college STEM + CBT + LMS + BI
  const customPilotSeedIds = [
    ...starterSeedIds,
    "mod_learning_hub",
    "mod_classroom",
    "sub_classroom_hub",
    "sub_classroom_schedule",
    "mod_materials",
    "mod_lessons",
    "mod_assignments",
    "mod_teacher_workspace",
    "mod_student_portal",
    "sub_exam_cbt",
    "sub_exam_question_bank",
    "sub_exam_cbt_student",
    "sub_exam_cbt_marking",
    "mod_analytics",
    "sub_analytics_hub",
    "sub_analytics_academics",
    "mod_reports",
    "sub_reports_library",
    "sub_reports_builder",
  ];

  const starterModules = expandWithDependencies(starterSeedIds, modulesById);
  const growthModules = expandWithDependencies(growthSeedIds, modulesById);
  const ukGrowthModules = expandWithDependencies(ukGrowthSeedIds, modulesById);
  const enterpriseModules = expandWithDependencies(activeModules.map((m) => m.id), modulesById);
  const customPilotModules = expandWithDependencies(customPilotSeedIds, modulesById);

  const starterAddOns = expandWithDependencies(["mod_transport", "mod_library", "mod_cafeteria", "sub_exam_cbt"], modulesById)
    .filter((id) => !starterModules.includes(id));

  const growthAddOns = ["mod_analytics", "mod_safeguarding", "mod_procurement"];

  const plans: CanonicalPlanDefinition[] = [
    {
      id: "plan_starter",
      name: "Starter Academy",
      tier: "starter",
      normalizedTier: "starter",
      status: "published",
      visibility: "public",
      description: "Essential platform management for single-campus schools and academies.",
      billingIntervals: ["monthly", "quarterly", "annual"],
      currency: "USD",
      priceMonthly: 199,
      priceAnnual: 1990,
      priceQuarterly: 550,
      trialDays: 14,
      targetSchoolTypes: ["nursery", "primary", "secondary", "combined"],
      maxStudents: 350,
      maxStaff: 35,
      maxCampuses: 1,
      storageGb: 50,
      features: [
        "Student Information System (SIS)",
        "Basic Attendance & Daily Rolls",
        "Standard Gradebook & Report Cards",
        "Tuition Fee Invoicing",
        "Single Campus Configuration",
        "Email Notification Gateway",
        "Community Support",
      ],
      includedModuleIds: starterModules,
      includedFeatureIds: ["feat_sis", "feat_attendance", "feat_gradebook", "feat_fees"],
      optionalAddOnModuleIds: starterAddOns,
      optionalAddOnFeatureIds: ["feat_transport", "feat_library", "feat_cafeteria", "feat_cbt_engine"],
      upgradeToPlanIds: ["plan_growth", "plan_enterprise"],
      downgradeToPlanIds: [],
      version: 2,
      commercialPricingNote: "Optional add-on unit SKUs require Product Owner pricing configuration.",
      isPopular: false,
      isActive: true,
    },
    {
      id: "plan_growth",
      name: "Growth Campus",
      tier: "growth",
      normalizedTier: "growth",
      status: "published",
      visibility: "public",
      description: "Advanced operations, multi-branch support, and integrated academic workflows.",
      billingIntervals: ["monthly", "quarterly", "annual"],
      currency: "USD",
      priceMonthly: 499,
      priceAnnual: 4990,
      priceQuarterly: 1390,
      trialDays: 30,
      targetSchoolTypes: ["nursery", "primary", "secondary", "combined", "vocational", "international"],
      maxStudents: 1500,
      maxStaff: 120,
      maxCampuses: 3,
      storageGb: 250,
      features: [
        "Everything in Starter Academy",
        "Multi-Branch & Campus Support (up to 3)",
        "Digital Library & Barcode Automation",
        "Cafeteria & POS Meal Operations",
        "Transport & Route Management",
        "Parent & Student Mobile Portals",
        "Custom Fee Schedules & Discounts",
        "Automated SMS & WhatsApp Alerts",
        "Standard Priority Support",
      ],
      includedModuleIds: growthModules,
      includedFeatureIds: [
        "feat_sis",
        "feat_attendance",
        "feat_gradebook",
        "feat_library",
        "feat_cafeteria",
        "feat_transport",
        "feat_multicampus",
        "feat_fees",
        "feat_portals",
        "feat_cbt_engine",
        "feat_online_classes",
        "feat_hostel",
        "feat_payroll",
      ],
      optionalAddOnModuleIds: growthAddOns,
      optionalAddOnFeatureIds: ["feat_bi_analytics", "feat_safeguarding", "feat_procurement", "feat_whatsapp_alerts"],
      upgradeToPlanIds: ["plan_enterprise"],
      downgradeToPlanIds: ["plan_starter"],
      version: 2,
      commercialPricingNote: "Enterprise add-on module pricing requires Product Owner configuration.",
      isPopular: true,
      isActive: true,
    },
    {
      id: "plan_enterprise",
      name: "Enterprise Network",
      tier: "enterprise",
      normalizedTier: "enterprise",
      status: "published",
      visibility: "public",
      description: "Full-spectrum power for large educational trusts, districts, and university networks.",
      billingIntervals: ["monthly", "quarterly", "annual"],
      currency: "USD",
      priceMonthly: 1199,
      priceAnnual: 11990,
      priceQuarterly: 3350,
      trialDays: 30,
      targetSchoolTypes: ALL_SCHOOL_TYPES,
      maxStudents: 999999,
      maxStaff: 999999,
      maxCampuses: 999999,
      storageGb: 1000,
      features: [
        "Everything in Growth Campus",
        "Unlimited Campuses & Multi-Entity Consolidation",
        "Custom Role-Based Access Control (RBAC)",
        "Advanced BI & Academic Performance Analytics",
        "Custom Domain White-Labeling",
        "API Access & Webhooks Gateway",
        "Dedicated Customer Success Manager",
        "24/7 SLA & Priority Incident Escalation",
        "Custom Data Retention & Compliance Archiving",
      ],
      includedModuleIds: enterpriseModules,
      includedFeatureIds: [
        "feat_sis",
        "feat_attendance",
        "feat_gradebook",
        "feat_library",
        "feat_cafeteria",
        "feat_transport",
        "feat_multicampus",
        "feat_fees",
        "feat_portals",
        "feat_bi_analytics",
        "feat_cbt_engine",
        "feat_online_classes",
        "feat_hostel",
        "feat_payroll",
        "feat_safeguarding",
        "feat_procurement",
      ],
      optionalAddOnModuleIds: [],
      optionalAddOnFeatureIds: ["feat_custom_domain", "feat_whatsapp_alerts", "feat_ai_grading_assistant"],
      upgradeToPlanIds: [],
      downgradeToPlanIds: ["plan_growth", "plan_starter"],
      version: 2,
      commercialPricingNote: "Custom multi-trust SLAs & white-label add-ons require Product Owner contract configuration.",
      isPopular: false,
      isActive: true,
    },
    {
      id: "plan_uk_growth",
      name: "UK British Curriculum Growth",
      tier: "growth",
      normalizedTier: "growth",
      status: "published",
      visibility: "public",
      description: "Designed specifically for UK independent grammar schools and trust academies paying in GBP.",
      billingIntervals: ["monthly", "quarterly", "annual"],
      currency: "GBP",
      priceMonthly: 399,
      priceAnnual: 3990,
      priceQuarterly: 1100,
      trialDays: 30,
      targetSchoolTypes: ["primary", "secondary", "combined", "international"],
      maxStudents: 1200,
      maxStaff: 100,
      maxCampuses: 2,
      storageGb: 200,
      features: [
        "Full DfE & OFSTED statutory attendance register",
        "UK Key Stage 1-5 grading and Progress 8 indicators",
        "SIMS and Arbor data migration pipeline",
        "Direct BACS and Direct Debit reconciliation",
      ],
      includedModuleIds: ukGrowthModules,
      includedFeatureIds: [
        "feat_sis",
        "feat_attendance",
        "feat_gradebook",
        "feat_library",
        "feat_cafeteria",
        "feat_transport",
        "feat_multicampus",
        "feat_fees",
        "feat_portals",
        "feat_cbt_engine",
        "feat_online_classes",
        "feat_hostel",
        "feat_payroll",
        "feat_safeguarding",
      ],
      optionalAddOnModuleIds: ["mod_procurement", "mod_analytics"],
      optionalAddOnFeatureIds: ["feat_bi_analytics", "feat_procurement", "feat_whatsapp_alerts"],
      upgradeToPlanIds: ["plan_enterprise"],
      downgradeToPlanIds: ["plan_starter"],
      version: 2,
      commercialPricingNote: "UK VAT handling & regional add-on SKUs require Product Owner configuration.",
      isPopular: false,
      isActive: true,
    },
    {
      id: "plan_custom_pilot",
      name: "STEM Innovation Sandbox (Draft)",
      tier: "custom",
      normalizedTier: "custom",
      status: "draft",
      visibility: "private",
      description: "Experimental testing tier for high-tech robotics and virtual laboratory pilots.",
      billingIntervals: ["monthly", "annual"],
      currency: "USD",
      priceMonthly: 0,
      priceAnnual: 0,
      trialDays: 60,
      targetSchoolTypes: ["secondary", "combined", "college", "vocational"],
      maxStudents: 100,
      maxStaff: 15,
      maxCampuses: 1,
      storageGb: 25,
      features: [
        "Experimental AI grading pipeline preview",
        "Full CBT platform access with raw telemetry export",
      ],
      includedModuleIds: customPilotModules,
      includedFeatureIds: [
        "feat_sis",
        "feat_attendance",
        "feat_gradebook",
        "feat_cbt_engine",
        "feat_online_classes",
        "feat_bi_analytics",
      ],
      optionalAddOnModuleIds: [],
      optionalAddOnFeatureIds: [],
      upgradeToPlanIds: ["plan_growth", "plan_enterprise"],
      downgradeToPlanIds: ["plan_starter"],
      version: 2,
      commercialPricingNote: "Pilot conversion pricing requires Product Owner approval prior to publishing.",
      isPopular: false,
      isActive: false,
    },
  ];

  const features: CanonicalFeatureDefinition[] = [
    {
      id: "feat_sis",
      key: "sisCore",
      name: "Student Information System (SIS)",
      description: "Core student directory, profile records, admissions lifecycle, family associations, and emergency contacts.",
      moduleId: "mod_students",
      category: "students_admissions",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["students.view"],
      dependencies: [],
      includedInPlanIds: ["plan_starter", "plan_growth", "plan_enterprise", "plan_uk_growth", "plan_custom_pilot"],
      optionalAddOnPlanIds: [],
      requiresAddonLicense: false,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_attendance",
      key: "attendanceTracking",
      name: "Attendance & Daily Roll Calls",
      description: "Period-by-period roll marking, late arrivals, early departures, and attendance compliance reporting.",
      moduleId: "mod_attendance",
      category: "attendance_operations",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["attendance.view"],
      dependencies: ["mod_students"],
      includedInPlanIds: ["plan_starter", "plan_growth", "plan_enterprise", "plan_uk_growth", "plan_custom_pilot"],
      optionalAddOnPlanIds: [],
      requiresAddonLicense: false,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_gradebook",
      key: "gradebookResults",
      name: "Gradebook & Assessment Schemes",
      description: "Continuous assessment score entry, moderation, broadsheet tabulation, transcripts, and PDF report cards.",
      moduleId: "mod_results",
      category: "results_grading",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["results.view"],
      dependencies: ["mod_examinations", "mod_students"],
      includedInPlanIds: ["plan_starter", "plan_growth", "plan_enterprise", "plan_uk_growth"],
      optionalAddOnPlanIds: [],
      requiresAddonLicense: false,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_fees",
      key: "feeManagement",
      name: "Fee Schedules & Bursary Management",
      description: "Structured term fee invoicing, adjustments, cashier payment recording, ledger, and receipt printing.",
      moduleId: "mod_finance",
      category: "finance_bursary",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["finance.view"],
      dependencies: ["mod_students"],
      includedInPlanIds: ["plan_starter", "plan_growth", "plan_enterprise", "plan_uk_growth"],
      optionalAddOnPlanIds: [],
      requiresAddonLicense: false,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_cbt_engine",
      key: "enableCbt",
      name: "Computer-Based Testing (CBT) & Question Bank",
      description: "Online candidate exam portal, invigilation command center, lab seat management, and instant auto-grading.",
      moduleId: "sub_exam_cbt",
      category: "examinations_cbt",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["examinations.view"],
      dependencies: ["mod_examinations", "mod_academics", "mod_students"],
      includedInPlanIds: ["plan_growth", "plan_enterprise", "plan_uk_growth", "plan_custom_pilot"],
      optionalAddOnPlanIds: ["plan_starter"],
      requiresAddonLicense: true,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_online_classes",
      key: "onlineClasses",
      name: "Virtual Classroom & Live Online Classes",
      description: "Interactive live class schedules, teacher virtual rooms, student classroom hub, and session history.",
      moduleId: "mod_classroom",
      category: "learning_lms",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["classroom.view"],
      dependencies: ["mod_learning_hub", "mod_academics"],
      includedInPlanIds: ["plan_growth", "plan_enterprise", "plan_uk_growth", "plan_custom_pilot"],
      optionalAddOnPlanIds: [],
      requiresAddonLicense: false,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_portals",
      key: "parentStudentPortals",
      name: "Dedicated Student & Learning Workspaces",
      description: "Self-service student and teacher workspaces for lesson delivery, assignments, materials, and rubrics.",
      moduleId: "mod_student_portal",
      category: "learning_lms",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["learning.view"],
      dependencies: ["mod_learning_hub", "mod_students"],
      includedInPlanIds: ["plan_growth", "plan_enterprise", "plan_uk_growth"],
      optionalAddOnPlanIds: [],
      requiresAddonLicense: false,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_payroll",
      key: "payrollManagement",
      name: "HR Payroll Runs & Staff Payslips",
      description: "Monthly payroll computation, salary structures, statutory deductions, and printable payslip issuance.",
      moduleId: "sub_hr_payroll",
      category: "hr_payroll",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["hr.payroll.view"],
      dependencies: ["mod_hr"],
      includedInPlanIds: ["plan_growth", "plan_enterprise", "plan_uk_growth"],
      optionalAddOnPlanIds: [],
      requiresAddonLicense: false,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_library",
      key: "libraryManagement",
      name: "Digital Library & Barcode Automation",
      description: "ISBN catalogue lookup, barcode issue/return scanning, overdue tracking, and digital holdings.",
      moduleId: "mod_library",
      category: "library_circulation",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["library.view"],
      dependencies: ["mod_students"],
      includedInPlanIds: ["plan_growth", "plan_enterprise", "plan_uk_growth"],
      optionalAddOnPlanIds: ["plan_starter"],
      requiresAddonLicense: false,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_transport",
      key: "transportManagement",
      name: "Transport & Fleet Operations",
      description: "Bus route optimization, vehicle maintenance logs, driver assignments, and boarding manifests.",
      moduleId: "mod_transport",
      category: "transport_fleet",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["transport.view"],
      dependencies: ["mod_students"],
      includedInPlanIds: ["plan_growth", "plan_enterprise", "plan_uk_growth"],
      optionalAddOnPlanIds: ["plan_starter"],
      requiresAddonLicense: false,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_hostel",
      key: "hostelManagement",
      name: "Hostel & Residential Boarding",
      description: "Dormitory buildings, bed allocation, residential attendance roll calls, and exeat leave passes.",
      moduleId: "mod_hostel",
      category: "hostel_residential",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["hostel.view"],
      dependencies: ["mod_students"],
      includedInPlanIds: ["plan_growth", "plan_enterprise", "plan_uk_growth"],
      optionalAddOnPlanIds: [],
      requiresAddonLicense: false,
      supportedSchoolTypes: POST_EARLY_YEARS_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_cafeteria",
      key: "cafeteriaOperations",
      name: "Cafeteria & Meal Operations",
      description: "Nutritional meal menus, allergen flags, student meal orders, and prepaid dining tracking.",
      moduleId: "mod_cafeteria",
      category: "cafeteria_dining",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["cafeteria.view"],
      dependencies: ["mod_students"],
      includedInPlanIds: ["plan_growth", "plan_enterprise", "plan_uk_growth"],
      optionalAddOnPlanIds: ["plan_starter"],
      requiresAddonLicense: false,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_multicampus",
      key: "multiCampusGovernance",
      name: "Multi-Campus & Branch Governance",
      description: "Cross-branch campus switcher, centralized fee/class governance, and branch comparison.",
      moduleId: "mod_campuses",
      category: "campuses_governance",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["campuses.view"],
      dependencies: [],
      includedInPlanIds: ["plan_growth", "plan_enterprise", "plan_uk_growth"],
      optionalAddOnPlanIds: [],
      requiresAddonLicense: false,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "configured",
    },
    {
      id: "feat_safeguarding",
      key: "safeguardingDsl",
      name: "Safeguarding & Child Protection (DSL)",
      description: "Statutory Designated Safeguarding Lead case files, body-map notes, and protected referrals.",
      moduleId: "mod_safeguarding",
      category: "safeguarding_dsl",
      availabilityStatus: "enabled",
      implementationMaturity: "implemented",
      isGloballyEnabled: true,
      requiredPermissions: ["safeguarding.view"],
      dependencies: ["mod_students"],
      includedInPlanIds: ["plan_enterprise", "plan_uk_growth"],
      optionalAddOnPlanIds: ["plan_growth"],
      requiresAddonLicense: true,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "requires_product_owner_configuration",
    },
    {
      id: "feat_procurement",
      key: "procurementOrders",
      name: "Procurement & Purchase Orders",
      description: "Multi-level purchase requisitions, supplier directories, and goods receipt reconciliations.",
      moduleId: "mod_procurement",
      category: "procurement_orders",
      availabilityStatus: "enabled",
      implementationMaturity: "partial",
      isGloballyEnabled: true,
      requiredPermissions: ["procurement.view"],
      dependencies: ["mod_inventory"],
      includedInPlanIds: ["plan_enterprise"],
      optionalAddOnPlanIds: ["plan_growth"],
      requiresAddonLicense: true,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "requires_product_owner_configuration",
    },
    {
      id: "feat_bi_analytics",
      key: "biAnalytics",
      name: "Executive BI & Cohort Analytics",
      description: "Executive intelligence dashboards across academic cohorts, attendance retention, and revenue realization.",
      moduleId: "mod_analytics",
      category: "analytics_intelligence",
      availabilityStatus: "enabled",
      implementationMaturity: "partial",
      isGloballyEnabled: true,
      requiredPermissions: ["analytics.view"],
      dependencies: [],
      includedInPlanIds: ["plan_enterprise", "plan_custom_pilot"],
      optionalAddOnPlanIds: ["plan_growth"],
      requiresAddonLicense: true,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "requires_product_owner_configuration",
    },
    {
      id: "feat_custom_domain",
      key: "customDomainSsl",
      name: "Custom Domain White-Labeling & SSL",
      description: "Tenant custom CNAME DNS mapping with automated TLS certificate provisioning (requires backend proxy).",
      moduleId: "mod_settings",
      category: "tenant_settings",
      availabilityStatus: "coming_soon",
      implementationMaturity: "planned",
      isGloballyEnabled: false,
      requiredPermissions: ["settings.manage"],
      dependencies: [],
      includedInPlanIds: [],
      optionalAddOnPlanIds: ["plan_enterprise"],
      requiresAddonLicense: true,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "requires_product_owner_configuration",
    },
    {
      id: "feat_whatsapp_alerts",
      key: "whatsappAlerts",
      name: "Automated WhatsApp Parent Notifications",
      description: "WhatsApp Business Cloud API parent alerts for fee reminders, attendance, and urgent broadcasts.",
      moduleId: "sub_notifications_integrations",
      category: "communication_messaging",
      availabilityStatus: "coming_soon",
      implementationMaturity: "planned",
      isGloballyEnabled: false,
      requiredPermissions: ["notifications.manage"],
      dependencies: ["mod_notifications"],
      includedInPlanIds: [],
      optionalAddOnPlanIds: ["plan_growth", "plan_enterprise"],
      requiresAddonLicense: true,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "requires_product_owner_configuration",
    },
    {
      id: "feat_ai_grading_assistant",
      key: "aiGradingAssistant",
      name: "GenAI Essay & Formative Feedback Assistant",
      description: "AI-assisted short-answer rubric suggestions and formative teacher review workflows.",
      moduleId: "mod_examinations",
      category: "examinations_cbt",
      availabilityStatus: "coming_soon",
      implementationMaturity: "planned",
      isGloballyEnabled: false,
      requiredPermissions: ["examinations.view"],
      dependencies: ["mod_examinations"],
      includedInPlanIds: [],
      optionalAddOnPlanIds: [],
      requiresAddonLicense: true,
      supportedSchoolTypes: ALL_SCHOOL_TYPES,
      commercialConfigStatus: "requires_product_owner_configuration",
    },
  ];

  // Synchronize public tier summary (`includedInPlans`: starter | growth | enterprise) + `featureIds`
  for (const mod of modules) {
    if (mod.availabilityStatus === "deprecated") {
      mod.includedInPlans = [];
      continue;
    }
    const tiers = new Set<"starter" | "growth" | "enterprise">();
    for (const plan of plans) {
      if (plan.tier === "custom" || plan.status === "draft") continue;
      if (plan.includedModuleIds.includes(mod.id)) {
        tiers.add(plan.tier);
      }
    }
    mod.includedInPlans = Array.from(tiers);
  }

  for (const feat of features) {
    const targetMod = modulesById.get(feat.moduleId);
    if (targetMod && !targetMod.featureIds.includes(feat.id)) {
      targetMod.featureIds.push(feat.id);
    }
  }

  return { plans, features };
}

function generateSnapshotContent(
  modules: CanonicalModuleDefinition[],
  features: CanonicalFeatureDefinition[],
  plans: CanonicalPlanDefinition[],
  navToModuleId: Record<string, string>,
  featureKeyToId: Record<string, string>,
  routeToModuleId: Record<string, string>
): string {
  return `/**
 * Canonical SaaS Module, Feature & Subscription Plan Registry Snapshot
 * AUTO-GENERATED BY dashboard/scripts/build-registry.ts — DO NOT EDIT MANUALLY
 * Version: ${CANONICAL_REGISTRY_VERSION}
 *
 * Strictly Frontend-Only: Defines canonical UI capabilities, statuses, plan allocations,
 * and route/navigation mappings synchronized identically across dashboard/ and frontend/.
 */

import type {
  CanonicalFeatureDefinition,
  CanonicalModuleDefinition,
  CanonicalPlanDefinition,
} from "./canonical-contract";

export const CANONICAL_REGISTRY_CATEGORY_METADATA = ${JSON.stringify(CATEGORY_METADATA, null, 2)} as const;

export const CANONICAL_MODULE_REGISTRY: CanonicalModuleDefinition[] = ${JSON.stringify(modules, null, 2)};

export const CANONICAL_FEATURE_REGISTRY: CanonicalFeatureDefinition[] = ${JSON.stringify(features, null, 2)};

export const CANONICAL_SUBSCRIPTION_PLANS: CanonicalPlanDefinition[] = ${JSON.stringify(plans, null, 2)};

export const CANONICAL_NAV_TO_MODULE_ID: Record<string, string> = ${JSON.stringify(navToModuleId, null, 2)};

export const CANONICAL_FEATURE_KEY_TO_ID: Record<string, string> = ${JSON.stringify(featureKeyToId, null, 2)};

export const CANONICAL_ROUTE_TO_MODULE_ID: Record<string, string> = ${JSON.stringify(routeToModuleId, null, 2)};
`;
}

function main() {
  const modules = buildModules();
  const { plans, features } = buildPlansAndFeatures(modules);

  const knownRoutes = new Set<string>([
    ...collectDiskPages(path.join(FRONTEND_ROOT, "app/(tenant)")),
    ...collectDiskPages(path.join(FRONTEND_ROOT, "app/(print)")),
    ...modules.flatMap((m) => m.routes),
  ]);

  const report = validateCanonicalRegistryGraph({
    modules,
    features,
    plans,
    knownRoutes,
  });

  if (!report.isValid) {
    console.error("CANONICAL REGISTRY VALIDATION FAILED:", JSON.stringify(report.errors, null, 2));
    process.exit(1);
  }

  const navToModuleId: Record<string, string> = {};
  for (const m of modules) navToModuleId[m.navId] = m.id;

  const featureKeyToId: Record<string, string> = {};
  for (const f of features) featureKeyToId[f.key] = f.id;

  const routeToModuleId: Record<string, string> = {};
  for (const p of TENANT_ROUTE_POLICIES) {
    if (p.moduleId && modules.some((m) => m.id === p.moduleId)) {
      routeToModuleId[p.pattern] = p.moduleId;
    }
  }
  for (const m of modules) {
    if (m.availabilityStatus === "deprecated") continue;
    for (const r of m.routes) {
      if (!routeToModuleId[r]) routeToModuleId[r] = m.id;
    }
  }

  const snapshotCode = generateSnapshotContent(
    modules,
    features,
    plans,
    navToModuleId,
    featureKeyToId,
    routeToModuleId
  );

  const dashOutDir = path.join(DASHBOARD_ROOT, "lib/modules");
  const frontOutDir = path.join(FRONTEND_ROOT, "lib/modules");
  fs.mkdirSync(dashOutDir, { recursive: true });
  fs.mkdirSync(frontOutDir, { recursive: true });

  fs.writeFileSync(path.join(dashOutDir, SNAPSHOT_FILENAME), snapshotCode, "utf-8");
  fs.writeFileSync(path.join(frontOutDir, SNAPSHOT_FILENAME), snapshotCode, "utf-8");

  // Sync canonical-contract.ts and canonical-entitlements.ts from dashboard -> frontend
  for (const sharedFile of ["canonical-contract.ts", "canonical-entitlements.ts"]) {
    const src = path.join(dashOutDir, sharedFile);
    const dest = path.join(frontOutDir, sharedFile);
    fs.copyFileSync(src, dest);
  }

  // Sync canonical P0-5 lifecycle & onboarding models from dashboard -> frontend
  const dashLifecycleDir = path.join(DASHBOARD_ROOT, "lib/lifecycle");
  const frontLifecycleDir = path.join(FRONTEND_ROOT, "lib/lifecycle");
  fs.mkdirSync(frontLifecycleDir, { recursive: true });
  for (const sharedFile of ["canonical-lifecycle.ts", "canonical-onboarding.ts"]) {
    const src = path.join(dashLifecycleDir, sharedFile);
    const dest = path.join(frontLifecycleDir, sharedFile);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }

  // Sync canonical P0-6 operations contracts from dashboard -> frontend
  const dashOpsDir = path.join(DASHBOARD_ROOT, "lib/operations");
  const frontOpsDir = path.join(FRONTEND_ROOT, "lib/operations");
  fs.mkdirSync(frontOpsDir, { recursive: true });
  const opsSrc = path.join(dashOpsDir, "canonical-operations.ts");
  const opsDest = path.join(frontOpsDir, "canonical-operations.ts");
  if (fs.existsSync(opsSrc)) {
    fs.copyFileSync(opsSrc, opsDest);
  }

  console.log(
    `Generated canonical registry: ${modules.length} modules (${modules.filter((m) => m.kind === "module").length} top-level, ${modules.filter((m) => m.kind === "submodule").length} submodules), ${features.length} features, ${plans.length} plans. Known routes verified: ${knownRoutes.size}. Validation errors: 0.`
  );
}

main();
