import React, { useState, useContext, useCallback, useEffect, useMemo } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
  Modal, Pressable, ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { UserContext } from "../../../global/contexts/UserContext";
import { ActionButton, BackButton, ScreenTitle } from "../../../global/components/UIElements";
import MuscleIcon from "../../../global/components/MuscleIcon";
import { capitalizeFirstLetter } from "../../../global/components/Normalize";
import useTrainingSession from "../hooks/useTrainingSession";
import { useFocusEffect } from "@react-navigation/native";
import { fetchExercises } from "../../exercises/services/exerciseService";
import { useExerciseActions } from "../hooks/useExerciseActions";
import { saveData } from "../../../global/utils/storage";
import { supabase } from "../../../global/services/supabaseService";



const DEFAULT_IMAGE = "https://via.placeholder.com/60?text=No+Image";

function getMuscleRecovery(muscle, recoveryMap = {}) { return 100; }
function getRecoveryColor(percent) {
  if (percent >= 80) return "#27ae60";
  if (percent >= 50) return "#f1c40f";
  if (percent >= 20) return "#e67e22";
  return "#e74c3c";
}

const MENU_OPTIONS = [
  { key: "replace", label: "Replace", icon: "swap-horiz" },
  { key: "video", label: "Video & instructions", icon: "play-circle-outline" },
  { key: "notes", label: "Notes", icon: "sticky-note-2" },
  { key: "replace_exclude", label: "Replaced and don't recommend", icon: "swap-horiz", danger: true },
  { key: "remove", label: "Remove from workout", icon: "delete-outline", danger: true },
  { key: "remove_exclude", label: "Remove and don't recommend", icon: "block", danger: true },
];

