import { useEffect, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import AppButton from "../../components/AppButton";
import TaskCard from "../../components/TaskCard";
import { fetchTasks } from "../tasks/taskService";
import { Task } from "../tasks/types";

export default function RecentsScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError("Failed to load recent tasks. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const recentCompleted = useMemo(
    () =>
      tasks
        .filter((task) => task.status === "done" && task.completedAt)
        .sort(
          (a, b) =>
            new Date(b.completedAt!).getTime() -
            new Date(a.completedAt!).getTime(),
        ),
    [tasks],
  );

  return (
    <View className="flex-1 bg-brand-bg">
      {/* Header with top padding */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-brand-text text-2xl font-bold">
          Recently Completed
        </Text>
      </View>

      <FlatList
        data={recentCompleted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <TaskCard
              title={item.title}
              status={item.status}
              subtitle={
                item.completedAt
                  ? new Date(item.completedAt).toLocaleString()
                  : undefined
              }
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View className="px-4 mt-4">
              <Text className="text-brand-text">Loading recent tasks...</Text>
            </View>
          ) : (
            <View className="px-4 mt-4 rounded-3xl border border-white/10 bg-brand-card p-6">
              <Text className="text-brand-text text-lg font-semibold mb-2">
                No completed tasks yet
              </Text>
              <Text className="text-gray-400">
                Task completions will appear here once work is finished in the
                field.
              </Text>
            </View>
          )
        }
        ListHeaderComponent={
          error ? (
            <View className="px-4 mb-4">
              <View className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4">
                <Text className="text-red-400 font-semibold">{error}</Text>
              </View>
            </View>
          ) : null
        }
        ListFooterComponent={
          <View className="px-4 mt-4 mb-6">
            <AppButton
              title="Refresh recent tasks"
              onPress={loadTasks}
              disabled={loading}
            />
          </View>
        }
      />
    </View>
  );
}
