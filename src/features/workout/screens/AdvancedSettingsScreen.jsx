import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ScreenTitle } from "../../../global/components/UIElements";
import { UserContext } from "../../../global/contexts/UserContext";
import { supabase } from "../../../global/services/supabaseService";

// Default preferences
const DEFAULT_PREFERENCES = {
  supersets: false,
  dropsets: false,
  warmup_sets: {
    enabled: false,
    compound: 1,
    isolation: 1,
  },
  plate_calculator: false,
  rest_time: {
    enabled: true,
    compound: 150,
    isolation: 90,
  },
  reps_progression: {
    compound: ["Straight"],
    isolation: ["Straight"],
  },
};

const repsProgressionOptions = ["Straight", "Pyramid", "Reverse Pyramid"];

export default function AdvancedSettingsScreen({ navigation }) {
  const { colors } = useThemeContext();
  const { user, refreshUser } = useContext(UserContext);

  const preferences = (() => {
    try {
      const p = user?.settings?.app_preferences
        ? typeof user.settings.app_preferences === "string"
          ? JSON.parse(user.settings.app_preferences)
          : user.settings.app_preferences
        : DEFAULT_PREFERENCES;
      return {
        ...p,
        reps_progression: {
          compound: Array.isArray(p.reps_progression?.compound)
            ? p.reps_progression.compound
            : [p.reps_progression?.compound || "Straight"],
          isolation: Array.isArray(p.reps_progression?.isolation)
            ? p.reps_progression.isolation
            : [p.reps_progression?.isolation || "Straight"],
        },
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  })();

  const [optimisticPrefs, setOptimisticPrefs] = useState(preferences);
  const [modal, setModal] = useState(null);
  const [progressionTab, setProgressionTab] = useState("compound");

  const updatePreferenceOptimistic = async (key, value) => {
    const prev = { ...optimisticPrefs };
    setOptimisticPrefs((p) => ({ ...p, [key]: value }));
    try {
      await supabase
        .from("UserSettings")
        .update({ app_preferences: { ...optimisticPrefs, [key]: value } })
        .eq("user_id", user.info.id);
      refreshUser();
    } catch {
      setOptimisticPrefs(prev);
    }
  };

  const updateNestedPreferenceOptimistic = async (key, subkey, value) => {
    const prev = { ...optimisticPrefs };
    setOptimisticPrefs((p) => ({
      ...p,
      [key]: { ...p[key], [subkey]: value },
    }));
    try {
      await supabase
        .from("UserSettings")
        .update({
          app_preferences: {
            ...optimisticPrefs,
            [key]: { ...optimisticPrefs[key], [subkey]: value },
          },
        })
        .eq("user_id", user.info.id);
      refreshUser();
    } catch {
      setOptimisticPrefs(prev);
    }
  };

  // Handler for progression preferences
  const handleProgressionChange = (type) => {
    const currentTab = progressionTab;
    const currentSelection = optimisticPrefs.reps_progression[currentTab];
    let newSelection;
    if (currentSelection.includes(type)) {
      // Solo permitir quitar si queda al menos 1
      if (currentSelection.length === 1) return;
      newSelection = currentSelection.filter((t) => t !== type);
    } else {
      newSelection = [...currentSelection, type];
    }
    updatePreferenceOptimistic("reps_progression", {
      ...optimisticPrefs.reps_progression,
      [currentTab]: newSelection,
    });
  };

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      padding: 24,
    },
    cardsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 32,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 20,
      paddingLeft: 16,
      paddingRight: 40,
      minHeight: 70,
      position: "relative",
      justifyContent: "center",
      width: "48%",
      marginBottom: 16,
    },
    cardTitle: {
      color: colors.text.white, // Fuera del modal: blanco
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 2,
    },
    cardTitleModal: {
      color: colors.text.primary, // En el modal: primary
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 2,
    },
    caretRight: {
      position: "absolute",
      right: 14,
      top: "50%",
      marginTop: 8,
      width: 22,
      height: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    status: {
      fontWeight: "bold",
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 8,
      alignSelf: "flex-start",
      overflow: "hidden",
      fontSize: 13,
    },
    statusEnabled: {
      color: "#fff",
      backgroundColor: colors.text.primary,
    },
    statusDisabled: {
      color: "#fff",
      backgroundColor: colors.text.muted,
    },
    modalStatus: {
      color: "#fff",
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
      marginTop: 16,
    },
    modalButtonText: {
      color: colors.text.white,
      fontWeight: "bold",
    },
    toggleButton: {
      marginTop: 16,
      padding: 10,
      borderRadius: 8,
      backgroundColor: colors.bg.primary,
      alignItems: "center",
    },
    pickerRow: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      marginVertical: 8,
      width: "100%",
    },
    pickerLabel: {
      color: colors.text.white,
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 8,
    },
    pickerValueArea: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      marginBottom: 8,
    },
    pickerValue: {
      color: "#fff", // Números en blanco
      fontWeight: "bold",
      fontSize: 24,
      minWidth: 38,
      textAlign: "center",
      marginHorizontal: 18,
    },
    stepperButton: {
      width: 28,
      height: 28,
      backgroundColor: colors.bg.primary,
      borderRadius: 6,
      marginHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    radioRow: {
      flexDirection: "row",
      marginTop: 12,
      marginBottom: 8,
      justifyContent: "space-between",
    },
    radioOption: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
      marginVertical: 5,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.bg.primary,
      marginRight: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    checkboxSelected: {
      backgroundColor: colors.bg.primary,
    },
    radioText: {
      color: colors.text.primary,
      fontSize: 15,
    },
    cardSubtitle: {
      color: colors.text.muted,
    },
    tabContainer: {
      flexDirection: "row",
      marginBottom: 20,
      marginTop: 10,
    },
    tab: {
      flex: 1,
      padding: 12,
      alignItems: "center",
      borderBottomWidth: 2,
      borderColor: "transparent",
    },
    activeTab: {
      borderColor: colors.bg.primary,
    },
    tabText: {
      color: colors.text.primary,
      fontWeight: "bold",
    },
    innerCircle: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.text.white,
    },
    closeModalButton: {
      marginTop: 22,
      backgroundColor: colors.bg.primary,
      borderRadius: 10,
      padding: 10,
      alignItems: "center",
    },
    closeModalText: {
      color: colors.text.white,
      fontWeight: "bold",
    },
    tapToConfigure: {
      color: colors.text.muted,
      fontWeight: "bold",
      fontSize: 13,
      paddingVertical: 3,
      borderRadius: 8,
      alignSelf: "flex-start",
      overflow: "hidden",
    },
  });

  const advancedCards = [
    {
      key: "supersets",
      title: "Supersets",
      value: optimisticPrefs.supersets ? "Enabled" : "Disabled",
      enabled: optimisticPrefs.supersets,
      info: "Include supersets in workouts",
      description:
        "A superset is when you perform two exercises back-to-back with no rest in between. This increases intensity and saves time.",
    },
    {
      key: "dropsets",
      title: "Dropsets",
      value: optimisticPrefs.dropsets ? "Enabled" : "Disabled",
      enabled: optimisticPrefs.dropsets,
      info: "Include dropsets in workouts",
      description:
        "A dropset is when you perform an exercise to failure, then reduce the weight and continue for more reps. This helps push your muscles beyond fatigue.",
    },
    {
      key: "warmup_sets",
      title: "Warmup Sets",
      value: optimisticPrefs.warmup_sets.enabled ? "Enabled" : "Disabled",
      enabled: optimisticPrefs.warmup_sets.enabled,
      info: "Indicate the number of warmup sets before the first exercise of each muscle group.",
      description:
        "Warmup sets prepare your muscles and joints for heavier work. You can set different warmup counts for compound and isolation exercises.",
    },
    {
      key: "plate_calculator",
      title: "Plate Calculator",
      value: optimisticPrefs.plate_calculator ? "Enabled" : "Disabled",
      enabled: optimisticPrefs.plate_calculator,
      info: "Enable a plate calculator graphic",
      description:
        "The plate calculator helps you visualize and calculate how to load weight plates on a barbell for your target weight.",
    },
    {
      key: "rest_time",
      title: "Rest Time",
      value: optimisticPrefs.rest_time.enabled ? "Enabled" : "Disabled",
      enabled: optimisticPrefs.rest_time.enabled,
      info: "Enable or disable rest timer between sets",
      description:
        "Rest time helps you manage your recovery between sets. You can set different default times for compound and isolation exercises.",
    },
    {
      key: "reps_progression",
      title: "Reps Progression",
      value: "Tap to configure",
      enabled: true,
      info: "Select progression for compound and isolation exercises",
      description:
        "Choose how your repetitions change during your sets: Straight (same reps), Pyramid (reps decrease as weight increases), or Reverse Pyramid (reps increase as weight decreases).",
    },
  ];

  const renderModalContent = () => {
    if (!modal) return null;
    const card = advancedCards.find((c) => c.key === modal);

    // Supersets, Dropsets, Plate Calculator
    if (["supersets", "dropsets", "plate_calculator"].includes(modal)) {
      return (
        <>
          <Text style={styles.cardTitleModal}>{card.title}</Text>
          <Text style={styles.cardSubtitle}>{card.info}</Text>
          <Text style={[styles.cardSubtitle, { marginVertical: 12 }]}>{card.description}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <Text style={styles.modalStatus}>
              {optimisticPrefs[modal] ? "Enabled" : "Disabled"}
            </Text>
            <Switch
              value={optimisticPrefs[modal]}
              onValueChange={(val) => updatePreferenceOptimistic(modal, val)}
              thumbColor={optimisticPrefs[modal] ? colors.bg.primary : colors.text.muted}
              trackColor={{ true: colors.bg.primary + "5F", false: colors.text.muted + "5F" }}
            />
          </View>
        </>
      );
    }

    // Warmup Sets
    if (modal === "warmup_sets") {
      return (
        <>
          <Text style={styles.cardTitleModal}>{card.title}</Text>
          <Text style={styles.cardSubtitle}>{card.info}</Text>
          <Text style={[styles.cardSubtitle, { marginVertical: 12 }]}>{card.description}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <Text style={styles.modalStatus}>
              {optimisticPrefs.warmup_sets.enabled ? "Enabled" : "Disabled"}
            </Text>
            <Switch
              value={optimisticPrefs.warmup_sets.enabled}
              onValueChange={(val) =>
                updatePreferenceOptimistic("warmup_sets", {
                  ...optimisticPrefs.warmup_sets,
                  enabled: val,
                })
              }
              thumbColor={optimisticPrefs.warmup_sets.enabled ? colors.bg.primary : colors.text.muted}
              trackColor={{ true: colors.bg.primary + "5F", false: colors.text.muted + "5F" }}
            />
          </View>
          {optimisticPrefs.warmup_sets.enabled && (
            <>
              <View style={styles.pickerRow}>
                <Text style={styles.pickerLabel}>Compound exercises</Text>
                <View style={styles.pickerValueArea}>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() =>
                      updatePreferenceOptimistic("warmup_sets", {
                        ...optimisticPrefs.warmup_sets,
                        compound: Math.max(1, optimisticPrefs.warmup_sets.compound - 1),
                      })
                    }
                  >
                    <FontAwesome5 name="minus" size={14} color={colors.text.white} />
                  </TouchableOpacity>
                  <Text style={styles.pickerValue}>{optimisticPrefs.warmup_sets.compound}</Text>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() =>
                      updatePreferenceOptimistic("warmup_sets", {
                        ...optimisticPrefs.warmup_sets,
                        compound: Math.min(4, optimisticPrefs.warmup_sets.compound + 1),
                      })
                    }
                  >
                    <FontAwesome5 name="plus" size={14} color={colors.text.white} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.pickerRow}>
                <Text style={styles.pickerLabel}>Isolation exercises</Text>
                <View style={styles.pickerValueArea}>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() =>
                      updatePreferenceOptimistic("warmup_sets", {
                        ...optimisticPrefs.warmup_sets,
                        isolation: Math.max(1, optimisticPrefs.warmup_sets.isolation - 1),
                      })
                    }
                  >
                    <FontAwesome5 name="minus" size={14} color={colors.text.white} />
                  </TouchableOpacity>
                  <Text style={styles.pickerValue}>{optimisticPrefs.warmup_sets.isolation}</Text>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() =>
                      updatePreferenceOptimistic("warmup_sets", {
                        ...optimisticPrefs.warmup_sets,
                        isolation: Math.min(4, optimisticPrefs.warmup_sets.isolation + 1),
                      })
                    }
                  >
                    <FontAwesome5 name="plus" size={14} color={colors.text.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </>
      );
    }

    // Rest Time
    if (modal === "rest_time") {
      return (
        <>
          <Text style={styles.cardTitleModal}>{card.title}</Text>
          <Text style={styles.cardSubtitle}>{card.info}</Text>
          <Text style={[styles.cardSubtitle, { marginVertical: 12 }]}>{card.description}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <Text style={styles.modalStatus}>
              {optimisticPrefs.rest_time.enabled ? "Enabled" : "Disabled"}
            </Text>
            <Switch
              value={optimisticPrefs.rest_time.enabled}
              onValueChange={(val) =>
                updateNestedPreferenceOptimistic("rest_time", "enabled", val)
              }
              thumbColor={optimisticPrefs.rest_time.enabled ? colors.bg.primary : colors.text.muted}
              trackColor={{ true: colors.bg.primary + "5F", false: colors.text.muted + "5F" }}
            />
          </View>
          {optimisticPrefs.rest_time.enabled && (
            <>
              <View style={styles.pickerRow}>
                <Text style={styles.pickerLabel}>Compound exercises</Text>
                <View style={styles.pickerValueArea}>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() =>
                      updateNestedPreferenceOptimistic(
                        "rest_time",
                        "compound",
                        Math.max(0, optimisticPrefs.rest_time.compound - 15)
                      )
                    }
                  >
                    <FontAwesome5 name="minus" size={14} color={colors.text.white} />
                  </TouchableOpacity>
                  <Text style={styles.pickerValue}>
                    {Math.floor(optimisticPrefs.rest_time.compound / 60)}:
                    {String(optimisticPrefs.rest_time.compound % 60).padStart(2, "0")}
                  </Text>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() =>
                      updateNestedPreferenceOptimistic(
                        "rest_time",
                        "compound",
                        Math.min(600, optimisticPrefs.rest_time.compound + 15)
                      )
                    }
                  >
                    <FontAwesome5 name="plus" size={14} color={colors.text.white} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.pickerRow}>
                <Text style={styles.pickerLabel}>Isolation exercises</Text>
                <View style={styles.pickerValueArea}>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() =>
                      updateNestedPreferenceOptimistic(
                        "rest_time",
                        "isolation",
                        Math.max(0, optimisticPrefs.rest_time.isolation - 15)
                      )
                    }
                  >
                    <FontAwesome5 name="minus" size={14} color={colors.text.white} />
                  </TouchableOpacity>
                  <Text style={styles.pickerValue}>
                    {Math.floor(optimisticPrefs.rest_time.isolation / 60)}:
                    {String(optimisticPrefs.rest_time.isolation % 60).padStart(2, "0")}
                  </Text>
                  <TouchableOpacity
                    style={styles.stepperButton}
                    onPress={() =>
                      updateNestedPreferenceOptimistic(
                        "rest_time",
                        "isolation",
                        Math.min(600, optimisticPrefs.rest_time.isolation + 15)
                      )
                    }
                  >
                    <FontAwesome5 name="plus" size={14} color={colors.text.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </>
      );
    }

    // Reps Progression (selección múltiple)
    if (modal === "reps_progression") {
      return (
        <>
          <Text style={styles.cardTitleModal}>{card.title}</Text>
          <Text style={styles.cardSubtitle}>{card.info}</Text>
          <Text style={[styles.cardSubtitle, { marginVertical: 12 }]}>{card.description}</Text>
          <View style={styles.tabContainer}>
            {["compound", "isolation"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, progressionTab === tab && styles.activeTab]}
                onPress={() => setProgressionTab(tab)}
              >
                <Text style={styles.tabText}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View>
            {repsProgressionOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.radioOption}
                onPress={() => handleProgressionChange(option)}
              >
                <View
                  style={[
                    styles.checkbox,
                    optimisticPrefs.reps_progression[progressionTab].includes(option) &&
                      styles.checkboxSelected,
                  ]}
                >
                  {optimisticPrefs.reps_progression[progressionTab].includes(option) && (
                    <FontAwesome5 name="check" size={12} color={colors.text.white} />
                  )}
                </View>
                <Text style={styles.radioText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <ScreenTitle title="Advanced Settings" />
      <ScrollView>
        <View style={styles.cardsContainer}>
          {advancedCards.map((card) => (
            <TouchableOpacity
              key={card.key}
              style={styles.card}
              onPress={() => setModal(card.key)}
            >
              <Text style={styles.cardTitle}>{card.title}</Text>
              {card.key === "reps_progression" ? (
                <Text style={styles.tapToConfigure}>{card.value}</Text>
              ) : (
                <Text
                  style={[
                    styles.status,
                    card.enabled ? styles.statusEnabled : styles.statusDisabled,
                  ]}
                >
                  {card.value}
                </Text>
              )}
              <View style={styles.caretRight}>
                <FontAwesome5 name="chevron-right" size={18} color={colors.text.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <Modal
        visible={!!modal}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {renderModalContent()}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModal(null)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
