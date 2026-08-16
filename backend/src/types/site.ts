export interface Site {
  id: string;
  name: string;
  location: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteInput {
  name?: string;
  location?: string;
  active?: boolean;
}
