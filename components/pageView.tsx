import { ReactNode } from "react";
import { ScrollView } from "react-native";
import { useTheme } from "react-native-paper";

export default function PageView({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        // alignItems: "center",
        padding: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      {children}
    </ScrollView>
  );
}
