import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { taskPhotoApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useTaskStore } from "../store/taskStore";

interface CameraScreenProps {
  taskId: string;
  onPhotoTaken?: (photoUrl: string) => void;
  onClose?: () => void;
}

export default function CameraScreen({
  taskId,
  onPhotoTaken,
  onClose,
}: CameraScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const { updateTask } = useTaskStore();
  const { user } = useAuthStore();
  const [facing, setFacing] = useState<"front" | "back">("back");

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        requestPermission();
      }
    })();
  }, []);

  if (!permission?.granted) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-center mb-4">
          We need camera permission to take photos
        </Text>
        <TouchableOpacity
          className="bg-brand-accent px-6 py-3 rounded-lg"
          onPress={requestPermission}
        >
          <Text className="text-black font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      setPreviewUri(photo.uri);
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const uploadPhoto = async () => {
    if (!previewUri || !user?.id) return;

    setUploading(true);
    try {
      // Read the file as base64
      const fileData = await FileSystem.readAsStringAsync(previewUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create blob from base64
      const blobData = Uint8Array.from(atob(fileData), (c) => c.charCodeAt(0));
      const file = new File([blobData], `photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // Upload photo
      const photoData = await taskPhotoApi.uploadTaskPhoto(
        taskId,
        user.id,
        file,
      );

      // Update task with the image URL
      await updateTask(taskId, {
        image_url: photoData.photo_url,
        updated_at: new Date().toISOString(),
      } as any);

      Alert.alert("Success", "Photo uploaded successfully");
      onPhotoTaken?.(photoData.photo_url);
      setPreviewUri(null);
      onClose?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Error", error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const retakePhoto = () => {
    setPreviewUri(null);
  };

  if (previewUri) {
    return (
      <View className="flex-1 bg-black">
        {/* Preview Image */}
        <View className="flex-1 bg-black" />

        {/* Controls */}
        <View className="bg-black px-6 py-8 gap-3">
          <TouchableOpacity
            className="bg-brand-accent px-6 py-3 rounded-lg items-center"
            onPress={uploadPhoto}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : (
              <Text className="text-black font-bold text-lg">Upload Photo</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="border-2 border-gray-500 px-6 py-3 rounded-lg items-center"
            onPress={retakePhoto}
            disabled={uploading}
          >
            <Text className="text-white font-bold text-lg">Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border-2 border-red-600 px-6 py-3 rounded-lg items-center"
            onPress={onClose}
            disabled={uploading}
          >
            <Text className="text-red-600 font-bold text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView ref={cameraRef} facing={facing} style={{ flex: 1 }}>
        {/* Header Controls */}
        <View className="absolute top-0 left-0 right-0 flex-row justify-between items-center px-6 py-6 bg-gradient-to-b from-black/50 to-transparent">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-white text-2xl font-bold">✕</Text>
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Take Photo</Text>
          <TouchableOpacity
            onPress={() =>
              setFacing((current) => (current === "back" ? "front" : "back"))
            }
          >
            <Text className="text-white text-2xl">🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View className="absolute bottom-0 left-0 right-0 flex-row justify-center items-center px-6 py-8 bg-gradient-to-t from-black/50 to-transparent gap-4">
          <TouchableOpacity
            className="bg-brand-accent rounded-full w-16 h-16 items-center justify-center border-4 border-white"
            onPress={takePicture}
          >
            <View className="bg-white rounded-full w-14 h-14" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}
