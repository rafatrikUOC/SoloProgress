import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { UserContext } from "../../../global/contexts/UserContext";
import { getData, clearData } from "../../../global/utils/storage";
import { capitalizeFirstLetter, joinAndCapitalize } from "../../../global/components/Normalize";
import ToastMessage from "../../../global/components/ToastMessage";
import { supabase } from "../../../global/services/supabaseService";
import useNextWorkout from '../hooks/useNextWorkout';
import useSkipSession from '../hooks/useSkipSession';
import { shareWorkout } from "../../../global/utils/share";

const DEFAULT_IMAGE = "https://placehold.co/400";

const getRecoveryColor = (value, colors) => {
  if (value >= 80) return colors.text.success;
  if (value >= 50) return colors.text.warning;
  if (value >= 20) return colors.text.info;
  return colors.text.danger;
};

// Fetch gym details utility
async function fetchGymDetailsById(gym_id) {
  const { data, error: fetchError } = await supabase
    .from("Gyms")
    .select("*")
    .eq("id", gym_id)
    .single();

  if (fetchError || !data) {
    return {
      id: gym_id,
      name: "Unknown",
      location: "",
      equipmentCount: 0,
    };
  }

  let equipmentCount = 0;
  if (Array.isArray(data.equipment)) {
    equipmentCount = data.equipment.length;
  } else if (typeof data.equipment === "string") {
    try {
      const parsed = JSON.parse(data.equipment);
      if (Array.isArray(parsed)) {
        equipmentCount = parsed.length;
      }
    } catch (e) {
      equipmentCount = 0;
    }
  }

  return {
    id: gym_id,
    name: data.name,
    location: data.location || "",
    equipmentCount,
  };
}

