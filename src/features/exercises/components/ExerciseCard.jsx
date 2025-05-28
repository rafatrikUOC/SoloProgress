import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import MuscleIcon from "../../../global/components/MuscleIcon";

const DEFAULT_IMAGE = "https://via.placeholder.com/60?text=No+Image";

export const ExerciseCard = ({ exercise, onMenuPress, onPress }) => {
  const { colors } = useThemeContext();

  return (
    <TouchableOpacity
      style={[styles.exerciseCard, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Exercise image with muscle badge */}
      <View style={styles.exerciseImageWrapper}>
        <Image
          source={{
            uri:
              exercise.image && exercise.image.trim() !== ""
                ? exercise.image
                : DEFAULT_IMAGE,
          }}
          style={[styles.exerciseImage, { backgroundColor: colors.body }]}
          resizeMode="cover"
        />
        <View
          style={[
            styles.muscleBadge,
            { backgroundColor: colors.body, borderColor: colors.text.white },
          ]}
        >
          <MuscleIcon muscle={exercise.primary_muscle} size={18} />
        </View>
      </View>
      {/* Main exercise info */}
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, { color: colors.text.white }]}>
          {exercise.name}
        </Text>
        <Text style={[styles.exerciseDetails, { color: colors.text.muted }]}>
          {exercise.sets
            ? `${exercise.sets} sets - ${exercise.reps} reps`
            : exercise.category}
        </Text>
      </View>
      {/* Contextual menu button (optional) */}
      {onMenuPress && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={(e) => {
            e.stopPropagation(); // Prevents parent press
            onMenuPress(exercise);
          }}
        >
          <MaterialIcons name="more-vert" size={22} color={colors.text.white} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  muscleBadge: {
    position: "absolute",
    right: -8,
    bottom: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: "center",
  },
  exerciseName: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 13,
  },
  menuButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
