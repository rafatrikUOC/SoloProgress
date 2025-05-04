import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeContext } from "../../services/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";

export default function Register2({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [selectedGender, setSelectedGender] = useState(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      paddingHorizontal: 24,
      paddingTop: 64,
      justifyContent: "flex-start",
    },
    backButton: {
      position: "absolute",
      top: 48,
      left: 24,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 14,
      backgroundColor: "rgba(0,0,0,0.4)",
      borderRadius: 20,
      zIndex: 10,
    },
    backText: {
      ...typography.bodySmall,
      color: colors.text.white,
      marginLeft: 6,
    },
    title: {
      ...typography.primaryXl,
      color: colors.text.primary,
      marginBottom: 8,
      textAlign: "center",
      marginTop: 32, // <-- añadido
    },
    subtitle: {
      ...typography.bodyMedium,
      color: colors.text.muted,
      marginBottom: 32,
      textAlign: "center",
    },
    genderContainer: {
      flexDirection: "column",
      justifyContent: "center",
      marginBottom: 40,
    },
    genderButton: {
      alignItems: "center",
    },
    circle: {
      width: 175,
      height: 175,
      borderRadius: 100,
      borderWidth: 3,
      borderColor: colors.text.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    circleSelected: {
      backgroundColor: colors.text.primary,
    },
    genderIcon: {
      color: colors.text.primary,
    },
    genderIconSelected: {
      color: colors.text.white,
    },
    genderLabel: {
      ...typography.bodyLarge,
      color: colors.text.primary,
      marginBottom: 20,
    },
    genderLabelSelected: {
      color: colors.text.primary,
      fontWeight: "bold",
    },
    continueButton: {
      backgroundColor: colors.text.primary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      marginHorizontal: 40,
    },
    continueButtonText: {
      ...typography.buttonLarge,
      color: colors.text.white,
    },
  });

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome5 name="chevron-left" size={16} color={colors.text.white} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>What's your gender?</Text>
      <Text style={styles.subtitle}>To tailor exercises that feel right for you</Text>

      <View style={styles.genderContainer}>
        {/* Male button */}
        <TouchableOpacity
          style={styles.genderButton}
          onPress={() => setSelectedGender("male")}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.circle,
              selectedGender === "male" && styles.circleSelected,
            ]}
          >
            <FontAwesome5
              name="mars"
              size={100}
              style={[
                styles.genderIcon,
                selectedGender === "male" && styles.genderIconSelected,
              ]}
            />
          </View>
          <Text
            style={[
              styles.genderLabel,
              selectedGender === "male" && styles.genderLabelSelected,
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>

        {/* Female button */}
        <TouchableOpacity
          style={styles.genderButton}
          onPress={() => setSelectedGender("female")}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.circle,
              selectedGender === "female" && styles.circleSelected,
            ]}
          >
            <FontAwesome5
              name="venus"
              size={100}
              style={[
                styles.genderIcon,
                selectedGender === "female" && styles.genderIconSelected,
              ]}
            />
          </View>
          <Text
            style={[
              styles.genderLabel,
              selectedGender === "female" && styles.genderLabelSelected,
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        activeOpacity={selectedGender ? 0.8 : 1}
        disabled={!selectedGender}
        onPress={() => {
          navigation.navigate("Register3");
        }}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
