import { useMessage } from "@/app/_layout";
import {
  addList,
  getListById,
  NewList,
  resetListTasks,
  updateList,
} from "@/lib/db";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";
import useStyles from "../assets/styles";
import PageView from "./pageView";

export default function ListForm({ listId }: { listId: string | null }) {
  const { triggerMessage } = useMessage();
  const router = useRouter();
  const styles = useStyles();

  const [resetSchedulerVisible, setResetSchedulerVisible] = useState(false);
  const [list, setList] = useState<NewList>({
    title: "",
    deleteOnComplete: false,
    resetOnComplete: false,
    resetInterval: null,
    resetAt: undefined,
    completed: false,
  });

  const loadData = () => {
    try {
      if (listId) {
        const fetchedList = getListById(listId);
        if (fetchedList) {
          setList({
            title: fetchedList.title,
            deleteOnComplete: fetchedList.deleteOnComplete ?? false,
            resetOnComplete: fetchedList.resetOnComplete ?? false,
            resetInterval: fetchedList.resetInterval ?? null,
            resetAt: fetchedList.resetAt ?? undefined,
            completed: fetchedList.completed ?? false,
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
        updateList(listId, {
          title: list.title,
          deleteOnComplete: list.deleteOnComplete,
          resetOnComplete: list.resetOnComplete,
          resetInterval: list.resetInterval,
          resetAt: list.resetAt,
          completed: list.completed,
        });
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
      addList(
        list.title,
        list.deleteOnComplete,
        list.resetOnComplete,
        list.resetInterval
      );
      triggerMessage("List added successfully", "success");
      router.back();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      triggerMessage(`Error adding list: ${errMsg}`, "error");
    }
  };

  const handleResetSchedulerToggle = () => {
    setList({ ...list, resetOnComplete: !list.resetOnComplete });
    if (list.resetOnComplete && !list.resetInterval) {
      setList({ ...list, resetInterval: "hour" });
    }
    if (!list.resetOnComplete && list.deleteOnComplete) {
      setList({ ...list, deleteOnComplete: false });
      triggerMessage(
        "Reset on Complete is not compatible with Delete on Complete, disabling Delete on Complete",
        "info"
      );
    }
    setResetSchedulerVisible(!resetSchedulerVisible);
  };

  const handleMarkAsIncomplete = () => {
    if (!listId) {
      triggerMessage("No list ID provided for reset", "error");
      return;
    }
    setList({ ...list, completed: false });
    resetListTasks(listId);
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Checkbox
            status={list.deleteOnComplete ? "checked" : "unchecked"}
            onPress={() =>
              setList({ ...list, deleteOnComplete: !list.deleteOnComplete })
            }
          />
          <Text>Delete on complete</Text>
        </View>
        <Text variant="labelSmall">
          If enabled, the list and its tasks will be deleted when all tasks are
          completed. Not compatible with &quot;Reset on Complete&quot;.
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text variant="bodyMedium">Reset list on completion</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Checkbox
            status={list.resetOnComplete ? "checked" : "unchecked"}
            onPress={handleResetSchedulerToggle}
          />
          <Text>Reset on complete</Text>
        </View>

        {resetSchedulerVisible && (
          <Picker
            mode="dropdown"
            style={styles.pickerStyle}
            selectedValue={list.resetInterval || "hour"}
            onValueChange={(itemValue) =>
              setList({ ...list, resetInterval: itemValue })
            }
          >
            <Picker.Item
              label="Hour"
              value="hour"
              style={styles.pickerItemStyle}
            />
            <Picker.Item
              label="Day"
              value="day"
              style={styles.pickerItemStyle}
            />
            <Picker.Item
              label="Week"
              value="week"
              style={styles.pickerItemStyle}
            />
            <Picker.Item
              label="Month"
              value="month"
              style={styles.pickerItemStyle}
            />
            <Picker.Item
              label="Year"
              value="year"
              style={styles.pickerItemStyle}
            />
          </Picker>
        )}
        <Text variant="labelSmall">
          If enabled, the list and its tasks will be reset to incomplete when
          marked complete. You can specify an interval (default 1 hour) Is not
          compatible with &quot;Delete on Complete&quot;.
        </Text>
      </View>

      {list.completed && (
        <View style={styles.formGroup}>
          <Text variant="bodyMedium">
            This list is currently marked as completed. Reset list and all
            tasks?
          </Text>
          <Button mode="outlined" onPress={handleMarkAsIncomplete}>
            Mark as Incomplete
          </Button>
        </View>
      )}

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
