import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { UserContext } from "../../../global/contexts/UserContext";
import { supabase } from "../../../global/services/supabaseService";

// Helper to format seconds as mm:ss
function formatSeconds(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Helper function to get default rest time
export const getDefaultRestTime = (user, exercise) => {
  const prefs = user?.settings?.app_preferences;
  if (exercise?.type === "compound")
    return prefs?.rest_time?.compound || 120;
  return prefs?.rest_time?.isolation || 90;
};

// Helper function to get actual rest time (custom or default)
export const getRestTime = (user, exercise) => {
  const customTime = user?.settings?.app_preferences?.custom_timers?.[exercise?.id];
  return (customTime !== undefined && customTime !== null)
    ? customTime
    : getDefaultRestTime(user, exercise);
};

export const CustomTimerModal = ({ visible, exercise, onClose }) => {
  const { colors } = useThemeContext();
  const { user, refreshUser } = useContext(UserContext);

  // Get current custom or default time (in seconds)
  const defaultTime = getDefaultRestTime(user, exercise);
  const currentCustomTime = user?.settings?.app_preferences?.custom_timers?.[exercise?.id];
  const initialTime = currentCustomTime ?? defaultTime;

  const [customTime, setCustomTime] = useState(initialTime);

  useEffect(() => {
    setCustomTime(currentCustomTime ?? defaultTime);
  }, [exercise?.id, visible]);

  // Increment/decrement logic
  const changeTime = (delta) => {
    setCustomTime((prev) => {
      let next = Math.max(15, prev + delta);
      if (next > 3600) next = 3600; // 1 hour max
      return next;
    });
  };

  // Save custom time to DB
  const handleSave = async () => {
    const newSettings = {
      ...user.settings,
      app_preferences: {
        ...user.settings.app_preferences,
        custom_timers: {
          ...user.settings.app_preferences?.custom_timers,
          [exercise.id]: customTime
        }
      }
    };
    await supabase
      .from("UserSettings")
      .update({ app_preferences: newSettings.app_preferences })
      .eq("user_id", user.info.id);
    refreshUser();
    onClose();
  };

  // Reset timer to default (removes custom)
  const handleReset = async () => {
    const timers = { ...(user.settings.app_preferences?.custom_timers || {}) };
    delete timers[exercise.id];
    const newSettings = {
      ...user.settings,
      app_preferences: {
        ...user.settings.app_preferences,
        custom_timers: timers
      }
    };
    await supabase
      .from("UserSettings")
      .update({ app_preferences: newSettings.app_preferences })
      .eq("user_id", user.info.id);
    refreshUser();
    onClose();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.card,
      paddingVertical: 28,
      paddingHorizontal: 20,
      borderRadius: 18,
      width: "85%",
      alignItems: "center",
    },
    title: {
      color: colors.text.primary,
      fontSize: 19,
      fontWeight: "bold",
      marginBottom: 18,
      textAlign: "center",
      letterSpacing: 0.5,
    },
    timerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 10,
    },
    timerButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.text.secondary,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 14,
    },
    timerValue: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.text.white,
      letterSpacing: 1.2,
      minWidth: 80,
      textAlign: "center",
    },
    resetBtn: {
      marginTop: 14,
      alignSelf: "center",
      padding: 5,
      borderRadius: 8,
      backgroundColor: "transparent",
    },
    resetText: {
      color: colors.text.muted,
      fontSize: 15,
      textAlign: "center",
      textDecorationLine: "underline",
    },
    saveBtn: {
      marginTop: 22,
      alignSelf: "center",
      width: "75%",
    },
    saveButton: {
      backgroundColor: colors.text.primary,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 24,
      alignItems: "center",
      marginTop: 18,
    },
    saveButtonText: {
      color: colors.body,
      fontWeight: "bold",
      fontSize: 16,
      letterSpacing: 0.5,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
          <Text style={styles.title}>Exercise timer</Text>
          <View style={styles.timerRow}>
            <TouchableOpacity style={styles.timerButton} onPress={() => changeTime(-15)}>
              <MaterialIcons name="remove" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.timerValue}>{formatSeconds(customTime)}</Text>
            <TouchableOpacity style={styles.timerButton} onPress={() => changeTime(15)}>
              <MaterialIcons name="add" size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>
              Reset to default timer ({formatSeconds(defaultTime)})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
