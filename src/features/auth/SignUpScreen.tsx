import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View, Pressable } from "react-native";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/InputField";
import { useAuthStore } from "../../store/authStore";

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);

  function handleSignup() {
    setLoading(true);

    setTimeout(() => {
      setUser({ name, email });
      setLoading(false);
    }, 700);
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