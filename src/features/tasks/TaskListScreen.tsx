import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
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

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  const filteredTasks = useMemo(() => {
    if (filter === "all") {
      return tasks;
    }

    return tasks.filter((task) => task.status === filter);
  }, [filter, tasks]);

  return (
    <View className="flex-1 bg-brand-bg p-4">
      <Text className="text-brand-text text-2xl font-bold mb-4">Field Tasks</Text>

      <View className="mb-4 flex-row justify-between">
        {(["all", "pending", "done"] as FilterType[]).map((value) => (
          <Pressable
            key={value}
            onPress={() => setFilter(value)}
            className={`rounded-2xl px-4 py-3 ${
              filter === value
                ? "bg-brand-accent"
                : "bg-white/10"
            }`}
          >
            <Text className="text-sm font-semibold text-brand-text capitalize">
              {value}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <Text className="text-brand-text">Loading tasks...</Text>
      ) : filteredTasks.length === 0 ? (
        <View className="rounded-3xl border border-white/10 bg-brand-card p-6">
          <Text className="text-brand-text text-lg font-semibold mb-2">No tasks found</Text>
          <Text className="text-gray-400">Try a different filter or refresh the app.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              title={item.title}
              status={item.status}
              subtitle={`Due ${item.dueDate}`}
              onPress={() => navigation.navigate("TaskDetail", { taskId: item.id })}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View className="mt-4">
        <AppButton
          title="Refresh tasks"
          onPress={() => {
            setLoading(true);
            fetchTasks()
              .then(setTasks)
              .finally(() => setLoading(false));
          }}
        />
      </View>
    </View>
  );
}
