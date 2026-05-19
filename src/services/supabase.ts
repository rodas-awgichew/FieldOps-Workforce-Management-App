import { createClient } from "@supabase/supabase-js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { Platform } from "react-native";

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "";
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials are missing. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? localStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Export types for use throughout the app
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: "admin" | "manager" | "technician";
  department: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "done" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  location: string | null;
  due_date: string | null;
  completed_at: string | null;
  image_url: string | null;
  photo_metadata: any | null;
  created_at: string;
  updated_at: string;
};

export type TaskPhoto = {
  id: string;
  task_id: string;
  photo_url: string;
  file_path: string;
  captured_at: string;
  created_at: string;
};

export type DashboardStats = {
  id: string;
  user_id: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  urgent_tasks: number;
  last_updated: string;
  created_at: string;
};
