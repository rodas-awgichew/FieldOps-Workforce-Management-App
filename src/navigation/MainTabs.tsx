import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProfileScreen from "../features/auth/ProfileScreen";
import DashboardScreen from "../features/dashboard/DashboardScreen";
import RecentsScreen from "../features/recents/RecentsScreen";
import TasksStack from "./TasksStack";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "home";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Tasks") {
            iconName = focused
              ? "checkbox-marked-outline"
              : "checkbox-blank-outline";
          } else if (route.name === "Recents") {
            iconName = focused ? "history" : "history";
          } else if (route.name === "Profile") {
            iconName = focused ? "account" : "account-outline";
          }

          return (
            <MaterialCommunityIcons
              name={iconName as any}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#F27D26",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#111",
          borderTopColor: "#333",
          borderTopWidth: 1,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksStack}
        options={{ title: "Tasks" }}
      />
      <Tab.Screen
        name="Recents"
        component={RecentsScreen}
        options={{ title: "Recents" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}
