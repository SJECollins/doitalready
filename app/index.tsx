import PageView from "@/components/pageView";
import {
  getAllLists,
  getUnassignedTasks,
  ListDisplay,
  Task,
  updateTask,
} from "@/lib/db";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Divider, IconButton, List, Text } from "react-native-paper";

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<ListDisplay[]>([]);
  const router = useRouter();

  const loadData = () => {
    const tasks = getUnassignedTasks();
    const sortedTasks = [...tasks].sort((a, b) =>
      a.completed === b.completed ? 0 : a.completed ? 1 : -1
    );
    setTasks(sortedTasks);
    const lists = getAllLists()
      .filter((l) => !l.completed)
      .map((list) => ({
        id: list.id,
        title: list.title,
        totalTasks: list.tasks?.length || 0,
        completedTasks: list.tasks?.filter((t) => t.completed).length || 0,
      }));
    setLists(lists);
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
          Tasks
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
              onPress={() => router.push(`./list/${list.id}`)}
              left={() => <List.Icon icon="folder-outline" />}
            />
          ))}
        </ScrollView>
      </View>
    </PageView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  section: {
    flex: 1, // half the screen each
    padding: 10,
  },
  header: {
    marginBottom: 8,
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.6,
  },
  completed: {
    textDecorationLine: "line-through",
  },
});
