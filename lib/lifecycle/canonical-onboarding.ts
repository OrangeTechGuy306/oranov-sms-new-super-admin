/**
 * Canonical Adaptable Tenant Onboarding Progress & Checklist Evaluator (Phase P0-5)
 *
 * Strictly Frontend-Only: Derives onboarding progress deterministically from actual
 * configuration state without hardcoded percentages, and adapts checklist applicability
 * by institutional categories (`nursery`, `primary`, `secondary`, `combined`, `college`,
 * `vocational`, `international`).
 *
 * Consumed symmetrically by:
 * - `frontend/` Tenant Onboarding Wizard, Settings & Onboarding Status UI
 * - `dashboard/` Super Admin Organization Details -> Onboarding tab
 *
 * Future Backend Responsibility:
 * - Persisting per-step verification timestamps, staff invitation dispatch status,
 *   and cross-campus onboarding milestones cleanly on the server.
 */

import type { CanonicalSchoolType } from "../modules/canonical-contract";

export type OnboardingChecklistItemStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped"
  | "blocked"
  | "requires_attention";

export type OnboardingChecklistCategory =
  | "identity"
  | "campus"
  | "academics"
  | "people"
  | "subscription"
  | "review";

export type OnboardingChecklistItemId =
  | "org_profile_completed"
  | "school_classification_selected"
  | "branding_configured"
  | "main_campus_configured"
  | "academic_session_configured"
  | "terms_or_semesters_configured"
  | "classes_or_programmes_configured"
  | "subjects_configured"
  | "primary_admin_configured"
  | "staff_setup_started"
  | "subscription_selected"
  | "initial_settings_reviewed";

export interface OnboardingChecklistItem {
  id: OnboardingChecklistItemId;
  title: string;
  description: string;
  category: OnboardingChecklistCategory;
  mandatory: boolean;
  allowSkip: boolean;
  applicable: boolean;
  status: OnboardingChecklistItemStatus;
  quickLinkHref: string;
  quickLinkLabel: string;
  detailMessage?: string;
}

export interface OnboardingProgressSummary {
  items: OnboardingChecklistItem[];
  applicableCount: number;
  completedCount: number;
  skippedCount: number;
  inProgressCount: number;
  blockedCount: number;
  requiresAttentionCount: number;
  notStartedCount: number;
  mandatoryTotal: number;
  mandatoryCompleted: number;
  overallPercentage: number;
  mandatoryPercentage: number;
  isMandatoryComplete: boolean;
  outstandingMandatory: OnboardingChecklistItem[];
  outstandingOptional: OnboardingChecklistItem[];
  derivedStatus: "not_started" | "in_progress" | "verification_pending" | "completed";
  adaptedForCategories: CanonicalSchoolType[];
}

export interface EvaluateOnboardingInput {
  /** Institutional categories (supports combined multi-category schools). */
  institutionCategories?: CanonicalSchoolType[];
  /** Basic org profile fields populated? */
  organizationName?: string;
  organizationCode?: string;
  organizationEmail?: string;
  organizationPhone?: string;
  organizationCountry?: string;
  /** Classification chosen? */
  hasClassification?: boolean;
  /** Visual branding customized or reviewed? */
  hasBranding?: boolean;
  /** Campus state */
  campusCount: number;
  hasMainCampus: boolean;
  mainCampusHasLocation?: boolean;
  /** Academic configuration state */
  sessionsCount: number;
  activeSessionConfigured?: boolean;
  termsCount: number;
  classesOrProgrammesCount: number;
  subjectsOrModulesCount: number;
  /** People & governance */
  primaryAdminName?: string;
  primaryAdminEmail?: string;
  staffSetupCount?: number;
  /** Subscription & P0-4 entitlements */
  hasPlanAssigned: boolean;
  subscriptionStatus?: string;
  /** Settings & review sign-off */
  settingsReviewed?: boolean;
  /** Explicit user-skipped optional task IDs */
  skippedItemIds?: OnboardingChecklistItemId[];
  /** Optional blockers reported externally (e.g. validation error on step) */
  blockedReasonsByItemId?: Partial<Record<OnboardingChecklistItemId, string>>;
  attentionReasonsByItemId?: Partial<Record<OnboardingChecklistItemId, string>>;
}

function normalizeCategories(input?: CanonicalSchoolType[]): CanonicalSchoolType[] {
  if (!input || input.length === 0) return ["combined"];
  const allowed: CanonicalSchoolType[] = [
    "nursery",
    "primary",
    "secondary",
    "combined",
    "college",
    "vocational",
    "international",
  ];
  const valid = input.filter((c) => allowed.includes(c));
  return valid.length > 0 ? Array.from(new Set(valid)) : ["combined"];
}

