/**
 * Deterministic Tenant Provisioning Preparation Simulator (Phase P0-5)
 *
 * Strictly Frontend-Only: Models transparent 8-stage business-level tenant preparation
 * workflow without simulating technical backend infrastructure (no DB schema creation,
 * RLS containers, DNS zone provisioning, TLS certificate issuance, or live email dispatch).
 *
 * Future Backend Responsibility:
 * - Asynchronous server-side tenant provisioning jobs, database isolation, custom domain
 *   TLS verification, and transactional email delivery.
 */

import { CANONICAL_MODULE_REGISTRY } from "@/lib/modules/canonical-registry-snapshot";
import { isSchoolTypeCompatible } from "@/lib/modules/canonical-contract";
import { normalizeSchoolCategories } from "@/lib/api/tenantContractAdapter";
import type {
  Campus,
  Organization,
  OrganizationSubscription,
  ProvisioningStatus,
  SubscriptionPlan,
} from "../types";
import type { OrganizationReadinessReport } from "../readiness/evaluator";

export type SimulatedStageStatus =
  | "succeeded"
  | "failed"
  | "skipped"
  | "warning"
  | "pending_review";

export type StageValidationResult =
  | "passed"
  | "passed_with_warnings"
  | "failed"
  | "blocked";

export type ProvisioningStageKey =
  | "registration_accepted"
  | "profile_prepared"
  | "initial_campus_prepared"
  | "institution_structure_configured"
  | "subscription_assigned"
  | "entitlements_prepared"
  | "initial_administrator_configured"
  | "ready_for_activation";

export interface SimulatedProvisioningEvent {
  id: string;
  organizationId: string;
  stepNumber?: number;
  stepKey: ProvisioningStageKey | string;
  stepName: string;
  description?: string;
  status: SimulatedStageStatus;
  validationResult?: StageValidationResult;
  warningOrError?: string;
  message: string;
  timestamp: string;
  attempt?: number;
}

export interface SimulationResult {
  success: boolean;
  status: ProvisioningStatus;
  events: SimulatedProvisioningEvent[];
  failedStageKey?: string;
  manualReviewRequired?: boolean;
  error?: string;
  summary: string;
}

