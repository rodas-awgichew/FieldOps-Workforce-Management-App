import { Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  status: "pending" | "done";
  subtitle?: string;
  onPress?: () => void;
};

export default function TaskCard({ title, status, subtitle, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`bg-brand-card p-4 rounded-2xl mb-3 ${
        onPress ? "active:opacity-80" : ""
      }`}
    >
      <Text className="text-brand-text font-semibold">{title}</Text>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              status === "done" ? "bg-status-done" : "bg-status-pending"
            }`}
          />
          <Text className="text-xs text-gray-400 capitalize">{status}</Text>
        </View>
      </View>

      {subtitle ? (
        <Text className="text-sm text-gray-400 mt-3">{subtitle}</Text>
      ) : null}
    </Pressable>
  );
}