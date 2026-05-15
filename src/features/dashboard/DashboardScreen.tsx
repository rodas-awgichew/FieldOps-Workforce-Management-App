import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

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

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
    urgent_tasks: 0,
  });

  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadDashboard();
    }
  }, [user?.id]);

  async function loadDashboard() {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .from("dashboard_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (statsError && statsError.code !== "PGRST116") {
        console.log(statsError);
      }

      if (statsData) {
        setStats(statsData);
      }

      // Fetch recent tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (tasksError) {
        console.log(tasksError);
      }

      setTasks(tasksData || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);

    await loadDashboard();

    setRefreshing(false);
  }

  function getCompletionPercentage() {
    if (stats.total_tasks === 0) return 0;

    return Math.round(
      (stats.completed_tasks / stats.total_tasks) * 100
    );
  }

  const StatCard = ({
    title,
    value,
    color,
  }: {
    title: string;
    value: number;
    color: string;
  }) => (
    <View className="flex-1 bg-brand-card rounded-xl p-4 mx-1">
      <Text className="text-gray-400 text-sm font-medium">
        {title}
      </Text>

      <Text className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </Text>
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
      <View className="px-4 py-6">
        <Text className="text-brand-text text-3xl font-bold">
          Dashboard
        </Text>

        <Text className="text-gray-400 text-sm mt-1">
          Welcome back, {user?.full_name || "Technician"}
        </Text>
      </View>

      {/* Completion */}
      <View className="px-4 mb-6">
        <View className="bg-brand-card rounded-2xl p-6">
          <Text className="text-white text-sm font-medium">
            Overall Completion
          </Text>

          <Text className="text-4xl font-bold text-white mt-2">
            {getCompletionPercentage()}%
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row px-2 mb-4">
        <StatCard
          title="Total Tasks"
          value={stats.total_tasks}
          color="text-brand-accent"
        />

        <StatCard
          title="In Progress"
          value={stats.in_progress_tasks}
          color="text-blue-400"
        />

        <StatCard
          title="Completed"
          value={stats.completed_tasks}
          color="text-green-400"
        />
      </View>

      <View className="flex-row px-2 mb-6">
        <StatCard
          title="Pending"
          value={stats.pending_tasks}
          color="text-yellow-400"
        />

        <StatCard
          title="Urgent"
          value={stats.urgent_tasks}
          color="text-red-400"
        />
      </View>

      {/* Recent Tasks */}
      <View className="px-4 mb-6">
        <Text className="text-brand-text text-lg font-bold mb-4">
          Recent Tasks
        </Text>

        {tasks.length > 0 ? (
          tasks.map((task) => (
            <View
              key={task.id}
              className="bg-brand-card rounded-xl p-4 mb-3"
            >
              <Text className="text-brand-text font-semibold">
                {task.title}
              </Text>

              <Text className="text-gray-400 mt-1">
                {task.description}
              </Text>
            </View>
          ))
        ) : (
          <View className="bg-brand-card rounded-xl p-6 items-center">
            <Text className="text-gray-400">
              No tasks found
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// import React, { useEffect, useState } from "react";
// import {
//     ActivityIndicator,
//     RefreshControl,
//     ScrollView,
//     Text,
//     View,
// } from "react-native";
// import { taskApi } from "../../services/api";
// import { useAuthStore } from "../../store/authStore";
// import { useTaskStore } from "../../store/taskStore";

// export default function DashboardScreen() {
//   const { user } = useAuthStore();
//   const { stats, tasks, fetchDashboardStats, fetchTasks, loading } =
//     useTaskStore();
//   const [refreshing, setRefreshing] = useState(false);
//   const [localStats, setLocalStats] = useState({
//     total: 0,
//     completed: 0,
//     pending: 0,
//     inProgress: 0,
//     urgent: 0,
//   });

//   useEffect(() => {
//     if (user?.id) {
//       loadDashboard();
//     }
//   }, [user?.id]);

//   const loadDashboard = async () => {
//     if (!user?.id) return;
//     try {
//       await fetchDashboardStats(user.id);
//       await fetchTasks(user.id);

//       // Calculate local stats from tasks
//       const taskData = await taskApi.getTasks(user.id);
//       const stats = {
//         total: taskData.length,
//         completed: taskData.filter((t) => t.status === "done").length,
//         pending: taskData.filter((t) => t.status === "pending").length,
//         inProgress: taskData.filter((t) => t.status === "in_progress").length,
//         urgent: taskData.filter((t) => t.priority === "urgent").length,
//       };
//       setLocalStats(stats);
//     } catch (error) {
//       console.error("Failed to load dashboard:", error);
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     try {
//       await loadDashboard();
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const getCompletionPercentage = () => {
//     if (localStats.total === 0) return 0;
//     return Math.round((localStats.completed / localStats.total) * 100);
//   };

//   const getRecentTasks = () => {
//     return tasks.slice(0, 5);
//   };

//   const StatCard = ({
//     title,
//     value,
//     color,
//     icon,
//   }: {
//     title: string;
//     value: number;
//     color: string;
//     icon?: string;
//   }) => (
//     <View className="flex-1 bg-brand-card rounded-xl p-4 mx-1">
//       <Text className="text-gray-400 text-sm font-medium">{title}</Text>
//       <Text className={`text-3xl font-bold mt-2 ${color}`}>{value}</Text>
//     </View>
//   );

//   if (loading && tasks.length === 0) {
//     return (
//       <View className="flex-1 bg-brand-bg justify-center items-center">
//         <ActivityIndicator size="large" color="#F27D26" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       className="flex-1 bg-brand-bg"
//       refreshControl={
//         <RefreshControl
//           refreshing={refreshing}
//           onRefresh={onRefresh}
//           tintColor="#F27D26"
//         />
//       }
//     >
//       {/* Header */}
//       <View className="px-4 py-6">
//         <Text className="text-brand-text text-3xl font-bold">Dashboard</Text>
//         <Text className="text-gray-400 text-sm mt-1">
//           Welcome back, {user?.full_name || "Technician"}
//         </Text>
//       </View>

//       {/* Completion Progress Card */}
//       <View className="px-4 mb-6">
//         <View className="bg-gradient-to-r from-brand-accent to-orange-600 rounded-2xl p-6">
//           <View className="flex-row justify-between items-start mb-4">
//             <View>
//               <Text className="text-white text-sm font-medium">
//                 Overall Completion
//               </Text>
//               <Text className="text-4xl font-bold text-white mt-2">
//                 {getCompletionPercentage()}%
//               </Text>
//             </View>
//             <View className="bg-white/20 rounded-full w-16 h-16 justify-center items-center">
//               <Text className="text-white text-2xl font-bold">
//                 {localStats.completed}
//               </Text>
//               <Text className="text-white text-xs">Done</Text>
//             </View>
//           </View>
//           <View className="bg-white/20 h-2 rounded-full overflow-hidden">
//             <View
//               className="bg-white h-full"
//               style={{ width: `${getCompletionPercentage()}%` }}
//             />
//           </View>
//         </View>
//       </View>

//       {/* Stats Grid - Row 1 */}
//       <View className="flex-row px-2 mb-4">
//         <StatCard
//           title="Total Tasks"
//           value={localStats.total}
//           color="text-brand-accent"
//         />
//         <StatCard
//           title="In Progress"
//           value={localStats.inProgress}
//           color="text-blue-400"
//         />
//         <StatCard
//           title="Completed"
//           value={localStats.completed}
//           color="text-green-400"
//         />
//       </View>

//       {/* Stats Grid - Row 2 */}
//       <View className="flex-row px-2 mb-6">
//         <StatCard
//           title="Pending"
//           value={localStats.pending}
//           color="text-yellow-400"
//         />
//         <StatCard
//           title="Urgent"
//           value={localStats.urgent}
//           color="text-red-400"
//         />
//       </View>

//       {/* Recent Tasks Section */}
//       <View className="px-4 mb-6">
//         <View className="flex-row justify-between items-center mb-4">
//           <Text className="text-brand-text text-lg font-bold">
//             Recent Tasks
//           </Text>
//           <Text className="text-brand-accent text-sm font-medium">
//             View All
//           </Text>
//         </View>

//         {getRecentTasks().length > 0 ? (
//           getRecentTasks().map((task) => (
//             <View
//               key={task.id}
//               className="bg-brand-card rounded-xl p-4 mb-3 border border-gray-700"
//             >
//               <View className="flex-row justify-between items-start mb-2">
//                 <Text className="flex-1 text-brand-text font-semibold text-base pr-2">
//                   {task.title}
//                 </Text>
//                 <View
//                   className={`px-2 py-1 rounded-full ${
//                     task.status === "done"
//                       ? "bg-green-900"
//                       : task.status === "in_progress"
//                         ? "bg-blue-900"
//                         : "bg-gray-700"
//                   }`}
//                 >
//                   <Text
//                     className={`text-xs font-semibold ${
//                       task.status === "done"
//                         ? "text-green-300"
//                         : task.status === "in_progress"
//                           ? "text-blue-300"
//                           : "text-gray-300"
//                     }`}
//                   >
//                     {task.status.replace("_", " ").toUpperCase()}
//                   </Text>
//                 </View>
//               </View>

//               <Text className="text-gray-400 text-sm mb-2">
//                 {task.description}
//               </Text>

//               <View className="flex-row items-center gap-4 flex-wrap">
//                 {task.location && (
//                   <Text className="text-gray-500 text-xs">
//                     📍 {task.location}
//                   </Text>
//                 )}
//                 {task.due_date && (
//                   <Text className="text-gray-500 text-xs">
//                     📅 {new Date(task.due_date).toLocaleDateString()}
//                   </Text>
//                 )}
//                 {task.priority && (
//                   <View
//                     className={`px-2 py-1 rounded ${
//                       task.priority === "urgent"
//                         ? "bg-red-900"
//                         : task.priority === "high"
//                           ? "bg-orange-900"
//                           : "bg-gray-800"
//                     }`}
//                   >
//                     <Text
//                       className={`text-xs font-medium ${
//                         task.priority === "urgent"
//                           ? "text-red-300"
//                           : task.priority === "high"
//                             ? "text-orange-300"
//                             : "text-gray-300"
//                       }`}
//                     >
//                       {task.priority?.toUpperCase() || "NORMAL"}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             </View>
//           ))
//         ) : (
//           <View className="bg-brand-card rounded-xl p-6 items-center">
//             <Text className="text-gray-400 text-center">
//               No tasks yet. Create your first task to get started!
//             </Text>
//           </View>
//         )}
//       </View>

//       {/* Quick Stats */}
//       <View className="px-4 mb-8">
//         <Text className="text-brand-text text-lg font-bold mb-4">
//           Quick Stats
//         </Text>
//         <View className="flex-row gap-3">
//           <View className="flex-1 bg-brand-card rounded-xl p-4 border border-gray-700">
//             <Text className="text-gray-400 text-xs font-medium">
//               Completion Rate
//             </Text>
//             <Text className="text-2xl font-bold text-green-400 mt-2">
//               {getCompletionPercentage()}%
//             </Text>
//           </View>
//           <View className="flex-1 bg-brand-card rounded-xl p-4 border border-gray-700">
//             <Text className="text-gray-400 text-xs font-medium">
//               Tasks This Week
//             </Text>
//             <Text className="text-2xl font-bold text-brand-accent mt-2">
//               {
//                 tasks.filter((t) => {
//                   const dueDate = t.due_date ? new Date(t.due_date) : null;
//                   const now = new Date();
//                   const weekFromNow = new Date(
//                     now.getTime() + 7 * 24 * 60 * 60 * 1000,
//                   );
//                   return dueDate && dueDate >= now && dueDate <= weekFromNow;
//                 }).length
//               }
//             </Text>
//           </View>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }
