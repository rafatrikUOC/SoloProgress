import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { ActionButton, BackButton, ScreenTitle } from "../../../global/components/UIElements";
import MuscleIcon from "../../../global/components/MuscleIcon";

const DEFAULT_IMAGE = "https://via.placeholder.com/60?text=No+Image";

const TARGET_MUSCLES = [
  { name: "Chest", recovery: 82 },
  { name: "Shoulders", recovery: 54 },
  { name: "Triceps", recovery: 34 },
];

const EXERCISES = [
  {
    name: "Push Up",
    muscle: "Chest",
    sets: 3,
    reps: "8/6",
    image: "",
  },
  {
    name: "Incline Dumbbell Fly",
    muscle: "Chest",
    sets: 3,
    reps: "10/8",
    image: "",
  },
  {
    name: "Shoulder Press",
    muscle: "Shoulders",
    sets: 3,
    reps: "8/6",
    image: "",
  },
  {
    name: "Triceps Dips",
    muscle: "Triceps",
    sets: 3,
    reps: "12/10",
    image: "",
  },
  {
    name: "Chest Press",
    muscle: "Chest",
    sets: 3,
    reps: "8/6",
    image: "",
  },
];

function getRecoveryColor(percent) {
  if (percent >= 80) return "#27ae60";
  if (percent >= 50) return "#f1c40f";
  if (percent >= 20) return "#e67e22";
  return "#e74c3c";
}

const MENU_OPTIONS = [
  { label: "Replace", icon: "swap-horiz" },
  { label: "Change reps progression", icon: "trending-up" },
  { label: "Add to superset", icon: "add-circle-outline" },
  { label: "Add dropset", icon: "add-circle-outline" },
  { label: "Video & instructions", icon: "play-circle-outline" },
  { label: "Exercise history", icon: "history" },
  { label: "Notes", icon: "sticky-note-2" },
  { label: "Replaced and don't recommend", icon: "swap-horiz", danger: true },
  { label: "Remove from workout", icon: "delete-outline", danger: true },
  { label: "Remove and don't recommend", icon: "block", danger: true },
];


export default function NextWorkoutScreen({ navigation }) {
  const { colors } = useThemeContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      padding: 24,
    },
    sectionTitle: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 16,
      marginBottom: 12,
    },
    targetMusclesSlider: {
      flexDirection: "row",
      marginBottom: 12,
    },
    muscleCard: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 8,
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 14,
      minWidth: 148,
    },
    muscleIconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: colors.text.white,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.body,
      overflow: "hidden",
      marginRight: 12,
    },
    muscleTextWrapper: {
      flex: 1,
      justifyContent: "center",
    },
    muscleName: {
      color: colors.text.white,
      fontWeight: "bold",
      fontSize: 15,
      marginBottom: 2,
    },
    muscleRecoveryPill: {
      alignSelf: "flex-start",
      marginTop: 2,
      paddingVertical: 2,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: colors.card,
      borderWidth: 1.5,
    },
    muscleRecoveryText: {
      color: colors.text.white,
      fontSize: 12,
      fontWeight: "bold",
    },
    exercisesCount: {
      color: colors.text.white,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
    },
    exerciseCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      minHeight: 80,
    },
    exerciseImageWrapper: {
      position: "relative",
      marginRight: 14,
    },
    exerciseImage: {
      width: 60,
      height: 60,
      borderRadius: 10,
      backgroundColor: colors.body,
    },
    muscleBadge: {
      position: "absolute",
      right: -8,
      bottom: -8,
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.text.white,
      backgroundColor: colors.body,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    exerciseInfo: {
      flex: 1,
      justifyContent: "center",
    },
    exerciseName: {
      color: colors.text.white,
      fontWeight: "bold",
      fontSize: 15,
      marginBottom: 2,
    },
    exerciseDetails: {
      color: colors.text.muted,
      fontSize: 13,
    },
    menuButton: {
      marginLeft: 12,
      padding: 8,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "flex-end",
    },
    menuModal: {
      backgroundColor: colors.card,
      padding: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    menuOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.body,
    },
    menuOptionText: {
      color: colors.text.white,
      fontSize: 16,
      marginLeft: 12,
    },
    menuCancel: {
      marginTop: 12,
      alignItems: "center",
    },
    menuCancelText: {
      color: colors.text.muted,
      fontSize: 16,
      fontWeight: "bold",
    },
    scrollContent: {
      paddingBottom: 110, // Espacio extra para que el último ejercicio no quede tapado por el botón
    },
    actionButtonWrapper: {
      position: "absolute",
      left: 24,
      right: 24,
      bottom: 24,
      zIndex: 10,
    },
  });

  const handleMenuOpen = (exercise) => {
    setSelectedExercise(exercise);
    setMenuVisible(true);
  };

  const handleMenuClose = () => {
    setMenuVisible(false);
    setSelectedExercise(null);
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenTitle title="Next workout" />

        {/* Target muscles */}
        <Text style={styles.sectionTitle}>Target muscles</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.targetMusclesSlider}
        >
          {TARGET_MUSCLES.map((muscle, idx) => (
            <View style={styles.muscleCard} key={idx}>
              <View style={styles.muscleIconWrapper}>
                <MuscleIcon muscle={muscle.name} size={36} zoom={1.1} />
              </View>
              <View style={styles.muscleTextWrapper}>
                <Text style={styles.muscleName}>{muscle.name}</Text>
                <View
                  style={[
                    styles.muscleRecoveryPill,
                    { borderColor: getRecoveryColor(muscle.recovery) },
                  ]}
                >
                  <Text style={styles.muscleRecoveryText}>
                    {muscle.recovery}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Número de ejercicios */}
        <Text style={styles.exercisesCount}>{EXERCISES.length} exercises</Text>

        {/* Lista de ejercicios */}
        {EXERCISES.map((ex, idx) => (
          <View style={styles.exerciseCard} key={idx}>
            <TouchableOpacity
              style={styles.exerciseImageWrapper}
              onPress={() => navigation.navigate("Exercise", { exerciseId: 1 })} 
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri: ex.image && ex.image.trim() !== "" ? ex.image : DEFAULT_IMAGE,
                }}
                style={styles.exerciseImage}
                resizeMode="cover"
              />
              <View style={styles.muscleBadge}>
                <MuscleIcon muscle={ex.muscle} size={18} />
              </View>
            </TouchableOpacity>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseDetails}>
                {ex.sets} sets - {ex.reps} reps
              </Text>
            </View>
            <TouchableOpacity style={styles.menuButton} onPress={() => handleMenuOpen(ex)}>
              <MaterialIcons name="more-vert" size={22} color={colors.text.white} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Dummy contextual menu modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={handleMenuClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleMenuClose}>
          <View style={styles.menuModal}>
            {MENU_OPTIONS.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.menuOption}
                onPress={() => {
                  // Acción real aquí si lo deseas
                  handleMenuClose();
                }}
              >
                {/* Icono solo en la opción Replace */}
                {option.icon && (
                  <MaterialIcons name={option.icon} size={22} color={option.danger ? colors.text.danger : colors.text.white} />
                )}
                <Text
                  style={[
                    styles.menuOptionText,
                    option.danger && { color: colors.text.danger },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Botón Start workout fijo abajo */}
      <View style={styles.actionButtonWrapper}>
        <ActionButton
          text="Start workout"
        //onPress={() => navigation.navigate("StartedWorkout")}
        />
      </View>
    </View>
  );
}
