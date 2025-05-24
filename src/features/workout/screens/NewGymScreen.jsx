import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ActionButton, ScreenTitle } from "../../../global/components/UIElements";
import { supabase } from "../../../global/services/supabaseService";
import { UserContext } from "../../../global/contexts/UserContext";

// Info and default equipment for each gym type
const GYM_TYPE_INFO = {
  "Large gym": {
    description: "A commercial gym with a wide variety of equipment and space. Ideal for all training styles.",
    defaultEquipment: [
      "Flat Bench", "Incline Bench", "Adjustable Bench", "Squat Rack", "Power Rack", "Smith Machine", "Barbell",
      "EZ Curl Bar", "Dumbbells", "Kettlebells", "Weight Plates", "Cable Machine", "Lat Pulldown Machine",
      "Chest Press Machine", "Leg Press Machine", "Leg Curl Machine", "Leg Extension Machine", "Shoulder Press Machine",
      "T-Bar Row Machine", "Pull-up Bar", "Dip Station", "Pec Deck / Chest Fly Machine", "Treadmill", "Stationary Bike",
      "Rowing Machine", "Elliptical", "Air Bike (Assault Bike)", "Battle Ropes", "TRX / Suspension Trainer", "Foam Roller",
      "Medicine Ball", "Wall Ball", "Sandbag", "Plyometric Box", "Jump Rope",
    ],
  },
  "Small gym": {
    description: "A smaller gym, typically with basic essentials. Good for focused or small group training.",
    defaultEquipment: [
      "Adjustable Bench", "Squat Rack", "Barbell", "Dumbbells", "Kettlebells", "Pull-up Bar", "Resistance Bands",
      "Leg Curl Machine", "Leg Extension Machine", "Cable Machine", "Treadmill", "Stationary Bike", "Rowing Machine",
      "Dip Station", "TRX / Suspension Trainer", "Medicine Ball", "Foam Roller", "Jump Rope",
    ],
  },
  "Garage gym": {
    description: "A home or garage setup. Usually compact and personalized.",
    defaultEquipment: [
      "Dumbbells", "Pull-up Bar", "Resistance Bands", "Ab Roller", "Foam Roller", "Jump Rope",
    ],
  },
};

// All available equipment options
const EQUIPMENT_OPTIONS = [
  // Strength Training
  "Flat Bench", "Incline Bench", "Decline Bench", "Adjustable Bench", "Squat Rack", "Power Rack", "Smith Machine",
  "Barbell", "EZ Curl Bar", "Trap Bar", "Safety Squat Bar", "Dumbbells", "Kettlebells", "Weight Plates", "Weight Tree",
  "Leg Press Machine", "Hack Squat Machine", "Leg Curl Machine", "Leg Extension Machine", "Hip Thrust Machine",
  "Cable Machine", "Lat Pulldown Machine", "Seated Row Machine", "Chest Press Machine", "Pec Deck / Chest Fly Machine",
  "Shoulder Press Machine", "Preacher Curl Bench", "T-Bar Row Machine", "Glute Ham Developer (GHD)", "Sled (Prowler)",
  "Landmine Attachment",
  // Functional & Bodyweight
  "Pull-up Bar", "Dip Station", "Push-up Handles", "Resistance Bands", "TRX / Suspension Trainer", "Battle Ropes",
  "Plyometric Box", "Parallettes", "Ab Roller", "Slamball", "Medicine Ball", "Wall Ball", "Sandbag", "Weight Vest",
  // Cardio
  "Treadmill", "Stationary Bike", "Spin Bike", "Rowing Machine", "Elliptical", "Stair Climber", "SkiErg",
  "Air Bike (Assault Bike)", "Jump Rope",
  // Mobility / Recovery
  "Foam Roller", "Massage Gun", "Yoga Mat", "Stretch Bands", "Balance Ball (Stability Ball)", "Bosu Ball",
];

const gymTypes = [
  { label: "Large gym", value: "Large gym" },
  { label: "Small gym", value: "Small gym" },
  { label: "Garage gym", value: "Garage gym" },
];

