export interface Employee {
  id: string;
  name: string;
  categoryId: string;
  preferredSiteId: string;
  backupCategoryIds: string[];
  teamLeader: boolean;
  phone: string;
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeInput {
  name?: string;
  categoryId?: string;
  preferredSiteId?: string;
  backupCategoryIds?: string[];
  teamLeader?: boolean;
  phone?: string;
  notes?: string;
  active?: boolean;
}
