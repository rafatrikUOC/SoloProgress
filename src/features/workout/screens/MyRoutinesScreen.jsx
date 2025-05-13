import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ScreenTitle } from "../../../global/components/UIElements";
import { UserContext } from "../../../global/contexts/UserContext";

export default function MyRoutinesScreen({ navigation }) {
  const { colors, typography } = useThemeContext();
  const { user } = useContext(UserContext);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      padding: 24,
    },
    sectionTitle: {
      color: colors.text.white,
      fontWeight: "bold",
      marginBottom: 12,
      marginTop: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 18,
      minHeight: 120,
      marginBottom: 12,
      alignItems: "center",
      flexDirection: "column",
      position: "relative",
    },
    iconContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
    },
    cardContent: {
      alignItems: "center",
      width: "100%",
    },
    cardTitle: {
      color: colors.text.white,
      ...typography.primaryMd,
      fontWeight: "bold",
      marginBottom: 4,
      textAlign: "center",
    },
    cardSubtitle: {
      color: colors.text.muted,
      ...typography.primarySm,
      fontWeight: "500",
      textAlign: "center",
    },
  });

  // Show loading if user or split is not loaded yet
  if (!user || !user.split) {
    return (
      <View style={styles.container}>
        <ScreenTitle title="My routines" />
        <Text style={styles.cardSubtitle}>Loading routines...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenTitle title="My routines" />

        {/* Section 1: Active routine */}
        <Text style={styles.sectionTitle}>Active routine</Text>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("RoutineInfo", { split_id: user.split.id })}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="book-open" size={28} color={colors.text.muted} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {user.split.title || "No routine selected"}
            </Text>
            <Text style={styles.cardSubtitle}>
              {user.split.description ||
                "No description available for this routine."}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Section 2: Other routines */}
        <Text style={styles.sectionTitle}>Other routines</Text>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          // onPress={() => navigation.navigate("RoutineLibrary")}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="book-open" size={28} color={colors.text.muted} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Routine library</Text>
            <Text style={styles.cardSubtitle}>
              Use the best proven routines to optimize your results.
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
