import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { PlatformStore } from "../lib/data/platform-store";
import { validatePlanDefinition } from "../lib/monetization/evaluator";

describe("P0-10 Final Product Audit & Super Admin Remediations", () => {
  let store: PlatformStore;

  beforeEach(() => {
    store = new PlatformStore();
    store.resetToDefaults();
  });

  it("allows editing an existing subscription plan by excluding self from duplicate tier/name check", () => {
    const plans = store.getPlans();
    const targetPlan = plans[0];
    assert.ok(targetPlan, "Seeded subscription plan must exist");

    const validation = validatePlanDefinition(
      {
        name: targetPlan.name,
        tier: targetPlan.tier,
        currency: targetPlan.currency,
        priceMonthly: targetPlan.priceMonthly,
        priceQuarterly: targetPlan.priceQuarterly,
        priceAnnual: targetPlan.priceAnnual,
        trialDays: targetPlan.trialDays,
        maxCampuses: targetPlan.maxCampuses,
        maxStudents: targetPlan.maxStudents,
        maxStaff: targetPlan.maxStaff,
      },
      plans.filter((p) => p.id !== targetPlan.id)
    );

    assert.equal(validation.isValid, true, `Editing existing plan must pass validation: ${validation.errors.join("; ")}`);
  });

  it("skips paid invoice generation for trial orgs and bills quarterly cycle at quarterly rate", () => {
    const plans = store.getPlans();
    const trialResult = store.createOrganization({
      name: "Trial Montessori Prep",
      code: "TRIALMP",
      classification: "primary",
      subdomain: "trial-montessori",
      contact: {
        email: "admin@trialmp.edu",
        phone: "+234 800 100 2000",
        address: "10 Palm Ave",
        city: "Lagos",
        stateOrProvince: "LA",
        country: "Nigeria",
      },
      administrator: {
        name: "Adaeze Okafor",
        email: "adaeze@trialmp.edu",
        phone: "+234 800 100 2001",
        roleTitle: "Head of School",
      },
      planId: plans[1].id,
      billingCycle: "monthly",
      startTrial: true,
      technicalConfig: {
        subdomain: "trial-montessori",
        timezone: "Africa/Lagos",
        academicYearStartMonth: 9,
        currency: "NGN",
        locale: "en-NG",
        maxCampuses: 2,
      },
    });
    assert.equal(trialResult.success, true);
    assert.ok(trialResult.organization);
    const trialInvoices = store.getInvoicesByOrgId(trialResult.organization.id);
    assert.equal(trialInvoices.length, 0, "Trial org must not generate an issued paid invoice");

    const quarterlyPlan = plans[1];
    const quarterlyResult = store.createOrganization({
      name: "Quarterly Collegiate Institute",
      code: "QTRCOL",
      classification: "secondary",
      subdomain: "qtr-collegiate",
      contact: {
        email: "bursar@qtrcol.edu",
        phone: "+1 555 200 3000",
        address: "20 Broad St",
        city: "Austin",
        stateOrProvince: "TX",
        country: "United States",
      },
      administrator: {
        name: "Daniel Brooks",
        email: "dbrooks@qtrcol.edu",
        phone: "+1 555 200 3001",
        roleTitle: "Principal",
      },
      planId: quarterlyPlan.id,
      billingCycle: "quarterly",
      startTrial: false,
      technicalConfig: {
        subdomain: "qtr-collegiate",
        timezone: "America/Chicago",
        academicYearStartMonth: 8,
        currency: "USD",
        locale: "en-US",
        maxCampuses: 3,
      },
    });

    assert.equal(quarterlyResult.success, true);
    assert.ok(quarterlyResult.organization);
    const quarterlyInvoices = store.getInvoicesByOrgId(quarterlyResult.organization.id);
    assert.ok(quarterlyInvoices.length >= 1, "Paid quarterly org must generate an initial invoice");
    assert.equal(
      quarterlyInvoices[0].amountDue,
      quarterlyPlan.priceQuarterly ?? quarterlyPlan.priceMonthly * 3
    );
  });

  it("attributes compliance control remediation and governance evidence updates to the supplied reviewer", () => {
    const controls = store.getComplianceControls();
    assert.ok(controls.length > 0);
    const controlId = controls[0].id;

    const updatedControl = store.updateComplianceControlRemediation(
      controlId,
      "Reviewed evidence trail during P0-10 audit",
      "2026-12-31",
      {
        id: "usr_compliance_09",
        name: "Nadia Compliance",
        email: "nadia@sms-platform.io",
        role: "compliance_auditor",
      }
    );
    assert.equal(updatedControl.success, true);
    const controlEvt = store.getAuditEvents().find(
      (e) => e.action === "COMPLIANCE_CONTROL_REMEDIATION_UPDATED" && e.targetId === controlId
    );
    assert.equal(controlEvt?.actor.id, "usr_compliance_09");

    const evidenceItems = store.getGovernanceEvidence();
    assert.ok(evidenceItems.length > 0);
    const updatedEvidence = store.updateGovernanceEvidenceStatus(
      evidenceItems[0].id,
      "verified",
      "Verified during P0-10 check",
      {
        id: "usr_compliance_09",
        name: "Nadia Compliance",
        email: "nadia@sms-platform.io",
        role: "compliance_auditor",
      }
    );
    assert.equal(updatedEvidence.success, true);
    const evEvt = store.getAuditEvents().find(
      (e) => e.action === "GOVERNANCE_EVIDENCE_STATUS_UPDATED" && e.targetId === evidenceItems[0].id
    );
    assert.equal(evEvt?.actor.id, "usr_compliance_09");
  });

  it("uses canonical PaymentMethodType literals across billing UI and supports extended orgs in generateStaticParams", () => {
    const invoicePage = fs.readFileSync(path.join(process.cwd(), "app/subscriptions/invoices/page.tsx"), "utf8");
    const subClient = fs.readFileSync(
      path.join(process.cwd(), "app/subscriptions/[subscriptionId]/SubscriptionDetailClient.tsx"),
      "utf8"
    );
    const orgDetailPage = fs.readFileSync(
      path.join(process.cwd(), "app/organizations/[organizationId]/page.tsx"),
      "utf8"
    );

    assert.equal(invoicePage.includes('"credit_card"'), false);
    assert.equal(invoicePage.includes('"cash_deposit"'), false);
    assert.equal(subClient.includes('"credit_card"'), false);
    assert.ok(orgDetailPage.includes("EXTENDED_P05_ORGANIZATIONS"));
  });
});
