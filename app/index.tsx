import PageView from "@/components/pageView";
import {
  getAllLists,
  getUnassignedTasks,
  ListDisplay,
  resetListTasks,
  Task,
  updateList,
  updateTask,
} from "@/lib/db";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { Divider, IconButton, List, Text } from "react-native-paper";
import useStyles from "../assets/styles";

export default function HomeScreen() {
  const styles = useStyles();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<ListDisplay[]>([]);
  const router = useRouter();

  const loadData = () => {
    const tasks = getUnassignedTasks();
    tasks.forEach((task) => {
      if (task.resetOnComplete) {
        const now = new Date();
        const resetAt = task.resetAt ? new Date(task.resetAt) : null;
        if (resetAt && now >= resetAt && task.completed) {
          task.completed = false;
          updateTask(task.id, { completed: false });
        }
      }
    });
    const sortedTasks = [...tasks].sort((a, b) =>
      a.completed === b.completed ? 0 : a.completed ? 1 : -1
    );
    setTasks(sortedTasks);

    const lists = getAllLists();
    lists.forEach((list) => {
      if (list.resetOnComplete) {
        const now = new Date();
        const resetAt = list.resetAt ? new Date(list.resetAt) : null;
        if (resetAt && now >= resetAt && list.completed) {
          // Reset all tasks in the list and the list itself
          resetListTasks(list.id);
          list.completed = false;
          updateList(list.id, {
            completed: false,
            resetOnComplete: false,
            resetAt: undefined,
          });
        }
      }
    });

    const sortedLists = [...lists].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
    setLists(sortedLists);
  };

  // Run loadData when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Complete a task
  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (!task.completed) {
      task.completed = true;
    } else {
      task.completed = false;
    }

    updateTask(taskId, { completed: task.completed });

    loadData();
  };

  return (
    <PageView>
      {/* Top Half: Unassigned Tasks */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.header}>
          Main Tasks
        </Text>
        <Text variant="labelSmall" style={{ marginBottom: 8 }}>
          Tasks not assigned to any list
        </Text>
        <ScrollView>
          {tasks.length === 0 && (
            <Text variant="bodyMedium" style={styles.empty}>
              No tasks yet
            </Text>
          )}
          {tasks.map((task) => (
            <List.Item
              key={task.id}
              title={task.title}
              titleStyle={task.completed ? styles.completed : undefined}
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
                  onPress={() => router.push(`./task/${task.id}`)}
                />
              )}
            />
          ))}
        </ScrollView>
      </View>

      <Divider />

      {/* Bottom Half: Lists */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.header}>
          Lists
        </Text>
        <Text variant="labelSmall" style={{ marginBottom: 8 }}>
          View and manage your lists
        </Text>
        <ScrollView>
          {lists.length === 0 && (
            <Text variant="bodyMedium" style={styles.empty}>
              No lists yet
            </Text>
          )}
          {lists.map((list) => (
            <List.Item
              key={list.id}
              title={list.title}
              titleStyle={list.completed ? styles.completed : undefined}
              description={`${list.completedTasks} / ${list.totalTasks} tasks complete`}
              onPress={() => router.push(`./list/${list.id}`)}
              left={() => <List.Icon icon="folder-outline" />}
            />
          ))}
        </ScrollView>
      </View>
    </PageView>
  );
}
