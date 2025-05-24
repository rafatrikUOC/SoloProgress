import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ScreenTitle } from "../../../global/components/UIElements";
import { supabase } from "../../../global/services/supabaseService";
import { UserContext } from "../../../global/contexts/UserContext";

const MIN_DURATION = 15;
const MAX_DURATION = 120;
const STEP = 5;

export default function WorkoutDurationScreen({ navigation }) {
  const { colors, typography } = useThemeContext();
  const { user, refreshUser, setUser } = useContext(UserContext);
  const [duration, setDuration] = useState(MIN_DURATION);

  // Obtener el valor inicial desde app_preferences
  useEffect(() => {
    const appPrefs = user?.settings?.app_preferences;
    let prefs = appPrefs;
    if (typeof appPrefs === "string") {
      try {
        prefs = JSON.parse(appPrefs);
      } catch {
        prefs = {};
      }
    }
    if (prefs && prefs.workout_duration) {
      setDuration(prefs.workout_duration);
    }
  }, [user]);

  const handleValueChange = (value) => {
    setDuration(value);
  };

  // Actualización optimista en app_preferences
  const handleSlidingComplete = async (value) => {
    setDuration(value);

    // Obtener las preferencias actuales
    const prevAppPrefs = user?.settings?.app_preferences
      ? (typeof user.settings.app_preferences === "string"
          ? JSON.parse(user.settings.app_preferences)
          : user.settings.app_preferences)
      : {};

    // Actualizar localmente en el contexto
    setUser((prevUser) => ({
      ...prevUser,
      settings: {
        ...prevUser.settings,
        app_preferences: {
          ...prevAppPrefs,
          workout_duration: value,
        },
      },
    }));

    // Guardar en Supabase
    try {
      await supabase
        .from("UserSettings")
        .update({
          app_preferences: {
            ...prevAppPrefs,
            workout_duration: value,
          },
        })
        .eq("user_id", user.info.id);
      refreshUser();
    } catch (error) {
      // Si falla, revertir el cambio local
      setUser((prevUser) => ({
        ...prevUser,
        settings: {
          ...prevUser.settings,
          app_preferences: prevAppPrefs,
        },
      }));
      setDuration(prevAppPrefs.workout_duration || MIN_DURATION);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      padding: 24,
    },
    sliderContainer: {
      marginTop: 48,
      marginBottom: 32,
      alignItems: "center",
    },
    durationValue: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: 16,
    },
    durationLabel: {
      fontSize: 18,
      color: colors.text.muted,
      marginBottom: 24,
    },
    marksRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 12,
    },
    mark: {
      fontSize: 12,
      color: colors.text.muted,
    },
  });

  // Generate marks for slider
  const marks = Array.from(
    { length: Math.floor((MAX_DURATION - Math.ceil(MIN_DURATION / 15) * 15) / 15) + 1 },
    (_, idx) => Math.ceil(MIN_DURATION / 15) * 15 + idx * 15
  );

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenTitle title="Workout duration" />
        <View style={styles.sliderContainer}>
          <Text style={styles.durationValue}>{duration} min</Text>
          <Text style={styles.durationLabel}>Select your preferred workout duration</Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={MIN_DURATION}
            maximumValue={MAX_DURATION}
            step={STEP}
            value={duration}
            minimumTrackTintColor={colors.bg.primary}
            maximumTrackTintColor={colors.bg.secondary}
            thumbTintColor={colors.bg.primary}
            onValueChange={handleValueChange}
            onSlidingComplete={handleSlidingComplete}
          />
          <View style={styles.marksRow}>
            {marks.map((mark) => (
              <Text key={mark} style={styles.mark}>
                {mark}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
