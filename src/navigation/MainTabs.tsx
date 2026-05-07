import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../features/dashboard/DashboardScreen";
import TasksStack from "./TasksStack";
import RecentsScreen from "../features/recents/RecentsScreen";
import ProfileScreen from "../features/auth/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Tasks" component={TasksStack} />
      <Tab.Screen name="Recents" component={RecentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}