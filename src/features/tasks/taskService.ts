import { api } from "../../services/api";
import { Task, TaskStatus } from "./types";

const fallbackTasks: Task[] = [
  {
    id: "1",
    title: "Inspect transformer",
    description: "Check wiring, grounding, and load conditions at the primary pump station.",
    status: "pending",
    assignee: "Maya",
    location: "Pump Station B",
    dueDate: "2026-05-02",
  },
  {
    id: "2",
    title: "Install new router",
    description: "Deploy network router and verify connectivity for the field office.",
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
    description: "Inspect PPE kits and replenishment inventory at the staging area.",
    status: "pending",
    assignee: "Nia",
    location: "Main Yard",
    dueDate: "2026-05-05",
  },
];

function mapTodoToTask(todo: any): Task {
  const status: TaskStatus = todo.completed ? "done" : "pending";
  return {
    id: String(todo.id),
    title: todo.title ?? `Task ${todo.id}`,
    description: todo.title
      ? `Inspect and resolve issues for task ${todo.id}.`
      : "Field work task requiring verification.",
    status,
    assignee: `Tech ${todo.userId ?? "01"}`,
    location: `Site ${todo.userId ?? "A"}`,
    dueDate: new Date(Date.now() + ((todo.id % 6) + 1) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    completedAt: todo.completed
      ? new Date(Date.now() - (todo.id % 5) * 3 * 60 * 60 * 1000).toISOString()
      : undefined,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await api.get("/todos?_limit=12");
    return response.data.map(mapTodoToTask);
  } catch (error) {
    return fallbackTasks;
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  try {
    const response = await api.patch(`/todos/${taskId}`, {
      completed: status === "done",
    });
    return mapTodoToTask({ ...response.data, completed: status === "done" });
  } catch (error) {
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
