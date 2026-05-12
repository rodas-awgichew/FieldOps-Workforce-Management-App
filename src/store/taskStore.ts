import { create } from "zustand";
import { Task, DashboardStats } from "../services/supabase";
import { taskApi } from "../services/api";

type TaskState = {
  tasks: Task[];
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  selectedTask: Task | null;

  fetchTasks: (userId: string) => Promise<void>;
  fetchTaskById: (taskId: string) => Promise<void>;
  createTask: (task: Omit<Task, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  fetchDashboardStats: (userId: string) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
  setTasks: (tasks: Task[]) => void;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  stats: null,
  loading: false,
  error: null,
  selectedTask: null,

  fetchTasks: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskApi.getTasks(userId);
      set({ tasks, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchTaskById: async (taskId: string) => {
    set({ loading: true, error: null });
    try {
      const task = await taskApi.getTaskById(taskId);
      set({ selectedTask: task, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  createTask: async (task: Omit<Task, "id" | "created_at" | "updated_at">) => {
    set({ loading: true, error: null });
    try {
      const newTask = await taskApi.createTask(task);
      const currentTasks = get().tasks;
      set({ tasks: [newTask, ...currentTasks], loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    set({ loading: true, error: null });
    try {
      const updated = await taskApi.updateTask(taskId, updates);
      const tasks = get().tasks.map((t) => (t.id === taskId ? updated : t));
      set({ tasks, loading: false });

      if (get().selectedTask?.id === taskId) {
        set({ selectedTask: updated });
      }
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  completeTask: async (taskId: string) => {
    set({ loading: true, error: null });
    try {
      const updated = await taskApi.completeTask(taskId);
      const tasks = get().tasks.map((t) => (t.id === taskId ? updated : t));
      set({ tasks, loading: false });

      if (get().selectedTask?.id === taskId) {
        set({ selectedTask: updated });
      }
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  deleteTask: async (taskId: string) => {
    set({ loading: true, error: null });
    try {
      await taskApi.deleteTask(taskId);
      const tasks = get().tasks.filter((t) => t.id !== taskId);
      set({ tasks, loading: false });

      if (get().selectedTask?.id === taskId) {
        set({ selectedTask: null });
      }
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  fetchDashboardStats: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const stats = await taskApi.getDashboardStats(userId);
      set({ stats, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  setSelectedTask: (task: Task | null) => set({ selectedTask: task }),
  setTasks: (tasks: Task[]) => set({ tasks }),
}));
