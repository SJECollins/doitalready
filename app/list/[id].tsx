import { useState, useCallback } from "react";
import { View, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  useTheme,
  List,
  IconButton,
  Modal,
} from "react-native-paper";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  addTask,
  updateTask,
  getListById,
  getTasksForList,
  updateList,
  deleteList,
  Task,
  TaskList,
} from "@/lib/db";
import PageView from "@/components/pageView";
import { useMessage } from "../_layout";

export default function ListScreen() {
  const theme = useTheme();
  const { triggerMessage } = useMessage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [list, setList] = useState<TaskList | null>(null);
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [showIncomplete, setShowIncomplete] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [changed, setChanged] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = () => {
    const fetchedList = getListById(id);
    if (!fetchedList) {
      triggerMessage("List not found", "error");
      return;
    }
    const tasks = getTasksForList(id);
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

  const handleUpdateList = (listId: string) => {
    if (list) {
      updateList(list.id, list.title);
    }
    triggerMessage("List updated successfully", "success");
    router.back();
  };

  const toggleShowIncomplete = () => {
    setShowIncomplete((prev) => !prev);
    if (showCompleted) setShowCompleted(false);
  };

  const toggleShowCompleted = () => {
    setShowCompleted((prev) => !prev);
    if (showIncomplete) setShowIncomplete(false);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") {
      triggerMessage("Task title cannot be empty", "error");
      return;
    }
    if (newTaskTitle.trim()) addTask(newTaskTitle, list.id);
    setNewTaskTitle("");
    triggerMessage("Task added successfully", "success");
    loadData();
  };

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
    loadData();
  };

  const handleDeleteList = (listId: string) => {
    deleteList(listId);
    triggerMessage("List deleted successfully", "success");
    router.back();
  };

  return (
    <PageView>
      <Text variant="titleLarge">{list.title}</Text>
      <TextInput
        value={list.title}
        onChangeText={(text) => {
          setList({ ...list, title: text });
          setChanged(true);
        }}
      />
      <Text variant="bodyMedium">
        {list.completed ? "Completed" : "Incomplete"}
      </Text>
      {changed && (
        <Button
          mode="contained"
          style={{ marginTop: 10 }}
          buttonColor={theme.colors.primary}
          onPress={() => handleUpdateList(list.id)}
        >
          Save Changes
        </Button>
      )}
      <Text variant="titleLarge">Add Task</Text>
      <TextInput
        label="Task Title"
        value={newTaskTitle}
        onChangeText={setNewTaskTitle}
      />
      <Button
        mode="contained"
        style={{ marginTop: 10 }}
        buttonColor={theme.colors.primary}
        onPress={handleAddTask}
      >
        Add Task
      </Button>
      <Text variant="titleLarge" onPress={toggleShowIncomplete}>
        Incomplete Tasks
      </Text>
      {showIncomplete && (
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
      )}
      <Text variant="titleLarge" onPress={toggleShowCompleted}>
        Completed Tasks
      </Text>
      {showCompleted && (
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
      )}
      <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
        <Text>
          Are you sure you want to delete this list? It will remove associated
          tasks.
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <Button onPress={() => handleDeleteList(list.id)}>Delete</Button>
          <Button onPress={() => setModalVisible(false)}>Cancel</Button>
        </View>
      </Modal>
    </PageView>
  );
}