export default function NextWorkoutScreen({ navigation, route }) {
  const { colors } = useThemeContext();
  const { user } = useContext(UserContext);
  const workout = route.params?.workout;
  const mainMuscles = workout?.details?.main_muscles || [];
  const recoveryMap = {};

  // UI state
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [allExercises, setAllExercises] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  // Hook: session creation, cleanup, and exercises/series
  const {
    trainingSessionId,
    trainingExercises,
    loading: loadingSession,
    refetch,
  } = useTrainingSession({
    user,
    workout,
    refreshFlag,
  });

  // Exercise actions hook
  const userId = user?.info?.id;
  const {
    excludeExercise,
    replaceExerciseFull,
    removeExerciseFull,
    addExerciseFull,
  } = useExerciseActions({ userId, user });

  // Fetch all exercises with full info for enrichment
  useEffect(() => {
    let mounted = true;
    async function fetchAll() {
      let excluded = user?.settings?.performance_data?.excluded_exercises || [];
      const data = await fetchExercises(excluded);
      if (mounted) {
        setAllExercises(data || []);
      }
    }
    fetchAll();
    return () => { mounted = false; };
  }, [user?.settings?.performance_data?.excluded_exercises]);

  // Refetch session data when coming back to this screen
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Wait until both trainingExercises and allExercises are loaded
  const isReady =
    !loadingSession &&
    Array.isArray(trainingExercises) &&
    trainingExercises.length > 0 &&
    Array.isArray(allExercises) &&
    allExercises.length > 0;

  // Enrich exercises with full info (muscles, etc.) only when ready
  const exercises = useMemo(() => {
    if (!isReady) return [];
    return trainingExercises
      .filter(te => te && te.exercise_id)
      .map(te => {
        const full = allExercises.find(e => e.id === te.exercise_id);
        return { ...full, id: te.exercise_id };
      });
  }, [isReady, trainingExercises, allExercises]);

  // Only count exercises with effective sets (not warm-up)
  const exercisesWithEffectiveSets = useMemo(() => {
    if (!isReady) return [];
    return exercises.filter(ex => {
      const trainingEx = trainingExercises.find(te => te.exercise_id === ex.id);
      return trainingEx && trainingEx.series && trainingEx.series.some(s => !s.is_warmup);
    });
  }, [isReady, exercises, trainingExercises]);

  // Handle navigation to workout exercise details
  const handleExerciseInfoPress = (ex) => {
    const trainingEx = trainingExercises.find(te => te.exercise_id === ex.id);
    navigation.navigate("WorkoutExercise", {
      trainingSessionId,
      trainingExerciseId: trainingEx?.id,
      exerciseId: ex.id,
    });
  };

  // Handle navigation to exercise general info
  const handleExerciseImagePress = (ex) => {
    navigation.navigate("Exercise", { exerciseId: ex.id });
  };

  // Handle contextual menu actions
  const handleMenuOption = async (option, ex) => {
    setMenuVisible(false);
    setSelectedExercise(null);

    const trainingEx = trainingExercises.find(te => te.exercise_id === ex.id);

    try {
      setActionLoading(true);

      switch (option.key) {
        case "replace":
          navigation.navigate("ReplaceExercise", {
            exerciseId: ex.id,
            trainingSessionId,
            workoutId: workout?.id,
            dontRecommend: false,
            primaryMuscle: ex.primary_muscle,
            secondaryMuscles: ex.secondary_muscles || [],
            workoutExercises: exercises
          });
          break;
        case "video":
          navigation.navigate("Exercise", { exerciseId: ex.id });
          break;
        case "notes":
          navigation.navigate("ExerciseNotes", {
            exerciseId: ex.id,
            trainingExerciseId: trainingEx?.id,
          });
          break;
        case "replace_exclude":
          // Exclude and then navigate to ReplaceExercise
          await excludeExercise(ex.id);
          navigation.navigate("ReplaceExercise", {
            exerciseId: ex.id,
            trainingSessionId,
            workoutId: workout?.id,
            dontRecommend: false,
            primaryMuscle: ex.primary_muscle,
            secondaryMuscles: ex.secondary_muscles || [],
            workoutExercises: exercises
          });
          break;
        case "remove":
          // Remove from both UserPlannedWorkouts and TrainingSession
          await removeExerciseFull({
            plannedWorkoutId: workout?.id,
            trainingSessionId,
            exerciseId: ex.id,
          });
          await refetch();
          break;
        case "remove_exclude":
          // Exclude and remove
          await excludeExercise(ex.id);
          await removeExerciseFull({
            plannedWorkoutId: workout?.id,
            trainingSessionId,
            exerciseId: ex.id,
          });
          await refetch();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error("[NextWorkoutScreen] Error in menu action:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle workout start
  const handleStartWorkout = async () => {
    // Prevent double triggering
    if (starting) return;
    setStarting(true);
    try {
      // 1. Save the start time in the database
      const now = new Date();
      await supabase
        .from("TrainingSessions")
        .update({ start_time: now.toISOString() })
        .eq("id", trainingSessionId);

      // 2. Navigate to the active workout screen (adjust the screen name if needed)
      navigation.replace("ActiveWorkout", {
        workout,
        trainingSessionId,
      });
    } catch (e) {
      // Log any errors and optionally show an alert
      console.error("Error starting workout:", e);
    }
    setStarting(false);
  };



  // Styles
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
      paddingVertical: 4,
      paddingHorizontal: 2,
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
      paddingBottom: 110,
    },
    actionButtonWrapper: {
      position: "absolute",
      left: 24,
      right: 24,
      bottom: 0,
      zIndex: 10,
    },
    actionLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.body + "CC",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 100,
    },
    actionLoadingText: {
      color: colors.text.primary,
      fontSize: 18,
      marginTop: 12,
    },
    addSetRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 10,
      gap: 12,
      position: "relative",
    },
    addSetIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.bg.secondary,
      justifyContent: "center",
      alignItems: "center",
    },
    addSetText: {
      color: colors.text.primary,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

  // Show loading spinner while session and series are being created or data is not ready
  if (!isReady) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.text.primary} />
        <Text style={{ color: colors.text.primary, marginTop: 16 }}>Preparing your workout...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />

      {/* Action loading overlay */}
      {actionLoading && (
        <View style={styles.actionLoadingOverlay}>
          <ActivityIndicator size="large" color={colors.text.primary} />
          <Text style={styles.actionLoadingText}>Applying action...</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenTitle title={workout?.title || "Next workout"} />
        {/* Target muscles summary */}
        <Text style={styles.sectionTitle}>Target muscles</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.targetMusclesSlider}
        >
          {mainMuscles.map((muscle, idx) => {
            const recovery = getMuscleRecovery(muscle, recoveryMap);
            return (
              <View style={styles.muscleCard} key={idx}>
                <View style={styles.muscleIconWrapper}>
                  <MuscleIcon muscle={muscle} size={36} zoom={1.1} />
                </View>
                <View style={styles.muscleTextWrapper}>
                  <Text style={styles.muscleName}>{capitalizeFirstLetter(muscle)}</Text>
                  <View
                    style={[
                      styles.muscleRecoveryPill,
                      { borderColor: getRecoveryColor(recovery) },
                    ]}
                  >
                    <Text style={styles.muscleRecoveryText}>
                      {recovery}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Exercise count */}
        <Text style={styles.exercisesCount}>{exercisesWithEffectiveSets.length} exercises</Text>

        {/* Exercise list with sets x reps summary */}
        {exercises.map((ex, idx) => {
          // Find the corresponding TrainingExercise with series
          const trainingEx = trainingExercises.find(te => te.exercise_id === ex.id);

          // Only render if series are available
          if (!trainingEx || !trainingEx.series || trainingEx.series.length === 0) return null;

          // Only count effective sets (not warm-up)
          const effectiveSeries = trainingEx.series.filter(s => !s.is_warmup);
          const seriesCount = effectiveSeries.length;
          const repsSet = [...new Set(effectiveSeries.map(s => s.reps))];
          const repsText = repsSet.length === 1
            ? `${repsSet[0]} reps`
            : `${Math.min(...repsSet)}-${Math.max(...repsSet)} reps`;

          return (
            <View style={styles.exerciseCard} key={idx}>
              {/* Exercise image */}
              <TouchableOpacity
                style={styles.exerciseImageWrapper}
                onPress={() => handleExerciseImagePress(ex)}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: Array.isArray(ex.photos) && ex.photos.length > 0
                      ? ex.photos[0]
                      : DEFAULT_IMAGE,
                  }}
                  style={styles.exerciseImage}
                  resizeMode="cover"
                />
                <View style={styles.muscleBadge}>
                  <MuscleIcon muscle={ex.primary_muscle || ex.muscle} size={18} />
                </View>
              </TouchableOpacity>
              {/* Exercise info with sets x reps summary */}
              <TouchableOpacity
                style={styles.exerciseInfo}
                onPress={() => handleExerciseInfoPress(ex)}
                activeOpacity={0.7}
              >
                <Text style={styles.exerciseName}>{capitalizeFirstLetter(ex.name)}</Text>
                <Text style={styles.exerciseDetails}>
                  {seriesCount} x {repsText}
                </Text>
              </TouchableOpacity>
              {/* Menu button */}
              <TouchableOpacity style={styles.menuButton} onPress={() => {
                setSelectedExercise(ex);
                setMenuVisible(true);
              }}>
                <MaterialIcons name="more-vert" size={22} color={colors.text.white} />
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.addSetRow}>
          <TouchableOpacity
            style={styles.addSetIconWrapper}
            onPress={() => navigation.navigate("AddExercise", {
              trainingSessionId,
              workoutId: workout?.id,
              workoutExercises: exercises,
            })}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddExercise", {
              trainingSessionId,
              workoutId: workout?.id,
              workoutExercises: exercises
            })}
            activeOpacity={0.7}
          >
            <Text style={styles.addSetText}>Add exercise</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Contextual menu modal for exercise actions */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setMenuVisible(false);
          setSelectedExercise(null);
        }}
      >
        <Pressable style={styles.modalOverlay} onPress={() => {
          setMenuVisible(false);
          setSelectedExercise(null);
        }}>
          <View style={styles.menuModal}>
            {MENU_OPTIONS.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.menuOption}
                onPress={() => {
                  if (selectedExercise) handleMenuOption(option, selectedExercise);
                }}
              >
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

      {/* Fixed "Start workout" button at the bottom */}
      <View style={styles.actionButtonWrapper}>
        <ActionButton
          text={starting ? "Starting..." : "Start workout"}
          onPress={handleStartWorkout}
          disabled={starting}
        />
      </View>
    </View>
  );
}
