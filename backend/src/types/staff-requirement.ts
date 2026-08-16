export interface WeeklyStaffRequirement {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  holiday: number;
}

export interface StaffRequirement {
  id: string;
  siteId: string;
  categoryId: string;
  weeklyQuantities: WeeklyStaffRequirement;
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffRequirementInput {
  siteId?: string;
  categoryId?: string;
  weeklyQuantities?: Partial<WeeklyStaffRequirement>;
  notes?: string;
  active?: boolean;
}
