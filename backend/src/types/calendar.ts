export type CalendarStatus = "draft" | "approved";

export interface CalendarAssignmentSnapshot {
  slotId: string;
  siteId: string;
  siteName: string;
  dayKey: string;
  categoryId: string;
  categoryName: string;
  slotIndex: number;
  isAdditional?: boolean;
  employeeId: string;
  employeeName: string;
}

export type CalendarTaskAssignmentMode = "team" | "person";

export interface CalendarTaskSnapshot {
  id: string;
  siteId: string;
  siteName: string;
  dayKey: string;
  taskId: string;
  taskName: string;
  assignmentMode: CalendarTaskAssignmentMode;
  employeeId: string;
  employeeName: string;
}

export interface CalendarExceptionSnapshot {
  alertId: string;
  type: string;
  title: string;
  detail: string;
  justification: string;
  createdAt: string;
}

export interface Calendar {
  id: string;
  name: string;
  weekStartDate: string;
  weekEndDate: string;
  status: CalendarStatus;
  assignments: CalendarAssignmentSnapshot[];
  tasks: CalendarTaskSnapshot[];
  exceptions: CalendarExceptionSnapshot[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface CalendarInput {
  weekStartDate?: string;
  weekEndDate?: string;
  name?: string;
  status?: CalendarStatus;
  assignments?: CalendarAssignmentSnapshot[];
  tasks?: CalendarTaskSnapshot[];
  exceptions?: CalendarExceptionSnapshot[];
  notes?: string;
}
