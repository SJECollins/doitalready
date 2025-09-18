import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

const useStyles = () => {
  const theme = useTheme();
  return StyleSheet.create({
    formGroup: {
      marginVertical: 10,
      flexDirection: "column",
      gap: 6,
    },
    btnRow: {
      flexDirection: "row",
      marginTop: 20,
    },
    btn: {
      width: "auto",
    },
  });
};

export default useStyles;
