export type TaskAssignmentMode = "team" | "person";

export interface Task {
  id: string;
  name: string;
  description: string;
  assignmentMode: TaskAssignmentMode;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  name?: string;
  description?: string;
  assignmentMode?: TaskAssignmentMode;
  active?: boolean;
}
