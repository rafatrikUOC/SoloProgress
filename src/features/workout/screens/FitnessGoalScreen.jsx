import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ScreenTitle } from "../../../global/components/UIElements";
import { FontAwesome5 } from "@expo/vector-icons";
import { supabase } from "../../../global/services/supabaseService";
import { UserContext } from "../../../global/contexts/UserContext";

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

  useEffect(() => {
    if (user?.settings?.fitness_goal) {
      setSelectedGoal(user.settings.fitness_goal);
    }
  }, [user]);

  // Actualización optimista
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

    try {
      await supabase
        .from("UserSettings")
        .update({ fitness_goal: goal.label })
        .eq("user_id", user.info.id);
      refreshUser();
    } catch {
      // Revertir si falla
      setSelectedGoal(prevSettings.fitness_goal);
      setUser((prevUser) => ({
        ...prevUser,
        settings: prevSettings,
      }));
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
    optionsContainer: {
      marginTop: 36,
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
  });

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenTitle title="Fitness goal" />

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
