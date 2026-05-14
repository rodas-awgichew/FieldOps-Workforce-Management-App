import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View, Pressable } from "react-native";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/InputField";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "@/src/services/supabase";

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);

  async function handleSignup() {
  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    setLoading(true);

    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (!data.user) {
      alert("Signup failed");
      return;
    }

    // 2. Create profile row
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        email,
        full_name: name,
        role: "technician",
      });

    if (profileError) {
      alert(profileError.message);
      return;
    }

    // 3. Save locally
    setUser({
      id: data.user.id,
      email,
      full_name: name,
      role: "technician",
    });

    alert("Account created successfully");
  } catch (err) {
    console.log(err);
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
      <View className="rounded-3xl bg-brand-card p-6">
        <Text className="text-brand-text text-3xl font-bold mb-4">
          Create account
        </Text>

        <Text className="text-gray-400 mb-6">
          Sign up to start managing your tasks efficiently.
        </Text>

        <AppInput
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
        />

        <View className="h-4" />

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

        <AppButton title="Sign up" onPress={handleSignup} loading={loading} />

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text className="text-center text-gray-400 mt-4">
            Already have an account? Sign in
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}