import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AppButton from "../../components/AppButton";
import TaskCard from "../../components/TaskCard";
import { TaskStackParamList } from "../../navigation/TasksStack";
import { fetchTasks } from "./taskService";
import { Task } from "./types";

type TaskListNavProp = NativeStackNavigationProp<TaskStackParamList, "TaskList">;
type FilterType = "all" | "pending" | "done";

export default function TaskListScreen() {
  const navigation = useNavigation<TaskListNavProp>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [filter, tasks]);

  return (
    <View className="flex-1 bg-brand-bg">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-brand-text text-2xl font-bold">Field Tasks</Text>
      </View>

      {/* Filter buttons */}
      <View className="px-4 mb-4 flex-row justify-between">
        {(["all", "pending", "done"] as FilterType[]).map((value) => (
          <Pressable
            key={value}
            onPress={() => setFilter(value)}
            className={`rounded-2xl px-4 py-3 flex-1 mx-1 ${
              filter === value ? "bg-brand-accent" : "bg-white/10"
            }`}
          >
            <Text className="text-sm font-semibold text-brand-text capitalize text-center">
              {value}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Main List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View className="px-4">
            <TaskCard
              title={item.title}
              status={item.status}
              subtitle={item.subtitle || `Due ${item.dueDate || 'N/A'}`}
              onPress={() => navigation.navigate("TaskDetail", { taskId: item.id })}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View className="px-4 mt-10 items-center">
              <ActivityIndicator color="#F27D26" />
              <Text className="text-brand-text mt-2">Loading tasks...</Text>
            </View>
          ) : (
            <View className="mx-4 mt-4 rounded-3xl border border-white/10 bg-brand-card p-6">
              <Text className="text-brand-text text-lg font-semibold mb-2 text-center">
                No tasks found
              </Text>
              <Text className="text-gray-400 text-center">
                Try a different filter or refresh the list.
              </Text>
            </View>
          )
        }
      />

      {/* Footer Action */}
      <View className="p-4 border-t border-white/5">
        <AppButton
          title="Refresh tasks"
          onPress={loadTasks}
          disabled={loading}
        />
      </View>
    </View>
  );
}