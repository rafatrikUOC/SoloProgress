import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";

// Main screen for routines, displays a work-in-progress message and an import button
export default function RoutinesScreen() {
  const { colors } = useThemeContext();

  // Styles using theme colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      paddingTop: 32,
    },
    // Top-right import button
    importBtn: {
      position: "absolute",
      top: 36,
      right: 24,
      zIndex: 100,
      backgroundColor: colors.bg.primary,
      borderRadius: 18,
      paddingVertical: 8,
      paddingHorizontal: 18,
      elevation: 4,
    },
    importBtnText: {
      color: colors.text.white,
      fontWeight: "bold",
      fontSize: 15,
      letterSpacing: 0.5,
    },
    // Centered icon and text
    centerContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: 12,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: colors.text.muted,
      textAlign: "center",
      marginTop: 2,
      lineHeight: 22,
    },
  });

  // Placeholder for import logic
  const handleImportRoutine = () => {
    Alert.alert(
      "Coming soon",
      "Routine import (PDF/Excel) will be available in a future update."
    );
    // TODO: Implement file picker and import logic (accept only PDF/Excel)
  };

  return (
    <View style={styles.container}>
      {/* Top-right import button */}
      <TouchableOpacity style={styles.importBtn} onPress={handleImportRoutine}>
        <Text style={styles.importBtnText}>Import routine</Text>
      </TouchableOpacity>

      {/* Centered icon and work-in-progress message */}
      <View style={styles.centerContent}>
        <MaterialCommunityIcons
          name="progress-clock"
          size={82}
          color={colors.text.primary}
          style={{ marginBottom: 22 }}
        />
        <Text style={styles.title}>Work in progress</Text>
        <Text style={styles.subtitle}>
          This screen will soon allow you to manage and import your training routines.
        </Text>
      </View>
    </View>
  );
}
