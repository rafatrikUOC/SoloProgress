import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ScreenTitle } from "../../../global/components/UIElements";
import { FontAwesome5 } from "@expo/vector-icons";
import { supabase } from "../../../global/services/supabaseService";
import { UserContext } from "../../../global/contexts/UserContext";

const ACTIVITY_LEVELS = [
  {
    label: "No experience",
    description:
      "You have never exercised or are completely new to fitness. The focus will be on introducing basic movements, building confidence, and establishing a foundation for regular physical activity.",
  },
  {
    label: "Beginner",
    description:
      "You have minimal experience with exercise or have not trained consistently. The goal is to develop foundational strength, improve mobility, and learn proper exercise technique.",
  },
  {
    label: "Intermediate",
    description:
      "You have been exercising regularly and are comfortable with common exercises and equipment. You are ready to increase intensity, diversify your workouts, and pursue specific fitness goals.",
  },
  {
    label: "Advanced",
    description:
      "You have significant training experience and can handle high-intensity, complex workouts. Your focus is on optimizing performance, mastering advanced techniques, and pushing your physical limits.",
  },
];

export default function FitnessExperienceScreen({ navigation }) {
  const { colors, typography } = useThemeContext();
  const { user, refreshUser, setUser } = useContext(UserContext);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDescription, setModalDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Carga inicial del nivel seleccionado desde user.settings.performance_data
  useEffect(() => {
    const perf = user?.settings?.performance_data;
    if (perf) {
      try {
        const data = typeof perf === "string" ? JSON.parse(perf) : perf;
        if (data.activity_level) setSelectedLevel(data.activity_level);
      } catch {}
    }
  }, [user?.settings?.performance_data]);

  // Actualización optimista del nivel de actividad
  const handleSelect = async (level) => {
    const userId = user?.id || user?.info?.id;
    if (!userId) return;

    const prevSettings = user?.settings ? { ...user.settings } : {};
    const prevPerfData = prevSettings.performance_data
      ? typeof prevSettings.performance_data === "string"
        ? JSON.parse(prevSettings.performance_data)
        : prevSettings.performance_data
      : {};

    // Actualizar estado local y contexto para reflejar cambio inmediato
    setSelectedLevel(level.label);
    setUser((prevUser) => ({
      ...prevUser,
      settings: {
        ...prevUser.settings,
        performance_data: {
          ...prevPerfData,
          activity_level: level.label,
        },
      },
    }));

    setLoading(true);
    try {
      await supabase
        .from("UserSettings")
        .update({
          performance_data: {
            ...prevPerfData,
            activity_level: level.label,
          },
        })
        .eq("user_id", userId);
      refreshUser();
    } catch (error) {
      // Revertir cambios si falla la actualización remota
      setSelectedLevel(prevPerfData.activity_level || null);
      setUser((prevUser) => ({
        ...prevUser,
        settings: prevSettings,
      }));
      console.error("Error updating activity level:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (description) => {
    setModalDescription(description);
    setModalVisible(true);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      padding: 24,
    },
    optionsContainer: {
      marginTop: 36,
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

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenTitle title="Fitness experience" />
        <View style={styles.optionsContainer}>
          {ACTIVITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.label}
              onPress={() => handleSelect(level)}
              style={[
                styles.option,
                selectedLevel === level.label && styles.optionSelected,
              ]}
              activeOpacity={0.9}
              disabled={loading}
            >
              <View style={styles.optionRow}>
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
                <TouchableOpacity
                  onPress={() => openModal(level.description)}
                  disabled={loading}
                  style={{ padding: 4 }}
                >
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
      </ScrollView>

      {/* Modal de descripción */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text
              style={[typography.bodyLarge, { marginBottom: 12, color: colors.text.primary }]}
            >
              Activity level description
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.text.white, marginBottom: 24 }]}>
              {modalDescription}
            </Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={[typography.bodyMedium, { color: colors.text.white }]}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
