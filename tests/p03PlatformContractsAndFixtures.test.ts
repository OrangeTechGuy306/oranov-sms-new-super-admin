import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getPlatformFrontendEnvConfig } from "@/lib/config/env";
import {
  PlatformApiError,
  getPlatformDataSourceMode,
  getUserFriendlyPlatformError,
  setPlatformMockFaultInjector,
  withPlatformDataSourceMode,
} from "@/lib/api/dataSource";
import {
  organizationSchema,
  validateApiResponse,
  validateRequestPayload,
} from "@/lib/api/contracts";
import { platformService } from "@/lib/api/platformService";
import {
  deriveTenantFeaturesFromModules,
  mapOrganizationStatusToTenantStatus,
  mapPlatformCampusStatusToTenantStatus,
  projectOrganizationToTenantContract,
} from "@/lib/api/tenantContractAdapter";
import {
  INITIAL_CAMPUSES,
  INITIAL_ORGANIZATIONS,
  INITIAL_PLANS,
} from "@/lib/data/initial-data";
import { INITIAL_STUDENT_OVERSIGHT_DATA } from "@/lib/data/student-oversight-fixtures";
import { INITIAL_ACADEMIC_OVERSIGHT_DATA } from "@/lib/data/academic-oversight-fixtures";
import { INITIAL_EXTENDED_PLANS } from "@/lib/monetization/fixtures";
import { MASTER_MODULE_REGISTRY } from "@/lib/modules/registry-data";

type MutableEnv = Record<string, string | undefined>;

async function withEnv<T>(
  overrides: Record<string, string | undefined>,
  fn: () => Promise<T> | T
): Promise<T> {
  const env = process.env as MutableEnv;
  const previous: Record<string, string | undefined> = {};
  for (const key of Object.keys(overrides)) {
    previous[key] = env[key];
    if (overrides[key] === undefined) {
      delete env[key];
    } else {
      env[key] = overrides[key];
    }
  }
  try {
    return await fn();
  } finally {
    for (const key of Object.keys(overrides)) {
      if (previous[key] === undefined) {
        delete env[key];
      } else {
        env[key] = previous[key];
      }
    }
  }
}

async function withMockedFetch<T>(
  handler: typeof globalThis.fetch,
  fn: () => Promise<T>
): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  try {
    return await fn();
  } finally {
    globalThis.fetch = original;
  }
}

