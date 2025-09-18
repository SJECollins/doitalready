import TaskForm from "@/components/taskForm";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native-paper";

export default function EditTask() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  if (!taskId || Array.isArray(taskId)) {
    return <Text>No task ID provided</Text>;
  }

  return <TaskForm taskId={taskId} />;
}
