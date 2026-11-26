export type CampusStatus =
  | "active"
  | "inactive"
  | "planned"
  | "under_maintenance"
  | "suspended"
  | "archived"
  | "under_review";

export type CampusType = "main" | "branch" | "satellite" | "virtual" | "specialized";

export interface CampusAddress {
  street?: string;
  city?: string;
  stateOrProvince?: string;
  country?: string;
  postalCode?: string;
}

export interface Campus {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  isMainCampus: boolean;
  type: CampusType;
  status: CampusStatus;
  address: CampusAddress;
  contactEmail?: string;
  contactPhone?: string;
  principalName?: string;
  studentCapacity?: number;
  currentEnrollment?: number;
  staffCount?: number;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface CreateCampusInput {
  organizationId: string;
  name: string;
  code: string;
  isMainCampus?: boolean;
  type?: CampusType;
  status?: CampusStatus;
  address: CampusAddress;
  contactEmail?: string;
  contactPhone?: string;
  principalName?: string;
  studentCapacity?: number;
  timezone?: string;
  notes?: string;
}

export interface UpdateCampusInput {
  name?: string;
  code?: string;
  isMainCampus?: boolean;
  type?: CampusType;
  status?: CampusStatus;
  address?: Partial<CampusAddress>;
  contactEmail?: string;
  contactPhone?: string;
  principalName?: string;
  studentCapacity?: number;
  currentEnrollment?: number;
  staffCount?: number;
  timezone?: string;
  notes?: string;
}
