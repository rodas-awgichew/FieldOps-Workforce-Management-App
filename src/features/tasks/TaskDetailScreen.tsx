import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import CameraScreen from "../../components/CameraScreen";
import { TaskStackParamList } from "../../navigation/TasksStack";
import { taskPhotoApi } from "../../services/api";
import { supabase } from "../../services/supabase";
import { TaskPhoto } from "../../services/supabase";
import { useAuthStore } from "../../store/authStore";
import { useTaskStore } from "../../store/taskStore";

type TaskDetailRoute = RouteProp<TaskStackParamList, "TaskDetail">;

// regenerate a fresh public URL from the stored file_path
function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage.from("task-photos").getPublicUrl(filePath);
  return data.publicUrl;
}

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
      Alert.alert("Permission required", "Please allow access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0 || !user?.id) return;

    setUploading(true);
    try {
      const photoAsset = result.assets[0];
      const file = {
        uri: photoAsset.uri,
        name: `photo-${Date.now()}.jpg`,
        type: "image/jpeg",
      };

      await taskPhotoApi.uploadTaskPhoto(taskId, user.id, file);
      await loadPhotos();
      Alert.alert("Success", "Photo uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Error", error.message || "Failed to upload photo");
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
          } catch (error) {
            Alert.alert("Error", "Failed to delete photo");
          }
        },
      },
    ]);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "done":        return { bg: "bg-green-900", text: "text-green-300" };
      case "in_progress": return { bg: "bg-blue-900",  text: "text-blue-300"  };
      default:            return { bg: "bg-gray-700",   text: "text-gray-300"  };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "urgent": return { bg: "bg-red-900",    text: "text-red-300"    };
      case "high":   return { bg: "bg-orange-900", text: "text-orange-300" };
      case "medium": return { bg: "bg-yellow-900", text: "text-yellow-300" };
      default:       return { bg: "bg-gray-800",   text: "text-gray-300"   };
    }
  };

  if (showCamera && user?.id) {
    return (
      <CameraScreen
        taskId={taskId}
        onPhotoTaken={() => {
          loadPhotos();
          setShowCamera(false);
        }}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-bg">
        <ActivityIndicator size="large" color="#F27D26" />
        <Text className="text-brand-text mt-4">Loading task details...</Text>
      </View>
    );
  }

  if (!selectedTask) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-bg p-4">
        <Text className="text-brand-text text-lg font-semibold mb-4">
          Task not found
        </Text>
        <AppButton title="Back to tasks" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const statusStyle  = getStatusStyle(selectedTask.status);
  const priorityStyle = getPriorityStyle(selectedTask.priority);

  return (
    <ScrollView className="flex-1 bg-brand-bg">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-brand-text text-3xl font-bold">Task Details</Text>
      </View>

      <View className="px-4 pb-6">
        {/* Title + Status */}
        <View className="mb-6">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="flex-1 text-brand-text text-2xl font-bold mr-3">
              {selectedTask.title}
            </Text>
            <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
              <Text className={`text-sm font-semibold ${statusStyle.text}`}>
                {selectedTask.status.replace("_", " ").toUpperCase()}
              </Text>
            </View>
          </View>
          {selectedTask.description ? (
            <Text className="text-gray-400 text-sm">{selectedTask.description}</Text>
          ) : null}
        </View>

        {/* Info Card */}
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

          <View className={selectedTask.completed_at ? "mb-3 pb-3 border-b border-gray-700" : ""}>
            <Text className="text-gray-400 text-xs font-medium">PRIORITY</Text>
            <View className={`mt-1 self-start px-2 py-1 rounded ${priorityStyle.bg}`}>
              <Text className={`text-sm font-semibold ${priorityStyle.text}`}>
                {selectedTask.priority?.toUpperCase() || "NORMAL"}
              </Text>
            </View>
          </View>

          {selectedTask.completed_at && (
            <View>
              <Text className="text-gray-400 text-xs font-medium">COMPLETED AT</Text>
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
            <View className="mb-4">
              {photos.map((photo) => {
                // generate a fresh public URL from file_path
                const imageUrl = getPublicUrl(photo.file_path);
                return (
                  <View
                    key={photo.id}
                    className="rounded-xl overflow-hidden bg-brand-card border border-gray-700 mb-3"
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={{ width: "100%", height: 192 }}
                      resizeMode="cover"
                      onError={(e) =>
                        console.log("Image load error:", e.nativeEvent.error, imageUrl)
                      }
                    />
                    <View className="p-2 items-end">
                      <TouchableOpacity
                        onPress={() => handleDeletePhoto(photo.id, photo.file_path)}
                        className="bg-red-900 px-3 py-1 rounded-lg"
                      >
                        <Text className="text-red-300 text-xs font-bold">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
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
            />
            <AppButton
              title="🖼️ Choose from Gallery"
              onPress={handleImageUpload}
              disabled={uploading}
            />
          </View>
        </View>

        {/* Status Toggle */}
        <AppButton
          title={selectedTask.status === "done" ? "Mark as Pending" : "Mark as Complete"}
          onPress={handleStatusUpdate}
        />
      </View>
    </ScrollView>
  );
}