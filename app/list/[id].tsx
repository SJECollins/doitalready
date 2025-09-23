import PageView from "@/components/pageView";
import {
  checkIfListComplete,
  deleteList,
  getListById,
  ListDisplay,
  Task,
  updateList,
  updateTask,
} from "@/lib/db";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  Button,
  Divider,
  IconButton,
  List,
  Modal,
  Text,
} from "react-native-paper";
import useStyles from "../../assets/styles";
import { useMessage } from "../_layout";

export default function ListScreen() {
  const styles = useStyles();
  const { triggerMessage } = useMessage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [list, setList] = useState<ListDisplay | null>(null);
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  const [modalVisible, setModalVisible] = useState(false);

  const loadData = () => {
    const fetchedList = getListById(id);
    if (!fetchedList) {
      triggerMessage("List not found", "error");
      return;
    }
    const tasks = fetchedList.tasks || [];
    setList(fetchedList);
    setIncompleteTasks(tasks.filter((task) => !task.completed));
    setCompletedTasks(tasks.filter((task) => task.completed));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  if (!list) {
    return <Text>Loading...</Text>;
  }

  const handleCompleteTask = (taskId: string) => {
    const task =
      incompleteTasks.find((t) => t.id === taskId) ||
      completedTasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!task.completed) {
      task.completed = true;
    } else {
      task.completed = false;
    }

    updateTask(taskId, { completed: task.completed });

    if (task.completed) {
      if (checkIfListComplete(list.id)) {
        list.completed = true;
        triggerMessage("All tasks completed! List complete.", "success");
        updateList(list.id, { completed: true });
        router.push("/");
      } else {
        list.completed = false;
        updateList(list.id, { completed: false });
        loadData();
      }
    } else {
      loadData();
    }
  };

  const handleDeleteList = (listId: string) => {
    deleteList(listId);
    triggerMessage("List deleted successfully", "success");
    router.back();
  };

  return (
    <PageView>
      <Text variant="headlineLarge" style={styles.header}>
        {list.title}
      </Text>
      {list.deleteOnComplete ? (
        <Text variant="bodyMedium">Set to delete on completion</Text>
      ) : list.resetOnComplete ? (
        <Text variant="bodyMedium">Set to reset on completion</Text>
      ) : null}
      {!list.completed ? (
        <Text variant="bodyMedium">
          {list.completedTasks}/{list.totalTasks} Tasks Completed
        </Text>
      ) : (
        <Text variant="bodyMedium">All tasks completed! 🎉</Text>
      )}

      <Divider style={styles.divider} />

      <View style={styles.row}>
        <Button
          mode="contained"
          onPress={() =>
            router.push({ pathname: "/list/edit", params: { listId: list.id } })
          }
        >
          Edit
        </Button>

        <Button mode="outlined" onPress={() => setModalVisible(true)}>
          Delete
        </Button>
      </View>
      <View style={styles.btnRow}>
        <Button
          mode="contained"
          onPress={() =>
            router.push({ pathname: "/task/add", params: { listId: list.id } })
          }
        >
          Add Task
        </Button>
      </View>
      <Divider style={styles.divider} />
      <Text variant="titleLarge">Incomplete Tasks</Text>
      <ScrollView>
        <Text>{incompleteTasks.length} Incomplete Tasks</Text>
        {incompleteTasks.map((task) => (
          <List.Item
            key={task.id}
            title={task.title}
            left={() => (
              <IconButton
                icon={
                  task.completed
                    ? "check-circle"
                    : "checkbox-blank-circle-outline"
                }
                onPress={() => handleCompleteTask(task.id)}
              />
            )}
            right={() => (
              <IconButton
                icon="pencil"
                onPress={() => router.push(`../task/${task.id}`)}
              />
            )}
          />
        ))}
      </ScrollView>
      <Divider style={styles.divider} />
      <Text variant="titleLarge">Completed Tasks</Text>
      <ScrollView>
        <Text>{completedTasks.length} Completed Tasks</Text>
        {completedTasks.map((task) => (
          <List.Item
            key={task.id}
            title={task.title}
            left={() => (
              <IconButton
                icon={
                  task.completed
                    ? "check-circle"
                    : "checkbox-blank-circle-outline"
                }
                onPress={() => handleCompleteTask(task.id)}
              />
            )}
            right={() => (
              <IconButton
                icon="pencil"
                onPress={() => router.push(`../task/${task.id}`)}
              />
            )}
          />
        ))}
      </ScrollView>
      <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
        <View style={styles.modalStyle}>
          <Text>
            Are you sure you want to delete this list? It will remove associated
            tasks.
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <Button onPress={() => handleDeleteList(list.id)}>Delete</Button>
            <Button onPress={() => setModalVisible(false)}>Cancel</Button>
          </View>
        </View>
      </Modal>
    </PageView>
  );
}
