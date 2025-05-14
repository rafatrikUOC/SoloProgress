import React, { useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { UserContext } from "../../../global/contexts/UserContext"; 

const SLIDER_IMAGES = Array(6).fill({ uri: "" });
const DEFAULT_IMAGE = "https://via.placeholder.com/60?text=No+Image";

const EXERCISES = [
  "Push up",
  "Incline dumbbell fly",
  "Shoulder press",
  "Triceps dips",
  "Chest press",
  "Overhead triceps extension",
];

// Workout recovery
const getRecoveryColor = (value, colors) => {
  if (value >= 80) return "#27ae60"; // Green
  if (value >= 50) return "#f1c40f"; // Yellow
  if (value >= 20) return "#e67e22"; // Orange
  return "#e74c3c";                  // Red
};

export default function HomeScreen({ navigation }) {
  const { colors } = useThemeContext();
  const { user } = useContext(UserContext);
  const recoveryValue = 82;

  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: colors.body,
    },
    container: {
      padding: 24,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    greeting: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 4,
      color: colors.text.primary,
    },
    subGreeting: {
      fontSize: 16,
      color: colors.text.white,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginVertical: 16,
      color: colors.text.primary,
    },
    cardsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
      gap: 16,
    },
    cardHorizontal: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 20,
      paddingHorizontal: 14,
      minHeight: 90,
      marginRight: 8,
    },
    cardIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.text.white + "33",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    cardText: {
      color: colors.text.white,
      fontWeight: "600",
      fontSize: 16,
      flexShrink: 1,
      flexWrap: "wrap",
    },
    recoveryCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.text.white + "33",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      borderWidth: 2,
    },
    recoveryNumber: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text.white,
    },
    recoveryLabel: {
      color: colors.text.white,
      fontWeight: "600",
      fontSize: 16,
      flexShrink: 1,
      flexWrap: "wrap",
    },
    nextWorkoutCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 24,
      overflow: "hidden",
      padding: 20,
    },
    nextWorkoutHeaderPill: {
      alignSelf: "flex-start",
      backgroundColor: colors.text.primary,
      paddingLeft: 20,
      paddingRight: 40,
      paddingVertical: 6,
      marginBottom: 14,
      margin: -20,
      borderBottomRightRadius: 12,
    },
    nextWorkoutHeaderText: {
      color: colors.text.white,
      fontSize: 16,
      fontWeight: "bold",
    },
    nextWorkoutMuscles: {
      fontSize: 15,
      color: colors.text.white,
      fontWeight: "600",
      marginBottom: 4,
    },
    nextWorkoutDetails: {
      fontSize: 13,
      color: colors.text.muted,
      marginBottom: 14,
    },
    sliderContainer: {
      width: '100%',
      minHeight: 60,
      marginBottom: 14,
    },
    sliderImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 10,
      backgroundColor: "#ccc",
    },
    exerciseList: {
      marginBottom: 16,
    },
    exerciseText: {
      fontSize: 15,
      color: colors.text.muted,
    },
    actionIconsRow: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 24,
      marginTop: 4,
    },
    actionIcon: {
      padding: 8,
    },
    customButtonsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    customButton: {
      alignItems: "center",
      flex: 1,
      marginHorizontal: 8,
      height: 100,
      backgroundColor: colors.card,
      borderRadius: 12,
      justifyContent: "center",
      padding: 16,
    },
    customIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
      backgroundColor: colors.text.white + "33",
      overflow: "hidden",
    },
    customButtonText: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.white,
    },
    trendsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    trendBox: {
      width: "48%",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    iconCircle_workout: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      backgroundColor: colors.semantics.workout + "33",
    },
    iconCircle_volume: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      backgroundColor: colors.semantics.volume + "33",
    },
    iconCircle_calories: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      backgroundColor: colors.semantics.calories + "33",
    },
    iconCircle_sets: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      backgroundColor: colors.semantics.sets + "33",
    },
    iconCircle_distance: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      backgroundColor: colors.semantics.distance + "33",
    },
    trendTitle_workout: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
      color: colors.semantics.workout,
    },
    trendTitle_volume: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
      color: colors.semantics.volume,
    },
    trendTitle_calories: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
      color: colors.semantics.calories,
    },
    trendTitle_sets: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
      color: colors.semantics.sets,
    },
    trendTitle_distance: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
      color: colors.semantics.distance,
    },
    trendValue: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.text.white,
    },
  });

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hi, {user.info.username}
            </Text>
            <Text style={styles.subGreeting}>
              It's time to challenge your limits.
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("FitnessPlan")}>
            <FontAwesome5 name="sliders-h" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Next Workout Card */}
        <View style={styles.nextWorkoutCard}>
          <View style={styles.nextWorkoutHeaderPill}>
            <Text style={styles.nextWorkoutHeaderText}>
              Next workout - Push
            </Text>
          </View>
          <Text style={styles.nextWorkoutMuscles}>
            Chest, Shoulders, Triceps
          </Text>
          <Text style={styles.nextWorkoutDetails}>
            56 min · 6 exercises
          </Text>

          {/* Slider de imágenes pequeñas */}
          <View style={styles.sliderContainer}>
            <FlatList
              data={SLIDER_IMAGES}
              keyExtractor={(_, i) => i.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {/* acción imagen */ }}>
                  <Image
                    source={{ uri: item.uri ? item.uri : DEFAULT_IMAGE }}
                    style={styles.sliderImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Ejercicios en línea */}
          <View style={styles.exerciseList}>
            <Text style={styles.exerciseText}>
              {EXERCISES.join(", ")}
            </Text>
          </View>

          {/* Iconos de acción */}
          <View style={styles.actionIconsRow}>
            <TouchableOpacity style={styles.actionIcon} onPress={() => navigation.navigate("NextWorkout")} >
              <FontAwesome5 name="play" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <FontAwesome5 name="redo" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <FontAwesome5 name="share-alt" size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cards Row */}
        <View style={styles.cardsRow}>
          {/* Upcoming Workouts Card */}
          <TouchableOpacity style={styles.cardHorizontal} onPress={() => {/* acción upcoming */ }}>
            <View style={styles.cardIconCircle}>
              <FontAwesome5
                name="calendar-alt"
                size={26}
                color={colors.text.white}
              />
            </View>
            <Text style={styles.cardText}>Upcoming workouts</Text>
          </TouchableOpacity>

          {/* Recovery Card */}
          <TouchableOpacity
            style={[styles.cardHorizontal, { marginRight: 0 }]}
            onPress={() => {/* acción recovery */ }}
          >
            <View
              style={[
                styles.recoveryCircle,
                { borderColor: getRecoveryColor(recoveryValue, colors) },
              ]}
            >
              <Text style={styles.recoveryNumber}>{recoveryValue}</Text>
            </View>
            <Text style={styles.recoveryLabel}>Workout recovery</Text>
          </TouchableOpacity>
        </View>

        {/* Custom workout */}
        <Text style={styles.sectionTitle}>
          Feeling like something different?
        </Text>
        <View style={styles.customButtonsRow}>
          {[
            { icon: "star", label: "Saved" },
            { icon: "running", label: "Cardio" },
            { icon: "play-circle", label: "Empty" },
          ].map(({ icon, label }, index) => (
            <TouchableOpacity
              key={index}
              style={styles.customButton}
            >
              <View style={styles.customIconCircle}>
                <FontAwesome5
                  name={icon}
                  size={22}
                  color={colors.text.white}
                />
              </View>
              <Text style={styles.customButtonText}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Trends */}
        <Text style={styles.sectionTitle}>
          Weekly Trends
        </Text>
        <View style={styles.trendsContainer}>
          {[
            { icon: "dumbbell", label: "Workouts", value: "4", color: "workout" },
            { icon: "weight", label: "Volume", value: "7.3k kg", color: "volume" },
            { icon: "fire", label: "Calories", value: "2,300", color: "calories" },
            { icon: "list-ol", label: "Sets", value: "34", color: "sets" },
            { icon: "route", label: "Distance", value: "5.6 km", color: "distance" },
          ].map(({ icon, label, value, color }, index) => (
            <TouchableOpacity
              key={index}
              style={styles.trendBox}
              onPress={() => {/* acción trend */ }}
            >
              <View style={styles[`iconCircle_${color}`]}>
                <FontAwesome5
                  name={icon}
                  size={18}
                  color={colors.semantics[color]}
                />
              </View>
              <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
                <Text style={styles[`trendTitle_${color}`]}>
                  {label}
                </Text>
                <Text style={styles.trendValue}>{value}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
