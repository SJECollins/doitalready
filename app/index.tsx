import { View, ScrollView, StyleSheet } from "react-native";
import { Text, List, IconButton, Divider } from "react-native-paper";
import { useState, useCallback } from "react";
import { getAllLists, getAllTasks, Task, TaskList } from "@/lib/db";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import PageView from "@/components/pageView";

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const router = useRouter();

  const loadData = () => {
    setTasks(getAllTasks().filter((t) => !t.list_id));
    setLists(getAllLists());
  };

  // Run loadData when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

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
              left={() => (
                <IconButton
                  icon={
                    task.completed
                      ? "check-circle"
                      : "checkbox-blank-circle-outline"
                  }
                  onPress={() => {
                    // TODO: toggle completed
                  }}
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
              onPress={() => router.push(`./${list.id}`)}
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
});
