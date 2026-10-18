/**
 * Domain contracts for School Campuses & Branches in the SaaS Super-Admin platform.
 * Aligns with tenant multi-campus domain model (Phase E-09.2 / Phase E-09.7).
 */

export type CampusStatus = 'active' | 'inactive' | 'planned' | 'under_maintenance';

export type CampusType = 'main' | 'branch' | 'satellite' | 'specialized';

export interface CampusAddress {
  street: string;
  city: string;
  stateOrProvince: string;
  country: string;
  postalCode?: string;
}

export interface Campus {
  id: string;
  organizationId: string;
  name: string;
  code: string; // e.g., "MAIN", "NORTH", "DOWNTOWN"
  isMainCampus: boolean;
  type: CampusType;
  status: CampusStatus;
  address: CampusAddress;
  contactEmail?: string;
  contactPhone?: string;
  principalName?: string;
  studentCapacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampusInput {
  organizationId: string;
  name: string;
  code: string;
  isMainCampus?: boolean;
  type?: CampusType;
  status?: CampusStatus;
  address?: Partial<CampusAddress>;
  contactEmail?: string;
  contactPhone?: string;
  principalName?: string;
  studentCapacity?: number;
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
}
