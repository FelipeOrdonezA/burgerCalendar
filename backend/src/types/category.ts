export interface Category {
  id: string;
  name: string;
  description: string;
  temporary: boolean;
  calendarPriority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name?: string;
  description?: string;
  temporary?: boolean;
  calendarPriority?: number;
  active?: boolean;
}
