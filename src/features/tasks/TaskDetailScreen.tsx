import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    View,
} from "react-native";
import AppButton from "../../components/AppButton";
import CameraScreen from "../../components/CameraScreen";
import { TaskStackParamList } from "../../navigation/TasksStack";
import { taskPhotoApi } from "../../services/api";
import { TaskPhoto } from "../../services/supabase";
import { useAuthStore } from "../../store/authStore";
import { useTaskStore } from "../../store/taskStore";

type TaskDetailRoute = RouteProp<TaskStackParamList, "TaskDetail">;

export default function TaskDetailScreen() {
  const route = useRoute<TaskDetailRoute>();
  const navigation = useNavigation();
  const { taskId } = route.params;
  const { selectedTask, fetchTaskById, updateTask, loading } = useTaskStore();
  const { user } = useAuthStore();
  const [showCamera, setShowCamera] = useState(false);
  const [photos, setPhotos] = useState<TaskPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.id && taskId) {
      loadTaskDetails();
    }
  }, [taskId, user?.id]);

  const loadTaskDetails = async () => {
    try {
      await fetchTaskById(taskId);
      await loadPhotos();
    } catch (error) {
      console.error("Error loading task:", error);
      Alert.alert("Error", "Failed to load task details");
    }
  };

  const loadPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const taskPhotos = await taskPhotoApi.getTaskPhotos(taskId);
      setPhotos(taskPhotos);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleImageUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0 || !user?.id) {
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      const file = new File([blob], `photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      await taskPhotoApi.uploadTaskPhoto(taskId, user.id, file);
      await loadPhotos();
      Alert.alert("Success", "Photo uploaded successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedTask) return;

    try {
      const nextStatus = selectedTask.status === "done" ? "pending" : "done";
      await updateTask(taskId, {
        status: nextStatus as any,
        completed_at: nextStatus === "done" ? new Date().toISOString() : null,
      } as any);
      Alert.alert("Success", "Task status updated");
    } catch (error) {
      Alert.alert("Error", "Failed to update task status");
    }
  };

  const handleDeletePhoto = (photoId: string, filePath: string) => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await taskPhotoApi.deleteTaskPhoto(photoId, filePath);
            await loadPhotos();
            Alert.alert("Success", "Photo deleted");
          } catch (error) {
            Alert.alert("Error", "Failed to delete photo");
          }
        },
      },
    ]);
  };

  if (showCamera && user?.id) {
    return (
      <CameraScreen
        taskId={taskId}
        onPhotoTaken={() => loadPhotos()}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-bg p-4">
        <ActivityIndicator size="large" color="#F27D26" />
        <Text className="text-brand-text mt-4">Loading task details...</Text>
      </View>
    );
  }

  if (!selectedTask) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-bg p-4">
        <Text className="text-brand-text text-lg font-semibold">
          Task not found
        </Text>
        <AppButton title="Back to tasks" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-brand-bg p-4">
      {/* Task Header */}
      <View className="mb-6">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="flex-1 text-brand-text text-2xl font-bold">
            {selectedTask.title}
          </Text>
          <View
            className={`px-3 py-1 rounded-full ${
              selectedTask.status === "done"
                ? "bg-green-900"
                : selectedTask.status === "in_progress"
                  ? "bg-blue-900"
                  : "bg-gray-700"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedTask.status === "done"
                  ? "text-green-300"
                  : selectedTask.status === "in_progress"
                    ? "text-blue-300"
                    : "text-gray-300"
              }`}
            >
              {selectedTask.status.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>
        <Text className="text-gray-400 text-sm">
          {selectedTask.description}
        </Text>
      </View>

      {/* Task Details Card */}
      <View className="rounded-2xl bg-brand-card p-4 mb-6 border border-gray-700">
        <View className="mb-3 pb-3 border-b border-gray-700">
          <Text className="text-gray-400 text-xs font-medium">ASSIGNED TO</Text>
          <Text className="text-brand-text font-semibold mt-1">
            {selectedTask.assigned_to || "Unassigned"}
          </Text>
        </View>

        <View className="mb-3 pb-3 border-b border-gray-700">
          <Text className="text-gray-400 text-xs font-medium">LOCATION</Text>
          <Text className="text-brand-text font-semibold mt-1">
            📍 {selectedTask.location || "Not specified"}
          </Text>
        </View>

        <View className="mb-3 pb-3 border-b border-gray-700">
          <Text className="text-gray-400 text-xs font-medium">DUE DATE</Text>
          <Text className="text-brand-text font-semibold mt-1">
            📅{" "}
            {selectedTask.due_date
              ? new Date(selectedTask.due_date).toLocaleDateString()
              : "Not set"}
          </Text>
        </View>

        <View className="mb-3 pb-3 border-b border-gray-700">
          <Text className="text-gray-400 text-xs font-medium">PRIORITY</Text>
          <View
            className={`mt-1 px-2 py-1 rounded w-fit ${
              selectedTask.priority === "urgent"
                ? "bg-red-900"
                : selectedTask.priority === "high"
                  ? "bg-orange-900"
                  : selectedTask.priority === "medium"
                    ? "bg-yellow-900"
                    : "bg-gray-800"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedTask.priority === "urgent"
                  ? "text-red-300"
                  : selectedTask.priority === "high"
                    ? "text-orange-300"
                    : selectedTask.priority === "medium"
                      ? "text-yellow-300"
                      : "text-gray-300"
              }`}
            >
              {selectedTask.priority?.toUpperCase() || "NORMAL"}
            </Text>
          </View>
        </View>

        {selectedTask.completed_at && (
          <View>
            <Text className="text-gray-400 text-xs font-medium">
              COMPLETED AT
            </Text>
            <Text className="text-green-400 font-semibold mt-1">
              {new Date(selectedTask.completed_at).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Photos Section */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-brand-text text-lg font-bold">
            Photos ({photos.length})
          </Text>
          {loadingPhotos && <ActivityIndicator size="small" color="#F27D26" />}
        </View>

        {photos.length > 0 ? (
          <View className="space-y-3 mb-4">
            {photos.map((photo) => (
              <View
                key={photo.id}
                className="relative rounded-xl overflow-hidden bg-brand-card border border-gray-700"
              >
                <Image
                  source={{ uri: photo.photo_url }}
                  className="w-full h-48 bg-gray-700"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2 right-2">
                  <AppButton
                    title="Delete"
                    onPress={() => handleDeletePhoto(photo.id, photo.file_path)}
                    style="bg-red-600 px-2 py-1 text-xs"
                  />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-brand-card p-6 rounded-xl border border-gray-700 items-center mb-4">
            <Text className="text-gray-400 text-center">
              No photos yet. Add some evidence from the field.
            </Text>
          </View>
        )}

        <View className="gap-3">
          <AppButton
            title={uploading ? "Uploading..." : "📷 Take Photo"}
            onPress={() => setShowCamera(true)}
            disabled={uploading}
            style="bg-brand-accent"
          />
          <AppButton
            title="🖼️ Choose from Gallery"
            onPress={handleImageUpload}
            disabled={uploading}
            style="border border-brand-accent bg-transparent"
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View className="gap-3 mb-4">
        <AppButton
          title={
            selectedTask.status === "done"
              ? "Mark as Pending"
              : "Mark as Complete"
          }
          onPress={handleStatusUpdate}
          style={
            selectedTask.status === "done"
              ? "border border-brand-accent bg-transparent"
              : "bg-green-600"
          }
        />
        <AppButton
          title="Back to Tasks"
          onPress={() => navigation.goBack()}
          style="border border-gray-600 bg-transparent"
        />
      </View>
    </ScrollView>
  );
}
