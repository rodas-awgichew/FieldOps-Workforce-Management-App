import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import AppButton from "../../components/AppButton";
import { TaskStackParamList } from "../../navigation/TasksStack";
import { findTask, fetchTasks, updateTaskStatus } from "./taskService";
import { scheduleTaskCompleteNotification } from "../../services/notification";
import { Task } from "./types";

type TaskDetailRoute = RouteProp<TaskStackParamList, "TaskDetail">;

export default function TaskDetailScreen() {
  const route = useRoute<TaskDetailRoute>();
  const navigation = useNavigation();
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks()
      .then((tasks) => setTask(findTask(taskId, tasks) ?? null))
      .finally(() => setLoading(false));
  }, [taskId]);

  async function handleImageUpload() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    setImageUri(result.assets[0].uri);
  }

  async function handleStatusUpdate() {
    if (!task) {
      return;
    }

    const nextStatus = task.status === "done" ? "pending" : "done";
    const updatedTask = await updateTaskStatus(task.id, nextStatus);
    setTask(updatedTask);

    if (updatedTask.status === "done") {
      await scheduleTaskCompleteNotification(updatedTask.title);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-bg p-4">
        <Text className="text-brand-text">Loading task details...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-bg p-4">
        <Text className="text-brand-text text-lg font-semibold">Task not found</Text>
        <AppButton title="Back to tasks" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-brand-bg p-4">
      <Text className="text-brand-text text-2xl font-bold mb-3">{task.title}</Text>
      <Text className="text-gray-400 mb-6">Assigned to {task.assignee}</Text>

      <View className="rounded-3xl bg-brand-card p-4 mb-4">
        <Text className="text-brand-text font-semibold mb-2">Description</Text>
        <Text className="text-gray-300 mb-4">{task.description}</Text>
        <Text className="text-brand-text mb-1">Location: {task.location}</Text>
        <Text className="text-brand-text mb-1">Due date: {task.dueDate}</Text>
        <Text className="text-brand-text mb-1">Status: {task.status}</Text>
        {task.completedAt ? (
          <Text className="text-gray-400">Completed: {new Date(task.completedAt).toLocaleString()}</Text>
        ) : null}
      </View>

      <View className="rounded-3xl bg-brand-card p-4 mb-6">
        <Text className="text-brand-text font-semibold mb-2">Upload image</Text>
        <Text className="text-gray-400 mb-4">
          Add evidence from the field and keep the task details current.
        </Text>
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="h-64 w-full rounded-3xl mb-4" />
        ) : null}
        <AppButton title="Choose photo" onPress={handleImageUpload} />
      </View>

      <AppButton
        title={task.status === "done" ? "Mark as pending" : "Mark as complete"}
        onPress={handleStatusUpdate}
      />

      <View className="mt-4">
        <AppButton title="Back to list" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}
