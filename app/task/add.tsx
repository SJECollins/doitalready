import TaskForm from "@/components/taskForm";
import { useLocalSearchParams } from "expo-router";

export default function AddTask() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  return <TaskForm taskId={null} listId={listId} />;
}