describe("P0-3 Super Admin Platform Contracts, Data-Source Reliability, and Fixture Alignment", () => {
  test("production environment enforces API mode and disables mock auth flags", async () => {
    await withEnv(
      {
        NODE_ENV: "production",
        NEXT_PUBLIC_APP_ENV: "production",
        NEXT_PUBLIC_DATA_SOURCE: "mock",
        NEXT_PUBLIC_USE_MOCK_AUTH: "true",
        NEXT_PUBLIC_PLATFORM_API_URL: "https://platform.example.edu/api/platform/v1",
      },
      () => {
        const cfg = getPlatformFrontendEnvConfig();
        assert.equal(cfg.isProduction, true);
        assert.equal(cfg.dataSourceMode, "api");
        assert.equal(cfg.mockAuthEnabled, false);
        assert.equal(getPlatformDataSourceMode(), "api");
      }
    );
  });

  test("API mode surfaces 401, 403, 502, and 503 failures cleanly without falling back to platform fixtures", async () => {
    await withPlatformDataSourceMode("api", async () => {
      await withMockedFetch(
        async () =>
          new Response(JSON.stringify({ message: "Platform session required" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }),
        async () => {
          await assert.rejects(
            () => platformService.listOrganizations(),
            (err: unknown) => err instanceof PlatformApiError && err.statusCode === 401 && err.isAuthError()
          );
        }
      );

      await withMockedFetch(
        async () =>
          new Response(JSON.stringify({ message: "Forbidden oversight read" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }),
        async () => {
          await assert.rejects(
            () => platformService.getStudentOversight(),
            (err: unknown) => err instanceof PlatformApiError && err.statusCode === 403 && err.isAuthorizationError()
          );
        }
      );

      await withMockedFetch(
        async () => {
          throw new TypeError("Network unreachable");
        },
        async () => {
          await assert.rejects(
            () => platformService.getAcademicOversight(),
            (err: unknown) => err instanceof PlatformApiError && err.statusCode === 503 && err.isNetworkError()
          );
        }
      );

      await withMockedFetch(
        async () =>
          new Response(JSON.stringify({ success: true, data: [{ bad: true }], timestamp: new Date().toISOString() }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        async () => {
          await assert.rejects(
            () => platformService.getExaminationGovernance(),
            (err: unknown) => err instanceof PlatformApiError && err.statusCode === 502 && err.isInvalidResponse()
          );
        }
      );
    });
  });

  test("mock mode validates seeded platform fixtures against Zod schemas and supports fault injection", async () => {
    await withPlatformDataSourceMode("mock", async () => {
      const [orgs, plans, students, academics, exams] = await Promise.all([
        platformService.listOrganizations(),
        platformService.listPlans(),
        platformService.getStudentOversight(),
        platformService.getAcademicOversight(),
        platformService.getExaminationGovernance(),
      ]);

      assert.equal(orgs.success, true);
      assert.equal(orgs.data.length, INITIAL_ORGANIZATIONS.length);
      assert.equal(plans.success, true);
      assert.ok(plans.data.length >= INITIAL_PLANS.length);
      assert.equal(students.success, true);
      assert.equal(academics.success, true);
      assert.equal(exams.success, true);

      try {
        setPlatformMockFaultInjector((op) =>
          op === "platformService.getAcademicOversight"
            ? new PlatformApiError("Injected control-plane error", 503, "SERVICE_UNAVAILABLE")
            : null
        );
        await assert.rejects(
          () => platformService.getAcademicOversight(),
          (err: unknown) => {
            assert.ok(err instanceof PlatformApiError);
            const friendly = getUserFriendlyPlatformError(err);
            assert.equal(friendly.retryable, true);
            return true;
          }
        );
      } finally {
        setPlatformMockFaultInjector(null);
      }
    });

    assert.throws(
      () => validateRequestPayload(organizationSchema, { id: "" }, "organization"),
      (err: unknown) => err instanceof PlatformApiError && err.statusCode === 422 && err.code === "VALIDATION_ERROR"
    );

    assert.throws(
      () =>
        validateApiResponse(
          organizationSchema,
          { success: true, data: { id: "bad" }, timestamp: new Date().toISOString() },
          "organization"
        ),
      (err: unknown) => err instanceof PlatformApiError && err.statusCode === 502 && err.code === "INVALID_RESPONSE"
    );
  });

  test("all subscription plans use valid MASTER_MODULE_REGISTRY IDs and oversight fixtures align with canonical organizations", () => {
    const validModuleIds = new Set(MASTER_MODULE_REGISTRY.map((mod) => mod.id));

    for (const plan of [...INITIAL_PLANS, ...INITIAL_EXTENDED_PLANS]) {
      const moduleIds = plan.includedModuleIds ?? [];
      assert.ok(moduleIds.length > 0, `Plan ${plan.id} must declare modules`);
      for (const moduleId of moduleIds) {
        assert.equal(
          validModuleIds.has(moduleId),
          true,
          `Plan ${plan.id} references unknown module ID ${moduleId}`
        );
      }
    }

    const orgById = new Map(INITIAL_ORGANIZATIONS.map((org) => [org.id, org]));

    for (const campus of INITIAL_CAMPUSES) {
      assert.equal(
        orgById.has(campus.organizationId),
        true,
        `Campus ${campus.id} references unknown organization ${campus.organizationId}`
      );
    }

    for (const studentRecord of INITIAL_STUDENT_OVERSIGHT_DATA) {
      const org = orgById.get(studentRecord.organizationId);
      assert.ok(org, `Missing organization ${studentRecord.organizationId}`);
      assert.equal(studentRecord.organizationName, org.name);
      assert.equal(studentRecord.organizationCode, org.code);
    }

    for (const academicRecord of INITIAL_ACADEMIC_OVERSIGHT_DATA) {
      const org = orgById.get(academicRecord.organizationId);
      assert.ok(org, `Missing organization ${academicRecord.organizationId}`);
      assert.equal(academicRecord.organizationName, org.name);
      assert.equal(academicRecord.organizationCode, org.code);
    }
  });

  test("tenantContractAdapter bridges organization and campus lifecycles to Tenant Dashboard contracts", () => {
    assert.equal(mapOrganizationStatusToTenantStatus("active"), "ACTIVE");
    assert.equal(mapOrganizationStatusToTenantStatus("suspended"), "SUSPENDED");
    assert.equal(mapOrganizationStatusToTenantStatus("archived"), "ARCHIVED");
    assert.equal(mapOrganizationStatusToTenantStatus("pending"), "INACTIVE");

    assert.equal(mapPlatformCampusStatusToTenantStatus("active"), "ACTIVE");
    assert.equal(mapPlatformCampusStatusToTenantStatus("under_review"), "PLANNED");
    assert.equal(mapPlatformCampusStatusToTenantStatus("archived"), "ARCHIVED");
    assert.equal(mapPlatformCampusStatusToTenantStatus("inactive"), "INACTIVE");

    const features = deriveTenantFeaturesFromModules([
      "mod_classroom",
      "mod_transport",
      "mod_finance",
    ]);
    assert.equal(features.onlineClasses, true);
    assert.equal(features.transportManagement, true);
    assert.equal(features.hostelManagement, false);
    assert.equal(features.finance, true);

    const org = INITIAL_ORGANIZATIONS[0];
    const plan = INITIAL_PLANS.find((p) => p.id === org.planId);
    const projection = projectOrganizationToTenantContract(org, plan, INITIAL_CAMPUSES, ["mod_library"]);

    assert.equal(projection.id, org.id);
    assert.equal(projection.code, org.code);
    assert.equal(projection.status, "ACTIVE");
    assert.equal(projection.features.libraryManagement, true);
    assert.ok(projection.campuses.length >= 1);
  });
});
