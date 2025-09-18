import PageView from "@/components/pageView";
import { resetDatabase } from "@/lib/db";
import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { Button, Divider, Switch, Text } from "react-native-paper";
import useStyles from "../assets/styles";
import { useAppTheme, useMessage } from "./_layout";

export default function ManageScreen() {
  const router = useRouter();
  const styles = useStyles();
  const { darkMode, toggleTheme } = useAppTheme();
  const { triggerMessage } = useMessage();

  return (
    <PageView>
      <ScrollView style={{ flex: 1, padding: 10 }}>
        <View style={styles.col}>
          <Text variant="titleLarge">Add a Task</Text>
          <View style={styles.btnRow}>
            <Button
              mode="contained"
              onPress={() => router.push("./task/add")}
              style={styles.btn}
            >
              Add Task
            </Button>
          </View>
          <Text variant="titleLarge">Add a List</Text>
          <View style={styles.btnRow}>
            <Button
              mode="contained"
              onPress={() => router.push("./list/add")}
              style={styles.btn}
            >
              Add List
            </Button>
          </View>
        </View>

        <Divider style={styles.divider} />
        <View style={styles.btnRow}>
          <Button mode="contained" onPress={resetDatabase} style={styles.btn}>
            Reset Database
          </Button>
        </View>

        <Divider style={styles.divider} />

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
