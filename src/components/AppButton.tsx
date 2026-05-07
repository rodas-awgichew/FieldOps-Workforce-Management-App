import { Text, Pressable, ActivityIndicator } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
};

export default function AppButton({ title, onPress, loading }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-brand-accent py-3 rounded-xl items-center"
    >
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <Text className="text-black font-semibold">{title}</Text>
      )}
    </Pressable>
  );
}