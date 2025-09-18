import { useMessage } from "@/app/_layout";
import { addList, getListById, TaskList, updateList } from "@/lib/db";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";
import useStyles from "../assets/styles";
import PageView from "./pageView";

const initialListState: Omit<TaskList, "id" | "tasks"> = {
  title: "",
  deleteOnComplete: false,
};

export default function ListForm({ listId }: { listId: string | null }) {
  const { triggerMessage } = useMessage();
  const router = useRouter();
  const styles = useStyles();

  const [list, setList] =
    useState<Omit<TaskList, "id" | "tasks">>(initialListState);

  const loadData = () => {
    try {
      if (listId) {
        const fetchedList = getListById(listId);
        if (fetchedList) {
          setList({
            title: fetchedList.title,
            deleteOnComplete: fetchedList.deleteOnComplete,
          });
        } else {
          triggerMessage("List not found", "error");
        }
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      triggerMessage(`Error loading list: ${errMsg}`, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleUpdateList = () => {
    try {
      if (listId) {
        if (!list.title.trim()) {
          triggerMessage("List title cannot be empty", "error");
          return;
        }
        updateList(listId, list.title, list.deleteOnComplete);
        triggerMessage("List updated successfully", "success");
      }
      router.back();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      triggerMessage(`Error saving list: ${errMsg}`, "error");
    }
  };

  const handleAddList = () => {
    try {
      if (!list.title.trim()) {
        triggerMessage("List title cannot be empty", "error");
        return;
      }
      addList(list.title, list.deleteOnComplete);
      triggerMessage("List added successfully", "success");
      router.back();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      triggerMessage(`Error adding list: ${errMsg}`, "error");
    }
  };

  return (
    <PageView>
      <Text variant="headlineLarge">{listId ? "Edit List" : "Add List"}</Text>
      <View style={styles.formGroup}>
        <Text variant="bodyMedium">List Title</Text>
        <TextInput
          label="List Title"
          mode="outlined"
          value={list.title}
          onChangeText={(text) => setList({ ...list, title: text })}
          placeholder="Enter list title"
        />
      </View>
      <View style={styles.formGroup}>
        <Text variant="bodyMedium">Delete list on completion</Text>
        <Text variant="bodySmall">
          If enabled, the list and its tasks will be deleted when all tasks are
          completed.
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Checkbox
            status={list.deleteOnComplete ? "checked" : "unchecked"}
            onPress={() =>
              setList({ ...list, deleteOnComplete: !list.deleteOnComplete })
            }
          />
          <Text>Delete on complete</Text>
        </View>
      </View>
      <View style={styles.btnRow}>
        <Button
          mode="contained"
          style={styles.btn}
          onPress={listId ? handleUpdateList : handleAddList}
        >
          {listId ? "Update List" : "Add List"}
        </Button>
      </View>
    </PageView>
  );
}
