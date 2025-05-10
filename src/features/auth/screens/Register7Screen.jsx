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

const ACTIVITY_LEVELS = [
  {
    label: "Beginner",
    description: "You are just starting out with exercise or have little consistent experience in fitness. Your focus will be on building foundational strength, improving mobility, and learning proper form.",
  },
  {
    label: "Intermediate",
    description: "You have been training consistently for a while and are comfortable with most exercises. You are ready to increase intensity and target specific fitness goals such as muscle growth or improving endurance.",
  },
  {
    label: "Advanced",
    description: "You have extensive training experience and are capable of handling high-intensity workouts. Your focus is on pushing your limits, improving performance, and refining advanced techniques.",
  },
];

export default function Register7({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [currentDescription, setCurrentDescription] = useState("");

  // Cargar el nivel de actividad previamente almacenado
  useEffect(() => {
    const loadActivityLevel = async () => {
      const registrationData = await getData("registrationData");
      if (registrationData && registrationData.activityLevel) {
        setSelectedLevel(registrationData.activityLevel);  // Cargar el nivel de actividad
      }
    };
    loadActivityLevel();
  }, []);

  const handleSelect = (level) => {
    setSelectedLevel(level.label);
    saveActivityLevelData(level);  // Guardar el nivel de actividad seleccionado
  };

  const openInfo = (description) => {
    setCurrentDescription(description);
    setInfoVisible(true);
  };

  // Función para guardar el nivel de actividad
  const saveActivityLevelData = async (level) => {
    const prev = await getData("registrationData");
    const finalData = {
      ...prev,
      activityLevel: level.label,  // Guardar el nivel de actividad
    };
    await saveData("registrationData", finalData);
  };

  return (
    <View style={styles(colors).container}>
      <BackButton onPress={() => navigation.goBack()} />

      <HeaderBlock
        title="Physical activity level"
        subtitle="Choose your training experience to optimize intensity."
      />

      <View style={styles(colors).optionsContainer}>
        {ACTIVITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.label}
            onPress={() => handleSelect(level)}
            style={[
              styles(colors).option,
              selectedLevel === level.label && styles(colors).optionSelected,
            ]}
            activeOpacity={0.9}
          >
            <View style={styles(colors).optionRow}>
              <Text
                style={[
                  typography.bodyMedium,
                  {
                    color:
                      selectedLevel === level.label
                        ? colors.text.white
                        : colors.text.primary,
                    flex: 1,
                  },
                ]}
              >
                {level.label}
              </Text>
              <TouchableOpacity onPress={() => openInfo(level.description)}>
                <FontAwesome5
                  name="info-circle"
                  size={24}
                  color={
                    selectedLevel === level.label
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
        onPress={() => navigation.navigate("Register8")}
        disabled={!selectedLevel}
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
              Activity level description
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.text.white, marginBottom: 24 }]}>
              {currentDescription}
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
