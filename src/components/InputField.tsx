import { TextInput } from "react-native";

export default function AppInput(props: any) {
  return (
    <TextInput
      {...props}
      className="bg-brand-card text-brand-text p-3 rounded-xl"
      placeholderTextColor="#666"
    />
  );
}