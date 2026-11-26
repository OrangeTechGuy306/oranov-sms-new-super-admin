import { z } from "zod";
import { platformStore } from "@/lib/data/platform-store";
import { INITIAL_STUDENT_OVERSIGHT_DATA } from "@/lib/data/student-oversight-fixtures";
import { INITIAL_ACADEMIC_OVERSIGHT_DATA } from "@/lib/data/academic-oversight-fixtures";
import { INITIAL_EXAM_GOVERNANCE_DATA } from "@/lib/data/examination-governance-fixtures";
import type { Organization } from "@/lib/types/organizations";
import type { SubscriptionPlan } from "@/lib/types/subscriptions";
import type { OrganizationStudentOversight } from "@/lib/types/student-oversight";
import type { OrganizationAcademicOversight } from "@/lib/types/academic-oversight";
import type { OrganizationExamGovernance } from "@/lib/types/examination-governance";
import {
  academicOversightRecordSchema,
  examGovernanceRecordSchema,
  organizationSchema,
  studentOversightRecordSchema,
  subscriptionPlanSchema,
  type PlatformApiResponse,
} from "./contracts";
import { executePlatformAdapter } from "./dataSource";
import { platformApiClient } from "./platformApiClient";

export const platformService = {
  async listOrganizations(): Promise<PlatformApiResponse<Organization[]>> {
    return executePlatformAdapter({
      operation: "platformService.listOrganizations",
      remote: () => platformApiClient.get<Organization[]>("/organizations"),
      mock: () => platformStore.getOrganizations(),
      responseSchema: z.array(organizationSchema) as unknown as z.ZodType<Organization[]>,
    });
  },

  async listPlans(): Promise<PlatformApiResponse<SubscriptionPlan[]>> {
    return executePlatformAdapter({
      operation: "platformService.listPlans",
      remote: () => platformApiClient.get<SubscriptionPlan[]>("/plans"),
      mock: () => platformStore.getPlans(),
      responseSchema: z.array(subscriptionPlanSchema) as unknown as z.ZodType<SubscriptionPlan[]>,
    });
  },

  async getStudentOversight(): Promise<
    PlatformApiResponse<OrganizationStudentOversight[]>
  > {
    return executePlatformAdapter({
      operation: "platformService.getStudentOversight",
      remote: () =>
        platformApiClient.get<OrganizationStudentOversight[]>(
          "/oversight/students"
        ),
      mock: () => INITIAL_STUDENT_OVERSIGHT_DATA,
      responseSchema: z.array(studentOversightRecordSchema) as unknown as z.ZodType<
        OrganizationStudentOversight[]
      >,
    });
  },

  async getAcademicOversight(): Promise<
    PlatformApiResponse<OrganizationAcademicOversight[]>
  > {
    return executePlatformAdapter({
      operation: "platformService.getAcademicOversight",
      remote: () =>
        platformApiClient.get<OrganizationAcademicOversight[]>(
          "/oversight/academics"
        ),
      mock: () => INITIAL_ACADEMIC_OVERSIGHT_DATA,
      responseSchema: z.array(academicOversightRecordSchema) as unknown as z.ZodType<
        OrganizationAcademicOversight[]
      >,
    });
  },

  async getExaminationGovernance(): Promise<
    PlatformApiResponse<OrganizationExamGovernance[]>
  > {
    return executePlatformAdapter({
      operation: "platformService.getExaminationGovernance",
      remote: () =>
        platformApiClient.get<OrganizationExamGovernance[]>(
          "/oversight/examinations"
        ),
      mock: () => INITIAL_EXAM_GOVERNANCE_DATA,
      responseSchema: z.array(examGovernanceRecordSchema) as unknown as z.ZodType<
        OrganizationExamGovernance[]
      >,
    });
  },
};
