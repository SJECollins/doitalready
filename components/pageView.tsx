import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function PageView({
  children,
  scrollable,
}: {
  children: ReactNode;
  scrollable?: boolean;
}) {
  const theme = useTheme();
  const Container = scrollable ? ScrollView : View;

  return (
    <Container
      style={{
        flexGrow: 1,
        // alignItems: "center",
        padding: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      {children}
    </Container>
  );
}
