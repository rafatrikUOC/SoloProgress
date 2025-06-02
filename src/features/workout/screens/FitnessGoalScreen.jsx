import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ScreenTitle } from "../../../global/components/UIElements";
import { FontAwesome5 } from "@expo/vector-icons";
import { supabase } from "../../../global/services/supabaseService";
import { UserContext } from "../../../global/contexts/UserContext";
import { generateAndStorePlannedWorkouts } from "../services/plannedWorkoutService";

const GOALS = [
  {
    label: "Lose fat",
    description: "Reduce body fat through strategic workouts that preserve lean muscle mass while increasing caloric output.",
    trainingFocus: "Moderate weights, high reps, circuit and interval training, cardio integration.",
  },
  {
    label: "Build muscle mass",
    description: "Increase muscle size through progressive overload and volume-based routines.",
    trainingFocus: "Hypertrophy sets (8–12 reps), controlled tempo, split routines.",
  },
  {
    label: "Improve strength",
    description: "Maximize your ability to lift heavier loads across core movement patterns.",
    trainingFocus: "Low reps (3–6), high loads, compound lifts, longer rest periods.",
  },
  {
    label: "Enhance endurance",
    description: "Improve muscular and cardiovascular endurance with high-rep sets and supersets.",
    trainingFocus: "High-rep sets, supersets, cardio-resistance integration, minimal rest periods.",
  },
  {
    label: "General fitness",
    description: "Support overall health with a balanced approach combining strength, mobility, and conditioning.",
    trainingFocus: "Full-body workouts, moderate reps, varied modalities (strength, mobility, conditioning).",
  },
];

export default function FitnessGoalScreen({ navigation }) {
  const { colors, typography } = useThemeContext();
  const { user, refreshUser, setUser } = useContext(UserContext);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [currentDescription, setCurrentDescription] = useState("");
  const [currentFocus, setCurrentFocus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (user?.settings?.fitness_goal) {
      setSelectedGoal(user.settings.fitness_goal);
    }
  }, [user]);

  // Optimistic update and also regenerate planned workouts if needed
  const handleSelect = async (goal) => {
    const prevSettings = { ...user.settings };
    setSelectedGoal(goal.label);
    setUser((prevUser) => ({
      ...prevUser,
      settings: {
        ...prevUser.settings,
        fitness_goal: goal.label,
      },
    }));

    setIsProcessing(true);
    setFeedback("Updating workouts...");

    try {
      await supabase
        .from("UserSettings")
        .update({ fitness_goal: goal.label })
        .eq("user_id", user.info.id);

      await refreshUser();

      // Get split and gymId from updated user context
      const updatedUser = typeof user === "function" ? user() : user;
      const split = updatedUser?.split || user?.split;
      const gymId = updatedUser?.settings?.performance_data?.active_gym || user?.settings?.performance_data?.active_gym;
      const workoutDuration =
        updatedUser?.settings?.app_preferences?.workout_duration ||
        user?.settings?.app_preferences?.workout_duration ||
        60;

      if (split && gymId) {
        await generateAndStorePlannedWorkouts({
          userId: user.info.id,
          split,
          gymId,
          userGoal: goal.label,
          workoutDuration,
        });
        setFeedback("Workouts updated!");
      } else {
        setFeedback("Could not update workouts (missing split or gym).");
      }
    } catch {
      setSelectedGoal(prevSettings.fitness_goal);
      setUser((prevUser) => ({
        ...prevUser,
        settings: prevSettings,
      }));
      setFeedback("Failed to update workouts.");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setFeedback("");
      }, 1200);
    }
  };

  const openInfo = (description, focus) => {
    setCurrentDescription(description);
    setCurrentFocus(focus);
    setInfoVisible(true);
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
    optionsContainer: {
      marginTop: 12,
      marginBottom: 32,
    },
    option: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.bg.secondary,
      borderRadius: 16,
      marginBottom: 16,
      elevation: 2,
    },
    optionSelected: {
      backgroundColor: colors.bg.primary,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    optionText: {
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContainer: {
      backgroundColor: colors.bg.secondary,
      borderRadius: 16,
      padding: 24,
      width: "100%",
      elevation: 4,
    },
    modalButton: {
      backgroundColor: colors.bg.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
    },
    feedback: {
      marginTop: 10,
      fontSize: 16,
      color: colors.text.primary,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenTitle title="Fitness goal" />

        {/* Info box about the effect of changing fitness goal */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Changing your fitness goal will automatically regenerate your planned split workouts
            (as long as you have a split and an active gym selected).
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.label}
              onPress={() => handleSelect(goal)}
              style={[
                styles.option,
                selectedGoal === goal.label && styles.optionSelected,
              ]}
              activeOpacity={0.9}
              disabled={isProcessing}
            >
              <View style={styles.optionRow}>
                <Text
                  style={[
                    typography.bodyMedium,
                    styles.optionText,
                    {
                      color:
                        selectedGoal === goal.label
                          ? colors.text.white
                          : colors.text.primary,
                    },
                  ]}
                >
                  {goal.label}
                </Text>
                <TouchableOpacity
                  onPress={() => openInfo(goal.description, goal.trainingFocus)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <FontAwesome5
                    name="info-circle"
                    size={22}
                    color={
                      selectedGoal === goal.label
                        ? colors.text.white
                        : colors.text.primary
                    }
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {isProcessing && (
          <ActivityIndicator size="small" color={colors.bg.primary} style={{ marginTop: 10 }} />
        )}
        {feedback ? (
          <Text style={styles.feedback}>{feedback}</Text>
        ) : null}
      </ScrollView>

      {/* Info Modal */}
      <Modal
        transparent
        visible={infoVisible}
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text
              style={[
                typography.bodyLarge,
                { marginBottom: 12, color: colors.text.primary },
              ]}
            >
              Goal description
            </Text>
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.text.white, marginBottom: 12 },
              ]}
            >
              {currentDescription}
            </Text>
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.text.white, marginBottom: 24 },
              ]}
            >
              <Text style={{ fontWeight: "bold" }}>Training focus:</Text>{" "}
              {currentFocus}
            </Text>
            <Pressable
              onPress={() => setInfoVisible(false)}
              style={styles.modalButton}
            >
              <Text style={[typography.bodyMedium, { color: colors.text.white }]}>
                Got it
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}