export function executeSimulatedProvisioning(params: {
  organization: Organization;
  readiness: OrganizationReadinessReport;
  campuses: Campus[];
  plan?: SubscriptionPlan;
  subscription?: OrganizationSubscription;
  forceFail?: boolean;
  forceFailStageKey?: ProvisioningStageKey;
  markForManualReview?: boolean;
  attempt?: number;
}): SimulationResult {
  const {
    organization: org,
    readiness,
    campuses,
    plan,
    subscription,
    forceFail = false,
    forceFailStageKey = "subscription_assigned",
    markForManualReview = false,
    attempt = 1,
  } = params;
  const now = new Date().toISOString();
  const categories = normalizeSchoolCategories(
    org.classification,
    org.institutionCategories
  );
  const categoriesLabel = categories.join(", ");

  // 1. Guard against incomplete readiness prerequisites
  if (readiness.hasBlockers) {
    const blockers = readiness.items
      .filter((i) => i.status === "incomplete")
      .map((i) => i.title);

    return {
      success: false,
      status: "needs_attention",
      manualReviewRequired: true,
      events: [
        {
          id: `sim_evt_${Date.now()}_block`,
          organizationId: org.id,
          stepNumber: 1,
          stepKey: "registration_accepted",
          stepName: "Readiness Prerequisite Gate",
          description:
            "Validates mandatory tenant identity, main campus, administrator, and plan configuration.",
          status: "failed",
          validationResult: "blocked",
          warningOrError: `Unresolved prerequisites: ${blockers.join(", ")}`,
          message: `Blocked: ${blockers.join(", ")} must be resolved before provisioning preparation can complete.`,
          timestamp: now,
          attempt,
        },
      ],
      failedStageKey: "registration_accepted",
      error: `Cannot run provisioning simulation: ${blockers.length} unresolved readiness prerequisite(s).`,
      summary: "Simulation halted at readiness validation gate.",
    };
  }

  const orgCampuses = campuses.filter((c) => c.organizationId === org.id);
  const mainCampus = orgCampuses.find((c) => c.isMainCampus) || orgCampuses[0];
  const compatibleModules = CANONICAL_MODULE_REGISTRY.filter((m) =>
    categories.some((cat) => isSchoolTypeCompatible(cat, m.supportedSchoolTypes))
  );

  const stageSpecs: Array<{
    stepKey: ProvisioningStageKey;
    stepName: string;
    description: string;
    build: () => {
      status: SimulatedStageStatus;
      validationResult: StageValidationResult;
      warningOrError?: string;
      message: string;
    };
  }> = [
    {
      stepKey: "registration_accepted",
      stepName: "1. Tenant Registration Accepted",
      description: "Confirms registration record, tenant identifier, and lifecycle eligibility.",
      build: () => ({
        status: "succeeded",
        validationResult: "passed",
        message: `Registration intake validated locally for ${org.name} (Code: ${org.code}, Status: ${org.status}).`,
      }),
    },
    {
      stepKey: "profile_prepared",
      stepName: "2. Tenant Profile Prepared",
      description: "Checks official organization profile, legal name, contact coordinates, and regional locale.",
      build: () => {
        const missingOptional: string[] = [];
        if (!org.legalName?.trim()) missingOptional.push("legal name");
        if (!org.organizationType) missingOptional.push("organization ownership type");
        return missingOptional.length > 0
          ? {
              status: "warning",
              validationResult: "passed_with_warnings",
              warningOrError: `Optional metadata absent: ${missingOptional.join(", ")}.`,
              message: `Organization profile staged (${org.technicalConfig.timezone}, ${org.technicalConfig.currency}) with optional fields noted: ${missingOptional.join(", ")}.`,
            }
          : {
              status: "succeeded",
              validationResult: "passed",
              message: `Full profile prepared for ${org.legalName || org.name} (${org.technicalConfig.timezone}, ${org.technicalConfig.currency}).`,
            };
      },
    },
    {
      stepKey: "initial_campus_prepared",
      stepName: "3. Initial Campus Prepared",
      description: "Validates designated main campus record and branch capacity configuration.",
      build: () => ({
        status: "succeeded",
        validationResult: "passed",
        message: mainCampus
          ? `Main campus "${mainCampus.name}" (${mainCampus.code}) prepared across ${orgCampuses.length} branch record(s).`
          : "Campus placeholder verified.",
      }),
    },
    {
      stepKey: "institution_structure_configured",
      stepName: "4. Institution Structure Configured",
      description: "Applies institutional categories and adaptive curriculum track readiness.",
      build: () => ({
        status: "succeeded",
        validationResult: "passed",
        message: `Institution structure configured for category profile [${categoriesLabel}]. Tenant-level academic wizard prepares sessions & classes/programmes.`,
      }),
    },
    {
      stepKey: "subscription_assigned",
      stepName: "5. Subscription Assigned",
      description: "Binds selected P0-4 plan tier, billing cycle, and payment standing independently.",
      build: () => {
        if (!subscription || subscription.status === "past_due") {
          return {
            status: "warning",
            validationResult: "passed_with_warnings",
            warningOrError:
              subscription?.status === "past_due"
                ? "Subscription is currently past due; billing remediation needed separately."
                : "Subscription ledger staged without active commercial record.",
            message: `Plan "${plan?.name || org.planId}" assigned (Status: ${subscription?.status || org.subscriptionStatus || "staged"}).`,
          };
        }
        return {
          status: "succeeded",
          validationResult: "passed",
          message: `Plan "${plan?.name || org.planId}" bound in "${subscription.status}" status (${subscription.billingCycle}).`,
        };
      },
    },
    {
      stepKey: "entitlements_prepared",
      stepName: "6. Module Entitlements Prepared",
      description: "Evaluates canonical P0-4 module registry and plan entitlement snapshot.",
      build: () => ({
        status: "succeeded",
        validationResult: "passed",
        message: `Prepared P0-4 entitlement graph against ${CANONICAL_MODULE_REGISTRY.length} canonical modules (${compatibleModules.length} category-compatible).`,
      }),
    },
    {
      stepKey: "initial_administrator_configured",
      stepName: "7. Initial Administrator Configured",
      description:
        "Records primary administrator contact & governance designation (simulated only; no email dispatched).",
      build: () => ({
        status: "succeeded",
        validationResult: "passed",
        message: `Primary administrator ${org.administrator.name} (${org.administrator.email}) configured in local fixtures. Invitation email dispatch requires future backend mailer.`,
      }),
    },
    {
      stepKey: "ready_for_activation",
      stepName: "8. Tenant Marked Ready for Activation",
      description:
        "Completes simulated preparation workflow and signals readiness for operator activation sign-off.",
      build: () =>
        markForManualReview
          ? {
              status: "pending_review",
              validationResult: "passed_with_warnings",
              warningOrError: "Flagged for Super Admin manual review prior to activation.",
              message:
                "All preparation checks staged; awaiting manual operator sign-off in Ready for Review queue.",
            }
          : {
              status: "succeeded",
              validationResult: "passed",
              message:
                "Simulated tenant preparation complete. Organization is ready for Super Admin lifecycle activation.",
            },
    },
  ];

  const events: SimulatedProvisioningEvent[] = [];
  for (let idx = 0; idx < stageSpecs.length; idx++) {
    const spec = stageSpecs[idx];
    const stepNumber = idx + 1;

    if (forceFail && spec.stepKey === forceFailStageKey) {
      events.push({
        id: `sim_evt_${Date.now()}_${stepNumber}`,
        organizationId: org.id,
        stepNumber,
        stepKey: spec.stepKey,
        stepName: spec.stepName,
        description: spec.description,
        status: "failed",
        validationResult: "failed",
        warningOrError:
          `Simulated verification halt at "${spec.stepName}" (attempt #${attempt}) for negative recovery testing.`,
        message: `Simulated failure triggered on "${spec.stepName}". Correct validation or retry simulation.`,
        timestamp: now,
        attempt,
      });

      // Mark subsequent stages as skipped
      for (let restIdx = idx + 1; restIdx < stageSpecs.length; restIdx++) {
        const restSpec = stageSpecs[restIdx];
        events.push({
          id: `sim_evt_${Date.now()}_${restIdx + 1}`,
          organizationId: org.id,
          stepNumber: restIdx + 1,
          stepKey: restSpec.stepKey,
          stepName: restSpec.stepName,
          description: restSpec.description,
          status: "skipped",
          validationResult: "blocked",
          message: `Skipped due to simulated failure in stage "${spec.stepName}".`,
          timestamp: now,
          attempt,
        });
      }

      return {
        success: false,
        status: "simulated_failed",
        failedStageKey: spec.stepKey,
        events,
        error: `Simulated provisioning failure at stage "${spec.stepName}" for retry/recovery testing.`,
        summary: `Simulated preparation halted at step ${stepNumber} of ${stageSpecs.length}.`,
      };
    }

    const built = spec.build();
    events.push({
      id: `sim_evt_${Date.now()}_${stepNumber}`,
      organizationId: org.id,
      stepNumber,
      stepKey: spec.stepKey,
      stepName: spec.stepName,
      description: spec.description,
      status: built.status,
      validationResult: built.validationResult,
      warningOrError: built.warningOrError,
      message: built.message,
      timestamp: now,
      attempt,
    });
  }

  const finalStatus: ProvisioningStatus = markForManualReview
    ? "ready_for_review"
    : "simulated_complete";

  return {
    success: true,
    status: finalStatus,
    manualReviewRequired: markForManualReview,
    events,
    summary: markForManualReview
      ? `Completed ${stageSpecs.length} preparation stages; queued for manual review.`
      : `All ${stageSpecs.length} tenant preparation stages completed cleanly in simulation mode (attempt #${attempt}).`,
  };
}
