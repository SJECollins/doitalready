import ListForm from "@/components/listForm";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native-paper";

export default function EditListPage() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  if (!listId) {
    return <Text>List ID is required</Text>;
  }
  return <ListForm listId={listId} />;
}
