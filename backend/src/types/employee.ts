export interface Employee {
  id: string;
  name: string;
  categoryId: string;
  phone: string;
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeInput {
  name?: string;
  categoryId?: string;
  phone?: string;
  notes?: string;
  active?: boolean;
}
