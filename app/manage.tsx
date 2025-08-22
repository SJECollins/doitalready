import { useState } from "react";
import { ScrollView, View } from "react-native";
import { TextInput, Button, Switch, Text } from "react-native-paper";
import { addList, addTask } from "@/lib/db";
import { useAppTheme, useMessage } from "./_layout";
import PageView from "@/components/pageView";

export default function ManageScreen() {
  const [taskTitle, setTaskTitle] = useState("");
  const [listTitle, setListTitle] = useState("");
  const { darkMode, toggleTheme } = useAppTheme();
  const { triggerMessage } = useMessage();

  const handleAddTask = () => {
    if (taskTitle.trim() === "") {
      triggerMessage("Task title cannot be empty", "error");
      return;
    }
    if (taskTitle.trim()) addTask(taskTitle);
    setTaskTitle("");
    triggerMessage("Task added successfully", "success");
  };

  return (
    <PageView>
      <ScrollView style={{ flex: 1, padding: 10 }}>
        <Text variant="titleLarge">Add Task</Text>
        <TextInput
          label="Task Title"
          value={taskTitle}
          onChangeText={setTaskTitle}
        />
        <Button
          mode="contained"
          onPress={handleAddTask}
          style={{ marginTop: 10 }}
        >
          Add Task
        </Button>

        <Text variant="titleLarge" style={{ marginTop: 20 }}>
          Add List
        </Text>
        <TextInput
          label="List Title"
          value={listTitle}
          onChangeText={setListTitle}
        />
        <Button
          mode="contained"
          onPress={() => {
            if (listTitle.trim()) addList(listTitle);
            setListTitle("");
          }}
          style={{ marginTop: 10 }}
        >
          Add List
        </Button>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 40,
          }}
        >
          <Text variant="titleLarge">Dark Mode</Text>
          <Switch value={darkMode} onValueChange={toggleTheme} />
        </View>
      </ScrollView>
    </PageView>
  );
}