export default function HomeScreen({ navigation }) {
  const { colors, typography } = useThemeContext();
  const { user, refreshUser } = useContext(UserContext);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  // Check if there is an unfinished TrainingSession for the user
  useEffect(() => {
    async function fetchActiveSession() {
      if (!user?.info?.id) return;
      const { data, error } = await supabase
        .from("TrainingSessions")
        .select("*")
        .eq("user_id", user.info.id)
        .not("start_time", "is", null)
        .is("end_time", null)
        .order("start_time", { ascending: false })
        .limit(1)
        .single();
      if (data && data.id) {
        setActiveSession(data);
      } else {
        setActiveSession(null);
      }
    }
    fetchActiveSession();
  }, [user?.info?.id]);

  // Toast and password logic
  useEffect(() => {
    const checkMustChangePassword = async () => {
      const flag = await getData("mustChangePassword");
      if (flag) {
        navigation.navigate("Profile");
      }
    };
    checkMustChangePassword();
  }, []);

  useEffect(() => {
    const checkToast = async () => {
      const flag = await getData("ChangePasswordSuccess");
      if (flag) {
        setShowSuccessToast(true);
        await clearData("ChangePasswordSuccess");
      }
    };
    checkToast();
  }, []);

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  // Gyms logic
  const storedGyms = user?.settings?.performance_data?.stored_gyms || [];
  const activeGym = user?.settings?.performance_data?.active_gym || null;
  const [menuGymId, setMenuGymId] = useState(null);
  const [gymModalVisible, setGymModalVisible] = useState(false);
  const [gymsDetails, setGymsDetails] = useState([]);
  const [gymsLoading, setGymsLoading] = useState(false);
  const [localActiveGym, setLocalActiveGym] = useState(activeGym);

  const loadGymsDetails = async () => {
    setGymsLoading(true);
    try {
      const gyms = await Promise.all(
        storedGyms.map((gymId) => fetchGymDetailsById(gymId))
      );
      setGymsDetails(gyms);
    } catch (e) {
      setGymsDetails([]);
    }
    setGymsLoading(false);
  };

  const handleOpenGymModal = () => {
    setGymModalVisible(true);
    loadGymsDetails();
    setLocalActiveGym(activeGym);
  };

  const handleSelectGym = async (gymId) => {
    if (!gymId || isNaN(gymId)) {
      console.error(`[Gym] Invalid gymId for selection:`, gymId);
      return;
    }

    setLocalActiveGym(gymId);
    setGymModalVisible(false);

    const { error } = await supabase
      .from("UserSettings")
      .update({
        performance_data: {
          ...user.settings.performance_data,
          active_gym: gymId,
        }
      })
      .eq("user_id", user.info.id);

    if (!error) {
      refreshUser && refreshUser();
    } else {
      console.error(`[Gym] Error updating active gym:`, error);
    }
  };

  const deleteGym = async (gymId) => {
    closeGymMenu();
    const newStoredGyms = storedGyms.filter(id => id !== gymId);
    let newActiveGym = localActiveGym;
    if (localActiveGym === gymId) {
      newActiveGym = newStoredGyms.length > 0 ? Number(newStoredGyms[0]) : null;
    }

    const { error: updateError } = await supabase
      .from("UserSettings")
      .update({
        performance_data: {
          ...user.settings.performance_data,
          stored_gyms: newStoredGyms,
          active_gym: newActiveGym,
        }
      })
      .eq("user_id", user.info.id);

    if (!updateError) {
      await supabase
        .from("Gyms")
        .delete()
        .eq("id", gymId);

      setGymsDetails(prev => prev.filter(g => g.id !== gymId));
      setLocalActiveGym(newActiveGym);
      refreshUser && refreshUser();
    } else {
      console.error(`[Gym] Error updating user settings:`, updateError);
    }
  };

  const openGymMenu = (gymId) => setMenuGymId(gymId);
  const closeGymMenu = () => setMenuGymId(null);

  // Next workout logic
  const isFocused = useIsFocused();
  const { nextWorkout, loading: nextWorkoutLoading } = useNextWorkout(user, isFocused);
  const { handleSkip } = useSkipSession(user?.info?.id);
  const [exerciseList, setExerciseList] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  useEffect(() => {
    const fetchNextWorkout = async () => {
      setNextWorkoutLoading(true);
      try {
        const splitId =
          user?.settings?.selected_routine ||
          user?.split?.id ||
          user?.settings?.performance_data?.selected_routine;
        if (!splitId || !user?.info?.id) {
          setNextWorkout(null);
          setNextWorkoutLoading(false);
          return;
        }

        // 1. Get all planned workouts for user and split
        const { data: plannedWorkouts } = await supabase
          .from("UserPlannedWorkouts")
          .select("*")
          .eq("user_id", user.info.id)
          .eq("split_id", splitId)
          .order("session_index", { ascending: true });

        if (!plannedWorkouts || plannedWorkouts.length === 0) {
          setNextWorkout(null);
          setNextWorkoutLoading(false);
          return;
        }

        // 2. Get last completed session for user and split
        const { data: lastSession } = await supabase
          .from("TrainingSessions")
          .select("session_index")
          .eq("user_id", user.info.id)
          .eq("split_id", splitId)
          .not("end_time", "is", null)
          .order("end_time", { ascending: false })
          .limit(1)
          .single();

        let nextSessionIndex = 0;
        if (lastSession && typeof lastSession.session_index === "number") {
          nextSessionIndex = lastSession.session_index + 1;
        }

        // If all workouts have been completed, start again
        if (!plannedWorkouts.some(w => w.session_index === nextSessionIndex)) {
          nextSessionIndex = 0;
        }

        const next = plannedWorkouts.find(
          (w) => w.session_index === nextSessionIndex
        );

        setNextWorkout(next || null);
      } catch (e) {
        setNextWorkout(null);
      }
      setNextWorkoutLoading(false);
    };

    if (isFocused) {
      fetchNextWorkout();
    }
  }, [user, isFocused]);

  useEffect(() => {
    async function fetchExercisesInfo() {
      if (!nextWorkout || !nextWorkout.exercises || nextWorkout.exercises.length === 0) {
        setExerciseList([]);
        return;
      }
      setLoadingExercises(true);
      const { data } = await supabase
        .from("Exercises")
        .select("id, name, photos")
        .in("id", nextWorkout.exercises);

      // Order the result to match the order in nextWorkout.exercises
      const idOrder = nextWorkout.exercises.map(e => (typeof e === "object" ? e.id : e));
      const ordered = [];
      idOrder.forEach(id => {
        const found = (data || []).find(e => e.id === id);
        if (found) ordered.push(found);
      });

      setExerciseList(ordered);
      setLoadingExercises(false);
    }
    fetchExercisesInfo();
  }, [nextWorkout]);

  // Modal styles only
  const modalStyles = StyleSheet.create({
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
    modalTitle: {
      ...typography.bodyLarge,
      marginBottom: 12,
      color: colors.text.primary,
    },
    modalText: {
      ...typography.bodyMedium,
      color: colors.text.white,
      marginBottom: 24
    },
    modalButton: {
      backgroundColor: colors.bg.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
    },
    gymItem: {
      backgroundColor: colors.card,
      borderColor: colors.text.white,
      borderWidth: 1,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 56,
      marginRight: 12,
    },
    gymInfoContainer: {
      flex: 1,
      minWidth: 0,
    },
    gymNameRow: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
    },
    gymName: {
      ...typography.bodyMedium,
      color: colors.text.white,
      fontWeight: "bold",
      fontSize: 16,
      maxWidth: 160,
      overflow: "hidden",
      flexShrink: 1,
      flexGrow: 0,
    },
    gymEquipment: {
      color: colors.text.white,
      fontSize: 12,
      marginTop: 2,
      opacity: 0.8,
    },
    noGymsText: {
      ...typography.bodySmall,
      color: colors.text.white,
      fontStyle: "italic",
      marginBottom: 12,
      textAlign: "center",
    },
    loadingText: {
      color: colors.text.white,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    closeButton: {
      position: "absolute",
      top: 24,
      right: 24,
    },
    ellipsisButton: {
      marginLeft: 8,
      padding: 8,
      zIndex: 10,
    },
    ellipsisMenu: {
      position: "absolute",
      right: 36,
      top: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
      elevation: 4,
      zIndex: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ellipsisMenuItem: {
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    ellipsisMenuText: {
      color: colors.text.primary,
      marginLeft: 8,
    },
    ellipsisMenuDeleteText: {
      color: colors.text.danger,
      marginLeft: 8,
    },
    addButton: {
      marginTop: 24,
      backgroundColor: colors.bg.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    addButtonText: {
      ...typography.bodyMedium,
      color: colors.text.white,
    },
  });

  // Rest of the page styles
  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: colors.body,
    },
    container: {
      padding: 24
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    drawerWelcome: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4
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
    gymIcon: {
      marginHorizontal: 8,
    },
    gymTitle: {
      ...typography.bodyLarge,
      color: colors.text.primary,
      marginBottom: 16,
    },
    gymItem: {
      backgroundColor: colors.bg.primary,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    gymName: {
      ...typography.bodyMedium,
      color: colors.text.white,
    },
    addButton: {
      marginTop: 24,
      backgroundColor: colors.bg.accent,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    addButtonText: {
      ...typography.bodyMedium,
      color: colors.text.white,
    },
    noGymsText: {
      ...typography.bodySmall,
      color: colors.text.secondary,
      fontStyle: "italic",
      marginBottom: 12,
    },
    closeButton: {
      position: "absolute",
      top: 24,
      right: 24,
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
      backgroundColor: "#ccc",
    },
    exerciseList: {
      marginBottom: 16,
    },
    exerciseText: {
      fontSize: 14,
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

  // Example recovery value
  const recoveryValue = 82;

  const currentSplit = nextWorkout?.split_id;
  const currentSessionIndex = nextWorkout?.session_index;

  return (
    <ScrollView style={styles.scrollView}>
      <ToastMessage
        message={"TEST TOAST"}
        type={"success"}
      />
      <View style={styles.container}>
        {/* Show success toast after changing password */}
        {showSuccessToast && (
          <ToastMessage
            message={"Password changed successfully."}
            type={"success"}
          />
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.drawerWelcome}>
            <TouchableOpacity
              onPress={handleOpenGymModal}
              style={{ marginHorizontal: 8 }}
              activeOpacity={0.6}
            >
              <FontAwesome5 name="landmark" size={24} color={colors.text.primary + "DD"} />
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>
                Hi, {user.info.username}
              </Text>
              <Text style={styles.subGreeting}>
                It's time to challenge your limits.
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("FitnessPlan")}>
            <FontAwesome5 name="sliders-h" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Next workout card */}
        <View style={styles.nextWorkoutCard}>
          <View style={styles.nextWorkoutHeaderPill}>
            <Text style={styles.nextWorkoutHeaderText}>
              {`Next workout — ${nextWorkout?.title || "?"}`}
              {activeSession && <Text style={{ color: colors.text.white }}> (Active)</Text>}
            </Text>
          </View>

          {/* Workout main muscles */}
          <Text style={styles.nextWorkoutMuscles}>
            {joinAndCapitalize(nextWorkout?.details?.main_muscles || [])}
          </Text>
          <Text style={styles.nextWorkoutDetails}>
            {`${nextWorkout?.details?.duration || "?"} minutes - ${nextWorkout?.exercises?.length || 0} exercises`}
          </Text>

          {/* Exercise image slider */}
          {loadingExercises ? (
            <ActivityIndicator size="small" color={colors.text.primary} style={{ marginVertical: 10 }} />
          ) : (
            <FlatList
              data={exerciseList}
              keyExtractor={item => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: 12 }}
              renderItem={({ item }) => (
                <View style={{ alignItems: "center", marginRight: 5 }}>
                  <Image
                    source={{
                      uri:
                        Array.isArray(item.photos) && item.photos.length > 0
                          ? item.photos[0]
                          : DEFAULT_IMAGE,
                    }}
                    style={styles.sliderImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            />
          )}
          {/* Exercises */}
          <View style={styles.exerciseList}>
            <Text style={styles.exerciseText}>
              {exerciseList.map(e => capitalizeFirstLetter(e.name)).join(", ")}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionIconsRow}>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={() => {
                if (activeSession) {
                  console.log("Redirecting to active workout");
                  navigation.navigate("ActiveWorkout", {
                    trainingSessionId: activeSession.id,
                    split_id: activeSession.split_id,
                    session_index: activeSession.session_index,
                  });
                } else {
                  console.log("Redirecting to next workout");
                  navigation.navigate("NextWorkout", {
                    workout: nextWorkout,
                    exercises: exerciseList,
                  });
                }
              }}
            >
              <FontAwesome5 name="play" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionIcon}
              disabled={!!activeSession}
              onPress={async () => {
                if (nextWorkout?.split_id && nextWorkout?.session_index !== undefined) {
                  const success = await handleSkip(nextWorkout.split_id, nextWorkout.session_index);
                  if (success) { refreshUser(); }
                }
              }}
            >
              <FontAwesome5 name="step-forward" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={() => shareWorkout(nextWorkout, exerciseList)}
            >
              <FontAwesome5 name="share-alt" size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          {activeSession && (
            <Text style={{ color: colors.text.warning, marginTop: 6, fontWeight: "bold" }}>
              You have an active workout in progress. Finish it before skipping or starting a new one.
            </Text>
          )}
        </View>

        {/* Cards Row */}
        <View style={styles.cardsRow}>
          {/* Upcoming Workouts Card */}
          <TouchableOpacity style={styles.cardHorizontal} onPress={() => navigation.navigate("PlannedWorkoutsTest")} >
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

        {/* Gym list modal */}
        <Modal
          visible={gymModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setGymModalVisible(false)}
        >
          <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.modalContainer}>
              <Text style={modalStyles.modalTitle}>Select your gym</Text>
              <View style={{ maxHeight: 320, marginBottom: 16 }}>
                {gymsLoading ? (
                  <View style={{ alignItems: "center", justifyContent: "center", flex: 1, height: 200 }}>
                    <ActivityIndicator size="large" color={colors.text.white} />
                    <Text style={modalStyles.loadingText}>Loading gyms...</Text>
                  </View>
                ) : gymsDetails.length === 0 ? (
                  <Text style={modalStyles.noGymsText}>No gyms saved yet.</Text>
                ) : (
                  <ScrollView contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}>
                    {gymsDetails.map((gym, idx) => {
                      let displayName = gym.name || "Unknown";
                      const isActive = localActiveGym === gym.id;
                      return (
                        <View
                          key={gym.id}
                          style={{
                            position: "relative",
                            marginBottom: idx === gymsDetails.length - 1 ? 0 : 12,
                          }}
                        >
                          <View style={[
                            modalStyles.gymItem,
                            isActive && { borderColor: colors.bg.primary, borderWidth: 2 },
                            { alignItems: "center" }
                          ]}>
                            <TouchableOpacity
                              style={[modalStyles.gymInfoContainer, { flex: 1, minWidth: 0 }]}
                              onPress={() => handleSelectGym(gym.id)}
                              activeOpacity={0.7}
                            >
                              <View style={modalStyles.gymNameRow}>
                                <Text
                                  style={modalStyles.gymName}
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                >
                                  {displayName}
                                </Text>
                              </View>
                              <Text style={modalStyles.gymEquipment}>
                                Equipment: {gym.equipmentCount}
                              </Text>
                            </TouchableOpacity>
                            {/* Right section: Ellipsis button */}
                            <TouchableOpacity
                              style={modalStyles.ellipsisButton}
                              onPress={() => openGymMenu(gym.id)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <FontAwesome5 name="ellipsis-v" size={18} color={colors.text.white} />
                            </TouchableOpacity>
                          </View>
                          {/* Ellipsis menu */}
                          {menuGymId === gym.id && (
                            <View style={modalStyles.ellipsisMenu}>
                              <TouchableOpacity
                                onPress={() => {
                                  closeGymMenu();
                                  setGymModalVisible(false);
                                  navigation.navigate("NewGym", { gym_id: gym.id });
                                }}
                                style={modalStyles.ellipsisMenuItem}
                              >
                                <FontAwesome5 name="edit" size={16} color={colors.text.primary} />
                                <Text style={modalStyles.ellipsisMenuText}>Edit</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => deleteGym(gym.id)}
                                style={modalStyles.ellipsisMenuItem}
                              >
                                <FontAwesome5 name="trash" size={16} color={colors.text.danger} />
                                <Text style={modalStyles.ellipsisMenuDeleteText}>Delete</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
              <TouchableOpacity
                style={modalStyles.addButton}
                onPress={() => {
                  setGymModalVisible(false);
                  navigation.navigate("NewGym");
                }}
              >
                <Text style={modalStyles.addButtonText}>Add new gym</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modalStyles.closeButton}
                onPress={() => setGymModalVisible(false)}
              >
                <FontAwesome5 name="times" size={22} color={colors.text.white} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView >
  );
}