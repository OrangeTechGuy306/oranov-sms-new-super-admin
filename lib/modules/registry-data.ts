/**
 * Canonical Master Tenant Module Registry
 * Phase E-09.6: Authoritative inventory of discovered tenant modules, submodules,
 * mapped routes, permissions, dependencies, and plan entitlements.
 *
 * Generated deterministically from repository evidence in tenant-dashboard.
 */

import { TenantModuleDefinition, CategoryMeta } from './types';

export const CATEGORY_METADATA: Record<string, CategoryMeta> = {
  core_dashboard: {
    key: 'core_dashboard',
    label: 'Core Dashboard & Workspaces',
    macroCategory: 'communications',
    iconName: 'LayoutDashboard',
    description: 'Central overview, role-personalized workspaces, quick actions, and task queues.',
  },
  students_admissions: {
    key: 'students_admissions',
    label: 'Student Information & Admissions',
    macroCategory: 'administration',
    iconName: 'GraduationCap',
    description: 'Student lifecycle directory, application inquiries, enrollments, and transfer tracking.',
  },
  parents_guardians: {
    key: 'parents_guardians',
    label: 'Parents & Guardians',
    macroCategory: 'administration',
    iconName: 'UserCheck',
    description: 'Family units, guardian contact registers, relationship linkages, and communications.',
  },
  faculty_staff: {
    key: 'faculty_staff',
    label: 'Faculty & Staff Directory',
    macroCategory: 'administration',
    iconName: 'Users',
    description: 'Teaching faculty profiles, department assignments, and administrative staff rosters.',
  },
  academics_curriculum: {
    key: 'academics_curriculum',
    label: 'Academics & Curriculum',
    macroCategory: 'academics',
    iconName: 'BookOpen',
    description: 'Academic sessions, terms, classes, departments, subjects, syllabi, and schemes of work.',
  },
  attendance_operations: {
    key: 'attendance_operations',
    label: 'Attendance & Daily Roll Calls',
    macroCategory: 'academics',
    iconName: 'CalendarCheck',
    description: 'Period-by-period class attendance, biometric check-in integration, and absence tracking.',
  },
  timetables_scheduling: {
    key: 'timetables_scheduling',
    label: 'Timetables & Scheduling',
    macroCategory: 'academics',
    iconName: 'Clock',
    description: 'Class schedule builder, room allocation, teacher workload conflict detection, and publishing.',
  },
  examinations_cbt: {
    key: 'examinations_cbt',
    label: 'Examinations & CBT Engine',
    macroCategory: 'academics',
    iconName: 'FileCheck',
    description: 'Term exam timetabling, online CBT question bank, candidate test delivery, and auto-grading.',
  },
  results_grading: {
    key: 'results_grading',
    label: 'Results, Grading & Broadsheet',
    macroCategory: 'academics',
    iconName: 'Award',
    description: 'Continuous assessment score entry, broadsheet tabulation, report cards, and cumulative transcripts.',
  },
  learning_lms: {
    key: 'learning_lms',
    label: 'Learning Management System (LMS)',
    macroCategory: 'academics',
    iconName: 'Layers',
    description: 'Digital course units, learning materials, coursework assignments, rubrics, and virtual classrooms.',
  },
  communication_messaging: {
    key: 'communication_messaging',
    label: 'Communication & Messaging',
    macroCategory: 'communications',
    iconName: 'Mail',
    description: 'Multi-channel SMS/WhatsApp alerts, email broadcasts, targeted group messaging, and logs.',
  },
  calendar_events: {
    key: 'calendar_events',
    label: 'School Calendar & Events',
    macroCategory: 'communications',
    iconName: 'Calendar',
    description: 'Master institutional calendar, term dates, statutory holidays, and school community events.',
  },
  finance_bursary: {
    key: 'finance_bursary',
    label: 'Finance, Billing & Bursary',
    macroCategory: 'finance',
    iconName: 'CreditCard',
    description: 'Tuition fee structures, student invoice generation, fee collections, receipts, and payment ledger.',
  },
  hr_payroll: {
    key: 'hr_payroll',
    label: 'Human Resources & Payroll',
    macroCategory: 'administration',
    iconName: 'Briefcase',
    description: 'Employee contracts, leave requests and policies, monthly payroll runs, payslips, and staff onboarding.',
  },
  library_circulation: {
    key: 'library_circulation',
    label: 'Digital Library & Barcodes',
    macroCategory: 'administration',
    iconName: 'Library',
    description: 'Book cataloguing, barcode issue/return scanning, digital resources, overdue fines, and patron accounts.',
  },
  inventory_assets: {
    key: 'inventory_assets',
    label: 'Inventory & Asset Management',
    macroCategory: 'administration',
    iconName: 'Package',
    description: 'Central store inventory, stock movements, reconciliation counts, asset registers, and maintenance.',
  },
  procurement_orders: {
    key: 'procurement_orders',
    label: 'Procurement & Purchase Orders',
    macroCategory: 'administration',
    iconName: 'ShoppingCart',
    description: 'Purchase requisitions, multi-level approvals, supplier management, purchase orders, and goods receipts.',
  },
  transport_fleet: {
    key: 'transport_fleet',
    label: 'Transport & Fleet Operations',
    macroCategory: 'administration',
    iconName: 'Bus',
    description: 'Bus route optimization, vehicle maintenance logs, driver scheduling, and student route enrollments.',
  },
  hostel_residential: {
    key: 'hostel_residential',
    label: 'Hostel & Residential Boarding',
    macroCategory: 'administration',
    iconName: 'Home',
    description: 'Dormitory buildings, room/bed allocation, residential roll call, leave exeat passes, and room inspections.',
  },
  cafeteria_dining: {
    key: 'cafeteria_dining',
    label: 'Cafeteria & Dining Operations',
    macroCategory: 'administration',
    iconName: 'Utensils',
    description: 'Nutritional meal planning, weekly menus, meal schedules, student prepaid wallet debits, and allergens.',
  },
  health_infirmary: {
    key: 'health_infirmary',
    label: 'Health & Infirmary Services',
    macroCategory: 'administration',
    iconName: 'HeartPulse',
    description: 'Student medical profiles, clinic visit logs, MAR medication tracking, critical alerts, and audits.',
  },
  behaviour_discipline: {
    key: 'behaviour_discipline',
    label: 'Behaviour, Discipline & Rewards',
    macroCategory: 'administration',
    iconName: 'ShieldAlert',
    description: 'Incident logs, formal disciplinary cases, positive recognition, reward points, and counselling referrals.',
  },
  activities_clubs: {
    key: 'activities_clubs',
    label: 'Clubs, Sports & Extracurricular',
    macroCategory: 'administration',
    iconName: 'Trophy',
    description: 'Clubs, sports teams, fixtures, competition schedules, activity sessions, and guardian consents.',
  },
  safeguarding_dsl: {
    key: 'safeguarding_dsl',
    label: 'Safeguarding & Child Protection (DSL)',
    macroCategory: 'administration',
    iconName: 'Lock',
    description: 'Designated Safeguarding Lead (DSL) protective concerns, confidential case notes, and action tracking.',
  },
  engagement_community: {
    key: 'engagement_community',
    label: 'Parent & Community Engagement',
    macroCategory: 'communications',
    iconName: 'Users2',
    description: 'Parent-teacher conferences, appointment bookings, parent enquiries, PTA dues, surveys, and polls.',
  },
  security_gate: {
    key: 'security_gate',
    label: 'Security, Gate Operations & Visitors',
    macroCategory: 'platform_security',
    iconName: 'Shield',
    description: 'Campus visitor check-in, digital gate passes, authorized student pickup queues, and early departures.',
  },
  documents_records: {
    key: 'documents_records',
    label: 'Documents, Forms & Certificates',
    macroCategory: 'communications',
    iconName: 'FileText',
    description: 'Institutional document repository, e-signatures, certificate generation studio, and custom forms.',
  },
  analytics_intelligence: {
    key: 'analytics_intelligence',
    label: 'Analytics, BI & Intelligence',
    macroCategory: 'analytics',
    iconName: 'LineChart',
    description: 'Executive dashboards, cohort analytics, attendance retention metrics, and financial intelligence.',
  },
  reports_data_quality: {
    key: 'reports_data_quality',
    label: 'Custom Reports & Data Quality',
    macroCategory: 'analytics',
    iconName: 'FileSpreadsheet',
    description: 'Custom report builder, automated schedules, export center, and data quality reconciliation checks.',
  },
  campuses_governance: {
    key: 'campuses_governance',
    label: 'Campuses & Multi-Branch Governance',
    macroCategory: 'administration',
    iconName: 'Building2',
    description: 'Branch management, campus resource allocation, multi-branch switching, and institutional isolation.',
  },
  tenant_settings: {
    key: 'tenant_settings',
    label: 'School Settings & Configuration',
    macroCategory: 'administration',
    iconName: 'Settings',
    description: 'School branding, academic year parameters, localization, user permissions, and security controls.',
  },
  system_platform: {
    key: 'system_platform',
    label: 'Platform Core & Infrastructure',
    macroCategory: 'platform_security',
    iconName: 'Server',
    description: 'Core platform authentication, HTTP error boundaries, user session management, and routing.',
  },
};

