import "react-native-gesture-handler";
import "./global.css";

import { useEffect } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { useAuthStore } from "./src/store/authStore";
import { supabase } from "@/src/services/supabase";

export default function App() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.log(error);
          return;
        }

        if (profile) {
          setUser(profile);
        }
      }
    };

    loadSession();
  }, []);

  console.log("Supabase URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);

  return <AppNavigator />;
}