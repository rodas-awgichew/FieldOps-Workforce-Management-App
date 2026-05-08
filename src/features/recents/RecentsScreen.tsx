import { useEffect, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import TaskCard from "../../components/TaskCard";
import { fetchTasks } from "../tasks/taskService";
import { Task } from "../tasks/types";

export default function RecentsScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks().then((items) => {
      setTasks(items);
      setLoading(false);
    });
  }, []);

  const recentCompleted = useMemo(
    () =>
      tasks
        .filter((task) => task.status === "done" && task.completedAt)
        .sort(
          (a, b) =>
            new Date(b.completedAt!).getTime() -
            new Date(a.completedAt!).getTime()
        ),
    [tasks]
  );

  return (
    <View className="flex-1 bg-brand-bg p-4">
      <Text className="text-brand-text text-2xl font-bold mb-4">
        Recently Completed
      </Text>

      {loading ? (
        <Text className="text-brand-text">Loading recent tasks...</Text>
      ) : recentCompleted.length === 0 ? (
        <View className="rounded-3xl border border-white/10 bg-brand-card p-6">
          <Text className="text-brand-text text-lg font-semibold mb-2">
            No completed tasks yet
          </Text>
          <Text className="text-gray-400">
            Task completions will appear here once work is finished in the field.
          </Text>
        </View>
      ) : (
        <FlatList
          data={recentCompleted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              title={item.title}
              status={item.status}
              subtitle={item.completedAt ? new Date(item.completedAt).toLocaleString() : undefined}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
