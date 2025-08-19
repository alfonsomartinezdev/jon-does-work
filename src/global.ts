export interface Task {
  id: string;
  name: string;
  description: string;
  priority: string;
  status: TaskStatus;
  assignedDate: string;
  activeTime: number;
  baseActiveTime: number; // Time accumulated before current session
  currentSessionTime: number; // Current session duration in seconds
  sessions: Session[];
  isTimerActive: boolean;
  timerStartTime: number | null;
}

export interface TaskFormData {
  name: string;
  description: string;
}

export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "inProgress",
  COMPLETED: "completed",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

// from when you start the timer on a task to when you stop it
export interface Session {
  start: number;
  end: number;
}