export const MASTER_MODULE_REGISTRY: TenantModuleDefinition[] = [
  {
    "id": "mod_dashboard",
    "navId": "nav-dashboard",
    "name": "Dashboard",
    "code": "DASHBOARD",
    "description": "Full-spectrum tenant module for dashboard operations, data management, and user workflows.",
    "category": "core_dashboard",
    "macroCategory": "communications",
    "href": "/dashboard",
    "routes": [
      "/dashboard",
      "/profile"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "dashboard.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/dashboard/page.tsx",
      "componentEntry": "components/dashboard",
      "typeDefinition": "types/dashboard.ts",
      "mockStore": "lib/mock/dashboardData.ts",
      "testSuite": "tests/roleSpecificDashboards.test.ts",
      "navGroupId": "main"
    },
    "supportedWorkflows": [
      "Browse and filter dashboard entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 1
  },
  {
    "id": "mod_students",
    "navId": "nav-students",
    "name": "Students",
    "code": "STUDENTS",
    "description": "Full-spectrum tenant module for students operations, data management, and user workflows.",
    "category": "students_admissions",
    "macroCategory": "administration",
    "href": "/students",
    "routes": [
      "/students"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "students.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/students/page.tsx",
      "componentEntry": "components/students",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/studentsApi.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Browse and filter students entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 2
  },
  {
    "id": "sub_students_directory",
    "navId": "nav-students-directory",
    "name": "Student Directory",
    "code": "STUDENTS_DIRECTORY",
    "description": "Dedicated submodule supporting specialized workflows for student directory under Students.",
    "category": "students_admissions",
    "macroCategory": "administration",
    "parentId": "mod_students",
    "href": "/students",
    "routes": [
      "/students",
      "/students/[studentId]",
      "/students/[studentId]/edit",
      "/students/[studentId]/transfer"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/students/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Submodule requires parent module Students to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "students.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/students/page.tsx",
      "componentEntry": "components/students",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/studentsApi.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Execute student directory operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: students.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 3
  },
  {
    "id": "sub_students_admissions",
    "navId": "nav-students-admissions",
    "name": "Admissions & Inquiries",
    "code": "STUDENTS_ADMISSIONS",
    "description": "Dedicated submodule supporting specialized workflows for admissions & inquiries under Students.",
    "category": "students_admissions",
    "macroCategory": "administration",
    "parentId": "mod_students",
    "href": "/students/admissions",
    "routes": [
      "/admissions",
      "/students/admissions",
      "/students/admissions/[applicantId]",
      "/students/admissions/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/students/admissions/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Submodule requires parent module Students to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "students.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/students/admissions/page.tsx",
      "componentEntry": "components/students",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/studentsApi.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Execute admissions & inquiries operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: students.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 4
  },
  {
    "id": "sub_students_new",
    "navId": "nav-students-new",
    "name": "Enroll Student",
    "code": "STUDENTS_NEW",
    "description": "Dedicated submodule supporting specialized workflows for enroll student under Students.",
    "category": "students_admissions",
    "macroCategory": "administration",
    "parentId": "mod_students",
    "href": "/students/new",
    "routes": [
      "/students/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/students/new/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Submodule requires parent module Students to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "students.create"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/students/new/page.tsx",
      "componentEntry": "components/students",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/studentsApi.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Execute enroll student operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: students.create"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 5
  },
  {
    "id": "sub_students_transfer_in",
    "navId": "nav-students-transfer-in",
    "name": "Incoming Transfers",
    "code": "STUDENTS_TRANSFER_IN",
    "description": "Dedicated submodule supporting specialized workflows for incoming transfers under Students.",
    "category": "students_admissions",
    "macroCategory": "administration",
    "parentId": "mod_students",
    "href": "/students/transfer-in",
    "routes": [
      "/students/transfer-in"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/students/transfer-in/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Submodule requires parent module Students to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "students.create"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/students/transfer-in/page.tsx",
      "componentEntry": "components/students",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/studentsApi.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Execute incoming transfers operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: students.create"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 6
  },
  {
    "id": "mod_parents",
    "navId": "nav-parents",
    "name": "Parents & Guardians",
    "code": "PARENTS",
    "description": "Full-spectrum tenant module for parents & guardians operations, data management, and user workflows.",
    "category": "parents_guardians",
    "macroCategory": "administration",
    "href": "/parents",
    "routes": [
      "/parents"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "parents.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/parents/page.tsx",
      "componentEntry": "components/parents",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Browse and filter parents & guardians entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 7
  },
  {
    "id": "sub_parents_directory",
    "navId": "nav-parents-directory",
    "name": "Guardian Directory",
    "code": "PARENTS_DIRECTORY",
    "description": "Dedicated submodule supporting specialized workflows for guardian directory under Parents & Guardians.",
    "category": "parents_guardians",
    "macroCategory": "administration",
    "parentId": "mod_parents",
    "href": "/parents",
    "routes": [
      "/parents",
      "/parents/[parentId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/parents/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_parents",
        "type": "required",
        "description": "Submodule requires parent module Parents & Guardians to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "parents.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/parents/page.tsx",
      "componentEntry": "components/parents",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Execute guardian directory operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: parents.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 8
  },
  {
    "id": "sub_parents_new",
    "navId": "nav-parents-new",
    "name": "Register Guardian",
    "code": "PARENTS_NEW",
    "description": "Dedicated submodule supporting specialized workflows for register guardian under Parents & Guardians.",
    "category": "parents_guardians",
    "macroCategory": "administration",
    "parentId": "mod_parents",
    "href": "/parents/new",
    "routes": [
      "/parents/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/parents/new/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_parents",
        "type": "required",
        "description": "Submodule requires parent module Parents & Guardians to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "parents.create"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/parents/new/page.tsx",
      "componentEntry": "components/parents",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Execute register guardian operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: parents.create"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 9
  },
  {
    "id": "mod_teachers",
    "navId": "nav-teachers",
    "name": "Faculty & Teachers",
    "code": "TEACHERS",
    "description": "Full-spectrum tenant module for faculty & teachers operations, data management, and user workflows.",
    "category": "faculty_staff",
    "macroCategory": "administration",
    "href": "/teachers",
    "routes": [
      "/teachers"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "teachers.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/teachers/page.tsx",
      "componentEntry": "components/teachers",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/teachersAndStaffApi.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Browse and filter faculty & teachers entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 10
  },
  {
    "id": "sub_teachers_directory",
    "navId": "nav-teachers-directory",
    "name": "Faculty Directory",
    "code": "TEACHERS_DIRECTORY",
    "description": "Dedicated submodule supporting specialized workflows for faculty directory under Faculty & Teachers.",
    "category": "faculty_staff",
    "macroCategory": "administration",
    "parentId": "mod_teachers",
    "href": "/teachers",
    "routes": [
      "/teachers",
      "/teachers/[teacherId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/teachers/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_teachers",
        "type": "required",
        "description": "Submodule requires parent module Faculty & Teachers to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "teachers.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/teachers/page.tsx",
      "componentEntry": "components/teachers",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/teachersAndStaffApi.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Execute faculty directory operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: teachers.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 11
  },
  {
    "id": "sub_teachers_new",
    "navId": "nav-teachers-new",
    "name": "Onboard Faculty",
    "code": "TEACHERS_NEW",
    "description": "Dedicated submodule supporting specialized workflows for onboard faculty under Faculty & Teachers.",
    "category": "faculty_staff",
    "macroCategory": "administration",
    "parentId": "mod_teachers",
    "href": "/teachers/new",
    "routes": [
      "/teachers/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/teachers/new/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_teachers",
        "type": "required",
        "description": "Submodule requires parent module Faculty & Teachers to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "teachers.create"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/teachers/new/page.tsx",
      "componentEntry": "components/teachers",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/teachersAndStaffApi.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Execute onboard faculty operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: teachers.create"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 12
  },
  {
    "id": "mod_staff",
    "navId": "nav-staff",
    "name": "Administrative Staff",
    "code": "STAFF",
    "description": "Full-spectrum tenant module for administrative staff operations, data management, and user workflows.",
    "category": "faculty_staff",
    "macroCategory": "administration",
    "href": "/staff",
    "routes": [
      "/staff"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "staff.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/staff/page.tsx",
      "componentEntry": "components/staff",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/teachersAndStaffApi.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Browse and filter administrative staff entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 13
  },
  {
    "id": "sub_staff_directory",
    "navId": "nav-staff-directory",
    "name": "Staff Directory",
    "code": "STAFF_DIRECTORY",
    "description": "Dedicated submodule supporting specialized workflows for staff directory under Administrative Staff.",
    "category": "faculty_staff",
    "macroCategory": "administration",
    "parentId": "mod_staff",
    "href": "/staff",
    "routes": [
      "/staff",
      "/staff/[staffId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/staff/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_staff",
        "type": "required",
        "description": "Submodule requires parent module Administrative Staff to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "staff.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/staff/page.tsx",
      "componentEntry": "components/staff",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/teachersAndStaffApi.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Execute staff directory operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: staff.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 14
  },
  {
    "id": "sub_staff_new",
    "navId": "nav-staff-new",
    "name": "Add Staff Member",
    "code": "STAFF_NEW",
    "description": "Dedicated submodule supporting specialized workflows for add staff member under Administrative Staff.",
    "category": "faculty_staff",
    "macroCategory": "administration",
    "parentId": "mod_staff",
    "href": "/staff/new",
    "routes": [
      "/staff/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/staff/new/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_staff",
        "type": "required",
        "description": "Submodule requires parent module Administrative Staff to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "staff.create"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/staff/new/page.tsx",
      "componentEntry": "components/staff",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/teachersAndStaffApi.test.ts",
      "navGroupId": "people"
    },
    "supportedWorkflows": [
      "Execute add staff member operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: staff.create"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 15
  },
  {
    "id": "mod_academics",
    "navId": "nav-academics",
    "name": "Academics",
    "code": "ACADEMICS",
    "description": "Full-spectrum tenant module for academics operations, data management, and user workflows.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "href": "/academics",
    "routes": [
      "/academics"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "academics.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Browse and filter academics entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 16
  },
  {
    "id": "sub_academics_overview",
    "navId": "nav-academics-overview",
    "name": "Academic Overview",
    "code": "ACADEMICS_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for academic overview under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics",
    "routes": [
      "/academics"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "academics.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute academic overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: academics.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 17
  },
  {
    "id": "sub_academics_sessions",
    "navId": "nav-academics-sessions",
    "name": "Academic Sessions",
    "code": "ACADEMICS_SESSIONS",
    "description": "Dedicated submodule supporting specialized workflows for academic sessions under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/sessions",
    "routes": [
      "/academics/sessions",
      "/academics/sessions/[sessionId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/sessions/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "sessions.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/sessions/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute academic sessions operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: sessions.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 18
  },
  {
    "id": "sub_academics_terms",
    "navId": "nav-academics-terms",
    "name": "Terms & Periods",
    "code": "ACADEMICS_TERMS",
    "description": "Dedicated submodule supporting specialized workflows for terms & periods under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/terms",
    "routes": [
      "/academics/terms"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/terms/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "terms.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/terms/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute terms & periods operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: terms.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 19
  },
  {
    "id": "sub_academics_classes",
    "navId": "nav-academics-classes",
    "name": "Classes & Arms",
    "code": "ACADEMICS_CLASSES",
    "description": "Dedicated submodule supporting specialized workflows for classes & arms under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/classes",
    "routes": [
      "/academics/classes",
      "/academics/classes/[classId]",
      "/academics/classes/[classId]/arms/[armId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/classes/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "classes.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/classes/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute classes & arms operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: classes.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 20
  },
  {
    "id": "sub_academics_subjects",
    "navId": "nav-academics-subjects",
    "name": "Subject Catalog",
    "code": "ACADEMICS_SUBJECTS",
    "description": "Dedicated submodule supporting specialized workflows for subject catalog under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/subjects",
    "routes": [
      "/academics/subjects",
      "/academics/subjects/[subjectId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/subjects/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "subjects.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/subjects/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute subject catalog operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: subjects.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 21
  },
  {
    "id": "sub_academics_curriculum",
    "navId": "nav-academics-curriculum",
    "name": "Curriculum Blueprints",
    "code": "ACADEMICS_CURRICULUM",
    "description": "Dedicated submodule supporting specialized workflows for curriculum blueprints under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/curriculum",
    "routes": [
      "/academics/curriculum",
      "/academics/curriculum/blueprints",
      "/academics/curriculum/blueprints/[blueprintId]",
      "/academics/curriculum/subjects"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/curriculum/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "curriculum.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/curriculum/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute curriculum blueprints operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: curriculum.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 22
  },
  {
    "id": "sub_academics_schemes",
    "navId": "nav-academics-schemes",
    "name": "Schemes of Work",
    "code": "ACADEMICS_SCHEMES",
    "description": "Dedicated submodule supporting specialized workflows for schemes of work under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/schemes-of-work",
    "routes": [
      "/academics/schemes-of-work",
      "/academics/schemes-of-work/[schemeId]",
      "/academics/schemes-of-work/[schemeId]/edit",
      "/academics/schemes-of-work/[schemeId]/review",
      "/academics/schemes-of-work/new",
      "/academics/schemes-of-work/templates"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/schemes-of-work/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "schemes.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/schemes-of-work/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute schemes of work operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: schemes.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 23
  },
  {
    "id": "sub_academics_schemes_progress",
    "navId": "nav-academics-schemes-progress",
    "name": "Curriculum Coverage",
    "code": "ACADEMICS_SCHEMES_PROGRESS",
    "description": "Dedicated submodule supporting specialized workflows for curriculum coverage under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/schemes-of-work/progress",
    "routes": [
      "/academics/schemes-of-work/progress"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/schemes-of-work/progress/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "schemes.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/schemes-of-work/progress/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute curriculum coverage operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: schemes.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 24
  },
  {
    "id": "sub_academics_lesson_notes",
    "navId": "nav-academics-lesson-notes",
    "name": "Lesson Notes",
    "code": "ACADEMICS_LESSON_NOTES",
    "description": "Dedicated submodule supporting specialized workflows for lesson notes under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/lesson-notes",
    "routes": [
      "/academics/lesson-notes",
      "/academics/lesson-notes/[noteId]",
      "/academics/lesson-notes/[noteId]/edit",
      "/academics/lesson-notes/[noteId]/review",
      "/academics/lesson-notes/new",
      "/academics/lesson-notes/templates"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/lesson-notes/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "lesson_notes.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/lesson-notes/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute lesson notes operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: lesson_notes.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 25
  },
  {
    "id": "sub_academics_lesson_notes_compliance",
    "navId": "nav-academics-lesson-notes-compliance",
    "name": "Notes Compliance",
    "code": "ACADEMICS_LESSON_NOTES_COMPLIANCE",
    "description": "Dedicated submodule supporting specialized workflows for notes compliance under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/lesson-notes/compliance",
    "routes": [
      "/academics/lesson-notes/compliance"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/lesson-notes/compliance/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "lesson_notes.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/lesson-notes/compliance/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute notes compliance operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: lesson_notes.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 26
  },
  {
    "id": "sub_academics_daily_plans",
    "navId": "nav-academics-daily-plans",
    "name": "Daily Lesson Plans",
    "code": "ACADEMICS_DAILY_PLANS",
    "description": "Dedicated submodule supporting specialized workflows for daily lesson plans under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/daily-plans",
    "routes": [
      "/academics/daily-plans",
      "/academics/daily-plans/[planId]",
      "/academics/daily-plans/[planId]/delivery",
      "/academics/daily-plans/[planId]/edit",
      "/academics/daily-plans/calendar",
      "/academics/daily-plans/missed",
      "/academics/daily-plans/new",
      "/academics/daily-plans/review"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/daily-plans/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "daily_plans.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/daily-plans/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute daily lesson plans operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: daily_plans.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 27
  },
  {
    "id": "sub_academics_daily_plans_today",
    "navId": "nav-academics-daily-plans-today",
    "name": "Today's Teaching",
    "code": "ACADEMICS_DAILY_PLANS_TODAY",
    "description": "Dedicated submodule supporting specialized workflows for today's teaching under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/daily-plans/today",
    "routes": [
      "/academics/daily-plans/today"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/daily-plans/today/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "daily_plans.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/daily-plans/today/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute today's teaching operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: daily_plans.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 28
  },
  {
    "id": "sub_academics_daily_plans_coverage",
    "navId": "nav-academics-daily-plans-coverage",
    "name": "Delivery Coverage",
    "code": "ACADEMICS_DAILY_PLANS_COVERAGE",
    "description": "Dedicated submodule supporting specialized workflows for delivery coverage under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/daily-plans/coverage",
    "routes": [
      "/academics/daily-plans/coverage"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/daily-plans/coverage/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "daily_plans.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/daily-plans/coverage/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute delivery coverage operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: daily_plans.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 29
  },
  {
    "id": "sub_academics_departments",
    "navId": "nav-academics-departments",
    "name": "Departments",
    "code": "ACADEMICS_DEPARTMENTS",
    "description": "Dedicated submodule supporting specialized workflows for departments under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/departments",
    "routes": [
      "/academics/departments",
      "/academics/departments/[departmentId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/departments/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "departments.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/departments/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute departments operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: departments.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 30
  },
  {
    "id": "sub_academics_assignments",
    "navId": "nav-academics-assignments",
    "name": "Faculty Assignments",
    "code": "ACADEMICS_ASSIGNMENTS",
    "description": "Dedicated submodule supporting specialized workflows for faculty assignments under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/teacher-assignments",
    "routes": [
      "/academics/teacher-assignments"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/teacher-assignments/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "academic_assignments.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/teacher-assignments/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute faculty assignments operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: academic_assignments.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 31
  },
  {
    "id": "sub_academics_enrollments",
    "navId": "nav-academics-enrollments",
    "name": "Student Enrollments",
    "code": "ACADEMICS_ENROLLMENTS",
    "description": "Dedicated submodule supporting specialized workflows for student enrollments under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/enrollments",
    "routes": [
      "/academics/enrollments"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/enrollments/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "enrollments.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/enrollments/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute student enrollments operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: enrollments.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 32
  },
  {
    "id": "sub_academics_promotion",
    "navId": "nav-academics-promotion",
    "name": "Bulk Student Promotion",
    "code": "ACADEMICS_PROMOTION",
    "description": "Dedicated submodule supporting specialized workflows for bulk student promotion under Academics.",
    "category": "academics_curriculum",
    "macroCategory": "academics",
    "parentId": "mod_academics",
    "href": "/academics/promotion",
    "routes": [
      "/academics/promotion"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/academics/promotion/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Submodule requires parent module Academics to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "enrollments.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/academics/promotion/page.tsx",
      "componentEntry": "components/academics",
      "typeDefinition": "types/academics.ts",
      "mockStore": "lib/mock/academicsData.ts",
      "testSuite": "tests/academics.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute bulk student promotion operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: enrollments.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 33
  },
  {
    "id": "mod_attendance",
    "navId": "nav-attendance",
    "name": "Attendance & Operations",
    "code": "ATTENDANCE",
    "description": "Full-spectrum tenant module for attendance & operations operations, data management, and user workflows.",
    "category": "attendance_operations",
    "macroCategory": "academics",
    "href": "/attendance",
    "routes": [
      "/attendance"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Attendance roll calls record daily marks for enrolled students"
      },
      {
        "moduleId": "mod_academics",
        "type": "optional",
        "description": "Roll calls group students by academic class and term"
      }
    ],
    "requiredPermissions": [
      "attendance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/attendance/page.tsx",
      "componentEntry": "components/attendance",
      "typeDefinition": "types/attendance.ts",
      "mockStore": "lib/mock/attendanceData.ts",
      "testSuite": "tests/attendance.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Browse and filter attendance & operations entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 34
  },
  {
    "id": "sub_attendance_overview",
    "navId": "nav-attendance-overview",
    "name": "Dashboard Overview",
    "code": "ATTENDANCE_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for dashboard overview under Attendance & Operations.",
    "category": "attendance_operations",
    "macroCategory": "academics",
    "parentId": "mod_attendance",
    "href": "/attendance",
    "routes": [
      "/attendance",
      "/attendance/students",
      "/attendance/students/classes",
      "/attendance/students/classes/[classId]",
      "/attendance/students/classes/[classId]/arms/[armId]",
      "/attendance/students/reports",
      "/attendance/students/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/attendance/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_attendance",
        "type": "required",
        "description": "Submodule requires parent module Attendance & Operations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "attendance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/attendance/page.tsx",
      "componentEntry": "components/attendance",
      "typeDefinition": "types/attendance.ts",
      "mockStore": "lib/mock/attendanceData.ts",
      "testSuite": "tests/attendance.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute dashboard overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: attendance.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 35
  },
  {
    "id": "sub_attendance_daily",
    "navId": "nav-attendance-daily",
    "name": "Daily Roll Call",
    "code": "ATTENDANCE_DAILY",
    "description": "Dedicated submodule supporting specialized workflows for daily roll call under Attendance & Operations.",
    "category": "attendance_operations",
    "macroCategory": "academics",
    "parentId": "mod_attendance",
    "href": "/attendance/students/daily",
    "routes": [
      "/attendance/students/daily"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/attendance/students/daily/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_attendance",
        "type": "required",
        "description": "Submodule requires parent module Attendance & Operations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "attendance.students.record"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/attendance/students/daily/page.tsx",
      "componentEntry": "components/attendance",
      "typeDefinition": "types/attendance.ts",
      "mockStore": "lib/mock/attendanceData.ts",
      "testSuite": "tests/attendance.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute daily roll call operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: attendance.students.record"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 36
  },
  {
    "id": "sub_attendance_registers",
    "navId": "nav-attendance-registers",
    "name": "Registers Roster",
    "code": "ATTENDANCE_REGISTERS",
    "description": "Dedicated submodule supporting specialized workflows for registers roster under Attendance & Operations.",
    "category": "attendance_operations",
    "macroCategory": "academics",
    "parentId": "mod_attendance",
    "href": "/attendance/students/registers",
    "routes": [
      "/attendance/students/registers",
      "/attendance/students/registers/[registerId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/attendance/students/registers/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_attendance",
        "type": "required",
        "description": "Submodule requires parent module Attendance & Operations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "attendance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/attendance/students/registers/page.tsx",
      "componentEntry": "components/attendance",
      "typeDefinition": "types/attendance.ts",
      "mockStore": "lib/mock/attendanceData.ts",
      "testSuite": "tests/attendance.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute registers roster operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: attendance.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 37
  },
  {
    "id": "sub_attendance_history",
    "navId": "nav-attendance-history",
    "name": "Student History",
    "code": "ATTENDANCE_HISTORY",
    "description": "Dedicated submodule supporting specialized workflows for student history under Attendance & Operations.",
    "category": "attendance_operations",
    "macroCategory": "academics",
    "parentId": "mod_attendance",
    "href": "/attendance/students/history",
    "routes": [
      "/attendance/students/history"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/attendance/students/history/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_attendance",
        "type": "required",
        "description": "Submodule requires parent module Attendance & Operations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "attendance.students.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/attendance/students/history/page.tsx",
      "componentEntry": "components/attendance",
      "typeDefinition": "types/attendance.ts",
      "mockStore": "lib/mock/attendanceData.ts",
      "testSuite": "tests/attendance.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute student history operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: attendance.students.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 38
  },
  {
    "id": "sub_attendance_late",
    "navId": "nav-attendance-late",
    "name": "Late Arrivals",
    "code": "ATTENDANCE_LATE",
    "description": "Dedicated submodule supporting specialized workflows for late arrivals under Attendance & Operations.",
    "category": "attendance_operations",
    "macroCategory": "academics",
    "parentId": "mod_attendance",
    "href": "/attendance/late-arrivals",
    "routes": [
      "/attendance/late-arrivals"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/attendance/late-arrivals/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_attendance",
        "type": "required",
        "description": "Submodule requires parent module Attendance & Operations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "attendance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/attendance/late-arrivals/page.tsx",
      "componentEntry": "components/attendance",
      "typeDefinition": "types/attendance.ts",
      "mockStore": "lib/mock/attendanceData.ts",
      "testSuite": "tests/attendance.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute late arrivals operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: attendance.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 39
  },
  {
    "id": "sub_attendance_departures",
    "navId": "nav-attendance-departures",
    "name": "Early Pickups & Gates",
    "code": "ATTENDANCE_DEPARTURES",
    "description": "Dedicated submodule supporting specialized workflows for early pickups & gates under Attendance & Operations.",
    "category": "attendance_operations",
    "macroCategory": "academics",
    "parentId": "mod_attendance",
    "href": "/attendance/early-departures",
    "routes": [
      "/attendance/early-departures"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/attendance/early-departures/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_attendance",
        "type": "required",
        "description": "Submodule requires parent module Attendance & Operations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "attendance.pickups.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/attendance/early-departures/page.tsx",
      "componentEntry": "components/attendance",
      "typeDefinition": "types/attendance.ts",
      "mockStore": "lib/mock/attendanceData.ts",
      "testSuite": "tests/attendance.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute early pickups & gates operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: attendance.pickups.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 40
  },
  {
    "id": "sub_attendance_staff",
    "navId": "nav-attendance-staff",
    "name": "Staff Attendance",
    "code": "ATTENDANCE_STAFF",
    "description": "Dedicated submodule supporting specialized workflows for staff attendance under Attendance & Operations.",
    "category": "attendance_operations",
    "macroCategory": "academics",
    "parentId": "mod_attendance",
    "href": "/attendance/staff",
    "routes": [
      "/attendance/staff",
      "/attendance/staff/daily",
      "/attendance/staff/history",
      "/attendance/staff/reports",
      "/attendance/staff/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/attendance/staff/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_attendance",
        "type": "required",
        "description": "Submodule requires parent module Attendance & Operations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "attendance.staff.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/attendance/staff/page.tsx",
      "componentEntry": "components/attendance",
      "typeDefinition": "types/attendance.ts",
      "mockStore": "lib/mock/attendanceData.ts",
      "testSuite": "tests/attendance.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute staff attendance operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: attendance.staff.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 41
  },
  {
    "id": "sub_attendance_corrections",
    "navId": "nav-attendance-corrections",
    "name": "Corrections & Approvals",
    "code": "ATTENDANCE_CORRECTIONS",
    "description": "Dedicated submodule supporting specialized workflows for corrections & approvals under Attendance & Operations.",
    "category": "attendance_operations",
    "macroCategory": "academics",
    "parentId": "mod_attendance",
    "href": "/attendance/corrections",
    "routes": [
      "/attendance/corrections"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/attendance/corrections/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_attendance",
        "type": "required",
        "description": "Submodule requires parent module Attendance & Operations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "attendance.corrections.request"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/attendance/corrections/page.tsx",
      "componentEntry": "components/attendance",
      "typeDefinition": "types/attendance.ts",
      "mockStore": "lib/mock/attendanceData.ts",
      "testSuite": "tests/attendance.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute corrections & approvals operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: attendance.corrections.request"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 42
  },
  {
    "id": "sub_attendance_reports",
    "navId": "nav-attendance-reports",
    "name": "Reports & Analytics",
    "code": "ATTENDANCE_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for reports & analytics under Attendance & Operations.",
    "category": "attendance_operations",
    "macroCategory": "academics",
    "parentId": "mod_attendance",
    "href": "/attendance/reports",
    "routes": [
      "/attendance/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/attendance/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_attendance",
        "type": "required",
        "description": "Submodule requires parent module Attendance & Operations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "attendance.reports.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/attendance/reports/page.tsx",
      "componentEntry": "components/attendance",
      "typeDefinition": "types/attendance.ts",
      "mockStore": "lib/mock/attendanceData.ts",
      "testSuite": "tests/attendance.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute reports & analytics operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: attendance.reports.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 43
  },
  {
    "id": "sub_attendance_settings",
    "navId": "nav-attendance-settings",
    "name": "Attendance Settings",
    "code": "ATTENDANCE_SETTINGS",
    "description": "Dedicated submodule supporting specialized workflows for attendance settings under Attendance & Operations.",
    "category": "attendance_operations",
    "macroCategory": "academics",
    "parentId": "mod_attendance",
    "href": "/attendance/settings",
    "routes": [
      "/attendance/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/attendance/settings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_attendance",
        "type": "required",
        "description": "Submodule requires parent module Attendance & Operations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "attendance.policies.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/attendance/settings/page.tsx",
      "componentEntry": "components/attendance",
      "typeDefinition": "types/attendance.ts",
      "mockStore": "lib/mock/attendanceData.ts",
      "testSuite": "tests/attendance.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute attendance settings operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: attendance.policies.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 44
  },
  {
    "id": "mod_timetables",
    "navId": "nav-timetables",
    "name": "Timetables",
    "code": "TIMETABLES",
    "description": "Full-spectrum tenant module for timetables operations, data management, and user workflows.",
    "category": "timetables_scheduling",
    "macroCategory": "academics",
    "href": "/timetables",
    "routes": [
      "/timetables"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Timetables schedule classes, arms, and curriculum subjects"
      },
      {
        "moduleId": "mod_teachers",
        "type": "optional",
        "description": "Faculty assignment maps teachers to scheduled periods"
      }
    ],
    "requiredPermissions": [
      "timetables.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/timetables/page.tsx",
      "componentEntry": "components/timetables",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/timetables.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Browse and filter timetables entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 45
  },
  {
    "id": "sub_timetables_overview",
    "navId": "nav-timetables-overview",
    "name": "Timetable Master",
    "code": "TIMETABLES_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for timetable master under Timetables.",
    "category": "timetables_scheduling",
    "macroCategory": "academics",
    "parentId": "mod_timetables",
    "href": "/timetables",
    "routes": [
      "/timetables"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/timetables/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_timetables",
        "type": "required",
        "description": "Submodule requires parent module Timetables to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "timetables.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/timetables/page.tsx",
      "componentEntry": "components/timetables",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/timetables.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute timetable master operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: timetables.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 46
  },
  {
    "id": "sub_timetables_classes",
    "navId": "nav-timetables-classes",
    "name": "Class Schedules",
    "code": "TIMETABLES_CLASSES",
    "description": "Dedicated submodule supporting specialized workflows for class schedules under Timetables.",
    "category": "timetables_scheduling",
    "macroCategory": "academics",
    "parentId": "mod_timetables",
    "href": "/timetables/classes",
    "routes": [
      "/timetables/classes",
      "/timetables/classes/[classId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/timetables/classes/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_timetables",
        "type": "required",
        "description": "Submodule requires parent module Timetables to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "timetables.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/timetables/classes/page.tsx",
      "componentEntry": "components/timetables",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/timetables.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute class schedules operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: timetables.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 47
  },
  {
    "id": "sub_timetables_teachers",
    "navId": "nav-timetables-teachers",
    "name": "Teacher Schedules",
    "code": "TIMETABLES_TEACHERS",
    "description": "Dedicated submodule supporting specialized workflows for teacher schedules under Timetables.",
    "category": "timetables_scheduling",
    "macroCategory": "academics",
    "parentId": "mod_timetables",
    "href": "/timetables/teachers",
    "routes": [
      "/timetables/teachers",
      "/timetables/teachers/[teacherId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/timetables/teachers/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_timetables",
        "type": "required",
        "description": "Submodule requires parent module Timetables to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "timetables.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/timetables/teachers/page.tsx",
      "componentEntry": "components/timetables",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/timetables.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute teacher schedules operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: timetables.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 48
  },
  {
    "id": "sub_timetables_rooms",
    "navId": "nav-timetables-rooms",
    "name": "Room Occupancy",
    "code": "TIMETABLES_ROOMS",
    "description": "Dedicated submodule supporting specialized workflows for room occupancy under Timetables.",
    "category": "timetables_scheduling",
    "macroCategory": "academics",
    "parentId": "mod_timetables",
    "href": "/timetables/rooms",
    "routes": [
      "/timetables/rooms"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/timetables/rooms/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_timetables",
        "type": "required",
        "description": "Submodule requires parent module Timetables to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "timetables.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/timetables/rooms/page.tsx",
      "componentEntry": "components/timetables",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/timetables.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute room occupancy operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: timetables.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 49
  },
  {
    "id": "sub_timetables_builder",
    "navId": "nav-timetables-builder",
    "name": "Timetable Builder",
    "code": "TIMETABLES_BUILDER",
    "description": "Dedicated submodule supporting specialized workflows for timetable builder under Timetables.",
    "category": "timetables_scheduling",
    "macroCategory": "academics",
    "parentId": "mod_timetables",
    "href": "/timetables/builder",
    "routes": [
      "/timetables/builder"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/timetables/builder/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_timetables",
        "type": "required",
        "description": "Submodule requires parent module Timetables to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "timetables.create"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/timetables/builder/page.tsx",
      "componentEntry": "components/timetables",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/timetables.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute timetable builder operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: timetables.create"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 50
  },
  {
    "id": "sub_timetables_conflicts",
    "navId": "nav-timetables-conflicts",
    "name": "Conflict Resolution",
    "code": "TIMETABLES_CONFLICTS",
    "description": "Dedicated submodule supporting specialized workflows for conflict resolution under Timetables.",
    "category": "timetables_scheduling",
    "macroCategory": "academics",
    "parentId": "mod_timetables",
    "href": "/timetables/conflicts",
    "routes": [
      "/timetables/conflicts"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/timetables/conflicts/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_timetables",
        "type": "required",
        "description": "Submodule requires parent module Timetables to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "timetables.manage_conflicts"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/timetables/conflicts/page.tsx",
      "componentEntry": "components/timetables",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/timetables.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute conflict resolution operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: timetables.manage_conflicts"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 51
  },
  {
    "id": "sub_timetables_publishing",
    "navId": "nav-timetables-publishing",
    "name": "Publishing & Versions",
    "code": "TIMETABLES_PUBLISHING",
    "description": "Dedicated submodule supporting specialized workflows for publishing & versions under Timetables.",
    "category": "timetables_scheduling",
    "macroCategory": "academics",
    "parentId": "mod_timetables",
    "href": "/timetables/publishing",
    "routes": [
      "/timetables/publishing"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/timetables/publishing/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_timetables",
        "type": "required",
        "description": "Submodule requires parent module Timetables to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "timetables.publish"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/timetables/publishing/page.tsx",
      "componentEntry": "components/timetables",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/timetables.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute publishing & versions operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: timetables.publish"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 52
  },
  {
    "id": "sub_timetables_reports",
    "navId": "nav-timetables-reports",
    "name": "Workload Reports",
    "code": "TIMETABLES_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for workload reports under Timetables.",
    "category": "timetables_scheduling",
    "macroCategory": "academics",
    "parentId": "mod_timetables",
    "href": "/timetables/reports",
    "routes": [
      "/timetables/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/timetables/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_timetables",
        "type": "required",
        "description": "Submodule requires parent module Timetables to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "timetables.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/timetables/reports/page.tsx",
      "componentEntry": "components/timetables",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/timetables.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute workload reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: timetables.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 53
  },
  {
    "id": "sub_timetables_settings",
    "navId": "nav-timetables-settings",
    "name": "Bell Schedule Settings",
    "code": "TIMETABLES_SETTINGS",
    "description": "Dedicated submodule supporting specialized workflows for bell schedule settings under Timetables.",
    "category": "timetables_scheduling",
    "macroCategory": "academics",
    "parentId": "mod_timetables",
    "href": "/timetables/settings",
    "routes": [
      "/timetables/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/timetables/settings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_timetables",
        "type": "required",
        "description": "Submodule requires parent module Timetables to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "timetables.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/timetables/settings/page.tsx",
      "componentEntry": "components/timetables",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/timetables.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute bell schedule settings operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: timetables.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 54
  },
  {
    "id": "mod_examinations",
    "navId": "nav-examinations",
    "name": "Examinations",
    "code": "EXAMINATIONS",
    "description": "Full-spectrum tenant module for examinations operations, data management, and user workflows.",
    "category": "examinations_cbt",
    "macroCategory": "academics",
    "href": "/examinations",
    "routes": [
      "/examinations"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "Assessments evaluate curriculum subjects across active terms"
      },
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Candidates taking exams must be active registered students"
      }
    ],
    "requiredPermissions": [
      "examinations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Browse and filter examinations entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 55
  },
  {
    "id": "sub_exam_overview",
    "navId": "nav-exam-overview",
    "name": "Examinations Hub",
    "code": "EXAM_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for examinations hub under Examinations.",
    "category": "examinations_cbt",
    "macroCategory": "academics",
    "parentId": "mod_examinations",
    "href": "/examinations",
    "routes": [
      "/examinations"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_examinations",
        "type": "required",
        "description": "Submodule requires parent module Examinations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "examinations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute examinations hub operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: examinations.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 56
  },
  {
    "id": "sub_exam_periods",
    "navId": "nav-exam-periods",
    "name": "Exam Periods",
    "code": "EXAM_PERIODS",
    "description": "Dedicated submodule supporting specialized workflows for exam periods under Examinations.",
    "category": "examinations_cbt",
    "macroCategory": "academics",
    "parentId": "mod_examinations",
    "href": "/examinations/periods",
    "routes": [
      "/examinations/periods"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/periods/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_examinations",
        "type": "required",
        "description": "Submodule requires parent module Examinations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "examinations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/periods/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute exam periods operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: examinations.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 57
  },
  {
    "id": "sub_exam_assessments",
    "navId": "nav-exam-assessments",
    "name": "Assessments & Weights",
    "code": "EXAM_ASSESSMENTS",
    "description": "Dedicated submodule supporting specialized workflows for assessments & weights under Examinations.",
    "category": "examinations_cbt",
    "macroCategory": "academics",
    "parentId": "mod_examinations",
    "href": "/examinations/assessments",
    "routes": [
      "/examinations/assessments"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/assessments/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_examinations",
        "type": "required",
        "description": "Submodule requires parent module Examinations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "examinations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/assessments/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute assessments & weights operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: examinations.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 58
  },
  {
    "id": "sub_exam_question_bank",
    "navId": "nav-exam-question-bank",
    "name": "CBT Question Bank",
    "code": "EXAM_QUESTION_BANK",
    "description": "Dedicated submodule supporting specialized workflows for cbt question bank under Examinations.",
    "category": "examinations_cbt",
    "macroCategory": "academics",
    "parentId": "mod_examinations",
    "href": "/examinations/question-bank",
    "routes": [
      "/examinations/question-bank",
      "/examinations/question-bank/[questionId]",
      "/examinations/question-bank/[questionId]/edit",
      "/examinations/question-bank/blueprints",
      "/examinations/question-bank/collections",
      "/examinations/question-bank/import",
      "/examinations/question-bank/new",
      "/examinations/question-bank/review"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/question-bank/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_examinations",
        "type": "required",
        "description": "Submodule requires parent module Examinations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "examinations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/question-bank/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute cbt question bank operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: examinations.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 59
  },
  {
    "id": "sub_exam_cbt",
    "navId": "nav-exam-cbt",
    "name": "CBT Examinations",
    "code": "EXAM_CBT",
    "description": "Dedicated submodule supporting specialized workflows for cbt examinations under Examinations.",
    "category": "examinations_cbt",
    "macroCategory": "academics",
    "parentId": "mod_examinations",
    "href": "/examinations/cbt",
    "routes": [
      "/examinations/cbt",
      "/examinations/cbt/[examId]",
      "/examinations/cbt/[examId]/attempts",
      "/examinations/cbt/[examId]/candidates",
      "/examinations/cbt/[examId]/edit",
      "/examinations/cbt/[examId]/results",
      "/examinations/cbt/[examId]/schedule",
      "/examinations/cbt/attempt/[attemptId]",
      "/examinations/cbt/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/cbt/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_examinations",
        "type": "required",
        "description": "Submodule requires parent module Examinations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "examinations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/cbt/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute cbt examinations operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: examinations.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 60
  },
  {
    "id": "sub_exam_timetable",
    "navId": "nav-exam-timetable",
    "name": "Exam Timetable",
    "code": "EXAM_TIMETABLE",
    "description": "Dedicated submodule supporting specialized workflows for exam timetable under Examinations.",
    "category": "examinations_cbt",
    "macroCategory": "academics",
    "parentId": "mod_examinations",
    "href": "/examinations/timetable",
    "routes": [
      "/examinations/timetable"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/timetable/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_examinations",
        "type": "required",
        "description": "Submodule requires parent module Examinations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "examinations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/timetable/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute exam timetable operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: examinations.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 61
  },
  {
    "id": "sub_exam_marks",
    "navId": "nav-exam-marks",
    "name": "Marks Entry",
    "code": "EXAM_MARKS",
    "description": "Dedicated submodule supporting specialized workflows for marks entry under Examinations.",
    "category": "examinations_cbt",
    "macroCategory": "academics",
    "parentId": "mod_examinations",
    "href": "/examinations/marks",
    "routes": [
      "/examinations/marks"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/marks/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_examinations",
        "type": "required",
        "description": "Submodule requires parent module Examinations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "examinations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/marks/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute marks entry operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: examinations.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 62
  },
  {
    "id": "sub_exam_grading",
    "navId": "nav-exam-grading",
    "name": "Grading Scales",
    "code": "EXAM_GRADING",
    "description": "Dedicated submodule supporting specialized workflows for grading scales under Examinations.",
    "category": "examinations_cbt",
    "macroCategory": "academics",
    "parentId": "mod_examinations",
    "href": "/examinations/grading",
    "routes": [
      "/examinations/grading"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/grading/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_examinations",
        "type": "required",
        "description": "Submodule requires parent module Examinations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "examinations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/grading/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute grading scales operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: examinations.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 63
  },
  {
    "id": "sub_exam_analytics",
    "navId": "nav-exam-analytics",
    "name": "Performance Analytics",
    "code": "EXAM_ANALYTICS",
    "description": "Dedicated submodule supporting specialized workflows for performance analytics under Examinations.",
    "category": "examinations_cbt",
    "macroCategory": "academics",
    "parentId": "mod_examinations",
    "href": "/examinations/analytics",
    "routes": [
      "/examinations/analytics"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/analytics/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_examinations",
        "type": "required",
        "description": "Submodule requires parent module Examinations to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "examinations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/analytics/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute performance analytics operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: examinations.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 64
  },
  {
    "id": "mod_results",
    "navId": "nav-results",
    "name": "Academic Results",
    "code": "RESULTS",
    "description": "Full-spectrum tenant module for academic results operations, data management, and user workflows.",
    "category": "results_grading",
    "macroCategory": "academics",
    "href": "/examinations/results",
    "routes": [
      "/examinations/results"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_examinations",
        "type": "required",
        "description": "Broadsheets and transcripts aggregate assessment exam scores"
      },
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Official report cards and cumulative transcripts issue to students"
      }
    ],
    "requiredPermissions": [
      "results.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/results/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Browse and filter academic results entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 65
  },
  {
    "id": "sub_results_moderation",
    "navId": "nav-results-moderation",
    "name": "Results & Moderation",
    "code": "RESULTS_MODERATION",
    "description": "Dedicated submodule supporting specialized workflows for results & moderation under Academic Results.",
    "category": "results_grading",
    "macroCategory": "academics",
    "parentId": "mod_results",
    "href": "/examinations/results",
    "routes": [
      "/examinations/results",
      "/results"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/results/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_results",
        "type": "required",
        "description": "Submodule requires parent module Academic Results to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "results.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/results/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute results & moderation operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: results.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 66
  },
  {
    "id": "sub_results_report_cards",
    "navId": "nav-results-report-cards",
    "name": "Student Report Cards",
    "code": "RESULTS_REPORT_CARDS",
    "description": "Dedicated submodule supporting specialized workflows for student report cards under Academic Results.",
    "category": "results_grading",
    "macroCategory": "academics",
    "parentId": "mod_results",
    "href": "/examinations/report-cards",
    "routes": [
      "/examinations/report-cards",
      "/examinations/report-cards/[studentId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/report-cards/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_results",
        "type": "required",
        "description": "Submodule requires parent module Academic Results to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "results.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/report-cards/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute student report cards operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: results.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 67
  },
  {
    "id": "sub_results_transcripts",
    "navId": "nav-results-transcripts",
    "name": "Cumulative Transcripts",
    "code": "RESULTS_TRANSCRIPTS",
    "description": "Dedicated submodule supporting specialized workflows for cumulative transcripts under Academic Results.",
    "category": "results_grading",
    "macroCategory": "academics",
    "parentId": "mod_results",
    "href": "/examinations/transcripts",
    "routes": [
      "/examinations/transcripts",
      "/examinations/transcripts/[studentId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/transcripts/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_results",
        "type": "required",
        "description": "Submodule requires parent module Academic Results to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "results.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/transcripts/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute cumulative transcripts operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: results.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 68
  },
  {
    "id": "sub_results_broadsheet",
    "navId": "nav-results-broadsheet",
    "name": "Class Broadsheet Grid",
    "code": "RESULTS_BROADSHEET",
    "description": "Dedicated submodule supporting specialized workflows for class broadsheet grid under Academic Results.",
    "category": "results_grading",
    "macroCategory": "academics",
    "parentId": "mod_results",
    "href": "/examinations/broadsheet",
    "routes": [
      "/examinations/broadsheet"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/examinations/broadsheet/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_results",
        "type": "required",
        "description": "Submodule requires parent module Academic Results to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "results.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/examinations/broadsheet/page.tsx",
      "componentEntry": "components/examinations",
      "typeDefinition": "types/examinations.ts",
      "mockStore": "lib/mock/examinationsData.ts",
      "testSuite": "tests/examinations.test.ts",
      "navGroupId": "academics"
    },
    "supportedWorkflows": [
      "Execute class broadsheet grid operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: results.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 69
  },
  {
    "id": "mod_learning_hub",
    "navId": "nav-learning-hub",
    "name": "Learning Hub",
    "code": "LEARNING_HUB",
    "description": "Full-spectrum tenant module for learning hub operations, data management, and user workflows.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "href": "/learning",
    "routes": [
      "/learning"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "LMS course units follow academic schemes of work and subjects"
      }
    ],
    "requiredPermissions": [
      "learning.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Browse and filter learning hub entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 70
  },
  {
    "id": "mod_classroom",
    "navId": "nav-classroom",
    "name": "Online Classroom",
    "code": "CLASSROOM",
    "description": "Full-spectrum tenant module for online classroom operations, data management, and user workflows.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "href": "/classroom",
    "routes": [
      "/classroom"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_learning_hub",
        "type": "required",
        "description": "Virtual classroom sessions deliver LMS course units"
      },
      {
        "moduleId": "mod_students",
        "type": "optional",
        "description": "Student rosters join interactive classroom sessions"
      }
    ],
    "requiredPermissions": [
      "classroom.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/classroom/page.tsx",
      "componentEntry": "components/classroom",
      "typeDefinition": "types/classroom.ts",
      "mockStore": "lib/mock/classroomData.ts",
      "testSuite": "tests/classroom.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Browse and filter online classroom entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 71
  },
  {
    "id": "sub_classroom_hub",
    "navId": "nav-classroom-hub",
    "name": "Classroom Desk",
    "code": "CLASSROOM_HUB",
    "description": "Dedicated submodule supporting specialized workflows for classroom desk under Online Classroom.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_classroom",
    "href": "/classroom",
    "routes": [
      "/classroom",
      "/classroom/resources"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/classroom/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_classroom",
        "type": "required",
        "description": "Submodule requires parent module Online Classroom to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "classroom.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/classroom/page.tsx",
      "componentEntry": "components/classroom",
      "typeDefinition": "types/classroom.ts",
      "mockStore": "lib/mock/classroomData.ts",
      "testSuite": "tests/classroom.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute classroom desk operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: classroom.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 72
  },
  {
    "id": "sub_classroom_meetings",
    "navId": "nav-classroom-meetings",
    "name": "Scheduled Sessions",
    "code": "CLASSROOM_MEETINGS",
    "description": "Dedicated submodule supporting specialized workflows for scheduled sessions under Online Classroom.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_classroom",
    "href": "/classroom/meetings",
    "routes": [
      "/classroom/meetings",
      "/classroom/meetings/[meetingId]",
      "/classroom/meetings/[meetingId]/edit"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/classroom/meetings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_classroom",
        "type": "required",
        "description": "Submodule requires parent module Online Classroom to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "classroom.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/classroom/meetings/page.tsx",
      "componentEntry": "components/classroom",
      "typeDefinition": "types/classroom.ts",
      "mockStore": "lib/mock/classroomData.ts",
      "testSuite": "tests/classroom.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute scheduled sessions operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: classroom.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 73
  },
  {
    "id": "sub_classroom_schedule",
    "navId": "nav-classroom-schedule",
    "name": "Schedule Online Class",
    "code": "CLASSROOM_SCHEDULE",
    "description": "Dedicated submodule supporting specialized workflows for schedule online class under Online Classroom.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_classroom",
    "href": "/classroom/meetings/new",
    "routes": [
      "/classroom/meetings/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/classroom/meetings/new/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_classroom",
        "type": "required",
        "description": "Submodule requires parent module Online Classroom to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "classroom.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/classroom/meetings/new/page.tsx",
      "componentEntry": "components/classroom",
      "typeDefinition": "types/classroom.ts",
      "mockStore": "lib/mock/classroomData.ts",
      "testSuite": "tests/classroom.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute schedule online class operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: classroom.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 74
  },
  {
    "id": "sub_classroom_teacher",
    "navId": "nav-classroom-teacher",
    "name": "Teacher Classrooms",
    "code": "CLASSROOM_TEACHER",
    "description": "Dedicated submodule supporting specialized workflows for teacher classrooms under Online Classroom.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_classroom",
    "href": "/classroom/teacher",
    "routes": [
      "/classroom/teacher",
      "/classroom/teacher/history",
      "/classroom/teacher/meetings",
      "/classroom/teacher/meetings/[meetingId]",
      "/classroom/teacher/meetings/[meetingId]/participants",
      "/classroom/teacher/schedule"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/classroom/teacher/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_classroom",
        "type": "required",
        "description": "Submodule requires parent module Online Classroom to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "classroom.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/classroom/teacher/page.tsx",
      "componentEntry": "components/classroom",
      "typeDefinition": "types/classroom.ts",
      "mockStore": "lib/mock/classroomData.ts",
      "testSuite": "tests/classroom.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute teacher classrooms operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: classroom.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 75
  },
  {
    "id": "sub_classroom_student",
    "navId": "nav-classroom-student",
    "name": "Student Upcoming",
    "code": "CLASSROOM_STUDENT",
    "description": "Dedicated submodule supporting specialized workflows for student upcoming under Online Classroom.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_classroom",
    "href": "/classroom/student",
    "routes": [
      "/classroom/student",
      "/classroom/student/history",
      "/classroom/student/meetings/[meetingId]",
      "/classroom/student/upcoming"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/classroom/student/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_classroom",
        "type": "required",
        "description": "Submodule requires parent module Online Classroom to be enabled and entitled"
      }
    ],
    "requiredPermissions": [],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/classroom/student/page.tsx",
      "componentEntry": "components/classroom",
      "typeDefinition": "types/classroom.ts",
      "mockStore": "lib/mock/classroomData.ts",
      "testSuite": "tests/classroom.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute student upcoming operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: none"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 76
  },
  {
    "id": "sub_classroom_history",
    "navId": "nav-classroom-history",
    "name": "Classroom History",
    "code": "CLASSROOM_HISTORY",
    "description": "Dedicated submodule supporting specialized workflows for classroom history under Online Classroom.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_classroom",
    "href": "/classroom/history",
    "routes": [
      "/classroom/history"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/classroom/history/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_classroom",
        "type": "required",
        "description": "Submodule requires parent module Online Classroom to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "classroom.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/classroom/history/page.tsx",
      "componentEntry": "components/classroom",
      "typeDefinition": "types/classroom.ts",
      "mockStore": "lib/mock/classroomData.ts",
      "testSuite": "tests/classroom.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute classroom history operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: classroom.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 77
  },
  {
    "id": "mod_materials",
    "navId": "nav-materials",
    "name": "Learning Materials",
    "code": "MATERIALS",
    "description": "Full-spectrum tenant module for learning materials operations, data management, and user workflows.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "href": "/learning/materials",
    "routes": [
      "/learning/materials",
      "/learning/materials/[materialId]",
      "/learning/materials/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "LMS course units follow academic schemes of work and subjects"
      }
    ],
    "requiredPermissions": [
      "learning.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/materials/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Browse and filter learning materials entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 78
  },
  {
    "id": "mod_lessons",
    "navId": "nav-lessons",
    "name": "Lessons & Units",
    "code": "LESSONS",
    "description": "Full-spectrum tenant module for lessons & units operations, data management, and user workflows.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "href": "/learning/lessons",
    "routes": [
      "/learning/lessons",
      "/learning/lessons/[lessonId]",
      "/learning/lessons/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "required",
        "description": "LMS course units follow academic schemes of work and subjects"
      }
    ],
    "requiredPermissions": [
      "learning.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/lessons/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Browse and filter lessons & units entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 79
  },
  {
    "id": "mod_assignments",
    "navId": "nav-assignments",
    "name": "Coursework & Tasks",
    "code": "ASSIGNMENTS",
    "description": "Full-spectrum tenant module for coursework & tasks operations, data management, and user workflows.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "href": "/learning/assignments",
    "routes": [
      "/assignments",
      "/learning/assignments",
      "/learning/assignments/[assignmentId]",
      "/learning/assignments/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_learning_hub",
        "type": "required",
        "description": "Assignments and tasks align with LMS course units"
      },
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Coursework tasks are submitted by enrolled students"
      }
    ],
    "requiredPermissions": [
      "assignments.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/assignments/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Browse and filter coursework & tasks entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 80
  },
  {
    "id": "mod_teacher_workspace",
    "navId": "nav-teacher-workspace",
    "name": "Teacher Workspace",
    "code": "TEACHER_WORKSPACE",
    "description": "Full-spectrum tenant module for teacher workspace operations, data management, and user workflows.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "href": "/learning/teacher",
    "routes": [
      "/learning/teacher"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_learning_hub",
        "type": "required",
        "description": "Teacher workspace plans lesson units, rubrics, and grading"
      },
      {
        "moduleId": "mod_teachers",
        "type": "required",
        "description": "Requires active faculty teacher authentication"
      }
    ],
    "requiredPermissions": [
      "learning.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/teacher/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Browse and filter teacher workspace entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 81
  },
  {
    "id": "sub_teacher_dashboard",
    "navId": "nav-teacher-dashboard",
    "name": "Teaching Overview",
    "code": "TEACHER_DASHBOARD",
    "description": "Dedicated submodule supporting specialized workflows for teaching overview under Teacher Workspace.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_teacher_workspace",
    "href": "/learning/teacher",
    "routes": [
      "/learning/teacher",
      "/learning/teacher/submissions/[submissionId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/learning/teacher/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_teacher_workspace",
        "type": "required",
        "description": "Submodule requires parent module Teacher Workspace to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "learning.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/teacher/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute teaching overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: learning.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 82
  },
  {
    "id": "sub_teacher_submissions",
    "navId": "nav-teacher-submissions",
    "name": "Grading & Submissions",
    "code": "TEACHER_SUBMISSIONS",
    "description": "Dedicated submodule supporting specialized workflows for grading & submissions under Teacher Workspace.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_teacher_workspace",
    "href": "/learning/teacher/assignments",
    "routes": [
      "/learning/teacher/assignments",
      "/learning/teacher/assignments/[assignmentId]/edit",
      "/learning/teacher/assignments/[assignmentId]/submissions"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/learning/teacher/assignments/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_teacher_workspace",
        "type": "required",
        "description": "Submodule requires parent module Teacher Workspace to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "learning.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/teacher/assignments/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute grading & submissions operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: learning.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 83
  },
  {
    "id": "sub_teacher_rubrics",
    "navId": "nav-teacher-rubrics",
    "name": "Grading Rubrics",
    "code": "TEACHER_RUBRICS",
    "description": "Dedicated submodule supporting specialized workflows for grading rubrics under Teacher Workspace.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_teacher_workspace",
    "href": "/learning/teacher/rubrics",
    "routes": [
      "/learning/teacher/rubrics",
      "/learning/teacher/rubrics/[rubricId]",
      "/learning/teacher/rubrics/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/learning/teacher/rubrics/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_teacher_workspace",
        "type": "required",
        "description": "Submodule requires parent module Teacher Workspace to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "learning.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/teacher/rubrics/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute grading rubrics operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: learning.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 84
  },
  {
    "id": "sub_teacher_analytics",
    "navId": "nav-teacher-analytics",
    "name": "Class Learning Analytics",
    "code": "TEACHER_ANALYTICS",
    "description": "Dedicated submodule supporting specialized workflows for class learning analytics under Teacher Workspace.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_teacher_workspace",
    "href": "/learning/teacher/analytics",
    "routes": [
      "/learning/teacher/analytics"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/learning/teacher/analytics/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_teacher_workspace",
        "type": "required",
        "description": "Submodule requires parent module Teacher Workspace to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "learning.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/teacher/analytics/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute class learning analytics operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: learning.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 85
  },
  {
    "id": "mod_student_portal",
    "navId": "nav-student-portal",
    "name": "Student Portal",
    "code": "STUDENT_PORTAL",
    "description": "Full-spectrum tenant module for student portal operations, data management, and user workflows.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "href": "/learning/student",
    "routes": [
      "/learning/student"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_learning_hub",
        "type": "required",
        "description": "Student workspace accesses published lesson materials"
      },
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Requires active student authentication"
      }
    ],
    "requiredPermissions": [],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/student/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Browse and filter student portal entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 86
  },
  {
    "id": "sub_student_dashboard",
    "navId": "nav-student-dashboard",
    "name": "My Learning Desk",
    "code": "STUDENT_DASHBOARD",
    "description": "Dedicated submodule supporting specialized workflows for my learning desk under Student Portal.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_student_portal",
    "href": "/learning/student",
    "routes": [
      "/learning/student",
      "/learning/student/submissions/[submissionId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/learning/student/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_student_portal",
        "type": "required",
        "description": "Submodule requires parent module Student Portal to be enabled and entitled"
      }
    ],
    "requiredPermissions": [],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/student/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute my learning desk operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: none"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 87
  },
  {
    "id": "sub_student_assignments",
    "navId": "nav-student-assignments",
    "name": "My Assignments",
    "code": "STUDENT_ASSIGNMENTS",
    "description": "Dedicated submodule supporting specialized workflows for my assignments under Student Portal.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_student_portal",
    "href": "/learning/student/assignments",
    "routes": [
      "/learning/student/assignments",
      "/learning/student/assignments/[assignmentId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/learning/student/assignments/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_student_portal",
        "type": "required",
        "description": "Submodule requires parent module Student Portal to be enabled and entitled"
      }
    ],
    "requiredPermissions": [],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/student/assignments/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute my assignments operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: none"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 88
  },
  {
    "id": "sub_student_lessons",
    "navId": "nav-student-lessons",
    "name": "My Lessons",
    "code": "STUDENT_LESSONS",
    "description": "Dedicated submodule supporting specialized workflows for my lessons under Student Portal.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_student_portal",
    "href": "/learning/student/lessons",
    "routes": [
      "/learning/student/lessons"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/learning/student/lessons/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_student_portal",
        "type": "required",
        "description": "Submodule requires parent module Student Portal to be enabled and entitled"
      }
    ],
    "requiredPermissions": [],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/student/lessons/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute my lessons operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: none"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 89
  },
  {
    "id": "sub_student_materials",
    "navId": "nav-student-materials",
    "name": "Study Resources",
    "code": "STUDENT_MATERIALS",
    "description": "Dedicated submodule supporting specialized workflows for study resources under Student Portal.",
    "category": "learning_lms",
    "macroCategory": "academics",
    "parentId": "mod_student_portal",
    "href": "/learning/student/materials",
    "routes": [
      "/learning/student/materials"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/learning/student/materials/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_student_portal",
        "type": "required",
        "description": "Submodule requires parent module Student Portal to be enabled and entitled"
      }
    ],
    "requiredPermissions": [],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/learning/student/materials/page.tsx",
      "componentEntry": "components/learning",
      "typeDefinition": "types/learning.ts",
      "mockStore": "lib/mock/learningData.ts",
      "testSuite": "tests/learning.test.ts",
      "navGroupId": "learning"
    },
    "supportedWorkflows": [
      "Execute study resources operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: none"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 90
  },
  {
    "id": "mod_communication",
    "navId": "nav-communication",
    "name": "Messages & Broadcasts",
    "code": "COMMUNICATION",
    "description": "Full-spectrum tenant module for messages & broadcasts operations, data management, and user workflows.",
    "category": "communication_messaging",
    "macroCategory": "communications",
    "href": "/communication",
    "routes": [
      "/communication"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "communication.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/communication/page.tsx",
      "componentEntry": "components/communication",
      "typeDefinition": "types/communication.ts",
      "mockStore": "lib/mock/communicationData.ts",
      "testSuite": "tests/communication.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Browse and filter messages & broadcasts entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 91
  },
  {
    "id": "sub_comm_overview",
    "navId": "nav-comm-overview",
    "name": "Communication Hub",
    "code": "COMM_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for communication hub under Messages & Broadcasts.",
    "category": "communication_messaging",
    "macroCategory": "communications",
    "parentId": "mod_communication",
    "href": "/communication",
    "routes": [
      "/communication"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/communication/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_communication",
        "type": "required",
        "description": "Submodule requires parent module Messages & Broadcasts to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "communication.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/communication/page.tsx",
      "componentEntry": "components/communication",
      "typeDefinition": "types/communication.ts",
      "mockStore": "lib/mock/communicationData.ts",
      "testSuite": "tests/communication.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Execute communication hub operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: communication.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 92
  },
  {
    "id": "sub_comm_messages",
    "navId": "nav-comm-messages",
    "name": "Direct Messages",
    "code": "COMM_MESSAGES",
    "description": "Dedicated submodule supporting specialized workflows for direct messages under Messages & Broadcasts.",
    "category": "communication_messaging",
    "macroCategory": "communications",
    "parentId": "mod_communication",
    "href": "/communication/messages",
    "routes": [
      "/communication/messages"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/communication/messages/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_communication",
        "type": "required",
        "description": "Submodule requires parent module Messages & Broadcasts to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "communication.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/communication/messages/page.tsx",
      "componentEntry": "components/communication",
      "typeDefinition": "types/communication.ts",
      "mockStore": "lib/mock/communicationData.ts",
      "testSuite": "tests/communication.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Execute direct messages operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: communication.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 93
  },
  {
    "id": "sub_comm_groups",
    "navId": "nav-comm-groups",
    "name": "School Groups",
    "code": "COMM_GROUPS",
    "description": "Dedicated submodule supporting specialized workflows for school groups under Messages & Broadcasts.",
    "category": "communication_messaging",
    "macroCategory": "communications",
    "parentId": "mod_communication",
    "href": "/communication/groups",
    "routes": [
      "/communication/groups",
      "/communication/groups/[groupId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/communication/groups/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_communication",
        "type": "required",
        "description": "Submodule requires parent module Messages & Broadcasts to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "communication.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/communication/groups/page.tsx",
      "componentEntry": "components/communication",
      "typeDefinition": "types/communication.ts",
      "mockStore": "lib/mock/communicationData.ts",
      "testSuite": "tests/communication.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Execute school groups operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: communication.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 94
  },
  {
    "id": "sub_comm_announcements",
    "navId": "nav-comm-announcements",
    "name": "Official Circulars",
    "code": "COMM_ANNOUNCEMENTS",
    "description": "Dedicated submodule supporting specialized workflows for official circulars under Messages & Broadcasts.",
    "category": "communication_messaging",
    "macroCategory": "communications",
    "parentId": "mod_communication",
    "href": "/communication/announcements",
    "routes": [
      "/communication/announcements"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/communication/announcements/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_communication",
        "type": "required",
        "description": "Submodule requires parent module Messages & Broadcasts to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "communication.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/communication/announcements/page.tsx",
      "componentEntry": "components/communication",
      "typeDefinition": "types/communication.ts",
      "mockStore": "lib/mock/communicationData.ts",
      "testSuite": "tests/communication.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Execute official circulars operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: communication.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 95
  },
  {
    "id": "sub_comm_settings",
    "navId": "nav-comm-settings",
    "name": "Notification Settings",
    "code": "COMM_SETTINGS",
    "description": "Dedicated submodule supporting specialized workflows for notification settings under Messages & Broadcasts.",
    "category": "communication_messaging",
    "macroCategory": "communications",
    "parentId": "mod_communication",
    "href": "/communication/settings",
    "routes": [
      "/communication/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/communication/settings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_communication",
        "type": "required",
        "description": "Submodule requires parent module Messages & Broadcasts to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "communication.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/communication/settings/page.tsx",
      "componentEntry": "components/communication",
      "typeDefinition": "types/communication.ts",
      "mockStore": "lib/mock/communicationData.ts",
      "testSuite": "tests/communication.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Execute notification settings operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: communication.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 96
  },
  {
    "id": "mod_meetings",
    "navId": "nav-meetings",
    "name": "Parent-Teacher Conferences",
    "code": "MEETINGS",
    "description": "Full-spectrum tenant module for parent-teacher conferences operations, data management, and user workflows.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "href": "/engagement/conferences",
    "routes": [
      "/engagement/conferences"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "engagement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/conferences/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Browse and filter parent-teacher conferences entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 97
  },
  {
    "id": "mod_calendar",
    "navId": "nav-calendar",
    "name": "School Calendar",
    "code": "CALENDAR",
    "description": "Full-spectrum tenant module for school calendar operations, data management, and user workflows.",
    "category": "calendar_events",
    "macroCategory": "communications",
    "href": "/calendar",
    "routes": [
      "/calendar"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "calendar.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/calendar/page.tsx",
      "componentEntry": "components/calendar",
      "typeDefinition": "types/calendar.ts",
      "mockStore": "lib/mock/calendarData.ts",
      "testSuite": "tests/calendar.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Browse and filter school calendar entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 98
  },
  {
    "id": "sub_calendar_overview",
    "navId": "nav-calendar-overview",
    "name": "Calendar Overview",
    "code": "CALENDAR_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for calendar overview under School Calendar.",
    "category": "calendar_events",
    "macroCategory": "communications",
    "parentId": "mod_calendar",
    "href": "/calendar",
    "routes": [
      "/calendar"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/calendar/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_calendar",
        "type": "required",
        "description": "Submodule requires parent module School Calendar to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "calendar.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/calendar/page.tsx",
      "componentEntry": "components/calendar",
      "typeDefinition": "types/calendar.ts",
      "mockStore": "lib/mock/calendarData.ts",
      "testSuite": "tests/calendar.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Execute calendar overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: calendar.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 99
  },
  {
    "id": "sub_calendar_events",
    "navId": "nav-calendar-events",
    "name": "School Events",
    "code": "CALENDAR_EVENTS",
    "description": "Dedicated submodule supporting specialized workflows for school events under School Calendar.",
    "category": "calendar_events",
    "macroCategory": "communications",
    "parentId": "mod_calendar",
    "href": "/calendar/events",
    "routes": [
      "/calendar/events",
      "/calendar/events/[eventId]",
      "/calendar/events/[eventId]/edit",
      "/calendar/events/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/calendar/events/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_calendar",
        "type": "required",
        "description": "Submodule requires parent module School Calendar to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "calendar.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/calendar/events/page.tsx",
      "componentEntry": "components/calendar",
      "typeDefinition": "types/calendar.ts",
      "mockStore": "lib/mock/calendarData.ts",
      "testSuite": "tests/calendar.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Execute school events operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: calendar.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 100
  },
  {
    "id": "sub_calendar_academic",
    "navId": "nav-calendar-academic",
    "name": "Academic Dates",
    "code": "CALENDAR_ACADEMIC",
    "description": "Dedicated submodule supporting specialized workflows for academic dates under School Calendar.",
    "category": "calendar_events",
    "macroCategory": "communications",
    "parentId": "mod_calendar",
    "href": "/calendar/academic",
    "routes": [
      "/calendar/academic"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/calendar/academic/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_calendar",
        "type": "required",
        "description": "Submodule requires parent module School Calendar to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "calendar.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/calendar/academic/page.tsx",
      "componentEntry": "components/calendar",
      "typeDefinition": "types/calendar.ts",
      "mockStore": "lib/mock/calendarData.ts",
      "testSuite": "tests/calendar.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Execute academic dates operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: calendar.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 101
  },
  {
    "id": "sub_calendar_holidays",
    "navId": "nav-calendar-holidays",
    "name": "Holidays & Closures",
    "code": "CALENDAR_HOLIDAYS",
    "description": "Dedicated submodule supporting specialized workflows for holidays & closures under School Calendar.",
    "category": "calendar_events",
    "macroCategory": "communications",
    "parentId": "mod_calendar",
    "href": "/calendar/holidays",
    "routes": [
      "/calendar/holidays"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/calendar/holidays/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_calendar",
        "type": "required",
        "description": "Submodule requires parent module School Calendar to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "calendar.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/calendar/holidays/page.tsx",
      "componentEntry": "components/calendar",
      "typeDefinition": "types/calendar.ts",
      "mockStore": "lib/mock/calendarData.ts",
      "testSuite": "tests/calendar.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Execute holidays & closures operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: calendar.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 102
  },
  {
    "id": "sub_calendar_settings",
    "navId": "nav-calendar-settings",
    "name": "Calendar Settings",
    "code": "CALENDAR_SETTINGS",
    "description": "Dedicated submodule supporting specialized workflows for calendar settings under School Calendar.",
    "category": "calendar_events",
    "macroCategory": "communications",
    "parentId": "mod_calendar",
    "href": "/calendar/settings",
    "routes": [
      "/calendar/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/calendar/settings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_calendar",
        "type": "required",
        "description": "Submodule requires parent module School Calendar to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "calendar.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/calendar/settings/page.tsx",
      "componentEntry": "components/calendar",
      "typeDefinition": "types/calendar.ts",
      "mockStore": "lib/mock/calendarData.ts",
      "testSuite": "tests/calendar.test.ts",
      "navGroupId": "communication"
    },
    "supportedWorkflows": [
      "Execute calendar settings operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: calendar.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 103
  },
  {
    "id": "mod_finance",
    "navId": "nav-finance",
    "name": "Fees & Finance",
    "code": "FINANCE",
    "description": "Full-spectrum tenant module for fees & finance operations, data management, and user workflows.",
    "category": "finance_bursary",
    "macroCategory": "finance",
    "href": "/finance",
    "routes": [
      "/finance"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Tuition and fees are invoiced against enrolled student accounts"
      }
    ],
    "requiredPermissions": [
      "finance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/finance/page.tsx",
      "componentEntry": "components/finance",
      "typeDefinition": "types/finance.ts",
      "mockStore": "lib/mock/financeData.ts",
      "testSuite": "tests/finance.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter fees & finance entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 104
  },
  {
    "id": "sub_finance_overview",
    "navId": "nav-finance-overview",
    "name": "Finance Overview",
    "code": "FINANCE_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for finance overview under Fees & Finance.",
    "category": "finance_bursary",
    "macroCategory": "finance",
    "parentId": "mod_finance",
    "href": "/finance",
    "routes": [
      "/finance"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/finance/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_finance",
        "type": "required",
        "description": "Submodule requires parent module Fees & Finance to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "finance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/finance/page.tsx",
      "componentEntry": "components/finance",
      "typeDefinition": "types/finance.ts",
      "mockStore": "lib/mock/financeData.ts",
      "testSuite": "tests/finance.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute finance overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: finance.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 105
  },
  {
    "id": "sub_finance_structures",
    "navId": "nav-finance-structures",
    "name": "Fee Structures",
    "code": "FINANCE_STRUCTURES",
    "description": "Dedicated submodule supporting specialized workflows for fee structures under Fees & Finance.",
    "category": "finance_bursary",
    "macroCategory": "finance",
    "parentId": "mod_finance",
    "href": "/finance/fee-structures",
    "routes": [
      "/finance/fee-structures"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/finance/fee-structures/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_finance",
        "type": "required",
        "description": "Submodule requires parent module Fees & Finance to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "finance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/finance/fee-structures/page.tsx",
      "componentEntry": "components/finance",
      "typeDefinition": "types/finance.ts",
      "mockStore": "lib/mock/financeData.ts",
      "testSuite": "tests/finance.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute fee structures operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: finance.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 106
  },
  {
    "id": "sub_finance_invoices",
    "navId": "nav-finance-invoices",
    "name": "Invoices & Billing",
    "code": "FINANCE_INVOICES",
    "description": "Dedicated submodule supporting specialized workflows for invoices & billing under Fees & Finance.",
    "category": "finance_bursary",
    "macroCategory": "finance",
    "parentId": "mod_finance",
    "href": "/finance/invoices",
    "routes": [
      "/finance/invoices"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/finance/invoices/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_finance",
        "type": "required",
        "description": "Submodule requires parent module Fees & Finance to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "finance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/finance/invoices/page.tsx",
      "componentEntry": "components/finance",
      "typeDefinition": "types/finance.ts",
      "mockStore": "lib/mock/financeData.ts",
      "testSuite": "tests/finance.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute invoices & billing operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: finance.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 107
  },
  {
    "id": "sub_finance_bulk_generate",
    "navId": "nav-finance-bulk-generate",
    "name": "Batch Invoice Generator",
    "code": "FINANCE_BULK_GENERATE",
    "description": "Dedicated submodule supporting specialized workflows for batch invoice generator under Fees & Finance.",
    "category": "finance_bursary",
    "macroCategory": "finance",
    "parentId": "mod_finance",
    "href": "/finance/billing/generate",
    "routes": [
      "/finance/billing/generate"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/finance/billing/generate/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_finance",
        "type": "required",
        "description": "Submodule requires parent module Fees & Finance to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "finance.billing.generate"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/finance/billing/generate/page.tsx",
      "componentEntry": "components/finance",
      "typeDefinition": "types/finance.ts",
      "mockStore": "lib/mock/financeData.ts",
      "testSuite": "tests/finance.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute batch invoice generator operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: finance.billing.generate"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 108
  },
  {
    "id": "sub_finance_payments",
    "navId": "nav-finance-payments",
    "name": "Payments & Ledger",
    "code": "FINANCE_PAYMENTS",
    "description": "Dedicated submodule supporting specialized workflows for payments & ledger under Fees & Finance.",
    "category": "finance_bursary",
    "macroCategory": "finance",
    "parentId": "mod_finance",
    "href": "/finance/payments",
    "routes": [
      "/finance/payments"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/finance/payments/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_finance",
        "type": "required",
        "description": "Submodule requires parent module Fees & Finance to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "finance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/finance/payments/page.tsx",
      "componentEntry": "components/finance",
      "typeDefinition": "types/finance.ts",
      "mockStore": "lib/mock/financeData.ts",
      "testSuite": "tests/finance.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute payments & ledger operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: finance.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 109
  },
  {
    "id": "sub_finance_receipts",
    "navId": "nav-finance-receipts",
    "name": "Bursar Receipts",
    "code": "FINANCE_RECEIPTS",
    "description": "Dedicated submodule supporting specialized workflows for bursar receipts under Fees & Finance.",
    "category": "finance_bursary",
    "macroCategory": "finance",
    "parentId": "mod_finance",
    "href": "/finance/receipts",
    "routes": [
      "/finance/receipts"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/finance/receipts/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_finance",
        "type": "required",
        "description": "Submodule requires parent module Fees & Finance to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "finance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/finance/receipts/page.tsx",
      "componentEntry": "components/finance",
      "typeDefinition": "types/finance.ts",
      "mockStore": "lib/mock/financeData.ts",
      "testSuite": "tests/finance.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute bursar receipts operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: finance.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 110
  },
  {
    "id": "sub_finance_concessions",
    "navId": "nav-finance-concessions",
    "name": "Discounts & Scholarships",
    "code": "FINANCE_CONCESSIONS",
    "description": "Dedicated submodule supporting specialized workflows for discounts & scholarships under Fees & Finance.",
    "category": "finance_bursary",
    "macroCategory": "finance",
    "parentId": "mod_finance",
    "href": "/finance/concessions",
    "routes": [
      "/finance/concessions"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/finance/concessions/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_finance",
        "type": "required",
        "description": "Submodule requires parent module Fees & Finance to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "finance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/finance/concessions/page.tsx",
      "componentEntry": "components/finance",
      "typeDefinition": "types/finance.ts",
      "mockStore": "lib/mock/financeData.ts",
      "testSuite": "tests/finance.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute discounts & scholarships operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: finance.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 111
  },
  {
    "id": "sub_finance_reconciliation",
    "navId": "nav-finance-reconciliation",
    "name": "Payment Reconciliation",
    "code": "FINANCE_RECONCILIATION",
    "description": "Dedicated submodule supporting specialized workflows for payment reconciliation under Fees & Finance.",
    "category": "finance_bursary",
    "macroCategory": "finance",
    "parentId": "mod_finance",
    "href": "/finance/reconciliation",
    "routes": [
      "/finance/reconciliation"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/finance/reconciliation/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_finance",
        "type": "required",
        "description": "Submodule requires parent module Fees & Finance to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "finance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/finance/reconciliation/page.tsx",
      "componentEntry": "components/finance",
      "typeDefinition": "types/finance.ts",
      "mockStore": "lib/mock/financeData.ts",
      "testSuite": "tests/finance.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute payment reconciliation operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: finance.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 112
  },
  {
    "id": "sub_finance_reports",
    "navId": "nav-finance-reports",
    "name": "Financial Reports",
    "code": "FINANCE_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for financial reports under Fees & Finance.",
    "category": "finance_bursary",
    "macroCategory": "finance",
    "parentId": "mod_finance",
    "href": "/finance/reports",
    "routes": [
      "/finance/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/finance/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_finance",
        "type": "required",
        "description": "Submodule requires parent module Fees & Finance to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "finance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/finance/reports/page.tsx",
      "componentEntry": "components/finance",
      "typeDefinition": "types/finance.ts",
      "mockStore": "lib/mock/financeData.ts",
      "testSuite": "tests/finance.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute financial reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: finance.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 113
  },
  {
    "id": "mod_hr",
    "navId": "nav-hr",
    "name": "Human Resources",
    "code": "HR",
    "description": "Full-spectrum tenant module for human resources operations, data management, and user workflows.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "href": "/hr",
    "routes": [
      "/hr"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "hr.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter human resources entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 114
  },
  {
    "id": "sub_hr_overview",
    "navId": "nav-hr-overview",
    "name": "HR Overview",
    "code": "HR_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for hr overview under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr",
    "routes": [
      "/hr"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute hr overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 115
  },
  {
    "id": "sub_hr_employees",
    "navId": "nav-hr-employees",
    "name": "Employee Directory",
    "code": "HR_EMPLOYEES",
    "description": "Dedicated submodule supporting specialized workflows for employee directory under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/employees",
    "routes": [
      "/hr/employees",
      "/hr/employees/[staffId]",
      "/hr/employees/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/employees/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.staff.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/employees/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute employee directory operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.staff.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 116
  },
  {
    "id": "sub_hr_departments",
    "navId": "nav-hr-departments",
    "name": "Departments",
    "code": "HR_DEPARTMENTS",
    "description": "Dedicated submodule supporting specialized workflows for departments under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/departments",
    "routes": [
      "/hr/departments"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/departments/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/departments/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute departments operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 117
  },
  {
    "id": "sub_hr_positions",
    "navId": "nav-hr-positions",
    "name": "Job Positions",
    "code": "HR_POSITIONS",
    "description": "Dedicated submodule supporting specialized workflows for job positions under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/positions",
    "routes": [
      "/hr/positions"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/positions/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/positions/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute job positions operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 118
  },
  {
    "id": "sub_hr_contracts",
    "navId": "nav-hr-contracts",
    "name": "Contracts & Docs",
    "code": "HR_CONTRACTS",
    "description": "Dedicated submodule supporting specialized workflows for contracts & docs under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/contracts",
    "routes": [
      "/hr/contracts"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/contracts/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.contracts.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/contracts/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute contracts & docs operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.contracts.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 119
  },
  {
    "id": "sub_hr_onboarding",
    "navId": "nav-hr-onboarding",
    "name": "Onboarding",
    "code": "HR_ONBOARDING",
    "description": "Dedicated submodule supporting specialized workflows for onboarding under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/onboarding",
    "routes": [
      "/hr/onboarding"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/onboarding/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.onboarding.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/onboarding/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute onboarding operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.onboarding.manage"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 120
  },
  {
    "id": "sub_hr_offboarding",
    "navId": "nav-hr-offboarding",
    "name": "Offboarding",
    "code": "HR_OFFBOARDING",
    "description": "Dedicated submodule supporting specialized workflows for offboarding under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/offboarding",
    "routes": [
      "/hr/offboarding"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/offboarding/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.offboarding.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/offboarding/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute offboarding operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.offboarding.manage"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 121
  },
  {
    "id": "sub_hr_leave",
    "navId": "nav-hr-leave",
    "name": "Leave Management",
    "code": "HR_LEAVE",
    "description": "Dedicated submodule supporting specialized workflows for leave management under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/leave",
    "routes": [
      "/hr/leave",
      "/hr/leave/policies"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/leave/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.leave.view_own"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/leave/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute leave management operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.leave.view_own"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 122
  },
  {
    "id": "sub_hr_leave_calendar",
    "navId": "nav-hr-leave-calendar",
    "name": "Leave Calendar",
    "code": "HR_LEAVE_CALENDAR",
    "description": "Dedicated submodule supporting specialized workflows for leave calendar under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/leave/calendar",
    "routes": [
      "/hr/leave/calendar"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/leave/calendar/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.leave.view_all"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/leave/calendar/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute leave calendar operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.leave.view_all"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 123
  },
  {
    "id": "sub_hr_leave_balances",
    "navId": "nav-hr-leave-balances",
    "name": "Leave Balances & Ledger",
    "code": "HR_LEAVE_BALANCES",
    "description": "Dedicated submodule supporting specialized workflows for leave balances & ledger under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/leave/balances",
    "routes": [
      "/hr/leave/balances"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/leave/balances/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.leave.view_all"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/leave/balances/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute leave balances & ledger operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.leave.view_all"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 124
  },
  {
    "id": "sub_hr_pay_grades",
    "navId": "nav-hr-pay-grades",
    "name": "Pay Grades & Scales",
    "code": "HR_PAY_GRADES",
    "description": "Dedicated submodule supporting specialized workflows for pay grades & scales under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/pay-grades",
    "routes": [
      "/hr/pay-grades"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/pay-grades/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.compensation.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/pay-grades/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute pay grades & scales operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.compensation.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 125
  },
  {
    "id": "sub_hr_compensation",
    "navId": "nav-hr-compensation",
    "name": "Staff Compensation",
    "code": "HR_COMPENSATION",
    "description": "Dedicated submodule supporting specialized workflows for staff compensation under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/compensation",
    "routes": [
      "/hr/compensation"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/compensation/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.compensation.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/compensation/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute staff compensation operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.compensation.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 126
  },
  {
    "id": "sub_hr_payroll",
    "navId": "nav-hr-payroll",
    "name": "Payroll Operations",
    "code": "HR_PAYROLL",
    "description": "Dedicated submodule supporting specialized workflows for payroll operations under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/payroll",
    "routes": [
      "/hr/payroll"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/payroll/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.payroll.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/payroll/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute payroll operations operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.payroll.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 127
  },
  {
    "id": "sub_hr_payroll_runs",
    "navId": "nav-hr-payroll-runs",
    "name": "Payroll Runs",
    "code": "HR_PAYROLL_RUNS",
    "description": "Dedicated submodule supporting specialized workflows for payroll runs under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/payroll/runs",
    "routes": [
      "/hr/payroll/runs",
      "/hr/payroll/runs/[runId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/payroll/runs/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.payroll.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/payroll/runs/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute payroll runs operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.payroll.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 128
  },
  {
    "id": "sub_hr_payroll_payslips",
    "navId": "nav-hr-payroll-payslips",
    "name": "Payslips",
    "code": "HR_PAYROLL_PAYSLIPS",
    "description": "Dedicated submodule supporting specialized workflows for payslips under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/payroll/payslips",
    "routes": [
      "/hr/payroll/payslips",
      "/hr/payroll/payslips/[payslipId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/payroll/payslips/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.payslips.view_own"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/payroll/payslips/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute payslips operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.payslips.view_own"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 129
  },
  {
    "id": "sub_hr_reports",
    "navId": "nav-hr-reports",
    "name": "HR Reports & Exports",
    "code": "HR_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for hr reports & exports under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/reports",
    "routes": [
      "/hr/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/reports/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute hr reports & exports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 130
  },
  {
    "id": "sub_hr_settings",
    "navId": "nav-hr-settings",
    "name": "HR Policies & Settings",
    "code": "HR_SETTINGS",
    "description": "Dedicated submodule supporting specialized workflows for hr policies & settings under Human Resources.",
    "category": "hr_payroll",
    "macroCategory": "administration",
    "parentId": "mod_hr",
    "href": "/hr/settings",
    "routes": [
      "/hr/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hr/settings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hr",
        "type": "required",
        "description": "Submodule requires parent module Human Resources to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hr.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hr/settings/page.tsx",
      "componentEntry": "components/hr",
      "typeDefinition": "types/hr.ts",
      "mockStore": "lib/mock/hrData.ts",
      "testSuite": "tests/hr.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute hr policies & settings operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hr.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 131
  },
  {
    "id": "mod_library",
    "navId": "nav-library",
    "name": "Library & Repository",
    "code": "LIBRARY",
    "description": "Full-spectrum tenant module for library & repository operations, data management, and user workflows.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "href": "/library",
    "routes": [
      "/library"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Circulation loans and barcode checkout issue to student/staff patrons"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter library & repository entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 132
  },
  {
    "id": "sub_library_overview",
    "navId": "nav-library-overview",
    "name": "Library Overview",
    "code": "LIBRARY_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for library overview under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library",
    "routes": [
      "/library"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute library overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 133
  },
  {
    "id": "sub_library_catalog",
    "navId": "nav-library-catalog",
    "name": "Book Catalog",
    "code": "LIBRARY_CATALOG",
    "description": "Dedicated submodule supporting specialized workflows for book catalog under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library/catalog",
    "routes": [
      "/library/catalog"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/catalog/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/catalog/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute book catalog operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 134
  },
  {
    "id": "sub_library_digital_resources",
    "navId": "nav-library-digital-resources",
    "name": "Digital Resources",
    "code": "LIBRARY_DIGITAL_RESOURCES",
    "description": "Dedicated submodule supporting specialized workflows for digital resources under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library/digital-resources",
    "routes": [
      "/library/digital-resources",
      "/library/digital-resources/[resourceId]",
      "/library/digital-resources/categories"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/digital-resources/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/digital-resources/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute digital resources operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 135
  },
  {
    "id": "sub_library_copies",
    "navId": "nav-library-copies",
    "name": "Physical Copies",
    "code": "LIBRARY_COPIES",
    "description": "Dedicated submodule supporting specialized workflows for physical copies under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library/copies",
    "routes": [
      "/library/copies"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/copies/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/copies/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute physical copies operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 136
  },
  {
    "id": "sub_library_barcodes",
    "navId": "nav-library-barcodes",
    "name": "Barcode Management",
    "code": "LIBRARY_BARCODES",
    "description": "Dedicated submodule supporting specialized workflows for barcode management under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library/barcodes",
    "routes": [
      "/library/barcodes"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/barcodes/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/barcodes/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute barcode management operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 137
  },
  {
    "id": "sub_library_scan",
    "navId": "nav-library-scan",
    "name": "Scan & Circulate",
    "code": "LIBRARY_SCAN",
    "description": "Dedicated submodule supporting specialized workflows for scan & circulate under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library/barcodes/scan",
    "routes": [
      "/library/barcodes/scan"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/barcodes/scan/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/barcodes/scan/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute scan & circulate operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 138
  },
  {
    "id": "sub_library_print_barcodes",
    "navId": "nav-library-print-barcodes",
    "name": "Print Barcode Labels",
    "code": "LIBRARY_PRINT_BARCODES",
    "description": "Dedicated submodule supporting specialized workflows for print barcode labels under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library/barcodes/print",
    "routes": [
      "/library/barcodes/print"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/barcodes/print/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/barcodes/print/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute print barcode labels operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 139
  },
  {
    "id": "sub_library_loans",
    "navId": "nav-library-loans",
    "name": "Circulation & Loans",
    "code": "LIBRARY_LOANS",
    "description": "Dedicated submodule supporting specialized workflows for circulation & loans under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library/loans",
    "routes": [
      "/library/loans"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/loans/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/loans/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute circulation & loans operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 140
  },
  {
    "id": "sub_library_members",
    "navId": "nav-library-members",
    "name": "Library Members",
    "code": "LIBRARY_MEMBERS",
    "description": "Dedicated submodule supporting specialized workflows for library members under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library/members",
    "routes": [
      "/library/members"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/members/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/members/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute library members operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 141
  },
  {
    "id": "sub_library_reservations",
    "navId": "nav-library-reservations",
    "name": "Reservations Queue",
    "code": "LIBRARY_RESERVATIONS",
    "description": "Dedicated submodule supporting specialized workflows for reservations queue under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library/reservations",
    "routes": [
      "/library/reservations"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/reservations/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/reservations/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute reservations queue operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 142
  },
  {
    "id": "sub_library_overdue",
    "navId": "nav-library-overdue",
    "name": "Overdue & Reminders",
    "code": "LIBRARY_OVERDUE",
    "description": "Dedicated submodule supporting specialized workflows for overdue & reminders under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library/overdue",
    "routes": [
      "/library/overdue"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/overdue/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/overdue/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute overdue & reminders operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 143
  },
  {
    "id": "sub_library_reports",
    "navId": "nav-library-reports",
    "name": "Circulation Reports",
    "code": "LIBRARY_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for circulation reports under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library/reports",
    "routes": [
      "/library/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/reports/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute circulation reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 144
  },
  {
    "id": "sub_library_settings",
    "navId": "nav-library-settings",
    "name": "Borrowing Policies",
    "code": "LIBRARY_SETTINGS",
    "description": "Dedicated submodule supporting specialized workflows for borrowing policies under Library & Repository.",
    "category": "library_circulation",
    "macroCategory": "administration",
    "parentId": "mod_library",
    "href": "/library/settings",
    "routes": [
      "/library/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/library/settings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_library",
        "type": "required",
        "description": "Submodule requires parent module Library & Repository to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "library.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/library/settings/page.tsx",
      "componentEntry": "components/library",
      "typeDefinition": "types/library.ts",
      "mockStore": "lib/mock/libraryData.ts",
      "testSuite": "tests/digitalLibraryAndBarcodes.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute borrowing policies operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: library.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 145
  },
  {
    "id": "mod_inventory",
    "navId": "nav-inventory",
    "name": "General Inventory",
    "code": "INVENTORY",
    "description": "Full-spectrum tenant module for general inventory operations, data management, and user workflows.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "href": "/inventory",
    "routes": [
      "/inventory"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "inventory.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/inventory/page.tsx",
      "componentEntry": "components/inventory",
      "typeDefinition": "types/inventory.ts",
      "mockStore": "lib/mock/inventoryData.ts",
      "testSuite": "tests/inventory.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter general inventory entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 146
  },
  {
    "id": "sub_inventory_overview",
    "navId": "nav-inventory-overview",
    "name": "Stock Overview",
    "code": "INVENTORY_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for stock overview under General Inventory.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_inventory",
    "href": "/inventory",
    "routes": [
      "/inventory"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/inventory/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_inventory",
        "type": "required",
        "description": "Submodule requires parent module General Inventory to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "inventory.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/inventory/page.tsx",
      "componentEntry": "components/inventory",
      "typeDefinition": "types/inventory.ts",
      "mockStore": "lib/mock/inventoryData.ts",
      "testSuite": "tests/inventory.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute stock overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: inventory.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 147
  },
  {
    "id": "sub_inventory_items",
    "navId": "nav-inventory-items",
    "name": "Item Catalog",
    "code": "INVENTORY_ITEMS",
    "description": "Dedicated submodule supporting specialized workflows for item catalog under General Inventory.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_inventory",
    "href": "/inventory/items",
    "routes": [
      "/inventory/items"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/inventory/items/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_inventory",
        "type": "required",
        "description": "Submodule requires parent module General Inventory to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "inventory.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/inventory/items/page.tsx",
      "componentEntry": "components/inventory",
      "typeDefinition": "types/inventory.ts",
      "mockStore": "lib/mock/inventoryData.ts",
      "testSuite": "tests/inventory.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute item catalog operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: inventory.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 148
  },
  {
    "id": "sub_inventory_locations",
    "navId": "nav-inventory-locations",
    "name": "Store Locations",
    "code": "INVENTORY_LOCATIONS",
    "description": "Dedicated submodule supporting specialized workflows for store locations under General Inventory.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_inventory",
    "href": "/inventory/locations",
    "routes": [
      "/inventory/locations"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/inventory/locations/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_inventory",
        "type": "required",
        "description": "Submodule requires parent module General Inventory to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "inventory.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/inventory/locations/page.tsx",
      "componentEntry": "components/inventory",
      "typeDefinition": "types/inventory.ts",
      "mockStore": "lib/mock/inventoryData.ts",
      "testSuite": "tests/inventory.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute store locations operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: inventory.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 149
  },
  {
    "id": "sub_inventory_movements",
    "navId": "nav-inventory-movements",
    "name": "Movement Ledger",
    "code": "INVENTORY_MOVEMENTS",
    "description": "Dedicated submodule supporting specialized workflows for movement ledger under General Inventory.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_inventory",
    "href": "/inventory/movements",
    "routes": [
      "/inventory/movements"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/inventory/movements/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_inventory",
        "type": "required",
        "description": "Submodule requires parent module General Inventory to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "inventory.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/inventory/movements/page.tsx",
      "componentEntry": "components/inventory",
      "typeDefinition": "types/inventory.ts",
      "mockStore": "lib/mock/inventoryData.ts",
      "testSuite": "tests/inventory.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute movement ledger operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: inventory.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 150
  },
  {
    "id": "sub_inventory_stock_counts",
    "navId": "nav-inventory-stock-counts",
    "name": "Stock Reconciliation",
    "code": "INVENTORY_STOCK_COUNTS",
    "description": "Dedicated submodule supporting specialized workflows for stock reconciliation under General Inventory.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_inventory",
    "href": "/inventory/stock-counts",
    "routes": [
      "/inventory/stock-counts"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/inventory/stock-counts/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_inventory",
        "type": "required",
        "description": "Submodule requires parent module General Inventory to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "inventory.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/inventory/stock-counts/page.tsx",
      "componentEntry": "components/inventory",
      "typeDefinition": "types/inventory.ts",
      "mockStore": "lib/mock/inventoryData.ts",
      "testSuite": "tests/inventory.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute stock reconciliation operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: inventory.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 151
  },
  {
    "id": "sub_inventory_low_stock",
    "navId": "nav-inventory-low-stock",
    "name": "Low Stock & Reorders",
    "code": "INVENTORY_LOW_STOCK",
    "description": "Dedicated submodule supporting specialized workflows for low stock & reorders under General Inventory.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_inventory",
    "href": "/inventory/low-stock",
    "routes": [
      "/inventory/low-stock"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/inventory/low-stock/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_inventory",
        "type": "required",
        "description": "Submodule requires parent module General Inventory to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "inventory.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/inventory/low-stock/page.tsx",
      "componentEntry": "components/inventory",
      "typeDefinition": "types/inventory.ts",
      "mockStore": "lib/mock/inventoryData.ts",
      "testSuite": "tests/inventory.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute low stock & reorders operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: inventory.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 152
  },
  {
    "id": "sub_inventory_reports",
    "navId": "nav-inventory-reports",
    "name": "Inventory Reports",
    "code": "INVENTORY_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for inventory reports under General Inventory.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_inventory",
    "href": "/inventory/reports",
    "routes": [
      "/inventory/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/inventory/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_inventory",
        "type": "required",
        "description": "Submodule requires parent module General Inventory to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "inventory.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/inventory/reports/page.tsx",
      "componentEntry": "components/inventory",
      "typeDefinition": "types/inventory.ts",
      "mockStore": "lib/mock/inventoryData.ts",
      "testSuite": "tests/inventory.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute inventory reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: inventory.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 153
  },
  {
    "id": "sub_inventory_settings",
    "navId": "nav-inventory-settings",
    "name": "Inventory Settings",
    "code": "INVENTORY_SETTINGS",
    "description": "Dedicated submodule supporting specialized workflows for inventory settings under General Inventory.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_inventory",
    "href": "/inventory/settings",
    "routes": [
      "/inventory/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/inventory/settings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_inventory",
        "type": "required",
        "description": "Submodule requires parent module General Inventory to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "inventory.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/inventory/settings/page.tsx",
      "componentEntry": "components/inventory",
      "typeDefinition": "types/inventory.ts",
      "mockStore": "lib/mock/inventoryData.ts",
      "testSuite": "tests/inventory.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute inventory settings operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: inventory.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 154
  },
  {
    "id": "mod_assets",
    "navId": "nav-assets",
    "name": "Asset Management",
    "code": "ASSETS",
    "description": "Full-spectrum tenant module for asset management operations, data management, and user workflows.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "href": "/assets",
    "routes": [
      "/assets"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "assets.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/assets/page.tsx",
      "componentEntry": "components/assets",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/assets.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter asset management entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 155
  },
  {
    "id": "sub_assets_overview",
    "navId": "nav-assets-overview",
    "name": "Asset Overview",
    "code": "ASSETS_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for asset overview under Asset Management.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_assets",
    "href": "/assets",
    "routes": [
      "/assets"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/assets/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_assets",
        "type": "required",
        "description": "Submodule requires parent module Asset Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "assets.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/assets/page.tsx",
      "componentEntry": "components/assets",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/assets.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute asset overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: assets.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 156
  },
  {
    "id": "sub_assets_register",
    "navId": "nav-assets-register",
    "name": "Asset Register",
    "code": "ASSETS_REGISTER",
    "description": "Dedicated submodule supporting specialized workflows for asset register under Asset Management.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_assets",
    "href": "/assets/register",
    "routes": [
      "/assets/register"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/assets/register/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_assets",
        "type": "required",
        "description": "Submodule requires parent module Asset Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "assets.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/assets/register/page.tsx",
      "componentEntry": "components/assets",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/assets.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute asset register operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: assets.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 157
  },
  {
    "id": "sub_assets_assignments",
    "navId": "nav-assets-assignments",
    "name": "Handover & Assignments",
    "code": "ASSETS_ASSIGNMENTS",
    "description": "Dedicated submodule supporting specialized workflows for handover & assignments under Asset Management.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_assets",
    "href": "/assets/assignments",
    "routes": [
      "/assets/assignments"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/assets/assignments/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_assets",
        "type": "required",
        "description": "Submodule requires parent module Asset Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "assets.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/assets/assignments/page.tsx",
      "componentEntry": "components/assets",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/assets.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute handover & assignments operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: assets.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 158
  },
  {
    "id": "sub_assets_maintenance",
    "navId": "nav-assets-maintenance",
    "name": "Maintenance & Repairs",
    "code": "ASSETS_MAINTENANCE",
    "description": "Dedicated submodule supporting specialized workflows for maintenance & repairs under Asset Management.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_assets",
    "href": "/assets/maintenance",
    "routes": [
      "/assets/maintenance"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/assets/maintenance/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_assets",
        "type": "required",
        "description": "Submodule requires parent module Asset Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "assets.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/assets/maintenance/page.tsx",
      "componentEntry": "components/assets",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/assets.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute maintenance & repairs operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: assets.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 159
  },
  {
    "id": "sub_assets_warranties",
    "navId": "nav-assets-warranties",
    "name": "Warranties & Expiry",
    "code": "ASSETS_WARRANTIES",
    "description": "Dedicated submodule supporting specialized workflows for warranties & expiry under Asset Management.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_assets",
    "href": "/assets/warranties",
    "routes": [
      "/assets/warranties"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/assets/warranties/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_assets",
        "type": "required",
        "description": "Submodule requires parent module Asset Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "assets.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/assets/warranties/page.tsx",
      "componentEntry": "components/assets",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/assets.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute warranties & expiry operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: assets.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 160
  },
  {
    "id": "sub_assets_disposals",
    "navId": "nav-assets-disposals",
    "name": "Disposal & Retirement",
    "code": "ASSETS_DISPOSALS",
    "description": "Dedicated submodule supporting specialized workflows for disposal & retirement under Asset Management.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_assets",
    "href": "/assets/disposals",
    "routes": [
      "/assets/disposals"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/assets/disposals/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_assets",
        "type": "required",
        "description": "Submodule requires parent module Asset Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "assets.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/assets/disposals/page.tsx",
      "componentEntry": "components/assets",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/assets.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute disposal & retirement operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: assets.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 161
  },
  {
    "id": "sub_assets_reports",
    "navId": "nav-assets-reports",
    "name": "Asset Reports",
    "code": "ASSETS_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for asset reports under Asset Management.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_assets",
    "href": "/assets/reports",
    "routes": [
      "/assets/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/assets/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_assets",
        "type": "required",
        "description": "Submodule requires parent module Asset Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "assets.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/assets/reports/page.tsx",
      "componentEntry": "components/assets",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/assets.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute asset reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: assets.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 162
  },
  {
    "id": "sub_assets_settings",
    "navId": "nav-assets-settings",
    "name": "Asset Categories",
    "code": "ASSETS_SETTINGS",
    "description": "Dedicated submodule supporting specialized workflows for asset categories under Asset Management.",
    "category": "inventory_assets",
    "macroCategory": "administration",
    "parentId": "mod_assets",
    "href": "/assets/settings",
    "routes": [
      "/assets/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/assets/settings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_assets",
        "type": "required",
        "description": "Submodule requires parent module Asset Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "assets.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/assets/settings/page.tsx",
      "componentEntry": "components/assets",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/assets.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute asset categories operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: assets.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 163
  },
  {
    "id": "mod_procurement",
    "navId": "nav-procurement",
    "name": "Procurement & Orders",
    "code": "PROCUREMENT",
    "description": "Full-spectrum tenant module for procurement & orders operations, data management, and user workflows.",
    "category": "procurement_orders",
    "macroCategory": "administration",
    "href": "/procurement",
    "routes": [
      "/procurement"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_inventory",
        "type": "required",
        "description": "Purchase orders replenish stock items registered in General Inventory"
      }
    ],
    "requiredPermissions": [
      "procurement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/procurement/page.tsx",
      "componentEntry": "components/procurement",
      "typeDefinition": "types/procurement.ts",
      "mockStore": "lib/mock/procurementData.ts",
      "testSuite": "tests/procurement.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter procurement & orders entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 164
  },
  {
    "id": "sub_procurement_overview",
    "navId": "nav-procurement-overview",
    "name": "Procurement Overview",
    "code": "PROCUREMENT_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for procurement overview under Procurement & Orders.",
    "category": "procurement_orders",
    "macroCategory": "administration",
    "parentId": "mod_procurement",
    "href": "/procurement",
    "routes": [
      "/procurement"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/procurement/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_procurement",
        "type": "required",
        "description": "Submodule requires parent module Procurement & Orders to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "procurement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/procurement/page.tsx",
      "componentEntry": "components/procurement",
      "typeDefinition": "types/procurement.ts",
      "mockStore": "lib/mock/procurementData.ts",
      "testSuite": "tests/procurement.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute procurement overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: procurement.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 165
  },
  {
    "id": "sub_procurement_requests",
    "navId": "nav-procurement-requests",
    "name": "Purchase Requests",
    "code": "PROCUREMENT_REQUESTS",
    "description": "Dedicated submodule supporting specialized workflows for purchase requests under Procurement & Orders.",
    "category": "procurement_orders",
    "macroCategory": "administration",
    "parentId": "mod_procurement",
    "href": "/procurement/requests",
    "routes": [
      "/procurement/requests"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/procurement/requests/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_procurement",
        "type": "required",
        "description": "Submodule requires parent module Procurement & Orders to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "procurement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/procurement/requests/page.tsx",
      "componentEntry": "components/procurement",
      "typeDefinition": "types/procurement.ts",
      "mockStore": "lib/mock/procurementData.ts",
      "testSuite": "tests/procurement.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute purchase requests operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: procurement.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 166
  },
  {
    "id": "sub_procurement_approvals",
    "navId": "nav-procurement-approvals",
    "name": "Approval Queue",
    "code": "PROCUREMENT_APPROVALS",
    "description": "Dedicated submodule supporting specialized workflows for approval queue under Procurement & Orders.",
    "category": "procurement_orders",
    "macroCategory": "administration",
    "parentId": "mod_procurement",
    "href": "/procurement/approvals",
    "routes": [
      "/procurement/approvals"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/procurement/approvals/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_procurement",
        "type": "required",
        "description": "Submodule requires parent module Procurement & Orders to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "procurement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/procurement/approvals/page.tsx",
      "componentEntry": "components/procurement",
      "typeDefinition": "types/procurement.ts",
      "mockStore": "lib/mock/procurementData.ts",
      "testSuite": "tests/procurement.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute approval queue operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: procurement.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 167
  },
  {
    "id": "sub_procurement_suppliers",
    "navId": "nav-procurement-suppliers",
    "name": "Supplier Directory",
    "code": "PROCUREMENT_SUPPLIERS",
    "description": "Dedicated submodule supporting specialized workflows for supplier directory under Procurement & Orders.",
    "category": "procurement_orders",
    "macroCategory": "administration",
    "parentId": "mod_procurement",
    "href": "/procurement/suppliers",
    "routes": [
      "/procurement/suppliers"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/procurement/suppliers/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_procurement",
        "type": "required",
        "description": "Submodule requires parent module Procurement & Orders to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "procurement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/procurement/suppliers/page.tsx",
      "componentEntry": "components/procurement",
      "typeDefinition": "types/procurement.ts",
      "mockStore": "lib/mock/procurementData.ts",
      "testSuite": "tests/procurement.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute supplier directory operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: procurement.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 168
  },
  {
    "id": "sub_procurement_orders",
    "navId": "nav-procurement-orders",
    "name": "Purchase Orders",
    "code": "PROCUREMENT_ORDERS",
    "description": "Dedicated submodule supporting specialized workflows for purchase orders under Procurement & Orders.",
    "category": "procurement_orders",
    "macroCategory": "administration",
    "parentId": "mod_procurement",
    "href": "/procurement/purchase-orders",
    "routes": [
      "/procurement/purchase-orders"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/procurement/purchase-orders/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_procurement",
        "type": "required",
        "description": "Submodule requires parent module Procurement & Orders to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "procurement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/procurement/purchase-orders/page.tsx",
      "componentEntry": "components/procurement",
      "typeDefinition": "types/procurement.ts",
      "mockStore": "lib/mock/procurementData.ts",
      "testSuite": "tests/procurement.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute purchase orders operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: procurement.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 169
  },
  {
    "id": "sub_procurement_receipts",
    "navId": "nav-procurement-receipts",
    "name": "Goods Receipt (GRN)",
    "code": "PROCUREMENT_RECEIPTS",
    "description": "Dedicated submodule supporting specialized workflows for goods receipt (grn) under Procurement & Orders.",
    "category": "procurement_orders",
    "macroCategory": "administration",
    "parentId": "mod_procurement",
    "href": "/procurement/receipts",
    "routes": [
      "/procurement/receipts"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/procurement/receipts/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_procurement",
        "type": "required",
        "description": "Submodule requires parent module Procurement & Orders to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "procurement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/procurement/receipts/page.tsx",
      "componentEntry": "components/procurement",
      "typeDefinition": "types/procurement.ts",
      "mockStore": "lib/mock/procurementData.ts",
      "testSuite": "tests/procurement.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute goods receipt (grn) operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: procurement.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 170
  },
  {
    "id": "sub_procurement_reports",
    "navId": "nav-procurement-reports",
    "name": "Spend & Vendor Reports",
    "code": "PROCUREMENT_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for spend & vendor reports under Procurement & Orders.",
    "category": "procurement_orders",
    "macroCategory": "administration",
    "parentId": "mod_procurement",
    "href": "/procurement/reports",
    "routes": [
      "/procurement/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/procurement/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_procurement",
        "type": "required",
        "description": "Submodule requires parent module Procurement & Orders to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "procurement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/procurement/reports/page.tsx",
      "componentEntry": "components/procurement",
      "typeDefinition": "types/procurement.ts",
      "mockStore": "lib/mock/procurementData.ts",
      "testSuite": "tests/procurement.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute spend & vendor reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: procurement.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 171
  },
  {
    "id": "sub_procurement_settings",
    "navId": "nav-procurement-settings",
    "name": "Procurement Policies",
    "code": "PROCUREMENT_SETTINGS",
    "description": "Dedicated submodule supporting specialized workflows for procurement policies under Procurement & Orders.",
    "category": "procurement_orders",
    "macroCategory": "administration",
    "parentId": "mod_procurement",
    "href": "/procurement/settings",
    "routes": [
      "/procurement/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/procurement/settings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_procurement",
        "type": "required",
        "description": "Submodule requires parent module Procurement & Orders to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "procurement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/procurement/settings/page.tsx",
      "componentEntry": "components/procurement",
      "typeDefinition": "types/procurement.ts",
      "mockStore": "lib/mock/procurementData.ts",
      "testSuite": "tests/procurement.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute procurement policies operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: procurement.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 172
  },
  {
    "id": "mod_transport",
    "navId": "nav-transport",
    "name": "Transport & Routes",
    "code": "TRANSPORT",
    "description": "Full-spectrum tenant module for transport & routes operations, data management, and user workflows.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "href": "/transport",
    "routes": [
      "/transport"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Bus route subscriptions and daily boarding manifests enroll students"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter transport & routes entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 173
  },
  {
    "id": "sub_transport_overview",
    "navId": "nav-transport-overview",
    "name": "Transport Overview",
    "code": "TRANSPORT_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for transport overview under Transport & Routes.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "parentId": "mod_transport",
    "href": "/transport",
    "routes": [
      "/transport",
      "/transport/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/transport/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_transport",
        "type": "required",
        "description": "Submodule requires parent module Transport & Routes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute transport overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: transport.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 174
  },
  {
    "id": "sub_transport_vehicles",
    "navId": "nav-transport-vehicles",
    "name": "Fleet & Vehicles",
    "code": "TRANSPORT_VEHICLES",
    "description": "Dedicated submodule supporting specialized workflows for fleet & vehicles under Transport & Routes.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "parentId": "mod_transport",
    "href": "/transport/vehicles",
    "routes": [
      "/transport/vehicles"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/transport/vehicles/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_transport",
        "type": "required",
        "description": "Submodule requires parent module Transport & Routes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/vehicles/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute fleet & vehicles operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: transport.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 175
  },
  {
    "id": "sub_transport_drivers",
    "navId": "nav-transport-drivers",
    "name": "Drivers & Monitors",
    "code": "TRANSPORT_DRIVERS",
    "description": "Dedicated submodule supporting specialized workflows for drivers & monitors under Transport & Routes.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "parentId": "mod_transport",
    "href": "/transport/drivers",
    "routes": [
      "/transport/drivers"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/transport/drivers/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_transport",
        "type": "required",
        "description": "Submodule requires parent module Transport & Routes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/drivers/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute drivers & monitors operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: transport.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 176
  },
  {
    "id": "sub_transport_routes",
    "navId": "nav-transport-routes",
    "name": "Routes & Stops",
    "code": "TRANSPORT_ROUTES",
    "description": "Dedicated submodule supporting specialized workflows for routes & stops under Transport & Routes.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "parentId": "mod_transport",
    "href": "/transport/routes",
    "routes": [
      "/transport/routes"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/transport/routes/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_transport",
        "type": "required",
        "description": "Submodule requires parent module Transport & Routes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/routes/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute routes & stops operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: transport.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 177
  },
  {
    "id": "sub_transport_enrollments",
    "navId": "nav-transport-enrollments",
    "name": "Student Subscriptions",
    "code": "TRANSPORT_ENROLLMENTS",
    "description": "Dedicated submodule supporting specialized workflows for student subscriptions under Transport & Routes.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "parentId": "mod_transport",
    "href": "/transport/enrollments",
    "routes": [
      "/transport/enrollments"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/transport/enrollments/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_transport",
        "type": "required",
        "description": "Submodule requires parent module Transport & Routes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/enrollments/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute student subscriptions operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: transport.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 178
  },
  {
    "id": "sub_transport_capacity",
    "navId": "nav-transport-capacity",
    "name": "Route Capacity",
    "code": "TRANSPORT_CAPACITY",
    "description": "Dedicated submodule supporting specialized workflows for route capacity under Transport & Routes.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "parentId": "mod_transport",
    "href": "/transport/capacity",
    "routes": [
      "/transport/capacity"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/transport/capacity/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_transport",
        "type": "required",
        "description": "Submodule requires parent module Transport & Routes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/capacity/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute route capacity operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: transport.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 179
  },
  {
    "id": "sub_transport_trips",
    "navId": "nav-transport-trips",
    "name": "Daily Trips & Dispatch",
    "code": "TRANSPORT_TRIPS",
    "description": "Dedicated submodule supporting specialized workflows for daily trips & dispatch under Transport & Routes.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "parentId": "mod_transport",
    "href": "/transport/trips",
    "routes": [
      "/transport/trips"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/transport/trips/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_transport",
        "type": "required",
        "description": "Submodule requires parent module Transport & Routes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/trips/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute daily trips & dispatch operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: transport.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 180
  },
  {
    "id": "sub_transport_boarding",
    "navId": "nav-transport-boarding",
    "name": "Boarding Manifest",
    "code": "TRANSPORT_BOARDING",
    "description": "Dedicated submodule supporting specialized workflows for boarding manifest under Transport & Routes.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "parentId": "mod_transport",
    "href": "/transport/boarding",
    "routes": [
      "/transport/boarding"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/transport/boarding/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_transport",
        "type": "required",
        "description": "Submodule requires parent module Transport & Routes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/boarding/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute boarding manifest operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: transport.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 181
  },
  {
    "id": "sub_transport_maintenance",
    "navId": "nav-transport-maintenance",
    "name": "Fleet Maintenance",
    "code": "TRANSPORT_MAINTENANCE",
    "description": "Dedicated submodule supporting specialized workflows for fleet maintenance under Transport & Routes.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "parentId": "mod_transport",
    "href": "/transport/maintenance",
    "routes": [
      "/transport/maintenance"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/transport/maintenance/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_transport",
        "type": "required",
        "description": "Submodule requires parent module Transport & Routes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/maintenance/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute fleet maintenance operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: transport.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 182
  },
  {
    "id": "sub_transport_fees",
    "navId": "nav-transport-fees",
    "name": "Transport Fees",
    "code": "TRANSPORT_FEES",
    "description": "Dedicated submodule supporting specialized workflows for transport fees under Transport & Routes.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "parentId": "mod_transport",
    "href": "/transport/fees",
    "routes": [
      "/transport/fees"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/transport/fees/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_transport",
        "type": "required",
        "description": "Submodule requires parent module Transport & Routes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/fees/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute transport fees operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: transport.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 183
  },
  {
    "id": "sub_transport_incidents",
    "navId": "nav-transport-incidents",
    "name": "Safety & Incidents",
    "code": "TRANSPORT_INCIDENTS",
    "description": "Dedicated submodule supporting specialized workflows for safety & incidents under Transport & Routes.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "parentId": "mod_transport",
    "href": "/transport/incidents",
    "routes": [
      "/transport/incidents"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/transport/incidents/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_transport",
        "type": "required",
        "description": "Submodule requires parent module Transport & Routes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/incidents/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute safety & incidents operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: transport.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 184
  },
  {
    "id": "sub_transport_reports",
    "navId": "nav-transport-reports",
    "name": "Transport Reports",
    "code": "TRANSPORT_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for transport reports under Transport & Routes.",
    "category": "transport_fleet",
    "macroCategory": "administration",
    "parentId": "mod_transport",
    "href": "/transport/reports",
    "routes": [
      "/transport/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/transport/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_transport",
        "type": "required",
        "description": "Submodule requires parent module Transport & Routes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "transport.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/transport/reports/page.tsx",
      "componentEntry": "components/transport",
      "typeDefinition": "types/transport.ts",
      "mockStore": "lib/mock/transportData.ts",
      "testSuite": "tests/transport.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute transport reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: transport.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 185
  },
  {
    "id": "mod_hostel",
    "navId": "nav-hostel",
    "name": "Hostel & Boarding",
    "code": "HOSTEL",
    "description": "Full-spectrum tenant module for hostel & boarding operations, data management, and user workflows.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "href": "/hostel",
    "routes": [
      "/hostel"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Hostel rooms, beds, and residential roll calls allocate students"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter hostel & boarding entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 186
  },
  {
    "id": "sub_hostel_overview",
    "navId": "nav-hostel-overview",
    "name": "Hostel Overview",
    "code": "HOSTEL_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for hostel overview under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel",
    "routes": [
      "/hostel"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute hostel overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 187
  },
  {
    "id": "sub_hostel_buildings",
    "navId": "nav-hostel-buildings",
    "name": "Buildings & Blocks",
    "code": "HOSTEL_BUILDINGS",
    "description": "Dedicated submodule supporting specialized workflows for buildings & blocks under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/buildings",
    "routes": [
      "/hostel/buildings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/buildings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/buildings/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute buildings & blocks operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 188
  },
  {
    "id": "sub_hostel_rooms",
    "navId": "nav-hostel-rooms",
    "name": "Rooms & Beds",
    "code": "HOSTEL_ROOMS",
    "description": "Dedicated submodule supporting specialized workflows for rooms & beds under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/rooms",
    "routes": [
      "/hostel/rooms"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/rooms/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/rooms/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute rooms & beds operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 189
  },
  {
    "id": "sub_hostel_allocations",
    "navId": "nav-hostel-allocations",
    "name": "Room Allocations",
    "code": "HOSTEL_ALLOCATIONS",
    "description": "Dedicated submodule supporting specialized workflows for room allocations under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/allocations",
    "routes": [
      "/hostel/allocations"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/allocations/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/allocations/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute room allocations operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 190
  },
  {
    "id": "sub_hostel_waitlist",
    "navId": "nav-hostel-waitlist",
    "name": "Waiting List",
    "code": "HOSTEL_WAITLIST",
    "description": "Dedicated submodule supporting specialized workflows for waiting list under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/waitlist",
    "routes": [
      "/hostel/waitlist"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/waitlist/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/waitlist/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute waiting list operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 191
  },
  {
    "id": "sub_hostel_checkinout",
    "navId": "nav-hostel-checkinout",
    "name": "Check-In / Check-Out",
    "code": "HOSTEL_CHECKINOUT",
    "description": "Dedicated submodule supporting specialized workflows for check-in / check-out under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/check-in-out",
    "routes": [
      "/hostel/check-in-out"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/check-in-out/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/check-in-out/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute check-in / check-out operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 192
  },
  {
    "id": "sub_hostel_attendance",
    "navId": "nav-hostel-attendance",
    "name": "Residential Roll Call",
    "code": "HOSTEL_ATTENDANCE",
    "description": "Dedicated submodule supporting specialized workflows for residential roll call under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/attendance",
    "routes": [
      "/hostel/attendance"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/attendance/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/attendance/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute residential roll call operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 193
  },
  {
    "id": "sub_hostel_leave",
    "navId": "nav-hostel-leave",
    "name": "Leave Passes & Exeats",
    "code": "HOSTEL_LEAVE",
    "description": "Dedicated submodule supporting specialized workflows for leave passes & exeats under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/leave-passes",
    "routes": [
      "/hostel/leave-passes"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/leave-passes/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/leave-passes/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute leave passes & exeats operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 194
  },
  {
    "id": "sub_hostel_visitors",
    "navId": "nav-hostel-visitors",
    "name": "Visitor Register",
    "code": "HOSTEL_VISITORS",
    "description": "Dedicated submodule supporting specialized workflows for visitor register under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/visitors",
    "routes": [
      "/hostel/visitors"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/visitors/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/visitors/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute visitor register operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 195
  },
  {
    "id": "sub_hostel_inspections",
    "navId": "nav-hostel-inspections",
    "name": "Room Inspections",
    "code": "HOSTEL_INSPECTIONS",
    "description": "Dedicated submodule supporting specialized workflows for room inspections under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/inspections",
    "routes": [
      "/hostel/inspections"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/inspections/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/inspections/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute room inspections operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 196
  },
  {
    "id": "sub_hostel_maintenance",
    "navId": "nav-hostel-maintenance",
    "name": "Hostel Maintenance",
    "code": "HOSTEL_MAINTENANCE",
    "description": "Dedicated submodule supporting specialized workflows for hostel maintenance under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/maintenance",
    "routes": [
      "/hostel/maintenance"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/maintenance/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/maintenance/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute hostel maintenance operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 197
  },
  {
    "id": "sub_hostel_incidents",
    "navId": "nav-hostel-incidents",
    "name": "Welfare & Incidents",
    "code": "HOSTEL_INCIDENTS",
    "description": "Dedicated submodule supporting specialized workflows for welfare & incidents under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/incidents",
    "routes": [
      "/hostel/incidents"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/incidents/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/incidents/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute welfare & incidents operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 198
  },
  {
    "id": "sub_hostel_staff",
    "navId": "nav-hostel-staff",
    "name": "Wardens & Roster",
    "code": "HOSTEL_STAFF",
    "description": "Dedicated submodule supporting specialized workflows for wardens & roster under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/staff",
    "routes": [
      "/hostel/staff"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/staff/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/staff/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute wardens & roster operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 199
  },
  {
    "id": "sub_hostel_fees",
    "navId": "nav-hostel-fees",
    "name": "Boarding Fees",
    "code": "HOSTEL_FEES",
    "description": "Dedicated submodule supporting specialized workflows for boarding fees under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/fees",
    "routes": [
      "/hostel/fees"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/fees/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/fees/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute boarding fees operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 200
  },
  {
    "id": "sub_hostel_reports",
    "navId": "nav-hostel-reports",
    "name": "Hostel Reports",
    "code": "HOSTEL_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for hostel reports under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/reports",
    "routes": [
      "/hostel/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/reports/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute hostel reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 201
  },
  {
    "id": "sub_hostel_settings",
    "navId": "nav-hostel-settings",
    "name": "Hostel Settings",
    "code": "HOSTEL_SETTINGS",
    "description": "Dedicated submodule supporting specialized workflows for hostel settings under Hostel & Boarding.",
    "category": "hostel_residential",
    "macroCategory": "administration",
    "parentId": "mod_hostel",
    "href": "/hostel/settings",
    "routes": [
      "/hostel/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/hostel/settings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_hostel",
        "type": "required",
        "description": "Submodule requires parent module Hostel & Boarding to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "hostel.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/hostel/settings/page.tsx",
      "componentEntry": "components/hostel",
      "typeDefinition": "types/hostel.ts",
      "mockStore": "lib/mock/hostelData.ts",
      "testSuite": "tests/hostel.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute hostel settings operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: hostel.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 202
  },
  {
    "id": "mod_cafeteria",
    "navId": "nav-cafeteria",
    "name": "Cafeteria & Dining",
    "code": "CAFETERIA",
    "description": "Full-spectrum tenant module for cafeteria & dining operations, data management, and user workflows.",
    "category": "cafeteria_dining",
    "macroCategory": "administration",
    "href": "/cafeteria",
    "routes": [
      "/cafeteria"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Meal plans and POS dining checkouts link to student wallets"
      }
    ],
    "requiredPermissions": [
      "cafeteria.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/cafeteria/page.tsx",
      "componentEntry": "components/cafeteria",
      "typeDefinition": "types/cafeteria.ts",
      "mockStore": "lib/mock/cafeteriaData.ts",
      "testSuite": "tests/cafeteria.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter cafeteria & dining entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 203
  },
  {
    "id": "sub_cafeteria_overview",
    "navId": "nav-cafeteria-overview",
    "name": "Cafeteria Overview",
    "code": "CAFETERIA_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for cafeteria overview under Cafeteria & Dining.",
    "category": "cafeteria_dining",
    "macroCategory": "administration",
    "parentId": "mod_cafeteria",
    "href": "/cafeteria",
    "routes": [
      "/cafeteria"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/cafeteria/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_cafeteria",
        "type": "required",
        "description": "Submodule requires parent module Cafeteria & Dining to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "cafeteria.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/cafeteria/page.tsx",
      "componentEntry": "components/cafeteria",
      "typeDefinition": "types/cafeteria.ts",
      "mockStore": "lib/mock/cafeteriaData.ts",
      "testSuite": "tests/cafeteria.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute cafeteria overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: cafeteria.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 204
  },
  {
    "id": "sub_cafeteria_menus",
    "navId": "nav-cafeteria-menus",
    "name": "Menu Management",
    "code": "CAFETERIA_MENUS",
    "description": "Dedicated submodule supporting specialized workflows for menu management under Cafeteria & Dining.",
    "category": "cafeteria_dining",
    "macroCategory": "administration",
    "parentId": "mod_cafeteria",
    "href": "/cafeteria/menus",
    "routes": [
      "/cafeteria/menus"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/cafeteria/menus/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_cafeteria",
        "type": "required",
        "description": "Submodule requires parent module Cafeteria & Dining to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "cafeteria.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/cafeteria/menus/page.tsx",
      "componentEntry": "components/cafeteria",
      "typeDefinition": "types/cafeteria.ts",
      "mockStore": "lib/mock/cafeteriaData.ts",
      "testSuite": "tests/cafeteria.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute menu management operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: cafeteria.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 205
  },
  {
    "id": "sub_cafeteria_schedules",
    "navId": "nav-cafeteria-schedules",
    "name": "Meal Schedules",
    "code": "CAFETERIA_SCHEDULES",
    "description": "Dedicated submodule supporting specialized workflows for meal schedules under Cafeteria & Dining.",
    "category": "cafeteria_dining",
    "macroCategory": "administration",
    "parentId": "mod_cafeteria",
    "href": "/cafeteria/schedules",
    "routes": [
      "/cafeteria/schedules"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/cafeteria/schedules/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_cafeteria",
        "type": "required",
        "description": "Submodule requires parent module Cafeteria & Dining to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "cafeteria.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/cafeteria/schedules/page.tsx",
      "componentEntry": "components/cafeteria",
      "typeDefinition": "types/cafeteria.ts",
      "mockStore": "lib/mock/cafeteriaData.ts",
      "testSuite": "tests/cafeteria.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute meal schedules operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: cafeteria.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 206
  },
  {
    "id": "sub_cafeteria_orders",
    "navId": "nav-cafeteria-orders",
    "name": "Orders & Service",
    "code": "CAFETERIA_ORDERS",
    "description": "Dedicated submodule supporting specialized workflows for orders & service under Cafeteria & Dining.",
    "category": "cafeteria_dining",
    "macroCategory": "administration",
    "parentId": "mod_cafeteria",
    "href": "/cafeteria/orders",
    "routes": [
      "/cafeteria/orders"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/cafeteria/orders/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_cafeteria",
        "type": "required",
        "description": "Submodule requires parent module Cafeteria & Dining to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "cafeteria.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/cafeteria/orders/page.tsx",
      "componentEntry": "components/cafeteria",
      "typeDefinition": "types/cafeteria.ts",
      "mockStore": "lib/mock/cafeteriaData.ts",
      "testSuite": "tests/cafeteria.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute orders & service operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: cafeteria.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 207
  },
  {
    "id": "sub_cafeteria_inventory",
    "navId": "nav-cafeteria-inventory",
    "name": "Food Inventory",
    "code": "CAFETERIA_INVENTORY",
    "description": "Dedicated submodule supporting specialized workflows for food inventory under Cafeteria & Dining.",
    "category": "cafeteria_dining",
    "macroCategory": "administration",
    "parentId": "mod_cafeteria",
    "href": "/cafeteria/inventory",
    "routes": [
      "/cafeteria/inventory"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/cafeteria/inventory/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_cafeteria",
        "type": "required",
        "description": "Submodule requires parent module Cafeteria & Dining to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "cafeteria.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/cafeteria/inventory/page.tsx",
      "componentEntry": "components/cafeteria",
      "typeDefinition": "types/cafeteria.ts",
      "mockStore": "lib/mock/cafeteriaData.ts",
      "testSuite": "tests/cafeteria.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute food inventory operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: cafeteria.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 208
  },
  {
    "id": "sub_cafeteria_dietary",
    "navId": "nav-cafeteria-dietary",
    "name": "Dietary & Allergens",
    "code": "CAFETERIA_DIETARY",
    "description": "Dedicated submodule supporting specialized workflows for dietary & allergens under Cafeteria & Dining.",
    "category": "cafeteria_dining",
    "macroCategory": "administration",
    "parentId": "mod_cafeteria",
    "href": "/cafeteria/dietary",
    "routes": [
      "/cafeteria/dietary"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/cafeteria/dietary/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_cafeteria",
        "type": "required",
        "description": "Submodule requires parent module Cafeteria & Dining to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "cafeteria.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/cafeteria/dietary/page.tsx",
      "componentEntry": "components/cafeteria",
      "typeDefinition": "types/cafeteria.ts",
      "mockStore": "lib/mock/cafeteriaData.ts",
      "testSuite": "tests/cafeteria.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute dietary & allergens operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: cafeteria.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 209
  },
  {
    "id": "sub_cafeteria_reports",
    "navId": "nav-cafeteria-reports",
    "name": "Cafeteria Reports",
    "code": "CAFETERIA_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for cafeteria reports under Cafeteria & Dining.",
    "category": "cafeteria_dining",
    "macroCategory": "administration",
    "parentId": "mod_cafeteria",
    "href": "/cafeteria/reports",
    "routes": [
      "/cafeteria/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/cafeteria/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_cafeteria",
        "type": "required",
        "description": "Submodule requires parent module Cafeteria & Dining to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "cafeteria.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/cafeteria/reports/page.tsx",
      "componentEntry": "components/cafeteria",
      "typeDefinition": "types/cafeteria.ts",
      "mockStore": "lib/mock/cafeteriaData.ts",
      "testSuite": "tests/cafeteria.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute cafeteria reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: cafeteria.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 210
  },
  {
    "id": "mod_health",
    "navId": "nav-health",
    "name": "Health & Infirmary",
    "code": "HEALTH",
    "description": "Full-spectrum tenant module for health & infirmary operations, data management, and user workflows.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "href": "/health",
    "routes": [
      "/health"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Infirmary visits, allergies, and MAR logs document student health"
      }
    ],
    "requiredPermissions": [
      "health.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter health & infirmary entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 211
  },
  {
    "id": "sub_health_dashboard",
    "navId": "nav-health-dashboard",
    "name": "Health Dashboard",
    "code": "HEALTH_DASHBOARD",
    "description": "Dedicated submodule supporting specialized workflows for health dashboard under Health & Infirmary.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "parentId": "mod_health",
    "href": "/health",
    "routes": [
      "/health"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/health/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_health",
        "type": "required",
        "description": "Submodule requires parent module Health & Infirmary to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "health.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute health dashboard operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: health.view"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 212
  },
  {
    "id": "sub_health_students",
    "navId": "nav-health-students",
    "name": "Student Profiles",
    "code": "HEALTH_STUDENTS",
    "description": "Dedicated submodule supporting specialized workflows for student profiles under Health & Infirmary.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "parentId": "mod_health",
    "href": "/health/students",
    "routes": [
      "/health/students",
      "/health/students/[studentId]",
      "/health/students/[studentId]/edit"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/health/students/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_health",
        "type": "required",
        "description": "Submodule requires parent module Health & Infirmary to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "health.profiles.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/students/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute student profiles operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: health.profiles.view"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 213
  },
  {
    "id": "sub_health_visits",
    "navId": "nav-health-visits",
    "name": "Clinic Visits",
    "code": "HEALTH_VISITS",
    "description": "Dedicated submodule supporting specialized workflows for clinic visits under Health & Infirmary.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "parentId": "mod_health",
    "href": "/health/visits",
    "routes": [
      "/health/visits",
      "/health/visits/[visitId]",
      "/health/visits/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/health/visits/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_health",
        "type": "required",
        "description": "Submodule requires parent module Health & Infirmary to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "health.visits.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/visits/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute clinic visits operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: health.visits.view"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 214
  },
  {
    "id": "sub_health_incidents",
    "navId": "nav-health-incidents",
    "name": "Health Incidents",
    "code": "HEALTH_INCIDENTS",
    "description": "Dedicated submodule supporting specialized workflows for health incidents under Health & Infirmary.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "parentId": "mod_health",
    "href": "/health/incidents",
    "routes": [
      "/health/incidents",
      "/health/incidents/[incidentId]",
      "/health/incidents/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/health/incidents/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_health",
        "type": "required",
        "description": "Submodule requires parent module Health & Infirmary to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "health.incidents.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/incidents/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute health incidents operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: health.incidents.view"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 215
  },
  {
    "id": "sub_health_medications",
    "navId": "nav-health-medications",
    "name": "Medication & MAR",
    "code": "HEALTH_MEDICATIONS",
    "description": "Dedicated submodule supporting specialized workflows for medication & mar under Health & Infirmary.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "parentId": "mod_health",
    "href": "/health/medications",
    "routes": [
      "/health/medications"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/health/medications/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_health",
        "type": "required",
        "description": "Submodule requires parent module Health & Infirmary to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "health.medications.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/medications/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute medication & mar operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: health.medications.view"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 216
  },
  {
    "id": "sub_health_alerts",
    "navId": "nav-health-alerts",
    "name": "Allergies & Alerts",
    "code": "HEALTH_ALERTS",
    "description": "Dedicated submodule supporting specialized workflows for allergies & alerts under Health & Infirmary.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "parentId": "mod_health",
    "href": "/health/alerts",
    "routes": [
      "/health/alerts"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/health/alerts/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_health",
        "type": "required",
        "description": "Submodule requires parent module Health & Infirmary to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "health.alerts.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/alerts/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute allergies & alerts operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: health.alerts.view"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 217
  },
  {
    "id": "sub_health_followups",
    "navId": "nav-health-followups",
    "name": "Follow-ups & Referrals",
    "code": "HEALTH_FOLLOWUPS",
    "description": "Dedicated submodule supporting specialized workflows for follow-ups & referrals under Health & Infirmary.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "parentId": "mod_health",
    "href": "/health/follow-ups",
    "routes": [
      "/health/follow-ups"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/health/follow-ups/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_health",
        "type": "required",
        "description": "Submodule requires parent module Health & Infirmary to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "health.followups.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/follow-ups/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute follow-ups & referrals operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: health.followups.manage"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 218
  },
  {
    "id": "sub_health_inventory",
    "navId": "nav-health-inventory",
    "name": "Medical Supplies",
    "code": "HEALTH_INVENTORY",
    "description": "Dedicated submodule supporting specialized workflows for medical supplies under Health & Infirmary.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "parentId": "mod_health",
    "href": "/health/inventory",
    "routes": [
      "/health/inventory"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/health/inventory/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_health",
        "type": "required",
        "description": "Submodule requires parent module Health & Infirmary to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "health.inventory.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/inventory/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute medical supplies operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: health.inventory.view"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 219
  },
  {
    "id": "sub_health_staff",
    "navId": "nav-health-staff",
    "name": "Health Personnel",
    "code": "HEALTH_STAFF",
    "description": "Dedicated submodule supporting specialized workflows for health personnel under Health & Infirmary.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "parentId": "mod_health",
    "href": "/health/staff",
    "routes": [
      "/health/staff"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/health/staff/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_health",
        "type": "required",
        "description": "Submodule requires parent module Health & Infirmary to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "health.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/staff/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute health personnel operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: health.view"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 220
  },
  {
    "id": "sub_health_reports",
    "navId": "nav-health-reports",
    "name": "Health Reports",
    "code": "HEALTH_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for health reports under Health & Infirmary.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "parentId": "mod_health",
    "href": "/health/reports",
    "routes": [
      "/health/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/health/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_health",
        "type": "required",
        "description": "Submodule requires parent module Health & Infirmary to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "health.reports.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/reports/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute health reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: health.reports.view"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 221
  },
  {
    "id": "sub_health_audit",
    "navId": "nav-health-audit",
    "name": "Access Audit Log",
    "code": "HEALTH_AUDIT",
    "description": "Dedicated submodule supporting specialized workflows for access audit log under Health & Infirmary.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "parentId": "mod_health",
    "href": "/health/audit",
    "routes": [
      "/health/audit"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/health/audit/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_health",
        "type": "required",
        "description": "Submodule requires parent module Health & Infirmary to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "health.audit.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/audit/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute access audit log operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: health.audit.view"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 222
  },
  {
    "id": "sub_health_settings",
    "navId": "nav-health-settings",
    "name": "Health Settings",
    "code": "HEALTH_SETTINGS",
    "description": "Dedicated submodule supporting specialized workflows for health settings under Health & Infirmary.",
    "category": "health_infirmary",
    "macroCategory": "administration",
    "parentId": "mod_health",
    "href": "/health/settings",
    "routes": [
      "/health/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/health/settings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_health",
        "type": "required",
        "description": "Submodule requires parent module Health & Infirmary to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "health.settings.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/health/settings/page.tsx",
      "componentEntry": "components/health",
      "typeDefinition": "types/health.ts",
      "mockStore": "lib/mock/healthData.ts",
      "testSuite": "tests/health.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute health settings operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: health.settings.manage"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 223
  },
  {
    "id": "mod_behaviour",
    "navId": "nav-behaviour",
    "name": "Behaviour & Discipline",
    "code": "BEHAVIOUR",
    "description": "Full-spectrum tenant module for behaviour & discipline operations, data management, and user workflows.",
    "category": "behaviour_discipline",
    "macroCategory": "administration",
    "href": "/behaviour",
    "routes": [
      "/behaviour"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Disciplinary incidents, points, and support plans record on student files"
      }
    ],
    "requiredPermissions": [
      "behaviour.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/behaviour/page.tsx",
      "componentEntry": "components/behaviour",
      "typeDefinition": "types/behaviour.ts",
      "mockStore": "lib/mock/behaviourData.ts",
      "testSuite": "tests/behaviour.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter behaviour & discipline entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 224
  },
  {
    "id": "sub_behaviour_dashboard",
    "navId": "nav-behaviour-dashboard",
    "name": "Behaviour Overview",
    "code": "BEHAVIOUR_DASHBOARD",
    "description": "Dedicated submodule supporting specialized workflows for behaviour overview under Behaviour & Discipline.",
    "category": "behaviour_discipline",
    "macroCategory": "administration",
    "parentId": "mod_behaviour",
    "href": "/behaviour",
    "routes": [
      "/behaviour"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/behaviour/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_behaviour",
        "type": "required",
        "description": "Submodule requires parent module Behaviour & Discipline to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "behaviour.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/behaviour/page.tsx",
      "componentEntry": "components/behaviour",
      "typeDefinition": "types/behaviour.ts",
      "mockStore": "lib/mock/behaviourData.ts",
      "testSuite": "tests/behaviour.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute behaviour overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: behaviour.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 225
  },
  {
    "id": "sub_behaviour_incidents",
    "navId": "nav-behaviour-incidents",
    "name": "Incidents",
    "code": "BEHAVIOUR_INCIDENTS",
    "description": "Dedicated submodule supporting specialized workflows for incidents under Behaviour & Discipline.",
    "category": "behaviour_discipline",
    "macroCategory": "administration",
    "parentId": "mod_behaviour",
    "href": "/behaviour/incidents",
    "routes": [
      "/behaviour/incidents",
      "/behaviour/incidents/[incidentId]",
      "/behaviour/incidents/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/behaviour/incidents/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_behaviour",
        "type": "required",
        "description": "Submodule requires parent module Behaviour & Discipline to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "behaviour.incidents.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/behaviour/incidents/page.tsx",
      "componentEntry": "components/behaviour",
      "typeDefinition": "types/behaviour.ts",
      "mockStore": "lib/mock/behaviourData.ts",
      "testSuite": "tests/behaviour.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute incidents operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: behaviour.incidents.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 226
  },
  {
    "id": "sub_behaviour_cases",
    "navId": "nav-behaviour-cases",
    "name": "Disciplinary Cases",
    "code": "BEHAVIOUR_CASES",
    "description": "Dedicated submodule supporting specialized workflows for disciplinary cases under Behaviour & Discipline.",
    "category": "behaviour_discipline",
    "macroCategory": "administration",
    "parentId": "mod_behaviour",
    "href": "/behaviour/cases",
    "routes": [
      "/behaviour/cases",
      "/behaviour/cases/[caseId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/behaviour/cases/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_behaviour",
        "type": "required",
        "description": "Submodule requires parent module Behaviour & Discipline to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "behaviour.cases.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/behaviour/cases/page.tsx",
      "componentEntry": "components/behaviour",
      "typeDefinition": "types/behaviour.ts",
      "mockStore": "lib/mock/behaviourData.ts",
      "testSuite": "tests/behaviour.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute disciplinary cases operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: behaviour.cases.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 227
  },
  {
    "id": "sub_behaviour_actions",
    "navId": "nav-behaviour-actions",
    "name": "Actions & Interventions",
    "code": "BEHAVIOUR_ACTIONS",
    "description": "Dedicated submodule supporting specialized workflows for actions & interventions under Behaviour & Discipline.",
    "category": "behaviour_discipline",
    "macroCategory": "administration",
    "parentId": "mod_behaviour",
    "href": "/behaviour/actions",
    "routes": [
      "/behaviour/actions"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/behaviour/actions/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_behaviour",
        "type": "required",
        "description": "Submodule requires parent module Behaviour & Discipline to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "behaviour.actions.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/behaviour/actions/page.tsx",
      "componentEntry": "components/behaviour",
      "typeDefinition": "types/behaviour.ts",
      "mockStore": "lib/mock/behaviourData.ts",
      "testSuite": "tests/behaviour.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute actions & interventions operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: behaviour.actions.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 228
  },
  {
    "id": "sub_behaviour_recognition",
    "navId": "nav-behaviour-recognition",
    "name": "Positive Recognition",
    "code": "BEHAVIOUR_RECOGNITION",
    "description": "Dedicated submodule supporting specialized workflows for positive recognition under Behaviour & Discipline.",
    "category": "behaviour_discipline",
    "macroCategory": "administration",
    "parentId": "mod_behaviour",
    "href": "/behaviour/recognition",
    "routes": [
      "/behaviour/recognition"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/behaviour/recognition/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_behaviour",
        "type": "required",
        "description": "Submodule requires parent module Behaviour & Discipline to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "behaviour.recognition.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/behaviour/recognition/page.tsx",
      "componentEntry": "components/behaviour",
      "typeDefinition": "types/behaviour.ts",
      "mockStore": "lib/mock/behaviourData.ts",
      "testSuite": "tests/behaviour.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute positive recognition operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: behaviour.recognition.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 229
  },
  {
    "id": "sub_behaviour_rewards",
    "navId": "nav-behaviour-rewards",
    "name": "Rewards & Points",
    "code": "BEHAVIOUR_REWARDS",
    "description": "Dedicated submodule supporting specialized workflows for rewards & points under Behaviour & Discipline.",
    "category": "behaviour_discipline",
    "macroCategory": "administration",
    "parentId": "mod_behaviour",
    "href": "/behaviour/rewards",
    "routes": [
      "/behaviour/rewards"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/behaviour/rewards/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_behaviour",
        "type": "required",
        "description": "Submodule requires parent module Behaviour & Discipline to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "behaviour.rewards.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/behaviour/rewards/page.tsx",
      "componentEntry": "components/behaviour",
      "typeDefinition": "types/behaviour.ts",
      "mockStore": "lib/mock/behaviourData.ts",
      "testSuite": "tests/behaviour.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute rewards & points operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: behaviour.rewards.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 230
  },
  {
    "id": "sub_behaviour_support_plans",
    "navId": "nav-behaviour-support-plans",
    "name": "Support Plans",
    "code": "BEHAVIOUR_SUPPORT_PLANS",
    "description": "Dedicated submodule supporting specialized workflows for support plans under Behaviour & Discipline.",
    "category": "behaviour_discipline",
    "macroCategory": "administration",
    "parentId": "mod_behaviour",
    "href": "/behaviour/support-plans",
    "routes": [
      "/behaviour/support-plans"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/behaviour/support-plans/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_behaviour",
        "type": "required",
        "description": "Submodule requires parent module Behaviour & Discipline to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "behaviour.support_plans.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/behaviour/support-plans/page.tsx",
      "componentEntry": "components/behaviour",
      "typeDefinition": "types/behaviour.ts",
      "mockStore": "lib/mock/behaviourData.ts",
      "testSuite": "tests/behaviour.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute support plans operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: behaviour.support_plans.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 231
  },
  {
    "id": "sub_behaviour_referrals",
    "navId": "nav-behaviour-referrals",
    "name": "Counselling Referrals",
    "code": "BEHAVIOUR_REFERRALS",
    "description": "Dedicated submodule supporting specialized workflows for counselling referrals under Behaviour & Discipline.",
    "category": "behaviour_discipline",
    "macroCategory": "administration",
    "parentId": "mod_behaviour",
    "href": "/behaviour/referrals",
    "routes": [
      "/behaviour/referrals"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/behaviour/referrals/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_behaviour",
        "type": "required",
        "description": "Submodule requires parent module Behaviour & Discipline to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "behaviour.referrals.create"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/behaviour/referrals/page.tsx",
      "componentEntry": "components/behaviour",
      "typeDefinition": "types/behaviour.ts",
      "mockStore": "lib/mock/behaviourData.ts",
      "testSuite": "tests/behaviour.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute counselling referrals operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: behaviour.referrals.create"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 232
  },
  {
    "id": "sub_behaviour_meetings",
    "navId": "nav-behaviour-meetings",
    "name": "Guardian Meetings",
    "code": "BEHAVIOUR_MEETINGS",
    "description": "Dedicated submodule supporting specialized workflows for guardian meetings under Behaviour & Discipline.",
    "category": "behaviour_discipline",
    "macroCategory": "administration",
    "parentId": "mod_behaviour",
    "href": "/behaviour/meetings",
    "routes": [
      "/behaviour/meetings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/behaviour/meetings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_behaviour",
        "type": "required",
        "description": "Submodule requires parent module Behaviour & Discipline to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "behaviour.meetings.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/behaviour/meetings/page.tsx",
      "componentEntry": "components/behaviour",
      "typeDefinition": "types/behaviour.ts",
      "mockStore": "lib/mock/behaviourData.ts",
      "testSuite": "tests/behaviour.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute guardian meetings operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: behaviour.meetings.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 233
  },
  {
    "id": "sub_behaviour_reports",
    "navId": "nav-behaviour-reports",
    "name": "Behaviour Reports",
    "code": "BEHAVIOUR_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for behaviour reports under Behaviour & Discipline.",
    "category": "behaviour_discipline",
    "macroCategory": "administration",
    "parentId": "mod_behaviour",
    "href": "/behaviour/reports",
    "routes": [
      "/behaviour/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/behaviour/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_behaviour",
        "type": "required",
        "description": "Submodule requires parent module Behaviour & Discipline to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "behaviour.reports.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/behaviour/reports/page.tsx",
      "componentEntry": "components/behaviour",
      "typeDefinition": "types/behaviour.ts",
      "mockStore": "lib/mock/behaviourData.ts",
      "testSuite": "tests/behaviour.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute behaviour reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: behaviour.reports.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 234
  },
  {
    "id": "mod_safeguarding",
    "navId": "nav-safeguarding",
    "name": "Safeguarding (DSL)",
    "code": "SAFEGUARDING",
    "description": "Full-spectrum tenant module for safeguarding (dsl) operations, data management, and user workflows.",
    "category": "safeguarding_dsl",
    "macroCategory": "administration",
    "href": "/safeguarding",
    "routes": [
      "/safeguarding"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Protective welfare concerns and DSL case files monitor students"
      }
    ],
    "requiredPermissions": [
      "safeguarding.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/safeguarding/page.tsx",
      "componentEntry": "components/safeguarding",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter safeguarding (dsl) entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 235
  },
  {
    "id": "sub_safeguarding_overview",
    "navId": "nav-safeguarding-overview",
    "name": "Safeguarding Overview",
    "code": "SAFEGUARDING_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for safeguarding overview under Safeguarding (DSL).",
    "category": "safeguarding_dsl",
    "macroCategory": "administration",
    "parentId": "mod_safeguarding",
    "href": "/safeguarding",
    "routes": [
      "/safeguarding"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/safeguarding/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_safeguarding",
        "type": "required",
        "description": "Submodule requires parent module Safeguarding (DSL) to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "safeguarding.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/safeguarding/page.tsx",
      "componentEntry": "components/safeguarding",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute safeguarding overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: safeguarding.view"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 236
  },
  {
    "id": "sub_safeguarding_concerns",
    "navId": "nav-safeguarding-concerns",
    "name": "Protective Concerns",
    "code": "SAFEGUARDING_CONCERNS",
    "description": "Dedicated submodule supporting specialized workflows for protective concerns under Safeguarding (DSL).",
    "category": "safeguarding_dsl",
    "macroCategory": "administration",
    "parentId": "mod_safeguarding",
    "href": "/safeguarding/concerns",
    "routes": [
      "/safeguarding/concerns",
      "/safeguarding/concerns/[concernId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/safeguarding/concerns/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_safeguarding",
        "type": "required",
        "description": "Submodule requires parent module Safeguarding (DSL) to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "safeguarding.concerns.view_restricted"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/safeguarding/concerns/page.tsx",
      "componentEntry": "components/safeguarding",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute protective concerns operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: safeguarding.concerns.view_restricted"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 237
  },
  {
    "id": "sub_safeguarding_report",
    "navId": "nav-safeguarding-report",
    "name": "Report Concern",
    "code": "SAFEGUARDING_REPORT",
    "description": "Dedicated submodule supporting specialized workflows for report concern under Safeguarding (DSL).",
    "category": "safeguarding_dsl",
    "macroCategory": "administration",
    "parentId": "mod_safeguarding",
    "href": "/safeguarding/concerns/new",
    "routes": [
      "/safeguarding/concerns/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/safeguarding/concerns/new/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_safeguarding",
        "type": "required",
        "description": "Submodule requires parent module Safeguarding (DSL) to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "safeguarding.concerns.create"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/safeguarding/concerns/new/page.tsx",
      "componentEntry": "components/safeguarding",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute report concern operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: safeguarding.concerns.create"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 238
  },
  {
    "id": "sub_safeguarding_actions",
    "navId": "nav-safeguarding-actions",
    "name": "Protective Actions",
    "code": "SAFEGUARDING_ACTIONS",
    "description": "Dedicated submodule supporting specialized workflows for protective actions under Safeguarding (DSL).",
    "category": "safeguarding_dsl",
    "macroCategory": "administration",
    "parentId": "mod_safeguarding",
    "href": "/safeguarding/actions",
    "routes": [
      "/safeguarding/actions"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/safeguarding/actions/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_safeguarding",
        "type": "required",
        "description": "Submodule requires parent module Safeguarding (DSL) to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "safeguarding.*"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/safeguarding/actions/page.tsx",
      "componentEntry": "components/safeguarding",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute protective actions operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: safeguarding.*"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 239
  },
  {
    "id": "sub_safeguarding_settings",
    "navId": "nav-safeguarding-settings",
    "name": "Safeguarding Policies",
    "code": "SAFEGUARDING_SETTINGS",
    "description": "Dedicated submodule supporting specialized workflows for safeguarding policies under Safeguarding (DSL).",
    "category": "safeguarding_dsl",
    "macroCategory": "administration",
    "parentId": "mod_safeguarding",
    "href": "/safeguarding/settings",
    "routes": [
      "/safeguarding/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/safeguarding/settings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_safeguarding",
        "type": "required",
        "description": "Submodule requires parent module Safeguarding (DSL) to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "safeguarding.*"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/safeguarding/settings/page.tsx",
      "componentEntry": "components/safeguarding",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute safeguarding policies operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: safeguarding.*"
    ],
    "dataSensitivity": "sensitive_health_dsl",
    "displayOrder": 240
  },
  {
    "id": "mod_activities",
    "navId": "nav-activities",
    "name": "Clubs & Activities",
    "code": "ACTIVITIES",
    "description": "Full-spectrum tenant module for clubs & activities operations, data management, and user workflows.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "href": "/activities",
    "routes": [
      "/activities"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Sports teams, club memberships, and guardian consents register students"
      }
    ],
    "requiredPermissions": [
      "activities.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Browse and filter clubs & activities entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 241
  },
  {
    "id": "sub_activities_dashboard",
    "navId": "nav-activities-dashboard",
    "name": "Activities Overview",
    "code": "ACTIVITIES_DASHBOARD",
    "description": "Dedicated submodule supporting specialized workflows for activities overview under Clubs & Activities.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "parentId": "mod_activities",
    "href": "/activities",
    "routes": [
      "/activities"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/activities/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_activities",
        "type": "required",
        "description": "Submodule requires parent module Clubs & Activities to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "activities.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute activities overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: activities.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 242
  },
  {
    "id": "sub_activities_clubs",
    "navId": "nav-activities-clubs",
    "name": "Clubs & Societies",
    "code": "ACTIVITIES_CLUBS",
    "description": "Dedicated submodule supporting specialized workflows for clubs & societies under Clubs & Activities.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "parentId": "mod_activities",
    "href": "/activities/clubs",
    "routes": [
      "/activities/clubs",
      "/activities/clubs/[clubId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/activities/clubs/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_activities",
        "type": "required",
        "description": "Submodule requires parent module Clubs & Activities to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "activities.clubs.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/clubs/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute clubs & societies operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: activities.clubs.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 243
  },
  {
    "id": "sub_activities_memberships",
    "navId": "nav-activities-memberships",
    "name": "Memberships & Apps",
    "code": "ACTIVITIES_MEMBERSHIPS",
    "description": "Dedicated submodule supporting specialized workflows for memberships & apps under Clubs & Activities.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "parentId": "mod_activities",
    "href": "/activities/memberships",
    "routes": [
      "/activities/memberships"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/activities/memberships/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_activities",
        "type": "required",
        "description": "Submodule requires parent module Clubs & Activities to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "activities.memberships.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/memberships/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute memberships & apps operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: activities.memberships.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 244
  },
  {
    "id": "sub_activities_sports",
    "navId": "nav-activities-sports",
    "name": "Sports & Teams",
    "code": "ACTIVITIES_SPORTS",
    "description": "Dedicated submodule supporting specialized workflows for sports & teams under Clubs & Activities.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "parentId": "mod_activities",
    "href": "/activities/sports",
    "routes": [
      "/activities/sports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/activities/sports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_activities",
        "type": "required",
        "description": "Submodule requires parent module Clubs & Activities to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "activities.sports.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/sports/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute sports & teams operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: activities.sports.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 245
  },
  {
    "id": "sub_activities_competitions",
    "navId": "nav-activities-competitions",
    "name": "Competitions & Fixtures",
    "code": "ACTIVITIES_COMPETITIONS",
    "description": "Dedicated submodule supporting specialized workflows for competitions & fixtures under Clubs & Activities.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "parentId": "mod_activities",
    "href": "/activities/competitions",
    "routes": [
      "/activities/competitions"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/activities/competitions/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_activities",
        "type": "required",
        "description": "Submodule requires parent module Clubs & Activities to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "activities.competitions.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/competitions/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute competitions & fixtures operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: activities.competitions.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 246
  },
  {
    "id": "sub_activities_sessions",
    "navId": "nav-activities-sessions",
    "name": "Sessions & Attendance",
    "code": "ACTIVITIES_SESSIONS",
    "description": "Dedicated submodule supporting specialized workflows for sessions & attendance under Clubs & Activities.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "parentId": "mod_activities",
    "href": "/activities/sessions",
    "routes": [
      "/activities/sessions"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/activities/sessions/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_activities",
        "type": "required",
        "description": "Submodule requires parent module Clubs & Activities to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "activities.sessions.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/sessions/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute sessions & attendance operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: activities.sessions.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 247
  },
  {
    "id": "sub_activities_events",
    "navId": "nav-activities-events",
    "name": "Events & Trips",
    "code": "ACTIVITIES_EVENTS",
    "description": "Dedicated submodule supporting specialized workflows for events & trips under Clubs & Activities.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "parentId": "mod_activities",
    "href": "/activities/events",
    "routes": [
      "/activities/events"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/activities/events/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_activities",
        "type": "required",
        "description": "Submodule requires parent module Clubs & Activities to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "activities.events.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/events/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute events & trips operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: activities.events.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 248
  },
  {
    "id": "sub_activities_consents",
    "navId": "nav-activities-consents",
    "name": "Guardian Consents",
    "code": "ACTIVITIES_CONSENTS",
    "description": "Dedicated submodule supporting specialized workflows for guardian consents under Clubs & Activities.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "parentId": "mod_activities",
    "href": "/activities/consents",
    "routes": [
      "/activities/consents"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/activities/consents/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_activities",
        "type": "required",
        "description": "Submodule requires parent module Clubs & Activities to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "activities.consents.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/consents/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute guardian consents operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: activities.consents.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 249
  },
  {
    "id": "sub_activities_risk",
    "navId": "nav-activities-risk",
    "name": "Risk Assessments",
    "code": "ACTIVITIES_RISK",
    "description": "Dedicated submodule supporting specialized workflows for risk assessments under Clubs & Activities.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "parentId": "mod_activities",
    "href": "/activities/risk-assessments",
    "routes": [
      "/activities/risk-assessments"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/activities/risk-assessments/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_activities",
        "type": "required",
        "description": "Submodule requires parent module Clubs & Activities to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "activities.risk_assessments.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/risk-assessments/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute risk assessments operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: activities.risk_assessments.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 250
  },
  {
    "id": "sub_activities_equipment",
    "navId": "nav-activities-equipment",
    "name": "Equipment & Uniforms",
    "code": "ACTIVITIES_EQUIPMENT",
    "description": "Dedicated submodule supporting specialized workflows for equipment & uniforms under Clubs & Activities.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "parentId": "mod_activities",
    "href": "/activities/equipment",
    "routes": [
      "/activities/equipment"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/activities/equipment/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_activities",
        "type": "required",
        "description": "Submodule requires parent module Clubs & Activities to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "activities.equipment.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/equipment/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute equipment & uniforms operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: activities.equipment.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 251
  },
  {
    "id": "sub_activities_achievements",
    "navId": "nav-activities-achievements",
    "name": "Achievements & Awards",
    "code": "ACTIVITIES_ACHIEVEMENTS",
    "description": "Dedicated submodule supporting specialized workflows for achievements & awards under Clubs & Activities.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "parentId": "mod_activities",
    "href": "/activities/achievements",
    "routes": [
      "/activities/achievements"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/activities/achievements/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_activities",
        "type": "required",
        "description": "Submodule requires parent module Clubs & Activities to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "activities.achievements.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/achievements/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute achievements & awards operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: activities.achievements.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 252
  },
  {
    "id": "sub_activities_reports",
    "navId": "nav-activities-reports",
    "name": "Activities Reports",
    "code": "ACTIVITIES_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for activities reports under Clubs & Activities.",
    "category": "activities_clubs",
    "macroCategory": "administration",
    "parentId": "mod_activities",
    "href": "/activities/reports",
    "routes": [
      "/activities/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/activities/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_activities",
        "type": "required",
        "description": "Submodule requires parent module Clubs & Activities to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "activities.reports.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/activities/reports/page.tsx",
      "componentEntry": "components/activities",
      "typeDefinition": "types/activities.ts",
      "mockStore": "lib/mock/activitiesData.ts",
      "testSuite": "tests/activities.test.ts",
      "navGroupId": "operations"
    },
    "supportedWorkflows": [
      "Execute activities reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: activities.reports.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 253
  },
  {
    "id": "mod_engagement_hub",
    "navId": "nav-engagement-hub",
    "name": "Engagement Hub",
    "code": "ENGAGEMENT_HUB",
    "description": "Full-spectrum tenant module for engagement hub operations, data management, and user workflows.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "href": "/engagement",
    "routes": [
      "/engagement"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Parent-teacher conferences and enquiries relate to enrolled students"
      },
      {
        "moduleId": "mod_parents",
        "type": "required",
        "description": "Requires registered parent/guardian profiles"
      }
    ],
    "requiredPermissions": [
      "engagement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Browse and filter engagement hub entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 254
  },
  {
    "id": "sub_engagement_overview",
    "navId": "nav-engagement-overview",
    "name": "Dashboard & Insights",
    "code": "ENGAGEMENT_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for dashboard & insights under Engagement Hub.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "parentId": "mod_engagement_hub",
    "href": "/engagement",
    "routes": [
      "/engagement"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/engagement/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_engagement_hub",
        "type": "required",
        "description": "Submodule requires parent module Engagement Hub to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "engagement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Execute dashboard & insights operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: engagement.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 255
  },
  {
    "id": "sub_engagement_appointments",
    "navId": "nav-engagement-appointments",
    "name": "Appointments & Bookings",
    "code": "ENGAGEMENT_APPOINTMENTS",
    "description": "Dedicated submodule supporting specialized workflows for appointments & bookings under Engagement Hub.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "parentId": "mod_engagement_hub",
    "href": "/engagement/appointments",
    "routes": [
      "/engagement/appointments"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/engagement/appointments/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_engagement_hub",
        "type": "required",
        "description": "Submodule requires parent module Engagement Hub to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "engagement.appointments.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/appointments/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Execute appointments & bookings operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: engagement.appointments.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 256
  },
  {
    "id": "sub_engagement_availability",
    "navId": "nav-engagement-availability",
    "name": "Teacher Availability",
    "code": "ENGAGEMENT_AVAILABILITY",
    "description": "Dedicated submodule supporting specialized workflows for teacher availability under Engagement Hub.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "parentId": "mod_engagement_hub",
    "href": "/engagement/availability",
    "routes": [
      "/engagement/availability"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/engagement/availability/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_engagement_hub",
        "type": "required",
        "description": "Submodule requires parent module Engagement Hub to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "engagement.availability.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/availability/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Execute teacher availability operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: engagement.availability.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 257
  },
  {
    "id": "sub_engagement_conferences",
    "navId": "nav-engagement-conferences",
    "name": "PTM Conferences",
    "code": "ENGAGEMENT_CONFERENCES",
    "description": "Dedicated submodule supporting specialized workflows for ptm conferences under Engagement Hub.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "parentId": "mod_engagement_hub",
    "href": "/engagement/conferences",
    "routes": [
      "/engagement/conferences"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/engagement/conferences/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_engagement_hub",
        "type": "required",
        "description": "Submodule requires parent module Engagement Hub to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "engagement.conferences.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/conferences/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Execute ptm conferences operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: engagement.conferences.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 258
  },
  {
    "id": "sub_engagement_enquiries",
    "navId": "nav-engagement-enquiries",
    "name": "Parent Enquiries",
    "code": "ENGAGEMENT_ENQUIRIES",
    "description": "Dedicated submodule supporting specialized workflows for parent enquiries under Engagement Hub.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "parentId": "mod_engagement_hub",
    "href": "/engagement/enquiries",
    "routes": [
      "/engagement/enquiries"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/engagement/enquiries/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_engagement_hub",
        "type": "required",
        "description": "Submodule requires parent module Engagement Hub to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "engagement.enquiries.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/enquiries/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Execute parent enquiries operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: engagement.enquiries.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 259
  },
  {
    "id": "sub_engagement_pta",
    "navId": "nav-engagement-pta",
    "name": "PTA Association & Dues",
    "code": "ENGAGEMENT_PTA",
    "description": "Dedicated submodule supporting specialized workflows for pta association & dues under Engagement Hub.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "parentId": "mod_engagement_hub",
    "href": "/engagement/pta",
    "routes": [
      "/engagement/pta"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/engagement/pta/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_engagement_hub",
        "type": "required",
        "description": "Submodule requires parent module Engagement Hub to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "engagement.pta.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/pta/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Execute pta association & dues operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: engagement.pta.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 260
  },
  {
    "id": "sub_engagement_pta_committees",
    "navId": "nav-engagement-pta-committees",
    "name": "PTA Committees",
    "code": "ENGAGEMENT_PTA_COMMITTEES",
    "description": "Dedicated submodule supporting specialized workflows for pta committees under Engagement Hub.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "parentId": "mod_engagement_hub",
    "href": "/engagement/pta/committees",
    "routes": [
      "/engagement/pta/committees"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/engagement/pta/committees/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_engagement_hub",
        "type": "required",
        "description": "Submodule requires parent module Engagement Hub to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "engagement.pta.committees.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/pta/committees/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Execute pta committees operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: engagement.pta.committees.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 261
  },
  {
    "id": "sub_engagement_pta_meetings",
    "navId": "nav-engagement-pta-meetings",
    "name": "PTA Meetings & Minutes",
    "code": "ENGAGEMENT_PTA_MEETINGS",
    "description": "Dedicated submodule supporting specialized workflows for pta meetings & minutes under Engagement Hub.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "parentId": "mod_engagement_hub",
    "href": "/engagement/pta/meetings",
    "routes": [
      "/engagement/pta/meetings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/engagement/pta/meetings/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_engagement_hub",
        "type": "required",
        "description": "Submodule requires parent module Engagement Hub to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "engagement.pta.meetings.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/pta/meetings/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Execute pta meetings & minutes operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: engagement.pta.meetings.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 262
  },
  {
    "id": "sub_engagement_surveys",
    "navId": "nav-engagement-surveys",
    "name": "Surveys & Feedback",
    "code": "ENGAGEMENT_SURVEYS",
    "description": "Dedicated submodule supporting specialized workflows for surveys & feedback under Engagement Hub.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "parentId": "mod_engagement_hub",
    "href": "/engagement/surveys",
    "routes": [
      "/engagement/surveys"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/engagement/surveys/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_engagement_hub",
        "type": "required",
        "description": "Submodule requires parent module Engagement Hub to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "engagement.surveys.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/surveys/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Execute surveys & feedback operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: engagement.surveys.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 263
  },
  {
    "id": "sub_engagement_polls",
    "navId": "nav-engagement-polls",
    "name": "Community Polls",
    "code": "ENGAGEMENT_POLLS",
    "description": "Dedicated submodule supporting specialized workflows for community polls under Engagement Hub.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "parentId": "mod_engagement_hub",
    "href": "/engagement/polls",
    "routes": [
      "/engagement/polls"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/engagement/polls/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_engagement_hub",
        "type": "required",
        "description": "Submodule requires parent module Engagement Hub to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "engagement.polls.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/polls/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Execute community polls operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: engagement.polls.manage"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 264
  },
  {
    "id": "sub_engagement_reports",
    "navId": "nav-engagement-reports",
    "name": "Engagement Reports",
    "code": "ENGAGEMENT_REPORTS",
    "description": "Dedicated submodule supporting specialized workflows for engagement reports under Engagement Hub.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "parentId": "mod_engagement_hub",
    "href": "/engagement/reports",
    "routes": [
      "/engagement/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/engagement/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_engagement_hub",
        "type": "required",
        "description": "Submodule requires parent module Engagement Hub to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "engagement.reports.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/engagement/reports/page.tsx",
      "componentEntry": "components/engagement",
      "typeDefinition": "types/engagement.ts",
      "mockStore": "lib/mock/engagementData.ts",
      "testSuite": "tests/engagement.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Execute engagement reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: engagement.reports.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 265
  },
  {
    "id": "sub_engagement_parent_portal",
    "navId": "nav-engagement-parent-portal",
    "name": "Parent Portal View",
    "code": "ENGAGEMENT_PARENT_PORTAL",
    "description": "Dedicated submodule supporting specialized workflows for parent portal view under Engagement Hub.",
    "category": "engagement_community",
    "macroCategory": "communications",
    "parentId": "mod_engagement_hub",
    "href": "/parent-engagement",
    "routes": [
      "/parent-engagement",
      "/parent-engagement/appointments",
      "/parent-engagement/conferences",
      "/parent-engagement/enquiries",
      "/parent-engagement/polls",
      "/parent-engagement/pta",
      "/parent-engagement/surveys"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/parent-engagement/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_engagement_hub",
        "type": "required",
        "description": "Submodule requires parent module Engagement Hub to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "engagement.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/parent-engagement/page.tsx",
      "componentEntry": "components/parent-engagement",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "engagement"
    },
    "supportedWorkflows": [
      "Execute parent portal view operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: engagement.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 266
  },
  {
    "id": "mod_security_overview",
    "navId": "nav-security-overview",
    "name": "Security Dashboard",
    "code": "SECURITY_OVERVIEW",
    "description": "Full-spectrum tenant module for security dashboard operations, data management, and user workflows.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "href": "/security",
    "routes": [
      "/security"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "security.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Browse and filter security dashboard entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 267
  },
  {
    "id": "mod_security_visitors",
    "navId": "nav-security-visitors",
    "name": "Visitor Management",
    "code": "SECURITY_VISITORS",
    "description": "Full-spectrum tenant module for visitor management operations, data management, and user workflows.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "href": "/security/visitors",
    "routes": [
      "/security/visitors"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "security.visitors.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/visitors/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Browse and filter visitor management entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 268
  },
  {
    "id": "sub_security_visitors_list",
    "navId": "nav-security-visitors-list",
    "name": "Visitor Directory",
    "code": "SECURITY_VISITORS_LIST",
    "description": "Dedicated submodule supporting specialized workflows for visitor directory under Visitor Management.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_visitors",
    "href": "/security/visitors",
    "routes": [
      "/security/visitors",
      "/security/visitors/[visitorId]",
      "/security/visitors/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/visitors/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_visitors",
        "type": "required",
        "description": "Submodule requires parent module Visitor Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.visitors.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/visitors/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute visitor directory operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.visitors.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 269
  },
  {
    "id": "sub_security_visitors_new",
    "navId": "nav-security-visitors-new",
    "name": "Register Visitor",
    "code": "SECURITY_VISITORS_NEW",
    "description": "Dedicated submodule supporting specialized workflows for register visitor under Visitor Management.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_visitors",
    "href": "/security/visitors/new",
    "routes": [
      "/security/visitors/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/visitors/new/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_visitors",
        "type": "required",
        "description": "Submodule requires parent module Visitor Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.visitors.register"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/visitors/new/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute register visitor operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.visitors.register"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 270
  },
  {
    "id": "sub_security_visitors_expected",
    "navId": "nav-security-visitors-expected",
    "name": "Expected Visitors",
    "code": "SECURITY_VISITORS_EXPECTED",
    "description": "Dedicated submodule supporting specialized workflows for expected visitors under Visitor Management.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_visitors",
    "href": "/security/visitors/expected",
    "routes": [
      "/security/visitors/expected"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/visitors/expected/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_visitors",
        "type": "required",
        "description": "Submodule requires parent module Visitor Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.visitors.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/visitors/expected/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute expected visitors operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.visitors.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 271
  },
  {
    "id": "sub_security_visitors_checked_in",
    "navId": "nav-security-visitors-checked-in",
    "name": "Checked-In Visitors",
    "code": "SECURITY_VISITORS_CHECKED_IN",
    "description": "Dedicated submodule supporting specialized workflows for checked-in visitors under Visitor Management.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_visitors",
    "href": "/security/visitors/checked-in",
    "routes": [
      "/security/visitors/checked-in"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/visitors/checked-in/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_visitors",
        "type": "required",
        "description": "Submodule requires parent module Visitor Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.visitors.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/visitors/checked-in/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute checked-in visitors operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.visitors.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 272
  },
  {
    "id": "sub_security_visitors_history",
    "navId": "nav-security-visitors-history",
    "name": "Visitor History",
    "code": "SECURITY_VISITORS_HISTORY",
    "description": "Dedicated submodule supporting specialized workflows for visitor history under Visitor Management.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_visitors",
    "href": "/security/visitors/history",
    "routes": [
      "/security/visitors/history"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/visitors/history/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_visitors",
        "type": "required",
        "description": "Submodule requires parent module Visitor Management to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.visitors.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/visitors/history/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute visitor history operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.visitors.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 273
  },
  {
    "id": "mod_security_pickup",
    "navId": "nav-security-pickup",
    "name": "Pickup Authorization",
    "code": "SECURITY_PICKUP",
    "description": "Full-spectrum tenant module for pickup authorization operations, data management, and user workflows.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "href": "/security/pickup",
    "routes": [
      "/security/pickup"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Pickup authorizations grant verified guardians gate collection rights"
      }
    ],
    "requiredPermissions": [
      "security.pickup_authorizations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/pickup/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Browse and filter pickup authorization entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 274
  },
  {
    "id": "sub_security_pickup_overview",
    "navId": "nav-security-pickup-overview",
    "name": "Pickup Overview",
    "code": "SECURITY_PICKUP_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for pickup overview under Pickup Authorization.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_pickup",
    "href": "/security/pickup",
    "routes": [
      "/security/pickup",
      "/security/pickup/history"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/pickup/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_pickup",
        "type": "required",
        "description": "Submodule requires parent module Pickup Authorization to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.pickup_authorizations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/pickup/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute pickup overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.pickup_authorizations.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 275
  },
  {
    "id": "sub_security_pickup_authorizations",
    "navId": "nav-security-pickup-authorizations",
    "name": "Authorized Collectors",
    "code": "SECURITY_PICKUP_AUTHORIZATIONS",
    "description": "Dedicated submodule supporting specialized workflows for authorized collectors under Pickup Authorization.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_pickup",
    "href": "/security/pickup/authorizations",
    "routes": [
      "/security/pickup/authorizations",
      "/security/pickup/authorizations/[authorizationId]",
      "/security/pickup/authorizations/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/pickup/authorizations/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_pickup",
        "type": "required",
        "description": "Submodule requires parent module Pickup Authorization to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.pickup_authorizations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/pickup/authorizations/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute authorized collectors operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.pickup_authorizations.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 276
  },
  {
    "id": "sub_security_pickup_temporary",
    "navId": "nav-security-pickup-temporary",
    "name": "Temporary Authorizations",
    "code": "SECURITY_PICKUP_TEMPORARY",
    "description": "Dedicated submodule supporting specialized workflows for temporary authorizations under Pickup Authorization.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_pickup",
    "href": "/security/pickup/temporary-authorizations",
    "routes": [
      "/security/pickup/temporary-authorizations"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/pickup/temporary-authorizations/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_pickup",
        "type": "required",
        "description": "Submodule requires parent module Pickup Authorization to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.pickup_authorizations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/pickup/temporary-authorizations/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute temporary authorizations operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.pickup_authorizations.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 277
  },
  {
    "id": "sub_security_pickup_queue",
    "navId": "nav-security-pickup-queue",
    "name": "Gate Collection Queue",
    "code": "SECURITY_PICKUP_QUEUE",
    "description": "Dedicated submodule supporting specialized workflows for gate collection queue under Pickup Authorization.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_pickup",
    "href": "/security/pickup/queue",
    "routes": [
      "/security/pickup/queue"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/pickup/queue/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_pickup",
        "type": "required",
        "description": "Submodule requires parent module Pickup Authorization to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.pickup.verify"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/pickup/queue/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute gate collection queue operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.pickup.verify"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 278
  },
  {
    "id": "sub_security_pickup_handovers",
    "navId": "nav-security-pickup-handovers",
    "name": "Handover Records",
    "code": "SECURITY_PICKUP_HANDOVERS",
    "description": "Dedicated submodule supporting specialized workflows for handover records under Pickup Authorization.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_pickup",
    "href": "/security/pickup/handovers",
    "routes": [
      "/security/pickup/handovers"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/pickup/handovers/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_pickup",
        "type": "required",
        "description": "Submodule requires parent module Pickup Authorization to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.handovers.record"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/pickup/handovers/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute handover records operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.handovers.record"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 279
  },
  {
    "id": "mod_security_early_leave",
    "navId": "nav-security-early-leave",
    "name": "Early Student Leave",
    "code": "SECURITY_EARLY_LEAVE",
    "description": "Full-spectrum tenant module for early student leave operations, data management, and user workflows.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "href": "/security/early-leave",
    "routes": [
      "/security/early-leave"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "required",
        "description": "Early departure gate passes release enrolled students from campus"
      }
    ],
    "requiredPermissions": [
      "security.early_leave.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/early-leave/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Browse and filter early student leave entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 280
  },
  {
    "id": "sub_security_early_leave_overview",
    "navId": "nav-security-early-leave-overview",
    "name": "Early Leave Overview",
    "code": "SECURITY_EARLY_LEAVE_OVERVIEW",
    "description": "Dedicated submodule supporting specialized workflows for early leave overview under Early Student Leave.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_early_leave",
    "href": "/security/early-leave",
    "routes": [
      "/security/early-leave"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/early-leave/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_early_leave",
        "type": "required",
        "description": "Submodule requires parent module Early Student Leave to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.early_leave.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/early-leave/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute early leave overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.early_leave.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 281
  },
  {
    "id": "sub_security_early_leave_requests",
    "navId": "nav-security-early-leave-requests",
    "name": "Leave Requests",
    "code": "SECURITY_EARLY_LEAVE_REQUESTS",
    "description": "Dedicated submodule supporting specialized workflows for leave requests under Early Student Leave.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_early_leave",
    "href": "/security/early-leave/requests",
    "routes": [
      "/security/early-leave/requests",
      "/security/early-leave/requests/[requestId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/early-leave/requests/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_early_leave",
        "type": "required",
        "description": "Submodule requires parent module Early Student Leave to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.early_leave.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/early-leave/requests/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute leave requests operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.early_leave.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 282
  },
  {
    "id": "mod_security_gate_passes",
    "navId": "nav-security-gate-passes",
    "name": "Digital Gate Passes",
    "code": "SECURITY_GATE_PASSES",
    "description": "Full-spectrum tenant module for digital gate passes operations, data management, and user workflows.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "href": "/security/gate-passes",
    "routes": [
      "/security/gate-passes"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "security.gate_passes.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/gate-passes/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Browse and filter digital gate passes entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 283
  },
  {
    "id": "sub_security_gate_passes_list",
    "navId": "nav-security-gate-passes-list",
    "name": "All Gate Passes",
    "code": "SECURITY_GATE_PASSES_LIST",
    "description": "Dedicated submodule supporting specialized workflows for all gate passes under Digital Gate Passes.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_gate_passes",
    "href": "/security/gate-passes",
    "routes": [
      "/security/gate-passes",
      "/security/gate-passes/[passId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/gate-passes/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_gate_passes",
        "type": "required",
        "description": "Submodule requires parent module Digital Gate Passes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.gate_passes.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/gate-passes/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute all gate passes operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.gate_passes.view"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 284
  },
  {
    "id": "sub_security_gate_passes_verify",
    "navId": "nav-security-gate-passes-verify",
    "name": "Verify & Redeem Pass",
    "code": "SECURITY_GATE_PASSES_VERIFY",
    "description": "Dedicated submodule supporting specialized workflows for verify & redeem pass under Digital Gate Passes.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "parentId": "mod_security_gate_passes",
    "href": "/security/gate-passes/verify",
    "routes": [
      "/security/gate-passes/verify"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/security/gate-passes/verify/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_security_gate_passes",
        "type": "required",
        "description": "Submodule requires parent module Digital Gate Passes to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "security.gate_passes.verify"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/gate-passes/verify/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Execute verify & redeem pass operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: security.gate_passes.verify"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 285
  },
  {
    "id": "mod_security_incidents",
    "navId": "nav-security-incidents",
    "name": "Security Incidents",
    "code": "SECURITY_INCIDENTS",
    "description": "Full-spectrum tenant module for security incidents operations, data management, and user workflows.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "href": "/security/incidents",
    "routes": [
      "/security/incidents",
      "/security/incidents/[incidentId]"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "security.incidents.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/incidents/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Browse and filter security incidents entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 286
  },
  {
    "id": "mod_security_reports",
    "navId": "nav-security-reports",
    "name": "Security Reports",
    "code": "SECURITY_REPORTS",
    "description": "Full-spectrum tenant module for security reports operations, data management, and user workflows.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "href": "/security/reports",
    "routes": [
      "/security/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "security.reports.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/reports/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Browse and filter security reports entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 287
  },
  {
    "id": "mod_security_settings",
    "navId": "nav-security-settings",
    "name": "Security Settings",
    "code": "SECURITY_SETTINGS",
    "description": "Full-spectrum tenant module for security settings operations, data management, and user workflows.",
    "category": "security_gate",
    "macroCategory": "platform_security",
    "href": "/security/settings",
    "routes": [
      "/security/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "security.settings.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/security/settings/page.tsx",
      "componentEntry": "components/security",
      "typeDefinition": "types/security.ts",
      "mockStore": "lib/mock/securityData.ts",
      "testSuite": "tests/security.test.ts",
      "navGroupId": "security"
    },
    "supportedWorkflows": [
      "Browse and filter security settings entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "restricted_pii",
    "displayOrder": 288
  },
  {
    "id": "mod_documents_repository",
    "navId": "nav-documents-repository",
    "name": "Document Repository",
    "code": "DOCUMENTS_REPOSITORY",
    "description": "Full-spectrum tenant module for document repository operations, data management, and user workflows.",
    "category": "documents_records",
    "macroCategory": "communications",
    "href": "/documents",
    "routes": [
      "/documents"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "documents.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/documents/page.tsx",
      "componentEntry": "components/documents",
      "typeDefinition": "types/documents.ts",
      "mockStore": "lib/mock/documentsData.ts",
      "testSuite": "tests/documents.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Browse and filter document repository entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 289
  },
  {
    "id": "mod_documents_upload",
    "navId": "nav-documents-upload",
    "name": "Upload & Ingest",
    "code": "DOCUMENTS_UPLOAD",
    "description": "Full-spectrum tenant module for upload & ingest operations, data management, and user workflows.",
    "category": "documents_records",
    "macroCategory": "communications",
    "href": "/documents/upload",
    "routes": [
      "/documents/upload"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "documents.upload"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/documents/upload/page.tsx",
      "componentEntry": "components/documents",
      "typeDefinition": "types/documents.ts",
      "mockStore": "lib/mock/documentsData.ts",
      "testSuite": "tests/documents.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Browse and filter upload & ingest entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 290
  },
  {
    "id": "mod_documents_approvals",
    "navId": "nav-documents-approvals",
    "name": "Document Approvals",
    "code": "DOCUMENTS_APPROVALS",
    "description": "Full-spectrum tenant module for document approvals operations, data management, and user workflows.",
    "category": "documents_records",
    "macroCategory": "communications",
    "href": "/documents/approvals",
    "routes": [
      "/documents/approvals"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "documents.approvals.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/documents/approvals/page.tsx",
      "componentEntry": "components/documents",
      "typeDefinition": "types/documents.ts",
      "mockStore": "lib/mock/documentsData.ts",
      "testSuite": "tests/documents.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Browse and filter document approvals entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 291
  },
  {
    "id": "mod_documents_requests",
    "navId": "nav-documents-requests",
    "name": "Document Requests",
    "code": "DOCUMENTS_REQUESTS",
    "description": "Full-spectrum tenant module for document requests operations, data management, and user workflows.",
    "category": "documents_records",
    "macroCategory": "communications",
    "href": "/documents/requests",
    "routes": [
      "/documents/requests"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "documents.requests.create"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/documents/requests/page.tsx",
      "componentEntry": "components/documents",
      "typeDefinition": "types/documents.ts",
      "mockStore": "lib/mock/documentsData.ts",
      "testSuite": "tests/documents.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Browse and filter document requests entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 292
  },
  {
    "id": "mod_documents_expiry",
    "navId": "nav-documents-expiry",
    "name": "Expiry & Renewals",
    "code": "DOCUMENTS_EXPIRY",
    "description": "Full-spectrum tenant module for expiry & renewals operations, data management, and user workflows.",
    "category": "documents_records",
    "macroCategory": "communications",
    "href": "/documents/expiry",
    "routes": [
      "/documents/expiry"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "documents.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/documents/expiry/page.tsx",
      "componentEntry": "components/documents",
      "typeDefinition": "types/documents.ts",
      "mockStore": "lib/mock/documentsData.ts",
      "testSuite": "tests/documents.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Browse and filter expiry & renewals entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 293
  },
  {
    "id": "mod_forms",
    "navId": "nav-forms",
    "name": "Digital Forms",
    "code": "FORMS",
    "description": "Full-spectrum tenant module for digital forms operations, data management, and user workflows.",
    "category": "documents_records",
    "macroCategory": "communications",
    "href": "/forms",
    "routes": [
      "/forms"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "forms.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/forms/page.tsx",
      "componentEntry": "components/forms",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Browse and filter digital forms entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 294
  },
  {
    "id": "sub_forms_list",
    "navId": "nav-forms-list",
    "name": "All Forms",
    "code": "FORMS_LIST",
    "description": "Dedicated submodule supporting specialized workflows for all forms under Digital Forms.",
    "category": "documents_records",
    "macroCategory": "communications",
    "parentId": "mod_forms",
    "href": "/forms",
    "routes": [
      "/forms"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/forms/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_forms",
        "type": "required",
        "description": "Submodule requires parent module Digital Forms to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "forms.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/forms/page.tsx",
      "componentEntry": "components/forms",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Execute all forms operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: forms.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 295
  },
  {
    "id": "sub_forms_new",
    "navId": "nav-forms-new",
    "name": "Create Form",
    "code": "FORMS_NEW",
    "description": "Dedicated submodule supporting specialized workflows for create form under Digital Forms.",
    "category": "documents_records",
    "macroCategory": "communications",
    "parentId": "mod_forms",
    "href": "/forms/new",
    "routes": [
      "/forms/new"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/forms/new/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_forms",
        "type": "required",
        "description": "Submodule requires parent module Digital Forms to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "forms.create"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/forms/new/page.tsx",
      "componentEntry": "components/forms",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Execute create form operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: forms.create"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 296
  },
  {
    "id": "sub_forms_submissions",
    "navId": "nav-forms-submissions",
    "name": "Form Submissions",
    "code": "FORMS_SUBMISSIONS",
    "description": "Dedicated submodule supporting specialized workflows for form submissions under Digital Forms.",
    "category": "documents_records",
    "macroCategory": "communications",
    "parentId": "mod_forms",
    "href": "/forms/submissions",
    "routes": [
      "/forms/submissions"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/forms/submissions/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_forms",
        "type": "required",
        "description": "Submodule requires parent module Digital Forms to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "forms.submissions.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/forms/submissions/page.tsx",
      "componentEntry": "components/forms",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Execute form submissions operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: forms.submissions.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 297
  },
  {
    "id": "mod_certificates",
    "navId": "nav-certificates",
    "name": "Certificates & Awards",
    "code": "CERTIFICATES",
    "description": "Full-spectrum tenant module for certificates & awards operations, data management, and user workflows.",
    "category": "documents_records",
    "macroCategory": "communications",
    "href": "/certificates",
    "routes": [
      "/certificates"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "certificates.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/certificates/page.tsx",
      "componentEntry": "components/certificates",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Browse and filter certificates & awards entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 298
  },
  {
    "id": "sub_certificates_studio",
    "navId": "nav-certificates-studio",
    "name": "Certificate Studio",
    "code": "CERTIFICATES_STUDIO",
    "description": "Dedicated submodule supporting specialized workflows for certificate studio under Certificates & Awards.",
    "category": "documents_records",
    "macroCategory": "communications",
    "parentId": "mod_certificates",
    "href": "/certificates",
    "routes": [
      "/certificates"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/certificates/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_certificates",
        "type": "required",
        "description": "Submodule requires parent module Certificates & Awards to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "certificates.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/certificates/page.tsx",
      "componentEntry": "components/certificates",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Execute certificate studio operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: certificates.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 299
  },
  {
    "id": "sub_certificates_generate",
    "navId": "nav-certificates-generate",
    "name": "Generate Certificate",
    "code": "CERTIFICATES_GENERATE",
    "description": "Dedicated submodule supporting specialized workflows for generate certificate under Certificates & Awards.",
    "category": "documents_records",
    "macroCategory": "communications",
    "parentId": "mod_certificates",
    "href": "/certificates/generate",
    "routes": [
      "/certificates/generate"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/certificates/generate/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_certificates",
        "type": "required",
        "description": "Submodule requires parent module Certificates & Awards to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "certificates.generate"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/certificates/generate/page.tsx",
      "componentEntry": "components/certificates",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Execute generate certificate operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: certificates.generate"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 300
  },
  {
    "id": "sub_certificates_verify",
    "navId": "nav-certificates-verify",
    "name": "Verify Certificate",
    "code": "CERTIFICATES_VERIFY",
    "description": "Dedicated submodule supporting specialized workflows for verify certificate under Certificates & Awards.",
    "category": "documents_records",
    "macroCategory": "communications",
    "parentId": "mod_certificates",
    "href": "/certificates/verification",
    "routes": [
      "/certificates/verification"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/certificates/verification/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_certificates",
        "type": "required",
        "description": "Submodule requires parent module Certificates & Awards to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "certificates.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/certificates/verification/page.tsx",
      "componentEntry": "components/certificates",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Execute verify certificate operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: certificates.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 301
  },
  {
    "id": "mod_documents_signatures",
    "navId": "nav-documents-signatures",
    "name": "E-Signatures & Consents",
    "code": "DOCUMENTS_SIGNATURES",
    "description": "Full-spectrum tenant module for e-signatures & consents operations, data management, and user workflows.",
    "category": "documents_records",
    "macroCategory": "communications",
    "href": "/documents/signatures",
    "routes": [
      "/documents/signatures"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "signatures.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/documents/signatures/page.tsx",
      "componentEntry": "components/documents",
      "typeDefinition": "types/documents.ts",
      "mockStore": "lib/mock/documentsData.ts",
      "testSuite": "tests/documents.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Browse and filter e-signatures & consents entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 302
  },
  {
    "id": "mod_documents_retention",
    "navId": "nav-documents-retention",
    "name": "Retention & Legal Holds",
    "code": "DOCUMENTS_RETENTION",
    "description": "Full-spectrum tenant module for retention & legal holds operations, data management, and user workflows.",
    "category": "documents_records",
    "macroCategory": "communications",
    "href": "/documents/retention",
    "routes": [
      "/documents/retention"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "documents.retention.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/documents/retention/page.tsx",
      "componentEntry": "components/documents",
      "typeDefinition": "types/documents.ts",
      "mockStore": "lib/mock/documentsData.ts",
      "testSuite": "tests/documents.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Browse and filter retention & legal holds entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 303
  },
  {
    "id": "mod_documents_settings",
    "navId": "nav-documents-settings",
    "name": "Document Settings",
    "code": "DOCUMENTS_SETTINGS",
    "description": "Full-spectrum tenant module for document settings operations, data management, and user workflows.",
    "category": "documents_records",
    "macroCategory": "communications",
    "href": "/documents/settings",
    "routes": [
      "/documents/settings"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "documents.manage"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/documents/settings/page.tsx",
      "componentEntry": "components/documents",
      "typeDefinition": "types/documents.ts",
      "mockStore": "lib/mock/documentsData.ts",
      "testSuite": "tests/documents.test.ts",
      "navGroupId": "documents"
    },
    "supportedWorkflows": [
      "Browse and filter document settings entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 304
  },
  {
    "id": "mod_analytics",
    "navId": "nav-analytics",
    "name": "Analytics & BI",
    "code": "ANALYTICS",
    "description": "Full-spectrum tenant module for analytics & bi operations, data management, and user workflows.",
    "category": "analytics_intelligence",
    "macroCategory": "analytics",
    "href": "/analytics",
    "routes": [
      "/analytics"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": true,
    "dependencies": [
      {
        "moduleId": "mod_academics",
        "type": "optional",
        "description": "Aggregates academic examination grades and term results"
      },
      {
        "moduleId": "mod_attendance",
        "type": "optional",
        "description": "Calculates longitudinal school-wide attendance rates"
      },
      {
        "moduleId": "mod_finance",
        "type": "optional",
        "description": "Visualizes fee collection and revenue realization metrics"
      }
    ],
    "requiredPermissions": [
      "analytics.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/analytics/page.tsx",
      "componentEntry": "components/analytics",
      "typeDefinition": "types/analytics.ts",
      "mockStore": "lib/mock/analyticsData.ts",
      "testSuite": "tests/analytics.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Browse and filter analytics & bi entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 305
  },
  {
    "id": "sub_analytics_hub",
    "navId": "nav-analytics-hub",
    "name": "Analytics Overview",
    "code": "ANALYTICS_HUB",
    "description": "Dedicated submodule supporting specialized workflows for analytics overview under Analytics & BI.",
    "category": "analytics_intelligence",
    "macroCategory": "analytics",
    "parentId": "mod_analytics",
    "href": "/analytics",
    "routes": [
      "/analytics"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/analytics/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": true,
    "dependencies": [
      {
        "moduleId": "mod_analytics",
        "type": "required",
        "description": "Submodule requires parent module Analytics & BI to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "analytics.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/analytics/page.tsx",
      "componentEntry": "components/analytics",
      "typeDefinition": "types/analytics.ts",
      "mockStore": "lib/mock/analyticsData.ts",
      "testSuite": "tests/analytics.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute analytics overview operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: analytics.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 306
  },
  {
    "id": "sub_analytics_executive",
    "navId": "nav-analytics-executive",
    "name": "Executive Dashboard",
    "code": "ANALYTICS_EXECUTIVE",
    "description": "Dedicated submodule supporting specialized workflows for executive dashboard under Analytics & BI.",
    "category": "analytics_intelligence",
    "macroCategory": "analytics",
    "parentId": "mod_analytics",
    "href": "/analytics/executive",
    "routes": [
      "/analytics/executive"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/analytics/executive/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": true,
    "dependencies": [
      {
        "moduleId": "mod_analytics",
        "type": "required",
        "description": "Submodule requires parent module Analytics & BI to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "analytics.executive.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/analytics/executive/page.tsx",
      "componentEntry": "components/analytics",
      "typeDefinition": "types/analytics.ts",
      "mockStore": "lib/mock/analyticsData.ts",
      "testSuite": "tests/analytics.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute executive dashboard operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: analytics.executive.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 307
  },
  {
    "id": "sub_analytics_academics",
    "navId": "nav-analytics-academics",
    "name": "Academics Analytics",
    "code": "ANALYTICS_ACADEMICS",
    "description": "Dedicated submodule supporting specialized workflows for academics analytics under Analytics & BI.",
    "category": "analytics_intelligence",
    "macroCategory": "analytics",
    "parentId": "mod_analytics",
    "href": "/analytics/academics",
    "routes": [
      "/analytics/academics"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/analytics/academics/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": true,
    "dependencies": [
      {
        "moduleId": "mod_analytics",
        "type": "required",
        "description": "Submodule requires parent module Analytics & BI to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "analytics.academics.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/analytics/academics/page.tsx",
      "componentEntry": "components/analytics",
      "typeDefinition": "types/analytics.ts",
      "mockStore": "lib/mock/analyticsData.ts",
      "testSuite": "tests/analytics.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute academics analytics operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: analytics.academics.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 308
  },
  {
    "id": "sub_analytics_attendance",
    "navId": "nav-analytics-attendance",
    "name": "Attendance Analytics",
    "code": "ANALYTICS_ATTENDANCE",
    "description": "Dedicated submodule supporting specialized workflows for attendance analytics under Analytics & BI.",
    "category": "analytics_intelligence",
    "macroCategory": "analytics",
    "parentId": "mod_analytics",
    "href": "/analytics/attendance",
    "routes": [
      "/analytics/attendance"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/analytics/attendance/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": true,
    "dependencies": [
      {
        "moduleId": "mod_analytics",
        "type": "required",
        "description": "Submodule requires parent module Analytics & BI to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "analytics.attendance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/analytics/attendance/page.tsx",
      "componentEntry": "components/analytics",
      "typeDefinition": "types/analytics.ts",
      "mockStore": "lib/mock/analyticsData.ts",
      "testSuite": "tests/analytics.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute attendance analytics operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: analytics.attendance.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 309
  },
  {
    "id": "sub_analytics_finance",
    "navId": "nav-analytics-finance",
    "name": "Finance Intelligence",
    "code": "ANALYTICS_FINANCE",
    "description": "Dedicated submodule supporting specialized workflows for finance intelligence under Analytics & BI.",
    "category": "analytics_intelligence",
    "macroCategory": "analytics",
    "parentId": "mod_analytics",
    "href": "/analytics/finance",
    "routes": [
      "/analytics/finance"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/analytics/finance/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": true,
    "dependencies": [
      {
        "moduleId": "mod_analytics",
        "type": "required",
        "description": "Submodule requires parent module Analytics & BI to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "analytics.finance.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/analytics/finance/page.tsx",
      "componentEntry": "components/analytics",
      "typeDefinition": "types/analytics.ts",
      "mockStore": "lib/mock/analyticsData.ts",
      "testSuite": "tests/analytics.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute finance intelligence operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: analytics.finance.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 310
  },
  {
    "id": "sub_analytics_hr",
    "navId": "nav-analytics-hr",
    "name": "Workforce Analytics",
    "code": "ANALYTICS_HR",
    "description": "Dedicated submodule supporting specialized workflows for workforce analytics under Analytics & BI.",
    "category": "analytics_intelligence",
    "macroCategory": "analytics",
    "parentId": "mod_analytics",
    "href": "/analytics/hr",
    "routes": [
      "/analytics/hr"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/analytics/hr/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": true,
    "dependencies": [
      {
        "moduleId": "mod_analytics",
        "type": "required",
        "description": "Submodule requires parent module Analytics & BI to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "analytics.hr.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/analytics/hr/page.tsx",
      "componentEntry": "components/analytics",
      "typeDefinition": "types/analytics.ts",
      "mockStore": "lib/mock/analyticsData.ts",
      "testSuite": "tests/analytics.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute workforce analytics operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: analytics.hr.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 311
  },
  {
    "id": "sub_analytics_operations",
    "navId": "nav-analytics-operations",
    "name": "Campus Operations",
    "code": "ANALYTICS_OPERATIONS",
    "description": "Dedicated submodule supporting specialized workflows for campus operations under Analytics & BI.",
    "category": "analytics_intelligence",
    "macroCategory": "analytics",
    "parentId": "mod_analytics",
    "href": "/analytics/operations",
    "routes": [
      "/analytics/operations"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/analytics/operations/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "enterprise"
    ],
    "requiresAddonLicense": true,
    "dependencies": [
      {
        "moduleId": "mod_analytics",
        "type": "required",
        "description": "Submodule requires parent module Analytics & BI to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "analytics.operations.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/analytics/operations/page.tsx",
      "componentEntry": "components/analytics",
      "typeDefinition": "types/analytics.ts",
      "mockStore": "lib/mock/analyticsData.ts",
      "testSuite": "tests/analytics.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute campus operations operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: analytics.operations.view"
    ],
    "dataSensitivity": "confidential",
    "displayOrder": 312
  },
  {
    "id": "mod_reports",
    "navId": "nav-reports",
    "name": "Custom Report Builder",
    "code": "REPORTS",
    "description": "Full-spectrum tenant module for custom report builder operations, data management, and user workflows.",
    "category": "reports_data_quality",
    "macroCategory": "analytics",
    "href": "/reports",
    "routes": [
      "/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_students",
        "type": "optional",
        "description": "Custom query builder extracts student demographic fields"
      },
      {
        "moduleId": "mod_finance",
        "type": "optional",
        "description": "Financial reconciliation reports export billing transactions"
      }
    ],
    "requiredPermissions": [
      "reports.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/reports/page.tsx",
      "componentEntry": "components/reports",
      "typeDefinition": "types/reports.ts",
      "mockStore": "lib/mock/reportsData.ts",
      "testSuite": "tests/reports.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Browse and filter custom report builder entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 313
  },
  {
    "id": "sub_reports_library",
    "navId": "nav-reports-library",
    "name": "Report Library",
    "code": "REPORTS_LIBRARY",
    "description": "Dedicated submodule supporting specialized workflows for report library under Custom Report Builder.",
    "category": "reports_data_quality",
    "macroCategory": "analytics",
    "parentId": "mod_reports",
    "href": "/reports",
    "routes": [
      "/reports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/reports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_reports",
        "type": "required",
        "description": "Submodule requires parent module Custom Report Builder to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "reports.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/reports/page.tsx",
      "componentEntry": "components/reports",
      "typeDefinition": "types/reports.ts",
      "mockStore": "lib/mock/reportsData.ts",
      "testSuite": "tests/reports.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute report library operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: reports.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 314
  },
  {
    "id": "sub_reports_builder",
    "navId": "nav-reports-builder",
    "name": "Create Custom Report",
    "code": "REPORTS_BUILDER",
    "description": "Dedicated submodule supporting specialized workflows for create custom report under Custom Report Builder.",
    "category": "reports_data_quality",
    "macroCategory": "analytics",
    "parentId": "mod_reports",
    "href": "/reports/builder",
    "routes": [
      "/reports/builder"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/reports/builder/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_reports",
        "type": "required",
        "description": "Submodule requires parent module Custom Report Builder to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "reports.create"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/reports/builder/page.tsx",
      "componentEntry": "components/reports",
      "typeDefinition": "types/reports.ts",
      "mockStore": "lib/mock/reportsData.ts",
      "testSuite": "tests/reports.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute create custom report operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: reports.create"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 315
  },
  {
    "id": "sub_reports_saved",
    "navId": "nav-reports-saved",
    "name": "Saved Reports",
    "code": "REPORTS_SAVED",
    "description": "Dedicated submodule supporting specialized workflows for saved reports under Custom Report Builder.",
    "category": "reports_data_quality",
    "macroCategory": "analytics",
    "parentId": "mod_reports",
    "href": "/reports/saved",
    "routes": [
      "/reports/saved"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/reports/saved/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_reports",
        "type": "required",
        "description": "Submodule requires parent module Custom Report Builder to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "reports.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/reports/saved/page.tsx",
      "componentEntry": "components/reports",
      "typeDefinition": "types/reports.ts",
      "mockStore": "lib/mock/reportsData.ts",
      "testSuite": "tests/reports.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute saved reports operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: reports.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 316
  },
  {
    "id": "sub_reports_exports",
    "navId": "nav-reports-exports",
    "name": "Export Center",
    "code": "REPORTS_EXPORTS",
    "description": "Dedicated submodule supporting specialized workflows for export center under Custom Report Builder.",
    "category": "reports_data_quality",
    "macroCategory": "analytics",
    "parentId": "mod_reports",
    "href": "/reports/exports",
    "routes": [
      "/reports/exports"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/reports/exports/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_reports",
        "type": "required",
        "description": "Submodule requires parent module Custom Report Builder to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "reports.export"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/reports/exports/page.tsx",
      "componentEntry": "components/reports",
      "typeDefinition": "types/reports.ts",
      "mockStore": "lib/mock/reportsData.ts",
      "testSuite": "tests/reports.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute export center operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: reports.export"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 317
  },
  {
    "id": "sub_reports_schedules",
    "navId": "nav-reports-schedules",
    "name": "Automated Schedules",
    "code": "REPORTS_SCHEDULES",
    "description": "Dedicated submodule supporting specialized workflows for automated schedules under Custom Report Builder.",
    "category": "reports_data_quality",
    "macroCategory": "analytics",
    "parentId": "mod_reports",
    "href": "/reports/schedules",
    "routes": [
      "/reports/schedules"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/reports/schedules/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_reports",
        "type": "required",
        "description": "Submodule requires parent module Custom Report Builder to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "reports.schedule"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/reports/schedules/page.tsx",
      "componentEntry": "components/reports",
      "typeDefinition": "types/reports.ts",
      "mockStore": "lib/mock/reportsData.ts",
      "testSuite": "tests/reports.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute automated schedules operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: reports.schedule"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 318
  },
  {
    "id": "sub_reports_dq",
    "navId": "nav-reports-dq",
    "name": "Data Quality & Reconciliation",
    "code": "REPORTS_DQ",
    "description": "Dedicated submodule supporting specialized workflows for data quality & reconciliation under Custom Report Builder.",
    "category": "reports_data_quality",
    "macroCategory": "analytics",
    "parentId": "mod_reports",
    "href": "/reports/data-quality",
    "routes": [
      "/reports/data-quality"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional submodule page at app/(tenant)/reports/data-quality/page.tsx.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [
      {
        "moduleId": "mod_reports",
        "type": "required",
        "description": "Submodule requires parent module Custom Report Builder to be enabled and entitled"
      }
    ],
    "requiredPermissions": [
      "reports.data_quality.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/reports/data-quality/page.tsx",
      "componentEntry": "components/reports",
      "typeDefinition": "types/reports.ts",
      "mockStore": "lib/mock/reportsData.ts",
      "testSuite": "tests/reports.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Execute data quality & reconciliation operational steps",
      "Manage localized form validations and state transitions"
    ],
    "knownLimitations": [
      "Local development mock state boundary"
    ],
    "futureBackendRequirements": [
      "Granular endpoint-level authorization matching permission: reports.data_quality.view"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 319
  },
  {
    "id": "mod_campuses",
    "navId": "nav-campuses",
    "name": "Campuses & Branches",
    "code": "CAMPUSES",
    "description": "Full-spectrum tenant module for campuses & branches operations, data management, and user workflows.",
    "category": "campuses_governance",
    "macroCategory": "administration",
    "href": "/campuses",
    "routes": [
      "/campuses"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "settings.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/campuses/page.tsx",
      "componentEntry": "components/campuses",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/crossModuleIntegrationAndFinalAudit.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Browse and filter campuses & branches entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 320
  },
  {
    "id": "mod_settings",
    "navId": "nav-settings",
    "name": "School Settings",
    "code": "SETTINGS",
    "description": "Full-spectrum tenant module for school settings operations, data management, and user workflows.",
    "category": "tenant_settings",
    "macroCategory": "administration",
    "href": "/settings",
    "routes": [
      "/settings",
      "/settings/account",
      "/settings/profile",
      "/settings/security"
    ],
    "status": "implemented",
    "statusRationale": "Verified functional Next.js 16 page tree with typed models, mock fixtures, and passing test suites.",
    "isGloballyEnabled": true,
    "includedInPlans": [
      "starter",
      "growth",
      "enterprise"
    ],
    "requiresAddonLicense": false,
    "dependencies": [],
    "requiredPermissions": [
      "settings.view"
    ],
    "allowedRoles": [
      "super_admin",
      "school_principal",
      "academic_director",
      "teacher",
      "accountant",
      "librarian",
      "staff"
    ],
    "sourceEvidence": {
      "routePath": "app/(tenant)/settings/page.tsx",
      "componentEntry": "components/settings",
      "typeDefinition": "types/navigation.ts",
      "mockStore": "lib/mock/tenantData.ts",
      "testSuite": "tests/schoolSettings.test.ts",
      "navGroupId": "intelligence"
    },
    "supportedWorkflows": [
      "Browse and filter school settings entries",
      "Inspect detailed records with tabbed interfaces",
      "Create, edit, and audit lifecycle status changes",
      "Export reports and structured records"
    ],
    "knownLimitations": [
      "Mutations persist to client-side dev store only",
      "Production server-side API authorization boundary pending backend approval"
    ],
    "futureBackendRequirements": [
      "Authoritative multi-tenant PostgreSQL schema",
      "Cryptographically verified JWT license claims",
      "Server-side tenant isolation middleware"
    ],
    "dataSensitivity": "internal",
    "displayOrder": 321
  }
];

export const SYSTEM_ROUTES = [
  { route: '/', description: 'Root landing and authenticated dashboard router' },
  { route: '/login', description: 'Tenant authentication portal' },
  { route: '/forgot-password', description: 'Password reset recovery workflow' },
  { route: '/reset-password', description: 'Password update credentials token handler' },
  { route: '/accept-invitation', description: 'New user onboarding and invitation redemption' },
  { route: '/verify-email', description: 'Email verification handshake' },
  { route: '/403', description: 'Access forbidden and insufficient permissions error view' },
];

export const MODULES_BY_ID = new Map<string, TenantModuleDefinition>(
  MASTER_MODULE_REGISTRY.map((m) => [m.id, m])
);

export const MODULES_BY_NAV_ID = new Map<string, TenantModuleDefinition>(
  MASTER_MODULE_REGISTRY.map((m) => [m.navId, m])
);

export const TOP_LEVEL_MODULES = MASTER_MODULE_REGISTRY.filter((m) => !m.parentId);

export const SUBMODULES_BY_PARENT = MASTER_MODULE_REGISTRY.reduce<Record<string, TenantModuleDefinition[]>>(
  (acc, mod) => {
    if (mod.parentId) {
      if (!acc[mod.parentId]) acc[mod.parentId] = [];
      acc[mod.parentId].push(mod);
    }
    return acc;
  },
  {}
);
