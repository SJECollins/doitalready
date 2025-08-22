import { useState, useEffect } from "react";
import { Text, TextInput, Button, useTheme, Modal } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import {
  getTaskById,
  updateTask,
  deleteTask,
  getListById,
  Task,
  TaskList,
} from "@/lib/db";
import PageView from "@/components/pageView";
import { useMessage } from "../_layout";
import { View } from "react-native";

export default function TaskScreen() {
  const theme = useTheme();
  const { triggerMessage } = useMessage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [list, setList] = useState<TaskList | null>(null);
  const [changed, setChanged] = useState(false);
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

  const handleUpdateTask = (taskId: string) => {
    if (task) {
      updateTask(task.id, {
        title: task.title,
        list_id: task.list_id,
      });
    }
    triggerMessage("Task updated successfully", "success");
    router.back();
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    triggerMessage("Task deleted successfully", "success");
    router.back();
  };

  const removeFromList = () => {
    if (!task || !list) return;
    setList({
      ...list,
      tasks: list.tasks?.filter((t) => t.id !== task.id) ?? [],
    });
    setTask({ ...task, list_id: undefined });
    setChanged(true);
  };

  return (
    <PageView>
      <Text variant="titleLarge">Task Title:</Text>
      <TextInput
        value={task.title}
        onChangeText={(text) => {
          setTask({ ...task, title: text });
          setChanged(true);
        }}
      />
      <Text variant="bodyMedium">
        {task.completed ? "Completed" : "Incomplete"}
      </Text>
      {list && (
        <>
          <Text
            variant="bodyMedium"
            style={{ marginTop: 10 }}
            onPress={() => {
              if (list) {
                router.push(`../list/${list.id}`);
              }
            }}
          >
            Part of List: {list.title}
          </Text>
          <Button mode="contained" onPress={removeFromList}>
            Remove from List
          </Button>
        </>
      )}
      {changed && (
        <Button
          mode="contained"
          style={{ marginTop: 10 }}
          buttonColor={theme.colors.primary}
          onPress={() => handleUpdateTask(task.id)}
        >
          Save Changes
        </Button>
      )}
      <Button
        mode="contained"
        style={{ marginTop: 10 }}
        buttonColor={theme.colors.primary}
        onPress={() => setModalVisible(true)}
      >
        Delete Task
      </Button>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        style={{
          padding: 20,
          position: "absolute",
          top: "10%",
          left: "10%",
          right: "10%",
        }}
      >
        <Text>Are you sure you want to delete this task?</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <Button onPress={() => handleDeleteTask(task.id)}>Delete</Button>
          <Button onPress={() => setModalVisible(false)}>Cancel</Button>
        </View>
      </Modal>
    </PageView>
  );
}