function resolveSkippedOrStatus(
  id: OnboardingChecklistItemId,
  computed: OnboardingChecklistItemStatus,
  allowSkip: boolean,
  skippedSet: Set<OnboardingChecklistItemId>,
  blockedReasons?: Partial<Record<OnboardingChecklistItemId, string>>,
  attentionReasons?: Partial<Record<OnboardingChecklistItemId, string>>
): { status: OnboardingChecklistItemStatus; detailMessage?: string } {
  const blocker = blockedReasons?.[id];
  if (blocker) {
    return { status: "blocked", detailMessage: blocker };
  }
  const attention = attentionReasons?.[id];
  if (attention && computed !== "completed") {
    return { status: "requires_attention", detailMessage: attention };
  }
  if (computed === "completed") {
    return { status: "completed" };
  }
  if (allowSkip && skippedSet.has(id)) {
    return { status: "skipped", detailMessage: "Marked as skipped for later setup." };
  }
  return { status: computed };
}

export function evaluateOnboardingChecklist(
  input: EvaluateOnboardingInput
): OnboardingProgressSummary {
  const categories = normalizeCategories(input.institutionCategories);
  const skippedSet = new Set<OnboardingChecklistItemId>(input.skippedItemIds ?? []);

  const isPureVocational =
    categories.includes("vocational") &&
    !categories.includes("primary") &&
    !categories.includes("secondary") &&
    !categories.includes("combined") &&
    !categories.includes("international");

  const isPureNursery =
    categories.length === 1 && categories[0] === "nursery";

  const isTertiaryOnly =
    categories.every((c) => c === "college" || c === "vocational");

  // 1. Organization Profile
  const orgFilledCount = [
    Boolean(input.organizationName?.trim()),
    Boolean(input.organizationCode?.trim()),
    Boolean(input.organizationEmail?.trim()),
    Boolean(input.organizationPhone?.trim()),
    Boolean(input.organizationCountry?.trim()),
  ].filter(Boolean).length;
  const orgProfileStatus: OnboardingChecklistItemStatus =
    orgFilledCount >= 4
      ? "completed"
      : orgFilledCount > 0
      ? "in_progress"
      : "not_started";

  // 2. Classification
  const classificationStatus: OnboardingChecklistItemStatus = input.hasClassification
    ? "completed"
    : "not_started";

  // 3. Branding (optional)
  const brandingStatus: OnboardingChecklistItemStatus = input.hasBranding
    ? "completed"
    : "not_started";

  // 4. Main Campus
  const campusStatus: OnboardingChecklistItemStatus =
    input.campusCount > 0 && input.hasMainCampus && input.mainCampusHasLocation !== false
      ? "completed"
      : input.campusCount > 0
      ? "requires_attention"
      : "not_started";

  // 5. Academic Session
  const sessionStatus: OnboardingChecklistItemStatus =
    input.sessionsCount > 0 && input.activeSessionConfigured !== false
      ? "completed"
      : input.sessionsCount > 0
      ? "in_progress"
      : "not_started";

  // 6. Terms / Semesters
  const termsStatus: OnboardingChecklistItemStatus =
    input.termsCount > 0 ? "completed" : "not_started";

  // 7. Classes / Programmes (adapted by school category)
  const structureLabel = isPureVocational
    ? "Vocational Programmes & Cohorts Configured"
    : categories.includes("college") && !categories.includes("primary") && !categories.includes("secondary")
    ? "Academic Programmes & Levels Configured"
    : isPureNursery
    ? "Early Years Rooms & Age Groups Configured"
    : "Classes & Grade Structure Configured";
  const structureDesc = isPureVocational
    ? "Define trade/vocational training programmes and cohort tracks without forcing K-12 class grades."
    : isPureNursery
    ? "Define nursery care rooms and early-years groups."
    : "Configure grade levels, classes, or programmes aligned to your school structure.";
  const structureStatus: OnboardingChecklistItemStatus =
    input.classesOrProgrammesCount > 0 ? "completed" : "not_started";

  // 8. Subjects / Curriculum Modules
  // Adaptable: optional for pure Nursery or pure Vocational where curriculum modules may sit under programmes
  const subjectsMandatory = !isPureNursery && !isPureVocational;
  const subjectsApplicable = !isPureNursery; // Pure nursery uses play/developmental milestones rather than formal exam subjects
  const subjectsTitle = isPureVocational
    ? "Curriculum Modules / Trade Units Configured"
    : isTertiaryOnly
    ? "Courses & Departments Configured"
    : "Subjects Configured";
  const subjectsStatus: OnboardingChecklistItemStatus =
    input.subjectsOrModulesCount > 0 ? "completed" : "not_started";

  // 9. Primary Administrator
  const hasAdminName = Boolean(input.primaryAdminName?.trim());
  const hasAdminEmail = Boolean(input.primaryAdminEmail?.trim());
  const adminStatus: OnboardingChecklistItemStatus =
    hasAdminName && hasAdminEmail
      ? "completed"
      : hasAdminName || hasAdminEmail
      ? "requires_attention"
      : "not_started";

  // 10. Staff Setup Started (optional)
  const staffStatus: OnboardingChecklistItemStatus =
    (input.staffSetupCount ?? 0) > 0 ? "completed" : "not_started";

  // 11. Subscription & Modules Selected
  const subStatus: OnboardingChecklistItemStatus = input.hasPlanAssigned
    ? "completed"
    : "not_started";

  // 12. Initial Settings Reviewed
  const reviewStatus: OnboardingChecklistItemStatus = input.settingsReviewed
    ? "completed"
    : "not_started";

  const definitions: Array<{
    id: OnboardingChecklistItemId;
    title: string;
    description: string;
    category: OnboardingChecklistCategory;
    mandatory: boolean;
    allowSkip: boolean;
    applicable: boolean;
    rawStatus: OnboardingChecklistItemStatus;
    quickLinkHref: string;
    quickLinkLabel: string;
    defaultAttention?: string;
  }> = [
    {
      id: "org_profile_completed",
      title: "Organization Profile Completed",
      description: "School identity, official contact details, and physical headquarters address.",
      category: "identity",
      mandatory: true,
      allowSkip: false,
      applicable: true,
      rawStatus: orgProfileStatus,
      quickLinkHref: "/onboarding?step=profile",
      quickLinkLabel: "Edit School Profile",
    },
    {
      id: "school_classification_selected",
      title: "School Classification Selected",
      description: "Institutional category selection supporting single or combined school levels.",
      category: "identity",
      mandatory: true,
      allowSkip: false,
      applicable: true,
      rawStatus: classificationStatus,
      quickLinkHref: "/onboarding?step=profile",
      quickLinkLabel: "Select Classification",
    },
    {
      id: "branding_configured",
      title: "School Branding & Identity Configured",
      description: "Optional logo mark, primary palette, and letterhead tagline customization.",
      category: "identity",
      mandatory: false,
      allowSkip: true,
      applicable: true,
      rawStatus: brandingStatus,
      quickLinkHref: "/settings?tab=branding",
      quickLinkLabel: "Configure Branding",
    },
    {
      id: "main_campus_configured",
      title: "Main Campus Configured",
      description: "Primary campus branch name, unique campus code, and operational address.",
      category: "campus",
      mandatory: true,
      allowSkip: false,
      applicable: true,
      rawStatus: campusStatus,
      quickLinkHref: "/onboarding?step=campus",
      quickLinkLabel: "Configure Campuses",
      defaultAttention:
        input.campusCount > 0 && !input.hasMainCampus
          ? "At least one campus exists, but no campus is designated as the Main Campus."
          : input.mainCampusHasLocation === false
          ? "Main campus address details need completion."
          : undefined,
    },
    {
      id: "academic_session_configured",
      title: "Academic Session Configured",
      description: "Active academic year/session defined cleanly without duplicate records.",
      category: "academics",
      mandatory: true,
      allowSkip: false,
      applicable: true,
      rawStatus: sessionStatus,
      quickLinkHref: "/onboarding?step=academics",
      quickLinkLabel: "Configure Session",
    },
    {
      id: "terms_or_semesters_configured",
      title: isTertiaryOnly
        ? "Semesters / Academic Periods Configured"
        : "Terms or Semesters Configured",
      description: "Reporting periods and start/end dates within the active academic session.",
      category: "academics",
      mandatory: true,
      allowSkip: false,
      applicable: true,
      rawStatus: termsStatus,
      quickLinkHref: "/onboarding?step=academics",
      quickLinkLabel: "Configure Periods",
    },
    {
      id: "classes_or_programmes_configured",
      title: structureLabel,
      description: structureDesc,
      category: "academics",
      mandatory: true,
      allowSkip: false,
      applicable: true,
      rawStatus: structureStatus,
      quickLinkHref: "/onboarding?step=academics",
      quickLinkLabel: isPureVocational ? "Configure Programmes" : "Configure Classes",
    },
    {
      id: "subjects_configured",
      title: subjectsTitle,
      description: isPureVocational
        ? "Optional subject/module catalog for specialized vocational training units."
        : "Core academic subjects and departmental assignments.",
      category: "academics",
      mandatory: subjectsMandatory,
      allowSkip: !subjectsMandatory,
      applicable: subjectsApplicable,
      rawStatus: subjectsStatus,
      quickLinkHref: "/onboarding?step=academics",
      quickLinkLabel: "Configure Subjects",
    },
    {
      id: "primary_admin_configured",
      title: "Primary Administrator Configured",
      description: "Designated proprietor or primary school administrator contact and governance role.",
      category: "people",
      mandatory: true,
      allowSkip: false,
      applicable: true,
      rawStatus: adminStatus,
      quickLinkHref: "/onboarding?step=staff",
      quickLinkLabel: "Verify Administrator",
      defaultAttention:
        adminStatus === "requires_attention"
          ? "Provide both primary administrator name and valid email."
          : undefined,
    },
    {
      id: "staff_setup_started",
      title: "Leadership & Initial Staff Setup Started",
      description:
        "Stage simulated leadership, campus admin, or department staff invitations prior to launch.",
      category: "people",
      mandatory: false,
      allowSkip: true,
      applicable: true,
      rawStatus: staffStatus,
      quickLinkHref: "/onboarding?step=staff",
      quickLinkLabel: "Stage Staff Setup",
    },
    {
      id: "subscription_selected",
      title: "Subscription & Modules Reviewed",
      description: "Confirm P0-4 subscription tier, included modules, add-ons, and quota ceilings.",
      category: "subscription",
      mandatory: true,
      allowSkip: false,
      applicable: true,
      rawStatus: subStatus,
      quickLinkHref: "/onboarding?step=subscription",
      quickLinkLabel: "Review Subscription",
    },
    {
      id: "initial_settings_reviewed",
      title: "Initial School Settings Reviewed",
      description: "Verify summary configuration, unresolved tasks, and simulate onboarding sign-off.",
      category: "review",
      mandatory: true,
      allowSkip: false,
      applicable: true,
      rawStatus: reviewStatus,
      quickLinkHref: "/onboarding?step=review",
      quickLinkLabel: "Final Review",
    },
  ];

  const items: OnboardingChecklistItem[] = definitions.map((def) => {
    const mergedAttention = {
      ...(def.defaultAttention ? { [def.id]: def.defaultAttention } : {}),
      ...(input.attentionReasonsByItemId ?? {}),
    };
    const resolved = resolveSkippedOrStatus(
      def.id,
      def.rawStatus,
      def.allowSkip,
      skippedSet,
      input.blockedReasonsByItemId,
      mergedAttention
    );

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      category: def.category,
      mandatory: def.mandatory,
      allowSkip: def.allowSkip,
      applicable: def.applicable,
      status: resolved.status,
      quickLinkHref: def.quickLinkHref,
      quickLinkLabel: def.quickLinkLabel,
      detailMessage: resolved.detailMessage,
    };
  });

  const applicableItems = items.filter((item) => item.applicable);
  const completedCount = applicableItems.filter((i) => i.status === "completed").length;
  const skippedCount = applicableItems.filter((i) => i.status === "skipped").length;
  const inProgressCount = applicableItems.filter((i) => i.status === "in_progress").length;
  const blockedCount = applicableItems.filter((i) => i.status === "blocked").length;
  const requiresAttentionCount = applicableItems.filter(
    (i) => i.status === "requires_attention"
  ).length;
  const notStartedCount = applicableItems.filter((i) => i.status === "not_started").length;

  const mandatoryApplicable = applicableItems.filter((i) => i.mandatory);
  const mandatoryCompleted = mandatoryApplicable.filter(
    (i) => i.status === "completed"
  ).length;

  const resolvedTotal = completedCount + skippedCount;
  const overallPercentage =
    applicableItems.length > 0
      ? Math.round((resolvedTotal / applicableItems.length) * 100)
      : 0;
  const mandatoryPercentage =
    mandatoryApplicable.length > 0
      ? Math.round((mandatoryCompleted / mandatoryApplicable.length) * 100)
      : 100;

  const outstandingMandatory = mandatoryApplicable.filter((i) => i.status !== "completed");
  const outstandingOptional = applicableItems.filter(
    (i) => !i.mandatory && i.status !== "completed" && i.status !== "skipped"
  );

  const isMandatoryComplete =
    outstandingMandatory.length === 0 && blockedCount === 0;

  let derivedStatus: OnboardingProgressSummary["derivedStatus"] = "not_started";
  if (isMandatoryComplete && input.settingsReviewed) {
    derivedStatus = "completed";
  } else if (
    mandatoryCompleted >= Math.max(1, mandatoryApplicable.length - 1) &&
    !input.settingsReviewed &&
    blockedCount === 0
  ) {
    derivedStatus = "verification_pending";
  } else if (completedCount > 0 || inProgressCount > 0 || skippedCount > 0 || requiresAttentionCount > 0) {
    derivedStatus = "in_progress";
  }

  return {
    items,
    applicableCount: applicableItems.length,
    completedCount,
    skippedCount,
    inProgressCount,
    blockedCount,
    requiresAttentionCount,
    notStartedCount,
    mandatoryTotal: mandatoryApplicable.length,
    mandatoryCompleted,
    overallPercentage,
    mandatoryPercentage,
    isMandatoryComplete,
    outstandingMandatory,
    outstandingOptional,
    derivedStatus,
    adaptedForCategories: categories,
  };
}
