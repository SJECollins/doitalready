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
    container: {
      flex: 1,
      flexDirection: "column",
    },
    section: {
      flex: 1,
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
    completed: {
      textDecorationLine: "line-through",
    },
    pickerStyle: {
      backgroundColor: theme.colors.background,
      color: theme.colors.primary,
    },
    pickerItemStyle: {
      color: theme.colors.primary,
      backgroundColor: theme.colors.background,
    },
    modalStyle: {
      backgroundColor: theme.colors.background,
      padding: 20,
      margin: 20,
      borderRadius: 8,
      shadowColor: "#000",
      alignItems: "center",
      justifyContent: "center",
    },
  });
};

export default useStyles;
