import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import AppButton from "../../components/AppButton";
import { profileApi } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

export default function ProfileScreen() {
  const { user, logout, updateProfile, loading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFullName(user?.full_name || "");
    setPhone(user?.phone || "");
    setDepartment(user?.department || "");
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        department,
      });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && user?.id) {
        setUploading(true);
        const file = {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: `avatar-${Date.now()}.jpg`,
        } as any;

        // Convert URI to blob for upload
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        const fileObject = new File([blob], file.name, { type: file.type });

        const updated = await profileApi.uploadAvatar(user.id, fileObject);
        await updateProfile({ avatar_url: updated.avatar_url });

        Alert.alert("Success", "Avatar updated successfully");
        setUploading(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image");
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-brand-bg">
      {/* Header */}
      <View className="px-4 py-6 border-b border-gray-700">
        <Text className="text-brand-text text-3xl font-bold">Profile</Text>
        <Text className="text-gray-400 text-sm mt-1">
          Manage your account information
        </Text>
      </View>

      {/* Avatar Section */}
      <View className="items-center py-6 px-4">
        <View className="relative">
          {user?.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              className="w-32 h-32 rounded-full bg-brand-card border-4 border-brand-accent"
            />
          ) : (
            <View className="w-32 h-32 rounded-full bg-brand-card border-4 border-brand-accent items-center justify-center">
              <Text className="text-4xl">👤</Text>
            </View>
          )}

          {uploading && (
            <View className="absolute inset-0 rounded-full bg-black/50 items-center justify-center">
              <ActivityIndicator size="large" color="#F27D26" />
            </View>
          )}
        </View>

        <AppButton
          title={uploading ? "Uploading..." : "Change Avatar"}
          onPress={handlePickImage}
          disabled={uploading}
          style="mt-4 bg-brand-accent"
        />
      </View>

      {/* Profile Information */}
      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-brand-text text-lg font-bold">
            Personal Information
          </Text>
          <AppButton
            title={isEditing ? "Cancel" : "Edit"}
            onPress={() => setIsEditing(!isEditing)}
            style="bg-transparent border border-brand-accent px-3 py-1"
          />
        </View>

        {/* Email (Read-only) */}
        <View className="mb-4">
          <Text className="text-gray-400 text-sm font-medium mb-2">Email</Text>
          <View className="bg-brand-card p-4 rounded-xl border border-gray-700">
            <Text className="text-brand-text font-medium">{user?.email}</Text>
          </View>
        </View>

        {/* Full Name */}
        <View className="mb-4">
          <Text className="text-gray-400 text-sm font-medium mb-2">
            Full Name
          </Text>
          {isEditing ? (
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#666"
              className="bg-brand-card p-4 rounded-xl border border-gray-700 text-brand-text"
            />
          ) : (
            <View className="bg-brand-card p-4 rounded-xl border border-gray-700">
              <Text className="text-brand-text font-medium">
                {fullName || "Not set"}
              </Text>
            </View>
          )}
        </View>

        {/* Phone */}
        <View className="mb-4">
          <Text className="text-gray-400 text-sm font-medium mb-2">
            Phone Number
          </Text>
          {isEditing ? (
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              className="bg-brand-card p-4 rounded-xl border border-gray-700 text-brand-text"
            />
          ) : (
            <View className="bg-brand-card p-4 rounded-xl border border-gray-700">
              <Text className="text-brand-text font-medium">
                {phone || "Not set"}
              </Text>
            </View>
          )}
        </View>

        {/* Department */}
        <View className="mb-4">
          <Text className="text-gray-400 text-sm font-medium mb-2">
            Department
          </Text>
          {isEditing ? (
            <TextInput
              value={department}
              onChangeText={setDepartment}
              placeholder="Enter your department"
              placeholderTextColor="#666"
              className="bg-brand-card p-4 rounded-xl border border-gray-700 text-brand-text"
            />
          ) : (
            <View className="bg-brand-card p-4 rounded-xl border border-gray-700">
              <Text className="text-brand-text font-medium">
                {department || "Not set"}
              </Text>
            </View>
          )}
        </View>

        {/* Role (Read-only) */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-medium mb-2">Role</Text>
          <View className="bg-brand-card p-4 rounded-xl border border-gray-700">
            <Text className="text-brand-accent font-bold capitalize">
              {user?.role || "technician"}
            </Text>
          </View>
        </View>

        {isEditing && (
          <AppButton
            title={loading ? "Saving..." : "Save Changes"}
            onPress={handleUpdateProfile}
            disabled={loading}
          />
        )}
      </View>

      {/* Account Statistics */}
      <View className="px-4 mb-6">
        <Text className="text-brand-text text-lg font-bold mb-4">
          Account Details
        </Text>

        <View className="flex-row gap-3 mb-3">
          <View className="flex-1 bg-brand-card p-4 rounded-xl border border-gray-700">
            <Text className="text-gray-400 text-xs font-medium">
              Member Since
            </Text>
            <Text className="text-brand-text font-semibold mt-2">
              {new Date(user?.created_at || "").toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-1 bg-brand-card p-4 rounded-xl border border-gray-700">
            <Text className="text-gray-400 text-xs font-medium">
              Last Updated
            </Text>
            <Text className="text-brand-text font-semibold mt-2">
              {new Date(user?.updated_at || "").toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Danger Zone */}
      <View className="px-4 mb-8">
        <View className="border-t border-red-900/50 pt-6">
          <Text className="text-red-400 text-lg font-bold mb-4">
            Danger Zone
          </Text>
          <AppButton
            title="Sign Out"
            onPress={handleSignOut}
            style="bg-red-900 border border-red-700"
          />
        </View>
      </View>
    </ScrollView>
  );
}
