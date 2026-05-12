import { create } from "zustand";
import { authApi, profileApi } from "../services/api";
import { Profile, supabase } from "../services/supabase";

type AuthState = {
  user: Profile | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  setUser: (user: Profile | null) => void;
  setSession: (session: any) => void;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),

  signUp: async (email: string, password: string, fullName: string) => {
    set({ loading: true, error: null });
    try {
      await authApi.signUp(email, password, fullName);
      // Profile will be created automatically by trigger or manually
      await profileApi.createProfile(email, {
        email,
        full_name: fullName,
        role: "technician",
      });
      set({ loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { session, user } = await authApi.signIn(email, password);
      set({ session });

      if (user) {
        const profile = await profileApi.getProfile(user.id);
        set({ user: profile, loading: false });
      }
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await authApi.signOut();
      set({ user: null, session: null, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, session: null });
  },

  initializeAuth: async () => {
    set({ loading: true });
    try {
      const session = await authApi.getSession();
      if (session?.user) {
        const profile = await profileApi.getProfile(session.user.id);
        set({ user: profile, session, loading: false });
      } else {
        set({ loading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          try {
            const profile = await profileApi.getProfile(session.user.id);
            set({ user: profile, session });
          } catch (error) {
            console.error("Error fetching profile:", error);
          }
        } else {
          set({ user: null, session: null });
        }
      });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    set({ loading: true, error: null });
    try {
      const currentUser = get().user;
      if (!currentUser) throw new Error("No user logged in");

      const updated = await profileApi.updateProfile(currentUser.id, updates);
      set({ user: updated, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },
}));
