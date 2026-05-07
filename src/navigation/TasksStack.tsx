import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TaskDetailScreen from "../features/tasks/TaskDetailScreen";
import TaskListScreen from "../features/tasks/TaskListScreen";

type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
};

export type { TaskStackParamList };

const Stack = createNativeStackNavigator<TaskStackParamList>();

export default function TasksStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    </Stack.Navigator>
  );
}
