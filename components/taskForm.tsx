import { useMessage } from "@/app/_layout";
import {
  addTask,
  getLists,
  getTaskById,
  Task,
  TaskList,
  updateTask,
} from "@/lib/db";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";
import useStyles from "../assets/styles";
import PageView from "./pageView";

const initialTaskState: Omit<Task, "id"> = {
  title: "",
  list_id: undefined,
  deleteOnComplete: false,
  resetOnComplete: false,
  resetAt: "",
  resetInterval: null,
  completed: false,
};

export default function TaskForm({ taskId }: { taskId: string | null }) {
  const { triggerMessage } = useMessage();
  const router = useRouter();
  const styles = useStyles();

  const [resetSchedulerVisible, setResetSchedulerVisible] = useState(false);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | "none">("none");
  const [task, setTask] = useState<Omit<Task, "id">>(initialTaskState);

  const loadData = () => {
    try {
      const allLists = getLists();
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
            resetOnComplete: fetchedTask.resetOnComplete,
            resetAt: fetchedTask.resetAt,
            resetInterval: fetchedTask.resetInterval,
            completed: fetchedTask.completed,
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

  const validateTask = () => {
    const list_id = selectedListId === "none" ? undefined : selectedListId;
    if (task.title.trim() === "") {
      triggerMessage("Task title cannot be empty", "error");
      return false;
    }
    if (list_id && !lists.find((list) => list.id === list_id)) {
      triggerMessage("Selected list does not exist", "error");
      return false;
    }
    // If, somehow, both deleteOnComplete and resetOnComplete are true, prompt user to select only one themselves
    if (task.deleteOnComplete && task.resetOnComplete) {
      triggerMessage(
        "Task cannot have both Delete on complete and Reset on complete enabled. Please select only one.",
        "error"
      );
      return false;
    }
    return true;
  };

  const handleAddTask = () => {
    try {
      if (!validateTask()) return;

      const list_id = selectedListId === "none" ? undefined : selectedListId;

      addTask(
        task.title.trim(),
        list_id,
        task.deleteOnComplete,
        task.resetOnComplete,
        task.resetInterval
      );
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

      if (!validateTask()) return;
      const list_id = selectedListId === "none" ? undefined : selectedListId;

      updateTask(taskId, {
        title: task.title.trim(),
        list_id: list_id,
        deleteOnComplete: task.deleteOnComplete,
        resetOnComplete: task.resetOnComplete,
        resetInterval: task.resetInterval,
      });
      triggerMessage("Task updated successfully", "success");
      router.back();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      triggerMessage(`Error updating task: ${errMsg}`, "error");
    }
  };

  const handleDeleteOnCompleteToggle = () => {
    setTask({ ...task, deleteOnComplete: !task.deleteOnComplete });
    if (!task.deleteOnComplete && task.resetOnComplete) {
      setTask({ ...task, resetOnComplete: false });
      triggerMessage(
        "Delete on complete is not compatible with Reset on complete. Disabling Reset on complete.",
        "info"
      );
      setResetSchedulerVisible(false);
    }
  };

  const handleResetSchedulerToggle = () => {
    setTask({ ...task, resetOnComplete: !task.resetOnComplete });
    if (task.resetOnComplete && !task.resetInterval) {
      setTask({ ...task, resetInterval: "hour" });
    }
    if (task.resetOnComplete && task.deleteOnComplete) {
      setTask({ ...task, deleteOnComplete: false });
      triggerMessage(
        "Reset on complete is not compatible with Delete on complete. Disabling Delete on complete.",
        "info"
      );
    }
    setResetSchedulerVisible(!resetSchedulerVisible);
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
        <Text variant="bodyMedium">Assign to List (optional)</Text>
        <Text variant="bodySmall">
          Leave as -- No List -- to add to main tasks.
        </Text>
        <Picker
          mode="dropdown"
          selectedValue={selectedListId}
          onValueChange={(itemValue) => setSelectedListId(itemValue)}
          style={styles.pickerStyle}
        >
          <Picker.Item
            label="-- No List --"
            value="none"
            style={styles.pickerItemStyle}
          />
          {lists.map((list) => (
            <Picker.Item
              key={list.id}
              label={list.title}
              value={list.id}
              style={styles.pickerItemStyle}
            />
          ))}
        </Picker>
      </View>

      {lists.length === 0 && (
        <View>
          <Text variant="bodySmall">
            No lists found. If you want to add this task to a list, create the
            list first.
          </Text>
          <View style={styles.btnRow}>
            <Button
              mode="contained"
              onPress={() => router.push("/list/add")}
              style={styles.btn}
            >
              Create List
            </Button>
          </View>
        </View>
      )}

      {/* Only show these options if the task is not part of a list */}
      {selectedListId === "none" && (
        <>
          <View style={styles.formGroup}>
            <Text variant="bodyMedium">Delete when completed?</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Checkbox
                status={task.deleteOnComplete ? "checked" : "unchecked"}
                onPress={handleDeleteOnCompleteToggle}
              />
              <Text>Delete on complete</Text>
            </View>
            <Text variant="labelSmall">
              {" "}
              If enabled, this task will be deleted when marked as completed.
              Ignored if the task is part of a list. Not compatible with
              &quot;Reset on complete&quot;.
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text variant="bodyMedium">Reset when completed?</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Checkbox
                status={task.resetOnComplete ? "checked" : "unchecked"}
                onPress={handleResetSchedulerToggle}
              />
              <Text>Reset on complete</Text>
            </View>
            {resetSchedulerVisible && (
              <Picker
                mode="dropdown"
                selectedValue={task.resetInterval || "hour"}
                onValueChange={(itemValue) =>
                  setTask({ ...task, resetInterval: itemValue })
                }
              >
                <Picker.Item label="Hour" value="hour" />
                <Picker.Item label="Day" value="day" />
                <Picker.Item label="Week" value="week" />
                <Picker.Item label="Month" value="month" />
                <Picker.Item label="Year" value="year" />
              </Picker>
            )}
            <Text variant="labelSmall">
              If enabled, this task will be reset to incomplete after marked as
              completed. You can specify the interval to reset (1 hour is
              default). Ignored if task is part of a list. Not compatible with
              &quot;Delete on complete&quot;.
            </Text>
          </View>
        </>
      )}

      {task.completed && (
        <View style={styles.formGroup}>
          <Text variant="bodyMedium">
            This task is currently marked as completed.
          </Text>
          <Button
            mode="outlined"
            onPress={() => setTask({ ...task, completed: false })}
          >
            Mark as Incomplete
          </Button>
        </View>
      )}

      <View style={styles.btnRow}>
        <Button
          mode="contained"
          style={styles.btn}
          onPress={taskId ? handleUpdateTask : handleAddTask}
        >
          {taskId ? "Update Task" : "Add Task"}
        </Button>
      </View>
    </PageView>
  );
}
