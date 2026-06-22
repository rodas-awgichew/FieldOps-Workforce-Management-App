import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View, Pressable } from "react-native";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/InputField";
import { useAuthStore } from "../../store/authStore";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/src/services/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const navigation = useNavigation<any>();

  async function handleLogin() {
    if (!email || !password) return;

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          alert(profileError.message);
          return;
        }

        setUser(profile);
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-brand-bg p-6 justify-center"
    >
      <View className="rounded-3xl bg-brand-card p-6 shadow-lg">
        <Text className="text-brand-text text-3xl font-bold mb-4">Welcome back</Text>
        <Text className="text-gray-400 mb-6">
          Sign in to access tasks, recents, and notifications.
        </Text>
        <AppInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View className="h-4" />
        <AppInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        <View className="h-6" />
        <AppButton title="Sign in" onPress={handleLogin} loading={loading} />
      </View>

      <Pressable onPress={() => navigation.navigate("Signup")}>
        <Text className="text-center text-gray-400 mt-4">
          Don't have an account? Sign up
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}