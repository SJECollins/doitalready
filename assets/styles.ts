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
      justifyContent: "center",
      marginTop: 20,
    },
    btn: {
      width: "auto",
      marginVertical: 10,
    },
    col: {
      flexDirection: "column",
      gap: 10,
      marginVertical: 10,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
    },
    divider: {
      marginVertical: 10,
    },
  });
};

export default useStyles;
