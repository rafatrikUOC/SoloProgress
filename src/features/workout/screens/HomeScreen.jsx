import React, { useState, useContext, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { UserContext } from "../../../global/contexts/UserContext";
import { supabase } from "../../../global/services/supabaseService";

const SCREEN_WIDTH = Dimensions.get("window").width;
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

// Returns a color from the palette based on recovery value
const getRecoveryColor = (value, colors) => {
  if (value >= 80) return colors.text.success;
  if (value >= 50) return colors.text.warning;
  if (value >= 20) return colors.text.info;
  return colors.text.danger;
};

// Async fetch for gym details and equipment count using Supabase
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

  // Count equipment items from the JSON field
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

  // Get gyms and active gym from user.settings.performance_data
  const storedGyms = user?.settings?.performance_data?.stored_gyms || [];
  const activeGym = user?.settings?.performance_data?.active_gym || null;

  // State for modal
  const [menuGymId, setMenuGymId] = useState(null);
  const [gymModalVisible, setGymModalVisible] = useState(false);
  const [gymsDetails, setGymsDetails] = useState([]);
  const [gymsLoading, setGymsLoading] = useState(false);

  // Local active gym for immediate UI feedback
  const [localActiveGym, setLocalActiveGym] = useState(activeGym);

  // Always fetch gyms when opening modal (so it's always up to date)
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

  // Open modal and fetch gyms
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

    // Update database and refresh context
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


  // Delete gym handler (removes from user settings and Supabase)
  const deleteGym = async (gymId) => {
    closeGymMenu();

    // Remove from stored_gyms
    const newStoredGyms = storedGyms.filter(id => id !== gymId);

    // Determine new active gym
    let newActiveGym = localActiveGym;
    if (localActiveGym === gymId) {
      newActiveGym = newStoredGyms.length > 0 ? Number(newStoredGyms[0]) : null;
    }

    // Update user settings in Supabase
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
      // Remove from Gyms table
      const { error: gymDeleteError } = await supabase
        .from("Gyms")
        .delete()
        .eq("id", gymId);

      if (!gymDeleteError) {
      } else {
        console.error(`[Gym] Error deleting gym from Gyms table:`, gymDeleteError);
      }

      // Update local state for UI
      setGymsDetails(prev => prev.filter(g => g.id !== gymId));
      setLocalActiveGym(newActiveGym);

      refreshUser && refreshUser();
      if (newActiveGym) {
      } else {
      }
    } else {
      console.error(`[Gym] Error updating user settings:`, updateError);
    }
  };



  // Open ellipsis menu for a gym
  const openGymMenu = (gymId) => setMenuGymId(gymId);

  // Close ellipsis menu
  const closeGymMenu = () => setMenuGymId(null);

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
    gymLocation: {
      color: colors.text.white,
      opacity: 0.8,
      fontSize: 12,
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
    gymLocation: {
      color: colors.text.white,
      opacity: 0.8,
      fontSize: 12,
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

  // Example recovery value
  const recoveryValue = 82;

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
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
                      if (!displayName.trim().toLowerCase().endsWith("gym")) {
                        displayName = displayName + " gym";
                      }
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
                                <Text style={modalStyles.gymId}>ID: {gym.id}</Text>
                              </View>
                              <Text style={modalStyles.gymLocation}>{gym.location}</Text>
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

        {/* Trigger for modal */}
        <TouchableOpacity
          onPress={handleOpenGymModal}
          style={{
            marginTop: 24,
            backgroundColor: colors.bg.primary,
            padding: 12,
            borderRadius: 8,
            alignSelf: "center",
          }}
        >
          <Text style={{ color: colors.text.white, fontWeight: "bold" }}>Open Gym Modal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}