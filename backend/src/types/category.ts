export interface Category {
  id: string;
  name: string;
  description: string;
  temporary: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name?: string;
  description?: string;
  temporary?: boolean;
  active?: boolean;
}
