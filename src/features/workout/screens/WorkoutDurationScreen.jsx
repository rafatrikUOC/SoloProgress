import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ScreenTitle } from "../../../global/components/UIElements";
import { supabase } from "../../../global/services/supabaseService";
import { UserContext } from "../../../global/contexts/UserContext";
import { generateAndStorePlannedWorkouts } from "../services/plannedWorkoutService";

const MIN_DURATION = 15;
const MAX_DURATION = 120;
const STEP = 5;

export default function WorkoutDurationScreen({ navigation }) {
  const { colors } = useThemeContext();
  const { user, refreshUser, setUser } = useContext(UserContext);

  const [duration, setDuration] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Load initial workout duration from user settings
  useEffect(() => {
    setIsLoading(true);
    const appPrefs = user?.settings?.app_preferences;
    let prefs = appPrefs;
    if (typeof appPrefs === "string") {
      try {
        prefs = JSON.parse(appPrefs);
      } catch {
        prefs = {};
      }
    }
    if (prefs && typeof prefs.workout_duration === "number") {
      setDuration(prefs.workout_duration);
    } else {
      setDuration(MIN_DURATION);
    }
    setIsLoading(false);
  }, [user]);

  // Handle slider value change (not persisted yet)
  const handleValueChange = (value) => {
    setDuration(value);
  };

  // Save the new duration and regenerate planned workouts
  const handleSlidingComplete = async (value) => {
    setDuration(value);

    const prevAppPrefs = user?.settings?.app_preferences
      ? (typeof user.settings.app_preferences === "string"
          ? JSON.parse(user.settings.app_preferences)
          : user.settings.app_preferences)
      : {};

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

    setIsProcessing(true);
    setFeedback("Updating workouts...");

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

      await refreshUser();

      const updatedUser = typeof user === "function" ? user() : user;
      const split = updatedUser?.split || user?.split;
      const gymId = updatedUser?.settings?.performance_data?.active_gym || user?.settings?.performance_data?.active_gym;
      const userGoal = updatedUser?.settings?.fitness_goal || user?.settings?.fitness_goal || "Build muscle mass";

      if (split && gymId) {
        await generateAndStorePlannedWorkouts({
          userId: user.info.id,
          split,
          gymId,
          userGoal,
          workoutDuration: value
        });
        setFeedback("Workouts updated!");
      } else {
        setFeedback("Could not update workouts (missing split or gym).");
      }
    } catch (error) {
      setUser((prevUser) => ({
        ...prevUser,
        settings: {
          ...prevUser.settings,
          app_preferences: prevAppPrefs,
        },
      }));
      setDuration(prevAppPrefs.workout_duration || MIN_DURATION);
      setFeedback("Failed to update workouts.");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setFeedback("");
      }, 1200);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      padding: 24,
    },
    infoBox: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 14,
      marginBottom: 32,
      marginTop: 8,
      borderLeftWidth: 4,
      borderLeftColor: colors.bg.primary,
    },
    infoText: {
      color: colors.text.muted,
      fontSize: 15,
      textAlign: "left",
    },
    sliderContainer: {
      marginTop: 12,
      marginBottom: 56,
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
    feedback: {
      marginTop: 10,
      fontSize: 16,
      color: colors.text.primary,
      textAlign: "center",
    }
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

        {/* Info box about the effect of changing workout duration */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Changing this value will automatically regenerate your planned split workouts
            (as long as you have a split and an active gym selected).
          </Text>
        </View>

        <View style={styles.sliderContainer}>
          {/* Show loader while duration is loading or processing */}
          {isLoading || typeof duration !== "number" ? (
            <ActivityIndicator size="large" color={colors.bg.primary} />
          ) : (
            <>
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
                disabled={isProcessing}
              />
              <View style={styles.marksRow}>
                {marks.map((mark) => (
                  <Text key={mark} style={styles.mark}>
                    {mark}
                  </Text>
                ))}
              </View>
              {isProcessing && (
                <ActivityIndicator size="small" color={colors.bg.primary} style={{ marginTop: 40 }} />
              )}
              {feedback ? (
                <Text style={styles.feedback}>{feedback}</Text>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
