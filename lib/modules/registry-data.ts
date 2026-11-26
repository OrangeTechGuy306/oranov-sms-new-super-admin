/**
 * Canonical Master Tenant Module Registry
 * Phase P0-4: Single authoritative snapshot generated from frontend + dashboard contracts.
 */

import {
  CANONICAL_FEATURE_KEY_TO_ID,
  CANONICAL_FEATURE_REGISTRY,
  CANONICAL_MODULE_REGISTRY,
  CANONICAL_NAV_TO_MODULE_ID,
  CANONICAL_REGISTRY_CATEGORY_METADATA,
  CANONICAL_ROUTE_TO_MODULE_ID,
  CANONICAL_SUBSCRIPTION_PLANS,
} from "./canonical-registry-snapshot";
import type { CategoryMeta, TenantModuleDefinition } from "./types";
import type {
  CanonicalFeatureDefinition,
  CanonicalPlanDefinition,
} from "./canonical-contract";

export const CATEGORY_METADATA: Record<string, CategoryMeta> =
  CANONICAL_REGISTRY_CATEGORY_METADATA as unknown as Record<string, CategoryMeta>;

export const MASTER_MODULE_REGISTRY: TenantModuleDefinition[] =
  CANONICAL_MODULE_REGISTRY as unknown as TenantModuleDefinition[];

export const MODULE_BY_ID: Map<string, TenantModuleDefinition> = new Map(
  MASTER_MODULE_REGISTRY.map((m) => [m.id, m])
);

export const MODULES_BY_ID = MODULE_BY_ID;

export const FEATURE_BY_ID: Map<string, CanonicalFeatureDefinition> = new Map(
  CANONICAL_FEATURE_REGISTRY.map((f) => [f.id, f])
);

export const FEATURE_BY_KEY: Map<string, CanonicalFeatureDefinition> = new Map(
  CANONICAL_FEATURE_REGISTRY.map((f) => [f.key, f])
);

export const PLAN_BY_ID: Map<string, CanonicalPlanDefinition> = new Map(
  CANONICAL_SUBSCRIPTION_PLANS.map((p) => [p.id, p])
);

export {
  CANONICAL_FEATURE_KEY_TO_ID,
  CANONICAL_FEATURE_REGISTRY,
  CANONICAL_MODULE_REGISTRY,
  CANONICAL_NAV_TO_MODULE_ID,
  CANONICAL_REGISTRY_CATEGORY_METADATA,
  CANONICAL_ROUTE_TO_MODULE_ID,
  CANONICAL_SUBSCRIPTION_PLANS,
};
