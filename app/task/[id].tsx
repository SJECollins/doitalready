import useStyles from "@/assets/styles";
import PageView from "@/components/pageView";
import {
  deleteTask,
  getListById,
  getTaskById,
  ListDisplay,
  Task,
} from "@/lib/db";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Modal, Portal, Text } from "react-native-paper";
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

  console.log("task.title:", task?.title, typeof task?.title);
  console.log("list.title:", list?.title, typeof list?.title);
  console.log(
    "task.resetInterval:",
    task?.resetInterval,
    typeof task?.resetInterval
  );

  return (
    <PageView>
      <Text variant="headlineLarge">{task.title}</Text>
      <Text variant="bodyMedium">
        Status: {task.completed ? "Completed" : "Incomplete"}
      </Text>
      {list ? (
        <View style={styles.row}>
          <Text variant="bodyMedium">List: {list.title}</Text>
          <Button
            mode="text"
            onPress={() => {
              router.push({ pathname: "/list/[id]", params: { id: list.id } });
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
          This task will reset to incomplete after one {task.resetInterval}.
        </Text>
      ) : null}
      <View style={styles.row}>
        <Button
          mode="contained"
          style={styles.btn}
          onPress={() => {
            router.push({ pathname: "/task/edit", params: { id: task.id } });
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
