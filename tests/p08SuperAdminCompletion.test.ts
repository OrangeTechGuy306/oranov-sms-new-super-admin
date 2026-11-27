import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  computeMonetizationAnalytics,
  round2,
  CANONICAL_REFERENCE_DATE,
} from "@/lib/monetization/evaluator";
import {
  computeMonetizationMetrics,
  computeTenantGrowthMetrics,
  getDefaultAnalyticsFilters,
} from "@/lib/analytics/evaluator";
import { CANONICAL_TENANT_LIFECYCLE_STATUSES } from "@/lib/lifecycle/canonical-lifecycle";
import type { Organization, SubscriptionPlan, OrganizationSubscription, Invoice } from "@/lib/types";

describe("P0-8 Super Admin Dashboard Completion & Financial Integrity", () => {
  it("normalizes quarterly subscriptions as priceQuarterly / 3 in both monetization and analytics evaluators", () => {
    const plan: SubscriptionPlan = {
      id: "plan-q-test",
      name: "Growth Tier",
      tier: "growth",
      description: "Test tier",
      priceMonthly: 200,
      priceQuarterly: 540,
      priceAnnual: 1800,
      currency: "NGN",
      maxStudents: 1000,
      maxStaff: 100,
      maxCampuses: 3,
      storageGb: 50,
      features: [],
      includedModuleIds: ["mod_dashboard"],
      isActive: true,
    };

    const subQ: OrganizationSubscription = {
      id: "sub-q-1",
      organizationId: "org-1",
      planId: plan.id,
      status: "active",
      billingCycle: "quarterly",
      currentPeriodStart: "2026-10-01T00:00:00.000Z",
      currentPeriodEnd: "2027-01-01T00:00:00.000Z",
      cancelAtPeriodEnd: false,
      updatedAt: "2026-10-01T00:00:00.000Z",
    };

    const monetization = computeMonetizationAnalytics([subQ], [plan], [], [], CANONICAL_REFERENCE_DATE);
    assert.equal(monetization.currencyBreakdown["NGN"].mrr, 180);
    assert.equal(monetization.currencyBreakdown["NGN"].arr, round2(180 * 12));

    const filters = { ...getDefaultAnalyticsFilters(), currency: "NGN" };
    const analytics = computeMonetizationMetrics([subQ], [plan], [], [], filters);
    assert.equal(analytics.currencyBreakdown["NGN"].mrr, 180);
  });

  it("matches all 12 canonical tenant lifecycle statuses including normalized legacy statuses in analytics filters", () => {
    assert.equal(CANONICAL_TENANT_LIFECYCLE_STATUSES.length, 12);

    const orgs = [
      { id: "o-1", status: "pending", onboardingStatus: "not_started", createdAt: "2026-10-10T00:00:00Z" },
      { id: "o-2", status: "trial", onboardingStatus: "in_progress", createdAt: "2026-10-12T00:00:00Z" },
    ] as unknown as Organization[];

    const filteredRegPending = computeTenantGrowthMetrics(orgs, [], {
      ...getDefaultAnalyticsFilters(),
      status: "registration_pending",
    });
    assert.equal(filteredRegPending.totalRegistered, 1);

    const toolbarSrc = fs.readFileSync(
      path.join(process.cwd(), "components/analytics/AnalyticsReportingToolbar.tsx"),
      "utf8"
    );
    assert.ok(toolbarSrc.includes("CANONICAL_TENANT_LIFECYCLE_STATUSES"));
  });

  it("derives overview readiness from live operationalComponents and isolates currencies across subscription/invoice ledgers", () => {
    const overviewSrc = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf8");
    assert.ok(overviewSrc.includes("operationalComponents"));
    assert.ok(!overviewSrc.includes("systemServices.slice(0, 4)"));

    const analyticsPageSrc = fs.readFileSync(
      path.join(process.cwd(), "app/subscriptions/analytics/page.tsx"),
      "utf8"
    );
    assert.ok(analyticsPageSrc.includes("currencyPaidCount"));
    assert.ok(!analyticsPageSrc.includes("invoicedVolume"));

    const invoicesPageSrc = fs.readFileSync(
      path.join(process.cwd(), "app/subscriptions/invoices/page.tsx"),
      "utf8"
    );
    assert.ok(invoicesPageSrc.includes("byCurrency"));
    assert.ok(invoicesPageSrc.includes("financialTotals.currencies.map"));

    const subsPageSrc = fs.readFileSync(path.join(process.cwd(), "app/subscriptions/page.tsx"), "utf8");
    assert.ok(subsPageSrc.includes("outstandingByCurrency"));
  });

  it("contains zero native window.confirm/prompt/alert calls in dashboard UI source", () => {
    const roots = [path.join(process.cwd(), "app"), path.join(process.cwd(), "components")];
    const offending: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
          const lines = fs.readFileSync(full, "utf8").split("\n");
          lines.forEach((line, idx) => {
            if (!line.trim().startsWith("*") && !line.trim().startsWith("//")) {
              if (/\b(?:window\.)?(confirm|prompt|alert)\s*\(/.test(line)) {
                offending.push(`${path.relative(process.cwd(), full)}:${idx + 1}`);
              }
            }
          });
        }
      }
    };
    roots.forEach(walk);
    assert.deepEqual(offending, []);
  });
});
