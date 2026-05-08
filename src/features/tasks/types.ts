export type TaskStatus = "pending" | "done";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  location: string;
  dueDate: string;
  completedAt?: string;
  imageUrl?: string;
};
