import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton } from "../../../global/components/UIElements";
import MuscleIcon from "../../../global/components/MuscleIcon";
import { fetchExerciseById } from "../services/exerciseService";

const TABS = [
  { key: "instructions", label: "Instructions" },
  { key: "target", label: "Target" },
  { key: "equipment", label: "Equipment" }
];

const DEFAULT_IMAGE = "https://via.placeholder.com/400x250?text=No+Image";

function parseJsonField(field) {
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback: treat as comma-separated string
      return field
        .split(",")
        .map(s => s.replace(/^\s*"?|"?\s*$/g, ""))
        .filter(Boolean);
    }
  }
  return [];
}

export default function ExerciseScreen({ navigation, route }) {
  const { exerciseId } = route.params;
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState("instructions");
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExercise() {
      setLoading(true);
      try {
        const data = await fetchExerciseById(exerciseId);
        setExercise(data);
      } catch (e) {
        setExercise(null);
      }
      setLoading(false);
    }
    loadExercise();
  }, [exerciseId]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
    },
    scroll: {
      paddingBottom: 32,
    },
    imageWrapper: {
      width: "100%",
      aspectRatio: 1.3,
      backgroundColor: "#222",
      position: "relative",
      marginBottom: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    exerciseImage: {
      width: "100%",
      height: "100%",
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    sectionLabel: {
      color: colors.text.muted,
      fontSize: 15,
      fontWeight: "600",
      marginLeft: 18,
      marginBottom: 2,
      marginTop: 8,
    },
    exerciseName: {
      color: colors.text.primary,
      fontSize: 24,
      fontWeight: "bold",
      marginLeft: 18,
      marginBottom: 16,
    },
    tabsRow: {
      flexDirection: "row",
      marginHorizontal: 12,
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: colors.card,
      overflow: "hidden",
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    tabText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.muted,
    },
    tabTextActive: {
      color: colors.text.primary,
    },
    tabActive: {
      backgroundColor: colors.cardActive,
    },
    instructionsList: {
      paddingHorizontal: 18,
    },
    instructionStep: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 14,
    },
    stepNumber: {
      color: colors.text.primary,
      fontWeight: "bold",
      fontSize: 16,
      marginRight: 10,
      marginTop: 1,
    },
    stepText: {
      color: colors.text.white,
      fontSize: 16,
      flex: 1,
    },
    targetSection: {
      paddingHorizontal: 18,
    },
    targetTitle: {
      color: colors.text.muted,
      fontWeight: "600",
      fontSize: 15,
      marginBottom: 6,
      marginTop: 10,
    },
    equipmentPill: {
      backgroundColor: colors.card,
      borderColor: colors.text.primary,
      borderWidth: 1,
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginRight: 10,
      marginBottom: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    equipmentPillText: {
      color: colors.text.primary,
      fontWeight: "bold",
      fontSize: 16,
    },
    muscleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      marginLeft: 4,
    },
    muscleNameLarge: {
      color: colors.text.white,
      fontSize: 18,
      fontWeight: "bold",
      marginLeft: 18,
    },
    equipmentSection: {
      paddingHorizontal: 18,
    },
    noEquipment: {
      color: colors.text.muted,
      fontSize: 16,
      marginTop: 12,
      marginLeft: 2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    noDataText: {
      color: colors.text.muted,
      fontSize: 18,
      textAlign: "center",
      marginTop: 60,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.text.primary} />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.noDataText}>Exercise not found.</Text>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
    );
  }

  // Parse instructions, secondary muscles, and equipment
  let instructions = [];
  if (Array.isArray(exercise.instructions)) {
    instructions = exercise.instructions;
  } else if (typeof exercise.instructions === "string") {
    try {
      const parsed = JSON.parse(exercise.instructions);
      if (Array.isArray(parsed)) {
        instructions = parsed;
      } else {
        instructions = exercise.instructions
          .split(",")
          .map(step => step.replace(/^\s*"?|"?\s*$/g, ""))
          .filter(Boolean);
      }
    } catch {
      instructions = exercise.instructions
        .split(",")
        .map(step => step.replace(/^\s*"?|"?\s*$/g, ""))
        .filter(Boolean);
    }
  }

  const secondaryMuscles = parseJsonField(exercise.secondary_muscles);
  const equipment = parseJsonField(exercise.equipment_required);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
      >
        {/* Image and Back */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: exercise.image || DEFAULT_IMAGE }}
            style={styles.exerciseImage}
            resizeMode="cover"
          />
          <BackButton light onPress={() => navigation.goBack()} />
        </View>

        <Text style={styles.sectionLabel}>Video & instructions</Text>
        <Text style={styles.exerciseName}>{exercise.name}</Text>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                selectedTab === tab.key && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        {selectedTab === "instructions" && (
          <View style={styles.instructionsList}>
            {instructions.length > 0 ? (
              instructions.map((step, idx) => (
                <View style={styles.instructionStep} key={idx}>
                  <Text style={styles.stepNumber}>{idx + 1}.</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No instructions available.</Text>
            )}
          </View>
        )}

        {selectedTab === "target" && (
          <View style={styles.targetSection}>
            <Text style={styles.targetTitle}>Primary muscle</Text>
            <View style={styles.muscleRow}>
              <MuscleIcon muscle={exercise.primary_muscle} size={40} />
              <Text style={styles.muscleNameLarge}>{exercise.primary_muscle}</Text>
            </View>

            <Text style={[styles.targetTitle, { marginTop: 18 }]}>Secondary muscles</Text>
            {secondaryMuscles.length === 0 ? (
              <Text style={styles.muscleNameLarge}>None</Text>
            ) : (
              secondaryMuscles.map((muscle, idx) => (
                <View style={styles.muscleRow} key={idx}>
                  <MuscleIcon muscle={muscle} size={40} />
                  <Text style={styles.muscleNameLarge}>{muscle}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {selectedTab === "equipment" && (
          <View style={styles.equipmentSection}>
            <Text style={styles.targetTitle}>Equipment required</Text>
            {equipment.length === 0 ? (
              <Text style={styles.noEquipment}>No equipment required</Text>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
                {equipment.map((item, idx) => (
                  <View style={styles.equipmentPill} key={idx}>
                    <Text style={styles.equipmentPillText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
