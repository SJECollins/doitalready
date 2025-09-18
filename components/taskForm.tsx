import { useMessage } from "@/app/_layout";
import {
  addTask,
  getAllLists,
  getTaskById,
  Task,
  TaskList,
  updateTask,
} from "@/lib/db";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import CheckboxItem from "react-native-paper/lib/typescript/components/Checkbox/CheckboxItem";
import useStyles from "../assets/styles";
import PageView from "./pageView";

const initialTaskState: Omit<Task, "id" | "completed"> = {
  title: "",
  list_id: undefined,
  deleteOnComplete: false,
};

export default function TaskForm({ taskId }: { taskId: string | null }) {
  const { triggerMessage } = useMessage();
  const router = useRouter();
  const styles = useStyles();

  const [lists, setLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | "none">("none");
  const [task, setTask] =
    useState<Omit<Task, "id" | "completed">>(initialTaskState);

  const loadData = () => {
    try {
      const allLists = getAllLists();
      if (allLists) {
        setLists(allLists);
      } else {
        setLists([]);
        triggerMessage("No lists found", "info");
      }
      if (taskId) {
        const fetchedTask = getTaskById(taskId);
        if (fetchedTask) {
          setTask({
            title: fetchedTask.title,
            list_id: fetchedTask.list_id,
            deleteOnComplete: fetchedTask.deleteOnComplete,
          });
          setSelectedListId(fetchedTask.list_id ?? "none");
        } else {
          triggerMessage("Task not found", "error");
        }
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      triggerMessage(`Error loading task: ${errMsg}`, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleAddTask = () => {
    try {
      const list_id = selectedListId === "none" ? undefined : selectedListId;
      if (task.title.trim() === "") {
        triggerMessage("Task title cannot be empty", "error");
        return;
      }
      // If assigned to a list, check if the list exists
      if (list_id && !lists.find((list) => list.id === list_id)) {
        triggerMessage("Selected list does not exist", "error");
        return;
      }
      addTask(task.title.trim(), list_id, task.deleteOnComplete);
      triggerMessage("Task added successfully", "success");
      router.back();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      triggerMessage(`Error adding task: ${errMsg}`, "error");
    }
  };

  const handleUpdateTask = () => {
    try {
      if (!taskId) {
        triggerMessage("No task ID provided for update", "error");
        return;
      }
      const list_id = selectedListId === "none" ? undefined : selectedListId;
      if (task.title.trim() === "") {
        triggerMessage("Task title cannot be empty", "error");
        return;
      }
      // If assigned to a list, check if the list exists
      if (list_id && !lists.find((list) => list.id === list_id)) {
        triggerMessage("Selected list does not exist", "error");
        return;
      }
      updateTask(taskId, {
        title: task.title.trim(),
        list_id: list_id,
        deleteOnComplete: task.deleteOnComplete,
      });
      triggerMessage("Task updated successfully", "success");
      router.back();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      triggerMessage(`Error updating task: ${errMsg}`, "error");
    }
  };

  return (
    <PageView>
      <Text variant="headlineLarge">{taskId ? "Edit Task" : "New Task"}</Text>

      <View style={styles.formGroup}>
        <Text variant="bodyMedium">Task Title</Text>
        <TextInput
          mode="outlined"
          value={task.title}
          onChangeText={(text) => setTask({ ...task, title: text })}
          placeholder="Enter task title"
        />
      </View>

      <View style={styles.formGroup}>
        <Text variant="bodyMedium">Delete when completed?</Text>
        <Text variant="bodySmall">
          {" "}
          If enabled, this task will be deleted automatically when marked as
          completed. This setting is ignored if the task is part of a list that
          has &quot;Delete on complete&quot; enabled.
        </Text>
        <CheckboxItem
          label="Delete on complete"
          status={task.deleteOnComplete ? "checked" : "unchecked"}
          onPress={() =>
            setTask({ ...task, deleteOnComplete: !task.deleteOnComplete })
          }
        />
      </View>

      <View style={styles.formGroup}>
        <Text variant="bodyMedium">Assign to List (optional)</Text>
        <Text variant="bodySmall">
          Leave as -- No List -- to add to main tasks.
        </Text>
        <Picker
          selectedValue={selectedListId}
          onValueChange={(itemValue) => setSelectedListId(itemValue)}
        >
          <Picker.Item label="-- No List --" value="none" />
          {lists.map((list) => (
            <Picker.Item key={list.id} label={list.title} value={list.id} />
          ))}
        </Picker>
      </View>

      {lists.length === 0 && (
        <View>
          <Text variant="bodySmall">
            No lists found. If you want to add this task to a list, create the
            list first.
          </Text>
          <Button mode="contained" onPress={() => router.push("../lists/add")}>
            Create List
          </Button>
        </View>
      )}
      {taskId ? (
        <Button mode="contained" onPress={handleUpdateTask}>
          Update Task
        </Button>
      ) : (
        <Button mode="contained" onPress={handleAddTask}>
          Add Task
        </Button>
      )}
    </PageView>
  );
}
