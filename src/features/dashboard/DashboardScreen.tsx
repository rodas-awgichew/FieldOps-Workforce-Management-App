import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "../../store/authStore";

type DashboardStats = {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  urgent_tasks: number;
};

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
    urgent_tasks: 0,
  });

  useEffect(() => {
    if (user?.id) {
      loadDashboard();
    }
  }, [user?.id]);

  async function loadDashboard() {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (tasksError) throw tasksError;

      const allTasks = tasksData || [];
      setTasks(allTasks);

      setStats({
        total_tasks: allTasks.length,
        completed_tasks: allTasks.filter((t) => t.status === "done").length,
        pending_tasks: allTasks.filter((t) => t.status === "pending").length,
        in_progress_tasks: allTasks.filter((t) => t.status === "in_progress").length,
        urgent_tasks: allTasks.filter((t) => t.priority === "urgent").length,
      });
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }

  const getCompletionPercentage = () => {
    if (stats.total_tasks === 0) return 0;
    return Math.round((stats.completed_tasks / stats.total_tasks) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high":   return "bg-orange-500";
      default:       return "bg-blue-500";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "done":        return { bg: "bg-green-900/30", text: "text-green-400" };
      case "in_progress": return { bg: "bg-blue-900/30",  text: "text-blue-400"  };
      default:            return { bg: "bg-gray-800",      text: "text-gray-300"  };
    }
  };

  const StatCard = ({
    title,
    value,
    colorClass,
  }: {
    title: string;
    value: number;
    colorClass: string;
  }) => (
    <View className="flex-1 bg-brand-card rounded-2xl p-4 mx-1 border border-white/5">
      <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
        {title}
      </Text>
      <Text className={`text-2xl font-black mt-1 ${colorClass}`}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-brand-bg justify-center items-center">
        <ActivityIndicator size="large" color="#F27D26" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-brand-bg"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#F27D26"
        />
      }
    >
      {/* Header */}
      <View className="px-5 pt-6 pb-4">
        <Text className="text-brand-text text-3xl font-black">Dashboard</Text>
        <Text className="text-gray-400 text-base">
          Welcome back,{" "}
          <Text className="text-brand-accent font-bold">
            {user?.full_name || "Technician"}
          </Text>
        </Text>
      </View>

      {/* Hero Completion Card */}
      <View className="px-5 mb-6">
        <View className="bg-brand-accent rounded-3xl p-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white/80 text-sm font-bold uppercase">
                Overall Completion
              </Text>
              <Text className="text-5xl font-black text-white mt-1">
                {getCompletionPercentage()}%
              </Text>
            </View>
            <View className="bg-white/20 px-3 py-2 rounded-full">
              <Text className="text-white text-xs font-bold">LIVE</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden">
            <View
              className="bg-white h-full rounded-full"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </View>

          {/* Sub-stats row */}
          <View className="flex-row justify-between mt-4">
            <Text className="text-white/70 text-xs">
              {stats.completed_tasks} of {stats.total_tasks} tasks done
            </Text>
            {stats.urgent_tasks > 0 && (
              <Text className="text-red-300 text-xs font-bold">
                ⚠ {stats.urgent_tasks} urgent
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="px-4 mb-2">
        <View className="flex-row mb-3">
          <StatCard title="Total"  value={stats.total_tasks}       colorClass="text-white"      />
          <StatCard title="Active" value={stats.in_progress_tasks} colorClass="text-blue-400"   />
          <StatCard title="Done"   value={stats.completed_tasks}   colorClass="text-green-400"  />
        </View>
        <View className="flex-row mb-8">
          <StatCard title="Pending" value={stats.pending_tasks} colorClass="text-yellow-400" />
          <StatCard title="Urgent"  value={stats.urgent_tasks}  colorClass="text-red-400"    />
        </View>
      </View>

      {/* Recent Tasks */}
      <View className="px-5 pb-10">
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-brand-text text-xl font-bold">Recent Tasks</Text>
          <Pressable
            onPress={() =>
              navigation.navigate("Tasks", { screen: "TaskList" })
            }
          >
            <Text className="text-brand-accent font-bold">View All</Text>
          </Pressable>
        </View>

        {tasks.length > 0 ? (
          tasks.slice(0, 5).map((task) => {
            const statusStyle = getStatusStyle(task.status);
            return (
              <Pressable
                key={task.id}
                onPress={() =>
                  navigation.navigate("Tasks", {
                    screen: "TaskDetail",
                    params: { taskId: task.id },
                  })
                }
                className="bg-brand-card rounded-2xl p-4 mb-3 border border-white/5 active:opacity-80"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 mr-3">
                    <Text
                      className="text-brand-text text-lg font-bold"
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                    <Text
                      className="text-gray-400 text-sm mt-1"
                      numberOfLines={1}
                    >
                      📍 {task.location || "No location specified"}
                    </Text>
                  </View>

                  {/* Status badge */}
                  <View className={`px-2 py-1 rounded-lg ${statusStyle.bg}`}>
                    <Text
                      className={`text-[10px] font-black uppercase ${statusStyle.text}`}
                    >
                      {task.status?.replace("_", " ")}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-white/5">
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-xs font-bold uppercase mr-2">
                      Due
                    </Text>
                    <Text className="text-brand-text text-xs font-medium">
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : "Not set"}
                    </Text>
                  </View>

                  {/* Priority dot */}
                  <View className="flex-row items-center">
                    <View
                      className={`w-2 h-2 rounded-full mr-2 ${getPriorityColor(task.priority)}`}
                    />
                    <Text className="text-gray-400 text-xs capitalize">
                      {task.priority || "Normal"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        ) : (
          <View className="bg-brand-card rounded-2xl p-8 items-center border border-dashed border-white/10">
            <Text className="text-gray-500 font-medium">
              No tasks found for your account.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}