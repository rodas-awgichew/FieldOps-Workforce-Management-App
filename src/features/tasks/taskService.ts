import { Task, TaskStatus } from "./types";
import { supabase } from "../../services/supabase";
import { taskApi } from "../../services/api";

const fallbackTasks: Task[] = [
  {
    id: "1",
    title: "Inspect transformer",
    description:
      "Check wiring, grounding, and load conditions at the primary pump station.",
    status: "pending",
    assignee: "Maya",
    location: "Pump Station B",
    dueDate: "2026-05-02",
  },
  {
    id: "2",
    title: "Install new router",
    description:
      "Deploy network router and verify connectivity for the field office.",
    status: "done",
    assignee: "Leo",
    location: "Field Office 4",
    dueDate: "2026-04-28",
    completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Replace sensor module",
    description: "Swap the temperature sensor module and confirm calibration.",
    status: "pending",
    assignee: "Asha",
    location: "Warehouse 1",
    dueDate: "2026-05-04",
  },
  {
    id: "4",
    title: "Service generator",
    description: "Perform routine maintenance service on backup generator set.",
    status: "done",
    assignee: "Kai",
    location: "Site C",
    dueDate: "2026-04-26",
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    title: "Audit safety gear",
    description:
      "Inspect PPE kits and replenishment inventory at the staging area.",
    status: "pending",
    assignee: "Nia",
    location: "Main Yard",
    dueDate: "2026-05-05",
  },
];

function mapSupabaseTask(task: any): Task {
  return {
    id: String(task.id),
    title: task.title ?? "Untitled task",
    description: task.description ?? "No description provided.",
    status: task.status === "done" ? "done" : "pending",
    assignee: task.assigned_to ?? "Unassigned",
    location: task.location ?? "Unknown location",
    dueDate: task.due_date
      ? new Date(task.due_date).toISOString().slice(0, 10)
      : "TBD",
    completedAt: task.completed_at ?? undefined,
    imageUrl: task.image_url ?? undefined,
  };
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("User not authenticated");
  }
  return data.user.id;
}

export async function fetchTasks(): Promise<Task[]> {
  try {
    const userId = await getCurrentUserId();
    const tasks = await taskApi.getTasks(userId);
    return tasks.map(mapSupabaseTask);
  } catch (error) {
    console.error("fetchTasks error:", error);
    return fallbackTasks;
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<Task> {
  try {
    const updated = await taskApi.updateTask(taskId, {
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    } as any);
    return mapSupabaseTask(updated);
  } catch (error) {
    console.error("updateTaskStatus error:", error);
    const task = fallbackTasks.find((item) => item.id === taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    task.status = status;
    task.completedAt = status === "done" ? new Date().toISOString() : undefined;
    return task;
  }
}

export function findTask(taskId: string, tasks: Task[]) {
  return tasks.find((task) => task.id === taskId);
}
