import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

function formatSeconds(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function MiniTimer({
  initialSeconds,
  onClose,
  resetSignal // <-- Nuevo prop para resetear desde fuera
}) {
  const { colors } = useThemeContext();
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true
    }).start();
  }, []);

  // Reset timer when resetSignal changes
  useEffect(() => {
    setSeconds(initialSeconds);
    setRunning(true);
  }, [resetSignal, initialSeconds]);

  // Timer countdown logic
  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      setTimeout(onClose, 350);
      return;
    }
    const interval = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds, running, onClose]);

  const addTime = (delta) => {
    setSeconds(s => Math.max(0, Math.min(3600, s + delta)));
  };

  const handleClose = () => {
    setRunning(false);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => onClose && onClose());
  };

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 6,
      width: SCREEN_WIDTH,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: colors.border || colors.text.primary,
      paddingVertical: 4,
      paddingHorizontal: 6,
      elevation: 4,
      zIndex: 1000,
      shadowColor: "#000",
      shadowOpacity: 0.09,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      minHeight: 38,
      height: 38,
    },
    restLabel: {
      color: colors.text.primary,
      fontWeight: "bold",
      fontSize: 15,
      marginLeft: 8,
      minWidth: 36,
      textAlign: "left",
    },
    centerBlock: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    sideGroup: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 2,
    },
    sideText: {
      color: colors.text.primary + "99",
      fontSize: 14,
      fontWeight: "bold",
      marginRight: 2,
      marginLeft: 2,
      paddingHorizontal: 2,
    },
    sideBtn: {
      paddingHorizontal: 0,
      marginHorizontal: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    timeText: {
      color: colors.text.white,
      fontWeight: "bold",
      fontSize: 23,
      textAlign: "center",
      letterSpacing: 1.1,
      minWidth: 70,
      marginHorizontal: 8,
    },
    stopBtn: {
      marginLeft: 8,
      marginRight: 8,
      justifyContent: "center",
      alignItems: "center",
      padding: 2,
    },
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Rest label */}
      <Text style={styles.restLabel}>REST</Text>
      {/* Center block: -15s, timer, +15s */}
      <View style={styles.centerBlock}>
        {/* -15s group */}
        <TouchableOpacity style={styles.sideGroup} onPress={() => addTime(-15)}>
          <Text style={styles.sideText}>-15s</Text>
          <MaterialIcons name="remove-circle-outline" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.timeText}>{formatSeconds(seconds)}</Text>
        {/* +15s group */}
        <TouchableOpacity style={styles.sideGroup} onPress={() => addTime(15)}>
          <MaterialIcons name="add-circle-outline" size={22} color={colors.text.primary} />
          <Text style={styles.sideText}>+15s</Text>
        </TouchableOpacity>
      </View>
      {/* Stop button */}
      <TouchableOpacity style={styles.stopBtn} onPress={handleClose}>
        <MaterialIcons name="stop-circle" size={26} color={colors.text.primary} />
      </TouchableOpacity>
    </Animated.View>
  );
}