export default function NewGym({ navigation, route }) {
  const gym_id = route?.params?.gym_id ?? null;
  const { colors, typography } = useThemeContext();
  const { user, refreshUser } = useContext(UserContext);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const [equipment, setEquipment] = useState([]);
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!gym_id);
  const [infoModal, setInfoModal] = useState({ visible: false, description: "" });

  // Load gym data if editing
  useEffect(() => {
    if (!gym_id) return;
    setLoading(true);
    const fetchGym = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("Gyms")
          .select("*")
          .eq("id", gym_id)
          .single();
        refreshUser();
        if (fetchError) throw fetchError;

        setName(data.name || "");
        setLocation(data.location || "");
        setType(data.type || null);
        setIsPrivate(data.private !== undefined ? data.private : true);
        const eq = Array.isArray(data.equipment)
          ? data.equipment
          : data.equipment
            ? Object.values(data.equipment)
            : [];
        setEquipment(eq);
        setSelectedEquipment(eq);
      } catch (err) {
        setError("Could not load gym data.");
        setName("");
        setLocation("");
        setType(null);
        setIsPrivate(true);
        setEquipment([]);
        setSelectedEquipment([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, [gym_id]);

  // When type changes, set default equipment (only those in EQUIPMENT_OPTIONS)
  useEffect(() => {
    if (!type) {
      setEquipment([]);
      setSelectedEquipment([]);
      return;
    }
    if (!gym_id || equipment.length === 0) {
      const defaults = GYM_TYPE_INFO[type]?.defaultEquipment || [];
      const filteredDefaults = defaults.filter(eq => EQUIPMENT_OPTIONS.includes(eq));
      setEquipment(filteredDefaults);
      setSelectedEquipment(filteredDefaults);
    }
  }, [type]);

  const isValid = name.trim().length > 1 && location.trim().length > 1 && !!type;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      padding: 24,
    },
    label: {
      ...typography.bodyMedium,
      color: colors.text.primary,
      marginTop: 18,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.input.background,
      color: colors.input.color,
      borderWidth: 1,
      borderColor: colors.input.borderColor || colors.input.border || colors.border,
      borderRadius: 4,
      paddingHorizontal: 12,
      paddingVertical: 14,
      ...typography.input,
    },
    typeSelector: {
      marginTop: 6,
      marginBottom: 6,
    },
    typeButtonRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    typeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.text.primary,
      borderRadius: 12,
      paddingVertical: 11,
      paddingHorizontal: 16,
      backgroundColor: "transparent",
    },
    typeButtonSelected: {
      backgroundColor: colors.text.primary,
    },
    typeText: {
      ...typography.bodyMedium,
      color: colors.text.primary,
      flex: 1,
    },
    typeTextSelected: {
      color: colors.text.white,
      fontWeight: "bold",
    },
    infoIcon: {
      marginLeft: 8,
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 18,
      marginBottom: 18,
      justifyContent: "center",
    },
    privateToggle: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isPrivate ? colors.text.white : colors.text.primary,
      padding: 8,
      paddingHorizontal: 18,
    },
    privateToggleActive: {
      backgroundColor: colors.card,
    },
    privateToggleText: {
      ...typography.bodyMedium,
      color: isPrivate ? colors.text.white : colors.text.primary,
      marginLeft: 10,
      marginRight: 8,
    },
    errorText: {
      color: colors.text.danger,
      marginTop: 8,
      ...typography.bodySmall,
    },
    equipmentButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input.background,
      borderWidth: 1,
      borderColor: colors.input.borderColor || colors.input.border || colors.border,
      borderRadius: 4,
      paddingHorizontal: 12,
      paddingVertical: 16,
      marginBottom: 4,
      opacity: type ? 1 : 0.5,
    },
    equipmentButtonText: {
      flex: 1,
      color: colors.input.color,
      ...typography.input,
    },
    selectedEquipmentText: {
      color: colors.input.color,
      fontWeight: "bold",
    },
    loader: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    infoModalContainer: {
      backgroundColor: colors.card,
      margin: 40,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
    },
    infoModalText: {
      ...typography.bodyMedium,
      color: colors.text.primary,
      textAlign: "center",
    },
    infoModalClose: {
      marginTop: 24,
      padding: 10,
      backgroundColor: colors.bg.accent,
      borderRadius: 8,
    },
    infoModalCloseText: {
      color: colors.text.white,
      ...typography.bodyMedium,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "#0008",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "90%",
      maxHeight: "80%",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 0,
      overflow: "hidden",
    },
    modalHeader: {
      padding: 18,
      borderBottomWidth: 1,
      borderColor: colors.input.border,
      backgroundColor: colors.card,
    },
    modalHeaderText: {
      ...typography.bodyLarge,
      color: colors.text.white,
      fontWeight: "bold",
    },
    modalScroll: {
      padding: 18,
      paddingBottom: 0,
    },
    modalEquipmentItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: colors.input.border,
    },
    modalEquipmentText: {
      flex: 1,
      ...typography.bodyMedium,
      color: colors.text.white,
    },
    modalFooter: {
      padding: 18,
      borderTopWidth: 1,
      borderColor: colors.input.border,
      backgroundColor: colors.card,
    },
    saveEquipmentBtn: {
      backgroundColor: colors.bg.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
    },
    saveEquipmentText: {
      color: colors.text.white,
      ...typography.bodyMedium,
      fontWeight: "bold",
    },
    closeModalBtn: {
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 10,
    },
    bottomSpacer: {
      height: 100,
    },
  });

  const equipmentLabel =
    equipment.length === 0
      ? "Select your gym type and equipment"
      : equipment.join(", ");

  const handleSaveEquipment = () => {
    setEquipment(selectedEquipment);
    setEquipmentModalVisible(false);
  };

  const toggleEquipment = (item) => {
    setSelectedEquipment((prev) =>
      prev.includes(item)
        ? prev.filter((eq) => eq !== item)
        : [...prev, item]
    );
  };

  const handleRegister = async () => {
    setError("");
    try {
      let currentGymId = gym_id;

      // Insert or update the gym
      if (gym_id) {
        // Update existing gym
        const { error: updateError } = await supabase
          .from("Gyms")
          .update({
            name,
            location,
            type,
            private: isPrivate,
            equipment: selectedEquipment,
          })
          .eq("id", gym_id);
        refreshUser();
        if (updateError) throw updateError;
      } else {
        // Insert new gym and associate it with the user
        const { data, error: insertError } = await supabase
          .from("Gyms")
          .insert([
            {
              name,
              location,
              type,
              private: isPrivate,
              equipment: selectedEquipment,
              created_by: user.info.id,
            },
          ])
          .select("id")
          .single();
        refreshUser();

        if (insertError) throw insertError;
        currentGymId = data.id;
      }

      // Extract current performance data from local user.settings
      const performanceData = user.settings.performance_data || {};

      // Prepare new stored_gyms list
      const storedGyms = performanceData.stored_gyms || [];
      if (!storedGyms.includes(currentGymId)) {
        storedGyms.push(currentGymId);
      }

      // Determine active gym
      const activeGym = performanceData.active_gym || currentGymId;

      // Build the updated performance_data object
      const updatedPerformanceData = {
        ...performanceData,
        stored_gyms: storedGyms,
        active_gym: performanceData.active_gym || currentGymId,
      };

      // Update UserSettings with the new performance_data
      const { error: updateError } = await supabase
        .from("UserSettings")
        .update({
          performance_data: updatedPerformanceData,
        })
        .eq("user_id", user.info.id);
      refreshUser();

      if (updateError) throw updateError;

      navigation.goBack();
    } catch (err) {
      console.error(err);
      setError("There was a problem saving the gym.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.bg.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 10 }}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenTitle title={gym_id ? "Edit gym" : "Register your gym"} />

        <Text style={styles.label}>Gym name</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Iron Paradise"
          placeholderTextColor={colors.input.placeholder}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Madrid, España"
          placeholderTextColor={colors.input.placeholder}
          value={location}
          onChangeText={setLocation}
          autoCapitalize="sentences"
        />

        <Text style={styles.label}>Gym type</Text>
        <View style={styles.typeSelector}>
          {gymTypes.map((item) => (
            <View key={item.value} style={styles.typeButtonRow}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === item.value && styles.typeButtonSelected,
                ]}
                onPress={() => setType(item.value)}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === item.value && styles.typeTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setInfoModal({
                      visible: true,
                      description: GYM_TYPE_INFO[item.value].description,
                    })
                  }
                  style={styles.infoIcon}
                >
                  <FontAwesome5
                    name="info-circle"
                    size={20}
                    color={type === item.value ? colors.text.white : colors.text.primary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Privacy toggle */}
        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[
              styles.privateToggle,
              isPrivate && styles.privateToggleActive,
            ]}
            onPress={() => setIsPrivate((prev) => !prev)}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name={isPrivate ? "lock" : "unlock"}
              size={20}
              color={isPrivate ? colors.text.white : colors.text.primary}
            />
            <Text style={styles.privateToggleText}>
              {isPrivate ? "Private gym" : "Public gym"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Equipment</Text>
        <TouchableOpacity
          style={styles.equipmentButton}
          onPress={() => {
            if (!type) return;
            setSelectedEquipment(equipment);
            setEquipmentModalVisible(true);
          }}
          disabled={!type}
        >
          <Text
            style={[
              styles.equipmentButtonText,
              equipment.length > 0 && styles.selectedEquipmentText,
            ]}
            numberOfLines={1}
          >
            {equipmentLabel}
          </Text>
          <FontAwesome5 name="chevron-right" size={18} color={colors.text.secondary} />
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <ActionButton
        text={gym_id ? "Update gym" : "Register gym"}
        disabled={!isValid}
        onPress={handleRegister}
      />

      {/* Info modal for gym type */}
      <Modal
        visible={infoModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModal({ visible: false, description: "" })}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0008" }}>
          <View style={styles.infoModalContainer}>
            <Text style={styles.infoModalText}>{infoModal.description}</Text>
            <TouchableOpacity
              style={styles.infoModalClose}
              onPress={() => setInfoModal({ visible: false, description: "" })}
            >
              <Text style={styles.infoModalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Equipment selection modal */}
      <Modal
        visible={equipmentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEquipmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Select available equipment</Text>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setEquipmentModalVisible(false)}
              >
                <FontAwesome5 name="times" size={20} color={colors.text.white} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {EQUIPMENT_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalEquipmentItem}
                  onPress={() => toggleEquipment(item)}
                >
                  <Text style={styles.modalEquipmentText}>{item}</Text>
                  {selectedEquipment.includes(item) && (
                    <FontAwesome5
                      name="check-circle"
                      size={18}
                      color={colors.text.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.saveEquipmentBtn}
                onPress={handleSaveEquipment}
              >
                <Text style={styles.saveEquipmentText}>Save equipment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
