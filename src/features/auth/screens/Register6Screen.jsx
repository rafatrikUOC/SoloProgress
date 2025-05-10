import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ActionButton, HeaderBlock } from "../../../global/components/UIElements";
import { FontAwesome5 } from "@expo/vector-icons";
import { saveData, getData } from "../../../global/utils/storage";

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

export default function Register6({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [currentDescription, setCurrentDescription] = useState("");
  const [currentFocus, setCurrentFocus] = useState("");

  useEffect(() => {
    const loadGoal = async () => {
      const registrationData = await getData("registrationData");
      if (registrationData && registrationData.goal) {
        setSelectedGoal(registrationData.goal);
      }
    };
    loadGoal();
  }, []);

  const handleSelect = (goal) => {
    setSelectedGoal(goal.label);
    saveGoalsData(goal);
  };

  const openInfo = (description, focus) => {
    setCurrentDescription(description);
    setCurrentFocus(focus);
    setInfoVisible(true);
  };

  const saveGoalsData = async (goal) => {
    const prev = await getData("registrationData");
    const finalData = {
      ...prev,
      goal: goal.label,
    };
    await saveData("registrationData", finalData);
  };

  const handleContinue = () => {
    navigation.navigate("Register7");
  };

  return (
    <View style={styles(colors).container}>
      <BackButton onPress={() => navigation.goBack()} />

      <HeaderBlock
        title="What is your goal?"
        subtitle="Define your fitness destination and let's create a roadmap."
      />

      <View style={styles(colors).optionsContainer}>
        {GOALS.map((goal) => (
          <TouchableOpacity
            key={goal.label}
            onPress={() => handleSelect(goal)}
            style={[
              styles(colors).option,
              selectedGoal === goal.label && styles(colors).optionSelected,
            ]}
            activeOpacity={0.9}
          >
            <View style={styles(colors).optionRow}>
              <Text
                style={[
                  typography.bodyMedium,
                  {
                    color:
                      selectedGoal === goal.label
                        ? colors.text.white
                        : colors.text.primary,
                    flex: 1,
                  },
                ]}
              >
                {goal.label}
              </Text>
              <TouchableOpacity onPress={() => openInfo(goal.description, goal.trainingFocus)}>
                <FontAwesome5
                  name="info-circle"
                  size={24}
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

      <ActionButton
        text="Continue"
        onPress={handleContinue}
        disabled={!selectedGoal}
      />

      {/* Info Modal */}
      <Modal
        transparent
        visible={infoVisible}
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={styles(colors).modalOverlay}>
          <View style={styles(colors).modalContainer}>
            <Text style={[typography.bodyLarge, { marginBottom: 12, color: colors.text.primary }]}>
              Goal description
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.text.white, marginBottom: 12 }]}>
              {currentDescription}
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.text.white, marginBottom: 24 }]}>
              <Text style={{ fontWeight: 'bold' }}>Training focus:</Text> {currentFocus}
            </Text>
            <Pressable
              onPress={() => setInfoVisible(false)}
              style={styles(colors).modalButton}
            >
              <Text style={[typography.bodyMedium, { color: colors.text.white }]}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      paddingHorizontal: 24,
      paddingTop: 64,
    },
    optionsContainer: {
      marginTop: 40,
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
