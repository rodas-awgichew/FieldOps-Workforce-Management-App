import { Task } from "../tasks/types";
import { fetchTasks } from "../tasks/taskService";

export async function loadRecentCompletedTasks(): Promise<Task[]> {
  const tasks = await fetchTasks();
  return tasks
    .filter((task) => task.status === "done" && task.completedAt)
    .sort((a, b) =>
      new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    );
}
