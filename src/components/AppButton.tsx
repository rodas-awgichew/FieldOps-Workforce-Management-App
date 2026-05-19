import { ActivityIndicator, Pressable, Text } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: string;
};

export default function AppButton({
  title,
  onPress,
  loading,
  disabled,
  style,
}: Props) {
  const defaultStyle = "bg-brand-accent py-3 rounded-xl items-center";
  const containerStyle = style ? style : defaultStyle;
  const isDisabled = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${containerStyle} ${isDisabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <Text className="text-black font-semibold">{title}</Text>
      )}
    </Pressable>
  );
}
