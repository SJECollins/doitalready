import useStyles from "@/assets/styles";
import PageView from "@/components/pageView";
import {
  deleteTask,
  getListById,
  getTaskById,
  ListDisplay,
  Task,
  updateTask,
} from "@/lib/db";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Divider, Modal, Portal, Text } from "react-native-paper";
import { useMessage } from "../_layout";

export default function TaskScreen() {
  const styles = useStyles();
  const { triggerMessage } = useMessage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [list, setList] = useState<ListDisplay | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchedTask = getTaskById(id);
    setTask(fetchedTask);
    if (fetchedTask?.list_id) {
      const fetchedList = getListById(fetchedTask.list_id);
      setList(fetchedList);
    }
  }, [id]);

  if (!task) {
    return <Text>Loading...</Text>;
  }

  const handleDeleteTask = (taskId: string) => {
    try {
      deleteTask(taskId);
      setModalVisible(false);
      triggerMessage("Task deleted successfully", "success");
      router.push("/");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      triggerMessage(`Error deleting task: ${errMsg}`, "error");
    }
  };

  const handleToggleComplete = () => {
    try {
      setTask({ ...task, completed: !task.completed });
      updateTask(task.id, { completed: !task.completed });
      triggerMessage(
        `Task marked as ${!task.completed ? "complete" : "incomplete"}`,
        "success"
      );
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      triggerMessage(`Error updating task: ${errMsg}`, "error");
    }
  };

  console.log("Task complete?", task.completed);

  return (
    <PageView>
      <View style={styles.formGroup}>
        <Text variant="headlineLarge" style={styles.header}>
          {task.title}
        </Text>
        <Text variant="bodyMedium">
          Status: {task.completed ? "Completed" : "Incomplete"}
        </Text>
        {list ? (
          <View style={styles.formGroupRow}>
            <Text variant="bodyMedium">List: {list.title}</Text>
            <Button
              mode="text"
              onPress={() => {
                router.push({
                  pathname: "/list/[id]",
                  params: { id: list.id },
                });
              }}
            >
              View
            </Button>
          </View>
        ) : (
          <Text variant="bodyMedium">List: None</Text>
        )}
        {task.deleteOnComplete ? (
          <Text variant="bodyMedium">
            This task will be deleted upon completion.
          </Text>
        ) : task.resetOnComplete && task.resetInterval ? (
          <Text variant="bodyMedium">
            This task will reset to incomplete one {task.resetInterval} after it
            was completed.
          </Text>
        ) : null}
      </View>
      <Divider style={styles.divider} />
      <View style={styles.btnRow}>
        <Button
          mode="contained"
          style={styles.btn}
          onPress={handleToggleComplete}
        >
          {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
        </Button>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.row}>
        <Button
          mode="contained"
          style={styles.btn}
          onPress={() => {
            router.push({
              pathname: "/task/edit",
              params: { taskId: task.id },
            });
          }}
        >
          Edit
        </Button>
        <Button
          mode="contained"
          style={styles.btn}
          onPress={() => setModalVisible(true)}
        >
          Delete
        </Button>
      </View>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalStyle}
        >
          <Text>Are you sure you want to delete this task?</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <Button onPress={() => handleDeleteTask(task.id)}>Delete</Button>
            <Button onPress={() => setModalVisible(false)}>Cancel</Button>
          </View>
        </Modal>
      </Portal>
    </PageView>
  );
}
