import { DashboardStats, Profile, supabase, Task, TaskPhoto } from "./supabase";

// ============== Authentication APIs ==============
export const authApi = {
  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  getSession: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },
};

// ============== Profile APIs ==============
export const profileApi = {
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data as Profile;
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  createProfile: async (userId: string, profile: Partial<Profile>) => {
    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role || "technician",
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  uploadAvatar: async (userId: string, file: File) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { data: updated, error } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return updated as Profile;
  },
};

// ============== Task APIs ==============
export const taskApi = {
  getTasks: async (
    userId: string,
    filters?: { status?: string; priority?: string },
  ) => {
    let query = supabase
      .from("tasks")
      .select("*")
      .or(`user_id.eq.${userId},assigned_to.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Task[];
  },

  getTaskById: async (taskId: string) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();
    if (error) throw error;
    return data as Task;
  },

  createTask: async (task: Omit<Task, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase
      .from("tasks")
      .insert([task])
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  },

  completeTask: async (taskId: string) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        status: "done",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  },

  deleteTask: async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) throw error;
  },

  getDashboardStats: async (userId: string) => {
    const { data, error } = await supabase
      .from("dashboard_stats")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data as DashboardStats | null;
  },
};

// ============== Task Photo APIs ==============
export const taskPhotoApi = {
  uploadTaskPhoto: async (taskId: string, userId: string, file: File) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${taskId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("task-photos")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from("task-photos")
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from("task_photos")
      .insert([
        {
          task_id: taskId,
          photo_url: publicUrl.publicUrl,
          file_path: filePath,
          captured_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as TaskPhoto;
  },

  getTaskPhotos: async (taskId: string) => {
    const { data, error } = await supabase
      .from("task_photos")
      .select("*")
      .eq("task_id", taskId)
      .order("captured_at", { ascending: false });

    if (error) throw error;
    return data as TaskPhoto[];
  },

  deleteTaskPhoto: async (photoId: string, filePath: string) => {
    // Delete from storage
    await supabase.storage.from("task-photos").remove([filePath]);

    // Delete from database
    const { error } = await supabase
      .from("task_photos")
      .delete()
      .eq("id", photoId);
    if (error) throw error;
  },
};

// ============== Real-time Subscriptions ==============
export const subscriptionApi = {
  subscribeToTasks: (userId: string, callback: (tasks: Task[]) => void) => {
    return supabase
      .from("tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `or(user_id.eq.${userId},assigned_to.eq.${userId})`,
        },
        async () => {
          const tasks = await taskApi.getTasks(userId);
          callback(tasks);
        },
      )
      .subscribe();
  },

  subscribeToDashboardStats: (
    userId: string,
    callback: (stats: DashboardStats | null) => void,
  ) => {
    return supabase
      .from("dashboard_stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dashboard_stats",
          filter: `user_id.eq.${userId}`,
        },
        async () => {
          const stats = await taskApi.getDashboardStats(userId);
          callback(stats);
        },
      )
      .subscribe();
  },
};
